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

/**
 * @author aarranz
 */
function Dragboard(tab, workSpace, dragboardElement) {
	// *********************************
	// PRIVATE VARIABLES
	// *********************************
	this.loaded = false;
	this.currentCode = 1;

	// HTML Elements
	this.dragboardElement = $('dragboard');
	this.tabNameElement = $('tab_name');
	this.barElement = $('bar');
	
	//Atributes
	this.iGadgets = new Hash();
	this.tab = tab;
	this.tabId = tab.tabInfo.id;
	this.workSpace = workSpace;
	this.workSpaceId = workSpace.workSpaceState.id;
	
	this.visibleIGadget=null;
	
	// ****************
	// PUBLIC METHODS 
	// ****************
	
	Dragboard.prototype.updateTab = function () {
		//update the interface
		this.tabNameElement.update(this.tab.tabInfo.name);
		//update the internal data
		this.workSpace.updateVisibleTab(this.tab.index);
	}

	Dragboard.prototype.paint = function (iGadgetId) {
		this.setVisibleIGadget(iGadgetId);
		
		//update the tab name (the internal data is already up-to-date)
		this.updateTab();
		
		//paints the visible igadget
		if (this.visibleIGadget)
			this.visibleIGadget.paint();
			
		if (OpManagerFactory.getInstance().visibleLayer!="dragboard"){
			//Paints the dragboard and the visibleIGadget and hide the gadget menu
			this.workSpace.hide();
			this.dragboardElement.setStyle({display: "block"});
			//slide(false, this.dragboardElement);
			
			//show the bar element
			this.barElement.setStyle({display: "block"});
		}
	}
	
	Dragboard.prototype.paintRelatedIGadget = function (iGadgetId) {
		var tabId = this.getIGadget(iGadgetId).getTabId();
		var tabIndex = this.workSpace.tabView.getTabIndexById(tabId);
		if (tabIndex != null){ // the gadget-tab is already visible
			this.setVisibleIGadget(iGadgetId);
			this.workSpace.tabView.set('activeTab', this.workSpace.tabView.getTab(tabIndex));
		}
		else
			this.paint(iGadgetId)
	}
	
	Dragboard.prototype.hide = function () {
		//hide and clean the dragboard layer
		this.dragboardElement.setStyle({display: "none"});
		
		//clean the igadget
		if (this.visibleIGadget)
			this.visibleIGadget =  null;
		
		//clean the bar and the content
		this.workSpace.tabView.clear();
		this.barElement.setStyle({display: "none"});
	}
	

	Dragboard.prototype.markRelatedIgadget = function(iGadgetId){
		$("related_"+iGadgetId).addClassName("active");
		
		// highlight related tabs
		var igadget = this.getIGadget(iGadgetId);
		if (igadget){
			var tabId = igadget.getTabId();			
			var tabIndex = this.workSpace.tabView.getTabIndexById(tabId);
			if (tabIndex != null){ // the tab is already visible
				this.workSpace.tabView.getTab(tabIndex).set('highlight', true);
			}
		}		
	}
	
	/**
	 * Removes the mark on the related igadget. It has to be called at least:
	 * - when the user clicks on the tab containing that igadget
	 * - when the user clicks on the related gadget icon
	 */
	Dragboard.prototype.unmarkRelatedIgadget = function(iGadgetId){		
		var r = $("related_"+iGadgetId);
		if (r){
			r.removeClassName("active");
		}
	}
	
	Dragboard.prototype.parseTab = function(tabInfo) {
		var curIGadget, position, width, height, igadget, gadget, gadgetid, minimized;

		var opManager = OpManagerFactory.getInstance();

		this.currentCode = 1;
		this.iGadgets = new Hash();

		// For controlling when the igadgets are totally loaded!
		this.igadgets = tabInfo.igadgetList;
		for (var i = 0; i < this.igadgets.length; i++) {
			curIGadget = this.igadgets[i];
			
			// Parse gadget id
			gadgetid = curIGadget.gadget.split("/");
			gadgetid = gadgetid[2] + "_" + gadgetid[3] + "_" + gadgetid[4];
			// Get gadget model
			gadget = ShowcaseFactory.getInstance().getGadget(gadgetid);

			// Create instance model
			igadget = new IGadget(gadget, curIGadget.id, curIGadget.code, curIGadget.name, this);
			this.iGadgets[curIGadget.id] = igadget;

			if (curIGadget.code >= this.currentCode)
				this.currentCode =  curIGadget.code + 1;
		}
		this.loaded = true;
	}

	Dragboard.prototype.igadgetLoaded = function (iGadgetId) {
	    //DO NOTHING
	}
	
	Dragboard.prototype.destroy = function () {
		var keys = this.iGadgets.keys();
		//disconect and delete the connectables and variables of all tab iGadgets
		for (var i = 0; i < keys.length; i++) {
			this.workSpace.removeIGadgetData(keys[i]);
			delete this.iGadgets[keys[i]];
		}
		//TODO: have all references been removed?,delete the object
	}

	Dragboard.prototype.saveConfig = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		try {
			igadget.saveConfig();

			this.setConfigurationVisible(igadget.getId(), false);
		} catch (e) {
		}
	}

	Dragboard.prototype.showInstance = function (igadget) {
		igadget.paint(this.dragboardElement, this.dragboardStyle);
	}

	Dragboard.prototype.getIGadgets = function() {
		return this.iGadgets.values();
	}

	Dragboard.prototype.getIGadget = function (iGadgetId) {
		return this.iGadgets[iGadgetId];
	}

	Dragboard.prototype.getWorkspace = function () {
		return this.workSpace;
	}
	
	Dragboard.prototype.getVisibleIGadget = function () {
		return this.visibleIGadget;
	}
	
	Dragboard.prototype.setVisibleIGadget = function (iGadgetId) {
		this.visibleIGadget = this.getIGadget(iGadgetId);
		this.unmarkRelatedIgadget(iGadgetId);
		this.updateTab();
	}
	
	// *******************
	// INITIALIZING CODE
	// *******************

	this.parseTab(tab.tabInfo);
}