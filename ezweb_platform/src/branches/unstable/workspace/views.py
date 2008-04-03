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
from commons.get_data import get_workspace_data, get_tab_data, get_global_workspace_data
from commons.logs import log
from commons.utils import get_xml_error, json_encode

from workspace.models import *

class WorkSpaceCollection(Resource):
    def read(self, request):
        user = get_user_authentication(request)
        
        data_list = {}
        try:
            workspaces = WorkSpace.objects.filter(user=user)
            if workspaces.count()==0:
                #Workspace creation
                workspace = WorkSpace (name=_("MyWorkspace"), active=True, user=user)
                workspace.save()
                
                #Tab creation
                tab = Tab (name=_("MyTab"), visible=True, workspace=workspace)
                tab.save()
                
                workspaces = WorkSpace.objects.filter(user=user)
        except Exception, e:
            return HttpResponseBadRequest(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')
            
        data = serializers.serialize('python', workspaces, ensure_ascii=False)
        data_list['workspaces'] = [get_workspace_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')
    
    @transaction.commit_on_success
    def create(self, request):
        user = get_user_authentication(request)

        if not request.has_key('workspace'):
            return HttpResponseBadRequest(get_xml_error(_("workspace JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.POST['workspace']

        try:
            ts = eval(received_json)
            if not ts.has_key('name'):
                raise Exception(_('Malformed workspace JSON: expecting workspace uri.'))
            workspace_name = ts.get('name')
            workspace = WorkSpace (name=workspace_name, active=False, user=user)
            workspace.save()
            return HttpResponse(str(workspace.pk))
        except Exception, e:
            transaction.rollback()
            msg = _("workspace cannot be created: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


class WorkSpaceEntry(Resource):
    def read(self, request, workspace_id):
        user = get_user_authentication(request)
        
        workspaces = get_list_or_404(WorkSpace, user=user, pk=workspace_id)
        data = serializers.serialize('python', workspaces, ensure_ascii=False)
        workspace_data = get_global_workspace_data(data[0], workspaces[0])
        return HttpResponse(json_encode(workspace_data), mimetype='application/json; charset=UTF-8')

    @transaction.commit_on_success
    def update(self, request, workspace_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('workspace'):
            return HttpResponseBadRequest(get_xml_error(_("workspace JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.PUT['workspace']

        try:
            ts = eval(received_json)
            workspace = WorkSpace.objects.get(user=user, pk=workspace_id)
            
            if ts.has_key('active'):
                active = ts.get('active')
                if (active == 'true'):
                    #Only one active workspace
                    activeWorkSpaces = WorkSpace.objects.filter(user=user, active=True).exclude(pk=workspace_id)
                    for activeWorkSpace in activeWorkSpaces:
                        activeWorkSpace.active = False
                        activeWorkSpace.save()
                    workspace.active = True
                else:
                    workspace.active = False
                    
            if ts.has_key('name'):
                workspace.name = ts.get('name')
                
            workspace.save()
            
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("workspace cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')


    @transaction.commit_on_success
    def delete(self, request, workspace_id):
        user = get_user_authentication(request)
        
        workspaces = WorkSpace.objects.filter(user=user).exclude(pk=workspace_id)
        
        if workspaces.count()==0:
            msg = _("workspace cannot be deleted")
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

        # Gets Igadget, if it does not exist, a http 404 error is returned
        workspace = get_object_or_404(WorkSpace, user=user, pk=workspace_id)
        
        workspace.delete()
        return HttpResponse('ok')
    
    
class TabCollection(Resource):
    def read(self, request, workspace_id):
        user = get_user_authentication(request)
        
        data_list = {}
        try:
            tabs = Tab.objects.filter(workspace__user=user, workspace__pk=workspace_id)
            if tabs.count()==0:
                workspace = get_object_or_404(WorkSpace, pk=workspace_id)
                tab = Tab (name=_("MyTab"), visible=True, workspace=workspace)
                tab.save()
                tabs = Tab.objects.filter(pk=tab.id)
        except Exception, e:
            return HttpResponseBadRequest(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')

        data = serializers.serialize('python', tabs, ensure_ascii=False)
        data_list['tabs'] = [get_tab_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')
    
    @transaction.commit_on_success
    def create(self, request, workspace_id):
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
            workspace = WorkSpace.objects.get(user=user, pk=workspace_id)
            tab = Tab (name=tab_name, visible=False, workspace=workspace)
            tab.save()
            return HttpResponse(str(tab.pk))
        except Exception, e:
            transaction.rollback()
            msg = _("tab cannot be created: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

    

class TabEntry(Resource):
    def read(self, request, workspace_id, tab_id):
        user = get_user_authentication(request)
        
        tab = get_list_or_404(Tab, workspace__user=user, workspace__pk=workspace_id, pk=tab_id)
        data = serializers.serialize('python', tab, ensure_ascii=False)
        tab_data = get_tab_data(data[0])
        return HttpResponse(json_encode(tab_data), mimetype='application/json; charset=UTF-8')

    def update(self, request, workspace_id, tab_id):
        user = get_user_authentication(request)

        if not request.PUT.has_key('tab'):
            return HttpResponseBadRequest(get_xml_error(_("tab JSON expected")), mimetype='application/xml; charset=UTF-8')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.PUT['tab']

        try:
            t = eval(received_json)
            tab = Tab.objects.get(workspace__user=user, workspace__pk=workspace_id, pk=tab_id)
            
            if t.has_key('visible'):
                visible = t.get('visible')
                if (visible == 'true'):
                    #Only one visible tab
                    visibleTabs = Tab.objects.filter(workspace__user=user, workspace__pk=workspace_id, visible=True).exclude(pk=tab_id)
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


    def delete(self, request, workspace_id, tab_id):
        user = get_user_authentication(request)
        
        tabs = Tab.objects.filter(workspace__pk=workspace_id).exclude(pk=tab_id)
        
        if tabs.count()==0:
            msg = _("tab cannot be deleted")
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

        # Gets Igadget, if it does not exist, a http 404 error is returned
        tab = get_object_or_404(Tab, workspace__pk=workspace_id, pk=tab_id)
        
        tab.delete()
        return HttpResponse('ok')


