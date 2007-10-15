from django.db import models

from persistenceEngine.igadget.models import Variable
     
class In(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    name = models.CharField(maxlength=30)
    variable = models.ForeignKey(Variable)
    
    class Meta:
        unique_together = ('name', 'variable')

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
    
class Out(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    name = models.CharField(maxlength=30)
    variable = models.ForeignKey(Variable)
    
    class Meta:
        unique_together = ('name', 'variable')

    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
    
class InOut(models.Model):
    uri = models.CharField(_('URI'), maxlength=500)
    
    name = models.CharField(maxlength=30, primary_key=True)
    
    value = models.CharField(maxlength=100)
    
    inList = models.ManyToManyField(In)
    outList = models.ManyToManyField(Out)
        
    class Admin:
        pass

    def __unicode__(self):
        return self.uri + " " + self.name
            



            