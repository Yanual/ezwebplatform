# -*- coding: utf-8 -*-
from django.http import Http404
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

def user_authentication(user_id, user):
    if user == None or user.username != user_id or not user.is_authenticated():
        print "Auth failure"
        raise Http404

    return user
