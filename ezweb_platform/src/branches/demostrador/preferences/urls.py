# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2008 Telefónica Investigación y Desarrollo 
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

# @author jmostazo-upm

from django.conf.urls.defaults import patterns

from preferences.views import PlatformPreferencesCollection, WorkSpacePreferencesCollection, TabPreferencesCollection

urlpatterns = patterns('preferences.views',

    # Platform preferences
    (r'^/platform[/]?$',
         PlatformPreferencesCollection(permitted_methods=('GET', 'PUT'))),

    # WorkSpace preferences
    (r'^/workspace/(?P<workspace_id>\d+)[/]?$',
         WorkSpacePreferencesCollection(permitted_methods=('GET', 'PUT'))),

    # Tab preferences
    (r'^/tab/(?P<workspace_id>\d+)/(?P<tab_id>\d+)[/]?$',
         TabPreferencesCollection(permitted_methods=('GET', 'PUT'))),
)
