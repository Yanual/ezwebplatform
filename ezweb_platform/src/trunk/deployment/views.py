﻿# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#
#
from os import path, remove, chdir, mkdir
from urllib import pathname2url
from shutil import rmtree
from django.http import HttpResponse, HttpResponseServerError
from django.http import HttpResponseForbidden, HttpResponseBadRequest 
from django.http import HttpResponseRedirect
from django.utils import simplejson
from django.utils.translation import ugettext as _
from commons.resource import Resource
from commons.authentication import user_authentication, Http403
from commons.logs import log
from commons.logs_exception import TracedServerError
from commons.utils import get_xml_error
from wgtPackageUtils import WgtPackageUtils
from settings import BASEDIR as BASEDIR_PLATFORM
from xml.dom.minidom import parse # XML Parser
from ezweb.views import add_gadget_script
import re

class Resources(Resource):

	def create(self, request):
		# Deployment Info
		info = InfoDeployment(request)
		
		try:
			user = user_authentication(request, request.user.username)
		except Http403, e:
			msg = _("This gadget cannot be created") + unicode(e)
			log (msg, request)
			return HttpResponseForbidden(get_xml_error(msg),
																		mimetype='application/xml; charset=UTF-8')

		try:
			# Create temporal folder, user temporal folder and gadgets folder
			info.create_folder(info.TMPDIR)
			info.create_folder(info.USERTMPDIR)
			info.create_folder(info.GADGETSDIR)
		except Exception, e:
			msg = _("This gadget could not be created: %(errorMsg)s") % {'errorMsg': e.message}
			raise TracedServerError(e, {}, request, msg)		
	
		# Copy .wgt file into user temporal folder and extract file .wgt into 
		# gadgets folder
		try:
			file_wgt = request.FILES['file']
			f = open(path.join(info.USERTMPDIR, file_wgt.name), "w")
			f.write(file_wgt.read())
			f.close()

			# Extract file .wgt into temporal folder
			pkg = WgtPackageUtils()
			pkg.extract(path.join(info.USERTMPDIR, file_wgt.name), 
									path.join(info.USERTMPDIR, file_wgt.name.split(".wgt")[0]))
			# Parser XML config file
			xmlDoc = parse(path.join(info.USERTMPDIR, 
											path.join(file_wgt.name.split(".wgt")[0], 'config.xml')))
			info.get_info_config(xmlDoc, request)

			# Extract .wgt file in user gadget folder
			info.create_folder(info.USERGADGETSDIR)
			info.create_folder(path.join(info.USERGADGETSDIR, info.VENDOR))
			info.create_folder(path.join(info.USERGADGETSDIR, 
																		path.join(info.VENDOR, info.NAME)))
			info.remove_dir(path.join(info.USERGADGETSDIR, 
																path.join(info.VENDOR, 
																path.join(info.NAME, info.VERSION))))
			info.create_folder(path.join(info.USERGADGETSDIR, 
																	path.join(info.VENDOR, 
																						path.join(info.NAME, 
																											info.VERSION))))
			pkg.extract(path.join(info.USERTMPDIR, file_wgt.name), 
									path.join(info.USERGADGETSDIR, 
														path.join(path.join(info.VENDOR, 
																								path.join(info.NAME, 
					 																									info.VERSION)))))

			# Remove temporal dir and .wgt file
			info.remove_file(path.join(info.USERTMPDIR, file_wgt.name))
			info.remove_dir(path.join(info.USERTMPDIR, file_wgt.name.split(".wgt")[0]))
											
			# Change links XHTML Tag and Image tag in template gadget
			xmlDoc = parse(path.join(path.join(info.USERGADGETSDIR,
																						path.join(info.VENDOR, 
																						path.join(info.NAME, 
																						path.join(info.VERSION, info.ID))))))																								
			xmlDoc = info.get_new_template(xmlDoc)
			f = open(path.join(path.join(info.USERGADGETSDIR,
																						path.join(info.VENDOR, 
																						path.join(info.NAME, 
																						path.join(info.VERSION, info.ID))))), 'w')
			f.write(xmlDoc.toxml())
			f.close()
			
			# Redirect to EzWeb to add_gadget_script function
			request.POST.appendlist(unicode('template_uri'), info.URLTEMPLATE)
			response = add_gadget_script(request, fromWGT=True)

			if (response.status_code != 200):
			  # Redirect if the param "add_to_ws" isn't in the request
				if (not request.POST.has_key('add_to_ws')):
					return HttpResponseRedirect('#error')
				# Redirect if the value of param "add_to_ws" isn't 'on'
				if (request.POST.has_key('add_to_ws') and request.POST['add_to_ws'] == 'on'):
					return HttpResponseRedirect('#error')
      
		except TracedServerError, e:
		  raise e
		except Exception, e:
			msg = _("This gadget could not be created: %(errorMsg)s") % {'errorMsg': e.message}
			raise TracedServerError(e, {}, request, msg)

		return response
		
	def update(self, request):
		return self.create(request)
			
	def read(self, request, username, vendor, name, version):	
		
		# Get info deployment
		info = InfoDeployment(request)
		
		try:
			user = user_authentication(request, request.user.username)
		except Http403, e:
			msg = _("This gadget could not be exported") + unicode(e)
			log (msg, request)
			return HttpResponseForbidden(get_xml_error(msg), 
																		mimetype='application/xml; charset=UTF-8')

		# Create temporal folder and user folder
		try:
			info.create_folder(info.TMPDIR)
			info.create_folder(info.USERTMPDIR)
			
			# Parser XML config file
			xmlDoc = parse(path.join(info.GADGETSDIR, 
																	path.join(username, 
																	path.join(vendor, 
																	path.join(name, 
																	path.join(version,'config.xml'))))))
			info.get_info_config(xmlDoc, request)

			# Get template file
			xmlDoc = parse(path.join(info.GADGETSDIR, 
																	path.join(username, 
																	path.join(vendor, 
																	path.join(name, 
																	path.join(version,info.ID))))))
			# Get backup template file
			xmlDocCopy = parse(path.join(info.GADGETSDIR, 
																	path.join(username, 
																	path.join(vendor, 
																	path.join(name, 
																	path.join(version,info.ID))))))																	

			# Restore original template
			xmlDoc = info.return_original_template(xmlDoc, username, vendor, name, version)
			f = open(path.join(info.GADGETSDIR, 
																	path.join(username, 
																	path.join(vendor, 
																	path.join(name, 
																	path.join(version,info.ID))))), 'w')
			f.write(xmlDoc.toxml())
			f.close()
						
			info.change_working_folder(path.join(info.GADGETSDIR, path.join(username, 
																	path.join(vendor, path.join(name, version)))))
			pkg = WgtPackageUtils()
			pkg.create('./',path.join(info.USERTMPDIR, vendor+'_'+name+'_'+version))					
			file_wgt = open(path.join(info.USERTMPDIR, vendor+'_'+name+'_'+version+'.wgt'), 'r')
			content_file = file_wgt.read()
			file_wgt.close()			
			info.change_working_folder(BASEDIR_PLATFORM)

			# Restore template with backup
			# Restore original template
			f = open(path.join(info.GADGETSDIR, 
																	path.join(username, 
																	path.join(vendor, 
																	path.join(name, 
																	path.join(version,info.ID))))), 'w')
			f.write(xmlDocCopy.toxml())
			f.close()			

			# Return .wgt file 
			response = HttpResponse(content_file, mimetype='application/zip')
			response['Content-Disposition'] = 'attachment; filename='+vendor+'_'+name+'_'+version+'.wgt'
			# Remove .wgt file 
			info.remove_file(path.join(info.USERTMPDIR, vendor+'_'+name+'_'+version+'.wgt'))
		except Exception, e:
			msg = _("This gadget could not be exported: %(errorMsg)s") % {'errorMsg': e.message}
			raise TracedServerError(e, {}, request, msg)
		return response

		
class InfoDeployment:
	def __init__(self,request):
		# Info folders
		self.BASEDIR = path.dirname(path.abspath(__file__))
		self.TMPDIR = path.join(self.BASEDIR, 'tmp')
		self.GADGETSDIR = path.join(self.BASEDIR,'gadgets')
		self.USERTMPDIR = path.join(self.BASEDIR, path.join('tmp', 
																												request.user.username))
		self.USERGADGETSDIR = path.join(self.BASEDIR,path.join('gadgets',
																												request.user.username))
	# Create a new folder
	def create_folder(self, folder):
		if (not path.exists(folder)) or ((path.exists(folder)) and (not path.isdir(folder))):
				mkdir(folder)
				
	# Change working folder
	def change_working_folder(self, folder):
		chdir(folder)
	
	# Remove a file
	def remove_file(self, file):
		remove(file)
		
	# Remove a directory
	def remove_dir(self, folder):
		if(path.exists(folder)) or (path.isdir(folder)):
			rmtree(folder,ignore_errors=True)
		
	# Parser info config.xml
	def get_info_config(self, xmldoc, request):
		widget = xmldoc.getElementsByTagName("widget")[0]
		# Info config
		self.ID = widget.getAttribute("id")
		self.USERNAME = request.user.username.replace(" ", "_")
		self.NAME = widget.getAttribute("name").replace(" ", "_")
		self.VERSION = widget.getAttribute("version")
		self.VENDOR = widget.getAttribute("vendor").replace(" ", "_")
		self.HTTP_HOST = request.META['HTTP_HOST']
		self.PATH_INFO = request.META['PATH_INFO']


		if(request.META['SERVER_PROTOCOL'].lower().find('https') >= 0):
			self.URL = "https://%s" % self.HTTP_HOST
		else:
			self.URL = "http://%s" % self.HTTP_HOST 
		
		# the new url of template	
		self.URLTEMPLATE=path.join(self.PATH_INFO, 
													path.join(pathname2url(self.USERNAME),
													path.join(pathname2url(self.VENDOR),
													path.join(pathname2url(self.NAME),
													path.join(pathname2url(self.VERSION),
													path.join(pathname2url(self.ID)))))))

	# Decides if the url is absolute
	def _is_absolute(self, url):
		return (url.startswith("http"))
		
	# Return a new gadget template with parsed links 
	def get_new_template(self, xmldoc):
		# Set href in XHML Tag
		xhtml = xmldoc.getElementsByTagName("XHTML")[0]
		href=xhtml.getAttribute("href")

		if not self._is_absolute(href):
			href = path.join(self.PATH_INFO, 
													path.join(pathname2url(self.USERNAME),
													path.join(pathname2url(self.VENDOR),
													path.join(pathname2url(self.NAME),
													path.join(pathname2url(self.VERSION),
													path.join(href))))))
			xhtml.setAttribute("href", href)		
			
		# ImageURI
		if xmldoc.getElementsByTagName("ImageURI"):
			imageURI = xmldoc.getElementsByTagName("ImageURI")[0]
			imageURL = imageURI.firstChild.nodeValue
			if not self._is_absolute(imageURL):			
				imageURL = path.join(self.PATH_INFO, 
														path.join(pathname2url(self.USERNAME),
														path.join(pathname2url(self.VENDOR),
														path.join(pathname2url(self.NAME),
														path.join(pathname2url(self.VERSION),
														path.join(imageURL))))))
				imageURI.firstChild.replaceWholeText(imageURL)
		
		# Wiki URI
		if xmldoc.getElementsByTagName("WikiURI"):
			wikiURI = xmldoc.getElementsByTagName("WikiURI")[0]
			wikiURL = wikiURI.firstChild.nodeValue
			if not self._is_absolute(wikiURL):
				wikiURL = path.join(self.PATH_INFO, 
														path.join(pathname2url(self.USERNAME),
														path.join(pathname2url(self.VENDOR),
														path.join(pathname2url(self.NAME),
														path.join(pathname2url(self.VERSION),
														path.join(wikiURL))))))
				wikiURI.firstChild.replaceWholeText(wikiURL)

		# iPhoneImageURI
		if xmldoc.getElementsByTagName("iPhoneImageURI"):
			iPhoneImageURI = xmldoc.getElementsByTagName("iPhoneImageURI")[0]
			iPhoneImageURL = iPhoneImageURI.firstChild.nodeValue
			if not self._is_absolute(iPhoneImageURL):
				iPhoneImageURL = path.join(self.PATH_INFO, 
													path.join(pathname2url(self.USERNAME),
													path.join(pathname2url(self.VENDOR),
													path.join(pathname2url(self.NAME),
													path.join(pathname2url(self.VERSION),
													path.join(iPhoneImageURL))))))
				iPhoneImageURI.firstChild.replaceWholeText(iPhoneImageURL)
		return xmldoc
		
	# Return a new gadget template with parsed links 
	def return_original_template(self, xmldoc, username, vendor, name, version):
		exp = re.compile('.*deployment/gadgets/'+username+'/'+vendor+'/'+name+'/'+version+'/(?P<element>.*)$')

		# Attribute href in XHTML Tag
		if xmldoc.getElementsByTagName("XHTML"):
			xhtml = xmldoc.getElementsByTagName("XHTML")[0]
			href=xhtml.getAttribute("href")

			if exp.search(href):
				v = exp.search(href)
				href = v.group("element")
				xhtml.setAttribute("href", href)
						
		# ImageURI
		if xmldoc.getElementsByTagName("ImageURI"):
			imageURI = xmldoc.getElementsByTagName("ImageURI")[0]
			imageURL = imageURI.firstChild.nodeValue
			if exp.search(imageURL):
				v = exp.search(imageURL)
				imageURL = v.group("element")
				imageURI.firstChild.replaceWholeText(imageURL)
		
		# Wiki URI
		if xmldoc.getElementsByTagName("WikiURI"):
			wikiURI = xmldoc.getElementsByTagName("WikiURI")[0]
			wikiURL = wikiURI.firstChild.nodeValue
			if exp.search(wikiURL):
				v = exp.search(wikiURL)
				wikiURL = v.group("element")
				wikiURI.firstChild.replaceWholeText(wikiURL)

		# iPhoneImageURI
		if xmldoc.getElementsByTagName("iPhoneImageURI"):
			iPhoneImageURI = xmldoc.getElementsByTagName("iPhoneImageURI")[0]
			iPhoneImageURL = iPhoneImageURI.firstChild.nodeValue
			if exp.search(iPhoneImageURL):
				v = exp.search(iPhoneImageURL)			
				iPhoneImageURL = v.group("element")
				iPhoneImageURI.firstChild.replaceWholeText(iPhoneImageURL)
		return xmldoc
		
	



		
	
		

