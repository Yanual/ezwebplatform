from xml.sax import saxutils
from xml.sax import make_parser

from tag.models import UserTag
from resource.models import GadgetResource
from resource.models import GadgetWiring
from tag.utils import get_tags_by_resource


def get_xml_description(gadgetlist):

    xml_resource = ''
    xml_tag=''
    xml_event=''
    xml_slot=''

    for e in gadgetlist:

        xml_tag = get_tags_by_resource(e.id,e.added_by_user)
	xml_event = get_events_by_resource(e.id)
	xml_slot = get_slots_by_resource(e.id)
	  				
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
	'+xml_event+'\n\
	'+xml_slot+'\n\
   	</resource>'
		
    response = xml_resource
    return response


def get_events_by_resource(gadget_id):

    xml_tag=''	
    xml_event=''
		
    for e in GadgetWiring.objects.filter(idResource=gadget_id, wiring='out'):
        xml_tag +='<Event>\n\
        <FriendCode>'+e.friendcode+'</FriendCode>\n\
	</Event>'

    response='<Events>'+xml_event+'</Events>'
    return response


def get_slots_by_resource(gadget_id):

		
    xml_slot=''
		
    for e in GadgetWiring.objects.filter(idResource=gadget_id, wiring='in'):
        xml_slot +='<Slot>\n\
        <FriendCode>'+e.friendcode+'</FriendCode>\n\
	</Slot>'
   
    response='<Slots>'+xml_slot+'</Slots>'
    return response