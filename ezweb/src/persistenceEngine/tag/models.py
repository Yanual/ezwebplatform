from django.db import models
from django.contrib.auth.models import User
from persistenceEngine.resource.models import gadgetResource

# Create your models here.

class userTag(models.Model): 
      
     tag = models.CharField(max_length=20) 
     weight = models.CharField(max_length=20, null = True)
     criteria = models.CharField(max_length=20, null = True)
     value = models.CharField(max_length=20, null = True)
     idUser = models.ForeignKey(User)
     idResource = models.ForeignKey(gadgetResource)
         
     class Meta:
	 unique_together = ("tag", "idUser","idResource")
	 db_table = 'usertags'

     class Admin: 
         pass 
  
     #def __unicode__(self): 
     #    return self.tag 

