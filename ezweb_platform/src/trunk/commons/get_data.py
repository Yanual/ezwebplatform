/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404

from django.core import serializers

from gadget.models import Template, Gadget, XHTML
from igadget.models import Variable, VariableDef, Position, IGadget
from connectable.models import In, Out

def get_wiring_variable_data(var, ig):
    res_data = {}

    res_data['name'] = var.vardef.name
    res_data['aspect'] = var.vardef.aspect
    res_data['type'] = var.vardef.type
    res_data['uri'] = var.uri
    res_data['value'] = var.value
    res_data['friend_code'] = var.vardef.friend_code
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
    data_ret['template']['variables'] = data_variabledef
    data_ret['image'] = data_template.image
    data_ret['xhtml'] = data_code

    return data_ret


def get_input_data (inout):
    all_inputs = []
    inputs = In.objects.filter(inout=inout)    
    for ins in inputs:
        input_data = {}
        input_data['uri'] = ins.uri
        input_data['name'] = ins.name
        input_data['igadget'] = ins.variable.igadget.code
        all_inputs.append(input_data)
    return all_inputs
    
def get_output_data (inout):
    all_outputs = []
    outputs = Out.objects.filter(inout=inout)    
    for outs in outputs:
        output_data = {}
        output_data['uri'] = outs.uri
        output_data['name'] = outs.name
        output_data['igadget'] = outs.variable.igadget.code
        all_outputs.append(output_data)
    return all_outputs    
    

def get_inout_data(data):
    data_ret = {}
    data_fields = data['fields']
    data_ret['uri'] = data_fields['uri']
    data_ret['friend_code'] = data_fields['friend_code']
    data_ret['value'] = data_fields['value']
    data_ret['name'] = data_fields['name']
    
    data_ins = get_input_data(inout=data['pk'])
    data_ret['ins'] = [d for d in data_ins]
    
    data_outs = get_output_data(inout=data['pk'])
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
    variables = Variable.objects.filter (igadget__id=data['pk'])
    data = serializers.serialize('python', variables, ensure_ascii=False)
    data_ret['variables'] = [get_variable_data(d) for d in data]
   
    return data_ret

def get_variable_data(data):
    data_ret = {}
    data_fields = data['fields']
    
    var_def = VariableDef.objects.get(id=data_fields['vardef'])
   
    data_ret['name'] = var_def.name
    data_ret['aspect'] = var_def.aspect
    data_ret['value'] = data_fields['value']
       
    return data_ret



