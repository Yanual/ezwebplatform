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
		var catalogue = CatalogueFactory.getInstance();
		
		// Still to load modules
		var varManagerModule = null;
		var wiringModule = null;
		var dragboardModule = null;
		var showcaseModule = null;
		
		var loadCompleted = false;
		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!loadCompleted)
				return;

			var gadget = showcaseModule.getGadget(gadgetId);
				
			var iGadgetId = dragboardModule.addInstance(gadget);
			
			varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			wiringModule.addInstance(iGadgetId, gadget.getTemplate());
			
			dragboardModule.showInstance(iGadgetId);

			// The dragboard must be shown after an igadget insertion
			show_dragboard()
		}
		 
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!loadCompleted)
				return;

			dragboardModule.removeInstance(iGadgetId); // TODO split into hideInstance and removeInstance
			varManagerModule.removeInstance(iGadgetId);
			wiringModule.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    wiringModule.sendEvent(gadget, event, value);
		}

		OpManager.prototype.restaure = function () {
		    wiringModule.restaure();
		}

		OpManager.prototype.loadEnviroment = function () {
		    varManagerModule = VarManagerFactory.getInstance();
			CatalogueFactory.getInstance().loadCatalogue('http://europa.ls.fi.upm.es:8000/user/admin/catalogue/resources/');	
			//CatalogueFactory.getInstance().loadCatalogue('http://europa.ls.fi.upm.es:8000/ezweb/prueba.xml');	
		}

		OpManager.prototype.repaintCatalogue = function () {
	 	    catalogue.emptyResourceList();
		    catalogue.loadCatalogue('http://europa.ls.fi.upm.es:8000/user/admin/catalogue/resources/');	
		}
		
		OpManager.prototype.continueLoading = function (module) {
			// Asynchronous load of modules
			// Each module notifies OpManager it has finished loading!
			
			if (module == Modules.prototype.VAR_MANAGER) {
				showcaseModule = ShowcaseFactory.getInstance();
				return; 
			}
			
			if (module == Modules.prototype.SHOWCASE) {
				dragboardModule = DragboardFactory.getInstance();
				return;
			}
				
			if (module == Modules.prototype.DRAGBOARD) {
				wiringModule = WiringFactory.getInstance();
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
