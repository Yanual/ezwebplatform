from django.db import models 
from django.contrib.auth.models import User
from resource.search import SearchManager
  
class GadgetResource(models.Model): 
     
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

     objects = SearchManager(['short_name_fti', 'vendor_fti', 'version_fti', 'author_fti', 'license_fti', 'size_fti', 'description_fti', 'mail_fti'])
    
     class Meta:
	 unique_together = ("short_name", "vendor","version")

     class Admin: 
         pass 
  
     def __unicode__(self): 
         return self.short_name

class GadgetWiring(models.Model): 

     friendcode = models.CharField(max_length=20)
     wiring  = models.CharField(max_length=20)
     idResource = models.ForeignKey(GadgetResource)

     objects = SearchManager(['friendcode_fti', 'wiring_fti'])

     class Admin: 
         pass 

     def __unicode__(self): 
         return self.friendcode
