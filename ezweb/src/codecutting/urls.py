from django.conf.urls.defaults import *

urlpatterns = patterns('',
    (r'^prueba/$', 'ezweb.persistence.dispatchers.index'),
    (r'^users/(?P<user_login>\w+)/gadgets/$', 'ezweb.persistence.dispatchers.dispatch_gadgets'),
    (r'^users/(?P<user_login>\w+)/gadgets/(?P<gadget_id>\d+)/$', 'ezweb.persistence.dispatchers.dispatch_gadget'),
    (r'^users/(?P<user_login>\w+)/gadgets/(?P<gadget_id>\d+)/xhtml/$', 'ezweb.persistence.dispatchers.dispatch_xhtml'),
    (r'^users/(?P<user_login>\w+)/gadgets/(?P<gadget_id>\d+)/template/$', 'ezweb.persistence.dispatchers.dispatch_template'),
                       
    # Example:
    # (r'^ezweb/', include('ezweb.foo.urls')),

    # Uncomment this for admin:
#     (r'^admin/', include('django.contrib.admin.urls')),
)
