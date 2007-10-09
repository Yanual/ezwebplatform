
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

    Template.prototype.getVariables = function (igadget_) {
        
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
					alert(rawVar.name);
					objVars[rawVar.name] = new RWVariable(igadget_, rawVar.name, rawVar.aspect, rawVar.value);
					break;
				case Variable.prototype.SLOT:
				case Variable.prototype.USER_PREF:
					alert(rawVar.name);
					objVars[rawVar.name] = new RVariable(igadget_, rawVar.name, rawVar.aspect, rawVar.value);
					break;
			}
		}
        return objVars;
    }
}