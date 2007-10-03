from django.http import HttpResponse
import models
import resources

class Gadgets_Handler:
    def do_get(self, user_login):
        gadgets = models.Gadget.objects.all()
        gadget_list = []
        for gadget in gadgets:
            gadget_list.append("""    <gadget id="%s" />"""  % gadget.id)
        return resources.gadgets_get % (user_login, "".join(gadget_list))
    
class Gadget_Handler:
    def do_get(self, user_login, gadget_id):
        gadget = models.Gadget.objects.get(pk = gadget_id, user = user_login)
        return resources.gadget_get % (gadget_id, gadget.url, user_login)
    
    def do_post(self, request, user_login):
        new_gadget = models.Gadget(url = request.POST['url'], user = user_login)
        new_gadget.save()
    
    def do_put(self, request, user_login, gadget_id):
        gadget = models.Gadget.get(url = request.PUT['url'], user = user_login)
        gadget.save()
    
class Xhtml_Handler:
    def do_get(self, request, user_login, gadget_id):
        xhtml = models.Xhtml.objects.get(gadget = gadget_id, gadget__user = user_login)
        return resources.xhtml_get % (gadget_id, xhtml.code)
    
    def do_post(self, request, user_login, gadget_id):
        new_xhtml = models.Xhtml(gadget = request.POST['gadget'], code = request.POST['code'])
        new_xhtml.save()
        
class Template_Handler:
    def do_get(self, user_login, gadget_id):
        template = models.Template.objects.get(gadget = gadget_id, gadget__user = user_login)
        return resources.template_get % (gadget_id, template.code)
    
    def do_post(self, request, user_login, gadget_id):
        new_template = models.Template(gadget = request.POST['gadget'], code = request.POST['code'])
        new_template.save()        
    