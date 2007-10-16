from django.db import models

from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic

from persistenceEngine.gadget.models import Gadget, VariableDef

class Screen(models.Model):
    uri = models.CharField(_('URI'), max_length=500)

    user = models.ForeignKey(User, verbose_name=_('User'))
    
    name = models.CharField(_('Name'), max_length=30)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name

class IGadget(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
        
    gadget = models.ForeignKey(Gadget)
    screen = models.ForeignKey(Screen)
    
    class Admin:
        pass

    def __unicode__(self):
        return self.uri



class Variable(models.Model):
    uri = models.CharField(_('URI'), max_length=500)
    
    vardef = models.ForeignKey(VariableDef)
    igadget = models.ForeignKey(IGadget)
    value = models.TextField(_('Value'))

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.value

    

    class Admin:
        pass

