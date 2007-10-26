# -*- coding: utf-8 -*-
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from xml.sax._exceptions import SAXParseException
from StringIO import StringIO

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse
from django.core import serializers
from django.utils import simplejson

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_gadget_data
from commons.utils import json_encode

from django.contrib.auth.models import User

from templateParser import TemplateParser

from gadget.models import Gadget, Tag

class GadgetCollection(Resource):
    def read(self, request, user_id):
        user = user_authentication(user_id)
        gadgets = get_list_or_404(Gadget, user=user_id)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_list = []
        for d in data:
            data_fields = get_gadget_data(d)
            data_list.append(data_fields)
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    def create(self, request, user_id):
        user_authentication(user_id)

        if request.POST.has_key('url'):
            templateURL = request.POST['url']
        else:
            return HttpResponse("<error>Url not specified</error>")


        ########### Template Parser
        
        templateParser = TemplateParser(templateURL, user_id)

        templateParser.parse()
        
        return HttpResponse("<ok/>")

class GadgetEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user = user_authentication(user_id)
        gadgets = get_list_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_fields = get_gadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')

    def update(self, request, user_id, vendor, name, version):
        user = user_authentication(user_id)
        gadget = get_object_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        gadget.save()
        return HttpResponse('')

    def delete(self, request, user_id, vendor, name, version):
        user = user_authentication(user_id)
        gadget = get_object_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        gadget.delete()
        return HttpResponse('')


class GadgetTemplateEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user = user_authentication(user_id)
        gadget = get_object_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        template = get_object_or_404(gadget.template, id=gadget.template.id)
        return HttpResponse(json_encode(template), mimetype='application/json; charset=UTF-8')


class GadgetCodeEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        code = get_object_or_404(gadget.xhtml, id=gadget.xhtml.id)
        return HttpResponse(json_encode(code), mimetype='application/json; charset=UTF-8')


class GadgetTagsEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user = user_authentication(user_id)
        gadget = get_object_or_404(Gadget, user=user_id, vendor=vendor, name=name, version=version)
        tags = get_list_or_404(Tag, gadget=gadget)
        return HttpResponse(json_encode(tags), mimetype='application/json; charset=UTF-8')


def user_authentication(user_id):
    user = get_object_or_404(User, id=user_id)
    if not user.is_authenticated():
        raise Http404

def _get_gadget_data(data):
    data_fields = data['fields']

    data_image = get_object_or_404(Template, id=data_fields['template'])
    data_fields['image'] = data_image.image

    data_template = get_list_or_404(VariableDef.objects.all().values('aspect', 'name', 'type'), id=data_fields['template'])
    data_fields['template'] = data_template

    data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])
    data_elements = get_list_or_404(UserEventsInfo.objects.all().values('event', 'handler', 'html_element'), \
                xhtml=data_fields['xhtml'])
    data_fields['xhtml'] = data_code
    data_fields['xhtml']['elements'] = data_elements

    """
    data_tags = get_list_or_404(Tag.objects.all().values('value'), gadget=get_object_or_404( \
                Gadget, vendor=data_fields['vendor'], name=data_fields['name'], version=data_fields['version']))
    data_fields['tags'] = [d['value'] for d in data_tags]
    """

    return data_fields


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
    
    return simplejson.dumps(ret, cls=DateTimeAwareJSONEncoder, ensure_ascii=ensure_ascii)

