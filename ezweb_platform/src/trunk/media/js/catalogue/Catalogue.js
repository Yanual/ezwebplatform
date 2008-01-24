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
		
		this.addResource = function(resourceJSON_, urlTemplate_, pages) { 
			resources.addElement("resource_" + resources.size(), new Resource("resource_" + resources.size(), resourceJSON_, urlTemplate_, pages)); 
		}
		
		this.addResourceToShowCase = function(resourceId_) {
			UIUtils.showResourceInfo(resourceId_);
			ShowcaseFactory.getInstance().addGadget(resources.getValue(resourceId_).getUriTemplate());
		}
		
		this.loadCatalogue = function(urlCatalogue_) {
		
			// ******************
			//  CALLBACK METHODS 
			// ******************
		
			//Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
			
			var onError = function(transport) {
				alert(gettext("Error loadCatalogue"));
				// Process
			}
			
			var loadResources = function(transport) {
				var response = Try.these(
									function() { 	return new DOMParser().parseFromString(transport.responseText, 'text/xml'); },
									function() { 	var xmldom = new ActiveXObject('Microsoft.XMLDOM'); 
													xmldom.loadXML(transport.responseText); 
													return xmldom; }
								);
								
				var responseJSON = transport.responseText;
				var pages = transport.getResponseHeader('pages');
			  var jsonResourceList = eval ('(' + responseJSON + ')');
			  jsonResourceList = jsonResourceList.resourceList
			  		  
				//var resourcesXML = response.getElementsByTagName("resource");
				
				for (var i = 0; i<jsonResourceList.length; i++)
				{
					this.addResource(jsonResourceList[i], null, pages);
				}
			}
			
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(urlCatalogue_, this, loadResources, onError);
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
