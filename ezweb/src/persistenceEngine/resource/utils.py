from xml.sax import saxutils
from xml.sax import make_parser

from persistenceEngine.tag.models import UserTag
from persistenceEngine.tag.utils import get_tags_by_resource
from persistenceEngine.resource.models import GadgetResource


def get_xml_description(gadgetlist):

    xml_resource = ''
    xml_tag=''
    for e in gadgetlist:

        xml_tag = get_tags_by_resource(e.id)
	  				
	xml_resource += '<Resource>\n\
        <Vendor>'+str(e.vendor)+'</Vendor>\n\
        <Name>'+str(e.short_name)+'</Name>\n\
	<Version>'+str(e.version)+'</Version>\n\
	<Author>'+str(e.author)+'</Author>\n\
	<Mail>'+str(e.mail)+'</Mail>\n\
    	<Description>'+str(e.description)+'</Description>\n\
    	<ImageURI>'+str(e.image_uri)+'</ImageURI>\n\
    	<WikiURI>'+str(e.wiki_page_uri)+'</WikiURI>\n\
	<TemplateURI>'+str(e.template_uri)+'</TemplateURI>\n\
	'+xml_tag+'\n\
   	</Resource>'
		
    response = xml_resource
    return response
