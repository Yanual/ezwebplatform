from django.db import models 
from django.contrib.auth.models import User 
  
class gadgetResource(models.Model): 
      
     
     short_name = models.CharField(max_length=20) 
     vendor= models.CharField(max_length=100)
     added_by_user = models.ForeignKey(User)
     author = models.CharField(max_length=100, null=True)
     size = models.CharField(max_length=10, null=True) 
     license = models.CharField(max_length=20, null=True) 
     version = models.CharField(max_length=20)
     mail = models.EmailField(null=True) 
     description = models.CharField(max_length=500, null=True) 
     gadget_uri = models.CharField(max_length=500, null=True) 
     creation_date = models.DateTimeField('creation_date', null=True) 
     image_uri = models.CharField(max_length=500, null=True) 
     wiki_page_uri = models.CharField(max_length=500, null=True) 
     template_uri= models.CharField(max_length=500, null=True) 
    
     class Meta:
	 unique_together = ("short_name", "vendor","version")
	 db_table = 'resources'

     class Admin: 
         pass 
  
     #def __unicode__(self): 
     #    return self.gadget_uri 
