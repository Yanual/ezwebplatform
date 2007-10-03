/**
 * @author luismarcos.ayllon
 */

var Wiring = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function WiringPrivateConstructor () {
		
		// ****************
		// PUBLIC METHODS
		// ****************
		Wiring.prototype.addInstance = function (iGadgetId, template) {} 
		Wiring.prototype.removeInstance = function (iGadgetId) {}
		Wiring.prototype.createChannel = function (channelName){}
		Wiring.prototype.removeChannel = function (channelName){}
		Wiring.prototype.viewValue = function (channelName){}
		Wiring.prototype.sendEvent = function (iGadgetId, value) {} // asynchronous
		Wiring.prototype.addChannelInput = function (idGadgetId, inputName, channelName) {}
		Wiring.prototype.addChannelInput = function (inputName, channelName) {}
		Wiring.prototype.addChannelOutput = function (idGadgetId, outputName, channelName) {}
		Wiring.prototype.addChannelOutput = function (outputName, channelName) {}
		Wiring.prototype.removeChannelInput = function (idGadgetId, inputName, channelName) {}
		Wiring.prototype.removeChannelInput = function (inputName, channelName) {}
		Wiring.prototype.removeChannelOutput = function (idGadgetId, outputName, channelName) {}
		Wiring.prototype.removeChannelOutput = function (outputName, channelName) {}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new WiringPrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})

var VarManager = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function VarManagerPrivateConstructor () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
	
		// ****************
		// PUBLIC METHODS 
		// ****************

		VarManager.prototype.writeSlot = function (iGadgetId, slot, value) {} 
		VarManager.prototype.registerVariable = function (iGadgetId, variable) {}
		VarManager.prototype.getVariable = function (variable){}
		VarManager.prototype.setVariable = function (variable, value){}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new VarManagerPrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})


var PersitenceEngine = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function PersitenceEnginePrivateConstructor () {
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		PersitenceEngine.prototype.send_get = function (url) {} 
		PersitenceEngine.prototype.send_post = function (url, value) {}
		PersitenceEngine.prototype.send_delete = function (url){}
		PersitenceEngine.prototype.send_update = function (url, value){}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new PersitenceEnginePrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})

var OpManager = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function OpManagerPrivateConstructor () {
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		OpManager.prototype.addInstance = function (gadgetId) {} 
		OpManager.prototype.removeInstance = function (gadgetId) {}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new OpManagerPrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})

var Showcase = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function ShowcasePrivateConstructor () {
		
		// ****************
		// PUBLIC METHODS
		// ****************
		Showcase.prototype.addGadget = function (url) {} 
		Showcase.prototype.deleteGadget = function (gadgetId) {}
		Showcase.prototype.updateGadget = function (gadgetId, url) {}
		Showcase.prototype.tagGadget = function (gadgetId, tags) {}
		Showcase.prototype.addInstance = function (gadgetId) {}
		Showcase.prototype.repaint = function () {}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new ShowcasePrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})


var Dragboard  = (function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function DragboardPrivateConstructor () {
		
		// ****************
		// PUBLIC METHODS
		// ****************
		Dragboard.prototype.addInstance = function (iGadgetId) {}
		Dragboard.prototype.getUserProperty = function (varable) {}
		Dragboard.prototype.setUserProperty = function (varable, value) {}
		Dragboard.prototype.moveInstance = function (iGadgetId, position) {}
		Dragboard.prototype.repaint = function () {}
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new DragboardPrivateConstructor();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
})
