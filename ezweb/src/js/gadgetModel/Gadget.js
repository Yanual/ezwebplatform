
//////////////////////////////////////////////
//                  GADGET                  //
//////////////////////////////////////////////

function Gadget(gadget_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************
	var state = new GadgetState(gadget_);
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	Gadget.prototype.setTags = function(tags_) { state.setTags(tags_); }
	Gadget.prototype.getTags = function() { return state.getTags(); }
	Gadget.prototype.addTag = function(tag_) { state.addTag(tag_); }
	Gadget.prototype.removeTag = function(tag_) { state.removeTag(tag_) }
	
	Gadget.prototype.getVendor = function() { return state.getVendor(); }
	Gadget.prototype.getName = function() { return state.getName(); }
	Gadget.prototype.getVersion = function() { return state.getVersion(); }
	Gadget.prototype.getTemplate = function() { return state.getTemplate(); }
	Gadget.prototype.getXHtml = function() { return state.getXHtml(); }
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
	
	GadgetState.prototype.setTags = function(tags_) { tags = tags_; }
	GadgetState.prototype.getTags = function() { return tags; }
	GadgetState.prototype.addTag = function(tag_) { tags.push(tag_); }
	GadgetState.prototype.removeTag = function(tag_) { tags = tags.without(tag_); }
	
	GadgetState.prototype.getVendor = function() { return vendor; }
	GadgetState.prototype.getName = function() { return name; }
	GadgetState.prototype.getVersion = function() { return version; }
	GadgetState.prototype.getTemplate = function() { return template; }
	GadgetState.prototype.getXHtml = function() { return xhtml; }
}