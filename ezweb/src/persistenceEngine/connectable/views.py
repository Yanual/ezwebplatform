# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson 
 
from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_inout_data, get_igadget_data
from commons.utils import json_encode

from gadget.models import VariableDef
from igadget.models import IGadget, Screen, Variable
from connectable.models import InOut

class ConnectableEntry(Resource):
    def read(self, request, user_id, screen_id=None):
        user = user_authentication(user_id)
        wiring = {}
        
        # IGadgets list
        if not screen_id:
            screens = get_list_or_404(Screen, user=user)
            for screen in screens:
                igadgets = get_list_or_404(IGadget, screen=screen.id)
                igadget_data = serializers.serialize('python', igadgets, ensure_ascii=False)
                igadget_data_list = [get_igadget_data(d) for d in igadget_data]
        else:
            screen = get_object_or_404(Screen, user=user, id=screen_id)
            igadget = get_list_or_404(IGadget, screen=screen_id)
            igadget_data = serializers.serialize('python', igadget, ensure_ascii=False)
            igadget_data_list = [get_igadget_data(d) for d in igadget_data]
        wiring['igadgets'] = igadget_data_list
        
        # InOut list
        inouts = get_list_or_404(InOut, user=user.id)
        inout_data = serializers.serialize('python', inouts, ensure_ascii=False)
        inout_data_list = [get_inout_data(d) for d in inout_data]
        wiring['inouts'] = inout_data_list
        
        return HttpResponse(json_encode(wiring), mimetype='application/json; charset=UTF-8')
    
    def create(self, request, user_id, screen_id=None):
        user = user_authentication(user_id)
        if request.POST.has_key('json'):
            json = simplejson.loads(request.POST['json'])
        else:
            raise Http404    
        if not screen_id:
            screen_id = 1
        screen = get_object_or_404(Screen, user=user, id=screen_id)
        
        # IGadgets
        igadgets = json['igadgets']
        for ig in igadgets:
            igadget = get_object_or_404(IGadget, screen=screen, uri=ig['uri'])
            print igadget
        
        # InOuts
        inouts = json['inouts']
        for io in inouts:
            inout = get_object_or_404(InOut, user=user, uri=io['uri'])
            print inout

        return HttpResponse('')

