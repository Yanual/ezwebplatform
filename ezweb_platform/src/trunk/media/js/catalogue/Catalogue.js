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
		var selectedResources = [];
		var globalTags = [];
		
		// ********************
		//  PRIVILEGED METHODS
		// ********************
		
	 	this.emptyResourceList = function() {
			document.getElementById("resources").innerHTML="\n";
			document.getElementById("info_resource_content").innerHTML="\n";
			CatalogueFactory.getInstance().clearSelectedResources();
			resources.clear();
		}	

		this.getResources = function() {
			return resources;
		}
		
		this.getResource = function(id_) {
			return resources.getValue(id_);
		}
		
		this.addSelectedResource = function(id_) {
			if(!CatalogueFactory.getInstance().isSelectedResource(id_)) {
				selectedResources.push(id_);
			}
		}
		this.isSelectedResource = function(id_) {
			for (var i=0; i<selectedResources.length; i++){
					if (selectedResources[i] == id_) {
						return true;
					}
				}
			return false;
		}
		
		this.removeSelectedResource = function(id_) {
			for (var i=0; i<selectedResources.length; i++){
				if (selectedResources[i] == id_) {
					selectedResources = selectedResources.without(selectedResources[i]);
				}
			}
		}
		
		this.clearSelectedResources = function() {
			selectedResources = [];
		}
	
		this.toggleSelectedResource = function(id_) {
			if(isSelectedResources(id_)) {
				removeSelectedResource(id_)
			}else{
				addSelectedResource(id_);
			}
		}
		
		this.getSelectedResources = function() {
			return selectedResources;
		}
		
		this.addResource = function(resourceJSON_, urlTemplate_) { 
			resources.addElement("resource_" + resources.size(), new Resource("resource_" + resources.size(), resourceJSON_, urlTemplate_)); 
		}
		
		this.addResourceToShowCase = function(resourceId_) {
			UIUtils.showResourceInfo(resourceId_);
			ShowcaseFactory.getInstance().addGadget(resources.getValue(resourceId_).getUriTemplate());
		}

		this.paginate = function(items) {
			var pageInfo = document.getElementById("paginate_show");
			pageInfo.innerHTML = _paginate_show(items);
			var pageInfo = document.getElementById("paginate");
			pageInfo.innerHTML = _paginate(items);
		}

		this.orderby = function(items){
			var orderbyInfo = document.getElementById("orderby");
			orderbyInfo.innerHTML = _orderby(items);
		}
		
		this.changeGlobalTagcloud = function(type){	
			// TBD
			/*
			var option = {}
			var viewTagsHTML = "";
			switch (type) {
				case 'mytags':
					option = {tags: type}
					viewTagsHTML =	"<a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"all\");'>" + gettext ('View all tags') + "</a>" +
									"&nbsp&nbsp&nbsp <a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"others\");'>" + gettext ('View others tags') + "</a>";
					document.getElementById('view_global_tags_links').innerHTML = viewTagsHTML;
					break;
					
				case 'others':
					option = {tags: type}
					viewTagsHTML =	"<a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"all\");'>" + gettext ('View all tags') + "</a>" +
									"&nbsp&nbsp&nbsp <a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"mytags\");'>" + gettext ('View my tags') + "</a>";
					document.getElementById('view_global_tags_links').innerHTML = viewTagsHTML;
					break;
					
				default:
					option = {tags: type}
					viewTagsHTML = "<a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"mytags\");'>" + gettext ('View my tags') + "</a>" +
							"&nbsp&nbsp&nbsp <a href='javascript:CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).changeTagcloud(\"others\");'>" + gettext ('View others tags') + "</a>";
					document.getElementById('view_global_tags_links').innerHTML = viewTagsHTML;
					break;
			}	
			if (document.getElementById('global_tagcloud'))
			{
				document.getElementById("global_tagcloud").innerHTML = _globalTagsToTagcloud('description',option);
			}
			*/
		}
		
		this.updateGlobalTags = function() {
			if(UIUtils.tagmode){
				if(selectedResources.length==0){
					globalTags = [];
					document.getElementById("global_tagcloud").innerHTML = _globalTagsToTagcloud('description');
					return;
				}
				globalTags=CatalogueFactory.getInstance().getResource(selectedResources[0]).getTags();
				var auxTags = [];
				var bool = [];
				for (var i=1; i<selectedResources.length; i++){
					auxTags = CatalogueFactory.getInstance().getResource(selectedResources[i]).getTags();
					for(var k=0;k<globalTags.length; k++){
						bool[k] = false;
						for(var j=0;j<auxTags.length;j++)
						{
							if (auxTags[j].getValue()==globalTags[k].getValue()){
								bool[k] = true;
								break;
							}
						}
	
					}
	
					var auxGlobalTags = [];
					var counter=0;
					for(var k=0;k<globalTags.length; k++){
						if(bool[k]){
							auxGlobalTags[counter]=globalTags[k];
							counter++;
						}
					}
					globalTags=auxGlobalTags;						
				}
				document.getElementById("global_tagcloud").innerHTML = _globalTagsToTagcloud('description');
			}
		}
		
		this.getGlobalTags = function() {
			return globalTags;
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

				msg = interpolate(gettext("Error retrieving catalogue data: %(errorMsg)s."), {errorMsg: msg}, true);
				OpManagerFactory.getInstance().log(msg);

				alert (gettext("Error retrieving catalogue data, please check the logs for further info."));
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
			    jsonResourceList = jsonResourceList.resourceList;
			  		  
				//var resourcesXML = response.getElementsByTagName("resource");
				for (var i = 0; i<jsonResourceList.length; i++)
				{
					this.addResource(jsonResourceList[i], null);
				}
				this.paginate(items);
				this.orderby(items);
				this.updateGlobalTags();
				
				//UIUtils.removeAllGlobalTags();
				document.getElementById("global_tagcloud").innerHTML = '';
			}

			var param = {orderby: UIUtils.orderby};
			
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(urlCatalogue_, this, loadResources, onError, param);
		}

	var _paginate_show = function(items){
		var paginationHTML = '';
		if(items==0) {
			paginationHTML=("<label for='combo_results_per_page'>" + gettext("Gadgets per page: ") + "</label>" +
		                  "<select id='combo_results_per_page' size=1 disabled onChange=" + 
		                  "'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" + "\">");			
		} else {
			paginationHTML=( "<label for='combo_results_per_page'>" + gettext("Gadgets per page: ") + "</label>" +
		                  "<select id='combo_results_per_page' size=1 onChange=" + 
		                  "'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" + "\">");
		
   	    	var max;
   	    	if(items>20) {
   	        	max = 20;
   	     	} else {
   	         	max = Math.ceil(items/4);
   	     	}
   	     	var some_selected = false;
			for (var i=1; i<=max; i++){
			  	paginationHTML+=("<option value=\"" + i*4 + "\"");
				if(UIUtils.getOffset() == i*4){
					paginationHTML+=(" SELECTED");
					some_selected=true;
				}
				if((i==max)&&(!some_selected)){
					paginationHTML+=(" SELECTED");
					UIUtils.offset=max;
				}
				paginationHTML+=(">" + i*4);
			}
		}
		paginationHTML+=("</select>");
		return paginationHTML;
	}
	
	var _paginate = function(items){
		var paginationHTML = '';
		var end_page = Math.ceil(items/UIUtils.getOffset());
        if (end_page==0){end_page=1;}
        if(UIUtils.getPage()!=1)
        {
           var jsCall_first = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"first", "' + items + '");';
           paginationHTML += ("<span class='pagination_button'><a title='" + gettext ('Go to first page') + "' href='" + jsCall_first + "'>" + "<img src='/ezweb/images/go-first.png'/>" + "</a></span>");
		   var jsCall_prev = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"prev", "' + items + '");';
	       paginationHTML += ("<span class='pagination_button'><a title='" + gettext ('Go to previous page') + "' href='" + jsCall_prev + "'>" + "<img src='/ezweb/images/go-previous.png'/>" + "</a></span>");
        } else {
           paginationHTML += ("<span class='pagination_button'>" + "<img src='/ezweb/images/go-first-dim.png'/>" + "</span>");
		   paginationHTML += ("<span class='pagination_button'>" + "<img src='/ezweb/images/go-previous-dim.png'/>" + "</span>");
        }

		for (var i=1; i<=end_page; i++)
		{
            if(UIUtils.getPage()!=i)
            {
			     var jsCall_num = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ', "' + i + '", "' + items + '");';
			     paginationHTML += ("<span class='pagination_button'>"+"<a title='" + gettext ('Go to page ') + i + "' href='" + jsCall_num + "'>" + i + "</a></span>");
		    } else {
                 paginationHTML += ("<span class='pagination_button'>" + i + "</span>");
		    }
		}
		if(end_page == UIUtils.getPage())
        {
          paginationHTML += ("<span class='pagination_button'>" + "<img src='/ezweb/images/go-next-dim.png'/>" + "</span>");
		  paginationHTML += ("<span class='pagination_button'>" + "<img src='/ezweb/images/go-last-dim.png'/>" + "</span>");
        } else {
		  var jsCall_next = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"next", "' + items + '");';
		  paginationHTML += ("<span class='pagination_button'><a title='" + gettext ('Go to next page') + "' href='" + jsCall_next + "'>" + "<img src='/ezweb/images/go-next.png'/>" + "</a></span>");
		  var jsCall_last = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"last", "' + items + '");';
          paginationHTML += ("<span class='pagination_button'><a title='" + gettext ('Go to last page') + "' href='" + jsCall_last + "'>" + "<img src='/ezweb/images/go-last.png'/>" + "</a></span>");
		}

		return paginationHTML;
	}

    var _orderby = function(items) {
		orderbyHTML = '';
		if (items==0){
			orderbyHTML=( "<label for='combo_order_by'>" + gettext(" Order by") + ": </label>" +
		                "<select id='combo_order_by' disabled onChange=" + 
		                "'javascript:UIUtils.setOrderby(this);UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" +
		                "\"></select>");
		}else{
			orderbyHTML=( "<label for='combo_order_by'>" + gettext(" Order by") + ": </label>" +
		                "<select id='combo_order_by' onChange=" + 
		                "'javascript:UIUtils.setOrderby(this);UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" +
		                "\">" +
						"<option value=\"-creation_date\"");
			if (UIUtils.orderby == "-creation_date" )
			{
				orderbyHTML+=(" SELECTED");
			}
			orderbyHTML+=(   ">" + gettext("Creation date") + "</option>" +
			            "<option value=\"short_name\"");
			if (UIUtils.orderby == "short_name" )
			{
				orderbyHTML+=(" SELECTED");
			}
			orderbyHTML+=(   ">" + gettext("Name") + "</option>" +
			            "<option value=\"vendor\"");
			if (UIUtils.orderby == "vendor" )
			{
				orderbyHTML+=(" SELECTED");
			}
			orderbyHTML+=(   ">" + gettext("Vendor") + "</option>" +
			            "<option value=\"author\"");
			if (UIUtils.orderby == "author" )
			{
				orderbyHTML+=(" SELECTED");
			}
			orderbyHTML+=(   ">" + gettext("Author") + "</option>" +
			            "</select>");
		}
		return orderbyHTML;
	}
	
	var _globalTagsToTagcloud = function(loc){
		var tagsHTML = '';

		var option = arguments[1] || {tags:'all'};
/*
		for (var i=0; i<globalTags.length; i++)
		{
			if(globalTags[i].getAdded_by() == 'Yes' && (option.tags=='all' || option.tags=='mytags')){  

				var jsCall = 'javascript:UIUtils.removeTagUser("' + globalTags[i].getValue() + '","'+id+'");';
				tagsHTML += ("<a title='" + gettext ('Delete tag') + "' href='" + jsCall + "' ><img id='"+id+"_deleteIcon_"+i+"_"+loc+"' onMouseOver=\"getElementById('"+id+"_deleteIcon_"+i+"_"+loc+"').src='/ezweb/images/delete.png';\" onMouseOut=\"getElementById('"+id+"_deleteIcon_"+i+"_"+loc+"').src='/ezweb/images/cancel_gray.png';\" src='/ezweb/images/cancel_gray.png' border=0 name=op1></a>"+
					"<span class='multiple_size_tag'>" + globalTags[i].tagToTypedHTML(id) + ((i<(globalTags.length-1))?",":"") + "</span>");
			}
			else{
				if (globalTags[i].getAdded_by() == 'No' && (option.tags=='all' || option.tags=='others'))
				{
					tagsHTML += ("<span class='multiple_size_tag'>" + globalTags[i].tagToTypedHTML(id) + ((i<(globalTags.length-1))?",":"") + "</span>");		  
				}
			}
		}
*/
		for (var i=0; i<globalTags.length; i++)
		{
			tagsHTML += ("<span class='multiple_size_tag'>" + globalTags[i].tagToTypedHTML() + ((i<(globalTags.length-1))?",":"") + "</span>");
		}
		return tagsHTML;
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
