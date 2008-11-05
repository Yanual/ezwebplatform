# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

from django.utils.http import urlquote

from commons.http_utils import download_http_content
from commons.exceptions import TemplateParseException

from django.utils.translation import ugettext as _

from gadget.models import XHTML

class GadgetCodeParser:
    xHTML = None

    def parse(self, codeURI, gadgetURI, content_type):
        xhtml = ""

        # TODO Fixme!! This works for now, but we have to check if a part of a url is empty
        address = codeURI.split('://')
        query = address[1].split('/',1)
        codeURI = address[0] + "://" + query[0] + "/" + urlquote(query[1])

        try:
            xhtml = download_http_content(codeURI)
        except Exception:
            raise TemplateParseException(_("XHTML code is not accessible"))

        uri = gadgetURI + "/xhtml"
        
        self.xHTML = XHTML (uri=uri, code=xhtml, url=codeURI, content_type=content_type)
        self.xHTML.save()
                
        return

    def getXHTML (self):
        return self.xHTML
