# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404

from gadget.models import Template, Gadget, XHTML, Tag, UserEventsInfo
from igadget.models import Variable, VariableDef
from connectable.models import In, Out


def get_gadget_data(data):
    data_fields = data['fields']

    data_image = get_object_or_404(Template, id=data_fields['template'])
    data_fields['image'] = data_image.image

    data_template = get_list_or_404(VariableDef.objects.all().values('aspect', 'name', 'type'), id=data_fields['template'])
    data_fields['template'] = data_template

    data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])
    data_elements = get_list_or_404(UserEventsInfo.objects.all().values('event', 'handler', 'html_element'), \
                xhtml=data_fields['xhtml'])
    data_fields['xhtml'] = data_code
    data_fields['xhtml']['elements'] = data_elements

    data_tags = get_list_or_404(Tag.objects.all().values('value'), gadget=get_object_or_404( \
                Gadget, vendor=data_fields['vendor'], name=data_fields['name'], version=data_fields['version']))
    data_fields['tags'] = [d['value'] for d in data_tags]
    
    return data_fields


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
    data_ret['uri'] = data_fields['uri']
    
    data_variables = get_list_or_404(Variable.objects.all().values('vardef', 'value'), igadget=data['pk'])
    data_ret['variables'] = {}
    for data_variable in data_variables:
        data_vardef = get_object_or_404(VariableDef.objects.all().values('name', 'aspect', 'type'), id=data_variable['vardef'])
        data_ret['variables'] = data_vardef
        data_ret['variables']['value'] = data_variable['value']
    
    return data_ret
