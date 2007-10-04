var VarManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function VarManager () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
	    var igadgets = [];
		var wiring = WiringFactory.getInstance();
		
		var findVariable = function (iGadgetId, name) {
			var variables = igadgets[iGadgetId];
			var variable = variables[variableName];
		
			return variable;
		}
	
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

