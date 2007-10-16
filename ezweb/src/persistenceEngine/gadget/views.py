# -*- coding: utf-8 -*-
import urllib
from xml.sax._exceptions import SAXParseException
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from StringIO import StringIO

from django.shortcuts import get_object_or_404, get_list_or_404, render_to_response
from django.template import RequestContext, Context
from django.template.loader import get_template
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.utils import simplejson

import types
from django.db import models
from django.utils import simplejson as json
from django.core.serializers.json import DateTimeAwareJSONEncoder
from decimal import *

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from models import *

## Versión con el objeto Collection para cuando el modelo mapea 1:1 con el recurso
#gadgets_resource = Collection(
#    queryset = Gadget.objects.all(),
#    permitted_methods = ('GET', ),
#    expose_fields = ('id', 'vendor', 'name', 'title', 'version', 'uri'),
#    responder = XMLResponder()
#)


class GadgetCollection(Resource):
    def read(self, request):
        gadgets = get_list_or_404(Gadget)
        fields = None
        data = serializers.serialize('python', gadgets, fields=fields, ensure_ascii=False)
        data_list = []
        for d in data:
            data_fields = d['fields']
            data_template = get_object_or_404(Template, id=data_fields['template'])
            data_fields['template'] = data_template
            data_code = get_object_or_404(XHTML, id=data_fields['xhtml'])
            data_fields['xhtml'] = data_code
            data_tags = get_list_or_404(Tag, gadget=get_object_or_404( \
                        Gadget, vendor=data_fields['vendor'], name=data_fields['name'], version=data_fields['version']))
            data_fields['tags'] = data_tags
            data_list.append(data_fields)
#        gadgets_json = queryset_to_json_list(gadgets)
#        return HttpResponse(gadgets_json, mimetype='application/json; charset=UTF-8')
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    def create(self, request):
        pass

class GadgetEntry(Resource):
    def read(self, request, vendor, name, version):
        gadgets = get_list_or_404(Gadget.objects.select_related(), vendor=vendor, name=name, version=version)
        fields = None
        data = serializers.serialize('python', gadgets, fields=fields, ensure_ascii=False)
        data_list = []
        d = data[0]
        data_fields = d['fields']

        data_template = get_object_or_404(VariableDef.objects.all().values('aspect', 'name'), id=data_fields['template'])
        data_fields['template'] = data_template

        data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])
        data_fields['xhtml'] = data_code
        data_elements = get_list_or_404(UserEventsInfo.objects.all().values('uri', 'event', 'handler'))
        data_fields['xhtml']['elements'] = data_elements

        data_tags = get_list_or_404(Tag.objects.all().values('value'), gadget=get_object_or_404( \
                    Gadget, vendor=data_fields['vendor'], name=data_fields['name'], version=data_fields['version']))
        data_fields['tags'] = [d['value'] for d in data_tags]

        data_list.append(data_fields)
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    def update(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget.save()
        return HttpResponse('')

    def delete(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget.delete()
        return HttpResponse('')


class GadgetTemplateEntry(Resource):
    def read(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        template = get_object_or_404(gadget.template, id=gadget.template.id)
        return HttpResponse(json_encode(template), mimetype='application/json; charset=UTF-8')


class GadgetCodeEntry(Resource):
    def read(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        code = get_object_or_404(gadget.xHTML, id=gadget.xHTML.id)
        return HttpResponse(json_encode(code), mimetype='application/json; charset=UTF-8')


class GadgetTagsEntry(Resource):
    def read(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        tags = get_list_or_404(Tag, gadget=gadget)
        return HttpResponse(json_encode(tags), mimetype='application/json; charset=UTF-8')


def queryset_to_json_list(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_list = [d['fields'] for d in data]
    return simplejson.dumps(data_list, ensure_ascii=False)


def queryset_to_json_object(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_object = data[0]['fields']
    return simplejson.dumps(data_object, ensure_ascii=False)


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
    
    return json.dumps(ret, cls=DateTimeAwareJSONEncoder, ensure_ascii=ensure_ascii)


