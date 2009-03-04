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


var CatalogueFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Catalogue() {
		
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		
		this.catalogueElement = $('mashup_catalogue_content');
		this.catalogueParentElement = $('mashup_catalogue');
		this.infoElement = $('mashup_info_content');
		this.infoParentElement = $('mashup_info');
		this.resourceList = null;
		
		
		// ********************
		//  PRIVILEGED METHODS
		// ********************
		
		this.reloadCompleteCatalogue = function() {
			UIUtils.repaintCatalogue=true;
			UIUtils.sendPendingTags();
			if (UIUtils.isInfoResourcesOpen) {
				UIUtils.isInfoResourcesOpen = false;
				UIUtils.SlideInfoResourceOutOfView('info_resource');
			}
			UIUtils.search = false;
			this.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
		}
		
	 	this.emptyResourceList = function() {
			$("resources").innerHTML="";
			_this.clearSelectedResources();
			resources = $H();
		}

		this.getResources = function() {
			return resources;
		}
		
		this.getResource = function(id_) {
			return resources[id_];
		}

		this.addMashupResource = function(mashupId) {
			/***CALLBACK methods***/
			var cloneOk = function(transport){
				/*var response = transport.responseText;
				var wsInfo = eval ('(' + response + ')');
				//create the new workspace and go to it
				opManager = OpManagerFactory.getInstance();
				opManager.workSpaceInstances[wsInfo.workspace.id] = new WorkSpace(wsInfo.workspace);
		
				ShowcaseFactory.getInstance().reload(wsInfo.workspace.id);*/
				window.location.reload()
				
			}
			var cloneError = function(transport, e){
				//ERROR			
				
			}
			
			var cloneURL = URIs.GET_ADD_WORKSPACE.evaluate({'workspace_id': mashupId});
			PersistenceEngineFactory.getInstance().send_get(cloneURL, this, cloneOk, cloneError);
		}

		this.hide = function(){
			this.catalogueParentElement.setStyle({display: "none"});
			OpManagerFactory.getInstance().showWorkspaceMenu();
		}
		
		this.show = function(){
			this.catalogueParentElement.setStyle({display: "block"});
			this.infoParentElement.setStyle({display: "none"});
		}

		this.loadCatalogue = function() {

			// ******************
			//  CALLBACK METHODS 
			// ******************

			//Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.

			var onError = function(transport, e) {
				//ERROR
			}

			/* load the resources and paint the catalogue */
			var loadResources = function(transport) {
				var responseJSON = transport.responseText;
			    var jsonResourceList = eval ('(' + responseJSON + ')');
			    this.resourceList = jsonResourceList.resourceList;
				
				var html = '';
				for (var i = 0; i<this.resourceList.length; i++)
				{
					var resource = this.resourceList[i];
					var visibleName = resource.name;
					if (resource.name.length > 13)
						var visibleName = visibleName.substring(0, 11)+"...";
					html+= '<div class="igadget_item">';
					html+= '<a href="javascript:CatalogueFactory.getInstance().showResourceInfo('+resource.mashupId+');">';
					html+= '<img class="igadget_icon" src="'+resource.uriImage+'" />'
					html+= '</a>';
					html+= '<a href="javascript:CatalogueFactory.getInstance().showResourceInfo('+resource.mashupId+');">'+visibleName+'</a>';
					html+= '</div>';
				}
				this.catalogueElement.update(html);
				this.catalogueParentElement.setStyle({display: "block"});
				$('workspace_menu').setStyle({display: "none"});;
			}
			
			var param = {orderby: "-creation_date", search_criteria: "mashup, mobileok", search_boolean:"AND"};
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			var search_url = URIs.GET_RESOURCES_SIMPLE_SEARCH + "/tag/1/10";
			
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(search_url, this, loadResources, onError, param);
		}
		
		/* Display the mashup information panel */
		this.showResourceInfo = function(id) {
			var html = "";
			for (var i = 0; i<this.resourceList.length; i++){
				var resource = this.resourceList[i];
				if (id == resource.mashupId){
					html += "<h2>"+resource.name+"</h2>";
					html += "<img src='"+ resource.uriImage +"' id='resource_img'>";
					html += "<div id='resource_description'>"+resource.description+"</div>";
					//display the stars according to the popularity
					html += "<div id='resource_popularity'>";
					var i = 0;
					for (i;i<resource.votes[0].popularity;i++)
						html += "<img src='/ezweb/images/ico_vot_ok.gif'/>";
					if ((resource.votes[0].popularity%1)!=0){
						html += "<img src='/ezweb/images/ico_vot_md.gif'/>";
						i++;
					}
					for (i; i<5; i++){
						html += "<img src='/ezweb/images/ico_vot_no.gif'/>";
					}
					html += "<span class='x-small'> ("+resource.votes[0].votes_number+" votes)</span></div>";
					html += "<div id='resource_vendor'><span class='title_info_resource'>Vendor: </span>" + resource.vendor+"</div>";
					html += "<div id='resource_version'><span class='title_info_resource'>Version: </span>" + resource.version+"</div>";
					html += "<div id='resource_tags'><span class='title_info_resource'>Tags: </span>"
					for (var i=0; i<resource.tags.length; i++){
						html +="<span class='small'>"+resource.tags[i].value+"<span class='x-small'> ("+resource.tags[i].appearances+")</span> </span>";
					}
					html += "</div>";
					break;
				}
			}
			html += "<div id='add_resource'><a href='javascript:CatalogueFactory.getInstance().addMashupResource("+resource.mashupId+");'>Add Mashup</a></div>";
			this.infoElement.update(html);
			
			this.catalogueParentElement.setStyle({display: "none"});
			this.infoParentElement.setStyle({display: "block"});
			
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
