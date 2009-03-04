# See license file (LICENSE.txt) for info about license terms.

from django import template
from django.core.urlresolvers import reverse
from django.conf import settings
from django.template import Context, Library, Template, Variable

from clms.models import Layout, FavouriteLayout


register = Library()

def favourite(context, user, layout, view):
    favourite_layout = FavouriteLayout.objects.filter(user=user)
    return {
            'layout': layout,
            'is_favourite': not favourite_layout or not layout in favourite_layout[0].layout.all(),
            'view': view,
            'MEDIA_URL': settings.MEDIA_URL,
    }

register.inclusion_tag("favourite.html", takes_context=True)(favourite)

