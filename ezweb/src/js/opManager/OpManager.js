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
			
		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!loadCompleted)
				return;

			var gadget = showcase.getGadget(gadgetId);
				
			var iGadgetId = dragboard.addInstance(gadget);
			
			varManager.addInstance(iGadgetId, gadget.getTemplate());
			wiring.addInstance(iGadgetId, gadget.getTemplate());
			
			dragboard.showInstance(iGadgetId);
		}
		 
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!loadCompleted)
				return;
			
			varManager.removeInstance(iGadgetId);
			wiring.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    wiring.sendEvent(gadget, event, value);
		}

		OpManager.prototype.restaure = function () {
		    wiring.restaure();
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
	var wI = new wiringInterface();
	var w = WiringFactory.getInstance();	

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