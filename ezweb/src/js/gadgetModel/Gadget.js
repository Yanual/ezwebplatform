
//////////////////////////////////////////////
//                  GADGET                  //
//////////////////////////////////////////////

function Gadget(gadget_, url_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************

	var state = null;
	
	if (url_ != null) {
		_solitarGadget(url_);
	}
	else {
		state = new GadgetState(gadget_);
	}
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.setTags = function(tags_) { state.setTags(tags_); }
	this.getTags = function() { return state.getTags(); }
	this.addTag = function(tag_) { state.addTag(tag_); }
	this.removeTag = function(tag_) { state.removeTag(tag_) }
	
	this.getVendor = function() { return state.getVendor(); }
	this.getName = function() { return state.getName(); }
	this.getVersion = function() { return state.getVersion(); }
	this.getTemplate = function() { return state.getTemplate(); }
	this.getXHtml = function() { return state.getXHtml(); }
	
	// *******************
	//  PRIVATE FUNCTIONS
	// *******************
	
	var _solicitarGadget = function(url_) {
		
		// ******************
		//  CALLBACK METHODS 
		// ******************
	
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
	
		loadURI = function(transport) {
			// Getting Gadget from PersistenceEngine. Asyncrhonous call!
			persistenceEngine.send_get(transport.responseText, this, loadGadget, onError);
		}
		
		onError = function(transport) {
			alert("Error Gadget GET");
			// Process
		}
		
		loadGadget = function(transport) {
			var response = transport.responseText;
			var objRes = eval ('(' + response + ')');
			state = new GadgetState(objRes);
		}
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		// Post Gadget to PersistenceEngine. Asyncrhonous call!
		persistenceEngine.send_post(url_Server, url_, this, loadURI, onError);
	}
}

//////////////////////////////////////////////
//       GADGETSTATE (State Object)         //
//////////////////////////////////////////////

function GadgetState(gadget_) {

	// *******************
	//  PRIVATE VARIABLES
	// *******************
	
	var vendor = null;
	var name = null;
	var version = null;
	var tags = [];
	var template = null;
	var xhtml = null;
	
	// JSON-coded Gadget mapping
	// Constructing the structure
	  
	vendor = gadget_.vendor;
	name = gadget_.name;
	version = gadget_.version;
	template = new Template(gadget_.template);
	xhtml = new XHtml(gadget_.xhtml);
	
	for (i = 0; i<gadget_.tags.length; i++) {
		tags.push(gadget_.tags[i]);
	}
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.setTags = function(tags_) { tags = tags_; }
	this.getTags = function() { return tags; }
	this.addTag = function(tag_) { tags.push(tag_); }
	this.removeTag = function(tag_) { tags = tags.without(tag_); }
	
	this.getVendor = function() { return vendor; }
	this.getName = function() { return name; }
	this.getVersion = function() { return version; }
	this.getTemplate = function() { return template; }
	this.getXHtml = function() { return xhtml; }
}