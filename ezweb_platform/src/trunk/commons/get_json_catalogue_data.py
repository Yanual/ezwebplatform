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

from resource.models import GadgetWiring
from tag.models import UserTag

def get_tag_data (gadget_id, user_id):
    all_tags = []
    tags = UserTag.objects.filter(idResource=gadget_id)    
    for t in tags:
        tag_data = {}
        tag_data['value'] = t.tag
	if t.idUser_id == user_id:
	    tag_data['added_by'] = 'Yes'
	else:
	    tag_data['added_by'] = 'No'
        all_tags.append(tag_data)
    
    return all_tags

def get_event_data (gadget_id):
    all_events = []
    events = GadgetWiring.objects.filter(idResource=gadget_id, wiring='out')    
    for e in events:
        event_data = {}
        event_data['friendcode'] = e.friendcode
        all_events.append(event_data)
    return all_events
    
def get_slot_data (gadget_id):
    all_slots = []
    slots = GadgetWiring.objects.filter(idResource=gadget_id, wiring='in') 
    for s in slots:
        slot_data = {}
        slot_data['friendcode'] = s.friendcode
        all_slots.append(slot_data)
    return all_slots

def get_gadgetresource_data(data, user):
    data_ret = {}
    data_fields = data['fields']
    data_ret['vendor'] = data_fields['vendor']
    data_ret['name'] = data_fields['short_name']
    data_ret['version'] = data_fields['version']
    data_ret['author'] = data_fields['author']
    data_ret['mail'] = data_fields['mail']
    data_ret['description'] = data_fields['description']
    data_ret['uriImage'] = data_fields['image_uri']
    data_ret['uriWiki'] = data_fields['wiki_page_uri']
    data_ret['uriTemplate'] = data_fields['template_uri']
    
    if data_fields['added_by_user'] == user.id:
        data_ret['added_by'] = 'Yes'
    else:
	data_ret['added_by'] = 'No'

    data_tags = get_tag_data(gadget_id=data['pk'], user_id=user.id)
    data_ret['tags'] = [d for d in data_tags]

    data_events = get_event_data(gadget_id=data['pk'])
    data_ret['events'] = [d for d in data_events]
    
    data_slots = get_slot_data(gadget_id=data['pk'])
    data_ret['slots'] = [d for d in data_slots]
        
    return data_ret