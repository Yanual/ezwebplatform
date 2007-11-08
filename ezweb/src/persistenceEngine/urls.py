﻿# -*- coding: utf-8 -*-
from os import path
from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

urlpatterns = patterns('',
    # Static content
    # (r'^site_media/(.*)$', 'ezweb.views.static.serve', {'document_root': path.expanduser('~/ezweb/media')}),
    (r'^ezweb/(.*)$', 'django.views.static.serve', {'document_root': path.join('opt', 'ezweb', 'src', 'js')}),

    # EzWeb
    (r'^$', include('trial.urls')),
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/$', include('trial.urls')),

    # Gadgets
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/gadget(s)?/', include('gadget.urls')),

    # IGadgets
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/igadget(s)?/', include('igadget.urls')),

    # Connectables
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/connectable(s)?/', include('connectable.urls')),
    
    # Catalogue Resource
    (r'^catalogue/user/(?P<user_id>\w+)/resource(s)?/',include('Resource.urls')),

    # Catalogue Tag
    (r'^catalogue/user/(?P<user_id>\w+)/tag(s)?/',include('Tag.urls')),
    
   
    # Django contrib
    (r'^accounts/login/$', 'django.contrib.auth.views.login'),
    (r'^logout/$', 'django.contrib.auth.views.logout'),
    (r'^admin/', include('django.contrib.admin.urls')),

)
