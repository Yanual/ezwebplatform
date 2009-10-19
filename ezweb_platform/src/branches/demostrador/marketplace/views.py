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
from marketplace.models import Wallet, Transaction, GadgetPricing

from django.http import HttpResponse, HttpResponseServerError
from django.utils.translation import ugettext as _

from datetime import datetime, timedelta



class WalletManager(Resource):
    def read(self, request, user_name=None):
        """
        Gets the current wallet balance of the authenticated user
        """
        user = get_user_authentication(request)
        user_wallet = None
        try:
            user_wallet = Wallet.objects.get(auth_user=user)
        except Exception:
            user_wallet = Wallet(auth_user=user, current_balance=0, outstanding_balance=0)
            user_wallet.save()
        return HttpResponse(json_encode({'user': user_wallet.auth_user.username, 'current_balance': user_wallet.current_balance}), mimetype='application/json; charset=UTF-8')



class PricingCollection(Resource):
    def read(self, request, vendor=None, name=None, version=None):
        """
        Gets a price list for a gadget specified by vendor, gadget name and gadget
        version
        """
        gadget_pricing = None
        try:
            gadget_pricing = GadgetPricing.objects.filter(gadget__short_name=name, gadget__vendor=vendor, gadget__version=version)
        except Exception:
            return HttpResponseServerError(get_xml_error(_("Error retrieving gadgets pricing")), mimetype='application/xml; charset=UTF-8')
        return HttpResponse(json_encode(gadget_pricing), mimetype='application/json; charset=UTF-8')



class PurchasedCollection(Resource):
    #
    # Checks if the user has an active transaction of this gadget
    #
    def _check_purchased_gadget(self, user_wallet, short_name, vendor, version):
        """
        Checks if an user has one gadget purchased
        """
        transactions = Transaction.objects.filter(wallet=user_wallet,
                                                transaction_type='P',
                                                gadget_pricing__gadget__short_name=short_name,
                                                gadget_pricing__gadget__vendor=vendor,
                                                gadget_pricing__gadget__version=version)
        for transaction in transactions:
            if transaction.gadget_pricing.periodicity == 'P':
                return True
            if transaction.finish_date >= datetime.now():
                return True
        return False
    


    def create(self, request, user_name=None):
        """
        Purchases one gadget using a GadgetPricing ID

        Checks if there is any active transaction and if there is enough balance in the user wallet.

        Creates a transaction and substract the amount from the wallet ballance
        """
        user = get_user_authentication(request)
        # gets user wallet information
        user_wallet = Wallet.objects.get(auth_user=user)

        # gets gadget pricing information
        pricing_id = request.POST.__getitem__('pricing_id')
        pricing = GadgetPricing.objects.get(id=pricing_id)
        
        # First check: Is gadget purchased?
        active_transaction = self._check_purchased_gadget(user_wallet, pricing.gadget.short_name, pricing.gadget.vendor, pricing.gadget.version)
        if active_transaction == True:
            return HttpResponseServerError(get_xml_error(_("Gadget is currently purchased")), mimetype='application/xml; charset=UTF-8')

        # Second check: Is there enough balance
        if pricing.price > user_wallet.current_balance:
            return HttpResponseServerError(get_xml_error(_("There is not enough balance")), mimetype='application/xml; charset=UTF-8')

        # creates the transaction
        transaction = Transaction()
        transaction.wallet = user_wallet
        transaction.creation_date = datetime.now()
        transaction.transaction_type = 'P'
        transaction.concept = _('Gadget purchasing')
        transaction.amount = pricing.price
        transaction.status = 'C'
        transaction.gadget_pricing = pricing
        if pricing.periodicity == "P":
            transaction.finish_date = transaction.creation_date
        else:
            if pricing.periodicity == "D":
                duration = timedelta(days=pricing.duration)
            if pricing.periodicity == "W":
                duration = timedelta(weeks=pricing.duration)
            if pricing.periodicity == "M":
                duration = timedelta(days=pricing.duration*30)
            if pricing.periodicity == "Y":
                duration = timedelta(days=pricing.duration*365)
            transaction.finish_date = transaction.creation_date + duration

        #transaction.payment_item = 0
        transaction.save()

        # Updates the user wallet
        user_wallet.current_balance -= pricing.price
        user_wallet.outstanding_balance -= pricing.price
        user_wallet.save()

        # returns the affected information
        return HttpResponse(json_encode({ "wallet": user_wallet, "pricing": pricing, "transaction": transaction}), mimetype='application/json; charset=UTF-8')



    def read(self, request, user_name=None):
        """
        Gets a list of purchased gadgets by the authenticated user
        """
        user = get_user_authentication(request)
        purchased_gadgets = {}
        try:
            # gets the user wallet to locate any gadgets related to it
            user_wallet = Wallet.objects.get(auth_user=user)
            # gets purchase transaction
            transactions = Transaction.objects.filter(wallet=user_wallet,transaction_type='P')

            # creates the dict to return
            for transaction in transactions:
                resource = transaction.gadget_pricing.gadget
                resource_index = u'%s:%s:%s' % (resource.short_name, resource.vendor, resource.version)
                if transaction.gadget_pricing.periodicity == 'P':
                    purchased_gadgets[resource_index] = True
                    continue
                if transaction.finish_date >= datetime.now():
                    purchased_gadgets[resource_index] = True
                    continue
            pass
        except Exception, e:
            purchased_gadgets = {}
        return HttpResponse(json_encode(purchased_gadgets), mimetype='application/json; charset=UTF-8')



class PurchaseGadget(Resource):
    def read(self, request, user_name=None, resource_id=None):
        """
        Checks if a gadget has been purchased and it's currently active for the
        authenticated user
        """
        user = get_user_authentication(request)
        purchased = False
        try:
            user_wallet = Wallet.objects.get(auth_user=user)
            resource = GadgetResource.objects.get(id=resource_id)
            transactions = Transaction.objects.filter(wallet=user_wallet, gadget_pricing__gadget=resource)
            for transaction in transactions:
                if transaction.gadget_pricing.periodicity == 'P':
                    purchased = True
                    break
                if transaction.finish_date >= datetime.now():
                    purchased = True
                    break
            pass
        except Exception, e:
            purchased = False
        return HttpResponse(json_encode({'user_name': user_name, 'resource_id': resource_id, 'purchased': purchased}), mimetype='application/json; charset=UTF-8')






class GadgetExpirationCollection(Resource):

    def read(self, request, user_name=None):
        """
        Gets a list of purchased gadgets by the authenticated user
        """
        user = get_user_authentication(request)
        purchased_gadgets = {}
        try:
            # gets the user wallet to locate any gadgets related to it
            user_wallet = Wallet.objects.get(auth_user=user)
            # gets purchase transaction
            transactions = Transaction.objects.filter(wallet=user_wallet,transaction_type='P')

            # creates the dict to return
            for transaction in transactions:
                resource = transaction.gadget_pricing.gadget
                resource_index = u'%s' % (resource.short_name)
                if transaction.gadget_pricing.periodicity == 'P':
                    purchased_gadgets[resource_index] = True
                    continue
                if transaction.finish_date >= datetime.now():
                    finish_date_text = str(transaction.finish_date)

                    purchased_gadgets[resource_index] = finish_date_text[8:10] + "-" + finish_date_text[5:7] + "-" + finish_date_text[0:4]
                    continue
            pass
        except Exception, e:
            purchased_gadgets = {}
        return HttpResponse(json_encode(purchased_gadgets), mimetype='application/json; charset=UTF-8')
