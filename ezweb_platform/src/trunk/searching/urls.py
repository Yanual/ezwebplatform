from django.conf.urls.defaults import *
from searching.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('searching.views',
    
    # Search Gadgets
    (r'^generic/(?P<value>\w+)$', GadgetsCollectionByGenericSearch(permitted_methods=('GET', ))),
    (r'^(?P<criteria>\w+)/(?P<value>[\@_\._\w]+)$', GadgetsCollectionByCriteria(permitted_methods=('GET', ))),
    #(r'^advanced$', GadgetsCollectionByCriteria(permitted_methods=('GET', ))),
    
 )
