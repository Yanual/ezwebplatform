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


function WorkSpace (workSpaceState) {

	// ****************
	// CALLBACK METHODS
	// ****************

	// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
	var loadWorkSpace = function (transport) {
		// JSON-coded iGadget-variable mapping
		var response = transport.responseText;
		this.workSpaceGlobalInfo = eval ('(' + response + ')');

		this.varManager = new VarManager(this);
		
		var tabs = this.workSpaceGlobalInfo['workspace']['tabList'];

		var visibleTabId = null;

		if (tabs.length>0) {
			for (var i=0; i<tabs.length; i++) {
				var tab = tabs[i];
				this.tabInstances.push(new Tab(tab, this, i));
				
				if (tab.visible == 'true') {
					this.visibleTabIndex = i;
				}
			}
		}
		this.contextManager = new ContextManager(this, this.workSpaceGlobalInfo);
		this.wiring = new Wiring(this, this.workSpaceGlobalInfo);

		this.loaded = true;

		//set the visible tab. It will be displayed as current tab afterwards
		this.visibleTab = this.tabInstances[this.visibleTabIndex];
		

		OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.ACTIVE_WORKSPACE);
	}

	var onError = function (transport, e) {
		var msg;
		if (e) {
			msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
 			                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
			                  true);
		} else {
			msg = transport.status + " " + transport.statusText;
		}
		alert(msg);
	}
	
	
	// ****************
	// PUBLIC METHODS
	// ****************
	
	WorkSpace.prototype.igadgetLoaded = function(igadgetId) {
		//TODO: propagate only the values that affect to the Gadget with iGadgetId as identifier
		// in other case, this function always propagate the variable value to all the gadgets and there are two problems:
		// - there are non-instantiated gadgets -> the handler doesn't exist
		// - the instantiated gadgets will re-execute their handlers
		
		if (!this.igadgetIdsLoaded.elementExists(igadgetId)){ //to prevent from propagating unnecessary initial values
 	    	this.igadgetIdsLoaded.push(igadgetId);
 	    	this.wiring.propagateInitialValues(true);
		}
	}
	
	WorkSpace.prototype.unload = function(){
		
		// After that, tab info is managed	
		for (var i=0; i<this.tabInstances.length; i++) {
			this.unloadTab(i);
		}
		this.tabInstances.length = 0;
		this.wiring.unload();
		this.contextManager.unload();
	}
	
	WorkSpace.prototype.unloadTab = function(tabId){
		var tab = this.tabInstances[tabId];
		
		this.varManager.removeWorkspaceVariable(tab.connectable.variable.id);
		
		tab.connectable.destroy();
		tab.destroy();
		
		this.visibleTab = null;
	}
	
	WorkSpace.prototype.removeIGadgetData = function(iGadgetId) {
			this.varManager.removeInstance(iGadgetId);
			this.wiring.removeInstance(iGadgetId);
			this.contextManager.removeInstance(iGadgetId);	
	}
	
	WorkSpace.prototype.sendBufferedVars = function () {
		this.varManager.sendBufferedVars();
	} 
    
    
    WorkSpace.prototype.getName = function () {
    	return this.workSpaceState.name;
	}
	
    WorkSpace.prototype.getId = function () {
    	return this.workSpaceState.id;
	}
    
    WorkSpace.prototype.getWiring = function () {
    	return this.wiring;
	}
	    
    WorkSpace.prototype.getVarManager = function () {
    	return this.varManager;
	}
	
	WorkSpace.prototype.getActiveDragboard = function() {
		return this.visibleTab.getDragboard();
	}
	
	
	WorkSpace.prototype.downloadWorkSpaceInfo = function () {
		var workSpaceUrl = URIs.GET_POST_WORKSPACE.evaluate({'id': this.workSpaceState.id});
		PersistenceEngineFactory.getInstance().send_get(workSpaceUrl, this, loadWorkSpace, onError);
	}
	
	
	WorkSpace.prototype.getIgadget = function(igadgetId) {
		for (var i = 0; i < this.tabInstances.length; i++) {
			var igadget = this.tabInstances[i].getDragboard().getIGadget(igadgetId);
			
			if (igadget)
				return igadget;
		}
	}
	
	WorkSpace.prototype.getIGadgets = function() {
		if (!this.loaded)
			return;

		var iGadgets = new Array();
		for (var i = 0; i < this.tabInstances.length; i++) {
			iGadgets = iGadgets.concat(this.tabInstances[i].getDragboard().getIGadgets());
		}

		return iGadgets;
	}
	
	WorkSpace.prototype.getRelatedIGadgets = function(iGadgetId) {
		var iGadgets = new Array();
		var dragboard = null;
		var igadget = null;
		var id=null;
		
		var iGadgetIds = this.wiring.getRelatedIgadgets(iGadgetId);		
		for (var j = 0; j < iGadgetIds.length; j++) {
			id = iGadgetIds[j];
			for (var i = 0; i < this.tabInstances.length; i++) {
				dragboard = this.tabInstances[i].getDragboard();
				igadget = dragboard.getIGadget(id);			
				if (igadget)
					iGadgets.push(igadget);
			}
		}
		return iGadgets;
	}
	
	/**** Display the IGadgets menu ***/
	WorkSpace.prototype.paint = function() {
		this.tabsContainerElement.update();
		//initialize the list of igadget loaded identifiers
		this.igadgetIdsLoaded = new Array();
		
		//Create a menu for each tab of the workspace and paint it as main screen.
		var scrolling = 0;
		var step = 0;
		if (document.body.getAttribute("orient") == "portrait")
			step = this.scrollPortrait;
		else
			step = this.scrollLandscape;
		
		for(var i=0;i<this.tabInstances.length;i++){
			this.tabInstances[i].show(scrolling, i);
			scrolling += step;
		}
		//show the menu
		this.tabsContainerElement.setStyle({display: "block"});
		
		window.scrollTo(this.visibleTabIndex * step, 1);
	}
	
	WorkSpace.prototype.hide = function() {
		this.tabsContainerElement.setStyle({display: "none"});
	}
	
	WorkSpace.prototype.show = function() {
		//initialize the list of igadget loaded identifiers
		delete this.igadgetIdsLoaded;
		this.igadgetIdsLoaded = new Array();
		
		//show the igadget list and hide the dragboard
		this.visibleTab.getDragboard().hide();
		this.tabsContainerElement.setStyle({display: "block"});
		var step = 0;
		if (document.body.getAttribute("orient") == "portrait")
			step = this.scrollPortrait;
		else
			step = this.scrollLandscape;
		window.scrollTo(this.visibleTabIndex * step, 1);
	}
	
	WorkSpace.prototype.getTab = function(tabId) {
		return this.tabInstances.getElementById(tabId);
	}
	
	WorkSpace.prototype.setTab = function(tab) {
		if (!this.loaded)
			return;
		this.visibleTab = tab;
		this.visibleTab.show();
		
	}
	
	WorkSpace.prototype.getVisibleTab = function() {
		if (!this.loaded)
			return;
		
		return this.visibleTab;
	}
	
	WorkSpace.prototype.getNumberOfTabs = function() {
		return this.tabInstances.length;
	}
	
	WorkSpace.prototype.updateVisibleTab = function(index) {
		if (this.visibleTabIndex != index) {
			this.visibleTabIndex = index;	
			this.visibleTab = this.tabInstances[this.visibleTabIndex];
		}
	}
	
	WorkSpace.prototype.updateLayout = function(orient) {
		//notify this to the ContextManager. The orient value may be "portrait" or "landscape".
		this.contextManager.notifyModifiedConcept(Concept.prototype.ORIENTATION, orient);
		//TODO: change the tab labels according to the orientation
		var step = 0;
		var scrolling = 0;
		if (orient=="portrait"){
			step = this.scrollPortrait;
			this.tabView.set("maxTabs", 3);
		}
		else{ //landscape
			step = this.scrollLandscape;
			this.tabView.set("maxTabs", 4);
		}
		for(var i=0;i<this.tabInstances.length;i++){
			this.tabInstances[i].updateLayout(scrolling);
			scrolling += step;
		}
		
		//set current scroll
		if (OpManagerFactory.getInstance().visibleLayer == "tabs_container")
			window.scrollTo(this.visibleTabIndex * step, 1);
		else
			window.scrollTo(0, 1);
	}
	
	WorkSpace.prototype.goTab = function(tab){
		// DO NOTHING -> to avoid modifying the varManager 
	}
	
	WorkSpace.prototype.tabExists = function(tabName){
		for(var i=0;i<this.tabInstances.length;i++){
			if(this.tabInstances[i].tabInfo.name == tabName)
				return true;
		}
		return false;
	}
	
	WorkSpace.prototype.showRelatedIgadget = function(iGadgetId, tabId){
		this.visibleTab = this.getTab(tabId);
		this.visibleTabIndex = this.tabInstances.indexOf(this.visibleTab);
		this.visibleTab.getDragboard().paintRelatedIGadget(iGadgetId);
	}

    // *****************
    //  CONSTRUCTOR
    // *****************

	this.workSpaceState = workSpaceState;
	this.workSpaceGlobal = null;
	this.varManager = null;
	this.tabInstances = new Array();
	this.wiring = null;
	this.varManager = null;
	this.loaded = false;
	this.visibleTab = null;
	this.visibleTabIndex = 0;
	
	this.tabView = new MYMW.ui.TabView("dragboard", { maxTabs : 3 });
	this.igadgetIdsLoaded = null;
	
	this.tabsContainerElement = $('tabs_container');
	//scrolling
	this.scrollPortrait = 320;
	this.scrollLandscape = 480;
	
}
