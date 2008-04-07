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
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes import generic

from django.utils.translation import ugettext as  _

from gadget.models import Gadget, VariableDef

class WorkSpace(models.Model):
    
    name = models.CharField(_('Name'), max_length=30)
    active = models.BooleanField(_('Active'))
    
    user = models.ForeignKey(User, verbose_name=_('User'))

    class Meta:
        unique_together = ('user', 'name')

    class Admin:
        pass

    def __unicode__(self):
        return str(self.pk) + " " + self.name
    
class Tab(models.Model):
    
    name = models.CharField(_('Name'), max_length=30)
    visible = models.BooleanField(_('Visible'))
    
    workspace = models.ForeignKey(WorkSpace, verbose_name=_('WorkSpace'))

    class Meta:
        unique_together = ('workspace', 'name')

    class Admin:
        pass

    def __unicode__(self):
        return str(self.pk) + " " + self.name
