# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2004 Telefónica Investigación y Desarrollo 
#     S.A.Unipersonal (Telefónica I+D) 
# 
# Info about members and contributors of the MORFEO project 
# is available at: 
# 
#   http://morfeo-project.org/
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version. 
# 
# This program is distributed in the hope that it will be useful, 
# but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details. 
# 
# You should have received a copy of the GNU General Public License 
# along with this program; if not, write to the Free Software 
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
# 
# If you want to use this software an plan to distribute a 
# proprietary application in any way, and you are not licensing and 
# distributing your source code under GPL, you probably need to 
# purchase a commercial license of the product.  More info about 
# licensing options is available at: 
# 
#   http://morfeo-project.org/
#

import sys
from urllib import urlopen, urlencode

from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db import transaction

from django.db import IntegrityError

from django_restapi.resource import Resource

from resource.models import GadgetResource
from resource.models import GadgetWiring
from resource.parser import TemplateParser
from tag.models import UserTag
from commons.catalogue_utils import get_xml_description, get_xml_error


class GadgetsCollection(Resource):

    @transaction.commit_manually
    def create(self,request, user_name):
	
        template_uri = request.__getitem__('template_uri')
        templateParser = None

	try:
            templateParser = TemplateParser(template_uri, user_name)

            templateParser.parse()
            transaction.commit()
        except IntegrityError, Exception:
            # Gadget already exists or internal error. Rollback transaction
            transaction.rollback()
	    return HttpResponseServerError(get_xml_error(str(sys.exc_info()[1])),mimetype='text/xml; charset=UTF-8')

	xml_ok = '<ResponseOK>OK</ResponseOK>'
        return HttpResponse(xml_ok,mimetype='text/xml; charset=UTF-8')


    def read(self,request, user_name, offset=0,pag=0):
		
        #paginate
	a= int(pag)
	b= int(offset)

        # Get the xml description for all the gadgets in the catalogue
	if a == 0 or b == 0:
	    response = get_xml_description(GadgetResource.objects.all())	
	# Get the xml description for the requested gadgets
	else:
	
	    c=((a-1)*b)
	    d= (b*a)
	
	    if a==1:
	        c=0
	
	    response = get_xml_description(GadgetResource.objects.all()[c:d])

		
	response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	<resources>'+response+'</resources>'
		
	return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

    
    def delete(self, request, user_name):

        vendor = request.__getitem__('vendor')
	name = request.__getitem__('name')
	version = request.__getitem__('version')
        resource=get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)
	
	# Delete the related wiring information for that gadget
	GadgetWiring.objects.filter(idResource=resource.id).delete()
	# Delete the related tags for that gadget
	UserTag.objects.filter(idResource=resource.id).delete()
	# Delete the object
	resource.delete()

        xml_ok = '<ResponseOK>OK</ResponseOK>'
	return HttpResponse(xml_ok,mimetype='text/xml; charset=UTF-8')


def addToPlatform(request, user_name):

    CONFIG='config.conf'
    
    cfg = ConfigParser.ConfigParser()
    try:
        cfg.readfp(file(CONFIG))
    except Exception, e:
        print "Error, couldn't read config  ", e.strerror
        return
     
    URL = cfg.get ('URL', 'URLeuropa'.lower())
    
    
    template_uri = request.__getitem__('template_uri')

    parameters = {
        'url': template_uri,
    }
	
    coreURL=URL
    uri='/user/'+user_name+'/gadgets'
    url=coreURL+uri

    response = urlopen(url, urlencode(parameters)).read()
	
    return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

