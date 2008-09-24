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


import os
import codecs
from datetime import datetime

from django.conf import settings

from django.utils.translation import ugettext as _

def log(exception, request, file_name='logs'):
    """Prints msg to file_name log file"""
    if !settings.has_key(LOG_FILE) or settings.LOG_FILE = '':
        settings.LOG_FILE=os.path.join(settings.MEDIA_ROOT, 'logs', file_name + '.log')

    try:
        f = codecs.open(settings.LOG_FILE, "a", "utf-8")
        if request.user.username == "":
            user = "[" + _("Anonymous") + "]"
        else:
            user = request.user.username

        line = unicode('ERROR: %s %s %s\n' % (request.method, request.path, user))
        f.write(line)
        line = '[%s] %s\n' % (datetime.today().strftime('%d/%m/%Y %H:%M:%S'), exception)
        f.write(line)
        f.close()
    except IOError:
        pass
