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
from django.utils.translation import gettext_lazy as _

  
class GadgetResource(models.Model): 
     
     short_name = models.CharField(_('Name'), max_length=250) 
     vendor= models.CharField(_('Vendor'), max_length=250)
     version = models.CharField(_('Version'), max_length=150)

     added_by_user = models.ForeignKey(User)

     author = models.CharField(_('Author'), max_length=250)
     mail = models.CharField(_('Mail'), max_length=30)
           
     description = models.CharField(_('Description'), max_length=250) 
     size = models.CharField(_('Size'),max_length=10, null=True) 
     license = models.CharField(_('License'),max_length=20, null=True)

     gadget_uri = models.URLField(_('gadgetURI'), null=True) 
     creation_date = models.DateTimeField('creation_date', null=True)
     image_uri = models.URLField(_('imageURI')) 
     wiki_page_uri = models.URLField(_('wikiURI')) 
     template_uri= models.URLField(_('templateURI'))

     class Meta:
	 unique_together = ("short_name", "vendor","version")

     class Admin: 
         pass 
  
     def __unicode__(self): 
         return self.short_name

class GadgetWiring(models.Model): 

     friendcode = models.CharField(_('Friend code'), max_length=30, blank=True, null=True)
     wiring  = models.CharField(_('Wiring'), max_length=5)
     idResource = models.ForeignKey(GadgetResource)

     class Admin: 
         pass 

     def __unicode__(self): 
         return self.friendcode
