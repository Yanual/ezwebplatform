from django.conf.urls.defaults import *
from resource.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('resource.views',

    # Gadgets

    (r'^/(?P<tag>\w+)[/]?$', TagGadgetsCollection(permitted_methods=('GET', ))),
    (r'^/(?P<offset>\d+)/(?P<pag>\d+)[/]?$', GadgetsCollection(permitted_methods=('GET', ))),
    (r'^[/]?$', GadgetsCollection(permitted_methods=('POST', 'GET'))),
   
)
