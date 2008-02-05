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

from django.core import serializers
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, get_list_or_404

from django_restapi.resource import Resource

from resource.models import GadgetResource
from resource.models import GadgetWiring
from tag.models import UserTag

from commons.authentication import user_authentication
from commons.catalogue_utils import get_uniquelist, get_resource_response
from commons.utils import get_xml_error


class GadgetsCollectionByGenericSearch(Resource):

    def __get_gadgetlist__(self, value):
        
	gadgetlist = []
        taglist = []

        for e in value:
            # Get a list of elements that matches the given value
            gadgetlist += GadgetResource.objects.filter(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
            taglist += UserTag.objects.filter(tag__icontains = e)

	for b in taglist:
	    gadgetlist += get_list_or_404(GadgetResource, id=b.idResource_id)

	return gadgetlist

    def read(self, request, user_name, value, criteria, pag=0, offset=0):

        user = user_authentication(user_name)

	gadgetlist = []

        value = value.split(' ')

	try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

        if criteria == 'and':
            gadgetlist = self.__get_gadgetlist__(value)
	    gadgetlist = get_uniquelist(gadgetlist, value) 

        elif criteria == 'or':
            gadgetlist = self.__get_gadgetlist__(value)        
            gadgetlist = get_uniquelist(gadgetlist)

        elif criteria == 'not':
	    count = 0
            for e in value:
                # Get a list of elements that doesn't match the given value
                if count == 0:
		    gadgetlist = GadgetResource.objects.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
	            count = count + 1                    
                else:
		    gadgetlist = gadgetlist.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
 
	    gadgetlist = get_uniquelist(gadgetlist)
        
	items = len(gadgetlist)
	#paginate
	a= int(pag)
	b= int(offset)
	if a != 0 and b != 0:
	    c=((a-1)*b)
	    d= (b*a)

	    if a==1:
	        c=0
            gadgetlist = gadgetlist[c:d]

	return get_resource_response(gadgetlist, format, items, user)


class GadgetsCollectionByCriteria(Resource):

    def read(self, request, user_name, criteria, value, pag=0, offset=0):

        user = user_authentication(user_name)

	criterialist = []
        gadgetlist = []

	try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

	if criteria == 'event':
	    value = value.split(' ')
            for e in value:
                criterialist += GadgetWiring.objects.filter(Q(friendcode__icontains = e), Q(wiring = 'out'))
            criterialist = get_uniquelist(criterialist)
	elif criteria == 'slot':
            value = value.split(' ')
	    for e in value:
                criterialist += GadgetWiring.objects.filter(Q(friendcode__icontains = e), Q(wiring = 'in'))
            criterialist = get_uniquelist(criterialist)

	elif criteria == 'tag':
            value = value.split(' ')
	    for e in value:
	        criterialist += UserTag.objects.filter(tag__icontains = e)
            criterialist = get_uniquelist(criterialist)

        elif criteria == 'connectSlot':
            #view compat out
            criterialist = GadgetWiring.objects.filter(Q(friendcode = value), Q(wiring = 'out'))

        elif criteria == 'connectEvent':
            #view compat out
            criterialist = GadgetWiring.objects.filter(Q(friendcode = value), Q(wiring = 'in'))

        for b in criterialist:
	    gadgetlist += get_list_or_404(GadgetResource, id=b.idResource_id)

        items = len(gadgetlist)
	#paginate
	a= int(pag)
	b= int(offset)
	if a != 0 and b != 0:
	    c=((a-1)*b)
	    d= (b*a)
	
	    if a==1:
	        c=0
            gadgetlist = gadgetlist[c:d]

        return get_resource_response(gadgetlist, format, items, user)
