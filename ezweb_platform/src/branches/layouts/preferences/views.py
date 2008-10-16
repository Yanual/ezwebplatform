# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2008 Telef�nica Investigaci�n y Desarrollo 
#     S.A.Unipersonal (Telef�nica I+D) 
# 
# Info about members and contributors of the MORFEO project 
# is available at: 
# 
#   http://morfeo-project.org/
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version. 
# 
# This program is distributed in the hope that it will be useful, 
# but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details. 
# 
# You should have received a copy of the GNU General Public License 
# along with this program; if not, write to the Free Software 
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
# 
# If you want to use this software an plan to distribute a 
# proprietary application in any way, and you are not licensing and 
# distributing your source code under GPL, you probably need to 
# purchase a commercial license of the product.  More info about 
# licensing options is available at: 
# 
#   http://morfeo-project.org/
#

# @author jmostazo-upm

from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.core import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from django.utils import simplejson
from commons.resource import Resource
from commons.authentication import get_user_authentication
from commons.utils import get_xml_error, json_encode
from commons.logs import log
from preferences.models import Preference, PreferenceDef, PreferenceItemDef
from commons.http_utils import PUT_parameter

def update_preferences(user, preferences_json):
    for name in preferences_json.keys():
        preference = get_object_or_404(Preference, user=user, preferenceDef=name)
        preference.selectedValue = preferences_json.get(name)
        preference.save()

def get_preference_data(data):
    data_ret = {}
    data_fields = data['fields']
    preferencesDef = PreferenceDef.objects.filter(name=data_fields['preferenceDef'])
    preferencesDef_data = serializers.serialize('python', preferencesDef, ensure_ascii=False)
    for preference in preferencesDef_data:
        preference_fields = preference['fields']
	data_ret['concept'] = preference_fields['concept']
        data_ret['label'] = preference_fields['label']
        data_ret['description'] = preference_fields['description']
        data_ret['type'] = preference_fields['type']
	data_ret['defaultValue'] = preference_fields['defaultValue']
    data_ret['name'] = data_fields['preferenceDef']
    data_ret['selectedValue'] = data_fields['selectedValue']
    if data_ret['type'] == 'L':
        options = PreferenceItemDef.objects.filter(preferenceDef=data_fields['preferenceDef'])
        options_data = serializers.serialize('python', options, ensure_ascii=False)
        data_ret['options'] = {}
        data_ret['options'] = [get_preference_option_data(o) for o in options_data]
    return data_ret

def get_preference_option_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['label'] = data_fields['label']
    data_ret['value'] = data_fields['value']
    return data_ret

#@transaction.commit_on_success
def create_platform_preferences(user):
    # Create all platform preferences for the user (if not exist)
    preferencesDef = PreferenceDef.objects.all()
    preferencesDef_data = serializers.serialize('python', preferencesDef, ensure_ascii=False)
    for preferenceDef in preferencesDef_data:
        preferenceDef_fields = preferenceDef['fields']
	preferenceDef_obj = get_object_or_404(PreferenceDef, name=preferenceDef['pk'])
        try:
            preference = Preference.objects.get(user=user, preferenceDef=preferenceDef['pk'])
        except Preference.DoesNotExist:
            preference = Preference(user=user, selectedValue=preferenceDef_fields['defaultValue'], preferenceDef=preferenceDef_obj)
            preference.save()

class PreferencesCollection(Resource):
    def read(self, request, user_name):
        user = get_user_authentication(request)
        create_platform_preferences(user) # Create all platform preferences for the user (if not exist)
        preferences = Preference.objects.filter(user=user)
        data = serializers.serialize('python', preferences, ensure_ascii=False)
        data_list = {} 
        data_list ['preferences'] = [get_preference_data(d) for d in data]
        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    @transaction.commit_on_success
    def update(self, request, user_name):
        user = get_user_authentication(request)
        received_json = PUT_parameter(request, 'preferences')

        if not received_json:
            return HttpResponseBadRequest(get_xml_error(_("Platform Preferences JSON expected")), mimetype='application/xml; charset=UTF-8')

        try:
            preferences_json = simplejson.loads(received_json)
            update_preferences(user, preferences_json)
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            msg = _("Platform Preferences cannot be updated: ") + unicode(e)
            log(msg, request)
            return HttpResponseServerError(get_xml_error(msg), mimetype='application/xml; charset=UTF-8')
