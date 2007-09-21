from django.conf.urls.defaults import *

urlpatterns = patterns('',
    # Static content
    # (r'^site_media/(.*)$', 'ezweb.views.static.serve', {'document_root': path.expanduser('~/ezweb/media')}),

    # EzWeb
    (r'^$', 'views.index'),
    (r'^wiring/', include('wiring.urls')),
    (r'^catalog/', include('catalog.urls')),
    (r'^dragboard/', include('dragboard.urls')),

    # Django contrib
    (r'^logout/$', 'django.contrib.auth.views.logout'),
    (r'^admin/', include('django.contrib.admin.urls')),

)
