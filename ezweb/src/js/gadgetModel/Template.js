
function Template(uri_) {
    var state = new TemplateState(uri_);

    Template.prototype.getVariables = function (igadget_) {
        // recorremos la colección de variables del objeto state 
		// y vamos instanciando cada una de las variables en función de sus datos
     
		var objVars = [];
		//var id = igadget_.getId();
		var rawVars = state.getVariables();
		var rawVar = null;
		for (i = 0; i<rawVars.length; i++) {
			alert(i);
			rawVar = rawVars[i];
			alert(rawVar.aspect);
			switch (rawVar.aspect) {
				case Variable.prototype.PROPERTY:
				case Variable.prototype.EVENT:
					objVars[rawVar.name] = new RWVariable(igadget_, rawVar.name, rawVar.aspect, rawVar.value);
					break;
				case Variable.prototype.SLOT:
				case Variable.prototype.USER_PREF:
					objVars[rawVar.name] = new RVariable(igadget_, rawVar.name, rawVar.aspect, rawVar.value);
					break;
			}
		}
      
        return objVars;
    }
}

function TemplateState(uri_)
{
	var variableList;
	
	loadTemplate = function (transport) {
		var response = transport.responseText;
		variableList = eval ('(' + response + ')');
		variableList = variableList.variables;
	}
		
	onError = function (transport) {
		alert("error Template GET");
		
		// Procesamiento
	}
	
	TemplateState.prototype.getVariables = function () {
		return variableList;
	}
	
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	persistenceEngine.send_get('template.json', this, loadTemplate, onError);
}