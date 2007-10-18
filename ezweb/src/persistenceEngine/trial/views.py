# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext, Context
from django.template.loader import get_template
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required


def index(request, user_id=None):
    """ vista demostrador """
    return render_to_response('index.html', {}, context_instance=RequestContext(request))
index = staff_member_required(index)
