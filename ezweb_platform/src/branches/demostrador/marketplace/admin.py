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

from django.contrib import admin
from marketplace.models import GadgetPricing, GadgetSpecialPricing, Wallet, Transaction

# Class to manage the gadget pricing via admin
class GadgetPricingAdmin(admin.ModelAdmin):
    field_sets = (
        (None, {
            'fields': ('gadget', ('duration', 'periodicity'), 'price')
            }),
        )
    list_display = ('gadget', 'duration', 'periodicity', 'price')


# Class to manage the gadget special pricing via admin
class GadgetSpecialPricingInline(admin.TabularInline):
    model = GadgetSpecialPricing

class GadgetSpecialPricingAdmin(admin.ModelAdmin):
    field_sets = (
        (None, {
            'fields': ('gadget', ('duration', 'periodicity'))
            }),
        )
    list_display = ('gadget', 'duration', 'periodicity')
    list_filter = ('gadget', )
    inlines = [GadgetSpecialPricingInline, ]



# Class to manage the categories special pricing via admin
class CategorizedSpecialPricingAdmin(admin.ModelAdmin):
    field_sets = (
        (None, {
            'fields': ('user_category', 'pricing', 'price')
            }),
        )
    list_display = ('user_category', 'pricing', 'price')
    list_filter = ('user_category', 'pricing')



# Class to manage manually the transactions (Wallet recharges and gadget purchases)
class TransactionAdmin(admin.ModelAdmin):
    field_sets = (
        (None, {
            'fields': ('wallet', 'creation_date', 'transaction_type', 'concept', 'amount', 'status', 'gadget_pricing', 'finish_date')
            }),
        )
    list_display = ('creation_date', 'transaction_type', 'status', 'amount')

# Management modules registation
# admin.site.register(GadgetPricing, GadgetPricingAdmin)
admin.site.register(GadgetPricing, GadgetSpecialPricingAdmin)
admin.site.register(GadgetSpecialPricing, CategorizedSpecialPricingAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Wallet)