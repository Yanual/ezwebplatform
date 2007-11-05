# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from django_restapi.model_resource import Collection
from django_restapi.responder import *

from gadget.views import *

urlpatterns = patterns('gadget.views',

    # Gadgets
    (r'^$', GadgetCollection(permitted_methods=('GET', 'POST'))),
    (r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[-ÑñáéíóúÁÉÍÓÚ\w]+)/$',
        GadgetEntry(permitted_methods=('GET', 'DELETE', 'PUT'))),
    (r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[-ÑñáéíóúÁÉÍÓÚ\w]+)/template/$',
        GadgetTemplateEntry(permitted_methods=('GET', ))),
    (r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[-ÑñáéíóúÁÉÍÓÚ\w]+)/xhtml/$',
        GadgetCodeEntry(permitted_methods=('GET', ))),
    (r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[-ÑñáéíóúÁÉÍÓÚ\w]+)/tags/$',
        GadgetTagsEntry(permitted_methods=('GET', ))),
   
)
