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

from django.shortcuts import get_object_or_404, get_list_or_404

from django.core import serializers

from gadget.models import Template, Gadget, XHTML, GadgetContext, ExternalContext, UserPrefOption
from igadget.models import Variable, VariableDef, Position, IGadget
from connectable.models import In, Out
from context.models import Concept, ConceptName

def get_wiring_variable_data(var, ig):
    res_data = {}

    res_data['name'] = var.vardef.name
    res_data['aspect'] = var.vardef.aspect
    res_data['type'] = var.vardef.type
    res_data['value'] = var.value
    res_data['friend_code'] = var.vardef.friend_code
    res_data['code'] = ig.code
    res_data['igadget_code'] = ig.code
    res_data['igadget_pk'] = ig.pk

    return res_data


def get_wiring_data(igadgets):
    res_data = [] 

    for ig in igadgets:
        variables = Variable.objects.filter(igadget=ig)

        igObject = {}
        list = []

        igObject['code'] = ig.code
        igObject['pk'] = ig.pk

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
    data_variabledef = VariableDef.objects.filter(template=data_template.id)
    data_vars = []
    for var in data_variabledef:
        data_var = {}
        data_var['aspect'] = var.aspect
        data_var['name'] = var.name
        data_var['type'] = var.type
        data_var['label'] = var.label
        data_var['description'] = var.description
        data_var['friend_code'] = var.friend_code
        data_var['default_value'] = var.default_value
        
        if var.aspect == 'PREF' and var.type == 'L':
            options = UserPrefOption.objects.filter(variableDef=var.id)
            value_options = []
            for option in options:
                value_options.append([option.value, option.name]);
            data_var['value_options'] = value_options;
        
        if var.aspect == 'GCTX':
            data_var['concept'] = var.gadgetcontext_set.all().values('concept')[0]['concept']
        if var.aspect == 'ECTX':
            data_var['concept'] = var.externalcontext_set.all().values('concept')[0]['concept']
        
        data_vars.append(data_var)
    
    data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])

    data_ret['name'] = data_fields['name']
    data_ret['vendor'] = data_fields['vendor']
    data_ret['description'] = data_fields['description']
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
    data_ret['template']['variables'] = data_vars
    data_ret['image'] = data_template.image
    data_ret['xhtml'] = data_code

    return data_ret


def get_input_data (inout):
    all_inputs = []
    inputs = In.objects.filter(inout=inout)    
    for ins in inputs:
        input_data = {}
        input_data['pk'] = ins.pk
        input_data['name'] = ins.name
        input_data['igadget_pk'] = ins.variable.igadget.pk
        input_data['igadget_code'] = ins.variable.igadget.code
        all_inputs.append(input_data)
    return all_inputs
    
def get_output_data (inout):
    all_outputs = []
    outputs = Out.objects.filter(inout=inout)    
    for outs in outputs:
        output_data = {}
        output_data['pk'] = outs.pk
        output_data['name'] = outs.name
        output_data['igadget_pk'] = outs.variable.igadget.pk
        output_data['igadget_code'] = outs.variable.igadget.code
        all_outputs.append(output_data)
    return all_outputs    
    

def get_inout_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['pk'] = data['pk']
    data_ret['friend_code'] = data_fields['friend_code']
    data_ret['value'] = data_fields['value']
    data_ret['name'] = data_fields['name']
    
    data_ins = get_input_data(inout=data['pk'])
    data_ret['ins'] = [d for d in data_ins]
    
    data_outs = get_output_data(inout=data['pk'])
    data_ret['outs'] = [d for d in data_outs]
        
    return data_ret

def get_tabspace_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['pk'] = data['pk']
    data_ret['name'] = data_fields['name']
    if data_fields['active']:
        data_ret['active'] = "true"
    else:
        data_ret['active'] = "false"
    return data_ret

def get_tab_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['pk'] = data['pk']
    data_ret['name'] = data_fields['name']
    if data_fields['visible']:
        data_ret['visible'] = "true"
    else:
        data_ret['visible'] = "false"
    return data_ret

def get_igadget_data(data):
    data_ret = {}
    data_fields = data['fields']

    gadget = Gadget.objects.get(pk=data_fields['gadget'])
    position = Position.objects.get(pk=data_fields['position'])

    data_ret['pk'] = data['pk']
    data_ret['code'] = data_fields['code']
    data_ret['tab'] = data_fields['tab']
    data_ret['gadget'] = gadget.uri
    data_ret['top'] = position.posY 
    data_ret['left'] = position.posX
    data_ret['width'] = position.width
    data_ret['height'] = position.height
    if position.minimized:
          data_ret['minimized'] = "true"
    else:
          data_ret['minimized'] = "false"
    variables = Variable.objects.filter (igadget__pk=data['pk'])
    data = serializers.serialize('python', variables, ensure_ascii=False)
    data_ret['variables'] = [get_variable_data(d) for d in data]
   
    return data_ret

def get_variable_data(data):
    data_ret = {}
    data_fields = data['fields']
    
    var_def = VariableDef.objects.get(id=data_fields['vardef'])
   
    data_ret['name'] = var_def.name
    data_ret['aspect'] = var_def.aspect
    
    if var_def.aspect == 'GCTX':
          context = GadgetContext.objects.get(varDef=data_fields['vardef'])
          data_ret['concept'] = context.concept
    if var_def.aspect == 'ECTX':
          context = ExternalContext.objects.get(varDef=data_fields['vardef'])
          data_ret['concept'] = context.concept
    data_ret['value'] = data_fields['value']
    
    return data_ret

def get_concept_data(data):
    data_ret = {}
    data_fields = data['fields']
    
    cnames = ConceptName.objects.filter(concept=data['pk']).values('name')

    data_ret['concept'] = data['pk']
    data_ret['adaptor'] = data_fields['adaptor']
    data_ret['names'] = [cname['name'] for cname in cnames] 
    
    return data_ret
