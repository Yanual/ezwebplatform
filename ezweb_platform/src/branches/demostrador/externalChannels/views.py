# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#
from commons.resource import Resource

from django.http import HttpResponse, HttpResponseServerError
from django.db import transaction
from django.utils.translation import ugettext as _

from commons.utils import get_xml_error, json_encode
from commons.authentication import get_user_authentication, user_authentication
from commons.logs_exception import TracedServerError

from externalChannels.models import ExternalChannel

from django.utils import simplejson

class ExternalChannelCollection(Resource):
    @transaction.commit_on_success
    def create(self, request):
        user = get_user_authentication(request)

        # Getting id
        external_channel = ExternalChannel()
        external_channel.save()

        url = request.build_absolute_uri() + '/' + unicode(external_channel.id)

        external_channel.url = url
        external_channel.save()

        response = dict()
        response['url'] = external_channel.url;
        response['id'] = int(external_channel.id);
        
        return HttpResponse(simplejson.dumps(response), mimetype='application/json; charset=UTF-8')

class ExternalChannelEntry(Resource):
    def read(self, request, user_name=None):
        user = user_authentication(request, user_name)
        if request.POST.has_key('url'):
            templateURL = request.POST['url']
        else:
            return HttpResponseServerError('<error>Url not specified</error>', mimetype='application/xml; charset=UTF-8')
    
    def delete(self, request, user_name=None):
        user = user_authentication(request, user_name)
        if request.POST.has_key('url'):
            templateURL = request.POST['url']
        else:
            return HttpResponseServerError('<error>Url not specified</error>', mimetype='application/xml; charset=UTF-8')
    