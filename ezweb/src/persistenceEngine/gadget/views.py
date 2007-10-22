# -*- coding: utf-8 -*-
from urllib import urlopen
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

from HTMLParser import HTMLParser
from xml.sax import saxutils
from xml.sax import make_parser
from xml.sax.handler import feature_namespaces

from models import *


class GadgetCollection(Resource):
    def read(self, request, user_id):
        user_authentication(user_id)
        gadgets = get_list_or_404(Gadget)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_list = []
        for d in data:
            data_fields = _get_gadget_data(d)
            data_list.append(data_fields)
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    def create(self, request, user_id):
        user_authentication(user_id)
        
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

class GadgetEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user_authentication(user_id)
        gadgets = get_list_or_404(Gadget, vendor=vendor, name=name, version=version)
        data = serializers.serialize('python', gadgets, ensure_ascii=False)
        data_fields = _get_gadget_data(data[0])
        return HttpResponse(json_encode(data_fields), mimetype='application/json; charset=UTF-8')

    def update(self, request, user_id, vendor, name, version):
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget.save()
        return HttpResponse('')

    def delete(self, request, user_id, vendor, name, version):
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
        gadget.delete()
        return HttpResponse('')


class GadgetTemplateEntry(Resource):
    def read(self, request, user_id, vendor, name, version):
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
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
        user_authentication(user_id)
        gadget = get_object_or_404(Gadget, vendor=vendor, name=name, version=version)
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

    data_tags = get_list_or_404(Tag.objects.all().values('value'), gadget=get_object_or_404( \
                Gadget, vendor=data_fields['vendor'], name=data_fields['name'], version=data_fields['version']))
    data_fields['tags'] = [d['value'] for d in data_tags]
    
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






