from django.conf.urls.defaults import *
from proxy.views import *

from django_restapi.resource import Resource
from django_restapi.responder import *

urlpatterns = patterns('proxy.views',

    # Proxy
    (r'^$', Proxy(permitted_methods=('POST', ))),
)

