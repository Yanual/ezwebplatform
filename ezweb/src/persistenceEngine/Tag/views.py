# Create your views here.
from catalogue.Tag.models import userTag
from catalogue.Resource.models import gadgetResource
from django_restapi.resource import Resource
import sys
from django.http import Http404, HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import get_object_or_404

class GadgetTagsCollection(Resource):

	def create(self,request, user_id, vendor, name, version):

		# Get the tag from the request
		tag_content = request.__getitem__('tag')
		
		tag = userTag()
		
		# Get the gadget's id for those vendor, name and version
		gadget_id = get_object_or_404(gadgetResource, short_name=name,vendor=vendor,version=version).id

		tag.tag = tag_content
		tag.idUser_id = user_id
		tag.idResource_id = gadget_id
	
		try:
			tag.save()
		except:
			value = str(sys.exc_info()[1])
			print value
			xml_error = '<fault>\n\
			<value>'+'Error'+'</value>\n\
			<description>'+value+'</description>\n\
			</fault>'
			#+sys.exc_info()[2]'+</description></fault>'
			return HttpResponse(xml_error,mimetype='text/xml; charset=UTF-8')
			
		xml_ok = '<ResponseOK>OK</ResponseOK>'
		return HttpResponse(xml_ok,mimetype='text/xml; charset=UTF-8')

	
	def read(self,request,user_id,vendor,name,version):
		
		b = get_object_or_404(gadgetResource, short_name=name,vendor=vendor,version=version)
		
		xml_tag=''
		
		for e in userTag.objects.filter(idResource=b.id):
			xml_tag +='<Tag>\n\
			<Value>'+e.tag+'</Value>\n\
			</Tag>'
			
		response='<Tags>'+xml_tag+'</Tags>'
		return HttpResponse(response,mimetype='text/xml; charset=UTF-8')

	
