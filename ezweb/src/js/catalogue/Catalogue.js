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
		
		}	

		this.getResources = function() {
			return resources;
		}
		
		this.getResource = function(id_) {
			return resources.getValue(id_);
		}
		
		this.addResource = function(resourceXML_, urlTemplate_) { 
			resources.addElement("resource_" + resources.size(), new Resource("resource_" + resources.size(), resourceXML_, urlTemplate_)); 
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
			
			onError = function(transport) {
				alert("Error Resources GET");
				// Process
			}
			
			loadResources = function(transport) {
				var response = Try.these(
									function() { 	return new DOMParser().parseFromString(transport.responseText, 'text/xml'); },
									function() { 	var xmldom = new ActiveXObject('Microsoft.XMLDOM'); 
													xmldom.loadXML(transport.responseText); 
													return xmldom; }
								);
				//alert( transport.responseXML);
				var resourcesXML = response.getElementsByTagName("resource");
				for (var i=(resourcesXML.length-1); i>=0; i--)
				{
					this.addResource(resourcesXML[i], null);
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
