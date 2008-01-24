# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2004 Telefónica Investigación y Desarrollo 
#     S.A.Unipersonal (Telefónica I+D) 
# 
# Info about members and contributors of the MORFEO project 
# is available at: 
# 
#   http://morfeo-project.org/
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version. 
# 
# This program is distributed in the hope that it will be useful, 
# but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details. 
# 
# You should have received a copy of the GNU General Public License 
# along with this program; if not, write to the Free Software 
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
# 
# If you want to use this software an plan to distribute a 
# proprietary application in any way, and you are not licensing and 
# distributing your source code under GPL, you probably need to 
# purchase a commercial license of the product.  More info about 
# licensing options is available at: 
# 
#   http://morfeo-project.org/
#

from urllib import urlopen
from datetime import datetime
import sys

from xml.sax import saxutils
from xml.sax import make_parser

from commons.exceptions import TemplateParseException

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from django.utils.translation import gettext_lazy as _

from resource.models import *


class TemplateParser:
    def __init__(self, uri, user):

        self.parser = make_parser()
        self.handler = TemplateHandler()
        self.handler.setUserUri(user,uri)
        self.uri = uri

        # Tell the parser to use our handler
        self.parser.setContentHandler(self.handler)

    def parse(self):
        # Parse the input
        self.parser.parse(self.uri)
        

class TemplateHandler(saxutils.handler.ContentHandler): 
	
    _accumulator = []

    def setUserUri (self, user, uri):
        self._user=user
        self._uri=uri
        self._flag = ''
	
    def resetAccumulator(self):
        self._accumulator = []
    
    def processWire(self, attrs, wire):
       
        _friendCode = ''
        _wiring = ''

        if (attrs.has_key('friendcode')==True):
            _friendCode = attrs.get('friendcode')

	if (wire == 'Slot'):
            _wiring = 'in'
            
        if (wire == 'Event'):
            _wiring = 'out'

        if (_friendCode != '' and wire != ''):
            wiring = GadgetWiring( friendcode = _friendCode, wiring = _wiring,
                idResource_id = get_object_or_404(GadgetResource, 
                short_name=self._name,vendor=self._vendor,version=self._version).id)

            wiring.save()
        else:
            raise TemplateParseException(_("ERROR: Missing attribute at Event or Slot element"))

	
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

        if (self._name != '' and self._vendor != '' and self._version != '' and self._author != '' and self._description != '' and self._mail != '' and self._imageURI != '' and self._wikiURI != '' and self._flag == ''):
	    
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
            self._flag = 'add'

	elif (self._flag == 'add'):
            return
        else:
            raise TemplateParseException(_("ERROR: Missing Resource describing info at Resource element! See schema!"))

    def characters(self, text):
	self._accumulator.append(text)

    def startElement(self, name, attrs):
	if (name == 'Name') or (name=='Version') or (name=='Vendor') or (name=='Author') or (name=='Description') or (name=='Mail') or (name=='ImageURI') or (name=='WikiURI'):
	    self.resetAccumulator()
	    return

        if (name == 'Slot'):
            self.processWire(attrs,'Slot')
            return

        if (name == 'Event'):
            self.processWire(attrs,'Event')
            return
