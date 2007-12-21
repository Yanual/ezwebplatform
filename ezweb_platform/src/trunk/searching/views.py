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


import sys

from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, get_list_or_404

from django_restapi.resource import Resource

from resource.models import GadgetResource
from resource.models import GadgetWiring
from tag.models import UserTag
from resource.utils import get_xml_description


class GadgetsCollectionByGenericSearch(Resource):

    def read(self, request, user_name, value):
	
        # Get the list of elements that fits the value given
        
        gadgetlist = list(GadgetResource.objects.search(value))

	searchlist = list(GadgetWiring.objects.search(value))
	searchlist = searchlist + list(UserTag.objects.search(value))
	
	for b in searchlist:
        
	    gadgetlist = gadgetlist + get_list_or_404(GadgetResource, id=b.idResource_id)

	ulist = []
        [ulist.append(x) for x in gadgetlist if x not in ulist]

	response = get_xml_description(ulist)
	response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	<resources>'+response+'</resources>'

        return HttpResponse(response,mimetype='text/xml; charset=UTF-8')


class GadgetsCollectionByCriteria(Resource):

    def read(self, request, user_name, criteria, value):
	
        if criteria == 'event' or criteria == 'slot' or criteria == 'tag':        
            if criteria == 'event':
	        criterialist = get_list_or_404(GadgetWiring,friendcode=value,wiring='in')
	    elif criteria == 'slot':
                criterialist = get_list_or_404(GadgetWiring,friendcode=value,wiring='out')
	    elif criteria == 'tag':
	        criterialist = get_list_or_404(UserTag,tag=value)

        
	    response=''

	    for b in criterialist:
        
	        gadgetlist = get_list_or_404(GadgetResource, id=b.idResource_id)
	    
	        temp = get_xml_description(gadgetlist)
	        response = response+temp

	    response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	    <resources>'+response+'</resources>'

            return HttpResponse(response,mimetype='text/xml; charset=UTF-8')
        
        else:
            if criteria == 'author':
                criterialist=get_list_or_404(GadgetResource, author=value)
            elif criteria == 'short_name':
                criterialist=get_list_or_404(GadgetResource, short_name=value)
            elif criteria == 'vendor':
                criterialist=get_list_or_404(GadgetResource, vendor=value)
            elif criteria == 'version':
                criterialist=get_list_or_404(GadgetResource, version=value)
            elif criteria == 'mail':
                criterialist=get_list_or_404(GadgetResource, mail=value)
            elif criteria == 'license':
                criterialist=get_list_or_404(GadgetResource, license=value)
            elif criteria == 'description':
                criterialist=get_list_or_404(GadgetResource, description=value)
            else:
                xml_error = '<fault>\n\
	        <value>'+'Error'+'</value>\n\
	        <description>'+'criterio '+criteria+' no correcto'+'</description>\n\
	        </fault>'
	        #+sys.exc_info()[2]'+</description></fault>'
	        return HttpResponseServerError(xml_error,mimetype='text/xml; charset=UTF-8')
                
            
            response=''
            
	    temp = get_xml_description(criterialist)
	    response = response+temp
	    response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	    <resources>'+response+'</resources>'
            return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

