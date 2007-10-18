from django.db import models

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic

from persistenceEngine.gadget.models import Gadget, VariableDef

class Screen(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    
    name = models.CharField(_('Name'), max_length=30)
    user = models.ForeignKey(User, verbose_name=_('User'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name

class IGadget(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
        
    gadget = models.ForeignKey(Gadget, verbose_name=_('Gadget'))
    screen = models.ForeignKey(Screen, verbose_name=_('Screen'))
    
    class Meta:
        unique_together = ('uri', 'gadget', 'screen')
    
    class Admin:
        pass

    def __unicode__(self):
        return self.uri



class Variable(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    
    vardef = models.ForeignKey(VariableDef, verbose_name=_('Variable definition'))
    igadget = models.ForeignKey(IGadget, verbose_name=_('IGadget'))
    value = models.TextField(_('Value'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.value

