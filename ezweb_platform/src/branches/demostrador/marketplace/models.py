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

from catalogue.models import GadgetResource
from marketplace.payment.models import Account

from clients.python.ezsteroids_real_api import get_category_list

from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User as AuthUser

# Duration type tuples
DURATION_TYPES = (
    (u'P', _('periodicity_P')),
    (u'D', _('periodicity_D')),
    (u'W', _('periodicity_W')),
    (u'M', _('periodicity_M')),
    (u'Y', _('periodicity_Y')),
)

# Duration units dict
DURATION_UNITS = {
    u'D': _('duration_unit_D'),
    u'W': _('duration_unit_W'),
    u'M': _('duration_unit_M'),
    u'Y': _('duration_unit_Y'),
}

# Gadget Pricing
class GadgetPricing(models.Model):
    gadget = models.ForeignKey(GadgetResource)
    duration = models.SmallIntegerField(_('Duration'), null=False)
    periodicity = models.CharField(_('Duration Type'), max_length=1, choices=DURATION_TYPES, null=False)
    price = models.DecimalField(_('Price'), null=False, max_digits=12, decimal_places=2)

    def __unicode__(self):
        if(self.periodicity=='P'):
            return _('Permanent Contract') % self.gadget.short_name
        else:
            return _('Periodic Contract') % (self.gadget.short_name, self.duration, DURATION_UNITS[self.periodicity])



def _categories_tuple(result):
    if hasattr(settings,'AUTHENTICATION_SERVER_URL'):
        try:
            categories = get_category_list()

            del result[:]
            for category in categories:
                result.append((category.id, category.name))
        except:
            pass

    return result

class GadgetSpecialPricing(models.Model):
    pricing = models.ForeignKey(GadgetPricing)
    user_category = models.IntegerField(_('User Category'), max_length=7, choices=_categories_tuple([]), null=False)
    price = models.DecimalField(_('Price'), null=False, max_digits=12, decimal_places=2)

    def __init__(self, *args, **kwargs):
        models.Model.__init__(self, *args, **kwargs)
        _categories_tuple(self._meta.fields[2].choices)

    def __unicode__(self):
        try:
            return _('%s for %s users') % (self.pricing.__unicode__(), self._meta.fields[2].choices[self.user_category])
        except:
            return _('%s for unknow kind of users') % (self.pricing.__unicode__())
    
    class Meta:
        verbose_name = _('Categorized Special Pricing')



# User related Wallet
class Wallet(models.Model):
     auth_user = models.OneToOneField(AuthUser)
     current_balance = models.DecimalField(_('Current Balance'), null=False, max_digits=12, decimal_places=2)
     outstanding_balance = models.DecimalField(_('Outstanding Balance'), null=False, max_digits=12, decimal_places=2)

     def __unicode__(self):
         return self.auth_user.username



# Transaction Types tuples
TRANSACTION_TYPES = (
    (u'R', _('Recharge')),
    (u'P', _('Purchase')),
    (u'R', _('Refund')),
)

# Transaction Types dict
TRANSACTION_TYPES_LIST = {
    u'R': _('Recharge'),
    u'P': _('Purchase'),
    u'R': _('Refund'),
}

# Transaction Status tuples
TRANSACTION_STATUS = (
    (u'P', _('Pending')),
    (u'C', _('Completed')),
)



# Transactions (Wallet recharges and Gadget purchases)
class Transaction(models.Model):
    wallet = models.ForeignKey(Wallet)
    creation_date = models.DateTimeField(_('Creation Date'), null=False)
    transaction_type = models.CharField(_('Transaction Type'), max_length=1, choices=TRANSACTION_TYPES, null=False)
    concept = models.CharField(_('Concept'), max_length=63, null=False)
    amount = models.DecimalField(_('Amount'), null=False, max_digits=12, decimal_places=2)
    status = models.CharField(_('Status'), max_length=1, choices=TRANSACTION_STATUS, null=False)
    gadget_pricing = models.ForeignKey(GadgetPricing, null=True)
    finish_date = models.DateTimeField(_('Finish Date'), null=False)
    payment_account = models.ForeignKey(Account, null=True)

    def __unicode__(self):
        if(self.transaction_type=='P'):
            return _('Purchase Description') % (TRANSACTION_TYPES_LIST[self.transaction_type], self.gadget_pricing.gadget.short_name)
        else:
            return _('Transaction Description') % (TRANSACTION_TYPES_LIST[self.transaction_type], self.gadget_pricing, self.amount)



# Transactions Extended Info (Payment platforms related info)
class TransactionExtendedInfo(models.Model):
    transaction = models.ForeignKey(Transaction)
    info = models.TextField(_('Extended Info'))

    def __unicode__(self):
        return transaction.id

