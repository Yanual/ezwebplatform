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


function VarManager (workSpaceInfo) {
	
	// ****************
	// PUBLIC METHODS 
	// ****************
	
	VarManager.prototype.parseVariables = function (workSpaceInfo) {	
		// Igadget variables!
		var tabs = workSpaceInfo['workspace']['tabList'];
		
		for (var i=0; i<tabs.length; i++) {
			var igadgets = tabs[i]['igadgetList'];
			
			for (var j=0; j<igadgets.length; j++) {
				this.parseIGadgetVariables(igadgets[j]);
			}
		}
		
		// Workspace variables (Connectables and future variables!)
		var inouts = workSpaceInfo['workspace']['inoutList'];
				
		this.parseWorkspaceVariables(inouts);
		
		loaded = true;
	}	
	
	VarManager.prototype.parseWorkspaceVariables = function (inouts) {
		var objVars = []
		for (var i = 0; i<inouts.length; i++) {
			var id = inouts[i].id;
			var name = inouts[i].name;
			var aspect = inouts[i].aspect;
			var value = inouts[i].value;
				
			switch (aspect) {
				case Variable.prototype.INOUT:
					objVars[name] = new RWVariable(id, null, name, aspect, this, value);
					variables[id] = objVars[name];
					break;
			}
		}		
	}
	
	VarManager.prototype.parseIGadgetVariables = function (igadget) {		
		var igadgetVars = igadget['variables'];
		var objVars = []
		for (i = 0; i<igadgetVars.length; i++) {
			var id = igadgetVars[i].id;
			var igadgetId = igadgetVars[i].igadgetId;
			var name = igadgetVars[i].name;
			var aspect = igadgetVars[i].aspect;
			var value = igadgetVars[i].value;
				
			switch (aspect) {
				case Variable.prototype.PROPERTY:
				case Variable.prototype.EVENT:
					objVars[name] = new RWVariable(id, igadgetId, name, aspect, this, value);
					variables[id] = objVars[name];
					break;
				case Variable.prototype.EXTERNAL_CONTEXT:
				case Variable.prototype.GADGET_CONTEXT:						
				case Variable.prototype.SLOT:
				case Variable.prototype.USER_PREF:
					objVars[name] = new RVariable(id, igadgetId, name, aspect, this, value);
					variables[id] = objVars[name];
					break;
			}
		}
		
		iGadgets[igadget['id']] = objVars;
		
	}
	
	VarManager.prototype.writeSlot = function (iGadgetId, slotName, value) {
		if (! loaded)
			return;
		
		var variable = findVariable(iGadgetId, slotName);
		
		variable.set(value);
	} 

	VarManager.prototype.updateUserPref = function (iGadgetId, slotName, value) {
		if (! loaded)
			return;
		
		var variable = findVariable(iGadgetId, slotName);
		
		variable.set(value);
	} 
	
	VarManager.prototype.updateContextVar = function (iGadgetId, ctxVarName, value) {
		if (! loaded)
			return;
		
		var variable = findVariable(iGadgetId, ctxVarName);
		
		variable.set(value);
	}  
	
	VarManager.prototype.registerVariable = function (iGadgetId, variableName, handler) {
		if (! loaded)
			return;
			
		var variable = findVariable(iGadgetId, variableName);

		if (variable) {
			variable.setHandler(handler);
		} else {
			var transObj = {iGadgetId: iGadgetId, varName: variableName};
			var msg = interpolate(gettext("IGadget %(iGadgetId)s does not have any variable named \"%(varName)s\".\nIf you need it, please insert it into the gadget's template."), transObj, true);
			OpManagerFactory.getInstance().logIGadgetError(iGadgetId, msg, Constants.Logging.ERROR_MSG);
		}
	}
	
	VarManager.prototype.getVariable = function (iGadgetId, variableName) {
		if (! loaded)
			return;
			
		var variable = findVariable(iGadgetId, variableName);
		
		// Error control
		
		return variable.get();
	}
	
	VarManager.prototype.setVariable = function (iGadgetId, variableName, value) {
		if (! loaded)
			return;
			
		if (wiring == null)
			wiring = WiringFactory.getInstance();
		
		var variable = findVariable(iGadgetId, variableName);
		
		return variable.set(value, wiring);
	}

	VarManager.prototype.addInstance = function (iGadget, template) {
		if (! loaded)
			return;

		var templateVariables = template.getVariables(iGadget.id);
		
		iGadgets[iGadget.id] = templateVariables;
	}
	
	VarManager.prototype.removeInstance = function (iGadgetId) {
		if (! loaded)
		    return;

		delete iGadgets[iGadgetId];
	}

	VarManager.prototype.commitModifiedVariables = function() {
		// Asynchronous handlers 
		function onSuccess(transport) {
			//varManager.resetModifiedVariables(); Race Condition
		}
		function onError(transport) {
			alert (transport.responseText);
		}

		if (modifiedVars.length > 0) {
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			var param = {variables: Object.toJSON(modifiedVars)};

			persistenceEngine.send_update(URIs.PUT_VARIABLES, param, this, onSuccess, onError);
			varManager.resetModifiedVariables();
		}
	}

	VarManager.prototype.planInterfaceInitialization = function () {
	    if (loaded == true) {
		try {
		    setTimeout("VarManagerFactory.getInstance().initializeInterface()", 200);
		} catch (e) {
		    alert(e);
		}
	    }
	}

	VarManager.prototype.initializeInterface = function () {
	    // Calling all SLOT vars handler
	    var variable;
	    var vars;
	    var varIndex;
	    var gadgetIndex;

	    for (gadgetIndex in iGadgets) {
		vars = iGadgets[gadgetIndex];

		for (varIndex in vars) {
		    variable = vars[varIndex];

		    if (variable.aspect == "SLOT" && variable.handler) {
			try { 
			    variable.handler(variable.value);
			} catch (e) {
			}
		    }
		}
		
	    }
	}


	VarManager.prototype.getModifiedVariables = function () {
	    return modifiedVars;
	}


	VarManager.prototype.markVariablesAsModified = function (vars) {
	    var varInfo;
	    var found = false;
	    var modVar;

	    for (i=0; i<vars.length; i++) {
		varInfo = vars[i];
		for (j=0; j<modifiedVars.length; j++) {
		    modVar = modifiedVars[j];

		    if (modVar.iGadget == varInfo.iGadget && modVar.name == varInfo.name) {
			modVar.value = varInfo.value;
			found = true;
			break;
		    }			  			    
		}

		if (found) {
		    found = false;
		    continue;
		}
		else {
		    modifiedVars.push(varInfo);
		}
		    
		
	    }
	}

	VarManager.prototype.incNestingLevel = function() {
	    nestingLevel++;
	}

	VarManager.prototype.decNestingLevel = function() {
	    nestingLevel--;
	    if (nestingLevel == 0)
		this.commitModifiedVariables();
	}

	VarManager.prototype.resetModifiedVariables = function () {
	    nestingLevel = 0;
	    modifiedVars = [];
	}
	
	VarManager.prototype.getVariableObject = function (varId) {
		return variables[varId];
	}
	
	// *********************************
	// PRIVATE VARIABLES AND CONSTRUCTOR
	// *********************************
	
	var findVariable = function (iGadgetId, name) {
		var variables = iGadgets[iGadgetId];
		var variable = variables[name];
	
		return variable;
	}

	var loaded = false;
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var opManager = OpManagerFactory.getInstance();
	var wiring = null; 
	var iGadgets = new Hash();
	var variables = new Hash();
	var modifiedVars = [];
	var nestingLevel = 0;
	
	// Creation of ALL EzWeb variables regarding one workspace
	this.parseVariables(workSpaceInfo);
}