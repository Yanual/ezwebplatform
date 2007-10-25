from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

from connectable.views import *

urlpatterns = patterns('connectables.views',

    # Connectables
    (r'^(screen/(?P<screen_id>\d+)/)?$',
        ConnectableEntry(permitted_methods=('GET', ))),

)
