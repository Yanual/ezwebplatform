var CatalogueFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Catalogue() {
		
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var resources = new Array();
		var resourcesLength = 0;
		
		// ********************
		//  PRIVILEGED METHODS
		// ********************
		
		this.setResources = function(resources_) { resources = resources_; }
		this.getResources = function() { return resources; }
		this.addResource = function(resourceXML_, urlTemplate_) { 
			resources["resource_" + resourcesLength] = new Resource("resource_" + resourcesLength, resourceXML_, urlTemplate_); 
			resourcesLength++;
		}
		this.addResourceToShowCase = function(resourceId_) {
			alert(resourceId_);
		}
		
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
				var response = Try.these(
									function() { 	return new DOMParser().parseFromString(transport.responseText, 'text/xml'); },
									function() { 	var xmldom = new ActiveXObject('Microsoft.XMLDOM'); 
													xmldom.loadXML(transport.responseText); 
													return xmldom; }
								);
				//var response = transport.responseXML;
				var resourcesXML = response.getElementsByTagName("resource");
				for (i=(resourcesXML.length-1); i>=0; i--)
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