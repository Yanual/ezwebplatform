# -*- coding: utf-8 -*-
from django.conf.urls.defaults import *
from django_restapi.model_resource import Collection
from django_restapi.responder import *

from igadget.views import *

urlpatterns = patterns('igadget.views',

    # IGadgets
    (r'^$', IGadgetCollection(permitted_methods=('GET', 'POST'))),
    (r'^/((?P<igadget_id>\d+))?$',
	    IGadgetEntry(permitted_methods=('GET', 'POST', 'DELETE'))),
    (r'^/((?P<igadget_id>\d+)/variables)?$',
        IGadgetVariableCollection(permitted_methods=('GET', ))),
    (r'^/((?P<igadget_id>\d+)/variables/(?P<var_name>[-ÑñáéíóúÁÉÍÓÚ\w]+))?$',
        IGadgetVariable(permitted_methods=('GET', 'POST', 'UPDATE'))),

)
