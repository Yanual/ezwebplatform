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


function ContextManager (workSpaceInfo) {
	
	
	// ***********************
	// PRIVATED FUNCTIONS 
	// ***********************
	
	// Adds all variables from workspace data model
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
	
	// Load igadget's context variables from workspace data model
	var _loadIGadgetContextVarsFromWorkspace = function (workSpaceInfo) {
		
		var tabs = workSpaceInfo['workspace']['tabList'];
		
		// Tabs in workspace
		for (var i=0; i<tabs.length; i++) {
			var currentTab = tabs[i]; 
			var igadgets = currentTab.igadgetList;
			
			// igadgets in tab
			for (var j=0; j<igadgets.length; j++) {
				var currentIGadget = igadgets[j];
				var variables = currentIGadget['variables'];
				
				// Variables of igadgets
				for (var k = 0; k < variables.length; k++) {
				var currentVar = variables[k];
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
		}

		// Continues loading next module								
		_loaded = true;
	}
	
	// ****************
	// CALLBACK METHODS 
	// ****************
	
	// Loads all concept from platform. 
	// This information is not in workspace data model!!
	var _loadConcepts = function (receivedData) {
		
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
		_loadIGadgetContextVarsFromWorkspace(_workSpaceInfo);
	}
	
	// Shows a error message
	var _onError = function (transport, e) {
		var msg;
		if (e) {
			msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
					                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
							  true);
		} else {
			msg = transport.status + " " + transport.statusText;
		}
	}
	
	// ****************
	// PUBLIC METHODS 
	// ****************
	
	ContextManager.prototype.addInstance = function (iGadgetId, gadget) {
		if (! _loaded)
		    return;
		
		if ((gadget == null) || !(gadget instanceof Gadget))
			return; // TODO exception

		var template = gadget.getTemplate();
		this._addContextVarsFromTemplate(template.getExternalContextVars(iGadgetId), Concept.prototype.EXTERNAL);
		this._addContextVarsFromTemplate(template.getGadgetContextVars(iGadgetId), Concept.prototype.IGADGET);
	}

//	ContextManager.prototype.setConceptValue = function (concept, value) {
//		if (! _loaded)
//		    return;
//			
//		_concepts[concept].setValue(value);
//	}
//	
//	ContextManager.prototype.setGadgetConceptValue = function (igadgetid, concept, value) {
//		if (! _loaded)
//		    return;
//			
//		_concepts[concept].getIGadgetVar(igadgetid).setValue(value);
//	}
	
	ContextManager.prototype.notifyModifiedConcept = function (igadgetid, concept, value) {
		if (! _loaded)
		    return;
			
		if (_concepts[concept])
			return;
			
		try{
			_concepts[concept].getIGadgetVar(igadgetid).setValue(value);	
		}catch(e){
			// Do nothing, igadget has not variables related to this concept
		}
	}
	
	
	

	// *********************************************
	// PRIVATE VARIABLES AND CONSTRUCTOR OPERATIONS
	// *********************************************

	var _loaded = false;
	var _concepts = new Hash();     // a concept is its adaptor an its value
	var _name2Concept = new Hash(); // relates the name to its concept
	
	// Temporary variables
	var _workSpaceInfo = workSpaceInfo;
	
	// Load all igadget context variables from persistence system
	PersistenceEngineFactory.getInstance().send_get(URIs.GET_CONTEXT, this, _loadConcepts, _onError);
	
	
}