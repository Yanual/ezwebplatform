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

from django.contrib.auth.models import User
from django.db.models import Q

from django_restapi.resource import Resource

from resource.models import GadgetResource

from commons.authentication import user_authentication
from commons.catalogue_utils import get_uniquelist, get_sortedlist, get_resource_response, get_paginatedlist

# This function returns a list of gadgets that match all the criteria in the list passed as parameter.
def get_and_list(criterialist):
    #List of the gadgets that match the criteria in the database table GadgetResource
    gadgetlist = []
    #List of the gadgets that match the criteria in the database table UserTag
    taglist = []
    result = []
    is_first_element = True

    criterialist = criterialist.split()
    # This loop gets a result list of the gadgets that match any of the criteria
    for e in criterialist:
        # Get a list of elements that match the given criteria
        gadgetlist = GadgetResource.objects.filter(Q(short_name__icontains = e) | Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        taglist = GadgetResource.objects.filter(usertag__tag__icontains = e)
        if taglist:
            gadgetlist = gadgetlist | taglist
        gadgetlist = get_uniquelist(gadgetlist)
        result.append(gadgetlist)
    # This loop gets the gadgets that match all the criteria
    for j in result:
        if is_first_element:
            gadgetlist = j
            is_first_element = False
        else:
            gadgetlist = get_uniquelist(gadgetlist+j, 2)
    return gadgetlist

# This function returns a list of gadgets that match any of the criteria in the list passed as parameter.
def get_or_list(criterialist):

    gadgetlist = []
    taglist = []
    criterialist = criterialist.split()

    for e in criterialist:
        # Get a list of elements that match the given value
        gadgetlist += GadgetResource.objects.filter(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        taglist += GadgetResource.objects.filter(usertag__tag__icontains = e)
    gadgetlist += taglist
    gadgetlist = get_uniquelist(gadgetlist)
    return gadgetlist

# This function returns a list of gadgets that don't match any of the criteria in the list passed as parameter.
def get_not_list(criterialist):

    gadgetlist = []
    taglist = []
    is_first_element = True
    criterialist = criterialist.split()

    for e in criterialist:
        # Get the list of elements that don't match the given criteria in the GadgetResource table
        if is_first_element:
            gadgetlist = GadgetResource.objects.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
            is_first_element = False
        else:
            gadgetlist = gadgetlist.exclude(Q(short_name__icontains = e) |  Q(vendor__icontains = e) | Q(author__icontains = e) | Q(mail__icontains = e) | Q(description__icontains = e) | Q(version__icontains = e))
        #Get the list of gadgets that match any of the criteria in the UserTag database table
        taglist += GadgetResource.objects.filter(usertag__tag__icontains = e)
    gadgetlist = list(gadgetlist)
    # Remove the gadgets in taglist of gadgetlist
    for b in taglist:
        if (b in gadgetlist):
            gadgetlist.remove(b)
    gadgetlist = get_uniquelist(gadgetlist)
    return gadgetlist

class GadgetsCollectionByGenericSearch(Resource):

    def read(self, request, user_name, and_criteria, or_criteria, not_criteria, pag=0, offset=0):

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
        # This variable counts the number of criteria for the search to be passed as a parameter to the function
        # get_uniquelist in order to get the gadgets that match the number of criteria
        fields = 0

        if (and_criteria != "_"):
            andlist = get_and_list(and_criteria)
            fields = fields+1
        if (or_criteria != "_"):
            orlist = get_or_list(or_criteria)
            fields = fields+1
        if (not_criteria != "_"):
            notlist = get_not_list(not_criteria)
            fields = fields+1

        gadgetlist = andlist+orlist+notlist
        gadgetlist = get_uniquelist(gadgetlist,fields)
        gadgetlist = get_sortedlist(gadgetlist, orderby)
        gadgetlist = get_paginatedlist(gadgetlist, pag, offset)
        items = len(gadgetlist)

        return get_resource_response(gadgetlist, format, items, user)


class GadgetsCollectionByCriteria(Resource):

    def read(self, request, user_name, criteria, criteria_value, pag=0, offset=0):

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
            #get all the gadgets that match any of the given events
            criteria_value = criteria_value.split()
            for e in criteria_value:
                gadgetlist += GadgetResource.objects.filter(Q(gadgetwiring__friendcode__icontains = e), Q(gadgetwiring__wiring = 'out'))

        elif criteria == 'slot':
            #get all the gadgets that match any of the given slots
            criteria_value = criteria_value.split()
            for e in criteria_value:
                gadgetlist += GadgetResource.objects.filter(Q(gadgetwiring__friendcode__icontains = e), Q(gadgetwiring__wiring = 'in'))

        elif criteria == 'tag':
            #get all the gadgets that match any of the given tags
            criteria_value = criteria_value.split()
            for e in criteria_value:
                gadgetlist += GadgetResource.objects.filter(usertag__tag__icontains = e)

        elif criteria == 'connectSlot':
            #get all the gadgets compatible with the given event
            gadgetlist = GadgetResource.objects.filter(Q(gadgetwiring__friendcode = criteria_value), Q(gadgetwiring__wiring = 'out'))

        elif criteria == 'connectEvent':
            get all the gadgets compatible with the given slot
            gadgetlist = GadgetResource.objects.filter(Q(gadgetwiring__friendcode = criteria_value), Q(gadgetwiring__wiring = 'in'))

        gadgetlist = get_uniquelist(gadgetlist)
        gadgetlist = get_sortedlist(gadgetlist, orderby)
        gadgetlist = get_paginatedlist(gadgetlist, pag, offset)
        items = len(gadgetlist)

        return get_resource_response(gadgetlist, format, items, user)
