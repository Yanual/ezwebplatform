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

from django.db import models
from django.utils.translation import ugettext_lazy as _

# Payment Account Types tuples
ACCOUNT_TYPES = (
    (u'PP', u'Paypal'),
    (u'GC', u'Google Checkout'),
)

# Validation Methods tuples
VALIDATION_METHODS = (
    (u'I', _('account_types_I')),
    (u'P', _('account_types_P')),
)

# Payment Accounts
class Account(models.Model):
     title = models.CharField(_('Title'), max_length=63, null=False)
     payment_account_type = models.CharField(_('Payment Account Type'), max_length=2, choices=ACCOUNT_TYPES, null=False)
     validation_method = models.CharField(_('Validation Method'), max_length=1, choices=VALIDATION_METHODS, null=False)
     identity_token = models.CharField(_('Identity Token'), max_length=64, null=False)
     form_html = models.TextField(_('Form Element HTML'), null=True)

     def __unicode__(self):
         return self.title
