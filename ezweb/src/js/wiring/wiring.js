/**
 * @author rnogal
 */
var WiringFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Wiring () {
		var iGadgetList = new Hash();
		var inOutList = new Hash();

		
		// ****************
		// PUBLIC METHODS
		// ****************
		Wiring.prototype.addInstance = function (iGadgetId, template) {return iGadgetId + template} 
		Wiring.prototype.removeInstance = function (iGadgetId) {}
		Wiring.prototype.createChannel = function (channelName){}
		Wiring.prototype.removeChannel = function (channelName){}
		Wiring.prototype.viewValue = function (channelName){}
		Wiring.prototype.sendEvent = function (iGadgetId, event, value) {} // asynchronous
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