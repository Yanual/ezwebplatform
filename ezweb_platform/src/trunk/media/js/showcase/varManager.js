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


var VarManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function VarManager () {
	
		// ****************
		// CALLBACK METHODS 
		// ****************
		
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		loadIGadgets = function (transport) {
			// JSON-coded iGadget-variable mapping
			var response = transport.responseText;
			var tempList = eval ('(' + response + ')');
			
			// Constructing the structure
			tempList = tempList.igadgets;
			
			var objVars = [];
			var id = -1;
			var rawVars = null;
			var rawVar = null;
			
			for (i = 0; i<tempList.length; i++) {
				id = tempList[i].id;
				rawVars = tempList[i].variables;
				
				for (j = 0; j<rawVars.length; j++) {
					rawVar = rawVars[j];
					
					switch (rawVar.aspect) {
						case Variable.prototype.PROPERTY:
						case Variable.prototype.EVENT:
							objVars[rawVar.name] = new RWVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
						case Variable.prototype.SLOT:
						case Variable.prototype.USER_PREF:
							objVars[rawVar.name] = new RVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
					}
				}
				
				iGadgets[id] = objVars;
			}
			
			loaded = true;
			opManager.continueLoading (Modules.prototype.VAR_MANAGER);
		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error VarManager GET");
			
			// Procesamiento
		}
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
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
		var iGadgets = [];
		
		// Getting IGadgets from PersistenceEngine. Asyncrhonous call!
		//persistenceEngine.send_get(URIs.IGADGETS_VARIABLES, loadIGadgets, onError);
		//persistenceEngine.send_get('http://europa.ls.fi.upm.es:8000/user/admin/igadgets/', this, loadIGadgets, onError);
		persistenceEngine.send_get('/ezweb/json/igadgets.json', this, loadIGadgets, onError);
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		VarManager.prototype.writeSlot = function (iGadgetId, slotName, value) {
			if (! loaded)
				return;
			
			var variable = findVariable(iGadgetId, slotName);
			
			variable.writeSlot(value);
		} 
		
		VarManager.prototype.registerVariable = function (iGadgetId, variableName, handler) {
			if (! loaded)
				return;
				
			var variable = findVariable(iGadgetId, variableName);
			
			variable.setHandler(handler);
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

		VarManager.prototype.addInstance = function (iGadgetId, template) {
			if (! loaded)
				return;

			var templateVariables = template.getVariables(iGadgetId);
			
			iGadgets[iGadgetId] = templateVariables;
		}
		
		VarManager.prototype.removeInstance = function (iGadgetId) {
			if (! loaded)
			    return;

			delete iGadgets[iGadgetId];
		}

	}
	
		
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new VarManager();
         	}
         	return instance;
       	}
	}
	
}();

