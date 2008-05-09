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
			
		// current view: catalogue, dragboard, wiring, logs
			this.currentViewType = null;
			this.currentView = null;
			
		// Global links managed by LayoutManager: {showcase, wiring}
		// Tabs are managed by WorkSpaces!! 
			this.catalogueLink = $('catalogue_link');
			this.wiringLink = $('wiring_link');
			
		// Container managed by LayOutManager: {showcase_tab}
		// Remaining containers managed by WorkSpaces!!
			this.catalogue = CatalogueFactory.getInstance();
			this.logs = LogManagerFactory.getInstance();
			this.logsLink = $('logs_link');
			
		// Menu Layer	
			this.currentMenu = null;							//current menu (either dropdown or window)
			this.coverLayerElement = $('menu_layer');					//disabling background layer
			this.coverLayerEvent = function () {this.hideCover()}.bind(this);	//disabling layer onclick event (by default)
	
			this.menus = new Array();
		
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
			var newWidth = BrowserUtilsFactory.getInstance().getWidth();
			this.coverLayerElement.setStyle({"height" : newHeight + "px", "width": newWidth +"px"});
			
			//recalculate menu positions
			if(this.currentMenu){
				this.currentMenu.calculatePosition();
			}
			
		}
		
		LayoutManager.prototype.unMarkGlobalTabs = function () {
			if (!this.catalogue) {
				this.catalogueLink = $('catalogue_link');
				this.logsLink = $('logs_link');
				this.wiringLink = $('wiring_link');
			}
			
			this.catalogueLink.className = 'toolbar_unmarked';
			this.wiringLink.className = 'toolbar_unmarked';
			this.logsLink.className = 'toolbar_unmarked';
			
/*			this.hideShowCase();
			this.hideLogs();		
*/
		}

		/****VIEW OPERATIONS****/
		//hide an HTML Element
		LayoutManager.prototype.hideView = function (viewHTML){
			viewHTML.setStyle({'zIndex': this.hideLevel, 'visibility': 'hidden'});
		}
		
		LayoutManager.prototype.notifyError = function (labelContent){
			this.logsLink.innerHTML = labelContent;
			this.logsLink.setStyle({'display' : 'inline'});
		}
		
		// Tab operations
		LayoutManager.prototype.unmarkTab = function(tab, launcher, changeEvent, renameEvent){
			tab.className = "tab";
			//hide the launcher image for the drop down menu from the former current tab
			var tabOpsLauncher = $(launcher);
			tabOpsLauncher.setStyle({'display':'none'});
			Event.stopObserving(tab, 'click', renameEvent);
		   	Event.observe(tab, 'click', changeEvent);
		    tab.setStyle({'zIndex': this.showLevel, 'display':'block', 'visibility':'visible'});
			
		}
		
		LayoutManager.prototype.markTab = function(tab, launcher, renameHandler, changeHandler){
			if(tab.className != "tab current"){
				tab.className = "tab current";
			    var tabOpsLauncher = $(launcher);
			    tabOpsLauncher.setStyle({'display':'inline'});
		    	tab.setStyle({'zIndex': this.showLevel, 'display':'block', 'visibility':'visible'});
			}
			if(this.currentViewType == 'dragboard'){
				Event.stopObserving(tab, 'click', changeHandler);
   			   	Event.observe(tab, 'click', renameHandler);
			}else{
				Event.stopObserving(tab, 'click', renameHandler);
   			   	Event.observe(tab, 'click', changeHandler);
			}
		}
		
		LayoutManager.prototype.hideTab = function(tab){
			try{ //remove the launcher image for the drop down menu from the former current tab
				var tabOpsLauncher = $$('#'+tab.getAttribute('id')+' #tabOps_launcher');
				if(tabOpsLauncher.length>0){	
					tabOpsLauncher[0].setStyle({'display':'none'});
				}
			}catch (e){
				return;
			}
			tab.className = "tab";
			tab.setStyle({'zIndex': this.hideLevel, 'display':'none', 'visibility':'hidden'});
		}
		
		// Dragboard operations (usually called together with Tab operations)
		LayoutManager.prototype.showDragboard = function(dragboard){
			this.unMarkGlobalTabs();
			if(this.currentView != null){
				this.currentView.hide();
			}
		    this.currentView = dragboard;
		    this.currentViewType = 'dragboard';
			dragboard.dragboardElement.setStyle({'zIndex': this.showLevel, 'visibility': 'visible'})
		}
		
		// Catalogue operations
		LayoutManager.prototype.showCatalogue = function(){
			this.unMarkGlobalTabs();
			if(this.currentView != null){
				this.currentView.hide();
			}			
		    this.currentView = this.catalogue;
			this.currentViewType = 'catalogue';
			this.catalogueLink.className = 'toolbar_marked';
			this.catalogue.catalogueElement.setStyle({'zIndex': this.showLevel, 'display': 'block', 'visibility': 'visible'});
		}
				
		// Logs operations
		LayoutManager.prototype.showLogs = function(){
			this.unMarkGlobalTabs();
			if(this.currentView != null){
				this.currentView.hide();
			}				
		    this.currentView = this.logs;
			this.currentViewType = 'logs';
			this.logsLink.className = "toolbar_marked";			
			this.logs.logContainer.setStyle({'zIndex': this.showLevel, 'display': 'block', 'visibility': 'visible'});
		}
	
		//Wiring operations
		LayoutManager.prototype.showWiring = function(wiring){
			this.unMarkGlobalTabs();
			if(this.currentView != null){
				this.currentView.hide();
			}				
		    this.currentView = wiring;			
			this.currentViewType = 'wiring';
			this.wiringLink.className = "toolbar_marked";
			wiring.wiringContainer.setStyle({'zIndex' : this.showLevel, 'display': 'block', 'visibility': 'visible'});
		}
		
		//the disabling layer can be clicable (in order to hide a menu) or not
		LayoutManager.prototype.showClickableCover = function(){
			this.coverLayerElement.style.display="block";
			Event.observe( this.coverLayerElement, "click", this.coverLayerEvent);
		}

		LayoutManager.prototype.showUnclickableCover = function(){
			this.coverLayerElement.addClassName('disabled_background');
			this.coverLayerElement.style.display="block";
			Event.stopObserving( this.coverLayerElement, "click", this.coverLayerEvent);
		}

		//WorkSpaceMenu is dinamic so the different options must be added.
		LayoutManager.prototype.refreshChangeWorkSpaceMenu = function(workspaces){

			if(!this.menus['workSpaceOpMenu']){
					this.menus['workSpaceOpMenu'] = new DropDownMenu('workspace_menu');
			}
			this.menus['workSpaceOpMenu'].clearSubmenuOptions();
			
			if(workspaces.length >= 1){
				this.menus['workSpaceOpMenu'].submenu.className = "submenu border_top";
			}else{
				this.menus['workSpaceOpMenu'].submenu.className = "submenu";
			}

			for (var i=0; i<workspaces.length; i++){
				this.menus['workSpaceOpMenu'].addOptionToSubmenu(null, workspaces[i].workSpaceState.name, function (){LayoutManagerFactory.getInstance().hideCover();OpManagerFactory.getInstance().changeActiveWorkSpace(this)}.bind(workspaces[i]));

			}
		}

		//Shows the asked drop down menu 
		LayoutManager.prototype.showDropDownMenu = function(menu, launcher){
			this.showClickableCover();
			switch (menu){
			case 'workSpaceOps':
				if(!this.menus['workSpaceOpMenu']){
					this.menus['workSpaceOpMenu'] = new DropDownMenu('workSpace_menu');
				}
				this.currentMenu = this.menus['workSpaceOpMenu'];
				this.currentMenu.show(launcher,'bottom-right');
				break;
			case 'tabOps':
				if(!this.menus['tabOpMenu']){
					this.menus['tabOpMenu'] = new DropDownMenu('tab_menu');
				}
				this.currentMenu = this.menus['tabOpMenu'];
				this.currentMenu.show(launcher,'bottom-left');
				break;
			default:
				break;
			}
			
		}

		//Shows the asked window menu
		LayoutManager.prototype.showWindowMenu = function(window){
			//the disabling layer is displayed as long as a menu is shown. If there isn't a menu, there isn't a layer.
			if(this.currentMenu != null){//only if the layer is displayed.
				this.hideCover();
			}
			this.showUnclickableCover();
			switch (window){
			case 'renameTab':
				if(!this.menus['renameTabMenu']){
					this.menus['renameTabMenu'] = new RenameWindowMenu('tab');
				}
				this.currentMenu = this.menus['renameTabMenu'];
				this.currentMenu.show();
				break;
			case 'renameWorkSpace':
				if(!this.menus['renameWorkSpaceMenu']){
					this.menus['renameWorkSpaceMenu'] = new RenameWindowMenu('workSpace');
				}
				this.currentMenu = this.menus['renameWorkSpaceMenu'];
				this.currentMenu.show();
				break;
			case 'createTab':
				if(!this.menus['createTabMenu']){
					this.menus['createTabMenu'] = new CreateWindowMenu('tab');
				}
				this.currentMenu = this.menus['createTabMenu'];
				this.currentMenu.show();
				break;
			case 'createWorkSpace':
				if(!this.menus['createWorkSpaceMenu']){
					this.menus['createWorkSpaceMenu'] = new CreateWindowMenu('workSpace');
				}
				this.currentMenu = this.menus['createWorkSpaceMenu'];
				this.currentMenu.show();
				break;
			default:
				break;
			}
		}

		//hides the disabling layer and so, the current menu
		LayoutManager.prototype.hideCover = function(){
			this.currentMenu.hide();
			this.currentMenu = null;
			this.coverLayerElement.removeClassName('disabled_background');
			this.coverLayerElement.style.display="none";
		}
		
		var FADE_RED_INI = 240;
		var FADE_GREEN_INI = 230;
		var FADE_BLUE_INI = 140;
		var FADE_RED_END_TAB = 151;
		var FADE_GREEN_END_TAB = 160;
		var FADE_BLUE_END_TAB = 168;
		var FADE_RED_END_CUR_TAB = 224;
		var FADE_GREEN_END_CUR_TAB = 224;
		var FADE_BLUE_END_CUR_TAB = 224;
		var FADE_HOLD = 500;
		var FADE_SPEED = 200;
		var FADE_STEP = 5;
		var self = this;
		LayoutManager.prototype.goTab = function(tab, tabLauncher, renameHandler, changeHandler){
			this.markTab(tab, tabLauncher, renameHandler, changeHandler);
			var currentColour = [FADE_RED_INI, FADE_GREEN_INI, FADE_BLUE_INI];
			tab.style.background = "rgb(" + currentColour[0] + "," + currentColour[1] + "," + currentColour[2] + ")";
			setTimeout(function(){
					var endColour = [FADE_RED_END_TAB, FADE_GREEN_END_TAB, FADE_BLUE_END_TAB];
					if(tab.className == "tab current"){
						endColour = [FADE_RED_END_CUR_TAB, FADE_GREEN_END_CUR_TAB, FADE_BLUE_END_CUR_TAB];	
					}
					self.fadeTab(tab.id, currentColour, endColour);
				}, FADE_HOLD);
		}
		
		LayoutManager.prototype.fadeTab = function(tabId, currentColour, endColour){	
			if(currentColour[0]==endColour[0] && currentColour[1]==endColour[1] && currentColour[2] == endColour[2]){
				document.getElementById(tabId).removeAttribute("style");
				return;
			} 
			
			currentColour[0] = this.fadeColour(currentColour[0], endColour[0], FADE_STEP);
			currentColour[1] = this.fadeColour(currentColour[1], endColour[1], FADE_STEP);
			currentColour[2] = this.fadeColour(currentColour[2], endColour[2], FADE_STEP);
			
			document.getElementById(tabId).style.background = "rgb(" + currentColour[0] + "," + currentColour[1] + "," + currentColour[2] + ")";
			setTimeout(function(){self.fadeTab(tabId, currentColour, endColour);}, FADE_SPEED);
		}
		
		LayoutManager.prototype.fadeColour = function(colour, obj, step){
			if(colour > obj){
				if(colour - step > obj){
					return colour - step;	
				}	
			} else {
				if(colour + step < obj){
					return colour + step;	
				}		
			}
			return obj;
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
