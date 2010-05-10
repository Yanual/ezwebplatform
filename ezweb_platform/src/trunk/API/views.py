# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from django.http import HttpResponse, HttpResponseBadRequest
from django.utils.translation import ugettext as _

from commons.resource import Resource
from commons.utils import json_encode

from django.db import transaction

from gadget.views import parseAndCreateGadget
from gadget.models import Gadget
from workspace.models import UserWorkSpace, Tab
from igadget.views import SaveIGadget, deleteIGadget
from igadget.models import IGadget

from commons.custom_decorators import basicauth_or_logged_in

class IGadgetCollection(Resource):

    @basicauth_or_logged_in()
    @transaction.commit_on_success
    def create(self, request):
        if not request.POST.has_key('template_uri'):
            msg = _("Missing template URL parameter")
            json = json_encode({"message":msg, "result":"error"})
            return HttpResponseBadRequest(json, mimetype='application/json; charset=UTF-8')
        
        #
        #Get or Create the Gadget in the Showcase
        #
        user_name = request.user.username
        result = parseAndCreateGadget(request, user_name)
        gadget = result["gadget"]
        
        #
        #Instance the iGadget
        #
        
        #get the active Tab and Workspace
        try:
            wsList = UserWorkSpace.objects.filter(user=request.user, active=True)
            activeWS = wsList[0]
        except:
            wsList = UserWorkSpace.objects.filter(user=request.user)
            activeWS = wsList[0]
            
        try:
            tabList = Tab.objects.filter(workspace=activeWS, visible=True)
            activeTab = tabList[0]
        except:
            tabList = Tab.objects.filter(workspace=activeWS)
            activeTab = tabList[0]
            
        # Get the iGadget name
        igadget_name = gadget.name
        if request.POST.has_key('igadget_name'):
            igadget_name = request.POST['igadget_name']
        
        #instance the Gadget            
        #currentIGadgetsTabURI = "/workspace/" + activeWS.id + "/tab/" + activeTab.id + "/igadgets"
        data = {"left": 0, "top": 0, "icon_left": 0, "icon_top": 0, "zIndex": 0, 
                "width": gadget.width, "height": gadget.height, "name": igadget_name, 
                "menu_color": "FFFFFF", "layout": 0, "gadget": gadget.uri}
        resp = SaveIGadget(data, request.user, activeTab, request)
        
        return HttpResponse(json_encode({"igadget_id":resp["id"], "gadget_id":gadget.id}), mimetype='application/json; charset=UTF-8')

    @basicauth_or_logged_in()
    @transaction.commit_on_success
    def delete(self, request, gadget_id):
        gadget = Gadget.objects.get(id=gadget_id)
        
        #userWorkspaces =  UserWorkSpace.objects.filter(user=request.user)
        #userTabs = Tab.objects.filter(workspace__in=userWorkspaces)
        #igadgets = IGadget.objects.filter(gadget=gadget, tab__in=userTabs)
        igadgets = IGadget.objects.filter(gadget=gadget, tab__workspace__users__id=request.user.id)     
        values = []           
        for ig in igadgets:
            values.append(ig.id)
            deleteIGadget(ig, request.user)
        
        return HttpResponse(json_encode({"result":"ok", "deleted_igadgets":values}), mimetype='application/json; charset=UTF-8')
        

class IGadgetEntry(Resource):
    
    @basicauth_or_logged_in()
    @transaction.commit_on_success
    def delete(self, request, igadget_id):
        ig = IGadget.objects.get(id=igadget_id, tab__workspace__users__id=request.user.id)
        deleteIGadget(ig, request.user)
        return HttpResponse(json_encode({"result":"ok"}), mimetype='application/json; charset=UTF-8')
    