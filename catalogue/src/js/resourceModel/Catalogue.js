var CatalogueFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Catalogue() {
		
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var resources = [];

		
		// ********************
		//  PRIVILEGED METHODS
		// ********************
		
		this.loadCatalogue = function(urlCatalogue_) {
		
			// ******************
			//  CALLBACK METHODS 
			// ******************
		
			// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
			
			onError = function(transport) {
				alert("Error Resources GET");
				// Process
			}
			
			loadResources = function(transport) {
				var response = transport.responseXML;
				var resourcesXML = response.getElementsByTagName("resource");
				for (i=(resourcesXML.length-1); i>=0; i--)
				{
					resources[i] = new Resource(resourcesXML[i]);
					this.paintResource(resources[i],i);
				}
			}
			
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			
			// Get Resources from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(urlCatalogue_, this, loadResources, onError);
		}
		
		this.paintResource = function(resource_,index_)
		{
			alert("Vendor: " +resource_.getVendor() + "\nName: " +resource_.getName() + "\nVersion: " +resource_.getVersion());
			var newResource = document.createElement("div");
			newResource.setAttribute("class", "resource");
			newResource.setAttribute("id", "resource_"+index_);
			newResource.innerHTML = "Gadget\nVendor: " + resource_.getVendor();
			var resourcesHTML = document.getElementById("resources");
			resourcesHTML.insertBefore(newResource, resourcesHTML.firstChild);
		}
		
		this.setResources = function(resources_) { resources = resources_; }
		this.getResources = function() { return resources; }
		this.addResource = function(resource_) { resources.push(resource_); }
		this.removeResource = function(tag_) { resources = resources.without(resource_); }			
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