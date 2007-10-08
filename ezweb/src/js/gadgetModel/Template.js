
//////////////////////////////////////////////
//               TEMPLATE
//////////////////////////////////////////////

function Template(uri_) {
    var state = new TemplateState(uri_);

    Template.prototype.getVariables = function (igadget_) {
        // JSON-coded Template-variable mapping
		
		// Constructing the structure   
		var objVars = [];
		var rawVars = state.getVariables();
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

//////////////////////////////////////////////
//      TEMPLATESTATE (State Object)
//////////////////////////////////////////////

function TemplateState(uri_)
{	
	// ******************
	//  CALLBACK METHODS 
	// ******************
	
	// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
	
	loadTemplate = function (transport) {
		var response = transport.responseText;
		variableList = eval ('(' + response + ')');
		variableList = variableList.variables;
	}
		
	onError = function (transport) {
		alert("Error Template GET");
		// Process
	}
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	TemplateState.prototype.getVariables = function () {
		return variableList;
	}
	
	// *********************************
	//  PRIVATE VARIABLES AND FUNCTIONS
	// *********************************

	var variableList;
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	
	// Getting Variables from PersistenceEngine. Asyncrhonous call!
	// persistenceEngine.send_get(uri_, loadTemplate.bind(this), loadTemplate.bind(this));
	persistenceEngine.send_get('template.json', this, loadTemplate, onError);
}