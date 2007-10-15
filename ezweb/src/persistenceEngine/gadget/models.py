from datetime import datetime, timedelta

from django.db import models
from django.contrib.auth.models import User


class Template(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class VariableDef(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    name = models.CharField(_('Name'), maxlength=30)
    type = models.CharField(_('Type'), maxlength=20)
    aspect = models.CharField(_('Aspect'), maxlength=20)
    friendCode = models.CharField(_('FriendCode'), maxlength=30)
    template = models.ForeignKey(Template)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.aspect
    
      
class XHTML(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    code = models.TextField(_('Code'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class UserEventsInfo(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    event = models.CharField(_('Event'), maxlength=20)
    handler = models.CharField(_('Handler'), maxlength=50)
    htmlElement = models.CharField(_('HtmlElement'), maxlength=20)
    xHTML = models.ForeignKey(XHTML)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri


class Tag(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    value = models.CharField(_('value'), maxlength=50)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri  


class Gadget(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    vendor = models.CharField(_('Vendor'), maxlength=250)
    name = models.CharField(_('Name'), maxlength=250)
    version = models.CharField(_('Version'), maxlength=150)
    
    template = models.ForeignKey(Template)
    xHTML = models.ForeignKey(XHTML)
    
    author = models.CharField(_('Author'), maxlength=250)
    web = models.URLField(_('Web'))
   
    description = models.CharField(_('Description'), maxlength=250)
    tags = models.ManyToManyField(Tag, verbose_name=_('Tags'))

    
    shared = models.BooleanField(_('Shared'), default=False)
    importer = models.ForeignKey(User, verbose_name=_('User'))
    lastUpdate = models.DateTimeField(_('Last update'))

    class Meta:
        unique_together = ('vendor', 'name', 'version')

    class Admin:
        pass

    def __unicode__(self):
        return self.name

