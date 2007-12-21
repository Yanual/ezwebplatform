from django.conf.urls.defaults import *
from tag.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('tag.views',

    # Tags
    (r'^(?P<vendor>\w+)/(?P<name>\w+)/(?P<version>[\._\w]+)$', 
        GadgetTagsCollection(permitted_methods=('GET','POST','DELETE', ))),
)
