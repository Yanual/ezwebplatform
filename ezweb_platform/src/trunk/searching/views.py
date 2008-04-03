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
from commons.catalogue_utils import get_uniquelist, get_sortedlist, get_resource_response
from commons.utils import get_xml_error

def get_and_list(value):

    gadgetlist = []
    taglist = []
    result = []
    value = value.split()

    for e in value:
        # Get a list of elements that match the given value
        gadgetlist = GadgetResource.objects.filter(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        taglist = GadgetResource.objects.filter(usertag__tag__icontains = e)
        if taglist:
            gadgetlist = gadgetlist | taglist
	gadgetlist = get_uniquelist(gadgetlist)
	result.append(gadgetlist)
    if len(result)>1:
        for j, k in result, result:
            gadgetlist = get_uniquelist(j + k,2)
    return gadgetlist

def get_or_list(value):

    gadgetlist = []
    taglist = []
    value = value.split()

    for e in value:
        # Get a list of elements that matches the given value
        gadgetlist += GadgetResource.objects.filter(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        taglist += GadgetResource.objects.filter(usertag__tag__icontains = e)
    gadgetlist += taglist
    gadgetlist = get_uniquelist(gadgetlist)
    return gadgetlist

def get_not_list(value):

    gadgetlist = []
    taglist = []
    count = 0
    value = value.split()

    for e in value:
        # Get a list of elements that doesn't match the given value
        if count == 0:
            gadgetlist = GadgetResource.objects.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
            count = count + 1
        else:
            gadgetlist = gadgetlist.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        taglist += GadgetResource.objects.filter(usertag__tag__icontains = e)
    gadgetlist = list(gadgetlist)
    for b in taglist:
        if (b in gadgetlist):
            gadgetlist.remove(b)
    gadgetlist = get_uniquelist(gadgetlist)
    return gadgetlist

class GadgetsCollectionByGenericSearch(Resource):

    def read(self, request, user_name, value1, value2, value3, pag=0, offset=0):

        user = user_authentication(request, user_name)

        try:
            orderby = request.__getitem__('orderby')
        except:
            orderby = '-creation_date'

        try:
            format = request.__getitem__('format')
        except:
            format = 'default'
	
	andlist = []
	orlist = []
	notlist = []
	fields = 0

	if (value1 != " "):
            andlist = get_and_list(value1)
	    fields = fields+1
	if (value2 != " "):
            orlist = get_or_list(value2)
	    fields = fields+1
	if (value3 != " "):
            notlist = get_not_list(value3)
	    fields = fields+1

        gadgetlist = andlist+orlist+notlist
	gadgetlist = get_uniquelist(gadgetlist,fields)
        gadgetlist = get_sortedlist(gadgetlist, orderby)	
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

        user = user_authentication(request, user_name)

        try:
            format = request.__getitem__('format')
        except:
            format = 'default'

        try:
            orderby = request.__getitem__('orderby')
        except:
            orderby = '-creation_date'

        gadgetlist = []

        if criteria == 'event':
            value = value.split()
            for e in value:
                gadgetlist += GadgetResource.objects.filter(Q(gadgetwiring__friendcode__icontains = e), Q(gadgetwiring__wiring = 'out'))

        elif criteria == 'slot':
            value = value.split()
            for e in value:
                gadgetlist += GadgetResource.objects.filter(Q(gadgetwiring__friendcode__icontains = e), Q(gadgetwiring__wiring = 'in'))

        elif criteria == 'tag':
            value = value.split()
            for e in value:
                gadgetlist += GadgetResource.objects.filter(usertag__tag__icontains = e)

        elif criteria == 'connectSlot':
            #view compat out
            gadgetlist = GadgetResource.objects.filter(Q(gadgetwiring__friendcode = value), Q(gadgetwiring__wiring = 'out'))

        elif criteria == 'connectEvent':
            #view compat out
            gadgetlist = GadgetResource.objects.filter(Q(gadgetwiring__friendcode = value), Q(gadgetwiring__wiring = 'in'))

        gadgetlist = get_uniquelist(gadgetlist)
	gadgetlist = get_sortedlist(gadgetlist, orderby)
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
