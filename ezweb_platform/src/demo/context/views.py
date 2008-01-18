# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2004 Telef�nica Investigaci�n y Desarrollo 
#     S.A.Unipersonal (Telef�nica I+D) 
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

from django.db import IntegrityError

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson
from django.db import transaction

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.utils import *

from commons.get_data import get_concept_data
from context.models import *



class ContextCollection(Resource):
    def read(self, request, user_name):
        user = user_authentication(user_name)
        concepts = Concept.objects.all()
        data = serializers.serialize('python', concepts, ensure_ascii=False)
        data_list = {} 
        data_list ['concepts'] = [get_concept_data(d) for d in  data]
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    @transaction.commit_on_success
    def create(self, request, user_name):
        user = user_authentication(user_name)
        
        if request.POST.has_key('json'):
            received_json = request.POST['json']
        else:
            return HttpResponseBadRequest("<error>JSON parameter not specified</error>")

        try:
            received_data = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)

        for received_concept in received_data['concepts']:
            concept = None
            try:
                 concept = Concept.objects.get(concept=received_concept['concept'])
                 if not concept.adaptor == received_concept['adaptor']:
                     return HttpResponseBadRequest("<error>Attempted update. You must use PUT HTTP method in this case</error>")
            
            except Concept.DoesNotExist:
                 concept = Concept (concept=received_concept['concept'], adaptor=received_concept['adaptor'])
                 concept.save()
            
            try:
                #Checks if concept name exits in database
                ConceptName.objects.get (name=received_concept['name'], concept=concept)

            except ConceptName.DoesNotExist:
                cname = ConceptName (name=received_concept['name'], concept=concept)
                cname.save()
        
        return HttpResponse('ok') 



class ContextEntry(Resource):
    def read(self, request, user_name, concept_name):
        user = user_authentication(user_name)
        concepts = get_list_or_404(Concept, concept=concept_name)
        data = serializers.serialize('python', concepts, ensure_ascii=False)
        data_list = get_concept_data(data[0])
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')
    
    @transaction.commit_on_success
    def create(self, request, user_name, concept_name):
        user = user_authentication(user_name)
        
        if request.POST.has_key('json'):
            received_json = request.POST['json']
        else:
            return HttpResponseBadRequest("<error>JSON parameter not specified</error>")

        try:
            received_concept = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)

        concept = None
        try:
            concept = Concept.objects.get(concept=concept_name)
            if not concept.adaptor == received_concept['adaptor']:
                return HttpResponseBadRequest("<error>Attempted update. You must use PUT HTTP method in this case</error>")
                 
        except Concept.DoesNotExist:
            concept = Concept (concept=concept_name, adaptor=received_concept['adaptor'])
            concept.save()
            
        cname = ConceptName (name=received_concept['name'], concept=concept)
        cname.save()
        
        return HttpResponse('ok') 
                
    @transaction.commit_on_success
    def update(self, request, user_name, concept_name):
        user = user_authentication(user_name)
        
        if request.POST.has_key('json'):
            received_json = request.POST['json']
        else:
            return HttpResponseBadRequest("<error>JSON parameter not specified</error>")

        try:
            received_data = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)

        for received_concept in received_data:
            concept = None
            try:
                 concept = Concept.objects.get(concept=concept_name)
                 concept.adaptor = received_concept['adaptor']
                 concept.save()
                 
            except Concept.DoesNotExist:
                 return HttpResponseBadRequest("<error>Concept doesn't exist. You must use POST HTTP method in this case</error>")
            
            cname = ConceptName (name=received_concept['name'], concept=concept)
            cname.save()
        
        return HttpResponse('ok') 

    @transaction.commit_on_success
    def delete(self, request, user_name, concept_name):
        user = user_authentication(user_name)
        concept = get_object_or_404 (Concept, concept=concept_name)
        ConceptName.objects.filter(concept=concept).delete()
        concept.delete()
        return HttpResponse('ok')                



class ContextValueEntry(Resource):
    def read(self, request, user_name, concept_name):
        user = user_authentication(user_name)
        
        data_res = {}
        
        if concept_name == 'username':
            user = user_authentication(user_name)
            data_res ['username'] = user_name  
        else:
            raise Http404;
        
        return HttpResponse(json_encode(data_res), mimetype='application/json; charset=UTF-8')