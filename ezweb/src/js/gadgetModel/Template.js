
//////////////////////////////////////////////
//                 TEMPLATE                 //
//////////////////////////////////////////////

function Template(template_) {

	// *******************
	//  PRIVATE VARIABLES
	// *******************

   var variableList = template_.variables;

	// ******************
	//  PUBLIC FUNCTIONS
	// ******************

    this.getVariables = function (igadget_) {
        
		// JSON-coded Template-Variables mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			switch (rawVar.aspect) {
				case Variable.prototype.PROPERTY:
				case Variable.prototype.EVENT:
					objVars[rawVar.name] = new RWVariable(igadget_, rawVar.name, rawVar.aspect, null);
					break;
				case Variable.prototype.SLOT:
				case Variable.prototype.USER_PREF:
					objVars[rawVar.name] = new RVariable(igadget_, rawVar.name, rawVar.aspect, null);
					break;
			}
		}
        return objVars;
    }
	
	this.getUserPrefsId = function () {
        
		// JSON-coded Template-UserPrefs mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			if (rawVar.aspect == Variable.prototype.USER_PREF)
			{
					objVars.push(rawVar.name);
			}
		}
        return objVars;
    }
	
	this.getEventsId = function () {
        
		// JSON-coded Template-UserPrefs mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			if (rawVar.aspect == Variable.prototype.EVENT)
			{
					objVars.push(rawVar.name);
			}
		}
        return objVars;
    }
	
	this.getSlotsId = function () {
        
		// JSON-coded Template-UserPrefs mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			if (rawVar.aspect == Variable.prototype.SLOT)
			{
					objVars.push(rawVar.name);
			}
		}
        return objVars;
    }
	
	this.getPropertiesId = function () {
        
		// JSON-coded Template-UserPrefs mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			if (rawVar.aspect == Variable.prototype.PROPERTY)
			{
					objVars.push(rawVar.name);
			}
		}
        return objVars;
    }
}