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
		this.persistenceEngine = PersistenceEngineFactory.getInstance();
		
		// Still to load modules
		this.varManagerModule = null;
		this.wiringModule = null;
		this.dragboardModule = null;
		this.showcaseModule = null;
		this.catalogue = null;
		
		this.loadCompleted = false;
		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!this.loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			var iGadgetId = this.dragboardModule.addInstance(gadget);
			
			this.varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			this.wiringModule.addInstance(iGadgetId, gadget.getTemplate());
			
			this.dragboardModule.showInstance(iGadgetId);

			// The dragboard must be shown after an igadget insertion
			show_dragboard()
		}

		/**
		 * TODO search a better name for this method
		 * This method is used by the dragboard at init and will be removed when
		 * the load is completed.
		 */
		OpManager.prototype.notifyInstance = function (iGadgetId) {
			var gadget = this.dragboardModule.getGadget(iGadgetId);

			this.varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			// Wiring will ask dragboard for the inital instances
		}
		 
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!this.loadCompleted)
				return;

			this.dragboardModule.removeInstance(iGadgetId); // TODO split into hideInstance and removeInstance
			this.varManagerModule.removeInstance(iGadgetId);
			this.wiringModule.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    this.wiringModule.sendEvent(gadget, event, value);
		}

		OpManager.prototype.restaure = function () {
		    this.wiringModule.restaure();
		}

		OpManager.prototype.loadEnviroment = function () {
			this.varManagerModule = VarManagerFactory.getInstance();
		}

		OpManager.prototype.repaintCatalogue = function (url) {
	 	    this.catalogue.emptyResourceList();
		    this.catalogue.loadCatalogue(url);	
		}
		
		OpManager.prototype.continueLoading = function (module) {
			// Asynchronous load of modules
			// Each module notifies OpManager it has finished loading!
			
			if (module == Modules.prototype.VAR_MANAGER) {
				this.showcaseModule = ShowcaseFactory.getInstance();
				return; 
			}
			
			if (module == Modules.prototype.SHOWCASE) {
				this.dragboardModule = DragboardFactory.getInstance();
				return;
			}
				
			if (module == Modules.prototype.DRAGBOARD) {
				this.wiringModule = WiringFactory.getInstance();
				return;
			}
			
			if (module == Modules.prototype.WIRING) {
				this.catalogue = CatalogueFactory.getInstance();
				this.catalogue.loadCatalogue(URIs.GET_POST_RESOURCES);

				this.loadCompleted = true;
				delete this.notifyInstance;
				environmentLoadedCallback();
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
