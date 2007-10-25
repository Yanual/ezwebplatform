from datetime import datetime, timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

class Template(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    description = models.CharField(_('Description'), max_length=250)
    image = models.CharField(max_length=500)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class VariableDefOption(models.Model):
    option = models.CharField(_('Option'), max_length=30)
    
    class Admin:
        pass
    
    def __unicode__(self):
        return self.option


class VariableDef(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    name = models.CharField(_('Name'), max_length=30)
    TYPES = (
        ('N', _('Number')),
        ('S', _('String')),
        ('D', _('Date')),
        ('B', _('Boolean')),
    )
    type = models.CharField(_('Type'), max_length=1, choices=TYPES)
    ASPECTS = (
        ('SLOT', _('Slot')),
        ('EVEN', _('Event')),
        ('PREF', _('Preference')),
        ('PROP', _('Property')),
    )
    aspect = models.CharField(_('Aspect'), max_length=4, choices=ASPECTS)
    label = models.CharField(_('Label'), max_length=50)
    description = models.CharField(_('Description'), max_length=250)
    friend_code = models.CharField(_('Friend code'), max_length=30)
    default_value = models.TextField(_('Default value'), blank=True, null=True)
    options = models.ManyToManyField(VariableDefOption, verbose_name=_('VariableDef Options'), blank=True, null=True)
    template = models.ForeignKey(Template)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.aspect
    
      
class XHTML(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    code = models.TextField(_('Code'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class UserEventsInfo(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    event = models.CharField(_('Event'), max_length=20)
    handler = models.CharField(_('Handler'), max_length=50)
    html_element = models.CharField(_('HtmlElement'), max_length=20)
    xhtml = models.ForeignKey(XHTML)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class Tag(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    value = models.CharField(_('Value'), max_length=50)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri  


class Gadget(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    
    vendor = models.CharField(_('Vendor'), max_length=250)
    name = models.CharField(_('Name'), max_length=250)
    version = models.CharField(_('Version'), max_length=150)
    
    template = models.ForeignKey(Template)
    xhtml = models.ForeignKey(XHTML)
    
    author = models.CharField(_('Author'), max_length=250)
    web = models.URLField(_('Web'))
   
    description = models.CharField(_('Description'), max_length=250)
    tags = models.ManyToManyField(Tag, verbose_name=_('Tags'))
    
    shared = models.BooleanField(_('Shared'), default=False)
    user = models.ForeignKey(User, verbose_name=_('User'))
    last_update = models.DateTimeField(_('Last update'))

    class Meta:
        unique_together = ('vendor', 'name', 'version')

    class Admin:
        pass

    def __unicode__(self):
        return self.name

