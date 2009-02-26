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
from commons.authentication import get_user_authentication
from commons.resource import Resource
from commons.utils import get_xml_error, json_encode
from marketplace.models import Wallet
from marketplace.payment.models import Account

from django.http import HttpResponse, HttpResponseServerError
from django.utils.translation import ugettext as _





class PaymentAccountCollection(Resource):
    def read(self, request, user_name=None):
        user = get_user_authentication(request)
        user_wallet = None
        try:
            user_wallet = Wallet.objects.get(auth_user=user)
        except Exception, e:
            return HttpResponseServerError(get_xml_error(unicode(e)), mimetype='application/xml; charset=UTF-8')
        accounts = None
        try:
            accounts = Account.objects.filter()
            for account in accounts:
                account.form_html = account.form_html.replace("{account_id}", str(account.id))
                account.form_html = account.form_html.replace("{wallet_id}", str(user_wallet.id))
                account.form_html = account.form_html.replace("{payment_account_title}", account.title)
        except Exception, e:
            return HttpResponseServerError(get_xml_error(_("No Payment Accounts")), mimetype='application/xml; charset=UTF-8')
        return HttpResponse(json_encode(accounts), mimetype='application/json; charset=UTF-8')