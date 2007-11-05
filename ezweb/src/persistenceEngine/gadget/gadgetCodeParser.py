from django.http import Http404
from HTMLParser import HTMLParser
from urllib import urlopen

from models import *

class GadgetCodeParser(HTMLParser):
# HTML parsing

    xHTML = None

    def parseUserEvents(self, codeURI, gadgetURI):
        
        xhtml = ""
        try:
            xhtml = urlopen(codeURI).read()
        except Exception:
            raise Http404("XHTML code is not accessible")
        
        self.xHTML = XHTML (uri=gadgetURI + "/xhtml", code=xhtml)
        self.xHTML.save()

        self.feed(xhtml)

        return

    def handle_starttag(self, tag, attrs):
        handler = None
        event = None
        id = None

        for (name, value) in attrs:
            if (name == 'ezweb:handler'):
                handler = value
                continue

            if (name == 'ezweb:event'):
                event = value
                continue

            if (name == 'id'):
                id = value

        if (handler != None and event != None and id != None):
            mapping = UserEventsInfo(event=event, handler=handler,html_element=id, xhtml=self.xHTML)
            mapping.save()

        return

    def getXHTML (self):
        return self.xHTML
