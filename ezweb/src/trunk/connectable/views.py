# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.utils import simplejson 
 
from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from django.db import transaction

from commons.authentication import user_authentication
from commons.get_data import get_inout_data, get_igadget_data, get_wiring_data
from commons.utils import json_encode

from gadget.models import VariableDef
from igadget.models import IGadget, Screen, Variable
from connectable.models import In, Out, InOut

class ConnectableEntry(Resource):
    def read(self, request, user_name, screen_id=1):
        user = user_authentication(user_name)
        wiring = {}
        
        # IGadgets list
        if not screen_id:
            screen_id=1

        try:
            screen = Screen.objects.get(user=user, code=screen_id)

            igadgets = IGadget.objects.filter(screen=screen)
            
            igadget_data_list = get_wiring_data(igadgets)
            
            wiring['iGadgetList'] = igadget_data_list
        except Screen.DoesNotExist:
            wiring['iGadgetList'] = []
        
        # InOut list
        inouts = InOut.objects.filter(user=user)
        inout_data = serializers.serialize('python', inouts, ensure_ascii=False)
        inout_data_list = [get_inout_data(d) for d in inout_data]
        wiring['inOutList'] = inout_data_list
        
        return HttpResponse(json_encode(wiring), mimetype='application/json; charset=UTF-8')
    
    @transaction.commit_manually
    def create(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)

        # Gets all needed parameters from request
        if request.POST.has_key('json'):
            json = simplejson.loads(request.POST['json'])
        else:
            return HttpResponseBadRequest ('json parameter expected')
        
        #TODO Remove this. Sets user screen by default 
        if not screen_id:
            screen_id = 1

        try:
            #Gets current user screen
            screen = Screen.objects.get(user=user, code=screen_id)
            
            igadgets = json['iGadgetList']
            for igadget in igadgets:
                igadget_object = IGadget.objects.get(screen=screen, code=igadget['id'])

                # Save all IGadget connections (in and out variables)
                for var in igadget['list']:
                    var_object = Variable.objects.get(uri=var['uri'], vardef__name=var['name'], igadget=igadget_object)
                    # Remove existed connections
                    Out.objects.filter(variable=var_object).delete()
                    In.objects.filter(variable=var_object).delete()
                    # Saves IN connection
                    if var['aspect'] == 'EVEN':
                        uri_in = "/user/%s/igadgets/%s/in/%s" % (user_name, igadget_object.code, var['name'])
                        in_object = In(uri=uri_in, name=var['name'], variable=var_object)
                        in_object.save()

                    # Saves OUT connection
                    if var['aspect'] == 'SLOT':
                        print 'SLOT %s' % var['name']
                        uri_out = "/user/%s/igadgets/%s/out/%s" % (user_name, igadget_object.code, var['name'])
                        out_object = Out(uri=uri_out, name=var['name'], variable=var_object)
                        out_object.save()
            
            # Saves all channels
            print 'channels %s' % json['inOutList']
            for inout in json['inOutList']:
                inout_object = None
                try:
                    # If inout (channel) doesn`t exist, it will be created
                    inout_object = InOut.objects.get(user=user, name=inout['name'])
                except InOut.DoesNotExist:
                    inout_object = InOut(user=user, uri=inout['uri'], name=inout['name'], friend_code=inout['friend_code'], value=inout['value'])
                    inout_object.save()
                
                # Saves all channel inputs
                for ins in inout['ins']:            
                    igadget_object = IGadget.objects.get(screen=screen, code=ins['igadget'])
                    var_object = Variable.objects.get(vardef__name=ins['name'], igadget=igadget_object)
                    connected_in = In.objects.get(variable=var_object)
                    connected_in.inout.add(inout_object)
                    
                # Saves all channel outputs
                for out in inout['outs']:            
                    igadget_object = IGadget.objects.get(screen=screen, code=out['igadget'])
                    var_object = Variable.objects.get(vardef__name=out['name'], igadget=igadget_object)
                    connected_out = Out.objects.get(variable=var_object)
                    connected_out.inout.add(inout_object)
                                          
            transaction.commit()
        except Screen.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest('refered screen (' + screen_id + ') doesn\'t exists.')
        except IGadget.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest('refered igadget (' + gadget_uri + ') doesn\'t exists.')
        except Variable.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest('refered variable (' + gadget_uri + ') doesn\'t exists.')
        except Exception, e:
            transaction.rollback()
            return HttpResponseBadRequest('connectables cannot be save: %s' % e)

        return HttpResponse('ok')

class InOutCollection(Resource):
    def delete(self, request, user_name):
        user = user_authentication(user_name)

        # Gets all needed parameters from request
        if request.DELETE.has_key('channels'):
            print "founded"
            json = simplejson.loads(request.DELETE['channels'])
        else:
            return HttpResponseBadRequest ('json parameter expected')        

        return HttpResponse('<ok />')

class InOutEntry(Resource):
    def delete(self, request, user_name, name):
        user = user_authentication(user_name)

        InOut.objects.get_object_or_404(user=user, name=name).delete()

        return HttpResponse('<ok />')
