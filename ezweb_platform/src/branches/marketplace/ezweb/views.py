# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

from django.conf import settings


@login_required
def index(request, user_name=None, template="index.html"):
    """ Vista principal """

    if request.META['HTTP_USER_AGENT'].find("iPhone") >= 0 or request.META['HTTP_USER_AGENT'].find("iPod") >= 0:
        return render_to_response('iphone.html', {},
                  context_instance=RequestContext(request))
    else:
        return render_to_response(template, {'current_tab': 'dragboard'},
                  context_instance=RequestContext(request))

def restful_tools(request, user_name=None, template="RESTfulTools.xhtml"):
    """ Vista principal """

    if request.META['HTTP_USER_AGENT'].find("iPhone") >= 0 or request.META['HTTP_USER_AGENT'].find("iPod") >= 0:
        return render_to_response('iphone.html', {},
                  context_instance=RequestContext(request))
    else:
        return render_to_response(template, {'current_tab': 'dragboard'},
                  context_instance=RequestContext(request))

@login_required
def wiring(request, user_name=None):
    """ Vista del Wiring """
    return render_to_response('wiring.html', {}, context_instance=RequestContext(request))

@login_required
def index_lite(request, user_name=None):
    """ Vista de ezweb sin cabecera"""
    return index(request, template="index_lite.html")
