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


var LayoutManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function LayoutManager () {
	        
	    // *********************************
		// PRIVATE VARIABLES 
		// *********************************
		
		// z-index levels	
			this.hideLevel = 1;
			this.showLevel = 2;
			
		// Global links managed by LayoutManager: {showcase, wiring}
		// Tabs are managed by WorkSpaces!! 
			this.showCaseLink = $('catalogue_link');
			this.wiringLink = $('wiring_link');
			
		// Container managed by LayOutManager: {showcase_tab}
		// Remaining containers managed by WorkSpaces!!
			this.showCase = $('showcase_container');
			this.logsConsole = $('logs_container');
			this.logsLink = $('logs_link');
		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		LayoutManager.prototype.resizeWrapper = function () {
			// We have to take into account the bottom margin and border widths.
			// Bottom margin = 4px
			// Border width = 2px => Top border + bottom border = 4px
			// Total 8px
			var newHeight=BrowserUtilsFactory.getInstance().getHeight();
			$("wrapper").setStyle({"height" : (newHeight - $("header").offsetHeight - 8) + "px"});

			var wrapperChilds = $('wrapper').childElements();
			var i;
			for (i=0;i<wrapperChilds.length;i++){
				wrapperChilds[i].setStyle({"height" : (newHeight - $("header").offsetHeight - 8) + "px"});
			}

			//TODO: redimensionar la capa que cubre todo
		}
		
		LayoutManager.prototype.unMarkGlobalTabs = function () {
			if (!this.showCaseLink) {
				this.showCaseLink = $('catalogue_link');
				this.showCase = $('showcase_container');
				
				this.logsConsole = $('logs_container');
				this.logsLink = $('logs_link');
				
				this.wiringLink = $('wiring_link');
			}
			
			this.showCaseLink.className = 'toolbar_unmarked';
			this.wiringLink.className = 'toolbar_unmarked';
			this.logsLink.className = 'toolbar_unmarked';
			
			this.hideShowCase();
			this.hideLogs();		

		}
		
		// Dragboard operations (usually called together with Tab operations)
		LayoutManager.prototype.hideDragboard = function(dragboard){
			dragboard.setStyle({'zIndex': this.hideLevel, 'visibility': 'hide'})
		}
		
		LayoutManager.prototype.showDragboard = function(dragboard){
			dragboard.setStyle({'zIndex': this.showLevel, 'visibility': 'visible'})
		}
		
		// Tab operations
		LayoutManager.prototype.unmarkTab = function(tab){
			tab.className = "tab"
		}
		
		LayoutManager.prototype.markTab = function(tab){
			tab.className = "tab current"
		}
		
		// ShowCase operations
		LayoutManager.prototype.showShowCase = function(){
			this.showCaseLink.className = 'toolbar_marked';
			this.showCase.setStyle({'zIndex': this.showLevel, 'display': 'block', 'visibility': 'visible'});
		}
		
		LayoutManager.prototype.hideShowCase = function(){
			this.showCase.setStyle({'zIndex': this.hideLevel, 'visibility': 'hidden'});
		}
		
		// Logs operations
		LayoutManager.prototype.showLogs = function(){
			this.logsConsole.setStyle({'zIndex': this.showLevel, 'display': 'block', 'visibility': 'visible'});
		}
		
		LayoutManager.prototype.hideLogs = function(){
			this.logsConsole.setStyle({'zIndex': this.hideLevel, 'visibility': 'hidden'});
		}
		
		//Wiring operations
		LayoutManager.prototype.showWiring = function(wiring){
			wiring.setStyle({'zIndex' : this.showLevel, 'display': 'block', 'visibility': 'visible'});
			this.wiringLink.className = "toolbar_marked";
		}
		
		LayoutManager.prototype.hideWiring = function(wiring){
			wiring.setStyle({'zIndex' : this.hideLevel, 'visibility': 'hidden'});
		}
		
	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new LayoutManager();
         	}
         	return instance;
       	}
	}
	
}();
