﻿#-*- coding: utf-8 -*-

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

from django.shortcuts import get_object_or_404, get_list_or_404

from django.core import serializers

from gadget.models import Gadget, XHTML, ContextOption, UserPrefOption, Capability
from igadget.models import Variable, VariableDef, Position, IGadget
from connectable.models import In, Out, RelatedInOut, InOut, Filter
from context.models import Concept, ConceptName
from workspace.models import Tab, WorkSpaceVariable, AbstractVariable, VariableValue, UserWorkSpace
from django.utils.translation import get_language

def get_abstract_variable(id):
    return AbstractVariable.objects.get(id=id)


def get_wiring_variable_data(var, ig):
    res_data = {}

    res_data['id'] = var.vardef.pk
    res_data['name'] = var.vardef.name
    res_data['aspect'] = var.vardef.aspect
    res_data['type'] = var.vardef.type
    res_data['value'] = var.value
    res_data['friend_code'] = var.vardef.friend_code
    res_data['igadget_id'] = ig.id

    return res_data


def get_wiring_data(igadgets):
    res_data = [] 

    for ig in igadgets:
        variables = Variable.objects.filter(igadget=ig)

        igObject = {}
        list = []

        igObject['id'] = ig.pk

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
    data_variabledef = VariableDef.objects.filter(gadget=data['pk'])
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
        
        if var.aspect == 'GCTX' or var.aspect == 'ECTX': 
            data_var['concept'] = var.contextoption_set.all().values('concept')[0]['concept']
        
        data_vars.append(data_var)
    
    data_code = get_object_or_404(XHTML.objects.all().values('uri'), id=data_fields['xhtml'])
 
    data_ret['name'] = data_fields['name']
    if data_fields['display_name'] and data_fields['display_name']!="":
        data_ret['displayName'] = data_fields['display_name']
    else:
        data_ret['displayName'] = data_fields['name']
    data_ret['vendor'] = data_fields['vendor']
    data_ret['description'] = data_fields['description']
    data_ret['uri'] = data_fields['uri']
    data_ret['wikiURI'] = data_fields['wikiURI']
    data_ret['imageURI'] = data_fields['imageURI']
    data_ret['iPhoneImageURI'] = data_fields['iPhoneImageURI']
    data_ret['menuColor'] = data_fields['menuColor']
    data_ret['version'] = data_fields['version']
    data_ret['mail'] = data_fields['mail']
    data_ret['shared'] = data_fields['shared']
    data_ret['last_update'] = data_fields['last_update']
    data_ret['size'] = {}
    data_ret['size']['width'] = data_fields['width']
    data_ret['size']['height'] = data_fields['height']
    data_ret['variables'] = data_vars
    data_ret['xhtml'] = data_code
    
    data_ret['capabilities'] = get_gadget_capabilities(gadget_id=data['pk'])

    return data_ret

def get_gadget_capabilities(gadget_id):
    data_ret = []
    
    try:
        capability_list = Capability.objects.filter(gadget__id=gadget_id)
        
        for capability in capability_list:
            cap = {}
            
            cap['name'] = capability.name
            cap['value'] = capability.value
            
            data_ret.append(cap)
    except Capability.DoesNotExist:
        data_ret = {}
        
    return data_ret


def get_input_data (inout):
    all_inputs = []
    inputs = In.objects.filter(inout=inout)    
    for ins in inputs:
        input_data = {}
        input_data['id'] = ins.pk
        input_data['name'] = ins.name
        var = ins.variable;
        input_data['varId'] = var.pk
        input_data['type'] = var.vardef.aspect
        all_inputs.append(input_data)
    return all_inputs
    
def get_output_data (inout):
    all_outputs = []
    outputs = Out.objects.filter(inout=inout)    
    for outs in outputs:
        output_data = {}
        output_data['id'] = outs.pk
        output_data['name'] = outs.name
        var = outs.variable;
        output_data['varId'] = var.pk
        output_data['type'] = var.vardef.aspect
        all_outputs.append(output_data)
    return all_outputs    
    

def get_inout_data(data):
    """
        deprecated!!!!
    """
    data_ret = {}
    
    data_fields = data['fields']
    data_ret['id'] = data['pk']
    data_ret['aspect'] = 'INOUT'
    data_ret['friend_code'] = data_fields['friend_code']
    data_ret['name'] = data_fields['name']
    
    workSpaceVariableDAO = WorkSpaceVariable.objects.get(id=data_fields['workspace_variable'])
    
    data_ret['value'] = workSpaceVariableDAO.value
    data_ret['variableId'] = workSpaceVariableDAO.id
    
    data_ins = get_input_data(inout=data['pk'])
    data_ret['inputs'] = [d for d in data_ins]
    
    data_outs = get_output_data(inout=data['pk'])
    data_ret['outputs'] = [d for d in data_outs]
        
    return data_ret

def get_filter_data(data):
    data_ret = {}
    
    data_fields = data['fields']
    data_ret['id'] = data['pk']
    data_ret['name'] = data_fields['name']
    data_ret['nature'] = data_fields['nature']
    data_ret['label'] = data_fields['label']
    data_ret['category'] = data_fields['category']
    data_ret['help_text'] = data_fields['help_text']
    data_ret['code'] = data_fields['code']
    data_ret['params'] = data_fields['params']
    
    return data_ret
     
def get_workspace_data(data, user, workspace):
    data_ret = {}
    data_fields = data['fields']
    data_ret['id'] = data['pk']
    data_ret['name'] = data_fields['name']
    
    #First one in the users relationship is the creator of the workspace
    data_ret['shared'] = workspace.is_shared(user)
    
    user_workspace = UserWorkSpace.objects.get(user=user, workspace=workspace);
    
    if user_workspace.active:
        data_ret['active'] = 'true'
    else:
        data_ret['active'] = 'false'
    return data_ret

def get_workspace_variables_data(workSpaceDAO, user):
    tab_variables = WorkSpaceVariable.objects.filter(workspace=workSpaceDAO, aspect='TAB')  
    tabs_data = serializers.serialize('python', tab_variables, ensure_ascii=False)
    ws_variables_data = [get_workspace_variable_data(d, user, workSpaceDAO) for d in tabs_data]
    
    inout_variables = WorkSpaceVariable.objects.filter(workspace=workSpaceDAO, aspect='CHANNEL')  
    inouts_data = serializers.serialize('python', inout_variables, ensure_ascii=False)
    ws_inout_variables_data = [get_workspace_variable_data(d, user, workSpaceDAO) for d in inouts_data]
    
    for inout in ws_inout_variables_data:
        ws_variables_data.append(inout)

    return ws_variables_data

def get_workspace_variable_data(data, user, workspace):
    data_ret = {}
    data_fields = data['fields']

    abstract_var_id = data['fields']['abstract_variable']

    abstract_var = get_abstract_variable(abstract_var_id)

    data_ret['id'] = data['pk']
    data_ret['abstract_var_id'] = abstract_var_id

    data_ret['aspect'] = data_fields['aspect']

    try:
        variable_value = VariableValue.objects.get(abstract_variable=abstract_var, user=user)
    except VariableValue.DoesNotExist:
        from workspace.views import clone_original_variable_value

        variable_value = clone_original_variable_value(abstract_var, workspace.get_creator(), user)

    data_ret['value'] = variable_value.value
    data_ret['name'] = abstract_var.name
    data_ret['type'] = data_fields['type']

    if (data_ret['aspect'] == 'TAB'):
        connectable = Out.objects.get(abstract_variable__id = abstract_var_id)
        data_ret['tab_id'] = Tab.objects.filter(abstract_variable = abstract_var)[0].id
    if (data_ret['aspect'] == 'CHANNEL'):
        workspace_variable = WorkSpaceVariable.objects.get(abstract_variable__id = abstract_var_id)
        connectable = InOut.objects.get(workspace_variable = workspace_variable)

    connectable_data = get_connectable_data(connectable)

    data_ret['connectable'] = connectable_data

    return data_ret


def get_connectable_data(connectable):
    res_data = {}

    res_data['id'] = connectable.id
    res_data['name'] = connectable.name

    if isinstance(connectable, InOut):
        connectable_type = "inout"
        ws_var_id = connectable.workspace_variable.id
        ig_var_id = None

        # Locating IN connectables linked to this connectable
        res_data['ins'] = []

        ins = In.objects.filter(inouts__id = connectable.id)
        for input in ins:
            res_data['ins'].append(get_connectable_data(input))

        # Locating OUT connectables linked to this connectable
        res_data['outs'] = []

        outs = Out.objects.filter(inouts__id = connectable.id)
        for output in outs:
            res_data['outs'].append(get_connectable_data(output))

        # Locating INOUT connectables linked to this connectable as output
        res_data['out_inouts'] = []
        related_inouts = RelatedInOut.objects.filter(in_inout=connectable)
        for related_inout in related_inouts:
            res_data['out_inouts'].append(related_inout.out_inout_id)

        #Locating the filter linked to this conectable!
        res_data['filter'] = connectable.filter_id
        res_data['filter_params'] = connectable.filter_param_values

    elif isinstance(connectable, Out):
        connectable_type = "out"

        #Checking asbtract_variable aspect
        if (connectable.abstract_variable.type == "IGADGET"):
            #It's a Gadget Variable!
            ig_var_id = Variable.objects.get(abstract_variable = connectable.abstract_variable).id
            ws_var_id = None
        elif (connectable.abstract_variable.type  == "WORKSPACE"):
            #It's a Workspace Variable!
            ws_var_id = WorkSpaceVariable.objects.get(abstract_variable = connectable.abstract_variable).id
            ig_var_id = None

    elif isinstance(connectable, In):
        connectable_type = "in"
        ig_var_id = connectable.variable.id
        ws_var_id = None

    res_data['connectable_type'] = connectable_type
    res_data['ig_var_id'] = ig_var_id
    res_data['ws_var_id'] = ws_var_id

    return res_data


def get_global_workspace_data(data, workSpaceDAO, concept_values, user):
    data_ret = {}
    data_ret['workspace'] = get_workspace_data(data, user, workSpaceDAO)

    # Tabs processing
    tabs = Tab.objects.filter(workspace=workSpaceDAO).order_by('id')
    data = serializers.serialize('python', tabs, ensure_ascii=False)

    tabs_data = []

    for i in range(len(tabs)):
        tabs_data.append(get_tab_data(data[i], tabs[i], user))

    data_ret['workspace']['tabList'] = tabs_data

    for tab in tabs_data:
        tab_pk = tab['id']
        igadgets = IGadget.objects.filter(tab__id = tab_pk).order_by('id')
        igadget_data = serializers.serialize('python', igadgets, ensure_ascii=False)
        igadget_data = [get_igadget_data(d, user, workSpaceDAO) for d in igadget_data]
        tab['igadgetList'] = igadget_data

    #WorkSpace variables processing
    workspace_variables_data = get_workspace_variables_data(workSpaceDAO, user)
    data_ret['workspace']['workSpaceVariableList'] = workspace_variables_data

    #Context information
    concepts = Concept.objects.all()
    concepts_data = serializers.serialize('python', concepts, ensure_ascii=False)
    data_ret['workspace']['concepts'] = [get_concept_data(d, concept_values) for d in concepts_data]

    # Filter information
    filters = Filter.objects.all()
    filter_data = serializers.serialize('python', filters, ensure_ascii=False)
    data_ret['workspace']['filters'] = [get_filter_data(d) for d in filter_data]

    return data_ret

def get_tab_data(data, tab, user):
    data_ret = {}
    data_fields = data['fields']
    data_ret['id'] = data['pk']
    data_ret['name'] = data_fields['name']

    data_ret['visible'] = data_fields['visible']

    data_ret['locked'] = tab.is_locked(user)

    return data_ret

def get_igadget_data(data, user, workspace):
    data_ret = {}
    data_fields = data['fields']

    gadget = Gadget.objects.get(pk=data_fields['gadget'])
    position = Position.objects.get(pk=data_fields['position'])

    data_ret['id'] = data['pk']
    data_ret['name'] = data_fields['name']
    data_ret['tab'] = data_fields['tab']
    data_ret['layout'] = data_fields['layout']
    data_ret['menu_color'] = data_fields['menu_color']
    data_ret['gadget'] = gadget.uri
    data_ret['top'] = position.posY
    data_ret['left'] = position.posX
    data_ret['zIndex'] = position.posZ
    data_ret['width'] = position.width
    data_ret['height'] = position.height
    data_ret['minimized'] = position.minimized
    data_ret['transparency'] = data_fields['transparency']
    variables = Variable.objects.filter (igadget__pk=data['pk'])
    data = serializers.serialize('python', variables, ensure_ascii=False)
    data_ret['variables'] = [get_variable_data(d, user, workspace) for d in data]

    return data_ret

def get_variable_data(data, user, workspace):
    data_ret = {}
    data_fields = data['fields']

    var_def = VariableDef.objects.get(id=data_fields['vardef'])

    #Variable info is splited into 2 entities: AbstractVariable y Variable   
    abstract_var_id = data['fields']['abstract_variable']

    abstract_var = get_abstract_variable(abstract_var_id) 

    try:
        variable_value = VariableValue.objects.get(abstract_variable=abstract_var, user=user)
    except VariableValue.DoesNotExist:
        from workspace.views import clone_original_variable_value

        variable_value = clone_original_variable_value(abstract_var, workspace.get_creator(), user)

    data_ret['id'] = data['pk']

    data_ret['aspect'] = var_def.aspect
    data_ret['value'] = variable_value.value
    data_ret['type'] = var_def.type
    data_ret['igadgetId'] = data_fields['igadget']
    data_ret['vardefId'] = var_def.pk
    data_ret['name'] = var_def.name
    data_ret['label'] = var_def.label
    data_ret['friend_code'] = var_def.friend_code

    #Context management
    if var_def.aspect == 'GCTX' or var_def.aspect == 'ECTX': 
        context = ContextOption.objects.get(varDef=data_fields['vardef'])
        data_ret['concept'] = context.concept

    #Connectable management
    #Only SLOTs and EVENTs
    connectable = False
    if var_def.aspect == 'SLOT':
        connectable = Out.objects.get(abstract_variable = abstract_var)
    if var_def.aspect == 'EVEN':
        connectable = In.objects.get(variable__id = data_ret['id'])

    if connectable:
        connectable_data = get_connectable_data(connectable);
        data_ret['connectable'] = connectable_data

    return data_ret

def get_concept_data(data, concept_values):
    data_ret = {}
    data_fields = data['fields']

    cnames = ConceptName.objects.filter(concept=data['pk']).values('name')

    data_ret['concept'] = data['pk']
    data_ret['type'] = data_fields['type']
    if data_fields['source'] == 'PLAT':
        data_ret['value'] = get_concept_value(data['pk'], concept_values)
    else:
        data_ret['adaptor'] = data_fields['adaptor']
    data_ret['names'] = [cname['name'] for cname in cnames] 

    return data_ret

# Only for extenal context values (no igadget context values)
def get_concept_value(concept_name, values):
    res = ''

    if concept_name == 'username':
        res = values['user'].username
    elif concept_name == 'language':
        res = get_language()

    return res