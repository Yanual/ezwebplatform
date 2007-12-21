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
