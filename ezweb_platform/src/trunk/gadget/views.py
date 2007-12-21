# -*- coding: utf-8 -*-
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from xml.sax._exceptions import SAXParseException
from StringIO import StringIO

from django.db import IntegrityError

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseServerError
from django.core import serializers
from django.utils import simplejson

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from commons.authentication import user_authentication
from commons.get_data import get_gadget_data
from commons.utils import json_encode

from gadget.templateParser import TemplateParser

from django.contrib.auth.models import User
from django.db import transaction

from commons.utils import *

from gadget.models import Gadget, Template

class GadgetCollection(Resource):
    def read(self, request, user_name):
        user = user_authentication(user_name)
        gadgets = get_list_or_404(Gadget, user=user)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_list = []
        for d in data:
            data_fields = get_gadget_data(d)
            data_list.append(data_fields)
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    @transaction.commit_manually
    def create(self, request, user_name):
        user = user_authentication(user_name)
        if request.POST.has_key('url'):
            templateURL = request.POST['url']
        else:
            return HttpResponse("<error>Url not specified</error>")

        ########### Template Parser
        templateParser = None
        
        try:
            templateParser = TemplateParser(templateURL, user)
            templateParser.parse()
            transaction.commit()
        except IntegrityError:
            # Gadget already exists. Rollback transaction
            transaction.rollback()
        except Exception, e:
            # Internal error
            transaction.rollback()
            return HttpResponseServerError("<error>%s</error>" % e, mimetype='application/xml; charset=UTF-8')
        
        gadgetName = templateParser.getGadgetName()
        gadgetVendor = templateParser.getGadgetVendor()
        gadgetVersion = templateParser.getGadgetVersion()

        gadget_entry = GadgetEntry()
        # POST and GET behavior is alike, both must return a Gadget JSON representation
        return gadget_entry.read(request, user_name, gadgetVendor, gadgetName, gadgetVersion)
        
class GadgetEntry(Resource):
    def read(self, request, user_name, vendor, name, version):
        user = user_authentication(user_name)
        gadgets = get_list_or_404(Gadget, user=user, vendor=vendor, name=name, version=version)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_fields = get_gadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')

    def update(self, request, user_name, vendor, name, version):
        user = user_authentication(user_name)
        gadget = get_object_or_404(Gadget, user=user, vendor=vendor, name=name, version=version)
        gadget.save()
        return HttpResponse('')

    def delete(self, request, user_name, vendor, name, version):
        user = user_authentication(user_name)
        gadget = get_object_or_404(Gadget, user=user, vendor=vendor, name=name, version=version)
        gadget.delete()
        return HttpResponse('')


class GadgetTemplateEntry(Resource):
    def read(self, request, user_name, vendor, name, version):
        user = user_authentication(user_name)
        gadget = get_object_or_404(Gadget, user=user, vendor=vendor, name=name, version=version)
        template = get_object_or_404(gadget.template, id=gadget.template.id)
        return HttpResponse(json_encode(template), mimetype='application/json; charset=UTF-8')


class GadgetCodeEntry(Resource):
    def read(self, request, user_name, vendor, name, version):
        user = user_authentication(user_name)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version, user=user)
        code = get_object_or_404(gadget.xhtml, id=gadget.xhtml.id)
        return HttpResponse(code.code, mimetype='text/html; charset=UTF-8')

