var OpManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function OpManager () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var wiring = WiringFactory.getInstance();
		var dragboard = DragboardFactory.getInstance();
		var showcase = ShowcaseFactory.getInstance();
		var varManager = VarManagerFactory.getInstance();
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		OpManager.prototype.addInstance = function (template) {
			varManager.addInstance(template);
			wiring.addInstance();
			dragboard.addInstance();
		}
		 
		OpManager.prototype.removeInstance = function (gadgetId) {
			
		}
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