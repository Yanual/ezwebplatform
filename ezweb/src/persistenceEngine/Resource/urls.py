from django.conf.urls.defaults import *
from catalogue.Resource.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('Resource.views',

    # Gadgets
    (r'^(?P<offset>\d+)/(?P<pag>\d+)/$', GadgetsCollection(permitted_methods=('GET', ))),
    (r'^', GadgetsCollection(permitted_methods=('POST', ))),
   
)
