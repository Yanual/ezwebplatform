from django.db import models
from django.contrib.auth.models import User

from resource.models import GadgetResource
from resource.search import SearchManager


class UserTag(models.Model): 
      
     tag = models.CharField(max_length=20) 
     weight = models.CharField(max_length=20, null = True)
     criteria = models.CharField(max_length=20, null = True)
     value = models.CharField(max_length=20, null = True)
     idUser = models.ForeignKey(User)
     idResource = models.ForeignKey(GadgetResource)
 
     
     objects = SearchManager(['tag_fti', 'value_fti', 'weight_fti', 'criteria_fti'])
         
     class Meta:
	 unique_together = ("tag", "idUser","idResource")

     class Admin: 
         pass 
  
     def __unicode__(self): 
         return self.tag 


