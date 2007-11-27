/**
 * @author luismarcos.ayllon
 */
var ShowcaseFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Showcase () {
		
		// *******************************
		// PRIVATE VARIABLES AND METHODS
		// *******************************
		var _gadgets = new Hash();
		var tempTemplateString = '';
		var tempTemplate = null;
		var loaded = false;
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var opManager = OpManagerFactory.getInstance();
		
		persistenceEngine.send_get('gadgets.json', this, loadGadgets, onError);
		
		
		function addGadgetFromPersistence (gadget_){
			
			// Load gadget tag list from persitence system
			var tagList = [];
			for (var j = 0; j<gadget_.tags.length; j++) {
				tagList[j] = new Tag (gadget_.tags.value);
			}
				
			// Load template variables from persitence system
			makeTamplateFromPersistence (gadget_.template);
			// Load gadget code from persitence system
			var code = new XHtml (gadget_.code);				
			
			// Insert gadget object
			var id = gadget_.vendor + '_' + gadget_.name + '_' + gadget_.version;
			_gadgets[gadgetId] = new Gadget (gadget_.vendor, gadget_.name, gadget_.version,	tagList, tempTemplate, code);
			
			 
		}
		
		function makeTemplateFromPersistence(template_){ 
			var templateVars = template_.variables;
			temTemplate = new Template();
			for (j = 0; j<templateVars.length; j++) {
				templateVar = templateVars[j];
				switch (templateVar.aspect) {
					case Variable.prototype.PROPERTY:
						temTemplate.addStateVar(templateVar,name);
						break;
					case Variable.prototype.EVENT:
						temTemplate.addEvent(templateVar,name);
						break;
					case Variable.prototype.SLOT:
						temTemplate.addSlot(templateVar,name);
						break;
					case Variable.prototype.USER_PREF:
						temTemplate.addUserPref(templateVar,name);
						break;
				}
			}
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
			
			loaded = true;
			opManager.continueLoading (Modules.prototype.SHOWCASE);
		}
		
		saveTemplate = function (receivedData_) {
			response = receivedData_.responseText;
			makeTemplateFromPersistence (response);
		}
		
		saveGadget = function (receivedData_) {
			response = receivedData_.responseText;
			makeTemplateFromPersistence (response);
		}
		
		loadGadgetTemplate = function (receivedData_) {
			// Gets code from Internet. Code link is inside the template.
			tempTemplateString = receivedData_.responseText;
			var urlCode = $('code_link');
			
			// Gets code gadget from Internet.
			persistenceEngine.send_get(urlCode, this, loadGadgetCode, onError);
			persistenceEngine.send_post(URIConstants.prototype.GADGET_TEMPLATE, tempTemplate.toJSONString(), this, saveTemplate, onError);
		}
		
		
		loadGadgetCode = function (receivedData_) {
			// Gets code from Internet
			var code = receivedData_.responseText;
			var uri = URIConstants.prototype.GADGET_CODE.replace("<gadgetId", gadgetId_);
			persistenceEngine.send_delete(uri, tempTemplate, this, doNothing, onError);
			
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
		
		Showcase.prototype.repaint = function () {}
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

var myshowcase = ShowcaseFactory.getInstance();
var id = myshowcase.addGadget("google.htm");
alert (id);
myshowcase.deleteGadget(id);
