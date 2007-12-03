# -*- coding: utf-8 -*-
from xml.sax import saxutils
from xml.sax import make_parser
from xml.sax.handler import feature_namespaces

from gadgetCodeParser import GadgetCodeParser

from models import *

class TemplateParser:
    def __init__(self, uri, user):

        self.parser = make_parser()
        self.handler = TemplateHandler()
        self.handler.setUser(user)

        self.uri = uri

        # Tell the parser to use our handler
        self.parser.setContentHandler(self.handler)
        
    def parse(self):
        # Parse the input
        self.parser.parse(self.uri)
        
    def getGadget (self):
        return self.handler._gadget 

    def getGadgetName (self):
        return self.handler._gadgetName 

    def getGadgetVersion (self):
        return self.handler._gadgetVersion

    def getGadgetVendor (self):
        return self.handler._gadgetVendor

            
class TemplateHandler(saxutils.handler.ContentHandler):
    # XML parsing

    _accumulator = []
    _link = []
    _gadgetName = ""
    _gadgetVersion = ""
    _gadgetVendor = ""
    _gadgetImage = ""
    _gadgetWiki = ""
    _gadgetAuthor = ""
    _gadgetMail = ""
    _gadgetDesc = ""
    _template = ""
    _user = ""
    _gadgetURI = ""
    _xhtml = ""
    _lastPreference = ""
    _gadget = None

        
    def setUser (self, user):
        self._user=user

    def typeText2typeCode (self, typeText):
        if typeText == 'text':
                return 'S'
        elif typeText == 'number':
                return 'N'
        elif typeText == 'date':
                return 'D'
        elif typeText == 'boolean':
                return 'B'
        elif typeText == 'list':
                return 'L'
        else:
            print "ERROR in TEXT TYPE"


    def getWiringAspect(self, wiring):
        if wiring == 'in':
            return 'EVEN'
        elif wiring == 'out':
            return 'SLOT'
        else:
            print "ERROR in WIRING ASPECT"


    def processProperty(self, attrs):
        _name = ''
        _type = ''
        _description = ''

        if (attrs.has_key('name')==True):
            _name = attrs.get('name')

        if (attrs.has_key('type')==True):
            _type = attrs.get('type')

        if (attrs.has_key('description')==True):
            _description = attrs.get('description')

        if (_name != '' and _type != ''):
            vDef = VariableDef ( name = _name, description =_description,
                                 type=self.typeText2typeCode(_type), 
                                 aspect = 'PROP', friend_code = None, 
                                 template = self._template )

            vDef.save()
        else:
            print "Needed attributed missed in processProperty"

    def processPreference(self, attrs):
        _name = ''
        _type = ''
        _description = ''
        _label = ''
        _default_value = ''

        if (attrs.has_key('name')==True):
            _name = attrs.get('name')

        if (attrs.has_key('type')==True):
            _type = attrs.get('type')

        if (attrs.has_key('description')==True):
            _description = attrs.get('description')

        if (attrs.has_key('label')==True):
            _label = attrs.get('label')

        if (attrs.has_key('default')==True):
            _default_value = attrs.get('default')

        if (_name != '' and _type != '' and _description != '' and _label != ''):
            vDef = VariableDef( name=_name, description =_description,
                                type=self.typeText2typeCode(_type), 
                                aspect='PREF', friend_code=None,
                                label = _label,
                                default_value = _default_value,
                                template=self._template )
    
            vDef.save()

            self._lastPreference = vDef
                
        else:
            print "Needed attributed missed in processPreference"


    def processWire(self, attrs):
        _name = ''
        _type = ''
        _description = ''
        _label = ''
        _friendCode = ''
        _wiring = ''


        if (attrs.has_key('name')==True):
            _name = attrs.get('name')

        if (attrs.has_key('type')==True):
            _type = attrs.get('type')

        if (attrs.has_key('description')==True):
            _description = attrs.get('description')

        if (attrs.has_key('label')==True):
            _label = attrs.get('label')

        if (attrs.has_key('friendcode')==True):
            _friendCode = attrs.get('friendcode')

        if (attrs.has_key('wiring')==True):
            _wiring = attrs.get('wiring')

        if (_name != '' and _type != '' and _friendCode != '' and _wiring != ''):

            vDef = VariableDef( name = _name, description = _description, 
                                type = self.typeText2typeCode(_type), 
                                aspect = self.getWiringAspect(_wiring), 
                                friend_code = _friendCode, 
                                label = _label,
                                template = self._template)

            vDef.save()
        else:
            print "Needed attributed missed in processWire!"

    def processXHTML (self, attrs):
        _href=""

        if (attrs.has_key('href')==True):
            _href = attrs.get('href')
        
        if (_href != ""):
            # Gadget Code Parsing
            gadgetParser = GadgetCodeParser()
            gadgetParser.parseUserEvents(_href, self._gadgetURI)

            self._xhtml = gadgetParser.getXHTML()

    def processOption (self, attrs):
        _value=""
        _name=""

        if (attrs.has_key('name')==True):
            _name = attrs.get('name')

        if (attrs.has_key('value')==True):
            _value = attrs.get('value')

        if (_value!= "") and (_name!="") and (self._lastPreference.type ==  self.typeText2typeCode("list")):
            option = UserPrefOption(value=_value, name=_name, variableDef=self._lastPreference)

            option.save()

    def processRendering (self, attrs):
        _width=""
        _height=""

        if (attrs.has_key('width')==True):
            _width = attrs.get('width')

        if (attrs.has_key('height')==True):
            _height = attrs.get('height')

        if (_width != "" and _height != ""):
            self._template.width=_width
            self._template.height=_height
            self._template.save()
                        

###############

    def startElement(self, name, attrs):
        # Catalogue
        if (name == 'Name') or (name=='Version') or (name=='Vendor') or (name=='ImageURI') or (name=='WikiURI') or (name=='Mail') or (name=='Description') or (name=='Author'):
            self.reset_Accumulator()
            return

        # Plataform
        if (name == 'Preference'):
            self.processPreference(attrs)
            return

        if (name == 'Property'):
            self.processProperty(attrs)
            return

        if (name == 'Wire'):
            self.processWire(attrs)
            return

        if (name == 'XHTML'):
            self.processXHTML(attrs)
            return

        if (name == 'Option'):
            self.processOption(attrs)
            return

        if (name == 'Platform.Rendering'):
            self.processRendering(attrs)
            return


    def endElement(self, name):
        if (name == 'Catalog.ResourceDescription'):
            
            type (self._user)

            self._gadgetURI = "/user/" + self._user.username + "/gadgets/" + self._gadgetVendor \
                + "/" + self._gadgetName + "/" + self._gadgetVersion

            self._template = Template ( uri=self._gadgetURI + "/template", 
                                       description=self._gadgetDesc, 
                                       image=self._gadgetImage )
            
            self._template.save()
            
            return

        if (name == 'Name'):
            self._gadgetName = self._accumulator
            return

        if (name == 'Version'):
            self._gadgetVersion = self._accumulator
            return

        if (name == 'Vendor'):
            self._gadgetVendor = self._accumulator
            return

        if (name == 'Author'):
            self._gadgetAuthor = self._accumulator
            return        

        if (name == 'ImageURI'):
            self._gadgetImage = self._accumulator
            return

        if (name == 'WikiURI'):
            self._gadgetWiki = self._accumulator
            return

        if (name == 'Mail'):
            self._gadgetMail = self._accumulator

        if (name == 'Description'):
            self._gadgetDesc = self._accumulator
            return



    def characters(self, text):
        if (len(text) == 0):
            return

        if (text[0] == '\n' or text[0] == '\r' or text[0] == '\t'):
            return

        if (text == '    '):
            return

        self._accumulator += text

    def endDocument(self):
        if self._gadgetName != "" and self._gadgetVendor != "" \
                and self._gadgetVersion != "" and self._gadgetAuthor != "" \
                and self._gadgetMail != "" and self._gadgetDesc != "" \
                and self._gadgetWiki != "" and self._gadgetImage != "":

            self._gadget = Gadget ( uri=self._gadgetURI, vendor=self._gadgetVendor, 
                              name=self._gadgetName, version=self._gadgetVersion, 
                              template=self._template, xhtml=self._xhtml, 
                              author=self._gadgetAuthor, mail=self._gadgetMail,
                              wikiURI=self._gadgetWiki, imageURI=self._gadgetImage, 
                              description=self._gadgetDesc, user=self._user )

            self._gadget.save()
            
    def reset_Accumulator(self):
        self._accumulator = ""
