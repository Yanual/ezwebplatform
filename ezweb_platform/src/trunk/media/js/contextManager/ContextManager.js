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

var ContextManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function ContextManager () {
		// *********************************
		// PRIVATE VARIABLES
		// *********************************
		var loaded = false;
		var concepts = new Hash();     // a concept is its adaptor an its value
		var cname2IVars = new Hash();   // reltaes the concept name to the igadget's variables  
		var concept2Name = new Hash(); // relates the concept to its names
		var name2Concept = new Hash(); // relates the name to its concept
		var varsWaitingValue = new Hash();

		// ***********************
		// PRIVATED FUNCTIONS 
		// ***********************
		
		/**
		 * Loads data from persistenceEngine
		 */
	
		function _setContextValue (contextVar) {		
			var conceptName = contextVar.getConceptName();
			var concept = name2Concept[conceptName];
			if (concept == null){
				alert ("ERROR: Concept name '" + conceptName + "' has not related concept")
				return;
			} 
			// Gets concept value from adaptor (asynchronous)
			var adaptor = eval ('new ' + concepts[concept].adaptor + "("+ contextVar.getIGadget() +")"); // Remove this if we have a concept cache
			if (varsWaitingValue[concept] == null){
				varsWaitingValue[concept]= new Array()
			}
			varsWaitingValue[concept].push(contextVar);
		}
		

		/**
		 * Loads data from persistenceEngine
		 */
		function _loadConcepts(receivedData) {
			
			function _loadIGadgetContextVars(receivedData) {

				var iGadgetsJson = eval ('(' + receivedData.responseText + ')');
				iGadgetsJson = iGadgetsJson.iGadgets;
			
				cname2IVars = new Hash();

				for (var i = 0; i < iGadgetsJson.length; i++) {
					var currentIGadget = iGadgetsJson[i];
				
					for (var j = 0; j < currentIGadget.variables.length; j++) {
						var currentVar = currentIGadget.variables[j];

						switch (currentVar.aspect) {
							case Variable.prototype.EXTERNAL_CONTEXT:
							case Variable.prototype.GADGET_CONTEXT:
								var contextVar = new ContextVar(currentIGadget.id, currentVar.name, currentVar.concept)
								cname2IVars[currentVar.concept] = contextVar; 
								_setContextValue(contextVar)
								break;
							default:
								break;
						}
					}
				}
				loaded = true;
				OpManagerFactory.getInstance().continueLoading(Modules.prototype.CONTEXT_MANAGER);

			}
			
			function _onError(transport, e) {
				var msg;
				if (e)
					msg = e;
				else
					msg = transport.status + " " + transport.statusText;
				alert ("Error getting gadgets variables: " + msg);
			}
			
			// Start to load igadget's variables
			var conceptsJson = eval ('(' + receivedData.responseText + ')');
			conceptsJson = conceptsJson.concepts; 

			concepts = new Hash();

			for (var i = 0; i < conceptsJson.length; i++) {
				var curConcept = conceptsJson[i];
				// Creates the concept
				var concept = new Concept(curConcept.concept, curConcept.adaptor, curConcept.name);
				concepts[curConcept.concept] = concept; 
				
				// Relates the concept to its name
				if (concept2Name[curConcept.concept] == null){
					concept2Name[curConcept.concept] = new Array();
				}
				concept2Name[curConcept.concept].push(curConcept.name);		
				
				// Relates the concept name to its concept
				if (name2Concept[curConcept.name] != null){
					alert ("WARNING: concept name '" + curConcept.name + "' is already related to '" + name2Concept[curConcept.name] + "'. New related concept is '" + curConcept.concept + "'")
				}
				name2Concept[curConcept.name] = curConcept.concept;
			}

			PersistenceEngineFactory.getInstance().send_get(URIs.GET_IGADGETS, this, _loadIGadgetContextVars, _onError);
		}

		function _onError(transport, e) {
			var msg;
			if (e)
				msg = e;
			else
				msg = transport.status + " " + transport.statusText;

			alert ("Error receiving context manager data: " + msg);
		}

		
		PersistenceEngineFactory.getInstance().send_get('/ezweb/js/contextManager/concepts.json', this, _loadConcepts, _onError);

		// ****************
		// PUBLIC METHODS 
		// ****************
		ContextManager.prototype.addInstance = function (gadget) {
			if ((gadget == null) || !(gadget instanceof Gadget))
				return; // TODO exception

			var cVars = gadget.getTemplate().getContextVars();
			for (var i = 0; i < cVars.length; i++){
				var cVar = cVars[i];
				cname2IVars[conceptName] = cVar;
				
				_setContextValue(cVar);
 			}
		}

		ContextManager.prototype.setConceptValue = function (concept, value) {
			concepts[concept].value = value; // This is the concept cache 'concepts[concept].value'
			var contextVar = varsWaitingValue[concept].pop();
			do{
				contextVar.setValue(value);
				contextVar = varsWaitingValue[concept].pop();
			}while (contextVar != null)
				
		}
	}


	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new ContextManager();
         	}
         	return instance;
       	}
	}
	
}();

