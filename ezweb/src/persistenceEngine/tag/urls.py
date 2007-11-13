from django.conf.urls.defaults import *
from persistenceEngine.tag.views import *

from django_restapi.model_resource import Collection
from django_restapi.responder import *

urlpatterns = patterns('tag.views',

    # Tags
    r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[\._-ÑñáéíóúÁÉÍÓÚ\w]+)/$', GadgetTagsCollection(permitted_methods=('GET','POST', ))),
)
