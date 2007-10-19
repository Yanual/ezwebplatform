
//////////////////////////////////////////////
//                RESOURCE                  //
//////////////////////////////////////////////

function Resource(resourceXML_, urlTemplate_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************

	var state = null;
	
	if (urlTemplate_ != null) {
		_createResource(urlTemplate_);
	}
	else {
		state = new ResourceState(resourceXML_);
	}
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.getVendor = function() { return state.getVendor(); }
	this.getName = function() { return state.getName(); }
	this.getVersion = function() { return state.getVersion(); }
	this.getDescription = function() { return state.getDescription(); }
	this.getUriImage = function() { return state.getUriImage(); }
	this.getUriTemplate = function() { return state.getUriTemplate(); }
	this.getUriWiki = function() { return state.getUriWiki(); }
	
	// *******************
	//  PRIVATE FUNCTIONS
	// *******************
	
	var _createResource = function(urlTemplate_) {
		
		// ******************
		//  CALLBACK METHODS 
		// ******************
	
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		
		onError = function(transport) {
			alert("Error Resource POST");
			// Process
		}
		
		loadResource = function(transport) {
			var response = transport.responseXML;
			state = new ResourceState(response);
		}
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		// Post Resource to PersistenceEngine. Asyncrhonous call!
		persistenceEngine.send_post(url_Server, url_, this, loadResource, onError);
	}
}

//////////////////////////////////////////////
//       RESOURCESTATE (State Object)       //
//////////////////////////////////////////////

function ResourceState(resourceXML_) {

	// *******************
	//  PRIVATE VARIABLES
	// *******************
	
	var vendor = null;
	var name = null;
	var version = null;
	var description = null;
	var uriImage = null;
	var uriWiki = null;
	var uriTemplate = null;
	
	// Parsing XML Resource
	// Constructing the structure
	  
	vendor = resourceXML_.getElementsByTagName("vendor")[0].firstChild.textContent;
	name = resourceXML_.getElementsByTagName("name")[0].firstChild.textContent;
	version = resourceXML_.getElementsByTagName("version")[0].firstChild.textContent;
	description = resourceXML_.getElementsByTagName("description")[0].firstChild.textContent;
	uriImage = resourceXML_.getElementsByTagName("uriImage")[0].firstChild.textContent;
	uriWiki = resourceXML_.getElementsByTagName("uriWiki")[0].firstChild.textContent;
	uriTemplate = resourceXML_.getElementsByTagName("uriTemplate")[0].firstChild.textContent;
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.getVendor = function() { return vendor; }
	this.getName = function() { return name; }
	this.getVersion = function() { return version; }
	this.getDescription = function() { return description; }
	this.getUriImage = function() { return uriImage; }
	this.getUriTemplate = function() { return uriTemplate; }
	this.getUriWiki = function() { return uriWiki; }
}