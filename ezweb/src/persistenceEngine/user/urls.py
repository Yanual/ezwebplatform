from django.conf.urls.defaults import *

urlpatterns = patterns('user.views',
    (r'^$', 'user'),

    # Gadgets
    (r'^gadgets/$', 'gadget.get_list'),
    (r'^gadgets/gadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/$', 'gadgets.get_gadget'),
    (r'^gadgets/gadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/template/$', 'gadgets.get_template'),
    (r'^gadgets/gadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/code/$', 'gadgets.get_code'),
    (r'^gadgets/gadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/tags/$', 'gadgets.get_tags'),

    # IGadgets
    (r'^igadgets/$', 'igadget.get_list'),
    (r'^igadgets/igadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/$', 'igadgets.get_igadget'),
    (r'^igadgets/igadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/var/(?P<variable>\d+)/$', 'igadgets.get_variable'),
    (r'^igadgets/igadget/(?P<vendor>\d+)/(?P<slug_name>\d+)/(?P<version>\d+)/var/(?P<variable>\d+)/edit/$', 'igadgets.edit_variable'),

    # Connectables
    (r'^connectables/$', 'connectables.get_list'),
    (r'^connectables/in/(?P<id>\d+)/$', 'connectables.get_in'),
    (r'^connectables/inout/(?P<id>\d+)/$', 'connectables.resource_inout'),
      
)
