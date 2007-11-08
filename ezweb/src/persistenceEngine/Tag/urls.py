from django.conf.urls.defaults import *
from catalogue.Tag.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('Tag.views',

    # Tags
    (r'^(?P<vendor>\w+)/(?P<name>\w+)/(?P<version>\w+)/$', 
	GadgetTagsCollection(permitted_methods=('GET','POST', ))),
   
)
