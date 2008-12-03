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


var OpManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function OpManager () {
	        
	    // ****************
		// CALLBACK METHODS 
		// ****************
		
		var loadEnvironment = function (transport) {
			// JSON-coded user tabspaces
			var response = transport.responseText;
			var workSpacesStructure = eval ('(' + response + ')');

			var workSpaces = workSpacesStructure.workspaces;

			for (var i = 0; i<workSpaces.length; i++) {
			    var workSpace = workSpaces[i];
			    
			    this.workSpaceInstances[workSpace.id] = new WorkSpace(workSpace);

			    if (workSpace.active == "true") {
			    	this.activeWorkSpace=this.workSpaceInstances[workSpace.id];
			    }
			    
			}
			
			// set handler for workspace options button
			Event.observe($('ws_operations_link'), 'click', function(e){e.target.blur();LayoutManagerFactory.getInstance().showDropDownMenu('workSpaceOps', this.activeWorkSpace.menu, Event.pointerX(e), Event.pointerY(e));}.bind(this));
			
			// Total information of the active workspace must be downloaded!
			this.activeWorkSpace.downloadWorkSpaceInfo();
		}
		
		var onError = function (transport, e) {
			var msg;
			try {
				if (e) {
					msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
					                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
					                  true);
				} else if (transport.responseXML) {
					msg = transport.responseXML.documentElement.textContent;
				} else {
					msg = "HTTP Error " + transport.status + " - " + transport.statusText;
				}
				msg = interpolate(gettext("Error loading EzWeb Platform: %(errorMsg)s."),
				                          {errorMsg: msg}, true);
				LogManagerFactory.getInstance().log(msg);
			} catch (e) {
			}

			alert (gettext("Error loading EzWeb Platform"));
		}
		
		/*****WORKSPACE CALLBACK***/
		var createWSSuccess = function(transport){
			var response = transport.responseText;
			var wsInfo = eval ('(' + response + ')');
			this.workSpaceInstances[wsInfo.workspace.id] = new WorkSpace(wsInfo.workspace);
			this.changeActiveWorkSpace(this.workSpaceInstances[wsInfo.workspace.id]);
			LayoutManagerFactory.getInstance().hideCover();
		}
		
		var createWSError = function(transport, e){
			if (transport.responseXML) {
				msg = transport.responseXML.documentElement.textContent;
			} else {
				msg = "HTTP Error " + transport.status + " - " + transport.statusText;
			}

			msg = interpolate(gettext("Error creating a workspace: %(errorMsg)s."), {errorMsg: msg}, true);
			LogManagerFactory.getInstance().log(msg);
		
		}

		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		
		// Singleton modules
		this.showcaseModule = null;
		this.contextManagerModule = null;
		this.catalogue = null;
		this.logs = null;
		this.persistenceEngine = PersistenceEngineFactory.getInstance();
		
		this.loadCompleted = false;
		this.firstAccessToTheCatalogue = true;
		this.catalogueIsCurrentTab = false;
		
		// Variables for controlling the collection of wiring and dragboard instances of a user
		this.workSpaceInstances = new Hash();
		this.activeWorkSpace = null;

		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.showCatalogue = function () {
			if (!this.activeWorkSpace.isValid()) {
				//Nothing to do!
				return;
			}
			
			UIUtils.repaintCatalogue=true;
			UIUtils.sendPendingTags();
			
			if (LayoutManagerFactory.getInstance().getCurrentViewType() == 'catalogue') { 
				this.catalogueIsCurrentTab = true;
			}
			this.catalogue.show();
				
			this.activeWorkSpace.getVisibleTab().markAsCurrent();
			
			// Load catalogue data!
			if (this.firstAccessToTheCatalogue || this.catalogueIsCurrentTab)
			{
			    this.catalogue.initCatalogue();
			    this.firstAccessToTheCatalogue = false;
			    this.catalogueIsCurrentTab = false;
			} else {
			    UIUtils.repaintCatalogue=false;
			}
			
		}
		

		OpManager.prototype.showLogs = function () {
			if(this.activeWorkSpace && this.activeWorkSpace.getVisibleTab())
				this.activeWorkSpace.getVisibleTab().unmark();
			
			LogManagerFactory.getInstance().show();
		}
		
		OpManager.prototype.clearLogs = function () {
			LogManagerFactory.getInstance().reset();
			LayoutManagerFactory.getInstance().clearErrors();
		}
		
		OpManager.prototype.sendBufferedVars = function () {
			this.activeWorkSpace.sendBufferedVars();
		}
		
		OpManager.prototype.changeActiveWorkSpace = function (workSpace) {
			if(this.activeWorkSpace != null){
				this.activeWorkSpace.unload();
			}
			
		    this.activeWorkSpace = workSpace;
		    
		    this.activeWorkSpace.downloadWorkSpaceInfo();
		}

		OpManager.prototype.addInstance = function (gadgetId) {
		    if (!this.loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			this.activeWorkSpace.getVisibleTab().getDragboard().addInstance(gadget);
		}

		OpManager.prototype.unsubscribeServices = function (gadgetId) {
			var unsubscribeOk = function (transport) {
				
			}
			
			var unsubscribeError = function (transport) {
				
			}
			
			unsubscribe_url += "?igadget=";
			unsubscribe_url += gadgetId;
			unsubscribe_url += "&user=";
			unsubscribe_url += ezweb_user_name;

			var params = {'method': "GET", 'url':  unsubscribe_url}; 
			
			this.persistenceEngine.send_post("/proxy", params, this, unsubscribeOk, unsubscribeError);
		}

		OpManager.prototype.cancelServices = function (gadgetId) {
			var cancelOk = function (transport) {

			}
			
			var cancelError = function (transport) {

			}
			
			var cancel_url = URIs.HOME_GATEWAY_DISPATCHER_CANCEL_URL;
			
			cancel_url += "?igadget=";
			cancel_url += gadgetId;
			cancel_url += "&user=";
			cancel_url += ezweb_user_name;
			
			var params = {'method': "GET", 'url':  cancel_url};
			
			this.persistenceEngine.send_post("/proxy", params, this, cancelOk, cancelError);
		}
		
		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!this.loadCompleted)
				return;
			this.activeWorkSpace.removeIGadget(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    this.activeWorkSpace.getWiring().sendEvent(gadget, event, value);
		}

		OpManager.prototype.loadEnviroment = function () {
			LayoutManagerFactory.getInstance().resizeWrapper();
			// First, global modules must be loades (Showcase, Catalogue)
			// Showcase is the first!
			// When it finish, it will invoke continueLoadingGlobalModules method!
			this.showcaseModule = ShowcaseFactory.getInstance();
			this.showcaseModule.init();
			this.logs = LogManagerFactory.getInstance();
		}

		OpManager.prototype.igadgetLoaded = function (igadgetId) {
			this.activeWorkSpace.igadgetLoaded(igadgetId);
		}
				
		OpManager.prototype.showActiveWorkSpace = function () {
			var workSpaceIds = this.workSpaceInstances.keys();
			var disabledWorkSpaces= [];
			var j=0;
			for (var i=0; i<workSpaceIds.length; i++) {
				var workSpace = this.workSpaceInstances[workSpaceIds[i]];
				if (workSpace != this.activeWorkSpace) {
					disabledWorkSpaces[j] = workSpace;					
					j++;
				}
				
			}
			
			this.activeWorkSpace.show();
			LayoutManagerFactory.getInstance().refreshChangeWorkSpaceMenu(this.activeWorkSpace, disabledWorkSpaces);
			LayoutManagerFactory.getInstance().refreshMergeWorkSpaceMenu(this.activeWorkSpace, disabledWorkSpaces);
		}
		
		OpManager.prototype.continueLoadingGlobalModules = function (module) {
		    // Asynchronous load of modules
		    // Each singleton module notifies OpManager it has finished loading!
		    
		    if (module == Modules.prototype.SHOWCASE) {
		    	this.catalogue = CatalogueFactory.getInstance();
		    	return;
		    }
		    
		    if (module == Modules.prototype.CATALOGUE) {
		    	// All singleton modules has been loaded!
		    	// It's time for loading tabspace information!
		    	this.loadActiveWorkSpace();
		    	return;
		    }
		    
		    if (module == Modules.prototype.ACTIVE_WORKSPACE) {
		    	this.loadCompleted = true;
		    	this.showActiveWorkSpace(this.activeWorkSpace);
//		    	this.changeActiveWorkSpace(this.activeWorkSpace);
				//ezweb fly
				if(!BrowserUtilsFactory.getInstance().isIE()){
					var s = document.createElement('style');
					s.type = "text/css";
		            s.innerHTML = '.container { background:#E0E0E0 url(/ezweb/init.dat) no-repeat scroll center bottom;}';
		            var h = document.getElementsByTagName("head")[0];
        		    h.appendChild(s);
				}//TODO: for IE try: document.createStyleSheet() and addRule()
		    	LayoutManagerFactory.getInstance().resizeWrapper();
		    	return;
		    }
		}

		OpManager.prototype.loadActiveWorkSpace = function () {
		    // Asynchronous load of modules
		    // Each singleton module notifies OpManager it has finished loading!

		    this.persistenceEngine.send_get(URIs.GET_POST_WORKSPACES, this, loadEnvironment, onError)   
		}
	
		OpManager.prototype.logIGadgetError = function(iGadgetId, msg, level) {
			var iGadget = this.activeWorkSpace.getIgadget(iGadgetId);
			if (iGadget == null) {
				var msg2 = gettext("Some pice of code tried to notify an error in the iGadget %(iGadgetId)s when it did not exist or it was not loaded yet. This is an error in EzWeb Platform, please notify it.\nError Message: %(errorMsg)s");
				msg2 = interpolate(msg2, {iGadgetId: iGadgetId, errorMsg: msg}, true);
				this.logs.log(msg2);
				return;
			}

			var gadgetInfo = iGadget.getGadget().getInfoString();
			msg = msg + "\n" + gadgetInfo;

			this.logs.log(msg, level);
			iGadget.notifyError();
		}

		//Operations on workspaces
		
		OpManager.prototype.workSpaceExists = function (newName){
			var workSpaceValues = this.workSpaceInstances.values();
			for(var i=0;i<workSpaceValues.length;i++){
			if(workSpaceValues[i].workSpaceState.name == newName)
				return true;
			}
			return false;
		}

		OpManager.prototype.addWorkSpace = function (newName) {
			var o = new Object;
			o.name = newName;
			var wsData = Object.toJSON(o);
			var params = {'workspace': wsData};
			PersistenceEngineFactory.getInstance().send_post(URIs.GET_POST_WORKSPACES, params, this, createWSSuccess, createWSError);

		}
		
		OpManager.prototype.unloadWorkSpace = function(workSpaceId){		
			//Unloading the Workspace
			this.workSpaceInstances[workSpaceId].unload();
			
			// Removing reference 
			//this.workSpaceInstances.remove(workSpaceId);
		}
		
		OpManager.prototype.removeWorkSpace = function(workSpaceId){
			if(this.workSpaceInstances.keys().length <= 1){
				var msg;			
				msg = "there must be one workspace at least";
				msg = interpolate(gettext("Error removing workspace: %(errorMsg)s."), {errorMsg: msg}, true);
				
				LogManagerFactory.getInstance().log(msg);
				LayoutManagerFactory.getInstance().hideCover();
				return false;
			}
			
			// Removing reference 
			this.workSpaceInstances.remove(workSpaceId);
				
			//set the first workspace as current (and unload the former)
			this.changeActiveWorkSpace(this.workSpaceInstances.values()[0]);
			
			return true;
		}


	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new OpManager();
         	}
         	return instance;
       	}
	}
	
}();

