from xml.sax import saxutils
from xml.sax import make_parser
from StringIO import StringIO

from persistenceEngine.tag.models import userTag
from persistenceEngine.resource.models import gadgetResource
from persistenceEngine.tag.utils import get_tags_by_resource

def get_xml_description(gadgetlist):
	xml_resource = ''
  xml_tag = ''
  response = '' 
    
    for e in gadgetlist:
    	xml_tag = get_tags_by_resource(e.id)
		  xml_resource ='<Resource><Vendor>'+e.vendor+'</Vendor><Name>'+e.short_name+'</Name><Version>'+e.version+'</Version><Author>'+e.author+'</Author>'+xml_tag+'</Resource>'

	response = xml_resource
  return response
