# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_igadget_data
from commons.utils import json_encode

from igadget.models import IGadget, Screen
from gadget.models import Gadget


class IGadgetCollection(Resource):
    def read(self, request, user_id, screen_id=None):
        user = user_authentication(user_id)
        data_list = []
        if not screen_id:
            screens = get_list_or_404(Screen, user=user)
            for screen in screens:
                igadget = get_list_or_404(IGadget, screen=screen.id)
                data = serializers.serialize('python', igadget, ensure_ascii=False)
                data_list = [get_igadget_data(d) for d in  data]
        else:
            screen = get_object_or_404(Screen, user=user, id=screen_id)
            igadget = get_list_or_404(IGadget, screen=screen_id)
            data = serializers.serialize('python', igadget, ensure_ascii=False)
            data_list = [get_igadget_data(d) for d in  data]
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')


class IGadgetEntry(Resource):
    def read(self, request, user_id, vendor, name, version, screen_id=None):
        user = user_authentication(user_id)
        gadget = get_object_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        if not screen_id:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=1)
        else:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=screen)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        data_fields = get_igadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')

