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
				
    // ****************
    // PUBLIC METHODS
    // ****************
	
	Tab.prototype.hideAndUnmark = function () {
		this.hide();
		LayoutManagerFactory.getInstance().unmarkTab(this.tabHTMLElement);
	}
	
	Tab.prototype.hide = function () {
		LayoutManagerFactory.getInstance().hideDragboard(this.dragboardElement);
	}

	Tab.prototype.show = function () {

		LayoutManagerFactory.getInstance().showDragboard(this.dragboardElement);

	    this.dragboard.recomputeSize();
	    LayoutManagerFactory.getInstance().markTab(this.tabHTMLElement);
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
	this.tabName = "tab_" + this.workSpace.workSpaceState.name + "_" + this.tabInfo.name;
	
	// Tab creation
    var tabSection = $("tab_section");
    var tabHTML = "<span>" + this.tabInfo.name + "</span>";
    
    new Insertion.Top(tabSection, tabHTML);
    
	this.tabHTMLElement =  tabSection.firstDescendant();
	
	this.tabHTMLElement.setAttribute('id', this.tabName);
	
	var opManagerInvocation = 'OpManagerFactory.getInstance().changeVisibleTab("' + this.tabInfo.name + '");';

	Event.observe(this.tabHTMLElement, 'click', function(){OpManagerFactory.getInstance().changeVisibleTab(this.tabInfo.name);}.bind(this)); //W3C and IE compliant
	
    // Dragboard layer creation
    var dragboardHTML = $("dragboard_template").innerHTML;
    var wrapper = $("wrapper");
    
    new Insertion.Top(wrapper, dragboardHTML);
    
    this.dragboardElement = wrapper.firstDescendant();
         
    this.dragboardElement.setAttribute('id', this.dragboardLayerName);
    this.dragboardElement.setStyle({'display': 'block'});    
                	
	this.dragboard = new Dragboard(this, this.workSpace, this.dragboardElement);
	
	this.variable = new RVariable("tab_"+this.tabInfo.name, null, this.tabInfo.name, Variable.prototype.TAB, this, null);
	
	this.connectable = new wTab(this.variable, "tab_"+this.tabInfo.name);
	
	workSpace.getVarManager().addWorkspaceVariable("tab_"+this.tabInfo.name, this.variable);
					
}
