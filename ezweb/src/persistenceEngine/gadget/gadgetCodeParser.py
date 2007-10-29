from HTMLParser import HTMLParser
from urllib import urlopen

from models import *

class GadgetCodeParser(HTMLParser):
# HTML parsing

    xHTML = None
    user_id = ""

    def parseUserEvents(self, codeURI, user_id, gadgetURI):
        self.user_id = user_id

        xhtml = urlopen(codeURI).read()
        
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
