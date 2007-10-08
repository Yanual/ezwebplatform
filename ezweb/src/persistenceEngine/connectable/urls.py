from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

urlpatterns = patterns('connectables.views',

    # Connectables
    (r'^$', 'connectables.get_list'),
    (r'^in/(?P<id>\d+)/$', 'connectables.get_in'),
    (r'^inout/(?P<id>\d+)/$', 'connectables.resource_inout'),

)
