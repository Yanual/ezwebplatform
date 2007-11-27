# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.utils import simplejson

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_igadget_data
from commons.utils import json_encode

from igadget.models import IGadget, Screen, Position
from gadget.models import Gadget

def SaveIGadget(igadget, user, screen_id):
            uri = igadget.get('uri')
#            id = uri.partition("/igadgets/")[2]
            gadget_uri = igadget.get('gadget')#TODO add gadget id in JSON
            width = igadget.get('width')
            height = igadget.get('height')
            top = igadget.get('top')
            left = igadget.get('left')
            if not gadget_uri or not width or not height or not top or not left:
                return HttpResponseBadRequest('<error>Malformed iGadget JSON</error>')   
            
            position = Position (uri=uri + '/position', posX=left, posY=top, height=height, width=width)
            position.save()

            try:
                screen = Screen.objects.get(id=screen_id)
            except Screen.DoesNotExist: 
                screen_uri = "/user/" + user.username + '/screen/' + str(screen_id)
                #TODO screen name is not given by JSON and it is not null in database, where can we get it?
                screen = Screen (id=screen_id, uri=screen_uri, name='myScreen', user=user) 
                screen.save()
            
            try:
                gadget = Gadget.objects.get(uri=gadget_uri)
            except Gadget.DoesNotExist:
                return HttpResponseBadRequest('<error>iGadget without associated gadget</error>')
            
            new_igadget = IGadget (uri=uri, gadget=gadget, screen=screen, position=position)
            new_igadget.save()

class IGadgetCollection(Resource):
    def read(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)
        
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        data_list = {}
        if not screen_id:
            screens = Screen.objects.filter(user=user)
            for screen in screens:
                igadget = IGadget.objects.filter(screen=screen.id)
                data = serializers.serialize('python', igadget, ensure_ascii=False)
                data_list = [get_igadget_data(d) for d in  data]
        else:
            igadget = IGadget.objects.filter(screen=screen_id)
            data = serializers.serialize('python', igadget, ensure_ascii=False)
            data_list['iGadgets'] = [get_igadget_data(d) for d in  data]
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    def create(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        if not request.has_key('igadgets'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)      
        received_json = request.POST['igadgets']
        received_data = eval(received_json)
        
        igadgets = received_data.get('iGadgets')
        for igadget in igadgets:
		saveIGadget(igadget, user, screen_id)

        return HttpResponse('')


class IGadgetEntry(Resource):
    def read(self, request, user_name, vendor, name, version, screen_id=None):
        user = user_authentication(user_name)
        gadget = get_object_or_404(Gadget, user=user, vendor=vendor, name=name, version=version)
        if not screen_id:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=1)
        else:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=screen)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        data_fields = get_igadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')

    def create(self, request, user_name, vendor, name, version, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        if not request.has_key('igadget'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)      
        received_json = request.POST['igadget']
        received_data = eval(received_json)
        
        igadget = received_data.get('iGadget')

	SaveIGadget(igadget, user, screen_id)

        return HttpResponse('')
