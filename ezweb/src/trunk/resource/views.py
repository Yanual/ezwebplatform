import sys
from urllib import urlopen, urlencode

from django.contrib.auth.models import User
from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db import transaction

from django.db import IntegrityError

from django_restapi.resource import Resource

from resource.models import GadgetResource
from resource.models import GadgetWiring
from resource.parser import TemplateParser
from tag.models import UserTag
from resource.utils import get_xml_description


class GadgetsCollection(Resource):

    @transaction.commit_manually
    def create(self,request, user_name):
	
        template_uri = request.__getitem__('template_uri')
        templateParser = None

	try:
            templateParser = TemplateParser(template_uri, user_name)
            templateParser.parse()
            transaction.commit()
        except IntegrityError:
            # Gadget already exists. Rollback transaction
            transaction.rollback()
	    value = str(sys.exc_info()[1])
	    xml_error = '<fault>\n\
	    <value>'+'Error'+'</value>\n\
	    <description>'+value+'</description>\n\
	    </fault>'
	    return HttpResponseServerError(xml_error,mimetype='text/xml; charset=UTF-8')
        except Exception, e:
            # Internal error
            transaction.rollback()
	    value = str(sys.exc_info()[1])
	    xml_error = '<fault>\n\
	    <value>'+'Error'+'</value>\n\
	    <description>'+value+'</description>\n\
	    </fault>'
	    return HttpResponseServerError(xml_error,mimetype='text/xml; charset=UTF-8')

	xml_ok = '<ResponseOK>OK</ResponseOK>'
        return HttpResponse(xml_ok,mimetype='text/xml; charset=UTF-8')


    def read(self,request, user_name, offset=0,pag=0):
		
        #paginate
	a= int(pag)
	b= int(offset)

        # Get the xml description for all the gadgets in the catalogue
	if a == 0 or b == 0:
	    response = get_xml_description(GadgetResource.objects.all())	
	# Get the xml description for the requested gadgets
	else:
	
	    c=((a-1)*b)
	    d= (b*a)
	
	    if a==1:
	        c=0
	
	    response = get_xml_description(GadgetResource.objects.all()[c:d])

		
	response = '<?xml version="1.0" encoding="UTF-8" ?>\n\
	<resources>'+response+'</resources>'
		
	return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

    
    def delete(self, request, user_name):

        vendor = request.__getitem__('vendor')
	name = request.__getitem__('name')
	version = request.__getitem__('version')
        resource=get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)
	
	# Delete the related wiring information for that gadget
	GadgetWiring.objects.filter(idResource=resource.id).delete()
	# Delete the related tags for that gadget
	UserTag.objects.filter(idResource=resource.id).delete()
	# Delete the object
	resource.delete()

        xml_ok = '<ResponseOK>OK</ResponseOK>'
	return HttpResponse(xml_ok,mimetype='text/xml; charset=UTF-8')


def addToPlatform(request, user_name):

    CONFIG='config.conf'
    
    cfg = ConfigParser.ConfigParser()
    try:
        cfg.readfp(file(CONFIG))
    except Exception, e:
        print "Error, couldn't read config  ", e.strerror
        return
     
    URL = cfg.get ('URL', 'URLeuropa'.lower())
    
    
    template_uri = request.__getitem__('template_uri')

    parameters = {
        'url': template_uri,
    }
	
    coreURL=URL
    uri='/user/'+user_name+'/gadgets'
    url=coreURL+uri

    response = urlopen(url, urlencode(parameters)).read()
	
    return HttpResponse(response,mimetype='text/xml; charset=UTF-8')