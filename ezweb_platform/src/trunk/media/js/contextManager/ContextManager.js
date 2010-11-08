/* 
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */


function ContextManager (workspace_, workSpaceInfo_) {
	
	
	// ***********************
	// PRIVATED FUNCTIONS 
	// ***********************
	
	/**
	 * Adds all variables from workspace data model
	 */
	this._addContextVarsFromTemplate = function (iGadget, cVars, type) {
		var varManager = this._workspace.getVarManager();
		for (var i = 0; i < cVars.size(); i++) {
			var cVar = cVars[i];
			cVar.setVarManager(varManager);
			var conceptName = cVar.getConceptName();
			var relatedConcept = this._name2Concept[conceptName];
			if (relatedConcept != null && relatedConcept._type != type)
				relatedConcept = null;

			if (relatedConcept == null) {
				var msg = gettext("There is not any concept of type \"%(type)s\" called \"%(concept)s\", the value of the iGadget variable \"%(varName)s\" will be empty.");
				msg = interpolate(msg, {concept: conceptName, type: type, varName: cVar.getName()}, true);
				OpManagerFactory.getInstance().logIGadgetError(iGadget.getId(), msg, Constants.Logging.ERROR_MSG);
				continue;
			}
			relatedConcept.addIGadgetVar(cVar);
		}
	}

	// Loads all concept from workspace data model.
	this._loadConceptsFromWorkspace = function (workSpaceInfo_) {
		this._concepts = new Hash();
		this._name2Concept = new Hash();

		var conceptsJson = workSpaceInfo_['workspace']['concepts'];

		// Parses concepts json
		for (var i = 0; i < conceptsJson.length; i++) {
			var curConcept = conceptsJson[i];
			// Creates the concept
			var concept = new Concept(curConcept.concept, curConcept.type, curConcept.adaptor);
			this._concepts[curConcept.concept] = concept;

			// Sets the concept value
			if (curConcept.value != undefined) {
				concept._setInitialValue(curConcept.value)
			}

			// Relates the concept name to all its concept
			for (var j = 0; j < curConcept.names.length; j++) {
				var cname = curConcept.names[j];
				var oldConcept = this._name2Concept[cname]
				if (oldConcept != null) {
					var msg = gettext("WARNING: concept name '%(cname)s' is already related to '%(concept)s'. New related concept is '%(newConcept)s'.");
					msg = interpolate(msg, {cname: cname, concept: oldConcept, newConcept: curConcept.concept}, true);
					LogManagerFactory.getInstance().log(msg);
				}
				this._name2Concept[cname] = concept;
			}
		}
	}
	
	// Load igadget's context variables from workspace data model
	this._loadIGadgetContextVarsFromWorkspace = function (workSpaceInfo) {
		
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
						contextVar.setVarManager(this._workspace.getVarManager());
						var relatedConcept = this._name2Concept[currentVar.concept];
						if (relatedConcept) {
							if (currentVar.aspect !== relatedConcept._type) {
								var msg = gettext("There is not any concept of type \"%(type)s\" called \"%(concept)s\", the value of the iGadget variable \"%(varName)s\" will be empty.");
								msg = interpolate(msg,
									{concept: currentVar.concept,
									 type: relatedConcept._type,
									 varName: currentVar.name},
									true);
								OpManagerFactory.getInstance().logIGadgetError(currentIGadget.id, msg, Constants.Logging.ERROR_MSG);
							} else {
								relatedConcept.addIGadgetVar(contextVar);
							}
						}
						break;
					default:
						break;
					}
				}
			}
		}

		// Continues loading next module
		this._loaded = true;
	}

	// ****************
	// PUBLIC METHODS 
	// ****************
	
	ContextManager.prototype.addInstance = function (iGadget, template) {
		if (!this._loaded)
			return;

		if (template == null)
			return;

		this._addContextVarsFromTemplate(iGadget, template.getExternalContextVars(iGadget.getId()), Concept.prototype.EXTERNAL);
		this._addContextVarsFromTemplate(iGadget, template.getGadgetContextVars(iGadget.getId()), Concept.prototype.IGADGET);
	}

	ContextManager.prototype.iGadgetLoaded = function (iGadget) {
		if (!this._loaded)
			return;

		var iGadgetId = iGadget.getId();
		var keys = this._concepts.keys();
		for (var i = 0; i < keys.length; i++) {
			var concept = this._concepts[keys[i]];
			concept.propagateIGadgetVarValues(iGadget);
		}
	}

	ContextManager.prototype.iGadgetUnloaded = function (iGadget) {
		if (!this._loaded)
			return;

		var keys = this._concepts.keys();
		for (var i = 0; i < keys.length; i++) {
			var concept = this._concepts[keys[i]];
			if (concept._type !== Concept.prototype.IGADGET)
				continue;

			var ivar = concept.getIGadgetVar(iGadget.getId());
			if (ivar != null)
				ivar._clearHandler();
		}
	}

	ContextManager.prototype.removeInstance = function (iGadgetId_) {
		if (!this._loaded)
			return;

		var keys = this._concepts.keys();
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			this._concepts[key].deleteIGadgetVars(iGadgetId_);
		}
	}

	/**
	 * Notifies a value change on an platform context concept.
	 *
	 * @param {String} concept
	 * @param {} value
	 */
	ContextManager.prototype.notifyModifiedConcept = function (concept, value) {
		if (!this._loaded)
			return;

		if (!this._concepts[concept])
			return;

		this._concepts[concept].setValue(value);
	}

	/**
	 * Notifies a value change on an igadget context concept.
	 *
	 * @param {iGadget} iGadget
	 * @param {String} concept
	 * @param {} value
	 */
	ContextManager.prototype.notifyModifiedGadgetConcept = function (iGadget, concept, value) {
		if (!this._loaded)
			return;

		if (this._concepts[concept] == null)
			return;

		var ivar = this._concepts[concept].getIGadgetVar(iGadget.getId());
		if (ivar == null) {
			// Do nothing, igadget has not variables related to this concept
			return;
		}

		ivar.setValue(value);
	}

	ContextManager.prototype.getWorkspace = function () {
		return this._workspace;
	}


	ContextManager.prototype.unload = function () {
		var i, namekeys, conceptkeys;

		// Delete all concept names
		namekeys = this._name2Concept.keys();
		for (i = 0; i < namekeys.length; i++) {
			delete this._name2Concept[namekeys[i]];
		}
		delete this._name2Concept;

		// Delete all the concepts
		conceptkeys = this._concepts.keys();
		for (i = 0; i < conceptkeys.length; i++) {
			this._concepts[conceptkeys[i]].unload();
			delete this._concepts[conceptkeys[i]];
		}
		delete this._concepts;

		// Delete all the ContextManager attributes
		delete this._loaded;
		delete this._workspace;
	}


	// *********************************************
	// PRIVATE VARIABLES AND CONSTRUCTOR OPERATIONS
	// *********************************************

	this._loaded = false;
	this._concepts = new Hash();     // a concept is its adaptor an its value
	this._name2Concept = new Hash(); // relates the name to its concept
	this._workspace = workspace_;
		
	// Load all igadget context variables and concepts (in this order!)
	this._loadConceptsFromWorkspace (workSpaceInfo_);
	this._loadIGadgetContextVarsFromWorkspace (workSpaceInfo_);
}