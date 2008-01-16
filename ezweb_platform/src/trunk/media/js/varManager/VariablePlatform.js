/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


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
Variable.prototype.EXTERNAL_CONTEXT = "ECTX"
Variable.prototype.GADGET_CONTEXT = "GCTX"

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



//////////////////////////////////////////////
// OVERWRITTEN METHODS
//////////////////////////////////////////////

RVariable.prototype.setHandler = function (handler_) { 
	this.handler = handler_;
} 

RVariable.prototype.get = function () { 
	switch (this.aspect){
		case Variable.prototype.GADGET_CONTEXT:
		case Variable.prototype.EXTERNAL_CONTEXT:
		case Variable.prototype.USER_PREF:
		case Variable.prototype.SLOT:
			return this.value;
		default:
			break;
	}
}  
    
    
RVariable.prototype.set = function (newValue) { 
	switch (this.aspect){
		case Variable.prototype.GADGET_CONTEXT:
		case Variable.prototype.EXTERNAL_CONTEXT:
		case Variable.prototype.SLOT:
		case Variable.prototype.USER_PREF:
			this.value = newValue;
			try {
				this.handler(newValue);
			} catch (e) {
				// TODO log this event
			}
			break;
		default:
			break;
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

RWVariable.prototype.set = function (value_) {  
    
    wiring = WiringFactory.getInstance();
    varManager = VarManagerFactory.getInstance();

    // Asynchronous handlers 
    function onSuccess() {}
    function onError(transport) {alert ("ERROR: variable cannot be saved");}

    // This variable was modified
    if (this.value != value_) {
	var varInfo = new Object();
        
        varInfo.iGadget = this.iGadget;
        varInfo.name = this.name;
        varInfo.value = value_;
        
        var variables = [];
        variables[0] = varInfo;
	
	varManager.markVariablesAsModified(variables);
    }
    
    this.value = value_;

    // Propagate changes to wiring module
    switch (this.aspect){
    case Variable.prototype.PROPERTY:
	break;
    case Variable.prototype.EVENT:
        modifiedVariables = wiring.sendEvent(this.iGadget, this.name, value_);
	varManager.markVariablesAsModified(modifiedVariables);

	// Notify to SLOTs their new values
	var modVar;

	for (i=0; i<modifiedVariables.length; i++) {
	    modVar = modifiedVariables[i];
	    varManager.writeSlot(modVar.iGadget, modVar.name, modVar.value);
	}
	    

	break;
    }

    // Save all modified vars
    /*var persistenceEngine = PersistenceEngineFactory.getInstance();
    put_variable_uri = URIs.GET_POST_GADGET_VARIABLE.evaluate({
	    "iGadgetId": this.iGadget,
	    "varName": this.name});
    var param = 'value=' + value_;

    PersistenceEngineFactory.getInstance().send_update(put_variable_uri, param, this, onSuccess, onError);*/

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


