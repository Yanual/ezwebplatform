# -*- coding: utf-8 -*-
from os import path
from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource
from persistenceEngine.resource.views import addToPlatform


urlpatterns = patterns('',
    # Static content
    # (r'^site_media/(.*)$', 'ezweb.views.static.serve', {'document_root': path.expanduser('~/ezweb/media')}),
    (r'^ezweb/(.*)$', 'django.views.static.serve', {'document_root': path.join('opt', 'ezweb', 'src', 'js')}),

    (r'^ezweb_catalogue/(.*)$', 'django.views.static.serve', {'document_root': path.join('opt', 'catalogue', 'src')}),


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
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/catalogue/resource(s)?/',include('resource.urls')),
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/platform/$', addToPlatform),

    # Catalogue Tag
    (r'^user/(?P<user_name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/catalogue/tag(s)?/',include('tag.urls')),
    # Proxy
    (r'^proxy/', include('proxy.urls')),
   
    # Django contrib
    (r'^accounts/login/$', 'django.contrib.auth.views.login'),
    (r'^logout/$', 'django.contrib.auth.views.logout'),
    (r'^admin/', include('django.contrib.admin.urls')),

)
