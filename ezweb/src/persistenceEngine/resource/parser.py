from urllib import urlopen
from xml.sax import saxutils
from xml.sax import make_parser

class TemplateHandler(saxutils.handler.ContentHandler): 
	
    _accumulator = []
	
    def resetAccumulator(self):
        self._accumulator = []
	
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

    def characters(self, text):
	self._accumulator.append(text)

    def startElement(self, name, attrs):
	if (name == 'Name') or (name=='Version') or (name=='Vendor') or (name=='Author') or (name=='Description') or (name=='Mail') or (name=='ImageURI') or (name=='WikiURI'):
	    self.resetAccumulator()
	    return