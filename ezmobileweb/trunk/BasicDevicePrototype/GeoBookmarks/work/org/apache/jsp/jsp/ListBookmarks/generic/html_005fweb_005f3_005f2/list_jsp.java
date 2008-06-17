package org.apache.jsp.jsp.ListBookmarks.generic.html_005fweb_005f3_005f2;

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

public final class list_jsp extends org.apache.jasper.runtime.HttpJspBase
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
documentTag.setOpName("ListBookmarks");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("list");  
documentTag.setId("list");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("GeoBookmarks List", false, true );
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
		pTag = new PTag("padd");
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
			linkTag = new LinkTag("add_bookmark");
			linkTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"}});
			
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
			linkTag.setText("Add geobookmark", false, true );
			pTag.addDescendantTag( linkTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("plist");
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
			TableTag tableTag = null;
			tableTag = new TableTag("bookmarks_list");
			tableTag.setStyle("selcol1");
			tableTag.setBind("${idRow}");
			tableTag.setOptionsbind("${bookmarks_list}");
			tableTag.setKeymember("idRow");
			tableTag.setStyleValues(new String[][]{{"page-label-type","linktoeachpage"},{"sel-column","1"},{"page-link-range","sequential"},{"page-display-total","false"},{"page-selected-color","red"},{"table-separator-char-vertical","|"},{"page-total-color","red"},{"background-color1","rgb(224, 224, 224)"},{"page-controls","only-nextprepage"},{"colored","true"},{"show-table-separator","true"},{"border-width","1"},{"table-separator-char-horizontal","--"},{"page-position","top"},{"page-control-type","link"}});
			
                if ("none".equals(tableTag.getStyleValue("display"))){                    
                tableTag.setDisplay("false");                    
                }
                
			if (TidMobileTag.isDefined(tableTag.getStyleValue("paginate"))){
                tableTag.setPaginate(tableTag.getStyleValue("paginate"));
                }
				{
				TrTag trTag = null;
				trTag = new TrTag();
				trTag.setHeader(true);
				
                if ("none".equals(trTag.getStyleValue("display"))){                    
                trTag.setDisplay("false");                    
                }
                
					{
					TdTag tdTag = null;
					tdTag = new TdTag();
					tdTag.setStyle("header");
					tdTag.setStyleValues(new String[][]{{"font-weight","bold"},{"align","center"}});
					
                if ("none".equals(tdTag.getStyleValue("display"))){                    
                tdTag.setDisplay("false");                    
                }
                
					tdTag.setText("Name", false, true );
					trTag.addDescendantTag( wd.getContext(), tdTag );
					}
					{
					TdTag tdTag = null;
					tdTag = new TdTag();
					tdTag.setStyle("header");
					tdTag.setStyleValues(new String[][]{{"font-weight","bold"},{"align","center"}});
					
                if ("none".equals(tdTag.getStyleValue("display"))){                    
                tdTag.setDisplay("false");                    
                }
                
					tdTag.setText("Location", false, true );
					trTag.addDescendantTag( wd.getContext(), tdTag );
					}
				tableTag.addDescendantTag( trTag );
				}
				{
				TrTag trTag = null;
				trTag = new TrTag();
				
                if ("none".equals(trTag.getStyleValue("display"))){                    
                trTag.setDisplay("false");                    
                }
                
					{
					TdTag tdTag = null;
					trTag.setDynamic(true);
					tdTag = new TdTag();
					tdTag.setMember("bookmarkName");
					
                if ("none".equals(tdTag.getStyleValue("display"))){                    
                tdTag.setDisplay("false");                    
                }
                
					tdTag.setText("", false, true );
					trTag.addDescendantTag( wd.getContext(), tdTag );
					}
					{
					TdTag tdTag = null;
					trTag.setDynamic(true);
					tdTag = new TdTag();
					tdTag.setMember("bookmarkLocation");
					
                if ("none".equals(tdTag.getStyleValue("display"))){                    
                tdTag.setDisplay("false");                    
                }
                
					tdTag.setText("", false, true );
					trTag.addDescendantTag( wd.getContext(), tdTag );
					}
				tableTag.addDescendantTag( trTag );
				}
			pTag.addDescendantTag( tableTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;pTag = new PTag("pMenu");
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
			linkTag = new LinkTag("lhome");
			linkTag.setResourceid("back");
			linkTag.setStyle("foot");
			linkTag.setStyleValues(new String[][]{{"img-display","both"},{"img-position","left"}});
			
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
