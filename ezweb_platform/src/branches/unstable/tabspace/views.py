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
import re

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

from commons.authentication import get_user_authentication
from commons.get_data import get_tabspace_data, get_tab_data
from commons.logs import log
from commons.utils import get_xml_error, json_encode

from tabspace.models import *

class TabSpaceCollection(Resource):
    def read(self, request):
        user = get_user_authentication(request)
        
        data_list = {}
        try:
            tabspaces = TabSpace.objects.filter(user=user)
            if tabspaces.count()==0:
                tabspace = TabSpace (name=_("MyTabspace"), active=True, user=user)
                tabspace.save()
                tabspaces = TabSpace.objects.filter(pk=tabspace.id)
        except Exception, e:
            return HttpResponseBadRequest(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')

        data = serializers.serialize('python', tabspaces, ensure_ascii=False)
        data_list['tabspaces'] = [get_tabspace_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')


class TabSpaceEntry(Resource):
    def read(self, request, tabspace_id):
        user = get_user_authentication(request)
        
        tabspace = get_list_or_404(TabSpace, user=user, pk=tabspace_id)
        data = serializers.serialize('python', tabspace, ensure_ascii=False)
        tabspace_data = get_tabspace_data(data[0])
        return HttpResponse(json_encode(tabspace_data), mimetype='application/json; charset=UTF-8')
    
    
    @transaction.commit_on_success
    def create(self, request, tabspace_id):
        user = get_user_authentication(request)

        if not request.has_key('tabspace'):
            return HttpResponseBadRequest(get_xml_error(_("tabspace JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.POST['tabspace']

        try:
            ts = eval(received_json)
            if not ts.has_key('name'):
                raise Exception(_('Malformed tabspace JSON: expecting tabspace uri.'))
            tabspace_name = ts.get('name')
            tabspace = TabSpace (name=tabspace_name, active=False, user=user)
            tabspace.save()
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("tabspace cannot be created: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

    @transaction.commit_on_success
    def update(self, request, tabspace_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('tabspace'):
            return HttpResponseBadRequest(get_xml_error(_("tabspace JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.PUT['tabspace']

        try:
            ts = eval(received_json)
            tabspace = TabSpace.objects.get(user=user, pk=tabspace_id)
            
            if ts.has_key('active'):
                active = ts.get('active')
                if (active == 'true'):
                    #Only one active tabspace
                    activeTabSpaces = TabSpace.objects.filter(user=user, active=True).exclude(pk=tabspace_id)
                    for activeTabSpace in activeTabSpaces:
                        activeTabSpace.active = False
                        activeTabSpace.save()
                    tabspace.active = True
                else:
                    tabspace.active = False
                    
            if ts.has_key('name'):
                tabspace.name = ts.get('name')
                
            tabspace.save()
            
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("tabspace cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    @transaction.commit_on_success
    def delete(self, request, tabspace_id):
        user = get_user_authentication(request)
        
        tabspaces = TabSpace.objects.filter(user=user).exclude(pk=tabspace_id)
        
        if tabspaces.count()==0:
            msg = _("tabspace cannot be deleted")
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

        # Gets Igadget, if it does not exist, a http 404 error is returned
        tabspace = get_object_or_404(TabSpace, user=user, pk=tabspace_id)
        
        tabspace.delete()
        return HttpResponse('ok')
    
    
class TabCollection(Resource):
    def read(self, request, tabspace_id):
        user = get_user_authentication(request)
        
        data_list = {}
        try:
            tabs = Tab.objects.filter(tabspace__user=user, tabspace__pk=tabspace_id)
            if tabs.count()==0:
                tabspace = get_object_or_404(TabSpace, pk=tabspace_id)
                tab = Tab (name=_("MyTab"), visible=True, tabspace=tabspace)
                tab.save()
                tabs = Tab.objects.filter(pk=tab.id)
        except Exception, e:
            return HttpResponseBadRequest(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')

        data = serializers.serialize('python', tabs, ensure_ascii=False)
        data_list['tabs'] = [get_tab_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')
    

class TabEntry(Resource):
    def read(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)
        
        tab = get_list_or_404(Tab, tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id)
        data = serializers.serialize('python', tab, ensure_ascii=False)
        tab_data = get_tab_data(data[0])
        return HttpResponse(json_encode(tab_data), mimetype='application/json; charset=UTF-8')


    @transaction.commit_on_success
    def create(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)

        if not request.has_key('tab'):
            return HttpResponseBadRequest(get_xml_error(_("tab JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.POST['tab']    

        try:
            t = eval(received_json)
            if not t.has_key('name'):
                raise Exception(_('Malformed tab JSON: expecting tab name.'))
            tab_name = t.get('name')
            tabspace = TabSpace.objects.get(user=user, pk=tabspace_id)
            tab = Tab (name=tab_name, visible=False, tabspace=tabspace)
            tab.save()
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("tab cannot be created: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    def update(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('tab'):
            return HttpResponseBadRequest(get_xml_error(_("tab JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.PUT['tab']

        try:
            t = eval(received_json)
            tab = Tab.objects.get(tabspace__user=user, tabspace__pk=tabspace_id, pk=tab_id)
            
            if t.has_key('visible'):
                visible = t.get('visible')
                if (visible == 'true'):
                    #Only one visible tab
                    visibleTabs = Tab.objects.filter(tabspace__user=user, tabspace__pk=tabspace_id, visible=True).exclude(pk=tab_id)
                    for visibleTab in visibleTabs:
                        visibleTab.visible = False
                        visibleTab.save()
                    tab.visible = True
                else:
                    tab.visible = False
            
            if t.has_key('name'):
                tab.name = t.get('name')
      
            tab.save()
            
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("tab cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    def delete(self, request, tabspace_id, tab_id):
        user = get_user_authentication(request)
        
        tabs = Tab.objects.filter(tabspace__pk=tabspace_id).exclude(pk=tab_id)
        
        if tabs.count()==0:
            msg = _("tab cannot be deleted")
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

        # Gets Igadget, if it does not exist, a http 404 error is returned
        tab = get_object_or_404(Tab, tabspace__pk=tabspace_id, pk=tab_id)
        
        tab.delete()
        return HttpResponse('ok')


