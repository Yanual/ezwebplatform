from django.db import models
from django.contrib.auth.models import User
from resource.models import GadgetResource

# Create your models here.

class UserTag(models.Model): 
      
     tag = models.CharField(max_length=20) 
     weight = models.CharField(max_length=20, null = True)
     criteria = models.CharField(max_length=20, null = True)
     value = models.CharField(max_length=20, null = True)
     idUser = models.ForeignKey(User)
     idResource = models.ForeignKey(GadgetResource)
         
     class Meta:
	 unique_together = ("tag", "idUser","idResource")

     class Admin: 
         pass 
  
     def __unicode__(self): 
         return self.tag 

