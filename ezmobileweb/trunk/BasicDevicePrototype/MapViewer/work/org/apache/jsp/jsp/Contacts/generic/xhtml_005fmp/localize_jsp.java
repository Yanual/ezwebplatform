package org.apache.jsp.jsp.Contacts.generic.xhtml_005fmp;

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

public final class localize_jsp extends org.apache.jasper.runtime.HttpJspBase
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

 WriterData wd = new WriterData( out, request, CmtConstants.XHTML_MP ); 
 wd.out.append(CmtConstants.XML_HEADER_POSTFIX).append(ContentTypeConfigurator.getCharset(ContextUtil.getUserDevice(wd.getContext()), wd.getRequest())).append(CmtConstants.XML_HEADER_SUFFIX); 
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
documentTag.setOpName("Contacts");   
documentTag.setFamilyName("generic");  
documentTag.setPresentationName("localize");  
documentTag.setId("list");
documentTag.setStyleValues(new String[][]{{"padding","1"},{"margin","1"}});
	{
	HeadTag headTag = null;
	headTag = new HeadTag();
		{
		TitleTag titleTag = null;
		titleTag = new TitleTag();
		titleTag.setStyleValues(new String[][]{{"show-separator","true"},{"font-size","-1"},{"font-weight","bold"},{"img-display","both"},{"align","center"},{"include","true"},{"img-position","left"}});
		titleTag.setText("Map Viewer", false, true );
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
		pTag = new PTag("principal");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","left"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		pTag.setStyleValue("align", "left");
		pTag.setStyleValue("layout", "vertical");
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
                bodyTag.setHasForm(true);
            }
        
			{
			ImageTag imageTag = null;
			imageTag = new ImageTag("localize","Localize");
			imageTag.setSrc("${localize}", true );
			imageTag.setStyleValues(new String[][]{{"display-as","clickable-image"},{"padding","0"},{"align","middle"},{"border-width","0"},{"margin","0"},{"aspect-ratio","true"}});
			
                if ("none".equals(imageTag.getStyleValue("display"))){                    
                imageTag.setDisplay("false");                    
                }
                
			pTag.addDescendantTag( imageTag );
			}
			{
			MenuTag menuTag = null;
			menuTag = new MenuTag("cursors");
			menuTag.setBind("${cursor}");
			menuTag.setOptionsbind("${cursors}");
			menuTag.setStyle("clickable");
			menuTag.setStyleValues(new String[][]{{"show-menu-separator","false"},{"page-label-type","linktoeachpage"},{"visibility","visible"},{"page-link-range","sequential"},{"page-selected-color","red"},{"page-display-total","false"},{"required","true"},{"layout","vertical"},{"menu-separator-char-vertical","|"},{"img-position","left"},{"page-total-color","red"},{"max-rows","9"},{"ordered-list","false"},{"page-controls","only-nextprepage"},{"autoselect","none"},{"display-as","clickable-image"},{"img-display","both"},{"align","left"},{"pagination-type","nextprepage"},{"page-position","bottom"},{"page-control-type","link"}});
			menuTag.setDisplay("${_MYMW_DEV_BELONGS.PcDevice or _MYMW_DEV_BELONGS.PdaDevice}");
			if (TidMobileTag.isDefined(menuTag.getStyleValue("paginate"))){
                menuTag.setPaginate(menuTag.getStyleValue("paginate"));
                }
			menuTag.setResourceid("cursors", false );
			menuTag.setAlign("left");
			menuTag.setDynamicInfo("generic","xhtml_mp","mymem.css","menu","clickable",wd.getContext());
			
           String displayAs = menuTag.getStyleValue("display-as");
	       if ("combo-button".equals(displayAs) || "combo".equals(displayAs)){
				bodyTag.setHasForm(true);
		   }
         
			pTag.addDescendantTag( menuTag );
			}
		bodyTag.addDescendantTag( pTag );
		}
		{
		PTag pTag = null;
		pTag = new PTag("cursors_mobile");
		pTag.setStyleValues(new String[][]{{"layout","horizontal"},{"align","left"}});
		
                if ("none".equals(pTag.getStyleValue("display"))){                    
                pTag.setDisplay("false");                    
                }
                
		if (TidMobileTag.isDefined(pTag.getStyleValue("paginate"))){
                pTag.setPaginate(pTag.getStyleValue("paginate"));
                }
		pTag.setStyleValue("align", "left");
		            
            if ("true".equals(pTag.getStyleValue("paginate"))){
                documentTag.addParPaginateReference( pTag );
                bodyTag.setHasForm(true);
            }
        
			{
			MenuTag menuTag = null;
			menuTag = new MenuTag("cursorsmobile");
			menuTag.setBind("${cursorMobile}");
			menuTag.setStyle("cursorsmobile");
			menuTag.setStyleValues(new String[][]{{"show-menu-separator","false"},{"page-label-type","linktoeachpage"},{"visibility","visible"},{"page-link-range","sequential"},{"page-selected-color","red"},{"page-display-total","false"},{"layout","vertical"},{"menu-separator-char-vertical","|"},{"img-position","left"},{"page-total-color","red"},{"max-rows","9"},{"ordered-list","false"},{"page-controls","only-nextprepage"},{"img-display","both"},{"align","left"},{"pagination-type","nextprepage"},{"page-position","bottom"},{"page-control-type","link"}});
			menuTag.setDisplay("${!_MYMW_DEV_BELONGS.PcDevice and !_MYMW_DEV_BELONGS.PdaDevice}");
			if (TidMobileTag.isDefined(menuTag.getStyleValue("paginate"))){
                menuTag.setPaginate(menuTag.getStyleValue("paginate"));
                }
			menuTag.setStyleValue("layout", "grid");
			menuTag.setStyleValue("cols", "3");
			menuTag.setAlign("left");
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("IN");
				linkTag.setAccesskey("1");
				linkTag.setResourceid("cursor_in");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				linkTag.setDisplay("${!_MYMW_DEV_BELONGS.PcDevice and !_MYMW_DEV_BELONGS.PdaDevice}");
				linkTag.setStyleValue("wap-accesskey", "1");
				linkTag.setText("1", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("UP");
				linkTag.setAccesskey("2");
				linkTag.setResourceid("cursor_up");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "2");
				linkTag.setText("2", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("OUT");
				linkTag.setAccesskey("3");
				linkTag.setResourceid("cursor_out");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "3");
				linkTag.setText("3", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("LE");
				linkTag.setAccesskey("4");
				linkTag.setResourceid("cursor_left");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "4");
				linkTag.setText("4", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("CE");
				linkTag.setAccesskey("5");
				linkTag.setResourceid("cursor_center");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "5");
				linkTag.setText("5", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("RI");
				linkTag.setAccesskey("6");
				linkTag.setResourceid("cursor_rigth");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "6");
				linkTag.setText("6", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("IN2");
				linkTag.setAccesskey("7");
				linkTag.setResourceid("cursor_in2");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "7");
				linkTag.setText("7", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("DO");
				linkTag.setAccesskey("8");
				linkTag.setResourceid("cursor_down");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "8");
				linkTag.setText("8", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
				{
				LinkTag linkTag = null;
				linkTag = new LinkTag("OUT2");
				linkTag.setAccesskey("9");
				linkTag.setResourceid("cursor_out2");
				linkTag.setStyle("imgpadding");
				linkTag.setStyleValues(new String[][]{{"padding-bottom","3.0px"},{"img-display","both"},{"border-width","0"},{"img-position","left"},{"padding-right","3.0px"},{"text-decoration","none"}});
				
                if ("none".equals(linkTag.getStyleValue("display"))){                    
                linkTag.setDisplay("false");                    
                }
                
				linkTag.setStyleValue("wap-accesskey", "9");
				linkTag.setText("9", false, true );
				{
				ImageTag imageTag = new ImageTag();
				linkTag.setStylesImage( imageTag.getStyleValues() );
				}
				menuTag.addDescendantTag( linkTag );
				}
			menuTag.setDynamicInfo("generic","xhtml_mp","mymem.css","menu","cursorsmobile",wd.getContext());
			
           String displayAs = menuTag.getStyleValue("display-as");
	       if ("combo-button".equals(displayAs) || "combo".equals(displayAs)){
				bodyTag.setHasForm(true);
		   }
         
			pTag.addDescendantTag( menuTag );
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

documentTag.write_xhtml_mp(wd);
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
