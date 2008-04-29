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

from django.db import IntegrityError

from django.http import HttpResponse, HttpResponseServerError, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User 
from django_restapi.resource import Resource
from django.utils.translation import ugettext as _

from voting.models import UserVote
from resource.models import GadgetResource

from commons.authentication import *
from commons.catalogue_utils import get_vote_response
from commons.logs import log
from commons.utils import get_xml_error


def update_popularity(gadget):
    #Get all the votes on this gadget
    votes = UserVote.objects.filter(idResource=gadget)
    #Get the number of votes
    votes_number = UserVote.objects.filter(idResource=gadget).count()
    #Sum all the votes
    votes_sum = 0.0
    for e in votes:
        votes_sum = votes_sum + e.vote
    #Calculate the gadget popularity
    popularity = get_popularity(votes_sum,votes_number)
    #Update the gadget in the database
    gadget.popularity = popularity
    gadget.save()


def get_popularity(votes_sum, votes_number):
    floor = votes_sum//votes_number
    mod = votes_sum % votes_number
    mod = mod/votes_number

    if mod <= 0.25:
        mod = 0.0
    elif mod > 0.75:
        mod = 1.0
    else:
        mod = 0.5
    result = floor + mod
    return result


class GadgetVotesCollection(Resource):

    def create(self,request, user_name, vendor, name, version):

    	try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

        user = user_authentication(request, user_name)

	# Get the vote from the request
	vote = request.__getitem__('vote')

	# Get the gadget's id for those vendor, name and version
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)

        # Insert the vote for these resource and user in the database
        try:
            UserVote.objects.create(vote=vote, idUser=user, idResource=gadget)
        except Exception, ex:
            log (ex, request)
            return HttpResponseServerError(get_xml_error(unicode(ex)), mimetype='application/xml; charset=UTF-8')

	try:
	    update_popularity(gadget)
	except Exception, ex:
            log (ex, request)
            return HttpResponseServerError(get_xml_error(unicode(ex)), mimetype='application/xml; charset=UTF-8')

        return get_vote_response(gadget,user, format)


    def read(self,request,user_name,vendor,name,version):

        try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

	# Get the gadget's id for those vendor, name and version
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)

	# Get the user's id for that user_name
	user = user_authentication(request, user_name)

	return get_vote_response(gadget,user, format)


    def update(self,request,user_name,vendor,name,version):

    	try:
	    format = request.__getitem__('format')
	except:
	    format = 'default'

        user = user_authentication(request, user_name)

	# Get the vote from the request
	vote = request.PUT['vote']

	# Get the gadget's id for those vendor, name and version
        gadget = get_object_or_404(GadgetResource, short_name=name,vendor=vendor,version=version)

        # Insert the vote for these resource and user in the database
        try:
            userVote = get_object_or_404(UserVote, idUser=user, idResource=gadget)
	    userVote.vote = vote
	    userVote.save()
        except Exception, ex:
            log (ex, request)
            return HttpResponseServerError(get_xml_error(unicode(ex)), mimetype='application/xml; charset=UTF-8')

	try:
	    update_popularity(gadget)
	except Exception, ex:
            log (ex, request)
            return HttpResponseServerError(get_xml_error(unicode(ex)), mimetype='application/xml; charset=UTF-8')

        return get_vote_response(gadget,user, format)
