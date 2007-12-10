# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404

from django.core import serializers

from gadget.models import Template, Gadget, XHTML, Tag, UserEventsInfo
from igadget.models import Variable, VariableDef, Position, IGadget
from connectable.models import In, Out

def get_wiring_variable_data(var, ig):
    res_data = {}

    res_data['name'] = var.vardef.name
    res_data['aspect'] = var.vardef.aspect
    res_data['type'] = var.vardef.type
    res_data['uri'] = var.uri
    res_data['value'] = var.value
    res_data['id'] = ig.code

    return res_data


def get_wiring_data(igadgets):
    res_data = [] 

    for ig in igadgets:
        variables = Variable.objects.filter(igadget=ig)

        igObject = {}
        list = []

        igObject['id'] = ig.code
        igObject['uri'] = ig.uri

        #Searching wiring variables
        for var in variables:
            varDef = var.vardef

            if varDef.aspect == 'SLOT' or varDef.aspect == 'EVEN':
                list.append(get_wiring_variable_data(var, ig))

        igObject['list'] = list

        res_data.append(igObject)
       
    return res_data


def get_gadget_data(data):
    data_ret = {}
    data_fields = data['fields']

    data_template = get_object_or_404(Template, id=data_fields['template'])
    data_variabledef = VariableDef.objects.filter(template=data_template.id).values('aspect', 'name', 'type', 'label', 'description', 'friend_code', 'default_value')
    data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])
    data_elements = UserEventsInfo.objects.filter(xhtml=data_fields['xhtml']).values('event', 'handler', 'html_element')

    data_ret['name'] = data_fields['name']
    data_ret['vendor'] = data_fields['vendor']
    data_ret['description'] = data_fields['description']
    data_ret['tags'] = data_fields['tags']
    data_ret['uri'] = data_fields['uri']
    data_ret['wikiURI'] = data_fields['wikiURI']
    data_ret['imageURI'] = data_fields['imageURI']
    data_ret['version'] = data_fields['version']
    data_ret['user'] = data_fields['user']
    data_ret['mail'] = data_fields['mail']
    data_ret['shared'] = data_fields['shared']
    data_ret['last_update'] = data_fields['last_update']
    data_ret['template'] = {}
    data_ret['template']['size'] = {}
    data_ret['template']['size']['width'] = data_template.width
    data_ret['template']['size']['height'] = data_template.height
    data_ret['template']['variables'] = data_variabledef
    data_ret['image'] = data_template.image
    data_ret['xhtml'] = data_code
    data_ret['xhtml']['elements'] = data_elements

    return data_ret



def get_in_data (inout):
    pass

def get_inout_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['uri'] = data_fields['uri']
    data_ret['friend_code'] = data_fields['friend_code']
    data_ret['value'] = data_fields['value']
    data_ret['name'] = data_fields['name']
    
    data_ins = get_list_or_404(In.objects.all().values('uri', 'name'), inout=data['pk'])
    data_ret['ins'] = [d for d in data_ins]
    
    data_outs = get_list_or_404(Out.objects.all().values('uri', 'name'), inout=data['pk'])
    data_ret['outs'] = [d for d in data_outs]
        
    return data_ret


def get_igadget_data(data):
    data_ret = {}
    data_fields = data['fields']

    gadget = Gadget.objects.get(pk=data_fields['gadget'])
    position = Position.objects.get(pk=data_fields['position'])

    data_ret['id'] = data_fields['code']
    data_ret['uri'] = data_fields['uri']
    data_ret['gadget'] = gadget.uri
    data_ret['top'] = position.posY 
    data_ret['left'] = position.posX
    data_ret['width'] = position.width
    data_ret['height'] = position.height
       
    return data_ret

def get_variable_data(var_name, data):
    data_ret = {}
    data_fields = data['fields']
    
    data_ret['name'] = var_name 
    data_ret['value'] = data_fields['value']
       
    return data_ret



