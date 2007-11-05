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
				var gadgetWrapper = new GadgetWrapper (gadgetId, gadget)
				
				// Insert gadget object in showcase object model
				_gadgets[gadgetId] = gadgetWrapper;
			}
			
			// Showcase loaded
			_loaded = true;
			_opManager.continueLoading (Modules.prototype.SHOWCASE);
			
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
		_persistenceEngine.send_get('http://europa.ls.fi.upm.es:8000/user/admin/gadgets', this, loadGadgets, onErrorCallback);
		//_persistenceEngine.send_get('gadgets.json', this, loadGadgets, onErrorCallback);
						

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
			//gadget.remove();
			this.repaint();
		}
		
		// Update a Showcase gadget
		Showcase.prototype.updateGadget = function (gadgetId_, url_) {
			this.remove(gadgetId_);
			this.addGadget(url_);
		}

		// Get a gadget by its gadgetID
		Showcase.prototype.getGadget = function (gadgetId_) {
			var gadget = _gadgets[gadgetId_];

			return gadget.gadget;
		}
		
		// Add a tag to a Showcase gadget
		Showcase.prototype.tagGadget = function (gadgetId_, tags_) {
			for (var i = 0; i<tags_.length; i++) {
				var tag = tags_[i];
				_gadgets[gadgetId_].gadget.addTag(tag);
			}
		}
		
		// Deploy a Showcase gadget into dragboard as gadget instance  
		Showcase.prototype.addInstance = function (gadgetId_) {
			var gadget = _gadgets[gadgetId_].gadget;
			_opManager.addInstance (gadget);
		}
		
		// Show all Showcase's gadgets in the Plataform Interface
		Showcase.prototype.repaint = function () {
			var gadgets = _gadgets.values();
			var num_rows = (gadgets.length + (gadgets.length % Showcase.prototype.NUM_CELLS)) / Showcase.prototype.NUM_CELLS;
			var width = (1 / Showcase.prototype.NUM_CELLS) * 100;
			//var num_cells = Showcase.prototype.NUM_CELLS + (gadgets.length - (gadgets.length % Showcase.prototype.NUM_CELLS));
			
			var gadgetsLayer = document.createElement("div");
			gadgetsLayer.setAttribute("id", 'gadgets');
			
			var table = document.createElement("table");
			table.style.border = '2';
			table.style.position = 'relative';
			table.style.width = '100%';
			table.style.height = '100%';
			
			var insertedGadgets = 0;
			for (var i = 0; i<num_rows; i++) {
				var row = table.insertRow(i);

				for (var j = 0; j<Showcase.prototype.NUM_CELLS; j++) {
					var cell = row.insertCell(j);
					cell.style.width = width;
					cell.vAlign = 'top';
				
					if (insertedGadgets < gadgets.length){
						cell.appendChild(gadgets[j].paint());
						insertedGadgets++;
					}else{
						cell.innerHTML = '&nbsp;';
					}
				}
			}
			gadgetsLayer.appendChild(table);
			
			// Insert Showcase HTML in its layer 
			var showcaseLayer = $(Showcase.prototype.MODULE_HTML_ID);
			showcaseLayer.appendChild (gadgetsLayer); 
		}
		
		// Set gadget properties (User Interface)
		Showcase.prototype.setGadgetProperties = function (gadgetId_, imageSrc_, tags_) {
			var gadget = _gadgets[gadgetId_];
			gadget.setImage(imageSrc_);
			gadget.setTags(tags_);
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

/**
 * ShowcaseViewer is a static class, used by the User Inteface.
 */

var ShowcaseViewer = function () {
	
	ShowcaseViewer.prototype.details = function (gadgetId_){
		var detailsDiv = $('details_' + gadgetId_);
		if (detailsDiv.style.display == 'block'){
			detailsDiv.style.display = 'none';
			return;
		}
		var myshowcase = ShowcaseFactory.getInstance();
		var gadgetProps = myshowcase.getGadgetProperties(gadgetId_);
		$('template_' + gadgetId_).value = gadgetProps[0];  
		$('xhtml_' + gadgetId_).value = gadgetProps[1];
		$('details_' + gadgetId_).style.display='block'
	}
	
	ShowcaseViewer.prototype.edit = function (gadgetId_){
		var editDiv = $('edit_' + gadgetId_);
		if (editDiv.style.display == 'block'){
			editDiv.style.display = 'none';
		}else{
		var myshowcase = ShowcaseFactory.getInstance();
		var gadgetProps = myshowcase.getGadgetProperties(gadgetId_);
			$('image_url_' + gadgetId_).value =  gadgetProps[2];
			$('tags_' + gadgetId_).value = gadgetProps[3];
			editDiv.style.display = 'block';
		}
		
	}
		
	ShowcaseViewer.prototype.saveGadgetDetails = function (gadgetId_){
		var imageSrc = $('image_url_' + gadgetId_).value;
		var tags = $('tags_' + gadgetId_).value;
		var myshowcase = ShowcaseFactory.getInstance();
		myshowcase.setGadgetProperties(gadgetId_, imageSrc, tags.split(' '));
		myshowcase.repaint();
	}

	ShowcaseViewer.deleteGadget = function (gadgetId_){
		var myshowcase = ShowcaseFactory.getInstance();
		myshowcase.deleteGadget(gadgetId_);
		myshowcase.repaint();
	}

	//ShowcaseViewer.show = function (){
	//	
	//	setTimeout("var myshowcase = ShowcaseFactory.getInstance();myshowcase.repaint();",2000);
	//}
}

/**
 * This class represents a improved Gadget with interface methods 
 */
function GadgetWrapper(gadgetId_, gadget_) {
	this.id = gadget_.getVendor() + '_' + gadget_.getName() + '_' + gadget_.getVersion();
	this.gadget = gadget_;
	
	// Generates Gadget Toolbar
	this._generateToolbarElement = function (){
		var toolbar = document.createElement("div");
		toolbar.setAttribute("class", "toolbar");

		// Creates Gadget Toolbar HTML
		var buffer = new StringBuffer();
		
		buffer.append('<h2>');
		buffer.append(this.gadget.getName());
		buffer.append('</h2>\n');
		buffer.append('<a href="javascript:;" onClick="ShowcaseViewer.deleteGadget(\'');
		buffer.append(this.id);
		buffer.append('\')">| delete</a>\n');
		buffer.append('<a href="javascript:;" onClick="ShowcaseViewer.edit(\'');
		buffer.append(this.id);
		buffer.append('\');">| edit </a>\n');
		buffer.append('<a href="javascript:;">details </a>\n');
		
		toolbar.innerHTML = buffer.toString();
		return toolbar
	}
	
	// Generates Gadget Preferences HTML
	this._generatePreferencesElement = function (){     
		var preferences = document.createElement("div");
		preferences.setAttribute("id", 'edit_' + this.id);
		preferences.setAttribute("class", "preferences");
		preferences.style.display = 'none';
		
		// Creates Gadget Preferences HTML
		var buffer = new StringBuffer();
		buffer.append('&nbsp;');
	
		buffer.append('<table>\n');
		buffer.append('<tr>\n');	
		buffer.append('<td><label for="image_url_');
		buffer.append(this.id);
		buffer.append('">Image URL</label></td>\n');
		buffer.append('<td><input type="text" id="image_url_');
		buffer.append(this.id);
		buffer.append('" name="image_url_');
		buffer.append(this.id);
		buffer.append('" maxlength="256"/></td>\n');
		buffer.append('</tr>\n');
			
		buffer.append('<tr>\n');
		buffer.append('<td><label for="image_url_');
		buffer.append(this.id);
		buffer.append('">Tags</label></td>\n');
		buffer.append('<td><input type="text" id="tags_');
		buffer.append(this.id);
		buffer.append('" name="tags_');
		buffer.append(this.id);
		buffer.append('" maxlength="256"/></td>\n');
		buffer.append('</tr>\n');
			
		buffer.append('<tr>\n');
		buffer.append('<td colspan="2"><a href="javascript:;" onClick="showcase_saveGadgetDetails(\'');
		buffer.append(this.id);
		buffer.append('\')"a>save</a> / <a href="javascript:;" onClick="$(\'edit_');
		buffer.append(this.id);
		buffer.append('\').style.display=\'none\'">cancel</a></td>\n');
		buffer.append('</table>\n');
		
		preferences.innerHTML = buffer.toString();
		return preferences
	}	

	// Generates Gadget Main HTML
	this._generateMainElement = function (){
		var mainElem = document.createElement("div");
		mainElem.setAttribute("id", 'edit_' + this.id);
		mainElem.setAttribute("class", "main");
		
		// Creates Gadget Preferences HTML
		var buffer = new StringBuffer();
		
		buffer.append('<h4>Description</h4>\n');
		buffer.append('<ul>\n');
        buffer.append('<li><strong>Vendor: </strong>');
		buffer.append(this.gadget.getVendor()); 
		buffer.append('</li>\n');
        buffer.append('<li><strong>Name: </strong>');
		buffer.append(this.gadget.getName()); 
		buffer.append('</li>\n');
		buffer.append('<li><strong>Version: </strong>');
		buffer.append(this.gadget.getVersion()); 
		buffer.append('</li>\n');
		buffer.append('<li><strong>Tags: </strong>');
		buffer.append(this.gadget.getTags()); 
		buffer.append('</li>\n');
        buffer.append('</ul>\n');
		buffer.append('<center><img src="');
		buffer.append(this.gadget.getImage()); 
		buffer.append('" alt="Imagen cannot be shown" /><br/>\n');
		buffer.append('<a href="javascript:opManager.addInstance(\'' + this.id + '\');">add</a></center>\n');
		
		mainElem.innerHTML = buffer.toString();
		return mainElem
	}

}

// Gets Gadget identifier
GadgetWrapper.prototype.getId = function() {
	return this.id;
}

// Gets internal Gadget
GadgetWrapper.prototype.getGadget = function() {
	return this.gadget;
}

// Generates Gadget View
GadgetWrapper.prototype.paint = function() {

	// Creates Gadget Layer
	var gadgetElement = document.createElement("div");
	gadgetElement.setAttribute("id", this.id);
	gadgetElement.setAttribute("class", "gadget");

	gadgetElement.appendChild(this._generateToolbarElement());
	gadgetElement.appendChild(this._generatePreferencesElement());
	gadgetElement.appendChild(this._generateMainElement());
	return gadgetElement;	
}
