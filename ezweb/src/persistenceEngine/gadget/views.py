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

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from models import Gadget

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
        gadgets_json = queryset_to_json_list(gadgets)
        return HttpResponse(gadgets_json, mimetype='application/json; charset=UTF-8')


class GadgetEntry(Resource):
    def read(self, request, vendor, name, version):
        gadgets = get_list_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget_json = queryset_to_json_object(gadgets)
        return HttpResponse(gadget_json, mimetype='application/json; charset=UTF-8')

    def delete(self, request, vendor, name, version):
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget.delete()
        return HttpResponse('')


class GadgetTemplateEntry(Resource):
    def read(self, request, vendor, name, version):
        gadgets = get_list_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget_json = queryset_to_json_object(gadgets, fields=('template'))
        return HttpResponse(gadget_json, mimetype='application/json; charset=UTF-8')


class GadgetCodeEntry(Resource):
    def read(self, request, vendor, name, version):
        gadgets = get_list_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget_json = queryset_to_json_object(gadgets, fields=('xHTML'))
        return HttpResponse(gadget_json, mimetype='application/json; charset=UTF-8')


class GadgetTagsEntry(Resource):
    def read(self, request, vendor, name, version):
        gadgets = get_list_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget_json = queryset_to_json_object(gadgets, fields=('tags'))
        return HttpResponse(gadget_json, mimetype='application/json; charset=UTF-8')


def queryset_to_json_list(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_list = [d['fields'] for d in data]
    return simplejson.dumps(data_list, ensure_ascii=False)


def queryset_to_json_object(queryset, fields=None):
    data = serializers.serialize('python', queryset, fields=fields, ensure_ascii=False) 
    data_object = data[0]['fields']
    return simplejson.dumps(data_object, ensure_ascii=False)

