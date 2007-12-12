from xml.sax import saxutils
from xml.sax import make_parser

from tag.models import UserTag
from tag.utils import get_tags_by_resource
from resource.models import GadgetResource


def get_xml_description(gadgetlist):

    xml_resource = ''
    xml_tag=''
    for e in gadgetlist:

        xml_tag = get_tags_by_resource(e.id)
	  				
	xml_resource += '<resource>\n\
        <vendor>'+unicode(e.vendor)+'</vendor>\n\
        <name>'+unicode(e.short_name)+'</name>\n\
	<version>'+unicode(e.version)+'</version>\n\
	<Author>'+unicode(e.author)+'</Author>\n\
	<Mail>'+unicode(e.mail)+'</Mail>\n\
    	<description>'+unicode(e.description)+'</description>\n\
    	<uriImage>'+unicode(e.image_uri)+'</uriImage>\n\
    	<uriWiki>'+unicode(e.wiki_page_uri)+'</uriWiki>\n\
	<uriTemplate>'+unicode(e.template_uri)+'</uriTemplate>\n\
	'+xml_tag+'\n\
   	</resource>'
		
    response = xml_resource
    return response
