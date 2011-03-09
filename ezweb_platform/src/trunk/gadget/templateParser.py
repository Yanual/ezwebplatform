#-*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from xml.sax import parseString, handler

from django.db import transaction
from django.utils.translation import ugettext as _

from commons.exceptions import TemplateParseException
from commons.http_utils import download_http_content
from commons.translation_utils import get_trans_index
from deployment.wgtPackageUtils import get_wgt_local_path
from gadgetCodeParser import parse_gadget_code
from gadget.models import VariableDef, ContextOption, UserPrefOption, Gadget, Capability, SharedVariableDef
from translator.models import Translation


class TemplateParser:

    def __init__(self, uri, user, fromWGT, request):
        self.uri = uri
        self.user = user
        self.fromWGT = fromWGT
        self.request = request

        if not fromWGT:
            self.xml = download_http_content(uri, user=user)
        else:
            # In this case 'uri' is a filesystem URL
            localpath = get_wgt_local_path(uri)
            f = open(localpath, 'r')
            self.xml = f.read()
            f.close()

        self.handler = None
        self._capabilities = []
        self.uriHandler = UriGadgetHandler()
        parseString(self.xml, self.uriHandler)

    def parse(self):
        # Parse the input
        self.handler = TemplateHandler(self.fromWGT, self.request, self.uri, user=self.user)
        parseString(self.xml, self.handler)

    def getGadget(self):
        return self.handler._gadget

    def getGadgetName(self):
        if not self.handler:
            return self.uriHandler._gadgetName
        return self.handler._gadgetName

    def getGadgetVersion(self):
        if not self.handler:
            return self.uriHandler._gadgetVersion
        return self.handler._gadgetVersion

    def getGadgetVendor(self):
        if not self.handler:
            return self.uriHandler._gadgetVendor
        return self.handler._gadgetVendor

    def getGadgetUri(self):
        if not self.handler:
            return self.uriHandler._gadgetURI
        return self.handler._gadgetURI


class UriGadgetHandler(handler.ContentHandler):

    def __init__(self):
        self._accumulator = []
        self._gadgetName = ""
        self._gadgetVersion = ""
        self._gadgetVendor = ""
        self._gadgetURI = ""

    def startElement(self, name, attrs):
        # Catalogue
        if (name == 'Name') or (name == 'Version') or (name == 'Vendor'):
            self.reset_Accumulator()
            return

    def endElement(self, name):
        if (name == 'Catalog.ResourceDescription'):
            self._gadgetURI = "/gadgets/" + self._gadgetVendor + "/" + self._gadgetName + "/" + self._gadgetVersion
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

    def characters(self, text):
        if (len(text) == 0):
            return

        if (text[0] == '\n' or text[0] == '\r' or text[0] == '\t'):
            return

        if (text == '    '):
            return

        self._accumulator += text

    def endDocument(self):
        emptyRequiredFields = []
        if self._gadgetName == "":
            emptyRequiredFields.append("name")

        if self._gadgetVendor == "":
            emptyRequiredFields.append("vendor")

        if self._gadgetVersion == "":
            emptyRequiredFields.append("version")

        if len(emptyRequiredFields) > 0:
            print emptyRequiredFields
            raise TemplateParseException(_("Missing required field(s): %(fields)s") % {"fields": unicode(emptyRequiredFields)})

    def reset_Accumulator(self):
        self._accumulator = ""


def get_shared_var_def(attrs):

    if 'shared_concept' in attrs:
        name = attrs.get('shared_concept')
        shared_var_def, create = SharedVariableDef.objects.get_or_create(name=name)
        return shared_var_def
    return None


class TemplateHandler(handler.ContentHandler):

    _SLOT = "SLOT"
    _EVENT = "EVEN"

    def __init__(self, fromWGT, request, uri, user=None):
        self._relationships = []
        self._accumulator = []
        self._link = []
        self._gadgetName = ""
        self._gadgetDisplayName = ""
        self._gadgetVersion = ""
        self._gadgetVendor = ""
        self._gadgetImage = ""
        self._gadgetIPhoneImage = ""
        self._gadgetWiki = ""
        self._gadgetAuthor = ""
        self._gadgetMail = ""
        self._gadgetDesc = ""
        self._gadgetMenuColor = ""
        self._gadgetWidth = ""
        self._gadgetHeight = ""
        self._gadgetURI = ""
        self._xhtml = ""
        self._lastPreference = ""
        self._gadget = Gadget()
        self._capabilities = []
        #translation attributes
        self.translatable_list = []
        self.translated_list = []
        self.translations = {}
        self.lang_list = []
        self.default_lang = ""
        self.current_lang = ""
        self.current_text = ""
        self.fromWGT = fromWGT
        self.user = user
        self.request = request
        self.uri = uri

    def typeText2typeCode(self, typeText):
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
        elif typeText == 'password':
                return 'P'
        else:
            raise TemplateParseException(_(u"ERROR: unkown TEXT TYPE ") + typeText)

    def processProperty(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _description = attrs.get('description', '')
        _default_value = attrs.get('default', None)

        if (_name != '' and _type != ''):
            #check if it's shared
            shared_concept = get_shared_var_def(attrs)

            vDef = VariableDef(name=_name,
                               description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect='PROP',
                               friend_code=None,
                               default_value=_default_value,
                               gadget=self._gadget,
                               shared_var_def=shared_concept)

            #vDef.save()
            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = None
            relationship_eltos['option'] = []
            relationship_eltos['trans'] = []
            self._relationships.append(relationship_eltos)

        else:
            raise TemplateParseException(_(u"ERROR: missing attribute at Property element"))

    def processPreference(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _description = attrs.get('description', '')
        _label = attrs.get('label', '')
        _default_value = attrs.get('default', '')

        if (_name != '' and _type != '' and _description != '' and _label != ''):
            #check if it's shared
            shared_concept = get_shared_var_def(attrs)

            vDef = VariableDef(name=_name,
                               description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect='PREF',
                               friend_code=None,
                               label=_label,
                               default_value=_default_value,
                               gadget=self._gadget,
                               shared_var_def=shared_concept)

            #vDef.save()
            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = None
            relationship_eltos['option'] = []

            relationship_eltos['trans'] = []
            index = self.addIndex(_description)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)
            index = self.addIndex(_label)

            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)

            self._relationships.append(relationship_eltos)

            self._lastPreference = relationship_eltos

        else:
            raise TemplateParseException(_("ERROR: missing attribute at UserPreference element"))

    def processEvent(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _description = attrs.get('description', '')
        _label = attrs.get('label', '')
        _friendCode = attrs.get('friendcode', '')

        if _description:
            index = self.addIndex(_description)

        if _label:
            index = self.addIndex(_label)

        if (_name != '' and _type != '' and _friendCode != ''):

            vDef = VariableDef(name=_name, description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect=self._EVENT,
                               friend_code=_friendCode,
                               label=_label,
                               gadget=self._gadget)

            #vDef.save()
            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = None
            relationship_eltos['option'] = []

            relationship_eltos['trans'] = []
            index = self.addIndex(_description)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)
            index = self.addIndex(_label)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)

            self._relationships.append(relationship_eltos)
        else:
            raise TemplateParseException(_("ERROR: missing attribute at Event element"))

    def processSlot(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _description = attrs.get('description', '')
        _label = attrs.get('label', '')
        _friendCode = attrs.get('friendcode', '')
        _action_label = attrs.get('actionlabel', '')

        if (_name != '' and _type != '' and _friendCode != ''):

            vDef = VariableDef(name=_name,
                               description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect=self._SLOT,
                               friend_code=_friendCode,
                               label=_label,
                               action_label=_action_label,
                               gadget=self._gadget)

            #vDef.save()
            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = None
            relationship_eltos['option'] = []

            relationship_eltos['trans'] = []
            index = self.addIndex(_description)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)

            index = self.addIndex(_label)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)

            index = self.addIndex(_action_label)
            if index:
                self.addTranslation(index, vDef)
                relationship_eltos['trans'].append(index)

            self._relationships.append(relationship_eltos)
        else:
            raise TemplateParseException(_("ERROR: missing attribute at Slot element"))

    def processCapability(self, attrs):
        name = attrs.get('name', None)
        value = attrs.get('value', None)

        if (not name or not value):
            raise TemplateParseException(_("ERROR: missing attribute at Capability element"))

        if (not self._gadget):
            raise TemplateParseException(_("ERROR: capabilities must be placed AFTER Resource definition!"))

        self._capabilities.append(Capability(name=name.lower(), value=value.lower(), gadget=self._gadget))

    def processGadgetContext(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _concept = attrs.get('concept', '')
        _description = attrs.get('description', '')

        if (_name != '' and _type != '' and _concept != ''):
            vDef = VariableDef(name=_name, description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect='GCTX', friend_code=None,
                               gadget=self._gadget)
            #vDef.save()
            context = ContextOption(concept=_concept, varDef=vDef)
            #context.save()
            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = context
            relationship_eltos['option'] = []
            relationship_eltos['trans'] = []
            self._relationships.append(relationship_eltos)
        else:
            raise TemplateParseException(_("ERROR: missing attribute at Gadget Context element"))

    def processExternalContext(self, attrs):
        _name = attrs.get('name', '')
        _type = attrs.get('type', '')
        _concept = attrs.get('concept', '')
        _description = attrs.get('description', '')

        if (_name != '' and _type != '' and _concept != ''):
            vDef = VariableDef(name=_name, description=_description,
                               type=self.typeText2typeCode(_type),
                               aspect='ECTX', friend_code=None,
                               gadget=self._gadget)
            #vDef.save()
            context = ContextOption(concept=_concept, varDef=vDef)
            #context.save()

            relationship_eltos = {}
            relationship_eltos['vdef'] = vDef
            relationship_eltos['context'] = context
            relationship_eltos['option'] = []
            relationship_eltos['trans'] = []
            self._relationships.append(relationship_eltos)
        else:
            raise TemplateParseException(_("ERROR: missing attribute at External Context element"))

    def processXHTML(self, attrs):
        _href = attrs.get('href', '').encode('utf8')
        _cacheable = attrs.get('cacheable', 'true').encode('utf8').lower() == 'true'
        _content_type = attrs.get('content-type', None)

        if _href != "":
            try:
                self._xhtml = parse_gadget_code(self.uri, _href, self._gadgetURI, _content_type,
                                                self.fromWGT, cacheable=_cacheable, user=self.user)
            except TemplateParseException:
                raise
            except Exception, e:
                raise TemplateParseException(_("ERROR: XHTML could not be read: %(errorMsg)s") % {'errorMsg': e.message})
        else:
            raise TemplateParseException(_("ERROR: missing attribute at XHTML element"))

    def processOption(self, attrs):
        if 'name' in attrs:
            # backward compatibility
            _name = attrs['name']
        elif 'label' in attrs:
            _name = attrs['label']
        else:
            _name = ''

        _value = attrs.get('value', '')

        if (_value != "") and (_name != "") and (self._lastPreference['vdef'].type == self.typeText2typeCode("list")):
            option = UserPrefOption(value=_value, name=_name, variableDef=self._lastPreference['vdef'])
            index = self.addIndex(_name)
            if index:
                self.addTranslation(index, option)
            self._lastPreference['option'].append({"option": option, "index": index})
        else:
            raise TemplateParseException(_("ERROR: missing attribute at Option element"))

    def processRendering(self, attrs):
        _width = attrs.get('width', '')
        _height = attrs.get('height', '')

        if (_width != "" and _height != ""):
            self._gadgetWidth = _width
            self._gadgetHeight = _height
        else:
            raise TemplateParseException(_("ERROR: missing attribute at Rendering element"))

    def processTranslations(self, attrs):
        try:
            self.default_lang = attrs['default']
        except KeyError:
            raise TemplateParseException(_("ERROR: missing the 'default' attribute at Translations element"))

    def processTranslation(self, attrs):
        try:
            self.current_lang = attrs['lang']
            self.lang_list.append(self.current_lang)
        except KeyError:
            raise TemplateParseException(_("ERROR: missing the language attribute at Translation element"))

    def processMsg(self, attrs):
        try:
            self.current_text = attrs['name']
        except KeyError:
            raise TemplateParseException(_("ERROR: missing the language attribute at Translation element"))

    def addIndex(self, index):
        #add index to the translation list
        value = get_trans_index(index)
        if value and not value in self.translatable_list:
            self.translatable_list.append(value)
        return value

    def addTranslation(self, index, object):
        table_ = object.__class__.__module__ + "." + object.__class__.__name__
        if index in self.translations:
            #increment the number of times this index has been used (it will been used when the Translation is saved)
            times = 1
            if 'times' in self.translations[index]:
                times = self.translations[index]["times"]
            self.translations[index]["times"] = times + 1
        else:
            self.translations[index] = {}
            self.translations[index]["trans"] = table_

###############

    def startElement(self, name, attrs):
        # Catalogue
        if name in ('Name', 'Version', 'Vendor', 'ImageURI', 'iPhoneImageURI',
                    'WikiURI', 'Mail', 'Description', 'Author', 'DisplayName', 'MenuColor'):
            self.reset_Accumulator()

        # Plataform
        elif name == 'Preference':
            self.processPreference(attrs)
        elif name == 'Property':
            self.processProperty(attrs)
        elif name == 'Slot':
            self.processSlot(attrs)
        elif name == 'Event':
            self.processEvent(attrs)
        elif name == 'Capability':
            self.processCapability(attrs)
        elif name == 'GadgetContext':
            self.processGadgetContext(attrs)
        elif name == 'Context':
            self.processExternalContext(attrs)
        if name == 'XHTML':
            self.processXHTML(attrs)
        if name == 'Option':
            self.processOption(attrs)
        elif name == 'Platform.Rendering':
            self.processRendering(attrs)

        #Translation elements
        elif name == 'Translations':
            self.processTranslations(attrs)
        elif name == 'Translation':
            self.processTranslation(attrs)
        elif name == 'msg':
            self.reset_Accumulator()
            self.processMsg(attrs)

    def endElement(self, name):
        #add index to the translation list
        index = self.addIndex(self._accumulator)
        if index:
            self.addTranslation(index, self._gadget)

        if name == 'Catalog.ResourceDescription':
            self._gadgetURI = "/gadgets/" + self._gadgetVendor + "/" + self._gadgetName + "/" + self._gadgetVersion

        elif name == 'Name':
            if index:
                raise TemplateParseException(_("ERROR: The element Name cannot be translated"))
            self._gadgetName = self._accumulator

        elif name == 'Version':
            if index:
                raise TemplateParseException(_("ERROR: The element Version cannot be translated"))
            self._gadgetVersion = self._accumulator

        elif name == 'Vendor':
            if index:
                raise TemplateParseException(_("ERROR: The element Vendor cannot be translated"))
            self._gadgetVendor = self._accumulator

        elif name == 'DisplayName':
            self._gadgetDisplayName = self._accumulator

        elif name == 'Author':
            self._gadgetAuthor = self._accumulator

        elif name == 'ImageURI':
            self._gadgetImage = self._accumulator

        elif name == 'iPhoneImageURI':
            self._gadgetIPhoneImage = self._accumulator

        elif name == 'WikiURI':
            self._gadgetWiki = self._accumulator

        elif (name == 'Mail'):
            self._gadgetMail = self._accumulator

        elif (name == 'Description'):
            self._gadgetDesc = self._accumulator

        elif name == 'MenuColor':
            self._gadgetMenuColor = self._accumulator

        elif name == "Translation":
            if self.current_lang == self.default_lang:
                self.missing_translations = []

                for ind in self.translatable_list:
                    if not ind in self.translated_list:
                        self.missing_translations.append(ind)
                    else:
                        self.translated_list.remove(ind)

                if len(self.missing_translations) > 0:
                    raise TemplateParseException(_("ERROR: the following translation indexes need a default value: " + ', '.join(self.missing_translations)))

                if len(self.translated_list) > 0:
                    raise TemplateParseException(_("ERROR: the following translation indexes are not used: " + str(self.translated_list)))

        elif name == "msg":
            if not self.current_text in self.translatable_list:
                #message not used in the platform
                return

            if self.current_lang == self.default_lang:
                self.translated_list.append(self.current_text)

            # create the Translation (Gadget text) or add the language and value to the existing one (Variable or Option text)
            try:
                #existing Translation (VarDef or Option text)
                trans_list = self.translations[self.current_text]["trans"]
                if (type(trans_list) == type([])):
                    #use the first Translation to get the table
                    table_ = trans_list[0]["table"]
                else:
                    #get the datum and create the list
                    table_ = trans_list
                    self.translations[self.current_text]["trans"] = []
                trans = {"text_id": self.current_text, "table": table_, "language": self.current_lang,
                         "value": self._accumulator, "default": (self.current_lang == self.default_lang)}
            except:
                #the text isn't in the translations dictionary
                return
            self.translations[self.current_text]["trans"].append(trans)

    def characters(self, text):
        if (len(text) == 0):
            return

        if (text[0] == '\n' or text[0] == '\r' or text[0] == '\t'):
            return

        if (text == '    '):
            return

        self._accumulator += text

    def createTranslation(self, trans, id):
        t = Translation(element_id=id,
                        text_id=trans["text_id"],
                        table=trans["table"],
                        language=trans["language"],
                        value=trans["value"],
                        default=trans["default"])
        t.save()

    @transaction.commit_on_success
    def endDocument(self):
        emptyRequiredFields = []
        if self._gadgetName == "":
            emptyRequiredFields.append("name")

        if self._gadgetVendor == "":
            emptyRequiredFields.append("vendor")

        if self._gadgetVersion == "":
            emptyRequiredFields.append("version")

        if self._gadgetAuthor == "":
            emptyRequiredFields.append("author")

        if self._gadgetMail == "":
            emptyRequiredFields.append("mail")

        if self._gadgetDesc == "":
            emptyRequiredFields.append("description")

        if self._gadgetWiki == "":
            emptyRequiredFields.append("wiki")

        if self._gadgetImage == "":
            emptyRequiredFields.append("image")

        if self._xhtml == "":
            emptyRequiredFields.append("xhtml")

        if len(emptyRequiredFields) > 0:
            raise TemplateParseException(_("Missing required field(s): %(fields)s") % {'fields': unicode(emptyRequiredFields)})

        # Check the default translation
        if len(self.lang_list) > 0 and not self.default_lang in self.lang_list:
            raise TemplateParseException(_("ERROR: There isn't a Translation element with the default language (" + self.default_lang + ") translations"))

        # Save the new gadget
        self._gadget.uri = self._gadgetURI
        self._gadget.vendor = self._gadgetVendor
        self._gadget.name = self._gadgetName
        self._gadget.display_name = self._gadgetDisplayName
        self._gadget.version = self._gadgetVersion
        self._gadget.xhtml = self._xhtml
        self._gadget.author = self._gadgetAuthor
        self._gadget.mail = self._gadgetMail
        self._gadget.wikiURI = self._gadgetWiki
        self._gadget.imageURI = self._gadgetImage
        self._gadget.iPhoneImageURI = self._gadgetIPhoneImage
        self._gadget.width = self._gadgetWidth
        self._gadget.height = self._gadgetHeight
        self._gadget.description = self._gadgetDesc
        self._gadget.menuColor = self._gadgetMenuColor
        self._gadget.save()

        # All relationship must be saved now, when all its data are known
        for rel in self._relationships:
            rel['vdef'].gadget = self._gadget
            rel['vdef'].save()

            #save translations
            for ind in rel['trans']:
                if ind in self.translations:
                    for trans in self.translations[ind]["trans"]:
                        self.createTranslation(trans, rel['vdef'].id)
                    times = 1
                    if 'times' in self.translations[ind]:
                        times = self.translations[ind]["times"]
                    if times == 1:
                        del self.translations[ind]
                    else:
                        self.translations[ind]["times"] = times - 1

            if rel['context']:
                rel['context'].varDef = rel['vdef']
                rel['context'].save()

            for opt in rel['option']:
                opt["option"].variableDef = rel['vdef']
                opt["option"].save()
                if opt["index"] and opt['index'] in self.translations:
                    for trans in self.translations[opt["index"]]["trans"]:
                        self.createTranslation(trans, opt["option"].id)
                    times = 1
                    if 'times' in self.translations[opt["index"]]:
                        times = self.translations[opt["index"]]["times"]
                    if times == 1:
                        del self.translations[opt["index"]]
                    else:
                        self.translations[opt["index"]]["times"] = times - 1

        # All capabilities
        for cap in self._capabilities:
            cap.gadget = self._gadget
            cap.save()

        # Gadget translations
        for index in self.translations:
            for trans in self.translations[index]["trans"]:
                self.createTranslation(trans, self._gadget.id)

    def reset_Accumulator(self):
        self._accumulator = ""
