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


function WorkSpace (workSpaceState) {

	// ****************
	// CALLBACK METHODS
	// ****************

	// we need to load context data before workspace data. Otherwise, loadWorkSpace wont
	// have all necessary data and will throw an exception. 
	// This is a callback function to process AJAX requests, so must be public.
	var loadContextData = function (transport) {
		var conceptsJson = eval ('(' + transport.responseText + ')');
		this.contextInfo = conceptsJson.concepts;
		
		// Now, we can load workspace data
		var workSpaceUrl = URIs.GET_POST_WIRING.evaluate({'id': this.workSpaceState.id});
		PersistenceEngineFactory.getInstance().send_get(workSpaceUrl, this, loadWorkSpace, onError); 
	}


	// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
	var loadWorkSpace = function (transport) {
		// JSON-coded iGadget-variable mapping
		var response = transport.responseText;
		this.workSpaceGlobalInfo = eval ('(' + response + ')');
		
		// Name of the wiring layer regarding this workspace
		this.wiringLayer = "wiring_" + this.workSpaceState.name;
		
		this.wiring = new Wiring(this.workSpaceGlobalInfo);
		this.wiringInterface = new WiringInterface(this.wiringLayer, this.wiring);
		
		this.varManager = new VarManager(this.workSpaceGlobalInfo);
		this.contextManager = new ContextManager(this, this.workSpaceGlobalInfo, this.contextInfo);
		
		var tabs = this.workSpaceGlobalInfo['workspace']['tabList'];
		
		var visibleTabName = null;
		
		if(tabs.length>0){
			visibleTabName = tabs[0].name;
			for (var i=0; i<tabs.length; i++) {
				var tab = tabs[i];
				this.tabInstances[tab.name] = new Tab(tab, this);
				
				if (tab.visible == 'true') {
					visibleTabName = tab.name;
				}
			}
		}
		
		this.loaded = true;
		
		this.setTab(visibleTabName);
		
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
		msg = interpolate(gettext("Error retreiving workspace data: %(errorMsg)s."),
		                          {errorMsg: msg}, true);
		OpManagerFactory.getInstance().log(msg);
	}

	// ****************
	// PUBLIC METHODS
	// ****************

    WorkSpace.prototype.getName = function () {
    	return this.workSpaceState.name;
	}
    
    WorkSpace.prototype.getWiring = function () {
    	return this.wiring;
	}
    
    WorkSpace.prototype.getVarManager = function () {
    	return this.varManager;
	}
	
	WorkSpace.prototype.getContextManager = function () {
    	return this.contextManager;
	}

	WorkSpace.prototype.downloadWorkSpaceInfo = function () {
		PersistenceEngineFactory.getInstance().send_get(URIs.GET_CONTEXT, this, loadContextData, onError);
	}
	
	WorkSpace.prototype.showWiring = function() {
		if (!this.loaded)
			return;
		
		this.hideAndUnmark();
		this.wiringInterface.show();
	}
	
	WorkSpace.prototype.hideAndUnmark = function() {
		if (!this.loaded)
			return;
		
		this.wiringInterface.hide();
		
		var tabList = this.tabInstances.keys();
		
		for (var i=0; i<tabList.length; i++) {
			var tab = this.tabInstances[tabList[i]];
			
			tab.hideAndUnmark();
		}
	}
		
	WorkSpace.prototype.hide = function() {
		if (!this.loaded)
			return;
		
		this.wiringInterface.hide();
		
		var tabList = this.tabInstances.keys();
		
		for (var i=0; i<tabList.length; i++) {
			var tab = this.tabInstances[tabList[i]];
			
			tab.hide();
		}
	}
	
	WorkSpace.prototype.show = function() {	
		if (!this.loaded)
			return;
		
		var tabList = this.tabInstances.keys();
		
		for (var i=0; i<tabList.length; i++) {
			var tab = this.tabInstances[tabList[i]];
			
			if (tab == this.visibleTab)
				tab.show();
			else
				tab.hideAndUnmark();
		}
	}
	
	WorkSpace.prototype.getTab = function(tabName) {
		if (!this.loaded)
			return;
		
		return this.tabInstances[tabName];
	}
	
	WorkSpace.prototype.setTab = function(tabName) {
		if (!this.loaded)
			return;
		
		this.visibleTab = this.tabInstances[tabName];
		this.showVisibleTab();
	}
	
	WorkSpace.prototype.getVisibleTab = function() {
		if (!this.loaded)
			return;
		
		return this.visibleTab;
	}
	
	WorkSpace.prototype.showVisibleTab = function() {
		this.hideAndUnmark();
		this.visibleTab.show();
	}
	
	WorkSpace.prototype.addIGadget = function(igadget) {
		var gadget = ShowcaseFactory.getInstance().getGadget(igadget.gadget.getId());
		this.varManager.addInstance(igadget, gadget.getTemplate());
		this.contextManager.addInstance(igadget, gadget.getTemplate());
		this.wiring.addInstance(igadget, gadget.getTemplate());
			
		//this.contextManagerModule.addInstance(igadget, gadget);
			
		this.getVisibleTab().getDragboard().showInstance(igadget);

		// The dragboard must be shown after an igadget insertion
		OpManagerFactory.getInstance().unMarkGlobalTabs();
		this.showVisibleTab();
	}
	    
    // *****************
    //  CONSTRUCTOR
    // *****************

	this.workSpaceState = workSpaceState;
	this.workSpaceGlobal = null;
	this.wiringInterface = null;
	this.contextInfo = null;
	this.varManager = null;
	this.tabInstances = new Hash();
	this.wiring = null;
	this.varManager = null;
	this.contextManager = null;
	this.loaded = false;
	this.wiringLayer = null;
	this.visibleTab = null;
	
}