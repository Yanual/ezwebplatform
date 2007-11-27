/**
 * @author luismarcos.ayllon
 */

// This module provides a set of gadgets which can be deployed into dragboard as gadget instances 
var ShowcaseFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	// *********************************
	// CONSTRUCTOR
	// *********************************
	function Showcase () {
		
		// ******************
		// STATIC VARIABLES
		// ******************
	    Showcase.prototype.MODULE_HTML_ID = "showcase";
		Showcase.prototype.NUM_CELLS = 4;

		// ****************
		// CALLBACK METHODS 
		// ****************

		// Load gadgets from persistence system
		loadGadgets = function (receivedData_) {
			var response = receivedData_.responseText;
			var jsonGadgetList = eval ('(' + response + ')');
		
			// Load all gadgets from persitence system
			for (var i = 0; i<jsonGadgetList.length; i++) {
				var jsonGadget = jsonGadgetList[i];
				var gadget = new Gadget (jsonGadget, null);
				var gadgetId = gadget.getVendor() + '_' + gadget.getName() + '_' + gadget.getVersion();
				
				// Insert gadget object in showcase object model
				_gadgets[gadgetId] = gadget;
			}
			
			// Showcase loaded
			_loaded = true;
			_opManager.continueLoading (Modules.prototype.SHOWCASE);
			
		}
		
		// Error callback (empty gadget list)
		onErrorCallback = function (receivedData_) {
			_loaded = true;
			_opManager.continueLoading (Modules.prototype.SHOWCASE);
		}
		
		// *******************************
		// PRIVATE METHODS AND VARIABLES
		// *******************************
		var _gadgets = new Hash();
		var _loaded = false;
		var _opManager = OpManagerFactory.getInstance();
		var _persistenceEngine = PersistenceEngineFactory.getInstance();			
		
		// Initial load from persitence system
		_persistenceEngine.send_get(URIConstants.prototype.GET_GADGETS, this, loadGadgets, onErrorCallback);
						

		// ****************
		// PUBLIC METHODS
		// ****************
		
		// Add a new gadget from Internet
		Showcase.prototype.addGadget = function (url_) {
			var gadget = new Gadget (null, url_);
			//TODO esto es raruno, la variable gadget va en la hash, no gusta el _this = this de gadget
		}
		
		// Insert gadget object in showcase object model
		Showcase.prototype.gadgetToShowcaseGadgetModel = function(gadget_) {
			var gadgetId = gadget_.getVendor() + '_' + gadget_.getName() + '_' + gadget_.getVersion();
			_gadgets[gadgetId] = gadget_;
			_opManager.addInstance(gadgetId);
		}
		
		// Remove a Showcase gadget
		Showcase.prototype.deleteGadget = function (gadgetId_) {
			var gadget = _gadgets.remove(gadgetId_);
			//gadget.remove();
		}
		
		// Update a Showcase gadget
		Showcase.prototype.updateGadget = function (gadgetId_, url_) {
			this.remove(gadgetId_);
			this.addGadget(url_);
		}

		// Get a gadget by its gadgetID
		Showcase.prototype.getGadget = function (gadgetId_) {
			return _gadgets[gadgetId_];
		}
		
		// Set gadget properties (User Interface)
		Showcase.prototype.setGadgetProperties = function (gadgetId_, imageSrc_, tags_) {
			var gadget = _gadgets[gadgetId_];
			gadget.setImage(imageSrc_);
			gadget.setTags(tags_);
		}

		// Add a tag to a Showcase gadget
		Showcase.prototype.tagGadget = function (gadgetId_, tags_) {
			for (var i = 0; i<tags_.length; i++) {
				var tag = tags_[i];
				_gadgets[gadgetId_].addTag(tag);
			}
		}
		
		// Deploy a Showcase gadget into dragboard as gadget instance  
		Showcase.prototype.addInstance = function (gadgetId_) {
			var gadget = _gadgets[gadgetId_];
			_opManager.addInstance (gadget);
		}
		
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new Showcase();
          	}
         	return instance;
       	}
	}
	
}();