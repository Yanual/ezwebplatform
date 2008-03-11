/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


var CatalogueFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Catalogue() {
		
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var resources = new HashTable();
		
		// ********************
		//  PRIVILEGED METHODS
		// ********************
		
	 	this.emptyResourceList = function() {
			document.getElementById("resources").innerHTML="\n";
			document.getElementById("info_resource_content").innerHTML="\n";
			resources.clear();
		}	

		this.getResources = function() {
			return resources;
		}
		
		this.getResource = function(id_) {
			return resources.getValue(id_);
		}
		
		this.addResource = function(resourceJSON_, urlTemplate_) { 
			resources.addElement("resource_" + resources.size(), new Resource("resource_" + resources.size(), resourceJSON_, urlTemplate_)); 
		}
		
		this.addResourceToShowCase = function(resourceId_) {
			UIUtils.showResourceInfo(resourceId_);
			ShowcaseFactory.getInstance().addGadget(resources.getValue(resourceId_).getUriTemplate());
		}

		this.paginate = function(items) {
			var pageInfo = document.getElementById("paginate");
			pageInfo.innerHTML = 	"<center>" + _paginate(items) + "</center>";
		}
		
		this.loadCatalogue = function(urlCatalogue_) {
		
			// ******************
			//  CALLBACK METHODS 
			// ******************
		
			//Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
			
			var onError = function(transport, e) {
				var msg;
				if (e) {
					msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
					                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
							  true);
				} else if (transport.responseXML) {
					msg = transport.responseXML.documentElement.textContent;
				} else {
					msg = "HTTP Error " + transport.status + " - " + transport.statusText;
				}

				msg = interpolate(gettext("Error retreiving catalogue data: %(errorMsg)s."), {errorMsg: msg}, true);
				OpManagerFactory.getInstance().log(msg);

				alert (gettext("Error retreiving catalogue data, please check the logs for further info."));
			}
			
			var loadResources = function(transport) {
				var response = Try.these(
									function() { 	return new DOMParser().parseFromString(transport.responseText, 'text/xml'); },
									function() { 	var xmldom = new ActiveXObject('Microsoft.XMLDOM'); 
													xmldom.loadXML(transport.responseText); 
													return xmldom; }
								);
								
				var responseJSON = transport.responseText;
				var items = transport.getResponseHeader('items');
			  var jsonResourceList = eval ('(' + responseJSON + ')');
			  jsonResourceList = jsonResourceList.resourceList
			  		  
				//var resourcesXML = response.getElementsByTagName("resource");
				
				for (var i = 0; i<jsonResourceList.length; i++)
				{
					this.addResource(jsonResourceList[i], null);
				}
				this.paginate(items);
			}
			
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(urlCatalogue_, this, loadResources, onError);
		}

	var _paginate = function(items){
		var paginationHTML = '';

		paginationHTML=( "<div id='results_per_page' class='results_per_page'>" +
		                  "<label for='combo_results_per_page'>" + gettext("Gadgets per page: ") + "</label>" +
		                  "<select id='combo_results_per_page' size=1 onChange=" + 
		                      "'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" +
		                  "\">");
        var max;
        if(items>20) {
            max = 20;
        } else {
            max = Math.ceil(items/4);
        }
		for (var i=1; i<=max; i++)
		{
		  paginationHTML+=("<option value=\"" + i*4 + "\"");
		      if(UIUtils.getOffset() == i*4)
		      {
		          paginationHTML+=(" SELECTED");
		      }
		  paginationHTML+=(">" + i*4);
		}
		paginationHTML+=("</select></div></br>");
          
		var end_page = Math.ceil(items/UIUtils.getOffset());
        
        if(UIUtils.getPage()!=1)
        {
           var jsCall_first = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"first", "' + items + '");';
           paginationHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to first page') + "' href='" + jsCall_first + "'>" + "<img src='/ezweb/images/go-first.png'/>" + "</a></span>");
		   var jsCall_prev = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"prev", "' + items + '");';
	       paginationHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to previous page') + "' href='" + jsCall_prev + "'>" + "<img src='/ezweb/images/go-previous.png'/>" + "</a></span>");
        } else {
           paginationHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-first-dim.png'/>" + "</span>");
		   paginationHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-previous-dim.png'/>" + "</span>");
        }

		for (var i=1; i<=end_page; i++)
		{
            if(UIUtils.getPage()!=i)
            {
			     var jsCall_num = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ', "' + i + '", "' + items + '");';
			     paginationHTML += ("<span class='multiple_size_tag'>"+"<a title='" + gettext ('Go to page ') + i + "' href='" + jsCall_num + "'>" + i + "</a></span>");
		    } else {
                 paginationHTML += ("<span class='multiple_size_tag'>" + i + "</span>");
		    }
		}
		if(end_page == UIUtils.getPage())
        {
          paginationHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-next-dim.png'/>" + "</span>");
		  paginationHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-last-dim.png'/>" + "</span>");
        } else {
		  var jsCall_next = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"next", "' + items + '");';
		  paginationHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to next page') + "' href='" + jsCall_next + "'>" + "<img src='/ezweb/images/go-next.png'/>" + "</a></span>");
		  var jsCall_last = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"last", "' + items + '");';
          paginationHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to last page') + "' href='" + jsCall_last + "'>" + "<img src='/ezweb/images/go-last.png'/>" + "</a></span>");
		}

		return paginationHTML;
	}
	}
	
	// ************************
	//  SINGLETON GET INSTANCE
	// ************************
	
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new Catalogue();
         	}
         	return instance;
       	}
	}
	
}();
