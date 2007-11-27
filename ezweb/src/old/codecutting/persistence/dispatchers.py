# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound , Http404
import handlers
import resources

def dispatch_gadgets(request, user_login):
    handler = handlers.Gadgets_Handler()
    if request.method == 'GET':
        return HttpResponse(handler.do_get(user_login), mimetype="text/xml")
    else:
        return HttpResponseNotFound("Sorry, " + request.method + " not implemented")
    
def dispatch_gadget(request, user_login, gadget_id):
    handler = handlers.Gadget_Handler()
    if request.method == 'GET':
        try:
            return HttpResponse(handler.do_get(user_login, gadget_id) , mimetype="text/xml")
        except Exception:
            return HttpResponseNotFound(Exception)
    elif request.method == 'POST':
        try:
            return HttpResponse(handler.do_post(request, user_login))
        except Exception:
            return HttpResponseNotFound(Exception)
    elif request.method == 'PUT':
        try:
            return HttpResponse(handler.do_put(request, user_login, gadget_id))
        except Exception:
            return HttpResponseNotFound(Exception)
    else:
        return HttpResponseNotFound("Sorry, " + request.method + " not implemented")
          
def dispatch_xhtml(request, user_login, gadget_id):
    handler = handlers.Xhtml_Handler()
    if request.method == 'GET':
        try:
            return HttpResponse(handler.do_get(user_login, gadget_id), mimetype="text/xml")
        except Exception:
            return HttpResponseNotFound(Exception)
    elif request.method == 'POST':
        try:
            return HttpResponse(handler.do_post(request, user_login, gadget_id))
        except Exception:
            return HttpResponseNotFound(Exception)
    else:
        return HttpResponseNotFound("Sorry, " + request.method + " not implemented")
                
def dispatch_template(request, user_login, gadget_id):
    handler = handlers.Template_Handler()
    if request.method == 'GET':
        try:
            return HttpResponse(handler.do_get(user_login, gadget_id), mimetype="text/xml")
        except Exception:
            return HttpResponseNotFound(Exception)
    elif request.method == 'POST':
        try:
            return HttpResponse(handler.do_post(request, user_login, gadget_id))
        except Exception:
            return HttpResponseNotFound(Exception)
    else:
        return HttpResponseNotFound("Sorry, " + request.method + " not implemented")
     
def index(request):
    return HttpResponse(resources.form)
    