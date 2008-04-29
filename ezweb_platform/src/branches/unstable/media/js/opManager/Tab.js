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


function Tab (tabInfo, workSpace) {
				
	//CALLBACK METHODS
	var renameSuccess = function(transport){
		LayoutManagerFactory.getInstance().hideCover();
	}
	var renameError = function(transport, e){
				var msg;
		if (transport.responseXML) {
			msg = transport.responseXML.documentElement.textContent;
		} else {
			msg = "HTTP Error " + transport.status + " - " + transport.statusText;
		}

		msg = interpolate(gettext("Error renaming a tab, changes will not be saved: %(errorMsg)s."), {errorMsg: msg}, true);
		OpManagerFactory.getInstance().log(msg);
	}

	var deleteSuccess = function(transport){
		this.deleteHTMLElement();
		LayoutManagerFactory.getInstance().hideCover();
	}
	var deleteError = function(transport, e){
		var msg;
		if (transport.responseXML) {
			msg = transport.responseXML.documentElement.textContent;
		} else {
			msg = "HTTP Error " + transport.status + " - " + transport.statusText;
		}

		msg = interpolate(gettext("Error removing a tab: %(errorMsg)s."), {errorMsg: msg}, true);
		OpManagerFactory.getInstance().log(msg);
	}

    // ****************
    // PUBLIC METHODS
    // ****************

	Tab.prototype.updateInfo = function (tabName, visible){

		//If the server isn't working the changes will not be saved	
		this.tabInfo.name = tabName;
		this.tabNameHTMLElement.update(tabName);

		var tabUrl = URIs.TAB.evaluate({'workspace_id': this.workSpace.workSpaceState.id, 'tab_id': this.tabInfo.id});
		var o = new Object;
		o.name = tabName;
		if (visible !=null)
			o.visible = visible
		tabData = Object.toJSON(o);
		params = 'tab=' + tabData;
		PersistenceEngineFactory.getInstance().send_update(tabUrl, params, this, renameSuccess, renameError);
	}

	Tab.prototype.deleteTab = function() {
		if(this.workSpace.removeTab(this.tabInfo.id)==true){
			var tabUrl = URIs.TAB.evaluate({'workspace_id': this.workSpace.workSpaceState.id, 'tab_id': this.tabInfo.id});
			PersistenceEngineFactory.getInstance().send_delete(tabUrl, this, deleteSuccess, deleteError);		
		}
	}

	Tab.prototype.hideAndUnmark = function () {
		this.hideDragboard();
		LayoutManagerFactory.getInstance().unmarkTab(this.tabHTMLElement);

	}
	
	Tab.prototype.hideDragboard = function () {
		LayoutManagerFactory.getInstance().hideDragboard(this.dragboardElement);
	}

	Tab.prototype.show = function () {

		LayoutManagerFactory.getInstance().showDragboard(this.dragboardElement);

	    this.dragboard.recomputeSize();
	    this.markAsCurrent();
	    
	}
	Tab.prototype.markAsCurrent = function (){
		LayoutManagerFactory.getInstance().markTab(this.tabHTMLElement);
	}
	
	Tab.prototype.hide = function () {
		LayoutManagerFactory.getInstance().hideTab(this.tabHTMLElement);
		this.hideDragboard();
	}
	Tab.prototype.deleteHTMLElement = function () {
		Element.remove(this.tabHTMLElement);
	}
	
	Tab.prototype.go = function () {

		LayoutManagerFactory.getInstance().showDragboard(this.dragboardElement);

	    this.dragboard.recomputeSize();
	    LayoutManagerFactory.getInstance().goTab(this.tabHTMLElement);
	}

	Tab.prototype.getDragboard = function () {
		return this.dragboard;
	}

    // *****************
	//  PRIVATE METHODS
    // *****************
	
	// The name of the dragboard HTML elements correspond to the Tab name
	this.workSpace = workSpace;
	this.tabInfo = tabInfo;
	this.dragboardLayerName = "dragboard_" + this.workSpace.workSpaceState.name + "_" + this.tabInfo.name;
	this.tabName = "tab_" + this.workSpace.workSpaceState.id + "_" + this.tabInfo.id;
	
	// Tab creation
	
    var tabSection = $("tab_section");
    	var tabHTML = "<div><span>" + this.tabInfo.name + "</span></div>";
    
    new Insertion.Top(tabSection, tabHTML);

	this.tabHTMLElement =  tabSection.firstDescendant();
	
	this.tabHTMLElement.setAttribute('id', this.tabName);

	this.tabNameHTMLElement = this.tabHTMLElement.firstDescendant();
	//TODO change OpManager invocation when LayoutManager is written
	Event.observe(this.tabNameHTMLElement, 'click', function(){LayoutManagerFactory.getInstance().unMarkGlobalTabs(); this.workSpace.setTab(this);}.bind(this));

    // Dragboard layer creation
    var dragboardHTML = $("dragboard_template").innerHTML;
    var wrapper = $("wrapper");
    
    new Insertion.Top(wrapper, dragboardHTML);
    
    this.dragboardElement = wrapper.firstDescendant();
         
    this.dragboardElement.setAttribute('id', this.dragboardLayerName);
    this.dragboardElement.setStyle({'display': 'block'});    
                	
	this.dragboard = new Dragboard(this, this.workSpace, this.dragboardElement);
	
	this.variable = new RVariable("tab_"+this.tabInfo.name, null, this.tabInfo.name, Variable.prototype.TAB, this, null);
	
	this.connectable = new wTab(this.variable, "tab_"+this.tabInfo.name, this);
	
	workSpace.getVarManager().addWorkspaceVariable("tab_"+this.tabInfo.name, this.variable);
					
}
