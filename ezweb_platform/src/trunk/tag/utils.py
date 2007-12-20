from xml.sax import saxutils
from xml.sax import make_parser

from tag.models import UserTag

def get_tags_by_resource(gadget_id, user_id):
		
    xml_tag=''
		
    for e in UserTag.objects.filter(idResource=gadget_id, idUser=user_id):
        xml_tag +='<Tag>\n\
        <Value>'+e.tag+'</Value>\n\
	<Added_by>Yes</Added_by>\n\
        </Tag>'
   
    for e in UserTag.objects.filter(idResource=gadget_id).exclude(idUser=user_id):
        xml_tag +='<Tag>\n\
        <Value>'+e.tag+'</Value>\n\
	<Added_by>No</Added_by>\n\
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
