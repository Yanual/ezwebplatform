from django.conf.urls.defaults import *
from django_restapi.model_resource import Collection
from django_restapi.responder import *

from persistenceEngine.gadget.models import *

def gadgets_resource(self):
    return Collection(
        queryset = Gadgets.objects.all(),
        permitted_methods = ('GET'),
        expose_fields = ('id', 'vendor', 'slug_title', 'title', 'version', 'uri'),
        responder = JSONResponder()
    )

def gadget_resource(self, vendor, slug_title, version):
    return Collection(
        queryset = Gadgets.objects.filter(gadget__vendor=vendor, gadget__slug_title=slug_title, gadget__version=version),
        permitted_methods = ('GET'),
        responder = JSONResponder()
    )

def gadget_template_resource(self, vendor, slug_title, version):
    return Collection(
        queryset = Gadgets.objects.filter(gadget__vendor=vendor, gadget__slug_title=slug_title, gadget__version=version),
        permitted_methods = ('GET'),
        expose_fields = ('template'),
        responder = JSONResponder()
    )

def gadget_code_resource(self, vendor, slug_title, version):
    return Collection(
        queryset = Gadgets.objects.filter(gadget__vendor=vendor, gadget__slug_title=slug_title, gadget__version=version),
        permitted_methods = ('GET'),
        expose_fields = ('content'),
        responder = JSONResponder()
    )

def gadget_tags_resource(self, vendor, slug_title, version):
    return Collection(
        queryset = Gadgets.objects.filter(gadget__vendor=vendor, gadget__slug_title=slug_title, gadget__version=version),
        permitted_methods = ('GET'),
        expose_fields = ('tags'),
        responder = JSONResponder()
    )


urlpatterns = patterns('gadget.views',

    # Gadgets
    (r'^$', gadgets_resource()),
    (r'^(?P<vendor>\d+)/(?P<slug_title>\d+)/(?P<version>\d+)/$', gadget_resource(vendor, slug_title, version)),
    (r'^(?P<vendor>\d+)/(?P<slug_title\d+)/(?P<version>\d+)/template/$', gadget_template_resource(vendor, slug_title, version)),
    (r'^(?P<vendor>\d+)/(?P<slug_title>\d+)/(?P<version>\d+)/code/$', gadget_code_resource(vendor, slug_title, version)),
    (r'^(?P<vendor>\d+)/(?P<slug_title>\d+)/(?P<version>\d+)/tags/$', gadget_tags_resource(vendor, slug_title, version)),
   
)
