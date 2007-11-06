# -*- coding: utf-8 -*-
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404


def user_authentication(user_id):
    user = get_object_or_404(User, id=user_id)
    if not user.is_authenticated():
        return HttpResponseRedirect()
    else:
        return user
