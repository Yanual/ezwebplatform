import sys

from django.db import IntegrityError

from django.http import HttpResponse, HttpResponseServerError
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User 
from django_restapi.resource import Resource

from xml.sax import make_parser
from xml.sax.xmlreader import InputSource

from tag.models import UserTag
from tag.utils import get_tags_by_resource, TagsXMLHandler
from resource.models import GadgetResource


class GadgetTagsCollection(Resource):

    def create(self,request, user_name, vendor, name, version):

        # Get the xml containing the tags from the request
        tags_xml = request.__getitem__('tags_xml')

        # Parse the xml containing the tags
	parser = make_parser()
	handler = TagsXMLHandler()

	# Tell the parser to use our handler
	parser.setContentHandler(handler)
		
	# Parse the input
	try:
            from StringIO import StringIO
        except ImportError:
	    from cStringIO import StringIO
	inpsrc = InputSource()
        inpsrc.setByteStream(StringIO(tags_xml))
        parser.parse(inpsrc)
	
        # Get the gadget's id for those vendor, name and version
        gadget_id = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version).id

	# Get the user's id for that user_name
	user_id = get_object_or_404(User, username=user_name).id
	
	# Insert the tags for these resource and user in the database
	for e in handler._tags:
	    try:
	        UserTag.objects.get_or_create(tag=e, idUser=user_id, idResource=gadget_id)
	    except:
	        value = str(sys.exc_info()[1])
	        xml_error = '<fault>\n\
	        <value>'+'Error'+'</value>\n\
	        <description>'+value+'</description>\n\
	        </fault>'
	        #+sys.exc_info()[2]'+</description></fault>'
	        return HttpResponseServerError(xml_error,mimetype='text/xml; charset=UTF-8')

        response = '<?xml version="1.0" encoding="UTF-8" ?>\n'
	response += get_tags_by_resource(gadget_id, user_id)
	return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

	
    def read(self,request,user_name,vendor,name,version):
		
        # Get the gadget's id for those vendor, name and version
        gadget_id = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version).id

	# Get the user's id for that user_name
	user_id = get_object_or_404(User, username=user_name).id
			
	response = '<?xml version="1.0" encoding="UTF-8" ?>\n'
	response += get_tags_by_resource(gadget_id, user_id)
	return HttpResponse(response,mimetype='text/xml; charset=UTF-8')


    def delete(self,request,user_name,vendor,name,version):
				
	value_tag = request.__getitem__('value_tag')
	id_resource = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version).id
	user_id = get_object_or_404(User, username=user_name).id

	try:
	    tag = get_object_or_404(UserTag, idUser=user_id,idResource=id_resource,tag=value_tag)
	except:
	    xml_error = '<fault>\n\
	    <value>'+'Error'+'</value>\n\
	    <description>'+'Fallo de autorizacion, no tiene permiso para borrar'+'</description>\n\
	    </fault>'
	    return HttpResponseServerError(xml_error,mimetype='text/xml; charset=UTF-8')
	
	tag.delete()

	response = '<?xml version="1.0" encoding="UTF-8" ?>\n'
	response += get_tags_by_resource(gadget_id, user_id)
	return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

				
