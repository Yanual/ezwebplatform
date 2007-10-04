var PersitenceEngineFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function PersitenceEngine () {
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		PersitenceEngine.prototype.send_get = function (url, context, successHandler, errorHandler) { 
			new Ajax.Request(url, {
				method: 'get',
				onSuccess: context[callbackHandler],
				onError: context[onError]
			});
		} 
		
		PersitenceEngine.prototype.send_post = function (url, value, context, successHandler, errorHandler) {}
		PersitenceEngine.prototype.send_delete = function (url, context, successHandler, errorHandler){}
		PersitenceEngine.prototype.send_update = function (url, value, context, successHandler, errorHandler){}
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