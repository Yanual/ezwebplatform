"""
/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */
"""

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
