/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VARIABLE (Parent Class)  <<PLATFORM>>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Variable (iGadget, name) {
	this.iGadget = null;
	this.name = null;
	this.aspect = null;
	this.value = null;
}

//////////////////////////////////////////////
// PARENT CONTRUCTOR (Super keyboard emulation)
//////////////////////////////////////////////
 
Variable.prototype.Variable = function (iGadget_, name_, aspect_, value_) {
    	this.iGadget = iGadget_;
    	this.name = name_;
	this.aspect = aspect_;
	this.value = value_;
}

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
//////////////////////////////////////////////

Variable.prototype.get = function () { }  

Variable.prototype.setHandler = function () { } 

Variable.prototype.set = function (value) { } 

//////////////////////////////////////////////
// PUBLIC CONSTANTS
//////////////////////////////////////////////

Variable.prototype.EVENT = "EVEN"  
Variable.prototype.SLOT = "SLOT"  
Variable.prototype.USER_PREF = "PREF"  
Variable.prototype.PROPERTY = "PROP"  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RVARIABLE (Derivated class) <<PLATFORM>>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RVariable(iGadget_, name_, aspect_, value_) {
	Variable.prototype.Variable.call(this, iGadget_, name_, aspect_, value_);
  
	this.handler = null;
}

//////////////////////////////////////////////
// DEFINING INHERITANCE
//////////////////////////////////////////////

RVariable.prototype = new Variable;

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
////////////////////////////////////////////// 

/*RVariable.prototype.notifyChange = function (newValue) { 
	switch (this.aspect){
		case Variable.prototype.SLOT:
		case Variable.prototype.USER_PREF:
			this.value = newValue;
			try {
				this.handler(newValue);
			} catch (e) {
				// TODO log this event
			}
			break;
	}

	// Asynchronous handlers 
	function onSuccess() {}
	function onError(transport) {alert ("ERROR: variable cannot be saved");}
	
	// Saves the new state of variable
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	put_variable_uri = URIs.GET_POST_GADGET_VARIABLE.evaluate({
		"iGadgetId": this.iGadget,
		"varName": this.name});
	
	var param = 'value=' + value_;
	
	PersistenceEngineFactory.getInstance().send_update(put_variable_uri, param, this, onSuccess, onError);
	
	}*/

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RVariable.prototype.setHandler = function (handler_) { 
	this.handler = handler_;
} 

RVariable.prototype.get = function () { 
	switch (this.aspect){
		case Variable.prototype.USER_PREF:
			return this.value;
		case Variable.prototype.SLOT:
			return this.value;
	}
}  
    
    
RVariable.prototype.set = function (newValue) { 
	switch (this.aspect){
		case Variable.prototype.SLOT:
		case Variable.prototype.USER_PREF:
			this.value = newValue;
			try {
				this.handler(newValue);
			} catch (e) {
				// TODO log this event
			}
			break;
	}

	// Asynchronous handlers 
	function onSuccess() {}
	function onError(transport) {alert ("ERROR: variable cannot be saved");}
	
	// Saves the new state of variable
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	put_variable_uri = URIs.GET_POST_GADGET_VARIABLE.evaluate({
		"iGadgetId": this.iGadget,
		"varName": this.name});
	
	var param = 'value=' + newValue;
	
	PersistenceEngineFactory.getInstance().send_update(put_variable_uri, param, this, onSuccess, onError);
	
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RWVARIABLE (Derivated class)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RWVariable(iGadget_, name_, aspect_, value_) {
	Variable.prototype.Variable.call(this, iGadget_, name_, aspect_, value_);
}

//////////////////////////////////////////////
// DEFINING INHERITANCE
//////////////////////////////////////////////

RWVariable.prototype = new Variable;

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
//////////////////////////////////////////////

RWVariable.prototype.set = function (value_) {  
    
    wiring = WiringFactory.getInstance();
    
    // Asynchronous handlers 
    function onSuccess() {}
    function onError(transport) {alert ("ERROR: variable cannot be saved");}
    
    // Saves the new state of variable
    var persistenceEngine = PersistenceEngineFactory.getInstance();
    put_variable_uri = URIs.GET_POST_GADGET_VARIABLE.evaluate({
	    "iGadgetId": this.iGadget,
	    "varName": this.name});
    var param = 'value=' + value_;
    PersistenceEngineFactory.getInstance().send_update(put_variable_uri, param, this, onSuccess, onError);
    
    // Error control needed here!!!!!!!!
    switch (this.aspect){
    case Variable.prototype.PROPERTY:
	break;
    case Variable.prototype.EVENT:
	// PersistentEngine.guardar
	if (this.value != value_){
	    wiring.sendEvent(this.iGadget, this.name, value_);
	}
	break;
    }
    this.value = value_;
}  

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RWVariable.prototype.get = function () {  
  // Error control needed here!!!!!!!!
	switch (this.aspect){
		case Variable.prototype.PROPERTY:
		return this.value;
		case Variable.prototype.EVENT:
		return this.value;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 


