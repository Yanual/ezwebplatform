/**
 * @author luismarcos.ayllon
 */

var WiringFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Wiring () {
		
		// ****************
		// PUBLIC METHODS
		// ****************
		Wiring.prototype.addInstance = function (iGadgetId, template) {return iGadgetId + template} 
		Wiring.prototype.removeInstance = function (iGadgetId) {}
		Wiring.prototype.createChannel = function (channelName){}
		Wiring.prototype.removeChannel = function (channelName){}
		Wiring.prototype.viewValue = function (channelName){}
		Wiring.prototype.sendEvent = function (iGadgetId, eventName, value) {} // asynchronous
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
        		instance = new Wiring();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();

var VarManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function VarManager () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
	
		// ****************
		// PUBLIC METHODS 
		// ****************
		VarManager.prototype.writeSlot = function (iGadgetId, slotName, value) {} 
		VarManager.prototype.registerVariable = function (iGadgetId, variableName) {}
		VarManager.prototype.getVariable = function (variable){}
		VarManager.prototype.setVariable = function (variable, value){}
	}
	
		
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new VarManager();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();


var PersitenceEngineFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function PersitenceEngine () {
		
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
        		instance = new PersitenceEngine();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();

var OpManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function OpManager () {
		
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
        		instance = new OpManager();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();

var ShowcaseFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Showcase () {
		
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
        		instance = new Showcase();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();


var DragboardFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Dragboard () {
		
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
        		instance = new Dragboard();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();