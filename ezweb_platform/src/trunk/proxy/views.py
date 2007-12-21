"""
/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */
"""

from urllib2 import *
from django_restapi.resource import Resource
from django_restapi.responder import *
from proxy.utils import is_valid_header

from django.http import Http404, HttpResponse, HttpResponseServerError
import string

class Proxy(Resource):

    def create(self,request):
	# URI to be called
	if request.POST.has_key('url'):
            url = request.POST['url']
        else:
            return HttpResponse("<error>Url not specified</error>")
	# HTTP method, by default is GET
	if request.POST.has_key('method'):
            method = request.POST['method']
        else:
            method = "GET"

	# Params
	if request.POST.has_key('params'):
            params = request.POST['params']
 	
	# HTTP call
	try:
	    # Request creation
            req = Request (url)
	    # Add POST parameters
	    if (method=="POST"):
		req.add_data(params)
	    # Add original request Headers to the request
	    for header in request.META.items():
	   	req.add_header(header[0],header[1])
	    # The same with cookies
	    cookies = ''
	    for cookie in request.COOKIES.items():
		cookies = cookies + cookie[0] + '=' + cookie[1] + '; '	
	    req.add_header('Cookie', cookies)
	    # Open the request
	    file = urlopen(req)
	    # Add content-type header to the response
	    if file.info().has_key('content-type'):
	    	response = HttpResponse (file.read(),mimetype=file.info()['content-type'])
	    else:
		response = HttpResponse (file.read())
	    # Add all the headers recieved to the response
	    headers = file.info().items()
	    for header in headers:
		if is_valid_header (string.lower(header[0])):
		    response[header[0]] = header[1]
	    return response
	except Exception, e:
	    return HttpResponseServerError("<html><head><title>Error</title></head><body>%s</body></html>" % e, mimetype='text/html; charset=UTF-8')
