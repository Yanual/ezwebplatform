package org.apache.jsp.jsp.Messages.generic.html_005fweb_005f3_005f2;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import org.morfeo.tidmobile.tags.writers.common.WriterData;
import org.morfeo.tidmobile.cfg.*;
import org.morfeo.tidmobile.server.lc.*;
import org.morfeo.tidmobile.server.*;
import org.morfeo.tidmobile.server.util.*;
import org.morfeo.tidmobile.tags.*;
import org.morfeo.tidmobile.CmtConstants;

public final class error_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private int[] lock = new int[0]; 
  private static java.util.List _jspx_dependants;

  public Object getDependants() {
    return _jspx_dependants;
  }

  public void _jspService(HttpServletRequest request, HttpServletResponse response)
        throws java.io.IOException, ServletException {

    JspFactory _jspxFactory = null;
    PageContext pageContext = null;
    HttpSession session = null;
    ServletContext application = null;
    ServletConfig config = null;
    JspWriter out = null;
    Object page = this;
    JspWriter _jspx_out = null;
    PageContext _jspx_page_context = null;


    try {
      _jspxFactory = JspFactory.getDefaultFactory();
      response.setContentType("text/html");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

 WriterData wd = new WriterData( out, request, CmtConstants.HTML ); 
      out.write('\n');

boolean jstl = false;

      out.write('\n');
      out.write('\n');
      out.write('\n');
      out.write('\n');
 {
boolean cache = false;

if( !cache ) CacheConfigurator.resourceExpiresNow( response, wd.getDevice() );
} 
      out.write('\n');
      out.write('\n');
      out.write('\n');
      out.write(' ');
      out.write('\n');
      out.write('\n');


{
int wmode = ConfigUtil.getWorkingMode(Configurator.getInstance().getGlobalConfiguration());
DocumentTag documentTag = DocumentCache.getInstance().get( wd.getContext() );
if( jstl || documentTag == null || wmode == ServerConstants.WMODE_DEV ) {
synchronized(lock) {
documentTag = DocumentCache.getInstance().get(wd.getContext());
if(documentTag == null || wmode == ServerConstants.WMODE_DEV) {
documentTag = new DocumentTag();
documentTag.setOpName("Messages");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("error");  
documentTag.setId("error");
documentTag.setStyleValues(new String[][]{{"margin","1"},{"padding","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyleValues(new String[][]{{"img-position","left"},{"font-size","-1"},{"align","center"},{"show-separator","true"},{"font-weight","bold"},{"img-display","both"},{"include","true"}});
		titleTag.setText("${_MYMW_USER_MSG.caption}", true, true );
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
		pTag.setStyle("center vertical");
		pTag.setStyleValues(new String[][]{{"align","center"},{"layout","vertical"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
            }
        
			{
			ImageTag imageTag = null;
			imageTag = new ImageTag("ierror","Error");
			imageTag.setResourceid("_MYMW_ERROR", false );
			imageTag.setStyleValues(new String[][]{{"aspect-ratio","true"},{"margin","0"},{"border-width","0"},{"padding","0"}});
			
                if ("none".equals(imageTag.getStyleValue("display"))){                    
                imageTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( imageTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("p2");
		pTag.setStyle("center vertical");
		pTag.setStyleValues(new String[][]{{"align","center"},{"layout","vertical"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
            }
        
			{
			TextareaTag textareaTag = null;
			textareaTag = new TextareaTag("ta");
			textareaTag.setStyle("small disabled big");
			documentTag.addTextareaReference( textareaTag );
			textareaTag.setStyleValues(new String[][]{{"required-mark-position","left"},{"cols","12"},{"white-space","nowrap"},{"expand","true"},{"required","false"},{"readonly","false"},{"required-mark","true"},{"required-mark-color","red"},{"disabled","true"},{"display-as","simulated-disabled"},{"rows","6"}});
			
                if ("none".equals(textareaTag.getStyleValue("display"))){                    
                textareaTag.setDisplay("false");                    
                }
                
			if (TidMobileTag.isDefined(textareaTag.getStyleValue("paginate"))){
                textareaTag.setPaginate(textareaTag.getStyleValue("paginate"));
                }
			{
			if (textareaTag.getStyleValueAsBoolean("readonly")) {
			}
			{
			}
			}
			textareaTag.setText("${_MYMW_USER_MSG.text}", true, false );
			pTag.addDescendantTag( textareaTag );
			}
			{
			ActionTag actionTag = null;
			actionTag = new ActionTag();
			actionTag.setStyle("novalidate accept");
			actionTag.setId("_MYMW_E_BACK");
			actionTag.setValue("Volver", false, true );
			actionTag.setStyleValues(new String[][]{{"img-position","left"},{"display-as","button"}});
			
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
}
    } catch (Throwable t) {
      if (!(t instanceof SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          out.clearBuffer();
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
      }
    } finally {
      if (_jspxFactory != null) _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
