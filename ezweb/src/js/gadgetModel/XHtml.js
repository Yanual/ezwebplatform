//////////////////////////////////////////////
//                  XHTML                   //
//////////////////////////////////////////////

function XHtml(uriCode_) {
	
	// Falta implementar el caso en que en la creación de un gadget, se le pasa XHmlt un URL de Internet para que objetnga el código, en éste caso lo tendrá que guardar en el servidor y guardar su URI
	var state = new XHtmlState(uriCode_);
	
	XHtml.prototype.getCode = function(){ return state.getCode(); }
}

//////////////////////////////////////////////
//        XHTMLESTATE (State Object)
//////////////////////////////////////////////

function XHtmlState(uriCode_) {
		
	// ******************
	//  CALLBACK METHODS 
	// ******************
	
	// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
	
	loadCode = function (transport) {
		code = transport.responseText;
	}
		
	onError = function (transport) {
		alert("Error XHtml GET");
		// Process
	}
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	XHtmlState.prototype.getCode = function () {
		return code;
	}
	
	// *********************************
	//  PRIVATE VARIABLES AND FUNCTIONS
	// *********************************
	
	var code;
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	
	// Getting Variables from PersistenceEngine. Asyncrhonous call!
	// persistenceEngine.send_get(uriCode_, loadCode.bind(this), onError.bind(this));
	persistenceEngine.send_get('code.string', this, loadCode, onError);
}