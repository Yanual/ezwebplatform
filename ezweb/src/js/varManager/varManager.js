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
			var tempList = eval ('(' + response + ')');
			
			// Constructing the structure
			tempList = tempList.igadgets;
			
			var objVars = [];
			var id = -1;
			var rawVars = null;
			var rawVar = null;
			
			for (i = 0; i<tempList.length; i++) {
				id = tempList[i].id;
				rawVars = tempList[i].variables;
				
				for (j = 0; j<rawVars.length; j++) {
					rawVar = rawVars[j];
					
					switch (rawVar.aspect) {
						case Variable.prototype.PROPERTY:
						case Variable.prototype.EVENT:
							objVars[rawVar.name] = new RWVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
						case Variable.prototype.SLOT:
						case Variable.prototype.USER_PREF:
							objVars[rawVar.name] = new RVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
					}
				}
				
				iGadgets[id] = objVars;
			}
			
			loaded = true;
			opManager.continueLoading (Modules.prototype.VAR_MANAGER);
		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error VarManager GET");
			
			// Procesamiento
		}
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		var findVariable = function (iGadgetId, name) {
			var variables = iGadgets[iGadgetId];
			var variable = variables[name];
		
			return variable;
		}
		
		var loaded = false;
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var opManager = OpManagerFactory.getInstance();
		var wiring = WiringFactory.getInstance();
		var iGadgets = [];
		
		// Getting IGadgets from PersistenceEngine. Asyncrhonous call!
		//persistenceEngine.send_get(URIConstants.prototype.IGADGETS_VARIABLES, this.loadIGadgets.bind(this), this.loadIGadgets.bind(this));
		//persistenceEngine.send_get('igadgets.json', this, loadIGadgets, loadIGadgets);
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		VarManager.prototype.writeSlot = function (iGadgetId, slotName, value) {
			if (! loaded)
				return;
			
			var variable = findVariable(iGadgetId, slotName);
			
			variable.writeSlot(value);
		} 
		
		VarManager.prototype.registerVariable = function (iGadgetId, variableName, handler) {
			if (! loaded)
				return;
				
			var variable = findVariable(iGadgetId, variableName);
			
			variable.setHandler(handler);
		}
		
		VarManager.prototype.getVariable = function (iGadgetId, variableName) {
			if (! loaded)
				return;
				
			var variable = findVariable(iGadgetId, variableName);
			
			// Error control
			
			return variable.get();
		}
		
		VarManager.prototype.setVariable = function (iGadgetId, variableName, value) {
			if (! loaded)
				return;
				
			if (wiring == null)
				wiring = WiringFactory.getInstance();
			
			var variable = findVariable(iGadgetId, variableName);
			
			return variable.set(value, wiring);
		}

		VarManager.prototype.addInstance = function (iGadgetId, template) {
			if (! loaded)
				return;

			var templateVariables = template.getVariables(iGadgetId);
			
			iGadgets[iGadgetId] = templateVariables;
		}
		
		VarManager.prototype.removeInstance = function (iGadgetId) {
			if (! loaded)
			    return;

			delete iGadgets[iGadgetId];
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

