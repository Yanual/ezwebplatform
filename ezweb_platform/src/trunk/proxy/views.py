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


from urllib2 import *
import httplib
import urlparse
from django_restapi.resource import Resource
from django_restapi.responder import *
from proxy.utils import is_valid_header

from django.utils.translation import gettext_lazy as _
from django.utils.translation import string_concat

from django.http import Http404, HttpResponse, HttpResponseServerError
from django.conf import settings

import string

class Proxy(Resource):
    def create(self,request):
        # URI to be called
        if request.POST.has_key('url'):
            url = request.POST['url']
        else:
            return HttpResponse(string_concat(['<error>',_(u"Url not specified"),'</error>']))

        # HTTP method, by default is GET
        if request.POST.has_key('method'):
            method = request.POST['method']
        else:
            method = "GET"

        # Params
        if request.POST.has_key('params'):
            params = request.POST['params']
	else:
	    params = ''

        # HTTP call
        try:
            # Request creation
            url = unquote(url)
            proto, host, cgi, param, query = urlparse.urlparse(url)[:5]
            
            # Proxy support
            proxy = ""
            try:
                proxy = settings.PROXY_SERVER
            except Exception:
                pass

            if (proxy != ""):
                conn = httplib.HTTPConnection("nube.hi.inet:8080")
            else:
                conn = httplib.HTTPConnection(host)
                
            # Add original request Headers to the request
            headers = {}
            for header in request.META.items():
                headers[header[0]] = header[1]
                
            # The same with cookies
            cookies = ''
            for cookie in request.COOKIES.items():
                cookies = cookies + cookie[0] + '=' + cookie[1] + '; '	
            headers['Cookie'] = cookies

            # Open the request
            if query != '':
                cgi = cgi + '?%s' % query
                
            if (proxy != ""):
                conn.request(method, url, params, headers)
            else:
                conn.request(method, cgi, params, headers)
	    	
            res = conn.getresponse()
                
            # Add content-type header to the response
            if res.getheader('content-type'):
                response = HttpResponse (res.read(), mimetype=res.getheader('content-type'))
            else:
                response = HttpResponse (res.read())

            # Add all the headers recieved to the response
            headers = res.getheaders()
            for header in headers:
                if is_valid_header (string.lower(header[0])):
                    response[header[0]] = header[1]
            return response
        except Exception, e:
            return HttpResponseServerError("<html><head><title>Error</title></head><body>%s</body></html>" % e, mimetype='text/html; charset=UTF-8')
