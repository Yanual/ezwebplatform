# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

from django.conf import settings


@login_required
def index(request, user_name=None):
    """ Vista principal """
    return render_to_response('index.html', {'current_tab': 'dragboard'}, 
                              context_instance=RequestContext(request, {'home_gateway_dispatcher_url': settings.HOME_GATEWAY_DISPATCHER_URL}))

@login_required
def wiring(request, user_name=None):
    """ Vista del Wiring """
    return render_to_response('wiring.html', {}, context_instance=RequestContext(request))

