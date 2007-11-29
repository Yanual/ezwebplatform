
//////////////////////////////////////////////
//                  GADGET                  //
//////////////////////////////////////////////

function Gadget(gadget_, url_) {
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	var _this = this;
	
	this.setTags = function(tags_) { state.setTags(tags_); }
	this.getTags = function() { return state.getTags(); }
	this.addTag = function(tag_) { state.addTag(tag_); }
	this.removeTag = function(tag_) { state.removeTag(tag_) }
	
	this.getVendor = function() { return state.getVendor(); }
	this.getName = function() { return state.getName(); }
	this.getVersion = function() { return state.getVersion(); }
	this.getTemplate = function() { return state.getTemplate(); }
	this.getXHtml = function() { return state.getXHtml(); }
	
	this.getImage = function() { return state.getImage(); }
	this.setImage = function(image_) { state.setImage(image_); }
	
	
	// *******************
	//  PRIVATE FUNCTIONS
	// *******************
	
	var _solicitarGadget = function(url_) {
		
		// ******************
		//  CALLBACK METHODS 
		// ******************
	
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		
		var onError = function(transport) {
			alert ("Unexpected error in HTTP method invocation")
		}
		
		var loadGadget = function(transport) {
			var response = transport.responseText;
			var objRes = eval ('(' + response + ')');
			state = new GadgetState(objRes);
			ShowcaseFactory.getInstance().gadgetToShowcaseGadgetModel(_this);
		}
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		// Post Gadget to PersistenceEngine. Asyncrhonous call!
		var param = 'url=' + url_
		persistenceEngine.send_post(URIs.GET_GADGETS, param, this, loadGadget, onError);
	}
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************

	var state = null;
	
	if (url_ != null) {
		_solicitarGadget(url_);
	}
	else {
		state = new GadgetState(gadget_);
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
	var image = null;
	
	// JSON-coded Gadget mapping
	// Constructing the structure
	vendor = gadget_.vendor;
	name = gadget_.name;
	version = gadget_.version;
	template = new Template(gadget_.template);
	xhtml = new XHtml(gadget_.xhtml);
	image = gadget_.image;
	
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
	
	this.getImage = function() { return image; }
	this.setImage = function(image_) { image = image_; }
}
