package org.apache.jsp.jsp.AddBookmark.generic.html_005fweb_005f3_005f2;

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

public final class add_jsp extends org.apache.jasper.runtime.HttpJspBase
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
documentTag.setOpName("AddBookmark");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("add");  
documentTag.setId("addBookmark");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("Add GeoBookmark", false, true );
		headTag.addDescendantTag( titleTag );
		}
		{
		StyleTag styleTag = null;
		styleTag = new StyleTag();
		styleTag.setHref("mypresentation.css");
		headTag.addDescendantTag( styleTag );
		}
	documentTag.addDescendantTag( headTag );
	}
	{
	org.morfeo.tidmobile.tags.BodyTag bodyTag = null;
	bodyTag = new org.morfeo.tidmobile.tags.BodyTag();
	bodyTag.setStyleValues(new String[][]{{"display-panels-as","plain-flow"},{"panel-links-layout","horizontal"}});
		{
		PTag pTag = null;
		pTag = new PTag("pform");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","left"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		pTag.setStyleValue("layout", "grid");
		pTag.setStyleValue("cols", "2");
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
                bodyTag.setHasForm(true);
            }
        
			{
			LabelTag labelTag = null;
			labelTag = new LabelTag();
			labelTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"}});
			
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
			labelTag.setText("Name:", false, true );
			pTag.addDescendantTag( labelTag );
			}
			{
			EntryfieldTag entryfieldTag = null;
			entryfieldTag = new EntryfieldTag("bookmarkName");
			entryfieldTag.setBind("${bookmarkName}");
			documentTag.addEntryfieldReference( entryfieldTag );
			entryfieldTag.setStyleValues(new String[][]{{"expand","false"},{"readonly","false"},{"required-mark-position","left"},{"maxlength","100"},{"display-as","simulated-disabled"},{"type","text"},{"required","false"},{"disabled","false"},{"size","19"},{"required-mark","true"},{"required-mark-color","red"}});
			
                if ("none".equals(entryfieldTag.getStyleValue("display"))){                    
                entryfieldTag.setDisplay("false");                    
                }
                
			entryfieldTag.setValue("${bookmarkName}", true, false );
			entryfieldTag.setTitle("Name", false, true );
			pTag.addDescendantTag( entryfieldTag );
			}
			{
			LabelTag labelTag = null;
			labelTag = new LabelTag();
			labelTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"}});
			
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
			labelTag.setText("Location:", false, true );
			pTag.addDescendantTag( labelTag );
			}
			{
			EntryfieldTag entryfieldTag = null;
			entryfieldTag = new EntryfieldTag("bookmarkLocation");
			entryfieldTag.setBind("${bookmarkLocation}");
			documentTag.addEntryfieldReference( entryfieldTag );
			entryfieldTag.setStyleValues(new String[][]{{"expand","false"},{"readonly","false"},{"required-mark-position","left"},{"maxlength","100"},{"display-as","simulated-disabled"},{"type","text"},{"required","false"},{"disabled","false"},{"size","19"},{"required-mark","true"},{"required-mark-color","red"}});
			
                if ("none".equals(entryfieldTag.getStyleValue("display"))){                    
                entryfieldTag.setDisplay("false");                    
                }
                
			entryfieldTag.setValue("${bookmarkLocation}", true, false );
			entryfieldTag.setTitle("Location", false, true );
			pTag.addDescendantTag( entryfieldTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("pform2");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","left"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		pTag.setStyleValue("layout", "vertical");
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
                bodyTag.setHasForm(true);
            }
        
			{
			SelectTag selectTag = null;
			selectTag = new SelectTag("bookmarkType", wd.getContext() );
			selectTag.setBind("${bookmarkType}");
			documentTag.addSelectReference( selectTag );
			selectTag.setStyleValues(new String[][]{{"required-mark-position","left"},{"display-as","combo"},{"required","false"},{"multiple","false"},{"dummy-option","true"},{"required-mark","true"},{"required-mark-color","red"}});
			
                if ("none".equals(selectTag.getStyleValue("display"))){                    
                selectTag.setDisplay("false");                    
                }
                
			if (TidMobileTag.isDefined(selectTag.getStyleValue("paginate"))){
                selectTag.setPaginate(selectTag.getStyleValue("paginate"));
                }
				{
				OptionTag optionTag = null;
				LabelTag labelTag = null;
				optionTag = new OptionTag();
				optionTag.setValue("address");
				optionTag.setSelected("true");
				optionTag.setText("address", false, true );
				labelTag = new LabelTag();
				
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
				labelTag.setText("address", false, true );
				selectTag.addDescendantTag( optionTag );
				}
				{
				OptionTag optionTag = null;
				LabelTag labelTag = null;
				optionTag = new OptionTag();
				optionTag.setValue("utm");
				optionTag.setText("utm", false, true );
				labelTag = new LabelTag();
				
                if ("none".equals(labelTag.getStyleValue("display"))){                    
                labelTag.setDisplay("false");                    
                }
                
				labelTag.setText("utm", false, true );
				selectTag.addDescendantTag( optionTag );
				}
			pTag.addDescendantTag( selectTag );
			}
			{
			SubmitTag submitTag = null;
			submitTag = new SubmitTag("add");
			documentTag.addSubmitReference( submitTag );
			bodyTag.setHasForm(true);
			submitTag.setValue("Add", false, true );
			submitTag.setStyleValues(new String[][]{{"validate","true"},{"img-position","left"}});
			
                if ("none".equals(submitTag.getStyleValue("display"))){                    
                submitTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( submitTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;pTag = new PTag("pBack");
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
			linkTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"}});
			
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
			linkTag.setText("Volver", false, true );
			{
			ImageTag imageTag = new ImageTag();
			linkTag.setStylesImage( imageTag.getStyleValues() );
			}
			pTag.addDescendantTag( linkTag );
			}
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
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
