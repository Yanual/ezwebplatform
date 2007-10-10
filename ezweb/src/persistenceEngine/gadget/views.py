# -*- coding: utf-8 -*-
import urllib
from xml.sax._exceptions import SAXParseException
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from StringIO import StringIO

from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext, Context
from django.template.loader import get_template
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
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
        gadgets = Gadget.objects.all()
        return HttpResponse(str(gadgets), mimetype='text/plain; charset=UTF-8')


class GadgetEntry(Resource):
    def read(self, request, vendor, name, version):
        try:
            gadget = Gadget.objects.get(vendor=vendor, name=name, version=version)
            return HttpResponse(str(gadget), mimetype='text/plain; charset=UTF-8')
        except Gadget.DoesNotExist:
            return HttpResponse('Not exists!')


class GadgetTemplateEntry(Resource):
    def read(self, request, vendor, name, version):
        try:
            gadget = Gadget.objects.get(vendor=vendor, name=name, version=version)
            return HttpResponse(str(gadget.template), mimetype='text/plain; charset=UTF-8')
        except Gadget.DoesNotExist:
            return HttpResponse('Not exists!')


class GadgetCodeEntry(Resource):
    def read(self, request, vendor, name, version):
        try:
            gadget = Gadget.objects.get(vendor=vendor, name=name, version=version)
            return HttpResponse(str(gadget.xHTML), mimetype='text/plain; charset=UTF-8')
        except Gadget.DoesNotExist:
            return HttpResponse('Not exists!')


class GadgetTagsEntry(Resource):
    def read(self, request, vendor, name, version):
        try:
            gadget = Gadget.objects.get(vendor=vendor, name=name, version=version)
            return HttpResponse(str(gadget.tags), mimetype='text/plain; charset=UTF-8')
        except Gadget.DoesNotExist:
            return HttpResponse('Not exists!')

