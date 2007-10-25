# -*- coding: utf-8 -*-
from urllib import urlopen
from xml.dom.ext.reader import Sax2
from xml.dom.ext import Print
from xml.sax import saxutils
from xml.sax import make_parser
from xml.sax.handler import feature_namespaces
from xml.sax._exceptions import SAXParseException
from StringIO import StringIO
from HTMLParser import HTMLParser

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
        user = user_authentication(user_id)
        
        ############ Code Parser
        gadgetParser = GadgetCodeParser()
        
        xhtml = urlopen("http://europa.ls.fi.upm.es/~mac/code.xhtml").read()
        
        gadgetParser.setGadgetCode(xhtml)
        
        gadgetParser.feed(xhtml)
        
        ########### Template Parser
        
        parser = make_parser()
        handler = TemplateHandler()
        
        parser.initParser()
        
        # Tell the parser to use our handler
        parser.setContentHandler(handler)
        
        # Parse the input
        parser.parse("http://europa.ls.fi.upm.es/~mac/template.xml")
        
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


########### UTILTIY CLASSES

class GadgetCodeParser(HTMLParser):
# HTML parsing

    xHTML = None

    def setGadgetCode(self, code):
        self.xHTML = XHTML ('uri', code)


    def handle_starttag(self, tag, attrs):
        handler = None
        event = None
        id = None

        for (name, value) in attrs:
            if (name == 'ezweb:handler'):
                handler = value
                continue

            if (name == 'ezweb:event'):
                event = value
                continue

            if (name == 'id'):
                id = value

        if (handler != None and event != None and id != None):
            mapping = UserEventsInfo('uri', event, handler, id, xHTML)
            mapping.save()

class TemplateHandler(saxutils.handler.ContentHandler):
# XML parsing

    _accumulator = []
    _name = None
    _version = None
    _preferences = []
    _properties = []
    _wiring = []
    _link = []
    _template = None

    def initParser (self):
        self.template = Template('uri', 'descripton', 'imagen')
        self.template.save()
        
    def typeText2typeCode (typeText):
        if typeText == 'string':
                return 'S'
        elif typeText == 'number':
                return 'N'
        elif typeText == 'date':
                return 'D'
        elif typeText == 'boolean':
                return 'B'
        else:
            print "ERROR en TEXT TYPE"


    def processProperty(self, attrs):
        _name = None
        _type = None
        _description = None

        for (name, value) in attrs:
            if (name == 'name'):
                _name = value
                continue

            if (name == 'type'):
                _type = value
                continue

            if (name == 'description'):
                _description = value
                continue

        print "property"

        vDef = VariableDef('kk', _name, typeText2typeCode(_type), 'PROP', None, template, None)
        vDef.save()

    def processPreference(self, attrs):
        _name = None
        _type = None
        _description = None
        _label = None

        for (name, value) in attrs:
            if (name == 'name'):
                _name = value
                continue

            if (name == 'type'):
                _type = value
                continue

            if (name == 'description'):
                _description = value
                continue

            if (name == 'label'):
                _label = value
                continue

        print "property"

        vDef = VariableDef('kk', _name, typeText2typeCode(_type), 'PREF', None, template, _label)
        vDef.save()

    def processWire(self, attrs):
        _name = None
        _type = None
        _description = None
        _label = None
        _friendCode = None
        _wiring = None

        for (name, value) in attrs:
            if (name == 'name'):
                _name = value
                continue

            if (name == 'type'):
                _type = value
                continue

            if (name == 'description'):
                _description = value
                continue

            if (name == 'label'):
                _label = value
                continue

            if (name == 'friendCode'):
                _friendCode = value
                continue

            if (name == 'wiring'):
                _wiring = value
                continue

        vDef = VariableDef('kk', _name, typeText2typeCode(_type), 'PREF', None, template, _label)
        vDef.save()

        print "wire"

###############

    def startElement(self, name, attrs):
        if (name == 'Preference'):
            self.processPreference(attrs)
            return

        if (name == 'Property'):
            self.processProperty(attrs)
            return

        if (name == 'Wire'):
            self.processWire(attrs)
            return

    def endDocument(self):
        print "fin"






