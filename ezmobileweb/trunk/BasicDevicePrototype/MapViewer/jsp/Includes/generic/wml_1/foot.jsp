<?xml version="1.0" encoding="ISO-8859-1"?>
<%--************************************************** 
 -             ***MyMobileWeb***
 - JSP code generated by MyMobileWeb Generation Proccess 
 - Date: Fri May 30 10:42:57 GMT+01:00 2008
**************************************************--%><%@ page session="true" %><%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %><%@ page import="org.morfeo.tidmobile.tags.writers.common.WriterData" %><%@ page import="org.morfeo.tidmobile.cfg.*" %><%@ page import="org.morfeo.tidmobile.server.lc.*" %><%@ page import="org.morfeo.tidmobile.server.*" %><%@ page import="org.morfeo.tidmobile.server.util.*" %><%@ page import="org.morfeo.tidmobile.tags.*" %><%@ page import="org.morfeo.tidmobile.CmtConstants" %><% WriterData wd = new WriterData( out, request, CmtConstants.WML_1_X ); %>
<%
boolean jstl = false;
%>
<%--**************************************************--%>

<%--********CACHE ACTIVATION/DEACTIVATION********--%>
<% {
boolean cache = false;

if( !cache ) CacheConfigurator.resourceExpiresNow( response, wd.getDevice() );
} %>
<%--**************************************************--%>

<%--*************GENERATED CODE BLOCK*****************--%> 
<%!  private int[] lock = new int[0]; %>
<%

{
int wmode = ConfigUtil.getWorkingMode(Configurator.getInstance().getGlobalConfiguration());
DocumentTag documentTag = DocumentCache.getInstance().get( wd.getContext() );
if( jstl || documentTag == null || wmode == ServerConstants.WMODE_DEV ) {
synchronized(lock) {
documentTag = DocumentCache.getInstance().get(wd.getContext());
if(documentTag == null || wmode == ServerConstants.WMODE_DEV) {
documentTag = new DocumentTag();
documentTag.setOpName("Includes");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("foot");  
documentTag.setId("includes");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyle("include");
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("Includes", false, true );
		headTag.addDescendantTag( titleTag );
		}
		{
		StyleTag styleTag = null;
		styleTag = new StyleTag();
		styleTag.setHref("mymem.css");
		headTag.addDescendantTag( styleTag );
		}
	documentTag.addDescendantTag( headTag );
	}
	{
	org.morfeo.tidmobile.tags.BodyTag bodyTag = null;
	bodyTag = new org.morfeo.tidmobile.tags.BodyTag();
	bodyTag.setStyleValues(new String[][]{{"color","rgb(148, 105, 16)"},{"display-panels-as","plain-flow"},{"background-color","rgb(255, 243, 206)"},{"panel-links-layout","horizontal"}});
		{
		PTag pTag = null;
		pTag = new PTag("pBack");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","left"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
                bodyTag.setHasForm(true);
            }
        
			{
			LinkTag linkTag = null;
			linkTag = new LinkTag("lback");
			linkTag.setResourceid("back");
			linkTag.setStyle("foot");
			linkTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"},{"text-decoration","none"}});
			
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
			linkTag.setText("Volver", false, true );
			linkTag.setHref("${platform}", true, false );
			{
			ImageTag imageTag = new ImageTag();
			linkTag.setStylesImage( imageTag.getStyleValues() );
			}
			pTag.addDescendantTag( linkTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
	documentTag.addDescendantTag( bodyTag );
	}
DocumentCache.getInstance().put(wd.getContext(),documentTag);
}
}
}

documentTag.write_wml_1(wd);
}%>