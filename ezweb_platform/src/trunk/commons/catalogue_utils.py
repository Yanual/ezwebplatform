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

from django.core import serializers
from django.http import HttpResponse, HttpResponseServerError

from commons.utils import json_encode
from commons.get_json_catalogue_data import get_gadgetresource_data, get_tag_data
from commons.get_xml_catalogue_data import get_xml_description, get_tags_by_resource

from django.utils.translation import gettext_lazy as _
from django.utils.translation import string_concat

def get_uniquelist(list, value = None):

    uniquelist = []

    if value==None or len(value) == 1:
        [uniquelist.append(x) for x in list if x not in uniquelist]
    else:
        for x in list:
            if x not in uniquelist and list.count(x) >= len(value):
                uniquelist.append(x)

    return uniquelist


def get_xml_error(value):

    xml_error = string_concat(['<error>', _(value), '</error>'])
    return xml_error


def get_resource_response(gadgetlist, format):

    if format == 'json' or format=='default':
        gadgetresource = {}
        resource_data = serializers.serialize('python', gadgetlist, ensure_ascii=False)
        resource_data_list = [get_gadgetresource_data(d) for d in resource_data]
        gadgetresource['resourceList'] = resource_data_list
        response = HttpResponse(json_encode(gadgetresource), mimetype='application/json; charset=UTF-8')
        response.__setitem__('pages', 20)
        return response
    elif format == 'xml':
        response = get_xml_description(gadgetlist)
        return HttpResponse(response,mimetype='text/xml; charset=UTF-8')
    else:
        return HttpResponseServerError("<error>Invalid format. Format must be either xml or json</error>", mimetype='text/xml; charset=UTF-8')



def get_tag_response(gadget, user, format):

    if format == 'json'or format == 'default':
        tag = {}
        tag_data_list = get_tag_data(gadget, user.id)
        tag['tagList'] = tag_data_list
        return HttpResponse(json_encode(tag), mimetype='application/json; charset=UTF-8')
    elif format == 'xml':
        response = '<?xml version="1.0" encoding="UTF-8" ?>\n'
        response += get_tags_by_resource(gadget, user)
        return HttpResponse(response,mimetype='text/xml; charset=UTF-8')
    else:
        return HttpResponseServerError("<error>Invalid format. Format must be either xml or json</error>", mimetype='text/xml; charset=UTF-8')
