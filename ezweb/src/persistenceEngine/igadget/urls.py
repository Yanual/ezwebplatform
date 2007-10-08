from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

urlpatterns = patterns('igadget.views',

    # IGadgets
    (r'^$', 'igadget.get_list'),
    (r'^(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/$', 'igadgets.get_igadget'),
    (r'^(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/var/(?P<variable>\d+)/$', 'igadgets.get_variable'),
    (r'^(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/var/(?P<variable>\d+)/edit/$', 'igadgets.edit_variable'),

)
