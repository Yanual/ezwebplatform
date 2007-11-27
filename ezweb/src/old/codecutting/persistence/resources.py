gadgets_get = """
<gadgets user="%s">
%s
</gadgets>    
"""

gadget_get = """
<gadget id="%s">
    <url>%s</url>
    <user login="%s"/>
</gadget>    
"""

user_get = """
<user login="%s">
    <name>%s</url>
</user>    
"""


xhtml_get = """
<xhtml gadget_id="%s">
    <code>
        <![CDATA[
%s
        ]]>
    </code>
</xhtml>    
"""

template_get = """
<template id="%s">
    <gadget id="%s"/>
    <code>
        <![CDATA[
%s
        ]]>
    </code>
</template>    
"""

form = """
<FORM method="GET" action="http://localhost:8000/users/lmayllon/gadgets">
<INPUT type="submit" value="GET Gadgets"/>
</FORM>

<FORM method="GET" action="http://localhost:8000/users/lmayllon/gadgets/1">
<INPUT type="submit" value="GET Gadget"/>
</FORM>

<FORM method="POST" action="http://localhost:8000/users/lmayllon/gadgets">
Url: <INPUT type="text" name="user" size="32"/>
<BR/>
user: <INPUT type="text" name="user" size="32"/>
<BR/>
<INPUT type="submit" value="POST Gadget"/>
</FORM>

<FORM method="PUT" action="http://localhost:8000/users/lmayllon/gadgets/1">
Url: <INPUT type="text" name="user" size="32"/>
<BR/>
user: <INPUT type="text" name="user" size="32"/>
<BR/>
<INPUT type="submit" value="PUT Gadget"/>
</FORM>

<FORM method="GET" action="http://localhost:8000/users/lmayllon/gadgets/1/xhtml">
<INPUT type="submit" value="GET XHTML"/>
</FORM>

<FORM method="POST" action="http://localhost:8000/users/lmayllon/gadgets/2/xhtml">
code: <INPUT type="text" name="code"/>
<BR/>
<INPUT type="submit" value="POST XHTML"/>
</FORM>

<FORM method="GET" action="http://localhost:8000/users/lmayllon/gadgets/1/teplate">
<INPUT type="submit" value="GET TEMPLATE"/>
</FORM>

<FORM method="POST" action="http://localhost:8000/users/lmayllon/gadgets/2/template">
code: <INPUT type="text" name="code"/>
<BR/>
<INPUT type="submit" value="POST TEMPLATE"/>
</FORM>

"""
