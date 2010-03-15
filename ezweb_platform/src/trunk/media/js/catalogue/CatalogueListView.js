/* 
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */

function CatalogueListView() {
		
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var resources = $H();
		var selectedResources = [];
		var globalTags = [];
		var _this = this;
		var max_gadgets_per_page = 40;
		var max_number_of_pages = 5;
		var min_offset = 10;
		var selectedResourceName = "";
		var selectedResourceVersion = "";
		var purchasableGadgets = []; 
		var availableApps = []; 

		this.mainCatalogueElement = $('app_catalogue');
		this.catalogueElement = $('app_catalogue_container');
		this.headElement = $('app_catalogue_head');
		this.resourceHeaderElement = $('app_catalogue_resources_header');
		this.resourcesElement = $('app_catalogue_resources');
		this.resourcesContainerElement = $('app_catalogue_resources_container');
		this.centerElement = $('app_catalogue_center');
		this.leftBarElement = $('app_catalogue_left_bar');
		this.catalogueContentElement = $('app_catalogue_content');
		this.simpleSearchElement = $('app_catalogue_simple_search_text');
		
	    //paint tag categories
	    this.categoryManager = new CategoryManager();
		
		Event.observe($('catalogue_link'), "click", function(){OpManagerFactory.getInstance().showCatalogue()}, false, "show_catalogue");
		
		// ********************
		//  PRIVILEGED METHODS
		// ********************

		this.initCatalogue = function () {	
			// Get Resources from PersistenceEngine. Asyncrhonous call
			if (URIs.HOME_GATEWAY_DISPATCHER_URL) {			
			
				var onSuccess = function (transport) {
					// Loading purchaseble gadgets!! only when a transport is received!
					var responseJSON = transport.responseText;
					var response = JSON.parse(responseJSON); 
					purchasableGadgets = response['available_resources'];
	
				    // Load catalogue data!
				    this.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
				}
				
				var onError = function () {
				    // Error downloading available gadgets! 
				    // Maybe the EzWeb user has no associated home gateway? 
				    // Continue loading non-contratable gadgets! 
				    purchasableGadgets = [] 
	
				    // Load catalogue data! 
				    this.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
				    UIUtils.setResourcesWidth(); 
				    this.getSimpleSearchElement().focus();
	
				}
				
				var persistenceEngine = PersistenceEngineFactory.getInstance();
				
			    var params = {'method': "GET", 'url':  URIs.HOME_GATEWAY_DISPATCHER_URL};
			    persistenceEngine.send_post("/proxy", params, this, onSuccess, onError);
			}
			else {
			    this.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
			}
		}
		
		this.reloadCompleteCatalogue = function() {
			this.initCatalogue();
		}
		
	 	this.emptyResourceList = function() {
			this.getResourcesElement().innerHTML = '';
			_this.clearSelectedResources();
			resources = $H();
		}

		this.getResources = function() {
			return resources;
		}
		
		this.getResource = function(id_) {
			return resources[id_];
		}
		
		this.getResourceByData = function(nameRes, vendor) {
			var resourceKeys = resources.keys();
			for (var i=0;i<resourceKeys.length;i++){
				var res = resources.get(resourceKeys[i]);
				if (res.getName() == nameRes && res.getVendor == vendor){
					return res;
				}
			}
			return null;
		}
		
		this.contractApplication = function (resource) {
			var contratationSuccess = function (transport) {
				var responseJSON = transport.responseText;
				var response = JSON.parse(responseJSON); 
				
				CatalogueFactory.getInstance().reloadCompleteCatalogue();
			}
			
			var contratationError = function () {
				alert("Error contracting application");
			}
			
			var url = URIs.CONTRACT_APPLICATIONS_TRANSACTION;
			var contract_list = []
			
			var gadget_apps = resource.getGadgetApps();
			
			for (var i=0; i<gadget_apps.length; i++) {
				var app = gadget_apps[i];
				
				if (! app['has_contract']) {
					var contract = {'username': ezweb_user_name, 'free': true, 'app_id': app['app_code']};
				
					contract_list.push(contract);
				}
			}
			
			var params = {'contract_list': Object.toJSON(contract_list)};
			
			PersistenceEngineFactory.getInstance().send_post(url, params, this, contratationSuccess, contratationError);
		}
		
		this.getMainCatalogueElement = function () {
			return this.mainCatalogueElement;
		}
		
		this.getContainerElement = function () {
			return this.catalogueElement;
		}
		
		this.getHeadElement = function() {
			return this.headElement;
		}
		
		this.getResourcesHeaderElement = function() {
			return this.resourceHeaderElement;
		}
		
		this.getResourcesElement = function() {
			return this.resourcesElement;
		}
		
		this.getResourcesContainerElement = function() {
			return this.resourcesContainerElement;
		}
		
		this.getCenterElement = function() {
			return this.centerElement;
		}
		
		this.getLeftBarElement = function() {
			return this.leftBarElement;
		}
		
		this.getCatalogueContentElement = function() {
			return this.catalogueContentElement;
		}
		
		this.getSimpleSearchElement = function() {
			return this.simpleSearchElement;
		}		
		
		this.getVersionManager = function(id_) {
			return verManager;
		}

		this.addSelectedResource = function(id_) {
			if(!_this.isSelectedResource(id_)) {
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
			var resourceKey = "resource_" + resources.keys().length;
			resources[resourceKey] = new Resource(resourceKey, resourceJSON_, urlTemplate_);
		}

		this.addResourceToShowCase = function(resourceId_) {
			var currentResource = this.getResource(resourceId_);
			
			if (currentResource.isContratable()) {
				var contract = currentResource.getContract();
				
				if (contract) {
					if (currentResource.getMashupId()) {
						LayoutManagerFactory.getInstance().showWindowMenu("addMashup",
								function(){CatalogueFactory.getInstance().addMashupResource(this._id);}.bind(currentResource),
								function(){CatalogueFactory.getInstance().mergeMashupResource(this._id);}.bind(currentResource));
					} else {
						ShowcaseFactory.getInstance().addGadget(currentResource.getVendor(), currentResource.getName(),  currentResource.getVersion(), currentResource.getUriTemplate());
						return;
					}
				} else {
				    LayoutManagerFactory.getInstance().showWindowMenu('purchaseAppMenu', 
				      CatalogueFactory.getInstance().contractApplication,
				      LayoutManagerFactory.getInstance().hideCover,
				      this.getResource(resourceId_)
				    );
			    }
			    
			    return;
			}
			
			ShowcaseFactory.getInstance().addGadget(currentResource.getVendor(), currentResource.getName(),  currentResource.getVersion(), currentResource.getUriTemplate());
		}

		this.addMashupResource = function(resourceId_) {
			/***CALLBACK methods***/
			var cloneOk = function(transport){
				var response = transport.responseText;
				var wsInfo = JSON.parse(response);
				//create the new workspace and go to it				
				opManager = OpManagerFactory.getInstance();
				opManager.workSpaceInstances[wsInfo.workspace.id] = new WorkSpace(wsInfo.workspace);
		
				ShowcaseFactory.getInstance().reload(wsInfo.workspace.id);
				
				LayoutManagerFactory.getInstance().logStep(''); 
				
			}

			var cloneError = function(transport, e) {
				var logManager = LogManagerFactory.getInstance();
				var msg = logManager.formatError(gettext("Error merging workspace: %(errorMsg)s."), transport, e);
				logManager.log(msg);
				LayoutManagerFactory.getInstance().logStep('');
			}
			LayoutManagerFactory.getInstance()._startComplexTask(gettext("Adding the mashup"), 1);
			LayoutManagerFactory.getInstance().logSubTask(gettext("Creating a new workspace"));
			var currentResource = this.getResource(resourceId_);
			var workSpaceId = currentResource.getMashupId();
			var cloneURL = URIs.GET_ADD_WORKSPACE.evaluate({'workspace_id': workSpaceId});
			PersistenceEngineFactory.getInstance().send_get(cloneURL, this, cloneOk, cloneError);
		}
		
		this.mergeMashupResource = function(resourceId_) {
			/***CALLBACK methods***/
			var mergeOk = function(transport){
				var response = transport.responseText;
				response = JSON.parse(response);
				
				//create the new workspace and go to it
				opManager = OpManagerFactory.getInstance();
		
				ShowcaseFactory.getInstance().reload(response['workspace_id']);
				LayoutManagerFactory.getInstance().logStep('');
				
			}
			var mergeError = function(transport, e) {
				var logManager = LogManagerFactory.getInstance();
				var msg = logManager.formatError(gettext("Error cloning workspace: %(errorMsg)s."), transport, e);
				logManager.log(msg);
				LayoutManagerFactory.getInstance().logStep('');
			}

			LayoutManagerFactory.getInstance()._startComplexTask(gettext("Adding the mashup"), 1);
			LayoutManagerFactory.getInstance().logSubTask(gettext("Merging with current workspace"));
			var currentResource = this.getResource(resourceId_);
			var workSpaceId = currentResource.getMashupId();
			
			var active_ws_id = OpManagerFactory.getInstance().getActiveWorkspaceId();
			
			var mergeURL = URIs.GET_MERGE_PUBLISHED_WORKSPACE.evaluate({'published_ws': workSpaceId, 'to_ws': active_ws_id});
			
			PersistenceEngineFactory.getInstance().send_get(mergeURL, this, mergeOk, mergeError);
		}

		this.paginate = function(items) {
			_paginate_show($("app_catalogue_paginate_show"), items);
			_paginate($("app_catalogue_paginate"), items);
		}

		this.orderby = function(items){
			_orderby($("app_catalogue_orderby"), items);
		}
		
		this.setAvailableApps = function(availableApps){
			this.availableApps = availableApps;
		}
		
		this.getAvailableApps = function(){
			return this.availableApps;
		}

		this.changeGlobalTagcloud = function(type){	
		
		}
		
        this.updateGlobalTags = function(){
            
        }

		this.getGlobalTags = function() {
			
		}

		this.repaintCatalogue = function (url) {
			selectedResourceName = arguments[1];
			selectedResourceVersion = arguments[2];
			keepCatSection = arguments[3];
			//repainting the catalogue when it isn't a search by category must close the category section
			if(!keepCatSection){
				this.categoryManager.closeCategories();
			}
			this.emptyResourceList();
			this.loadCatalogue(url);
		}
		
		this.show = function(){
            LayoutManagerFactory.getInstance().showCatalogue();
            UIUtils.setResourcesWidth();               
        }

		this.hide = function(){
			LayoutManagerFactory.getInstance().hideView(this.catalogueElement);
		}

		this.isContratableResource = function (resource) {
		  for (var i=0; i<resource.capabilities.length; i++) {
		      var capability = resource.capabilities[i];
                      if (capability.name.toLowerCase() == 'contratable') 
		      	 return capability.value.toLowerCase() == "true";
		      else
			return false;
		  }
 	        } 
 	                 
 	        this.isAvailableResource = function(resource) {
 	        	if (!URIs.HOME_GATEWAY_DISPATCHER_URL)
 	        		return true
 	          	for (var i=0; i<purchasableGadgets.length; i++) { 
		      		if (resource.uriTemplate == purchasableGadgets[i].gadget)  	            
 	                	return true; 
 	            } 
 	          	return false; 
 	        } 

		this.loadCatalogue = function(urlCatalogue_) {

			// ******************
			//  CALLBACK METHODS 
			// ******************

			//Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
			var onError = function(transport, e) {
				var logManager = LogManagerFactory.getInstance();
				var msg = logManager.formatError(gettext("Error retrieving catalogue data: %(errorMsg)s."), transport, e);
				logManager.log(msg);
			}

			var loadResources = function(transport) {
			  var response = Try.these(
			       function() { 
				   return new DOMParser().parseFromString(transport.responseText, 'text/xml'); 
			       },

			       function() { 
				   var xmldom = new ActiveXObject('Microsoft.XMLDOM'); 
				   xmldom.loadXML(transport.responseText);
					return xmldom; 
			       }
  			  );

			  var responseJSON = transport.responseText;
			  var items = transport.getResponseHeader('items');
			  var jsonResourceList = JSON.parse(responseJSON);
			  jsonResourceList = jsonResourceList.resourceList;

              for (var i = 0; i<jsonResourceList.length; i++) { 
                             // It's a contratable gadget 
			     if (this.isContratableResource(jsonResourceList[i])) {
			     	//It's a contratable gadget!
				//Let's see if its available at HomeGateway! 
				if (this.isAvailableResource(jsonResourceList[i])) {
				   // It's a available contratable gadget!
				   // Adding to catalogue! 
				   this.addResource(jsonResourceList[i], null);
				}
				else { 
				   //It's not available! 
				   //Not adding to catalogue!
				   continue; 
				}
			     }
			     else {
			     	  // It's a normal not purchasable gadget 
				  // Always adding to catalogue
				  this.addResource(jsonResourceList[i], null); 
 	                          continue; 
 	             } 
			  }

			  this.paginate(items);
			  this.orderby(items);
			  $('global_tagcloud').innerHTML = '';
			  
			  UIUtils.setResourcesWidth();
			  UIUtils.resizeResourcesContainer();
			  this.getSimpleSearchElement().focus();
			  
			  UIUtils.repaintCatalogue=false;
			}
			// Initialize the parameters			
			if (UIUtils.searchValue != "")
				var param = {orderby: UIUtils.orderby, search_criteria: UIUtils.searchValue, search_boolean:$("global_search_boolean").value};
			else
				var param = {orderby: UIUtils.orderby, search_boolean:$("global_search_boolean").value}
			
			//This Catalogue only shows mashups
			param["scope"] = "mashup"	

			var persistenceEngine = PersistenceEngineFactory.getInstance();

			var text = "";
			switch(UIUtils.searchCriteria){
				case "or":
				case "simple_or":
					text = gettext('Search') + ': ';
					break;
			}
			
			var searching='';
			switch(UIUtils.searchCriteria){
				case "or":
				case "simple_or":
					var auxiliar_or=[""];
					auxiliar_or=UIUtils.splitString(UIUtils.searchValue[0]);
					for (var j=0;j<auxiliar_or.length;j++){
						if(j==auxiliar_or.length-1){
							searching += auxiliar_or[j] + ".";
						}else if(j==auxiliar_or.length-2){
							searching += auxiliar_or[j] + ' ' + gettext('or') + ' ';
						}else{
							searching += auxiliar_or[j] + ' ' + gettext('or') + ' ';
						}
					}
					break;
			}
			
			var auxiliar = urlCatalogue_.toString().split("/");
			for (var i=0;i<auxiliar.length;i++){
				if (auxiliar[i] == 'resource') {
					break;
				} else if (auxiliar[i] == 'search' || auxiliar[i]=='globalsearch') {
					var reload_link = UIUtils.createHTMLElement("a", $H({
						innerHTML: gettext("Reload")
					}));
					reload_link.observe("click", function(event){
						CatalogueFactory.getInstance().emptyResourceList();
						CatalogueFactory.getInstance().loadCatalogue(urlCatalogue_);
					});
					break;
				}
			}

			var reload_catalogue_link = UIUtils.createHTMLElement("a", $H({
				id: 'reload_catalogue_link',
				innerHTML: gettext("Reload Catalogue")
			}));
			reload_catalogue_link.observe("click", function(event){
				CatalogueFactory.getInstance().reloadCompleteCatalogue();
				$('header_always_error').style.display = 'none';
			});
		
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(urlCatalogue_, this, loadResources, onError, param);
		}

	var _paginate_show = function(parent, items){
		parent.innerHTML = "";
		parent.appendChild(UIUtils.createHTMLElement("label", $H({
			for_: 'app_catalogue_combo_results_per_page',
			innerHTML: gettext("Gadgets per page: ")
		})));
		var select = UIUtils.createHTMLElement("select", $H({
			id: 'app_catalogue_combo_results_per_page',
			size: '1'
		}));
		select.observe("change", function(event){
			UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, $('app_catalogue_combo_results_per_page').options[$('app_catalogue_combo_results_per_page').selectedIndex].value.toString(), 'first', items);
		});
		parent.appendChild(select);
		if(items<=0) {
			select.setAttribute("disabled", "disabled");
		}
		else {
			var max;
			if(items>max_gadgets_per_page) {
				max = max_gadgets_per_page/min_offset;
			} else {
				max = Math.ceil(items/min_offset);
			}
			var some_selected = false;
			for (var i=1; i<=max; i++){
				var option = UIUtils.createHTMLElement("option", $H({
					value: "" + (i*min_offset),
					innerHTML: "" + (i*min_offset)
				}));
				if(UIUtils.getOffset() == i*min_offset){
					option.setAttribute("selected", "selected");
					some_selected=true;
				}
				if((i==max)&&(!some_selected)){
					option.setAttribute("selected", "selected");
					UIUtils.offset=max;
				}
				select.appendChild(option);
			}
		}
	}
	
	var _paginate = function(parent, items){
		parent.innerHTML = '';
		var end_page = Math.ceil(items/UIUtils.getOffset());
        if (end_page==0){end_page=1;}
		
		var first_span = UIUtils.createHTMLElement("span", $H({
		   	class_name: 'pagination_button'
		}));
		parent.appendChild(first_span);
		var previous_span = UIUtils.createHTMLElement("span", $H({
		   	class_name: 'pagination_button'
		}));
		parent.appendChild(previous_span);
		
		// First and previous page
        if(UIUtils.getPage()!=1)
        {
			var first_link = UIUtils.createHTMLElement("a", $H({
				title: gettext('Go to first page')
			}));
			first_link.observe("click", function(event){
				UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(),"first", items);
			});
			first_span.appendChild(first_link);
			var first_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-first')
			}));
			first_link.appendChild(first_img);
			var previous_link = UIUtils.createHTMLElement("a", $H({
				title: gettext('Go to previous page')
			}));
			previous_link.observe("click", function(event){
				UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(), "prev", items);
			});
			previous_span.appendChild(previous_link);
			var previous_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-previous')
			}));
			previous_link.appendChild(previous_img);
        } 
		else {
			var first_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-first-disabled')
			}));
			first_span.appendChild(first_img);
			var previous_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-previous-disabled')
			}));
			previous_span.appendChild(previous_img);
        }
		
		// Number of pages
		var first_page_shown = (parseInt(UIUtils.getPage()) - 2 > 1) ? parseInt(UIUtils.getPage()) - 2 : 1;
		var last_page_shown = (parseInt(UIUtils.getPage()) + 2 < end_page) ? parseInt(UIUtils.getPage()) + 2 : end_page;
		var npages = last_page_shown - first_page_shown + 1;
		var pages_to_show = (max_number_of_pages < end_page)?max_number_of_pages:end_page;
		if (npages < pages_to_show){
			if (first_page_shown <= 2){
				last_page_shown += pages_to_show - npages;
			}else if (last_page_shown >= end_page - 2){
				first_page_shown -= pages_to_show - npages;
			}		
		}
		
		/*if (last_page_shown == end_page){
			if (first_page_shown > 1){
				first_page_shown -= end_page - last_page_shown
			}			
		}*/
		for (var i=first_page_shown; i<=last_page_shown; i++)
		{
            if(parseInt(UIUtils.getPage())!=i)
            {
				var page_span = UIUtils.createHTMLElement("span", $H({
					class_name: 'pagination_button'
				}));
				parent.appendChild(page_span);
				var page_link = UIUtils.createHTMLElement('a', $H({
					title: gettext('Go to page ') + i,
					innerHTML: '' + i
				}));
				page_link.observe("click", function(event){
					UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(), this.innerHTML , items);
				});
				page_span.appendChild(page_link);
		    } 
			else {
				parent.appendChild(UIUtils.createHTMLElement("span", $H({
		   			class_name: 'pagination_button',
					innerHTML: '' + i
				})));
		    }
		}
		
		// Next and last page
		var next_span = UIUtils.createHTMLElement("span", $H({
			class_name: 'pagination_button'
		}));
		parent.appendChild(next_span);
		var last_span = UIUtils.createHTMLElement("span", $H({
		   	class_name: 'pagination_button'
		}));
		parent.appendChild(last_span);
		
		if(end_page == UIUtils.getPage())
        {
			var last_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-last-disabled')
			}));
			last_span.appendChild(last_img);
			var next_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-next-disabled')
			}));
			next_span.appendChild(next_img);
        }
		else {
			var last_link = UIUtils.createHTMLElement("a", $H({
				title: gettext('Go to last page')
			}));
			last_link.observe("click", function(event){
				UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(),"last", items);
			});
			last_span.appendChild(last_link);
			var last_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-last')
			}));
			last_link.appendChild(last_img);
			var next_link = UIUtils.createHTMLElement("a", $H({
				title: gettext('Go to next page')
			}));
			next_link.observe("click", function(event){
				UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(), "next", items);
			});
			next_span.appendChild(next_link);
			var next_img = UIUtils.createHTMLElement("img", $H({
				src: _currentTheme.getIconURL('go-next')
			}));
			next_link.appendChild(next_img);
		}
	}

	var _orderby = function(parent, items) {
		parent.innerHTML = '';
		parent.appendChild(UIUtils.createHTMLElement("label", $H({
			for_: 'app_catalogue_combo_order_by',
			innerHTML: gettext(" Order by") + ':'
		})));
		var select = UIUtils.createHTMLElement("select", $H({
			id: 'app_catalogue_combo_order_by'
		}));
		select.observe("change", function(event){
			var target = BrowserUtilsFactory.getInstance().getTarget(event);
			UIUtils.setOrderby(target);
			UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, $('app_catalogue_combo_results_per_page').options[$('app_catalogue_combo_results_per_page').selectedIndex].value.toString(), 'first', items);
		});
		parent.appendChild(select);
		
		if (items==0) {
			select.setAttribute("disabled", "disabled");
		}
		else {
			var creation = UIUtils.createHTMLElement("option", $H({
				value: '-creation_date',
				innerHTML: gettext("Creation date")
			}));
			if (UIUtils.orderby == "-creation_date") creation.setAttribute("selected", "selected");
			select.appendChild(creation);
			var name = UIUtils.createHTMLElement("option", $H({
				value: 'short_name',
				innerHTML: gettext("Name")
			}));
			if (UIUtils.orderby == "short_name") name.setAttribute("selected", "selected");
			select.appendChild(name);
			var vendor = UIUtils.createHTMLElement("option", $H({
				value: 'vendor',
				innerHTML: gettext("Vendor")
			}));
			if (UIUtils.orderby == "vendor") vendor.setAttribute("selected", "selected");
			select.appendChild(vendor);
			var author = UIUtils.createHTMLElement("option", $H({
				value: 'author',
				innerHTML: gettext("Author")
			}));
			if (UIUtils.orderby == "author") author.setAttribute("selected", "selected");
			select.appendChild(author);
			var popularity = UIUtils.createHTMLElement("option", $H({
				value: '-popularity',
				innerHTML: gettext("Popularity")
			}));
			if (UIUtils.orderby == "-popularity") popularity.setAttribute("selected", "selected");
			select.appendChild(popularity);
		}
	}

	var _globalTagsToTagcloud = function(parent){
		parent.innerHTML = "";
		for (var i = 0; i < globalTags.length; i++) {
			var new_tag = UIUtils.createHTMLElement("span", $H({
				class_name: 'multiple_size_tag'
			}));
			new_tag.appendChild(globalTags[i].tagToTypedHTML({
				tags: 'multiple'
			}));
			if (UIUtils.globalTags == "mytags") {
				var deleteButton = UIUtils.createHTMLElement("button", $H({
					class_name: 'delete button'
				}));
				deleteButton.observe("click", function(event) {
					var target = BrowserUtilsFactory.getInstance().getTarget(event);
					UIUtils.removeGlobalTagUser(target.parentNode.firstChild.innerHTML);
				});
				new_tag.appendChild(deleteButton);
			}
			var separator = UIUtils.createHTMLElement("span", $H({
				innerHTML: ((i < (globalTags.length - 1)) ? "," : "")
			}));
			new_tag.appendChild(separator);
			parent.appendChild(new_tag);
		}
	}
	//Callbacks
	this.onLoadSuccess = function(transport){
		//update gadget info in the showcase
		var response = transport.responseText;
		var data = JSON.parse(response);
		ShowcaseFactory.getInstance().setGadgetsState(data["gadgets"]);
		OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.CATALOGUE);
	}
	this.onLoadError = function(transport){
		//the gadget version is not updated
		OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.CATALOGUE);
	}
	
	//check the version of the showcase gadgets
	var showcase_gadgets = ShowcaseFactory.getInstance().getGadgetsData();
	var params = {"gadgets":Object.toJSON(showcase_gadgets)};
	PersistenceEngineFactory.getInstance().send_post(URIs.POST_CHECK_VERSIONS, params, this, this.onLoadSuccess, this.onLoadError);
}



