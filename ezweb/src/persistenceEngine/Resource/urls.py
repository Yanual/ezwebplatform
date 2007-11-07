from django.conf.urls.defaults import *
from persistenceEngine.Resource.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('Resource.views',

    # Gadgets
    (r'^(?P<offset>\d+)/(?P<pag>\d+)/$', CatalogueResource(permitted_methods=('GET', ))),
    (r'^', CatalogueResource(permitted_methods=('POST', ))),
   
)
