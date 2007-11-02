var OpManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function OpManager () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		// Already loaded modules
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		
		// Still to load modules
		var varManager = null;
		var wiring = null;
		var dragboard = null;
		var showcase = null;
		
		var loadCompleted = false;
		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.addInstance = function (gadget) {
		        if (!loadCompleted)
				return;
				
			var iGadgetId = dragboard.addInstance(gadget);
			
			varManager.addInstance(gadget.getTemplate(). iGadgetId);
			wiring.addInstance(template.getTemplate(), iGadgetId);
			
			dragboard.showInstance(iGadgetId);
		}
		 
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!loadCompleted)
				return;
			
			varManager.removeInstance(iGadgetId);
			wiring.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.loadEnviroment = function () {
			varManager = VarManagerFactory.getInstance();	
		}
		
		OpManager.prototype.continueLoading = function (module) {
			// Asynchronous load of modules
			// Each module notifies OpManager it has finished loading!
			
			if (module == Modules.prototype.VAR_MANAGER) {
				showcase = ShowcaseFactory.getInstance();
				return; 
			}
			
			if (module == Modules.prototype.SHOWCASE) {
				dragboard = DragboardFactory.getInstance();
				return;
			}
				
			if (module == Modules.prototype.DRAGBOARD) {
				wiring = WiringFactory.getInstance();
				return;
			}
			
			if (module == Modules.prototype.WIRING) {
				loadCompleted = true;
				return;
			}
		}
		
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new OpManager();
         	}
         	return instance;
       	}
	}
	
}();