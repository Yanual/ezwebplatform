/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GADGETVARIABLE (Parent Class) <<GADGET>>
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GadgetVariable (iGadgetId, name) {
	this.varManager = null;
	this.iGadgetId = null;
	this.name = null;
}

//////////////////////////////////////////////
// PARENT CONTRUCTOR (Super keyboard emulation)
//////////////////////////////////////////////
 
GadgetVariable.prototype.GadgetVariable = function (iGadget_, name_) {
    this.varManager = VarManagerFactory.getInstance();  
  
    this.iGadgetId = iGadget_;
    this.name = name_;
}

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
//////////////////////////////////////////////

GadgetVariable.prototype.get = function () { 
	return this.varManager.getVariable(this.iGadget, this.name);
}  

GadgetVariable.prototype.set = function (value) { } 

GadgetVariable.prototype.register = function (handler) { } 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RGADGETVARIABLE (Derivated class)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RGadgetVariable(iGadget_, name_, handler_) {
	GadgetVariable.prototype.GadgetVariable.call(this, iGadget_, name_);
  
	this.handler = handler_;
}

//////////////////////////////////////////////
// DEFINING INHERITANCE
//////////////////////////////////////////////

RGadgetVariable.prototype = new GadgetVariable;

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

GadgetVariable.prototype.register = function (handler) { 
	this.varManager.registerVariable(this.iGadgetId, this.name, handler);
} 

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RWGADGETVARIABLE (Derivated class)
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function RWGadgetVariable(iGadget_, name_) {
	GadgetVariable.prototype.GadgetVariable.call(this, iGadget_, name_);
}

//////////////////////////////////////////////
// DEFINING INHERITANCE
//////////////////////////////////////////////

RWGadgetVariable.prototype = new GadgetVariable;

//////////////////////////////////////////////
// PUBLIC METHODS TO BE INHERITANCED
//////////////////////////////////////////////

 

//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RWGadgetVariable.prototype.set = function (value) {  
	this.varManager.setVariable(this.iGadgetId, this.name, value)
} 

