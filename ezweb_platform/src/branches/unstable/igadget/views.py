# -*- coding: utf-8 -*-

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
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.core import serializers
from django.utils import simplejson

from django.utils.translation import ugettext as _
from django.utils.translation import string_concat

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from django.db import transaction

from commons.authentication import user_authentication
from commons.get_data import get_igadget_data, get_variable_data
from commons.logs import log
from commons.utils import get_xml_error, json_encode

from gadget.models import Gadget, VariableDef
from tabspace.models import Tab
from igadget.models import *

def SaveIGadget(igadget, user, tab):
    
    gadget_uri = igadget.get('gadget')
    igadget_code = igadget.get('code')
    width = igadget.get('width')
    height = igadget.get('height')
    top = igadget.get('top')
    left = igadget.get('left')
        
    # Creates IGadget position
    position = Position (posX=left, posY=top, height=height, width=width, minimized=False)
    position.save()

    try:
        # Creates the new IGadget
        gadget = Gadget.objects.get(uri=gadget_uri, user=user)

        new_igadget = IGadget(code=igadget_code ,uri=uri, gadget=gadget, tab=tab, position=position)
        new_igadget.save()

        # Creates all IGadgte's variables
        variableDefs = VariableDef.objects.filter(template=gadget.template)
        for varDef in variableDefs:
            # Sets the default value of variable
            if varDef.default_value:
                var_value = varDef.default_value
            else:
                var_value = ''
                
            var = Variable (vardef=varDef, igadget=new_igadget, value=var_value)
            var.save() 

    except Gadget.DoesNotExist:
        raise Gadget.DoesNotExist(_('referred gadget %(gadget_uri)s does not exist.') % {'gadget_uri': gadget_uri})
    except VariableDef.DoesNotExist:
        #iGadget has no variables. It's normal
        pass

def UpdateIGadget(igadget, user, tab):
    
    # Checks
    igadget = get_object_or_404(IGadget, tab=tab, pk=igadget_pk)  
    
    igadget_pk = igadget.get('pk')
    
    # get IGadget's position
    position = Position.objects.get(pk=igadget.position)

    # update the requested attributes
    if igadget.has_key('width'):
        width = igadget.get('width')
        if width <= 0:
            raise Exception(_('Malformed iGadget JSON'))
        position.width = width

    if igadget.has_key('height'):
        height = igadget.get('height')
        if height <= 0:
            raise Exception(_('Malformed iGadget JSON'))
        position.height = height

    if igadget.has_key('top'):
        top = igadget.get('top')
        if top < 0:
            raise Exception(_('Malformed iGadget JSON'))
        position.posY = top
    
    if igadget.has_key('left'):
        left = igadget.get('left')
        if left < 0:
            raise Exception(_('Malformed iGadget JSON'))
        position.posX = left

    if igadget.has_key('minimized'):
        minimized = igadget.get('minimized')
        if (minimized == 'true'):
            position.minimized = True
        else:
            position.minimized = False

    # save the changes
    position.save()  

class IGadgetCollection(Resource):
    def read(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)
        
        data_list = {}
        igadget = IGadget.objects.filter(tab__tabspace__user=user, tab__tabspace__pk=tabspace_id, tab__pk=tab_id)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        data_list['iGadgets'] = [get_igadget_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    @transaction.commit_manually
    def create(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)
        
        if not request.has_key('igadgets'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget JSON expected")), mimetype='application/xml; charset=UTF-8')
        
        #TODO we can make this with deserializers (simplejson)      
        received_json = request.POST['igadgets']
	    
        try:
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
            received_data = eval(received_json)
            igadgets = received_data.get('iGadgets')
            for igadget in igadgets:
                SaveIGadget(igadget, user, tab)
            transaction.commit()
            return HttpResponse('ok')
        except Tab.DoesNotExist:
            msg = _('refered tab %(tab_id)s does not exist.')
            log(msg, request)
            return HttpResponseBadRequest(get_xml_error(msg))
        except Exception, e:
            transaction.rollback()
            msg = _("iGadgets cannot be created: ") + unicode(e)
            log (msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    @transaction.commit_manually
    def update(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('igadgets'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)      
        received_json = request.PUT['igadgets']
        
        try:
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
            received_data = eval(received_json)
            igadgets = received_data.get('iGadgets')
            for igadget in igadgets:
                UpdateIGadget(igadget, user, tab)
            transaction.commit()
            return HttpResponse('ok')
        except Tab.DoesNotExist:
            msg = _('refered tab %(tab_id)s does not exist.')
            log(msg, request)
            return HttpResponseBadRequest(get_xml_error(msg))
        except Exception, e:
            transaction.rollback()
            msg = _("iGadgets cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

class IGadgetEntry(Resource):
    def read(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)
        
        igadget = get_list_or_404(IGadget, tab__tabspace__user=user, tab__tabspace__pk=tabspace_id, tab__pk=tab_id, pk=igadget_id)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        igadget_data = get_igadget_data(data[0])
        return HttpResponse(json_encode(igadget_data), mimetype='application/json; charset=UTF-8')
    
    @transaction.commit_on_success
    def create(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)

        if not request.has_key('igadget'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget JSON expected")), mimetype='application/xml; charset=UTF-8')

        try:
            received_json = request.POST['igadget']
            igadget = eval(received_json)
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
            SaveIGadget(igadget, user, tab)
            return HttpResponse('ok')
        except TabSpace.DoesNotExist:
            msg = _('refered tabspace %(tabspace_id)s does not exist.')
            log(msg, request)
            return HttpResponseBadRequest(get_xml_error(msg))
        except Exception, e:
            transaction.rollback()
            msg = _("iGadget cannot be created: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    @transaction.commit_on_success
    def update(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('igadget'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget JSON expected")), mimetype='application/xml; charset=UTF-8')

        try:
            received_json = request.PUT['igadget']
            igadget = eval(received_json)
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
            UpdateIGadget(igadget, user, tab)
            return HttpResponse('ok')
        except Tab.DoesNotExist:
            msg = _('refered tab %(tab_id)s does not exist.')
            log(msg, request)
            return HttpResponseBadRequest(get_xml_error(msg))
        except Exception, e:
            transaction.rollback()
            msg = _("iGadget cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    @transaction.commit_on_success
    def delete(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)
        
        # Gets Igadget, if it does not exist, a http 404 error is returned
        igadget = get_object_or_404(IGadget, tab__tabspace__user=user, tab__tabspace__pk=tabspace_id, tab__pk=tab_id, pk=igadget_id)
        
        # Delete all IGadget's variables
        variables = Variable.objects.filter(igadget=igadget)
        for var in variables:
            var.delete()
        
        # Delete IGadget and its position
        position = igadget.position
        position.delete()
        igadget.delete()
        return HttpResponse('ok')
        

class IGadgetVariableCollection(Resource):
    def read(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)
        
        tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
        variables = Variable.objects.filter(igadget__tab=tab, igadget__id=igadget_id)
        data = serializers.serialize('python', variables, ensure_ascii=False)
        vars_data = [get_variable_data(d) for d in data]
        return HttpResponse(json_encode(vars_data), mimetype='application/json; charset=UTF-8')

    @transaction.commit_manually
    def update(self, request, tabspace_id, tab_id, igadget_id):
        user = get_user_authentication(request)

        # Gets JSON parameter from request
        if not request.PUT.has_key('variables'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget variables JSON expected")), mimetype='application/xml; charset=UTF-8')

        variables_JSON = request.PUT['variables']
        
        try:
            received_variables = eval(variables_JSON)
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
            server_variables = Variable.objects.filter(igadget__tab=tab)
            
            # Gadget variables collection update
            for varServer in server_variables:
                for varJSON in received_variables:
                    if (varServer.vardef.pk == varJSON['pk'] and varServer.igadget.pk == varJSON['iGadget']):
                        varServer.value = varJSON['value']
                        varServer.save()
            
            transaction.commit()
        except Tab.DoesNotExist:
            msg = _('refered tab %(tab_id)s does not exist.')
            log(msg, request)
            return HttpResponseBadRequest(get_xml_error(msg))
        except Exception, e:
            transaction.rollback()
            log(e, request)
            return HttpResponseServerError(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')
        
        return HttpResponse("<ok>", mimetype='text/xml; charset=UTF-8')

class IGadgetVariable(Resource):
    def read(self, request, tabspace_id, tab_id, igadget_id, var_id):
        user = get_user_authentication(request)
        
        tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
        variable = get_list_or_404(Variable, igadget__tab=tab, igadget__pk=igadget_id, vardef__pk=var_id)
        data = serializers.serialize('python', variable, ensure_ascii=False)
        var_data = get_variable_data(data[0])
        return HttpResponse(json_encode(var_data), mimetype='application/json; charset=UTF-8')
    
    def create(self, request, tabspace_id, tab_id, igadget_id, var_id):
        return self.update(request, tabspace_id, tab_id, igadget_id, var_id)
    
    def update(self, request, tabspace_id, tab_id, igadget_id, var_id):
        user = get_user_authentication(request)
        
        # Gets value parameter from request
        if not request.PUT.has_key('value'):
            return HttpResponseBadRequest(get_xml_error(_("iGadget JSON expected")), mimetype='application/xml; charset=UTF-8')
        
        new_value = request.PUT['value']
        
        tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id) 
        variable = get_object_or_404(Variable, igadget__tab=tab, igadget__pk=igadget_id, vardef__pk=var_id)
        try:
            variable.value = new_value
            variable.save()
        except Exception, e:
            transaction.rollback()
            log(e, request)
            return HttpResponseServerError(get_xml_error(e), mimetype='application/xml; charset=UTF-8')

        return HttpResponse('ok')
