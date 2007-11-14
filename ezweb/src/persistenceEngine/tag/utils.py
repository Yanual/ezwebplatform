from xml.sax import saxutils
from xml.sax import make_parser

from persistenceEngine.tag.models import UserTag


def get_tags_by_resource(gadget_id):

		
    xml_tag=''
		
    for e in UserTag.objects.filter(idResource=gadget_id):
        xml_tag +='<tag>'+e.tag+'</tag>\n'
        			
    response='<tags>'+xml_tag+'</tags>'
    return response


class TagsXMLHandler(saxutils.handler.ContentHandler): 
	
    _tags = []

    def resetTags(self):
        self._tags = []


    def characters(self, text):
	self._tags.append(text)

    def startElement(self, name, attrs):
	if (name == 'Tags'):
	    self.resetTags()
	    return
