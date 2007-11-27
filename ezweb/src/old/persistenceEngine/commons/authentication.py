# -*- coding: utf-8 -*-
from django.http import Http404
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404


def user_authentication(user_name):
    user = get_object_or_404(User, username=user_name)
    if not user.is_authenticated():
        print "User authentication failed!"
        raise Http404
    else:
        return user
