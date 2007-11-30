# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson 
 
from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_inout_data, get_igadget_data, get_wiring_data
from commons.utils import json_encode

from gadget.models import VariableDef
from igadget.models import IGadget, Screen, Variable
from connectable.models import InOut

class ConnectableEntry(Resource):
    def read(self, request, user_name, screen_id=1):
        user = user_authentication(user_name)
        wiring = {}
        
        # IGadgets list
        if not screen_id:
            screen_id=1
            #screens = get_list_or_404(Screen, user=user)
            #for screen in screens:
                #igadgets = get_list_or_404(IGadget, screen=screen.id)
                #igadget_data = serializers.serialize('python', igadgets, ensure_ascii=False)
                #igadget_data_list = [get_igadget_data(d) for d in igadget_data]
        #else:
        try:
            screen = Screen.objects.get(user=user, id=screen_id)

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
    
    def create(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)

        if request.POST.has_key('json'):
            print request.POST['json']
            json = simplejson.loads(request.POST['json'])
        else:
            raise Http404
        if not screen_id:
            screen_id = 1

        screen = get_object_or_404(Screen, user=user, id=screen_id)

        InOut.objects.filter(user=user).delete()
        #Out.objects.filter(variable.igadget.gadget.user=user).delete()
        #In.objects.filter(user=user).delete() 
        
        igadgets = json['igadgets']
        for ig in igadgets:
            igadget = get_object_or_404(IGadget, screen=screen, uri=ig['uri'])
            for ins in ig['ins']:
                variable = get_object_or_404(Variable, uri=ins['variable'], igadget=igadget)
                uri_in = "/user/%s/igadget/%s/variable/%s/in/%s" % (user_name, igadget.id, variable.id, ins['name'])
                in_object = In(uri=uri_in, name=ins['name'], variable=variable)
            for inout in ins['inouts']:
                inout = get_object_or_404(InOut, uri=inout)
                in_object.inout.add(inout)
                in_object.save()
            for outs in ig['outs']:            
                variable = get_object_or_404(Variable, uri=outs['variable'], igadget=igadget)
                uri_out = "/user/%s/igadget/%s/variable/%s/out/%s" % (user_name, igadget.id, variable.id, outs['name'])
                out_object = In(uri=uri_in, name=out['name'], variable=variable)
            for inout in outs['inouts']:
                inout = get_object_or_404(InOut, uri=inout)
                out_object.inout.add(inout)
                out_object.save()
                
        inouts = json['inouts']
        for io in inouts:

            inout = InOut(user=user, uri=io['uri'], name=io['name'], friend_code=io['friend_code'], value=io['value'])
            inout.save()
            for ins in io['ins']:
                variable = get_object_or_404(Variable, uri=ins['variable'], igadget=igadget)
                uri_in = "/user/%s/igadget/%s/variable/%s/in/%s" % (user_name, igadget.id, variable.id, ins['name'])
                in_object = In(uri=uri_in, name=ins['name'], variable=variable)
                in_object.inout.add(inout)
                in_object.save()
            for outs in io['outs']:
                variable = get_object_or_404(Variable, uri=outs['variable'], igadget=igadget)
                uri_out = "/user/%s/igadget/%s/variable/%s/out/%s" % (user_name, igadget.id, variable.id, outs['name'])
                out_object = In(uri=uri_in, name=out['name'], variable=variable)
                out_object.inout.add(inout)
                out_object.save()  
        
            
        print "fin for"

        return HttpResponse('')

