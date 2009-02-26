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
from django.conf.urls.defaults import patterns, include

from marketplace.views import PricingCollection, WalletManager, PurchasedCollection, PurchaseGadget#, MarketplaceResourceStatus

urlpatterns = patterns('marketplace.views',
    # Marketplace gets Wallet Balance
    (r'^wallet/user/(?P<user_name>[_\w]+)$', WalletManager(permitted_methods=('GET',))),
    # Marketplace gets Gadget Pricing
    (r'^pricing/resource/(?P<vendor>[\@_\%_\._\,_\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)/(?P<name>[\@_\%_\,\._\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)/(?P<version>[\@_\%_\._\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)$', PricingCollection(permitted_methods=('GET',))),
    # Marketplace gets a list of Purchased Gadgets (GET) and Purchases a Gadget (POST)
    (r'^purchased/user/(?P<user_name>[_\w]+)$', PurchasedCollection(permitted_methods=('GET','POST',))),
    # Payment Services Providers URLs
    (r'^payment/', include('marketplace.payment.urls')),
    # Marketplace checks if the user has purchased the spcified gadgets
    (r'^purchased/user/(?P<user_name>[_\w]+)/resource/(?P<resource_id>\d+)$', PurchaseGadget(permitted_methods=('GET',))),



    # Marketplace Purchase URLs
    #(r'^user/(?P<user_name>[_\w]+)/marketplace/resource/(?P<gadget_id>\d+)?$',  MarketplaceResourceStatus(permitted_methods=('GET', 'POST',))),
    #(r'$',  MarketplaceResourceStatus(permitted_methods=('GET', 'POST',))),

    # Paypal URLs
    #(r'^payment/paypal', include('payment.paypal.urls')),

    # Google Checkout URLs
    #(r'^marketplace/payment/google_checkout/(?P<payment_account_id>[_\w]+)/$', include('payment.google_checkout.urls')),

)
