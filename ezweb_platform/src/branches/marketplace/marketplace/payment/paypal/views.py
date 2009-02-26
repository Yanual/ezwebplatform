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
from commons.logs import log
from commons.resource import Resource
from commons.utils import get_xml_error, json_encode
from marketplace.models import Transaction, TransactionExtendedInfo, Wallet
from marketplace.payment.models import Account

from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseServerError
from django.utils.translation import ugettext as _

from datetime import datetime
from decimal import Decimal




class PaypalTransactionIPN(Resource):
    """
    Registers a Payment transaction and updates the wallet balance
    """
    def create(self, request, account_id=None, wallet_id=None):
        # Gets the attached wallet
        try:
            user_wallet = Wallet.objects.get(id=wallet_id)
            account = Account.objects.get(id=account_id)
        except Exception, e:
            log(e, request)
            return HttpResponseServerError(get_xml_error(_("Error getting objects")), mimetype='application/xml; charset=UTF-8')


        # Creates the transaction
        try:
            transaction = Transaction()
            transaction.wallet = user_wallet
            transaction.creation_date = datetime.now()
            transaction.transaction_type = 'R'
            transaction.concept = _('Wallet Recharge')
            transaction.amount = Decimal(request.POST.__getitem__("mc_gross"))
            if(request.POST.__getitem__("payment_status")=="Completed"):
                transaction.status = 'C'
            if(request.POST.__getitem__("payment_status")=="Pending"):
                transaction.status = 'P'
            transaction.gadget_pricing = None
            transaction.finish_date = transaction.creation_date
            transaction.payment_account = account
            transaction.save()
        except Exception, e:
            log(e, request)
            return HttpResponseServerError(get_xml_error(_("Error creating transaction")), mimetype='application/xml; charset=UTF-8')


        # Stores the transaction extended info
        try:
            extended = TransactionExtendedInfo()
            extended.transaction = transaction
            extended.info = json_encode(request.POST)
            extended.save()
        except Exception, e:
            log(e, request)
            return HttpResponseServerError(get_xml_error(_("Error creating transaction extended info")), mimetype='application/xml; charset=UTF-8')


        # Updates the user wallet
        try:
            if transaction.status == 'C':
                user_wallet.current_balance += transaction.amount
            user_wallet.outstanding_balance += transaction.amount
            user_wallet.save()
        except Exception, e:
            log(e, request)
            return HttpResponseServerError(get_xml_error(_("Error updating balance")), mimetype='application/xml; charset=UTF-8')

        return HttpResponse("OK", mimetype='application/json; charset=UTF-8')



class PaypalTransactionPDT(Resource):
    def create(self, request, paypal_transaction_id=None):
        return HttpResponse('PDT tu!!!', mimetype='application/json; charset=UTF-8')
