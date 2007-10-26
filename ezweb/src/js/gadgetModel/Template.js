
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
	
	this.getUserPrefs = function () {
		
		// JSON-coded Template-Variables mapping	
		// Constructing the structure 
		 
		var objVars = [];
		var rawVars = variableList;
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			rawVar = rawVars[i];
			if (rawVar.aspect == Variable.prototype.PROPERTY) {
				switch (rawVar.type) {
					case UserPref.prototype.TEXT:  
						objVars[rawVar.name] = new TextUserPref(rawVar.name, rawVar.label, rawVar.description, rawVar.defaultValue);
						break;
					case UserPref.prototype.INTEGER:  
						objVars[rawVar.name] = new IntUserPref(rawVar.name, rawVar.label, rawVar.description, rawVar.defaultValue);
						break;
					case UserPref.prototype.DATE:
						objVars[rawVar.name] = new DateUserPref(rawVar.name, rawVar.label, rawVar.description, rawVar.defaultValue);
						break;
					case UserPref.prototype.LIST:
						objVars[rawVar.name] = new ListUserPref(rawVar.name, rawVar.label, rawVar.description, rawVar.defaultValue);
						break;
				}
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