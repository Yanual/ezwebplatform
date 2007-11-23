from urllib import urlencode
from urllib2 import *
from django_restapi.resource import Resource
from django_restapi.responder import *

from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseServerError
import sys

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
	if (method == "GET"):
	    opener = build_opener()
	    request = Request (url)
	    try:
		return HttpResponse(opener.open(request))
	    except Exception, e:
		return HttpResponseServerError("<error>%s</error>" % e, mimetype='text/xml; charset=UTF-8')
	if (method== "POST"):
	    opener = build_opener()
	    request = Request (url,params)
	    try:
		return HttpResponse(opener.open(request))
	    except Exception, e:
		return HttpResponseServerError("<error>%s</error>" % e, mimetype='text/xml; charset=UTF-8')

