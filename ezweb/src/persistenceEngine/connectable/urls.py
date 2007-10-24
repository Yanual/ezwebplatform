from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

urlpatterns = patterns('connectables.views',

    # Connectables
    (r'^(screen/(?P<screen_id>\d+)/)?$',
        WiringEntry(permitted_methods=('GET', ))),

)
