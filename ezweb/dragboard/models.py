from datetime import datetime, timedelta

from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic


class UserProfile(models.Model):
    class Admin:
        pass


class Gadget(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    title = models.CharField(_('Title'), maxlength=250)
    # cached_xml = models.TextField(_('Cached XML'), null=True, blank=True, editable=True)
    content = models.TextField(_('Content'), null=True, blank=True, editable=True)
    last_update = models.DateTimeField(_('Last update'))
    author = models.CharField(_('Author'), maxlength=250)
    web = models.TextField(_('Website'), maxlength=500, null=True, blank=True)
    description = models.CharField(_('Description'), maxlength=250)
    version = models.CharField(_('Version'), maxlength=150)
    tags = models.CharField(_('Tags'), maxlength=250)
    shared = models.BooleanField(_('Shared'), default=False)
    importer = models.ForeignKey(User, verbose_name=_('User'))


    class Admin:
        pass

    def __unicode__(self):
        return self.title


class Preference(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, verbose_name=_('User'))
    gadget = models.ForeignKey(Gadget, null=True, blank=True, verbose_name=_('Gadget'))
    data_type = models.ForeignKey(ContentType)
    data_id = models.PositiveIntegerField()
    data = generic.GenericForeignKey('data_type', 'data_id')

    class Admin:
        pass


class TextType(models.Model):
    text = models.TextField(_('Text'))
    length = models.PositiveIntegerField(_('Length'))

    class Admin:
        pass

    def __unicode__(self):
        return self.text


class NumberType(models.Model):
    number = models.FloatField(_('Number'))

    class Admin:
        pass

    def __unicode__(self):
        return self.number


class BooleanType(models.Model):
    boolean = models.BooleanField(_('Booelan'))

    class Admin:
        pass

    def __unicode__(self):
        return str(self.boolean)


class GeoType(models.Model):
    latitude = models.DecimalField(_('Latitude'), max_digits=9, decimal_places=6)
    longitude = models.DecimalField(_('Longitude'), max_digits=9, decimal_places=6)

    class Admin:
        pass

    def __unicode__(self):
        return "%f, %f" % (self.latitude, self.longitude)


class ListType(models.Model):
    length = models.PositiveIntegerField(_('Length'))

    class Admin:
        pass

    def __unicode__(self):
        return u'[ %s ]' % ', '.join( [ str(i) for i in self.listitemtype_set.all() ] )


class ListItemType(models.Model):
    list_type = models.ForeignKey(ListType, verbose_name=_('List'), edit_inline=models.TABULAR, min_num_in_admin=3)
    item = models.CharField(_('Item'), maxlength=200, core=True)

    class Admin:
        pass

    def __unicode__(self):
        return self.item
