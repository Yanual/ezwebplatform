from xml.sax import saxutils
from xml.sax import make_parser

from persistenceEngine.tag.models import userTag
from persistenceEngine.resource.models import gadgetResource
from persistenceEngine.tag.utils import get_tags_by_resource

def get_xml_description(gadgetlist):

    xml_resource = ''
    xml_tag = ''
    response = '' 
    for e in gadgetlist:

        xml_tag = get_tags_by_resource(e.id)
	  				
	xml_resource +='<Resource>\n\
        <Vendor>'+e.vendor+'</Vendor>\n\
        <Name>'+e.short_name+'</Name>\n\
	<Version>'+e.version+'</Version>\n\
	<Author>'+e.author+'</Author>\n\
	<Mail>'+e.mail+'</Mail>\n\
    	<Description>'+e.description+'</Description>\n\
    	<ImageURI>'+e.image_uri+'</ImageURI>\n\
    	<WikiURI>'+e.wiki_page_uri+'</WikiURI>\n\
	<TemplateURI>'+e.template_uri+'</TemplateURI>\n\
	'+xml_tag+'\n\
   	</Resource>'
		
    response = xml_resource
    return response
