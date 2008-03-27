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
		
		var tabs = this.workSpaceGlobalInfo['workspace']['tabList'];
		
		for (var i=0; i<tabs.length; i++) {
			var tab = tabs[i];
			this.tabInstances[tab.name] = new Tab(tab, this.workSpaceState.name);
			
			if (tab.visible == 'true') {
				this.visibleTab = this.tabInstances[tab.name];
			}
		}
		
		OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.ACTIVE_WORKSPACE);
    }
		
    var onError = function (transport) {
		// JSON-coded iGadget-variable mapping
		alert("error TabSpace GET");
    }
	
    // ****************
    // PUBLIC METHODS
    // ****************

	WorkSpace.prototype.downloadWorkSpaceInfo = function () {
		var workSpaceUrl = URIs.GET_POST_WIRING.evaluate({'id': this.workSpaceState.pk});
		
		PersistenceEngineFactory.getInstance().send_get(workSpaceUrl, this, loadWorkSpace, onError);
	}
	
	WorkSpace.prototype.unmarkCommonTabs = function() {
		$("wiring_tab").className = "tab";
		$("showcase_tab").className = "tab";
	}
	
	WorkSpace.prototype.showWiring = function() {
		this.hide();
		this.wiringInterface.show();
	}
	
	WorkSpace.prototype.hide = function() {
		this.unmarkCommonTabs();
		
		var tabList = this.tabInstances.keys();
		
		for (var i=0; i<tabList.length; i++) {
			var tab = this.tabInstances[tabList[i]];
			
			tab.hide();
		}
	}
	
	WorkSpace.prototype.show = function() {
		this.unmarkCommonTabs();
		
		var tabList = this.tabInstances.keys();
		
		for (var i=0; i<tabList.length; i++) {
			var tab = this.tabInstances[tabList[i]];
			
			tab.show();
		}
	}
	
	WorkSpace.prototype.setTab = function(tabName) {
		this.unmarkCommonTabs();
		
		this.visibleTab = this.tabInstances[tabName];
		this.hide();
		this.visibleTab.show();
	}
	
	WorkSpace.prototype.getVisibleTab = function(tabName) {
		return this.visibleTab;
	}
	    
    // *****************
    //  CONSTRUCTOR
    // *****************

	this.workSpaceState = workSpaceState;
	this.workSpaceGlobal = null;
	this.tabInstances = new Hash();
	this.wiring = null;
	this.loaded = false;
	this.wiringLayer = null;
	this.visibleTab = null;
}     	