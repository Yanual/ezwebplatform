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
		Showcase.prototype.MODULE_HTML_ID = 'showcase';
		Showcase.prototype.NUM_CELLS = 3;
		
		// ****************
		// CALLBACK METHODS 
		// ****************

		// Load gadgets from persistence system
		loadGadgets = function (receivedData_) {
			var response = receivedData_.responseText;
			var jsonGadgetList = eval ('(' + response + ')');
			jsonGadgetList = jsonGadgetList.gadgets;
		
			// Load all gadgets from persitence system
			for (var i = 0; i<jsonGadgetList.length; i++) {
				var jsonGadget = jsonGadgetList[i];
				var gadget = new Gadget (jsonGadget, null);
				
				// Insert gadget object in showcase object model
				var gadgetId = gadget.getVendor() + '_' + gadget.getName() + '_' + gadget.getVersion();
				_gadgets[gadgetId] = gadget;
			}
			
			// Showcase loaded
			_loaded = true;
			//_opManager.continueLoading (Modules.prototype.SHOWCASE);
			
		}
		
		// Error callback
		onErrorCallback = function (receivedData_) {
			alert ("Error in Showcase callback");
		}
		
		// *******************************
		// PRIVATE METHODS AND VARIABLES
		// *******************************
		var _gadgets = new Hash();
		var _loaded = false;
		var _opManager = OpManagerFactory.getInstance();
		var _persistenceEngine = PersistenceEngineFactory.getInstance();			
		
		// Initial load from persitence system
		_persistenceEngine.send_get('gadgets.json', this, loadGadgets, onErrorCallback);
		//_persistenceEngine.send_get('gadgets.json', this, function (data){alert (data.responseText)}, onErrorCallback);						

		// ****************
		// PUBLIC METHODS
		// ****************
		
		// Add a new gadget from Internet
		Showcase.prototype.addGadget = function (url_) {
			var gadget = new Gadget (null, url_);
				
			// Insert gadget object in showcase object model
			var gadgetId = gadget.getVendor() + '_' + gadget.getName() + '_' + gadget.getVersion();
			_gadgets[gadgetId] = gadget;
		} 
		
		// Remove a Showcase gadget
		Showcase.prototype.deleteGadget = function (gadgetId_) {
			var gadget = _gadgets.remove(gadgetId_);
			gadget.remove();
		}
		
		// Update a Showcase gadget
		Showcase.prototype.updateGadget = function (gadgetId_, url_) {
			Showcase.prototype.remove(gadgetId_);
			Showcase.prototype.addGadget(url_);
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
			var gadget = _gadget[gadgetId_];
			_opManager.addInstance (gadget);
		}
		
		// Show gadgets in Showcase
		Showcase.prototype.repaint = function () {
			var bufferTable = new StringBuffer();
			bufferTable.append('<table border="1">\n');
			var keys = _gadgets.keys();
			for (var i = 0; i<keys.length; i++) {
				var gadgetId = keys[i]; 
				var gadget = _gadgets[gadgetId]
				
				if (i==0){
					bufferTable.append('<tr>\n');
				} 
				
				bufferTable.append('<td><table><tr><td align="center"><img src="img/');
				bufferTable.append(gadget.getImage());
				bufferTable.append('" alt="Image cannot be shown"></td></tr>'); 
				bufferTable.append('<tr><td align="center"><input type="button" value="add"></td></tr></table>');
				bufferTable.append('</td>\n');
				
				if (i == (keys.length-1)) {
					bufferTable.append('</tr>\n');
					
				} else if ((i!=0) && ((i% Showcase.prototype.NUM_CELLS) == 0)) {
					bufferTable.append('</tr><tr>\n');
				}
			}
			bufferTable.append('</table>\n');

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