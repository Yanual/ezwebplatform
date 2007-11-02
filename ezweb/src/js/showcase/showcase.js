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
				
				// Insert gadget object in showcase object model
				var gadgetId = gadget.getVendor() + '_' + gadget.getName() + '_' + gadget.getVersion();
				_gadgets[gadgetId] = gadget;
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
						

		// Show only one gadget
		function showGadget (gadgetId_){
			var gadget = _gadgets[gadgetId_]
			var buffer = new StringBuffer();

			// Open Gadget Layer
			buffer.append('<div id="');
			buffer.append(gadgetId_);
			buffer.append('" class="gadget">\n');
			
			// Links to gadget operations
			buffer.append('<div class="toolbar">\n');
			buffer.append('<h2>');
			buffer.append(gadget.getName());
			buffer.append('</h2>\n');

			buffer.append('<a href="javascript:;" onClick="showcase_deleteGadget(\'');
			buffer.append(gadgetId_);
			buffer.append('\')">| delete</a>\n');

			buffer.append('<a href="javascript:;" onClick="showcase_edit(\'');
			buffer.append(gadgetId_);
			buffer.append('\');">| edit </a>\n');

			buffer.append('<a href="javascript:;">details </a>\n');
			// Close links layer
			buffer.append('</div>');
			
			
			// Layer with edited preferences 
			buffer.append('<div id="edit_');
			buffer.append(gadgetId_);
			buffer.append('" class="preferences"  style="display: none">\n');
			
			buffer.append('&nbsp;');
			
			
          	buffer.append('<table>\n');
			buffer.append('<tr>\n');
			
			buffer.append('<td><label for="image_url_');
			buffer.append(gadgetId_);
			buffer.append('">Image URL</label></td>\n');
			buffer.append('<td><input type="text" id="image_url_');
			buffer.append(gadgetId_);
			buffer.append('" name="image_url_');
			buffer.append(gadgetId_);
			buffer.append('" maxlength="256"/></td>\n');
			buffer.append('</tr>\n');
			
			buffer.append('<tr>\n');
			buffer.append('<td><label for="image_url_');
			buffer.append(gadgetId_);
			buffer.append('">Tags</label></td>\n');
			buffer.append('<td><input type="text" id="tags_');
			buffer.append(gadgetId_);
			buffer.append('" name="tags_');
			buffer.append(gadgetId_);
			buffer.append('" maxlength="256"/></td>\n');
			buffer.append('</tr>\n');
			
			buffer.append('<tr>\n');
			buffer.append('<td colspan="2"><a href="javascript:;" onClick="showcase_saveGadgetDetails(\'');
			buffer.append(gadgetId_);
			buffer.append('\')"a>save</a> / <a href="javascript:;" onClick="$(\'edit_');
			buffer.append(gadgetId_);
			buffer.append('\').style.display=\'none\'">cancel</a></td>\n');
			buffer.append('</table>\n');
			// Close preferences layer
			buffer.append('</div>');
			
			buffer.append('<div class="main">\n');
			buffer.append('<h4>Description</h4>\n');
			buffer.append('<ul>\n');
            buffer.append('<li><strong>Vendor: </strong>');
			buffer.append(gadget.getVendor()); 
			buffer.append('</li>\n');
            buffer.append('<li><strong>Name: </strong>');
			buffer.append(gadget.getName()); 
			buffer.append('</li>\n');
			buffer.append('<li><strong>Version: </strong>');
			buffer.append(gadget.getVersion()); 
			buffer.append('</li>\n');
			buffer.append('<li><strong>Tags: </strong>');
			buffer.append(gadget.getTags()); 
			buffer.append('</li>\n');
          	buffer.append('</ul>\n');
			buffer.append('<center><img src="');
			buffer.append(gadget.getImage()); 
			buffer.append('" alt="Imagen cannot be shown" /><br/>\n');
			buffer.append('<a href="javascript:opManager.addInstance(gadget)">add</a></center>\n');
			buffer.append('</div>\n');
			
			// Close Gadget Layer
			buffer.append('</div>\n'); //			
			
//			buffer.append('<tr>\n');
//			buffer.append('<td style="float: right;">\n');
//			
////			buffer.append('<a href="javascript:;" onClick="showcase_details(\'');
////			buffer.append(gadgetId_);
////			buffer.append('\');">details</a> / <a href="javascript:;" onClick="showcase_edit(\'');
//
//			buffer.append('<a href="javascript:;">details</a> / <a href="javascript:;" onClick="showcase_edit(\'');
//			
//			buffer.append(gadgetId_);
//			buffer.append('\');">edit</a> / <a href="javascript:;" onClick="showcase_deleteGadget(\'');
//			buffer.append(gadgetId_);
//			buffer.append('\')">delete</a>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//
//			buffer.append('<div id="details_');
//			buffer.append(gadgetId_);
//			buffer.append('" style="display: none">\n');
//
//			buffer.append('<table>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<label>Template</label>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<input id="template_');
//			buffer.append(gadgetId_);
//			buffer.append('" type="text" readonly>\n');											
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<label>XHTML</label>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<input id="xhtml_');
//			buffer.append(gadgetId_);
//			buffer.append('" type="text" readonly>\n');			
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('</table>\n');
//
//			buffer.append('</div>\n');
//
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td style="float: center;">\n');
//
//			buffer.append('<div id="edit_');
//			buffer.append(gadgetId_);
//			buffer.append('" style="display: none">\n');
//
//			buffer.append('<table>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<label>Image URL</label>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<input id="image_url_');
//			buffer.append(gadgetId_);
//			buffer.append('" type="text" maxlength="255" style="width: 400px;"/>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<label>Tags</label>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<input id="tags_');
//			buffer.append(gadgetId_);
//			buffer.append('" type="text" maxlength="255" style="width: 400px;"/>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');	
//			buffer.append('<td>\n');
//			
//			buffer.append('<label> </label>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('<td>\n');
//			
//			buffer.append('<a href="javascript:;" onClick="showcase_saveGadgetDetails(\'');
//			buffer.append(gadgetId_);
//			buffer.append('\')"a>save</a> / <a href="javascript:;" onClick="$(\'edit_');
//			buffer.append(gadgetId_);
//			buffer.append('\').style.display=\'none\'">cancel</a>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			
//			buffer.append('</table>\n');
//
//			buffer.append('</div>\n');
//
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td align="left">\n');
//			
//			buffer.append('vendor: ');
//			buffer.append(gadget.getVendor()); 
//			buffer.append(' name: ');
// 			buffer.append(gadget.getName());
//			buffer.append(' version: '); 
//			buffer.append(gadget.getVersion());
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td align="center">\n');
//			
//			buffer.append('<img id="image_');
//			buffer.append(gadgetId_);
//			buffer.append('" src="');
//			buffer.append(gadget.getImage());
//			buffer.append('" width="120" height="60" alt="Image cannot be shown">\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td align="left">\n');
//			
//			buffer.append('tags: ');
//			
//			var tags = gadget.getTags();
//			for (var i = 0; i<tags.length; i++) {
//				var tag = tags[i];
//				buffer.append(tag);
//				if (i != (tags.length-1)){
//					buffer.append(', ');
//				}
//			}
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('<tr>\n');
//			buffer.append('<td align="center">\n');
//			
//			buffer.append('<a href="javascript:;">add</a>\n');
//			
//			buffer.append('</td>\n');
//			buffer.append('</tr>\n');
//			buffer.append('</table>\n');
//		
			return buffer.toString();
		}

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
			bufferTable.append('<div id="gadgets">\n');
			bufferTable.append('<table style="position: relative; width:100%; height:100%">\n');

			var keys = _gadgets.keys();
			var num_cells = Showcase.prototype.NUM_CELLS + (keys.length - (keys.length % Showcase.prototype.NUM_CELLS));      
			var width = (1 / num_cells) * 100; 
			for (var i = 0; i<num_cells; i++) {
				
				if (i==0){
					bufferTable.append('<tr>\n');
				} 

				bufferTable.append('<td style="width:');
				bufferTable.append(width);
				bufferTable.append('%" valign="top">');
				if (i < keys.length){
					bufferTable.append(showGadget(keys[i]));
				}else{
					bufferTable.append('&nbsp;');
				}
				bufferTable.append('</td>');
								
				if (i == (num_cells -1 )){
					bufferTable.append('</tr>\n');
				} else if ((Showcase.prototype.NUM_CELLS == 1) || ((i!=0) && ((i% Showcase.prototype.NUM_CELLS) == 0))) {
					bufferTable.append('</tr><tr>\n');
				}
			}
			bufferTable.append('</table>\n');
			bufferTable.append('</div>\n');

			var mydiv = $(Showcase.prototype.MODULE_HTML_ID);
			mydiv.innerHTML = bufferTable.toString();
			
		}
		
		// Set gadget properties (User Interface)
		Showcase.prototype.setGadgetProperties = function (gadgetId_, imageSrc_, tags_) {
			var gadget = _gadgets[gadgetId_];
			gadget.setImage(imageSrc_);
			gadget.setTags(tags_);
		}
		
		// Get gadget properties (User Interface)
		Showcase.prototype.getGadgetProperties = function (gadgetId_) {
			var gadget = _gadgets[gadgetId_];
			var gadgetDetails = []; 
			gadgetDetails[0] = gadget.getTemplate();
			gadgetDetails[1] = gadget.getXHtml();
			gadgetDetails[2] = gadget.getImage();
			gadgetDetails[3] = new StringBuffer();
			
			var tags = gadget.getTags();
			for (var i = 0; i<tags.length; i++) {
				var tag = tags[i];
				gadgetDetails[3].append(tag);
				if (i != (tags.length-1)){
					gadgetDetails[3].append(' ');
				}
			}
			gadgetDetails[3] = gadgetDetails[3].toString();

			return gadgetDetails;
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


// *********************************
// USER INTERFACE METHODS
// *********************************
function showcase_details(gadgetId_){
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
	
function showcase_edit (gadgetId_){
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
	
function showcase_saveGadgetDetails(gadgetId_){
	var imageSrc = $('image_url_' + gadgetId_).value;
	var tags = $('tags_' + gadgetId_).value;
	var myshowcase = ShowcaseFactory.getInstance();
	myshowcase.setGadgetProperties(gadgetId_, imageSrc, tags.split(' '));
	myshowcase.repaint();
}

function showcase_deleteGadget (gadgetId_){
	var myshowcase = ShowcaseFactory.getInstance();
	myshowcase.deleteGadget(gadgetId_);
	myshowcase.repaint();
}

function show(){
	
	setTimeout("var myshowcase = ShowcaseFactory.getInstance();myshowcase.repaint();",2000);
}
