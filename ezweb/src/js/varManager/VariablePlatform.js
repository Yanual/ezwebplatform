/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VARIABLE (Parent Class)  <<PLATFORM>>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Variable (iGadget, name) {
	var iGadget = null;
	var name = null;
	var aspect = null;
	var value = null;
}

//////////////////////////////////////////////
// PARENT CONTRUCTOR (Super keyboard emulation)
//////////////////////////////////////////////
 
Variable.prototype.Variable = function (iGadget_, name_, aspect_, value_) {
    iGadget = iGadget_;
    name = name_;
	aspect = aspect_;
	value = value_;
}

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
//////////////////////////////////////////////

Variable.prototype.get = function () { }  

Variable.prototype.setHandler = function () { } 

GadgetVariable.prototype.set = function (value, wiring) { } 

//////////////////////////////////////////////
// PUBLIC CONSTANTS
//////////////////////////////////////////////

Variable.prototype.EVENT = "EVENT"  
Variable.prototype.SLOT = "SLOT"  
Variable.prototype.USER_PREF = "USER_PREF"  
Variable.prototype.PROPERTY = "PROPERTY"  

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RVARIABLE (Derivated class) <<PLATFORM>>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RVariable(iGadget_, name_, aspect_, value_) {
	Variable.prototype.Variable.call(this, iGadget_, name_, aspect_, value_);
  
	var handler = null;
}

//////////////////////////////////////////////
// DEFINING INHERITANCE
//////////////////////////////////////////////

RVariable.prototype = new Variable;

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
////////////////////////////////////////////// 

RVariable.prototype.writeSlot = function (newValue) { 
	switch (aspect){
		case Variable.prototype.SLOT:
			value = newValue;
			handler(newValue);
			break;
	}
}

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RVariable.prototype.setHandler = function (handler_) { 
	handler = handler_;
} 

RVariable.prototype.get = function () { 
	switch (aspect){
		case Variable.prototype.USER_PREF:
			return value;
		case Variable.prototype.SLOT:
			return value;
	}
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

RWVariable.prototype.set = function (value, wiring) {  
  // Error control needed here!!!!!!!!
	switch (aspect){
		case Variable.prototype.PROPERTY:
		// PersistentEngine.guardar
		break;
		case Variable.prototype.EVENT:
		// PersistentEngine.guardar
		wiring.sendEvent(iGadgetId, name, value);
		break;
	}
}  

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RWVariable.prototype.get = function () {  
  // Error control needed here!!!!!!!!
	switch (aspect){
		case Variable.prototype.PROPERTY:
		return value;
		case Variable.prototype.EVENT:
		return value;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 


