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


﻿# -*- coding: utf-8 -*-
from os import path
from django.conf.urls.defaults import *
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response

from django_restapi.resource import Resource

from resource.views import addToPlatform


urlpatterns = patterns('',
    # Static content
     (r'^ezweb/(.*)$', 'django.views.static.serve', {'document_root': path.join(settings.BASEDIR, 'media')}),

    # EzWeb
    (r'^', include('ezweb.urls')),
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/$', include('ezweb.urls')),
    (r'^trial/', include('trial.urls')),

    # Gadgets
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/gadget(s)?', include('gadget.urls')),

    # IGadgets
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/igadget(s)?', include('igadget.urls')),

    # Connectables
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/connectable(s)?', include('connectable.urls')),
    
    # Catalogue Resource
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/catalogue/resource(s)?',include('resource.urls')),
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/platform/$', addToPlatform),

    # Catalogue Tag
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/catalogue/tag(s)?/',include('tag.urls')),
    
    # Catalogue Search
    (r'^user/(?P<user_name>\w+)/catalogue/search/',include('searching.urls')),
    
    # Proxy
    (r'^proxy', include('proxy.urls')),
   
    # Django contrib
    (r'^accounts/login$', 'django.contrib.auth.views.login'),
    (r'^logout$', 'django.contrib.auth.views.logout'),
    (r'^admin/', include('django.contrib.admin.urls')),

)
