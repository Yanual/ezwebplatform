from django.conf.urls.defaults import *

urlpatterns = patterns('ezweb.views',
    (r'^$', 'index'),
    (r'^wiring$', 'wiring'),

)
