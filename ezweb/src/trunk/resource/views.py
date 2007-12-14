from resource.parser import TemplateHandler
from urllib import urlopen, urlencode
from django_restapi.resource import Resource
from resource.models import GadgetResource
from tag.models import UserTag
from tag.utils import get_tags_by_resource
from resource.utils import get_xml_description
from django.contrib.auth.models import User

from xml.sax import saxutils
from xml.sax import make_parser
from datetime import datetime
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import get_object_or_404, get_list_or_404
from django.core.paginator import ObjectPaginator, InvalidPage
import sys


class GadgetsCollection(Resource):

    def create(self,request, user_name):
	
        parser = make_parser()
	handler = TemplateHandler()
	
	# Tell the parser to use our handler
	parser.setContentHandler(handler)
	
	template_uri = request.__getitem__('template_uri')
		
	# Parse the input
	parser.parse(template_uri)
	#parser.parse("http://europa.ls.fi.upm.es/~mac/template.xml")
			
	gadget=GadgetResource()

	gadget.short_name=handler._name
	gadget.vendor=handler._vendor
	gadget.added_by_user_id = get_object_or_404(User, username=user_name).id
	gadget.version=handler._version
	gadget.author=handler._author
	gadget.description=handler._description
	gadget.mail=handler._mail
	gadget.image_uri=handler._imageURI
	gadget.wiki_page_uri=handler._wikiURI
	gadget.template_uri=template_uri
	gadget.creation_date=datetime.today()
	
	
	try:
	    gadget.save()
	except:
	    value = str(sys.exc_info()[1])
	    print value
	    xml_error = '<fault>\n\
	    <value>'+'Error'+'</value>\n\
	    <description>'+value+'</description>\n\
	    </fault>'
	    #+sys.exc_info()[2]'+</description></fault>'
	    return HttpResponseServerError(xml_error,mimetype='application/xml; charset=UTF-8')
			
	xml_ok = '<ResponseOK>OK</ResponseOK>'
	return HttpResponse(xml_ok,mimetype='application/xml; charset=UTF-8')


    def read(self,request, user_name, offset=0,pag=0):
		
        #paginate

	if offset == 0 and pag == 0:
		response = get_xml_description(GadgetResource.objects.all())	
	else:
	
		a= int(pag)
		b= int(offset)
		c=(a-1)*b +1
		d=b*a+1
	
		if a==1:
			c=0
	
		response = get_xml_description(GadgetResource.objects.all()[c:d])

		
	response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	<resources>'+response+'</resources>'
		
	return HttpResponse(response,mimetype='application/xml; charset=UTF-8')


class TagGadgetsCollection(Resource):

    def read(self, request, user_name, tag):
	
        taglist = get_list_or_404(UserTag,tag=tag)
	response=''
	
	for b in taglist:
        
	    gadgetlist = get_list_or_404(GadgetResource, id=b.idResource_id)
	    
	    temp = get_xml_description(gadgetlist)
	    response = response+temp

	response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	<resources>'+response+'</resources>'

        return HttpResponse(response,mimetype='application/xml; charset=UTF-8')


def addToPlatform(request, user_name):
	
    template_uri = request.__getitem__('template_uri')

    parameters = {
        'url': template_uri,
    }
	
    coreURL='http://europa.ls.fi.upm.es:8000'
    uri='/user/'+user_name+'/gadgets'
    url=coreURL+uri

    response = urlopen(url, urlencode(parameters)).read()
	
    return HttpResponse(response,mimetype='application/xml; charset=UTF-8')

