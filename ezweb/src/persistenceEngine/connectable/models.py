from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

from igadget.models import Variable

     
class In(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    
    name = models.CharField(_('Name'), max_length=30)
    variable = models.ForeignKey(Variable, verbose_name=_('Variable'))
    
    class Meta:
        unique_together = ('name', 'variable')

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
    
class Out(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    
    name = models.CharField(_('Name'), max_length=30)
    variable = models.ForeignKey(Variable, verbose_name=_('Variable'))
    
    class Meta:
        unique_together = ('name', 'variable')

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
    
class InOut(models.Model):
    uri = models.CharField(_('URI'), max_length=500, unique=True)
    
    name = models.CharField(_('Name'), max_length=30)
    value = models.CharField(_('Value'), max_length=100)
    friend_code = models.CharField(_('Friend code'), max_length=30)
    
    in_list = models.ManyToManyField(In, verbose_name=_('In list'))
    out_list = models.ManyToManyField(Out, verbose_name=_('Out list'))
    user = models.ForeignKey(User, verbose_name=_('User'))
        
    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
            



            
