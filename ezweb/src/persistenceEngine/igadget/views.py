# -*- coding: utf-8 -*-
import urllib
from xml.sax._exceptions import SAXParseException
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from StringIO import StringIO

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson

import types
from django.db import models
from django.core.serializers.json import DateTimeAwareJSONEncoder
from decimal import *

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from models import *


class IGadgetCollection(Resource):
    def read(self, request, user_id, screen=None):
        user_authentication(user_id)
        data_list = []
        if not screen:
            igadget = get_list_or_404(IGadget, screen=1)
        else:
            igadget = get_list_or_404(IGadget, screen=screen)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        for d in data:
            data_fields = _get_igadget_data(d)
            data_list.append(data_fields)
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')


class IGadgetEntry(Resource):
    def read(self, request, user_id, vendor, name, version, screen=None):
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        if not screen:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=1)
        else:
            igadget = get_list_or_404(IGadget, gadget=gadget, screen=screen)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        data_fields = _get_igadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')


def user_authentication(user_id):
    user = get_object_or_404(User, id=user_id)
    if not user.is_authenticated():
        raise Http404


def queryset_to_json_list(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_list = [d['fields'] for d in data]
    return simplejson.dumps(data_list, ensure_ascii=False)


def queryset_to_json_object(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_object = data[0]['fields']
    return simplejson.dumps(data_object, ensure_ascii=False)


def _get_igadget_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['uri'] = data_fields['uri']
    
    data_variables = get_list_or_404(Variable.objects.all().values('vardef', 'value'), igadget=data['pk'])
    data_ret['variables'] = {}
    for data_variable in data_variables:
        data_vardef = get_object_or_404(VariableDef.objects.all().values('name', 'aspect', 'type'), id=data_variable['vardef'])
        data_ret['variables'] = data_vardef
        data_ret['variables']['value'] = data_variable['value']
#    data_fields['variables'] = data_variables
    
    return data_ret


def json_encode(data, ensure_ascii=False):
    """
    The main issues with django's default json serializer is that properties that
    had been added to a object dynamically are being ignored (and it also has 
    problems with some models).
    """

    def _any(data):
        ret = None
        if type(data) is types.ListType:
            ret = _list(data)
        elif type(data) is types.DictType:
            ret = _dict(data)
        elif isinstance(data, Decimal):
            # json.dumps() cant handle Decimal
            ret = str(data)
        elif isinstance(data, models.query.QuerySet):
            # Actually its the same as a list ...
            ret = _list(data)
        elif isinstance(data, models.Model):
            ret = _model(data)
        else:
            ret = data
        return ret
    
    def _model(data):
        ret = {}
        # If we only have a model, we only want to encode the fields.
        for f in data._meta.fields:
            ret[f.attname] = _any(getattr(data, f.attname))
        # And additionally encode arbitrary properties that had been added.
        fields = dir(data.__class__) + ret.keys()
        add_ons = [k for k in dir(data) if k not in fields]
        for k in add_ons:
            ret[k] = _any(getattr(data, k))
        return ret
    
    def _list(data):
        ret = []
        for v in data:
            ret.append(_any(v))
        return ret
    
    def _dict(data):
        ret = {}
        for k,v in data.items():
            ret[k] = _any(v)
        return ret
    
    ret = _any(data)
    
    return simplejson.dumps(ret, cls=DateTimeAwareJSONEncoder, ensure_ascii=ensure_ascii)
