from django.conf.urls.defaults import *
from persistenceEngine.tag.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('tag.views',

    # Tags
    (r'^(?P<vendor>\d+)/(?P<name>\d+)/(?P<version>\d+)/$', GadgetTagsCollection(permitted_methods=('GET','POST', ))),
)
