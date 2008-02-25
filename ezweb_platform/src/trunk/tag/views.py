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

from django.db import IntegrityError

from django.http import HttpResponse, HttpResponseServerError, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User 
from django_restapi.resource import Resource
from django.utils.translation import ugettext as _

from xml.sax import make_parser
from xml.sax.xmlreader import InputSource

from tag.models import UserTag
from tag.parser import TagsXMLHandler
from resource.models import GadgetResource

from commons.authentication import *
from commons.catalogue_utils import get_tag_response
from commons.logs import log
from commons.utils import get_xml_error


class GadgetTagsCollection(Resource):

    def create(self,request, user_name, vendor, name, version):

	try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

        user = user_authentication(request, user_name)

        # Get the xml containing the tags from the request
        tags_xml = request.__getitem__('tags_xml')

        # Parse the xml containing the tags
	parser = make_parser()
	handler = TagsXMLHandler()

	# Tell the parser to use our handler
	parser.setContentHandler(handler)
		
	# Parse the input
	try:
            from StringIO import StringIO
        except ImportError:
	    from cStringIO import StringIO
	inpsrc = InputSource()
        inpsrc.setByteStream(StringIO(tags_xml))
        parser.parse(inpsrc)
	
        # Get the gadget's id for those vendor, name and version
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)
	
	# Insert the tags for these resource and user in the database
	for e in handler._tags:
	    try:
	        UserTag.objects.get_or_create(tag=e, idUser=user, idResource=gadget)
	    except Exception, ex:
	        log (ex, request)
	        return HttpResponseServerError(get_xml_error(unicode(ex)), mimetype='application/xml; charset=UTF-8')

        return get_tag_response(gadget,user, format)

	
    def read(self,request,user_name,vendor,name,version):

        try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

	# Get the gadget's id for those vendor, name and version
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version).id

	# Get the user's id for that user_name
	user = user_authentication(request, user_name)

	return get_tag_response(gadget,user, format)


    def delete(self,request,user_name,vendor,name,version, tag):

        try:
            user = user_authentication(request, user_name)
	except Http403, e:
            msg = _("This tag cannot be deleted: ") + unicode(e)
            log (msg, request)
            return HttpResponseForbidden(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')

        try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'
  
        
	#value_tag = request.__getitem__('value_tag')
        value_tag = tag
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version).id
        tag = get_object_or_404(UserTag, idUser=user, idResource=gadget, tag=value_tag)

        tag.delete()

        return get_tag_response(gadget,user, format)
