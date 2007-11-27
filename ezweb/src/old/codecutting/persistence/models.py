from django.db import models

# Create your models here.

class User(models.Model):
    login = models.CharField(maxlength = 32, primary_key=True)
    name = models.CharField(maxlength = 256)
    
    def __str__ (self):
        return self.login
    
class Gadget(models.Model):
    url = models.CharField(maxlength = 256)
    user = models.ManyToManyField(User)
    
    def __str__ (self):
        return self.url
    
class Xhtml(models.Model):
    gadget = models.OneToOneField(Gadget)
    code = models.TextField()
    
    def __str__ (self):
        return self.code
    
class Template(models.Model):
    gadget = models.ForeignKey(Gadget)
    code = models.TextField()
    
    def __str__ (self):
        return self.code     
    
        