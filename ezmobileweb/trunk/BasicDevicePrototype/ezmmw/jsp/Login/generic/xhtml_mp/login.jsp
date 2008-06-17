<%--************************************************** 
 -             ***MyMobileWeb***
 - JSP code generated by MyMobileWeb Generation Proccess 
 - Date: Tue Jun 17 08:31:56 GMT+01:00 2008
**************************************************--%><%@ page session="true" %><%@ page import="org.morfeo.tidmobile.tags.writers.common.WriterData" %><%@ page import="org.morfeo.tidmobile.cfg.*" %><%@ page import="org.morfeo.tidmobile.server.lc.*" %><%@ page import="org.morfeo.tidmobile.server.*" %><%@ page import="org.morfeo.tidmobile.server.util.*" %><%@ page import="org.morfeo.tidmobile.tags.*" %><%@ page import="org.morfeo.tidmobile.CmtConstants" %><% WriterData wd = new WriterData( out, request, CmtConstants.XHTML_MP ); %><% wd.out.append(CmtConstants.XML_HEADER_POSTFIX).append(ContentTypeConfigurator.getCharset(ContextUtil.getUserDevice(wd.getContext()), wd.getRequest())).append(CmtConstants.XML_HEADER_SUFFIX); %>
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
documentTag.setOpName("Login");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("login");  
documentTag.setId("login");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyle("noinclude");
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("Validación", false, true );
		headTag.addDescendantTag( titleTag );
		}
	documentTag.addDescendantTag( headTag );
	}
	{
	org.morfeo.tidmobile.tags.BodyTag bodyTag = null;
	bodyTag = new org.morfeo.tidmobile.tags.BodyTag();
	bodyTag.setNewcontext("true");
	bodyTag.setStyleValues(new String[][]{{"display-panels-as","plain-flow"},{"panel-links-layout","horizontal"}});
		{
		PTag pTag = null;
		pTag = new PTag("p1");
		pTag.setStyle("center grid2");
		pTag.setStyleValues(new String[][]{{"cols","2"},{"layout","grid"},{"align","center"}});
		
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
			LabelTag labelTag = null;
			labelTag = new LabelTag();
			labelTag.setStyle("right");
			labelTag.setStyleValues(new String[][]{{"img-display","both"},{"align","right"},{"img-position","left"}});
			
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
			labelTag.setText("Usuario:", false, true );
			pTag.addDescendantTag( labelTag );
			}
			{
			EntryfieldTag entryfieldTag = null;
			entryfieldTag = new EntryfieldTag("USER");
			entryfieldTag.setBind("${ _MYMW_LOGIN }");
			entryfieldTag.setStyle("left login");
			documentTag.addEntryfieldReference( entryfieldTag );
			entryfieldTag.setStyleValues(new String[][]{{"expand","false"},{"readonly","false"},{"required-mark-position","left"},{"maxlength","16"},{"display-as","simulated-disabled"},{"type","text"},{"required","true"},{"align","left"},{"disabled","false"},{"size","5"},{"required-mark","true"},{"required-mark-color","red"}});
			
                if ("none".equals(entryfieldTag.getStyleValue("display"))){                    
                entryfieldTag.setDisplay("false");                    
                }
                
			entryfieldTag.setValue("${ _MYMW_LOGIN }", true, false );
			pTag.addDescendantTag( entryfieldTag );
			}
			{
			LabelTag labelTag = null;
			labelTag = new LabelTag();
			labelTag.setStyle("right");
			labelTag.setStyleValues(new String[][]{{"img-display","both"},{"align","right"},{"img-position","left"}});
			
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
			labelTag.setText("Clave:", false, true );
			pTag.addDescendantTag( labelTag );
			}
			{
			EntryfieldTag entryfieldTag = null;
			entryfieldTag = new EntryfieldTag("PASS");
			entryfieldTag.setBind("${ _MYMW_PASS }");
			entryfieldTag.setStyle("left password");
			documentTag.addEntryfieldReference( entryfieldTag );
			entryfieldTag.setStyleValues(new String[][]{{"expand","false"},{"readonly","false"},{"required-mark-position","left"},{"maxlength","16"},{"display-as","simulated-disabled"},{"type","password"},{"required","true"},{"align","left"},{"disabled","false"},{"size","5"},{"required-mark","true"},{"required-mark-color","red"}});
			
                if ("none".equals(entryfieldTag.getStyleValue("display"))){                    
                entryfieldTag.setDisplay("false");                    
                }
                
			entryfieldTag.setValue("${ _MYMW_PASS }", true, false );
			pTag.addDescendantTag( entryfieldTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("p2");
		pTag.setStyle("center");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","center"}});
		
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
			SubmitTag submitTag = null;
			submitTag = new SubmitTag("_MYMW_LG_BT");
			submitTag.setPrincipal("true");
			documentTag.addSubmitReference( submitTag );
			bodyTag.setHasForm(true);
			submitTag.setValue("Entrar", false, true );
			submitTag.setStyleValues(new String[][]{{"validate","true"},{"img-position","left"}});
			
                if ("none".equals(submitTag.getStyleValue("display"))){                    
                submitTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( submitTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
	documentTag.addDescendantTag( bodyTag );
	}
DocumentCache.getInstance().put(wd.getContext(),documentTag);
}
}
}

documentTag.write_xhtml_mp(wd);
}%>