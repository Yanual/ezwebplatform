from datetime import datetime, timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

class Template(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    description = models.CharField(_('Description'), max_length=250)
    image = models.CharField(max_length=500)
    width = models.IntegerField(_('Width'), default=1)
    height = models.IntegerField(_('Height'), default=1)    

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class VariableDef(models.Model):
    name = models.CharField(_('Name'), max_length=30)
    TYPES = (
        ('N', _('Number')),
        ('S', _('String')),
        ('D', _('Date')),
        ('B', _('Boolean')),
        ('L', _('List')),
    )
    type = models.CharField(_('Type'), max_length=1, choices=TYPES)
    ASPECTS = (
        ('SLOT', _('Slot')),
        ('EVEN', _('Event')),
        ('PREF', _('Preference')),
        ('PROP', _('Property')),
    )
    aspect = models.CharField(_('Aspect'), max_length=4, choices=ASPECTS)
    label = models.CharField(_('Label'), max_length=50, null=True)
    description = models.CharField(_('Description'), max_length=250, null=True)
    friend_code = models.CharField(_('Friend code'), max_length=30, null=True)
    default_value = models.TextField(_('Default value'), blank=True, null=True)
    template = models.ForeignKey(Template)

    class Admin:
        pass

    def __unicode__(self):
        return self.template.uri + " " + self.aspect


class UserPrefOption(models.Model):
    value = models.CharField(_('Value'), max_length=30)
    name = models.CharField(_('Name'), max_length=30)
    variableDef = models.ForeignKey(VariableDef)
    
    class Admin:
        pass
    
    def __unicode__(self):
        return self.variableDef.template.uri + " " + self.name


class VariableDefAttr(models.Model):
    value = models.CharField(_('Value'), max_length=30)
    name = models.CharField(_('Name'), max_length=30)
    variableDef = models.ForeignKey(VariableDef)
    
    class Admin:
        pass
    
    def __unicode__(self):
        return self.variableDef + self.name

      
class XHTML(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    code = models.TextField(_('Code'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class UserEventsInfo(models.Model):
    event = models.CharField(_('Event'), max_length=20)
    handler = models.CharField(_('Handler'), max_length=50)
    html_element = models.CharField(_('HtmlElement'), max_length=20)
    xhtml = models.ForeignKey(XHTML)

    class Admin:
        pass

    def __unicode__(self):
        return self.xhtml.uri


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
    mail = models.CharField(_('Mail'), max_length=30)
   
    wikiURI = models.URLField(_('wikiURI'))
    imageURI = models.URLField(_('imageURI'))

    description = models.CharField(_('Description'), max_length=250)
    tags = models.ManyToManyField(Tag, verbose_name=_('Tags'), null=True)
    
    shared = models.BooleanField(_('Shared'), default=False, null=True)
    user = models.ForeignKey(User, verbose_name=_('User'))
    last_update = models.DateTimeField(_('Last update'), null=True)

    class Meta:
        unique_together = ('vendor', 'name', 'version', 'user')

    class Admin:
        pass

    def __unicode__(self):
        return self.uri

