# -*- coding: utf-8 -*-

# MORFEO Project 
# http://morfeo-project.org 
# 
# Component: EzWeb
# 
# (C) Copyright 2004 Telefónica Investigación y Desarrollo 
#     S.A.Unipersonal (Telefónica I+D) 
# 
# Info about members and contributors of the MORFEO project 
# is available at: 
# 
#   http://morfeo-project.org/
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version. 
# 
# This program is distributed in the hope that it will be useful, 
# but WITHOUT ANY WARRANTY; without even the implied warranty of 
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details. 
# 
# You should have received a copy of the GNU General Public License 
# along with this program; if not, write to the Free Software 
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
# 
# If you want to use this software an plan to distribute a 
# proprietary application in any way, and you are not licensing and 
# distributing your source code under GPL, you probably need to 
# purchase a commercial license of the product.  More info about 
# licensing options is available at: 
# 
#   http://morfeo-project.org/
#

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
