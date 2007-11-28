# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from django_restapi.model_resource import Collection
from django_restapi.responder import *

from igadget.views import *

urlpatterns = patterns('igadget.views',

    # IGadgets
    (r'^$', IGadgetCollection(permitted_methods=('GET', 'POST'))),
    (r'^(?P<vendor>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<name>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(?P<version>[-ÑñáéíóúÁÉÍÓÚ\w]+)/(screen/(?P<screen_id>\d+)/)?$',
        IGadgetEntry(permitted_methods=('GET', 'POST', 'DELETE'))),

)
