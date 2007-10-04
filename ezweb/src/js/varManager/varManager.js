var VarManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function VarManager () {
	
		// ****************
		// CALLBACK METHODS 
		// ****************
		
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		loadIGadgets = function (transport) {
			// JSON-coded iGadget-variable mapping
			var response = transport.responseText;
			var provisionalIGadgetList = eval ("(" + response + ")");
			
			// Procesamiento
		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			write ('onError');
			
			// Procesamiento
		}
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var findVariable = function (iGadgetId, name) {
			var variables = iGadgets[iGadgetId];
			var variable = variables[variableName];
		
			return variable;
		}
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var wiring = WiringFactory.getInstance();
		var iGadgets = [];
		
		// Getting IGadgets from PersistenceEngine. Asyncrhonous call!
		//persistenceEngine.send_get(URIConstants.prototype.IGADGETS_VARIABLES, this.loadIGadgets.bind(this), this.loadIGadgets.bind(this));
		persistenceEngine.send_get('igadgets.json', loadIGadgets.bind(this), loadIGadgets.bind(this));
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		VarManager.prototype.writeSlot = function (iGadgetId, slotName, value) {
			var variable = findVariable(iGadgetId, variableName);
			
			variable.writeSlot(value);
		} 
		
		VarManager.prototype.registerVariable = function (iGadgetId, variableName, handler) {
			var variable = findVariable(iGadgetId, variableName);
			
			variable.setHandler(handler);
		}
		
		VarManager.prototype.getVariable = function (iGadgetId, variableName) {
			var variable = findVariable(iGadgetId, variableName);
			
			// Error control
			
			return variable.get();
		}
		
		VarManager.prototype.setVariable = function (iGadgetId, variableName, value) {
			var variable = findVariable(iGadgetId, variableName);
			
			return variable.set(value, wiring);
		}
		
		VarManager.prototype.addInstance = function (iGadgetId, template) {
			var templateVariables = template.getVariables();
			
			igadgets[iGadgetId] = templateVariables;
		}
		
	}
	
		
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new VarManager();
         	}
         	return instance;
       	}
	}
	
}();

