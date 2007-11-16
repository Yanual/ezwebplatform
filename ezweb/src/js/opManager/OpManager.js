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
		this.catalogue = CatalogueFactory.getInstance();
		
		// Still to load modules
		this.varManagerModule = null;
		this.wiringModule = null;
		this.dragboardModule = null;
		this.showcaseModule = null;
		
		this.loadCompleted = false;
		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			var iGadgetId = this.dragboardModule.addInstance(gadget);
			
			this.varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			this.wiringModule.addInstance(iGadgetId, gadget.getTemplate());
			
			this.dragboardModule.showInstance(iGadgetId);

			// The dragboard must be shown after an igadget insertion
			show_dragboard()
		}
		 
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!loadCompleted)
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
			this.catalogue.loadCatalogue('http://europa.ls.fi.upm.es:8000/user/admin/catalogue/resources/');
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
				loadCompleted = true;
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
