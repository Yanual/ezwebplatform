from xml.sax import saxutils
from xml.sax import make_parser

from persistenceEngine.tag.models import userTag


def get_tags_by_resource(gadget_id):

		
    xml_tag=''
		
    for e in userTag.objects.filter(idResource=gadget_id):
        xml_tag +='<Tag>\n\
        <Value>'+e.tag+'</Value>\n\
        </Tag>'
			
    response='<Tags>'+xml_tag+'</Tags>'
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
