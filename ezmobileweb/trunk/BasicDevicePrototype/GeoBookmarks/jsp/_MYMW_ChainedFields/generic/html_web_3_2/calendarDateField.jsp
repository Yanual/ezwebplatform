<%--************************************************** 
 -             ***MyMobileWeb***
 - JSP code generated by MyMobileWeb Generation Proccess 
 - Date: Fri Jun 13 11:27:52 GMT+01:00 2008
**************************************************--%><%@ page session="true" %><%@ page import="org.morfeo.tidmobile.tags.writers.common.WriterData" %><%@ page import="org.morfeo.tidmobile.cfg.*" %><%@ page import="org.morfeo.tidmobile.server.lc.*" %><%@ page import="org.morfeo.tidmobile.server.*" %><%@ page import="org.morfeo.tidmobile.server.util.*" %><%@ page import="org.morfeo.tidmobile.tags.*" %><%@ page import="org.morfeo.tidmobile.CmtConstants" %><% WriterData wd = new WriterData( out, request, CmtConstants.HTML ); %>
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
documentTag.setOpName("_MYMW_ChainedFields");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("calendarDateField");  
documentTag.setId("calendarDateField");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("${_MYMW_CDF_TITLE}", true, true );
		headTag.addDescendantTag( titleTag );
		}
	documentTag.addDescendantTag( headTag );
	}
	{
	org.morfeo.tidmobile.tags.BodyTag bodyTag = null;
	bodyTag = new org.morfeo.tidmobile.tags.BodyTag();
	bodyTag.setStyleValues(new String[][]{{"display-panels-as","plain-flow"},{"panel-links-layout","horizontal"}});
		{
		PTag pTag = null;
		pTag = new PTag("p1");
		pTag.setStyle("vertical center");
		pTag.setStyleValues(new String[][]{{"layout","vertical"},{"align","center"}});
		
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
			DatefieldTag datefieldTag = null;
			datefieldTag = new DatefieldTag("_MYMW_Calendar");
			datefieldTag.setBind("${ _MYMW_Calendar }");
			documentTag.addDatefieldReference( datefieldTag );
			datefieldTag.setStyleValues(new String[][]{{"cols","3"},{"background-color2","rgb(255, 255, 255)"},{"required","false"},{"years-range","1960, 2050"},{"required-mark-color","red"},{"required-mark","true"},{"background-color1","rgb(236, 237, 255)"},{"sunday-color","rgb(193, 27, 23)"},{"java-date-mask","dd-MM-yyyy"},{"required-mark-position","left"},{"display-as","chained-menus"},{"colored","true"},{"label-color","rgb(193, 27, 23)"},{"header-color","rgb(51, 102, 153)"},{"out-of-month-color","rgb(109, 123, 141)"}});
			
                if ("none".equals(datefieldTag.getStyleValue("display"))){                    
                datefieldTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( datefieldTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("p2");
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
			ActionTag actionTag = null;
			actionTag = new ActionTag();
			actionTag.setStyle("novalidate accept");
			actionTag.setId("back");
			actionTag.setValue("Volver", false, true );
			actionTag.setStyleValues(new String[][]{{"display-as","button"},{"img-position","left"}});
			
                if ("none".equals(actionTag.getStyleValue("display"))){                    
                actionTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( actionTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
	documentTag.addDescendantTag( bodyTag );
	}
DocumentCache.getInstance().put(wd.getContext(),documentTag);
}
}
}

documentTag.write_html_web_3_2(wd);
}%>