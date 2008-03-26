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
		var _loaded = false;
		var _concepts = new Hash();     // a concept is its adaptor an its value
		var _name2Concept = new Hash(); // relates the name to its concept
		
		// ***********************
		// PRIVATED FUNCTIONS 
		// ***********************
		
		this._addContextVarsFromTemplate = function (cVars, type_) {
			for (var i = 0; i < cVars.length; i++){
				var cVar = cVars[i];
				if (_name2Concept[cVar.getConceptName()] == null){
					alert (gettext("Context variable") + " [" + cVar.getName() + "] " + gettext("without related concept. Its value cannot be established"));
					return;
				}
				var relatedConcept = _concepts[_name2Concept[cVar.getConceptName()]];
				relatedConcept.setType(type_);
				relatedConcept.addIGadgetVar(cVar);							
 			}
		}
		

		/**
		 * Loads data from persistenceEngine
		 */
		function _loadConcepts(receivedData) {
			
			// Start to load igadget's context variables
			function _loadIGadgetContextVars(receivedData) {

				var iGadgetsJson = eval ('(' + receivedData.responseText + ')');
				iGadgetsJson = iGadgetsJson.iGadgets;
			
				for (var i = 0; i < iGadgetsJson.length; i++) {
					var currentIGadget = iGadgetsJson[i];
				
					for (var j = 0; j < currentIGadget.variables.length; j++) {
						var currentVar = currentIGadget.variables[j];

						switch (currentVar.aspect) {
							case Variable.prototype.EXTERNAL_CONTEXT:
							case Variable.prototype.GADGET_CONTEXT:
								var contextVar = new ContextVar(currentIGadget.id, currentVar.name, currentVar.concept)
								var relatedConcept = _concepts[_name2Concept[currentVar.concept]];
								relatedConcept.setType(currentVar.aspect);
								relatedConcept.addIGadgetVar(contextVar);								
								break;
							default:
								break;
						}
					}
				}

				// Continues loading next module								
				_loaded = true;
				OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.CONTEXT_MANAGER);

			}
			
			function _onError(transport, e) {
				var msg;
				if (e) {
					msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
						                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
								  true);
				} else {
					msg = transport.status + " " + transport.statusText;
				}
				
				OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.CONTEXT_MANAGER);
			}
			
			// Start to load concepts
			var conceptsJson = eval ('(' + receivedData.responseText + ')');
			conceptsJson = conceptsJson.concepts; 

			_concepts = new Hash();
			_name2Concept = new Hash();

			for (var i = 0; i < conceptsJson.length; i++) {
				var curConcept = conceptsJson[i];
				// Creates the concept
				var concept = new Concept(curConcept.concept, curConcept.adaptor);
				_concepts[curConcept.concept] = concept; 

				// Relates the concept name to all its concept
				for (var j = 0; j < curConcept.names.length; j++) {
					var cname = curConcept.names[j];
					
					if (_name2Concept[cname] != null){
						alert (gettext("WARNING: concept name") + " '" + cname + "' " + gettext("is already related to") + " '" + _name2Concept[cname] + "'. " + gettext("New related concept is") + " '" + curConcept.concept + "'");
					}
					_name2Concept[cname] = curConcept.concept;	
				}	
			}

			// Now, we need to load all igadget context variables from persistence system
			PersistenceEngineFactory.getInstance().send_get(URIs.GET_IGADGETS, this, _loadIGadgetContextVars, _onError);
		}

		function _onError(transport, e) {
			var msg;
			if (e) {
				msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
						                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
								  true);
			} else {
				msg = transport.status + " " + transport.statusText;
			}
			
			OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.CONTEXT_MANAGER);
		}
		
		PersistenceEngineFactory.getInstance().send_get(URIs.GET_CONTEXT, this, _loadConcepts, _onError);

		// ****************
		// PUBLIC METHODS 
		// ****************
		ContextManager.prototype.addInstance = function (iGadgetId, gadget) {
			if ((gadget == null) || !(gadget instanceof Gadget))
				return; // TODO exception

			var template = gadget.getTemplate();
			this._addContextVarsFromTemplate(template.getExternalContextVars(iGadgetId), Concept.prototype.EXTERNAL);
			this._addContextVarsFromTemplate(template.getGadgetContextVars(iGadgetId), Concept.prototype.IGADGET);
		}

		ContextManager.prototype.setConceptValue = function (concept, value) {
			_concepts[concept].setValue(value);
		}
		
		ContextManager.prototype.setGadgetConceptValue = function (igadgetid, concept, value) {
			_concepts[concept].getIGadgetVar(igadgetid).setValue(value);
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

