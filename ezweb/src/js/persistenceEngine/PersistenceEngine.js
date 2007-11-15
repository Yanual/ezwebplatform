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
				onException: errorHandler.bind(context)
			});
		} 
		
		PersitenceEngine.prototype.send_post = function (url, params, context, successHandler, errorHandler) {
			new Ajax.Request(url, {
				method: 'post',
				parameters: params,
				onSuccess: successHandler.bind(context),
				onException: errorHandler.bind(context)
			});
		}
		
		PersitenceEngine.prototype.send_delete = function (url, context, successHandler, errorHandler){
			new Ajax.Request(url, {
				method: 'delete',
				onSuccess: successHandler.bind(context),
				onException: errorHandler.bind(context)
			});
		}
		
		PersitenceEngine.prototype.send_update = function (url, params, context, successHandler, errorHandler){
			new Ajax.Request(url, {
				method: 'put',
				parameters: params,
				onSuccess: successHandler.bind(context),
				onException: errorHandler.bind(context)
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