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

from commons.resource import Resource
from commons.utils import json_encode

from django.http import HttpResponse, HttpResponseServerError
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404

from resourceSubscription.models import Contract
from catalogue.models import GadgetResource

class ContractCollection(Resource):
    @login_required
    def read(request):
        user = request.user
        
        result = []
        
        contracts = Contract.objects.filter(user=user)
        
        for contract in contracts:
            result.append(contract.get_info())
            
        json = json_encode(result)
        
        return HttpResponse(json, mimetype='application/json; charset=UTF-8')

    read = staticmethod(read)

    @login_required
    def create(self, request, resource_id):
        user = request.user
        
        contract_info = request.REQUEST['contract_info']
        
        resource = get_object_or_404(GadgetResource, id=resource_id)
        
        contract, created = get_or_create(Contract, user=user, gadget_resource=resource)
        
        if created:
            contract.update_info(contract_info)
        
        json = json_encode(contract.get_info())
        
        return HttpResponse(json, mimetype='application/json; charset=UTF-8')

    create = staticmethod(create)
    
class ContractEntry(Resource):
    @login_required
    def read(request, contract_id):
        contract = get_object_or_404(Contract, id=contract_id)
        
        json = json_encode(contract.get_info())
        
        return HttpResponse(json, mimetype='application/json; charset=UTF-8')
    
    read = staticmethod(read)

    @login_required
    def update(request, contract_id):
        contract_info = request.REQUEST['contract_info']
        
        contract = Contract.objects.get(id=contract_id)
        
        result = contract.update_info(contract_info)
        
        if (result):
            return HttpResponse("{'result': 'ok'}", mimetype='application/json; charset=UTF-8')
        else:
            return HttpResponseServerError("{'result': 'error'}", mimetype='application/json; charset=UTF-8')
        
    update = staticmethod(update)

    @login_required
    def delete(request, contract_id):
        contract = get_object_or_404(Contract, id=contract_id)
        
        contract.delete()
        contract.save()
        
        return HttpResponse("{'result': 'ok'}", mimetype='application/json; charset=UTF-8')
    
    delete = staticmethod(delete)
    
class ResourceSubscriber(Resource):
    @login_required
    def read(self, request, resource_id):
        user = request.user
        
        resource = get_object_or_404(GadgetResource, id=resource_id)
    
        try:
            contract = Contract.objects.get(user=user, gadget_resource=resource)
            
            return ContractEntry.update(request, contract.id)
        except Contract.DoesNotExist:
            return ContractCollection.create(request, user, resource_id)
        
    @login_required
    def create(self, request, resource_id):
        user = request.user
        
        resource = get_object_or_404(GadgetResource, id=resource_id)
    
        try:
            contract = Contract.objects.get(user=user, gadget_resource=resource)
            
            return ContractEntry.update(request, contract.id)
        except Contract.DoesNotExist:
            return ContractCollection.create(request, user, resource_id)
        
class ResourceUnsubscriber(Resource):
    @login_required
    def read(self, request, resource_id):
        return ContractEntry.delete(request, contract.id)
