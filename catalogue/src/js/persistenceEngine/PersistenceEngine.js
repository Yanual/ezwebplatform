var PersistenceEngineFactory = function () {

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
				onSuccess: successHandler.bind(context),
				onError: errorHandler.bind(context)
			});
		} 
		
		PersitenceEngine.prototype.send_post = function (url, value, context, successHandler, errorHandler) {
			new Ajax.Request(url, {
				method: 'post',
				parameters: 'param=' + value,
				onSuccess: successHandler.bind(context),
				onError: errorHandler.bind(context)
			});
		}
		
		PersitenceEngine.prototype.send_delete = function (url, context, successHandler, errorHandler){
			new Ajax.Request(url, {
				method: 'delete',
				onSuccess: successHandler.bind(context),
				onError: errorHandler.bind(context)
			});
		}
		
		PersitenceEngine.prototype.send_update = function (url, value, context, successHandler, errorHandler){
			new Ajax.Request(url, {
				method: 'put',
				parameters: 'param=' + value,
				onSuccess: successHandler.bind(context),
				onError: errorHandler.bind(context)
			});
		}
		
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new PersitenceEngine();
         	}
         	return instance;
       	}
	}
	
}();