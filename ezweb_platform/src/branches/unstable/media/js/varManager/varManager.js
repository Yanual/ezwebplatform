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


function VarManager (_workSpace) {
	
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
		var ws_vars = workSpaceInfo['workspace']['workSpaceVariableList'];
				
		this.parseWorkspaceVariables(ws_vars);
	}
	

	VarManager.prototype.parseWorkspaceVariables = function (ws_vars) {
		var objVars = []
		for (var i = 0; i<ws_vars.length; i++) {
			var id = ws_vars[i].variableId;
			var name = ws_vars[i].name;
			var aspect = ws_vars[i].aspect;
			var value = ws_vars[i].value;
				
			switch (aspect) {
				case Variable.prototype.INOUT:
					objVars[name] = new RWVariable(id, null, name, aspect, this, value);
					workspaceVariables[id] = objVars[name]; 
					break;
				case Variable.prototype.TAB:
					objVars[id] = new RVariable(id, null, name, aspect, this, value);
					workspaceVariables[id] = objVars[id]; 
					break;
			}
		}		
	}
	
	VarManager.prototype.parseIGadgetVariables = function (igadget) {
		var igadgetVars = igadget['variables'];
		var objVars = []
		for (var i = 0; i<igadgetVars.length; i++) {
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
		var variable = findVariable(iGadgetId, slotName);
		
		variable.set(value);
	} 

	VarManager.prototype.updateUserPref = function (iGadgetId, slotName, value) {
		var variable = findVariable(iGadgetId, slotName);
		
		variable.set(value);
	} 
	
	VarManager.prototype.updateContextVar = function (iGadgetId, ctxVarName, value) {
		var variable = findVariable(iGadgetId, ctxVarName);
		
		variable.set(value);
	}  
	
	VarManager.prototype.registerVariable = function (iGadgetId, variableName, handler) {
		var variable = findVariable(iGadgetId, variableName);

		if (variable) {
			variable.setHandler(handler);
		} else {
			var transObj = {iGadgetId: iGadgetId, varName: variableName};
			var msg = interpolate(gettext("IGadget %(iGadgetId)s does not have any variable named \"%(varName)s\".\nIf you need it, please insert it into the gadget's template."), transObj, true);
			OpManagerFactory.getInstance().logIGadgetError(iGadgetId, msg, Constants.Logging.ERROR_MSG);
		}
	}
	
	VarManager.prototype.assignEventConnectable = function (iGadgetId, variableName, wEvent) {
		var variable = findVariable(iGadgetId, variableName);
		variable.assignEvent(wEvent);
	}
	
	VarManager.prototype.getVariable = function (iGadgetId, variableName) {
		var variable = findVariable(iGadgetId, variableName);
		
		// Error control
		
		return variable.get();
	}
	
	VarManager.prototype.setVariable = function (iGadgetId, variableName, value) {
		var variable = findVariable(iGadgetId, variableName);
		
		variable.set(value);
	}

	VarManager.prototype.addInstance = function (iGadget, igadgetInfo) {
		var templateVariables = iGadget.getGadget().getTemplate().getVariables(iGadget);
		var variableInfo = igadgetInfo['variableList'];

		for (var templateVariableName in templateVariables) {
		        var templateVar = templateVariables[templateVariableName];
			for (var i in variableInfo) {
				var currentVar = variableInfo[i];
			
				if (templateVariableName == currentVar.name) {
					templateVar.id = currentVar.id;
					break;
				}
			}
		}
		
		iGadgets[iGadget.id] = templateVariables;
	}
	
	VarManager.prototype.removeInstance = function (iGadgetId) {
		delete iGadgets[iGadgetId];
	}

	VarManager.prototype.commitModifiedVariables = function() {
		// Asynchronous handlers 
		function onSuccess(transport) {
			//varManager.resetModifiedVariables(); Race Condition
		}

		function onError(transport, e) {
			var msg;
			if (e) {
				msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
				                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
				                  true);
			} else {
				msg = transport.status + " " + transport.statusText;
			}
			msg = interpolate(gettext("Error saving variables to persistence: %(errorMsg)s."),
			                          {errorMsg: msg}, true);
			OpManagerFactory.getInstance().log(msg);
		}

		if (igadgetModifiedVars.length > 0 || workspaceModifiedVars.length > 0) {
			var persistenceEngine = PersistenceEngineFactory.getInstance();
			
			var variables = {};
			
			variables['igadgetVars'] = igadgetModifiedVars;
			variables['workspaceVars'] = workspaceModifiedVars;
			
			var param = {variables: Object.toJSON(variables)};
			
			var uri = URIs.PUT_VARIABLES.evaluate({workspaceId: this.workSpace.getId()});

			persistenceEngine.send_update(uri, param, this, onSuccess, onError);
			this.resetModifiedVariables();
		}
	}

	VarManager.prototype.createWorkspaceVariable = function(name) {
		// TODO
		var newVar = new RWVariable(null, null, name, Variable.prototype.INOUT, this, null);
		return newVar;
	}
	
	VarManager.prototype.addWorkspaceVariable = function(id, variable) {
		workspaceVariables[id] = variable;
	}

	VarManager.prototype.getWorkspaceVariableById = function(varId) {
		return workspaceVariables[varId];
	}

/*	VarManager.prototype.planInterfaceInitialization = function () {
	    if (this.loaded) {
		try {
		    setTimeout("VarManagerFactory.getInstance().initializeInterface()", 200);
		} catch (e) {
		    alert(e);
		}
	    }
	}*/

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


	VarManager.prototype.markVariablesAsModified = function (variable) {
		var varCollection;
		
		// Is it a igadgetVar or a workspaceVar?
		if (variable.aspect == "INOUT") {
			varCollection = workspaceModifiedVars;
		} else {
			varCollection = igadgetModifiedVars;
		}
	 
		for (i=0; i<varCollection.length; i++) {
		    var modVar = varCollection[i];
	
		    if (modVar.id == variable.id) {
				modVar.value = variable.value;
				return;
		    }	
		}
		
		var varInfo = {};
		
		varInfo['id'] = variable.id;
		varInfo['value'] = variable.value;

		varCollection.push(varInfo);	    
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
	    igadgetModifiedVars = [];
	    workspaceModifiedVars = [];
	}
	
	VarManager.prototype.getVariableById = function (varId) {
		return variables[varId];
	}
	
	VarManager.prototype.getVariableByName = function (igadgetId, varName) {
		return findVariable(igadgetId, varName);
	}
	
	// *********************************
	// PRIVATE VARIABLES AND CONSTRUCTOR
	// *********************************
	
	var findVariable = function (iGadgetId, name) {
		var variables = iGadgets[iGadgetId];
		var variable = variables[name];
	
		return variable;
	}

	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var opManager = OpManagerFactory.getInstance();
	
	this.workSpace = _workSpace;
	var wiring = null;
	var iGadgets = new Hash();
	var variables = new Hash();
	
	// For now workspace variables must be in a separated hash table, because they have a
	// different identifier space and can collide with the idenfiers of normal variables
	var workspaceVariables = new Hash();
	
	var igadgetModifiedVars = []
	var workspaceModifiedVars = []
	
	var nestingLevel = 0;
	
	// Creation of ALL EzWeb variables regarding one workspace
	this.parseVariables(this.workSpace.workSpaceGlobalInfo);
}
