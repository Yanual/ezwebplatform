/**
 * @author luismarcos.ayllon
 */

function Tag(value_) {
	var _value = value_;
	
	this.setValue = function(value_) { _value = value_; }
	this.getValue = function() { return _value; }
}

function Template(uri_) {
	var _uri = uri_;
	
	this.setValue = function(value_) { _value = value_; }
	this.getValue = function() { return _value; }
}

function XHtml(uri_) {
	var _uri = uri_;
	
	this.setValue = function(value_) { _value = value_; }
	this.getValue = function() { return _value; }
}

function Gadget(vendor, name, version, tags, template, xhtml) {
	var _vendor = vendor;
	var _name = name;
	var _version = version;
	var _tags = tags;
	var _template = template;
	var _xhtml = xhtml;
	
	this.setTags = function(tags) { _tags = tags; }
	this.getTags = function() { return _tags; }
	this.addTag = function(tag) { _tags.push(tag); }
	this.removeTag = function(tag) { _tags = _tags.without(tag); }
	this.setVendor = function(vendor) { _vendor = vendor; }
	this.getVendor = function() { return _vendor; }
	this.setName = function(name) { _name = name; }
	this.getName = function() { return _name; }
	this.setVersion = function(version) { _version = version; }
	this.getVersion = function() { return _version; }
	this.setTemplate = function(template) { _template = template; }
	this.getTemplate = function() { return _template; }
	this.setXHtml = function(xhtml) { _xhtml = xhtml; }
	this.getXHtml = function() { return _xhtml; }
	
	this.save = function() {
	}

var ShowcaseFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Showcase () {
		
		// ******************
		// STATIC VARIABLES
		// ******************
		Showcase.prototype.MODULE_HTML_ID = "showcase";
		Showcase.prototype.NUM_CELLS = 3;
		
		// *******************************
		// PRIVATE METHODS AND VARIABLES
		// *******************************
		var _gadgets = new Hash();
		var loaded = false;
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var opManager = OpManagerFactory.getInstance();
		
		persistenceEngine.send_get('gadgets.json', this, loadGadgets, onError);

		
		// Load a gadget from persitence system
		function addGadgetFromPersistence (gadget_){

			// Load gadget tag list from persitence system
			var tagList = [];
			for (var j = 0; j<gadget_.tags.length; j++) {
				tagList[j] = new Tag (gadget_.tags.value);
			}
			
			// Load template variables from persitence system
			var template = new Template (gadget_.template_uri);
			
			// Load gadget code from persitence system
			var code = new XHtml (gadget_.code_uri);				
			
			// Insert gadget object
			var id = gadget_.vendor + '_' + gadget_.name + '_' + gadget_.version;
			var gadget = new Gadget (gadget_.vendor, gadget_.name, gadget_.version,	tagList, template, code);
			_gadgets[gadgetId] = gadget;
			return gadget;
			 
		}
		
		// ****************
		// CALLBACK METHODS 
		// ****************

		// Load gadgets from persistence system
		loadGadgets = function (receivedData_) {
			var response = receivedData_.responseText;
			var gadgetTempList = eval ('(' + response + ')');
			gadgetTempList = gadgetTempList.gadgets;
			
			// Load all gadgets from persitence system
			for (var i = 0; i<gadgetTempList.length; i++) {
				addGadgetFromPersistence (gadgetTempList[i]);
			}
			
			// Showcase loaded
			loaded = true;
			opManager.continueLoading (Modules.prototype.SHOWCASE);
		}
		
		onError = function (receivedData_) {
			alert("error showcase GET");
		}
		
		// ****************
		// PUBLIC METHODS
		// ****************
		Showcase.prototype.addGadget = function (url_) {
			
		} 
		
		Showcase.prototype.saveGadgetHandler = function () {}
		
		
		Showcase.prototype.deleteGadget = function (gadgetId_) {
			_gadgets.remove(gadgetId_);
			var uri = URIConstants.prototype.GADGET.replace("<gadgetId", gadgetId_);
			persistenceEngine.send_delete(uri, tempTemplate, this, doNothing, onError);
			
		}
		
		Showcase.prototype.updateGadget = function (gadgetId_, url_) {
			
		}
		
		Showcase.prototype.tagGadget = function (gadgetId_, tags_) {
			
			
		}
		
		Showcase.prototype.addInstance = function (gadgetId_) {}
		
		Showcase.prototype.repaint = function () {
			_gadgets['1']='2';
			_gadgets['2']='2';
			
			var bufferTable = new StringBuffer();
			bufferTable.append("<table border='1'>\n");
			var keys = _gadgets.keys();
			for (var i = 0; i<keys.length; i++) {
				if (i==0){
					bufferTable.append("<tr>\n");
				} else if (i == keys.length-1){
					bufferTable.append("</tr>\n");
					
				} else if (i% Showcase.prototype.NUM_CELLS == 0){
					bufferTable.append("</tr><tr>\n");
				}
				bufferTable.append("<td>row "); 
				bufferTable.append(i);
				bufferTable.append(", cell ");
				bufferTable.append(i);
				bufferTable.append("</td>\n");
			}
			bufferTable.append("</table>\n");

			var mydiv = $(Showcase.prototype.MODULE_HTML_ID);
			mydiv.innerHTML = bufferTable.toString();
		
			
		}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new Showcase();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();