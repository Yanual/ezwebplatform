# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, get_list_or_404
from django.http import Http404, HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.core import serializers
from django.utils import simplejson

from django_restapi.resource import Resource
from django_restapi.model_resource import Collection, Entry
from django_restapi.responder import *

from django.db import transaction

from commons.authentication import user_authentication
from commons.get_data import get_igadget_data, get_variable_data
from commons.utils import json_encode

from gadget.models import Gadget, VariableDef
from igadget.models import *

@transaction.commit_on_success
def SaveIGadget(igadget, user, screen_id, igadget_id):
    # Gets all needed parameters of the IGadget
    uri = igadget.get('uri')

    if not igadget_id:
        if uri.find('igadgets'):
            igadget_id = uri.partition('/igadgets/')[2]
        else:
            igadget_id = uri.partition('/igadget/')[2]

    gadget_uri = igadget.get('gadget')
    width = igadget.get('width')
    height = igadget.get('height')
    top = igadget.get('top')
    left = igadget.get('left')
    
    # Checks all mandatary parameters 
#    if not igadget_id or not uri or not gadget_uri or width <= 0 or height <= 0 or top < 0 or left < 0:
#        raise Exception('Malformed iGadget JSON')

    #Gets current user screen
    try:
        screen = Screen.objects.get(user=user, code=screen_id)
    except Screen.DoesNotExist: 
        #TODO Screen would have to be created yet with a POST Screen. Remove from last release 
        screen_uri = "/user/" + user.username + '/screen/' + str(screen_id)
        screen = Screen (code=screen_id, uri=screen_uri, name='myScreen', user=user) 
        screen.save()            

    # Creates IGadget position
    position = Position (uri=uri + '/position', posX=left, posY=top, height=height, width=width)
    position.save()

    try:
        # Creates the new IGadget
        gadget = Gadget.objects.get(uri=gadget_uri, user=user)

        new_igadget = IGadget (code=igadget_id ,uri=uri, gadget=gadget, screen=screen, position=position)
        new_igadget.save()

        # Creates all IGadgte's variables
        variableDefs = VariableDef.objects.filter(template=gadget.template)
        for varDef in variableDefs:
            # Sets the default value of variable
            if varDef.default_value:
                var_value = varDef.default_value
            else:
                var_value = ''
                

            var = Variable (uri=uri + '/variables/' + varDef.name, vardef=varDef, igadget=new_igadget, value=var_value)
            var.save() 

    except Gadget.DoesNotExist:
        raise Gadget.DoesNotExist('refered gadget (' + gadget_uri + ') don\'t exists.')
    except VariableDef.DoesNotExist:
        #iGadget has no variables. It's normal
        pass

@transaction.commit_on_success
def UpdateIGadget(igadget, user, screen_id, igadget_id):
    # Gets all needed parameters of the IGadget
    uri = igadget.get('uri')

    if not igadget_id:
        if uri.find('igadgets'):
            igadget_id = uri.partition('/igadgets/')[2]
        else:
            igadget_id = uri.partition('/igadget/')[2]

    # get IGadget's position
    position = Position.objects.get(uri=uri + '/position')

    # update the requested attributes
    if igadget.has_key('width'):
        width = igadget.get('width')
        if width <= 0:
            raise Exception('Malformed iGadget JSON')
        position.width = width

    if igadget.has_key('height'):
        height = igadget.get('height')
        if height <= 0:
            raise Exception('Malformed iGadget JSON')
        position.height = height

    if igadget.has_key('top'):
        top = igadget.get('top')
        if top < 0:
            raise Exception('Malformed iGadget JSON')
        position.posY = top
    
    if igadget.has_key('left'):
        left = igadget.get('left')
        if left < 0:
            raise Exception('Malformed iGadget JSON')
        position.posX = left

    # Checks
    screen = Screen.objects.get(user=user, code=screen_id)
    igadget = get_object_or_404(IGadget, screen=screen, code=igadget_id)  

    # save the changes
    position.save()
    

class IGadgetCollection(Resource):
    def read(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)
        
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        data_list = {}
        try:
            screen = Screen.objects.get(user=user, code=screen_id)
        except Screen.DoesNotExist:
            data_list['iGadgets'] = []
            return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

        igadget = IGadget.objects.filter(screen=screen)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        data_list['iGadgets'] = [get_igadget_data(d) for d in  data]

        return HttpResponse(json_encode(data_list), mimetype='application/json; charset=UTF-8')

    @transaction.commit_manually
    def create(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        if not request.has_key('igadgets'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)      
        received_json = request.POST['igadgets']
	    
        try:
            received_data = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)
        
        igadgets = received_data.get('iGadgets')
        try:
            for igadget in igadgets:
                SaveIGadget(igadget, user, screen_id, igadget_id=None)
            transaction.commit()
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError('<error>iGadgets cannot be saved: %s</error>' % e)


    @transaction.commit_manually
    def update(self, request, user_name, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1

        if not request.PUT.has_key('igadgets'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)      
        received_json = request.PUT['igadgets']
        
        try:
            received_data = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)
        
        igadgets = received_data.get('iGadgets')
        try:
            for igadget in igadgets:
                UpdateIGadget(igadget, user, screen_id, igadget_id=None)
            transaction.commit()
            return HttpResponse('ok')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError('<error>iGadgets cannot be updated: %s</error>' % e)

class IGadgetEntry(Resource):
    def read(self, request, user_name, igadget_id, screen_id=None):
        user = user_authentication(user_name)
              
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        data_list = {}
        #Gets current user screen
        screen = Screen.objects.get(user=user, code=screen_id)
        
        igadget = get_list_or_404(IGadget, screen=screen, code=igadget_id)
        data = serializers.serialize('python', igadget, ensure_ascii=False)
        igadget_data = get_igadget_data(data[0])
        return HttpResponse(json_encode(igadget_data), mimetype='application/json; charset=UTF-8')
    
    def create(self, request, user_name, igadget_id, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1

        if not request.has_key('igadget'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.POST['igadget']

        try:
            igadget = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)

        try:
            SaveIGadget(igadget, user, screen_id, igadget_id)
            return HttpResponse('ok')
        except Exception, e:
            return HttpResponseServerError('<error>iGadget cannot be saved: %s</error>' % e)


    def update(self, request, user_name, igadget_id, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1

        if not request.PUT.has_key('igadget'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')

        #TODO we can make this with deserializers (simplejson)
        received_json = request.PUT['igadget']

        try:
            igadget = eval(received_json)
        except Exception, e:
            return HttpResponseBadRequest('<error>%s</error>' % e)

        try:
            UpdateIGadget(igadget, user, screen_id, igadget_id)
            return HttpResponse('ok')
        except Exception, e:
            return HttpResponseServerError('<error>iGadget cannot be updated: %s</error>' % e)


    def delete(self, request, user_name, igadget_id, screen_id=None):
        user = user_authentication(user_name)

        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1

        # Gets Igadget, if it does not exist, a http 404 error is returned
        screen = Screen.objects.get(user=user, code=screen_id)
        igadget = get_object_or_404(IGadget, screen=screen, code=igadget_id)
        
        # Delete all IGadget's variables
        variables = Variable.objects.filter(igadget=igadget)
        for var in variables:
            var.delete()
        
        # Delete IGadget and its position
        position = igadget.position
        igadget.delete()
        position.delete()
        return HttpResponse('ok')
        

class IGadgetVariableCollection(Resource):
    def read(self, request, user_name, igadget_id, screen_id=None):
        user = user_authentication(user_name)
        
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        screen = Screen.objects.get(user=user, code=screen_id)
        variables = Variable.objects.filter(igadget__screen=screen, igadget__code=igadget_id)
        data = serializers.serialize('python', variables, ensure_ascii=False)
        vars_data = [get_variable_data(d) for d in data]
        return HttpResponse(json_encode(vars_data), mimetype='application/json; charset=UTF-8')

class IGadgetVariable(Resource):
    def read(self, request, user_name, igadget_id, var_name, screen_id=None):
        user = user_authentication(user_name)
        
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1
        
        screen = Screen.objects.get(user=user, code=screen_id)
        variable = get_list_or_404(Variable, igadget__screen=screen, igadget__code=igadget_id, vardef__name=var_name)
        data = serializers.serialize('python', variable, ensure_ascii=False)
        var_data = get_variable_data(data[0])
        return HttpResponse(json_encode(var_data), mimetype='application/json; charset=UTF-8')
    
    def create(self, request, user_name, igadget_id, var_name, screen_id=None):
        return self.update(request, user_name, igadget_id, var_name, screen_id)
    
    def update(self, request, user_name, igadget_id, var_name, screen_id=None):
        user = user_authentication(user_name)
        
        # Gets value parameter from request
        if not request.PUT.has_key('value'):
            return HttpResponseBadRequest('<error>iGadget JSON expected</error>')
        new_value = request.PUT['value']
        
        #TODO by default. Remove in final release
        if not screen_id:
            screen_id = 1

        screen = Screen.objects.get(user=user, code=screen_id)
        variable = get_object_or_404(Variable, igadget__screen=screen, igadget__code=igadget_id, vardef__name=var_name)
        variable.value = new_value
        variable.save()
        return HttpResponse('ok')
