from urllib import urlopen
from datetime import datetime
import sys

from xml.sax import saxutils
from xml.sax import make_parser

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from resource.models import GadgetResource
from resource.models import GadgetWiring


class TemplateParser:

    def __init__(self, uri, user):

        self.parser = make_parser()
        self.handler = TemplateHandler()
        self.handler.setUserUri(user,uri)
        self.uri = uri

        # Tell the parser to use our handler
        self.parser.setContentHandler(self.handler)


class TemplateHandler(saxutils.handler.ContentHandler): 
	
    _accumulator = []

    def setUserUri (self, user, uri):
        self._user=user
        self._uri=uri
	
    def resetAccumulator(self):
        self._accumulator = []
    
    def processWire(self, attrs):
       
        _friendCode = ''
        _wiring = ''

        if (attrs.has_key('friendcode')==True):
            _friendCode = attrs.get('friendcode')

        if (attrs.has_key('wiring')==True):
            _wiring = attrs.get('wiring')

        if (_friendCode != '' and _wiring != ''):

            
            wiring = GadgetWiring( friendcode = _friendCode, 
                                wiring = _wiring,
                                idResource_id = get_object_or_404(GadgetResource, short_name=self._name,vendor=self._vendor,version=self._version).id)

            wiring.save()
        else:
            print "Needed attributed missed in processWire!"
	
    def endElement(self, name):
        
	if (name == 'Name'):
	    self._name = self._accumulator[0]
	    return
	if (name == 'Vendor'):
	    self._vendor = self._accumulator[0]
	    return
	if (name == 'Version'):
	    self._version = self._accumulator[0]
	    return
	if (name == 'Author'):
	    self._author = self._accumulator[0]
	    return
	if (name == 'Description'):
	    self._description = self._accumulator[0]
	    return
	if (name == 'Mail'):
	    self._mail = self._accumulator[0]
	    return
	if (name == 'ImageURI'):
	    self._imageURI = self._accumulator[0]
	    return
	if (name == 'WikiURI'):
	    self._wikiURI = self._accumulator[0]
	    return

        if (self._name != '' and self._vendor != '' and self._version != '' and self._author != '' and self._description != '' and self._mail != '' and self._imageURI != '' and self._wikiURI != ''):

	    gadget=GadgetResource()
	    gadget.short_name=self._name
	    gadget.vendor=self._vendor
	    gadget.added_by_user_id = get_object_or_404(User, username=self._user).id
	    gadget.version=self._version
	    gadget.author=self._author
	    gadget.description=self._description
	    gadget.mail=self._mail
	    gadget.image_uri=self._imageURI
	    gadget.wiki_page_uri=self._wikiURI
	    gadget.template_uri=self._uri
	    gadget.creation_date=datetime.today()

            gadget.save()
	               
            self._wikiURI = ''

    def characters(self, text):
	self._accumulator.append(text)

    def startElement(self, name, attrs):
	if (name == 'Name') or (name=='Version') or (name=='Vendor') or (name=='Author') or (name=='Description') or (name=='Mail') or (name=='ImageURI') or (name=='WikiURI'):
	    self.resetAccumulator()
	    return
        if (name == 'Wire'):
            self.processWire(attrs)
            return