﻿﻿# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2004 Telefónica Investigación y Desarrollo 
#     S.A.Unipersonal (Telefónica I+D) 
# 
# Info about members and contributors of the MORFEO project 
# is available at: 
# 
#   http://morfeo-project.org/
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version. 
# 
# This program is distributed in the hope that it will be useful, 
# but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details. 
# 
# You should have received a copy of the GNU General Public License 
# along with this program; if not, write to the Free Software 
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
# 
# If you want to use this software an plan to distribute a 
# proprietary application in any way, and you are not licensing and 
# distributing your source code under GPL, you probably need to 
# purchase a commercial license of the product.  More info about 
# licensing options is available at: 
# 
#   http://morfeo-project.org/
#

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.utils import simplejson
from django.utils.translation import ugettext as _ 
 
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
            return HttpResponseBadRequest (_(u'JSON parameter expected'))
        
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
                        uri_out = "/user/%s/igadgets/%s/out/%s" % (user_name, igadget_object.code, var['name'])
                        out_object = Out(uri=uri_out, name=var['name'], variable=var_object)
                        out_object.save()
            
            # Delete channels
            InOut.objects.filter(user=user).delete()

            # Saves all channels
            for inout in json['inOutList']:
                inout_object = None
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
            return HttpResponse ('ok')
        except Screen.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest(_('refered screen %(screen_id)s doesn\'t exists.') % {'screen_id': screen_id})
        except IGadget.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest(_('refered igadget doesn\'t exists.'))
        except Variable.DoesNotExist:
            transaction.rollback()
            return HttpResponseBadRequest(_('refered variable doesn\'t exists.'))
        except Exception, e:
            transaction.rollback()
            return HttpResponseBadRequest(_('connectables cannot be save: %(exc)s') % {'exc': e})

        return HttpResponse('ok')

