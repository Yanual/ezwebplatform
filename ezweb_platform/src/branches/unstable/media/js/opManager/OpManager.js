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
			// References to EzWeb containers
			this.showCaseLink = $('catalogue_link');
			this.showCase = $('showcase_container');
			
			this.logsConsole = $('logs_console');
			this.logsLink = $('logs_link');
			
			this.wiringLink = $('wiring_link');
			
			// JSON-coded user tabspaces
			var response = transport.responseText;
			var workSpacesStructure = eval ('(' + response + ')');

			var workSpaces = workSpacesStructure.workspaces;

			for (var i = 0; i<workSpaces.length; i++) {
			    var workSpace = workSpaces[i];
			    
			    this.workSpaceInstances[workSpace.name] = new WorkSpace(workSpace);

			    if (workSpace.active == "true") {
			    	this.activeWorkSpace=this.workSpaceInstances[workSpace.name];
			    }
			    
			}
			
			// Total information of the active workspace must be downloaded!
			this.activeWorkSpace.downloadWorkSpaceInfo();
		}
		
		var onError = function (transport) {
		    alert("error en loadEnvironment");
		}

		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		this.errorCount = 0;

		// Singleton modules
		this.showcaseModule = null;
		this.contextManagerModule = null;
		this.catalogue = null;
		this.persistenceEngine = PersistenceEngineFactory.getInstance();

		// Active instance for non-singleton modules
		this.activeDragboard;
		this.activeWiring;
		this.activeVarManager = null;
		this.activeContextManager = null;
		
		//Current interface selected by user {dragboard, catalogue, wiring}
		this.currentInterface = "dragboard"
		
		this.loadCompleted = false;
		
		// Variables for controlling the collection of wiring and dragboard instances of a user
		this.workSpaceInstances = new Hash();
		this.activeWorkSpace;

		
		// ****************
		// PUBLIC METHODS 
		// ****************
		
		OpManager.prototype.showWiring = function () {
			LayoutManagerFactory.getInstance().unMarkGlobalTabs();
		    this.activeWorkSpace.showWiring();
		}
		
		OpManager.prototype.showCatalogue = function () {
			
			LayoutManagerFactory.getInstance().unMarkGlobalTabs();
			this.activeWorkSpace.hide();
		
			LayoutManagerFactory.getInstance().showShowCase();

			if (UIUtils.isInfoResourcesOpen) {
				UIUtils.isInfoResourcesOpen = false;
				UIUtils.SlideInfoResourceOutOfView('info_resource');
			}
			
			// Load catalogue data!
			this.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
					
			UIUtils.setResourcesWidth();
			
			$('simple_search_text').focus();
		}
		

		OpManager.prototype.showLogs = function () {
			LayoutManagerFactory.getInstance().unMarkGlobalTabs();
			this.activeWorkSpace.hide();
			LayoutManagerFactory.getInstance().showLogs();
		}
		
		OpManager.prototype.changeActiveWorkSpace = function (workSpace) {
		    this.activeWorkSpace = this.workSpaceInstances[workSpace];
		    this.activeDragboard = this.activeWorkSpace.getVisibleTab().getDragboard();
		    this.activeWiring = this.activeWorkSpace.getWiring();
		    this.activeVarManager = this.activeWorkSpace.getVarManager();
			this.activeContextManager = this.activeWorkSpace.getContextManager();
		    
		    this.showActiveWorkSpace();
		}			

		OpManager.prototype.changeVisibleTab = function (tabName) {
			LayoutManagerFactory.getInstance().unMarkGlobalTabs();
		    this.activeWorkSpace.setTab(tabName);
		    this.activeDragboard = this.activeWorkSpace.getVisibleTab().getDragboard();
		    
		}

		OpManager.prototype.addInstance = function (gadgetId) {
		    if (!this.loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			this.activeDragboard.addInstance(gadget);
		}
		
		OpManager.prototype.getActiveVarManager = function () {
			if (!this.loadCompleted)
				return;

		    return this.activeVarManager;
		}
		
		OpManager.prototype.getActiveContextManager = function () {
			if (!this.loadCompleted)
				return;

		    return this.activeContextManager;
		}

		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!this.loadCompleted)
				return;

			this.activeDragboard.removeInstance(iGadgetId); // TODO split into hideInstance and removeInstance
			this.activeVarManager.removeInstance(iGadgetId);
			this.activeWiring.removeInstance(iGadgetId);
			this.activeContextManager.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    this.activeWiring.sendEvent(gadget, event, value);
		}

		OpManager.prototype.loadEnviroment = function () {
		    // First, global modules must be loades (Showcase, Catalogue)
			// Showcase is the first!
			// When it finish, it will invoke continueLoadingGlobalModules method!
			this.showcaseModule = ShowcaseFactory.getInstance();
			this.showcaseModule.init();
		}

		OpManager.prototype.repaintCatalogue = function (url) {
	 	    this.catalogue.emptyResourceList();
		    this.catalogue.loadCatalogue(url);
		}

		OpManager.prototype.igadgetLoaded = function () {
	 	    this.activeDragboard.igadgetLoaded();
		}
				
		OpManager.prototype.showActiveWorkSpace = function () {
			var workSpaceNames = this.workSpaceInstances.keys();
			
			for (var i=0; i<workSpaceNames.length; i++) {
				var workSpace = this.workSpaceInstances[workSpaceNames[i]];
				
				if (workSpace == this.activeWorkSpace) {
					workSpace.show();
				} else {
					workSpace.hideAndUnmark();
				}
			}
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
		    	this.changeActiveWorkSpace(this.activeWorkSpace.getName());
		    	LayoutManagerFactory.getInstance().resizeWrapper();
		    	return;
		    }
		}

		OpManager.prototype.loadActiveWorkSpace = function () {
		    // Asynchronous load of modules
		    // Each singleton module notifies OpManager it has finished loading!

		    this.persistenceEngine.send_get(URIs.GET_WORKSPACES, this, loadEnvironment, onError)   
		}
	
		OpManager.prototype.logIGadgetError = function(iGadgetId, msg, level) {
			var gadgetInfo = this.activeDragboard.getGadget(iGadgetId).getInfoString();
			msg = msg + "\n" + gadgetInfo;

			this.log(msg, level);
			this.activeDragboard.notifyErrorOnIGadget(iGadgetId);
		}

		OpManager.prototype.log = function(msg, level) {
//			if (this.errorCount++ == 0) {
//				$("logs_tab").className="tab";
//			}

			label = ngettext("%(errorCount)s error", "%(errorCount)s errors", ++this.errorCount);
			label = interpolate(label, {errorCount: this.errorCount}, true);
			LayoutManagerFactory.getInstance().logsLink.innerHTML = label;

			var logentry = document.createElement("p");

			switch (level) {
			default:
			case Constants.Logging.ERROR_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/error.png");
				icon.setAttribute("class", "icon");
				icon.setAttribute("alt", "[Error] ");
				LayoutManagerFactory.getInstance().logsConsole.appendChild(icon);
				try {
					console.error(msg);
				} catch (e) {}
				break;
			case Constants.Logging.WARN_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/warning.png");
				icon.setAttribute("class", "icon"); 
				icon.setAttribute("alt", "[Warning] ");
				LayoutManagerFactory.getInstance().logsConsole.appendChild(icon);
				try {
					if (console) console.warn(msg);
				} catch (e) {}
				break;
			case Constants.Logging.INFO_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/info.png");
				icon.setAttribute("class", "icon");
				icon.setAttribute("alt", "[Info] ");
				LayoutManagerFactory.getInstance().logsConsole.appendChild(icon);
				try {
					if (console) console.info(msg);
				} catch (e) {}
				break;
			}

			var index;
			while ((index = msg.indexOf("\n")) != -1) {
			  logentry.appendChild(document.createTextNode(msg.substring(0, index)));
			  logentry.appendChild(document.createElement("br"));
			  msg = msg.substring(index + 1);
			}
			logentry.appendChild(document.createTextNode(msg));
			LayoutManagerFactory.getInstance().logsConsole.appendChild(logentry);

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
