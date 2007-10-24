# -*- coding: utf-8 -*-
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
    (r'^user/(?P<user_id>\d+)/$', include('trial.urls')),
#    (r'^user/(?P<user_id>\d+)/', include('user.urls')),

    # Gadgets
    (r'^user/(?P<user_id>\d+)/gadget(s)?/', include('gadget.urls')),

    # IGadgets
    (r'^user/(?P<user_id>\d+)/igadget(s)?/', include('igadget.urls')),

    # Connectables
    (r'^user/(?P<user_id>\d+)/connectable(s)?/', include('connectable.urls')),

    # Django contrib
    (r'^logout/$', 'django.contrib.auth.views.logout'),
    (r'^admin/', include('django.contrib.admin.urls')),

)
