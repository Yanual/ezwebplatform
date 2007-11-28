# -*- coding: utf-8 -*-
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
