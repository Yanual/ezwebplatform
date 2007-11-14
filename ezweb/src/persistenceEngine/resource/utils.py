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
	  				
	xml_resource += '<resource>\n\
        <vendor>'+str(e.vendor)+'</vendor>\n\
        <name>'+str(e.short_name)+'</name>\n\
	<version>'+str(e.version)+'</version>\n\
	<Author>'+str(e.author)+'</Author>\n\
	<Mail>'+str(e.mail)+'</Mail>\n\
    	<description>'+str(e.description)+'</description>\n\
    	<uriImage>'+str(e.image_uri)+'</uriImage>\n\
    	<uriWiki>'+str(e.wiki_page_uri)+'</uriWiki>\n\
	<uriTemplate>'+str(e.template_uri)+'</uriTemplate>\n\
	'+xml_tag+'\n\
   	</resource>'
		
    response = xml_resource
    return response
