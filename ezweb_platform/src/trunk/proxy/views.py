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
