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

from django.conf.urls.defaults import *
from django_restapi.model_resource import Collection
from django_restapi.responder import *

from workspace.views import *

urlpatterns = patterns('workspace.views',

    # WorkSpace
    (r'^[/]?$', WorkSpaceCollection(permitted_methods=('GET','POST', ))),
    (r'^/((?P<workspace_id>[-ÑñáéíóúÁÉÍÓÚ\w]+)[/]?)?$',
	    WorkSpaceEntry(permitted_methods=('GET', 'POST', 'PUT', 'DELETE',))),
    # Tab
    (r'^/((?P<workspace_id>\d+)/tab(s)?[/]?)?$',
        TabCollection(permitted_methods=('GET', 'POST',))),
    (r'^/((?P<workspace_id>\d+)/tab(s)?/(?P<tab_id>[-ÑñáéíóúÁÉÍÓÚ\w]+)[/]?)?$',
        TabEntry(permitted_methods=('GET', 'PUT', 'POST', 'DELETE',))),
)