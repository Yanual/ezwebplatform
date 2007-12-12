from django.conf.urls.defaults import *
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django_restapi.resource import Resource

from connectable.views import *

urlpatterns = patterns('connectable.views',

    # Connectables
    (r'^$', ConnectableEntry(permitted_methods=('GET', 'POST'))),
    (r'^/(screen/(?P<screen_id>\d+))?$', ConnectableEntry(permitted_methods=('GET', 'POST'))),
    (r'^/(channel/(?P<name>\w+))?$', InOutEntry(permitted_methods=('DELETE'))),
    (r'^/channel?$', InOutCollection(permitted_methods=('DELETE'))),

)
