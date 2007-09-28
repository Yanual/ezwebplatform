// EZWEB CONSTANTS
var gadgetRepository = "/gadget/tiempo/";
var allGadgets = "";

// TEMPLATE CONSTANTS


//***********************************
// PERSISTENT CLASSES 
//***********************************

var PersistenceUtils = Class.create():

PersistenceUtils.prototype = {
  initialize:function(uri) {
    this.uri=uri;
  },
  loadServerData: function(uri) {  },
};

var XHtml = Class.create();

XHtml.prototype = {
  initialize:function(uri) {
    this.uri=uri;
	this.xhtml=PersistanceUtils.prototype.loadServerData(this.uri);
  },
};

var XHtml = Class.create();

Template.prototype = {
  initialize:function(uri) {
    this.uri=uri;
	this.template=PersistanceUtils.prototype.loadServerData(this.uri);
  },
};

//***********************************
// DINAMIC CLASSES
//***********************************

var Gadget = Class.create();
   
Gadget.prototype = {
  initialize:function(uri, id, templates, xhtmls) {
    this.uri=uri;
	this.id=id;
	this._processTemplates(templates);
	this._processXHtmls(xhtmls);
  },
  // PRIVATE
  _processTemplates() {},
  _processXHtmls() {
   this.code=_getCode();
  },
  _getCode() {},
  // PUBLIC
  getCodeReference() { return this.code; },
};

var GadgetCollection = Class.create();
   
GadgetCollection.prototype = {
  initialize:function() {
    this.gadgets=new Array();
  },
  // PUBLIC
  add(gadget) { this.gadgets.insert(gadget); },
};
   
// Run
var gadget = new Gadget();
var gadgets = new GadgetCollection();

gadgets.add(gadget);
