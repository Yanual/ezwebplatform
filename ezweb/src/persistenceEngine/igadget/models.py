from django.db import models

from django.contrib.auth.models import User

from persistenceEngine.gadget.models import Gadget, VariableDef

class Screen(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)

    user = models.ForeignKey(User, verbose_name=_('User'))
    
    name = models.CharField(_('Name'), maxlength=30)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.aspect

class IGadget(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
        
    gadget = models.ForeignKey(Gadget)
    screen = models.ForeignKey(Screen)
    
    class Admin:
        pass

    def __unicode__(self):
        return self.name



class Variable(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    varDef = models.ForeignKey(VariableDef)
    iGadget = models.ForeignKey(IGadget)
    
    # /////////////////////////////// jrosa, necesito que aqui se pueda guardar: una string, un integer, una fecha, etc.
    # Me comentaste que algo se podia hacer :P A ver si resuelves ese jaleo
    value = models.CharField(_('Value'), maxlength=30)

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.value
            
