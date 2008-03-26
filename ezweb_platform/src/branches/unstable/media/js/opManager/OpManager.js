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
			// JSON-coded user tabspaces
			var response = transport.responseText;
			var workSpacesStructure = eval ('(' + response + ')');

			var workSpaces = workSpacesStructure.workspaces;

			for (i=0; i<workSpaces.length; i++) {
			    var workSpace = workSpaces[i];
			    this.workSpaceInstances[workSpace.name] = new WorkSpace(workSpace);

			    if (workSpace.active == "true") {
			    	this.activeWorkSpace=this.workSpaceInstances[workSpace.name];
			    	return;
			    }
			}

		}
		
		var onError = function (transport) {
		    alert("error en loadEnvironment");
		}

		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		this.errorCount = 0;
			
		// Singleton modules
		this.varManagerModule = null;
		this.showcaseModule = null;
		this.contextManagerModule = null;
		this.catalogue = null;
		this.persistenceEngine = PersistenceEngineFactory.getInstance();

		// Active instance for non-singleton modules
		this.activeDragboard;
		this.activeWiring;
		
		//Current interface selected by user {dragboard, catalogue, wiring}
		this.currentInterface = "dragboard"
		
		this.loadCompleted = false;

		// Variables for controlling the collection of wiring and dragboard instances of a user
		this.workSpaceInstances = new Array();
		this.activeWorkSpace;

		
		// ****************
		// PUBLIC METHODS 
		// ****************
		OpManager.prototype.changeActiveWorkSpace = function (workSpace) {
		    this.activeWorkSpace = this.getActiveWorkSpace(workSpace);
		    this.activeDragboard = this.activeWorkSpace.getActiveTab().getDragboard();
		    this.activeWiring = this.activeWorkSpace.getWiring();
		}			

		OpManager.prototype.changeActiveTab = function (tab) {
		    this.activeWorkSpace.setTab(tab);
		    this.activeDragboard = this.activeWorkSpace.getActiveTab().getDragboard();
		}
		
		OpManager.prototype.showCatalogue = function () {
			this.activeWorkSpace.hideTabs();
			
			$("showcase_container").setStyle({"display": "block", "zIndex" : "2"});
			$("showcase_tab").className = "tab current";
		}

		OpManager.prototype.getActiveWorkSpace = function (workSpace) {
		    var ts = this.workSpaceInstances[workSpace];

		    if (ts) {
		    	return ts;
		    } else {
		    	return this.activeWorkSpace;
		    }
		}

		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!this.loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			var iGadgetId = this.activeDragboard.addInstance(gadget);
			
			this.varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			this.activeWiring.addInstance(iGadgetId, gadget.getTemplate());
			
			this.contextManagerModule.addInstance(iGadgetId, gadget);
			
			this.dragboardModule.showInstance(iGadgetId);

			// The dragboard must be shown after an igadget insertion
			show_dragboard()
		}

		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!this.loadCompleted)
				return;

			this.activeDragboard.removeInstance(iGadgetId); // TODO split into hideInstance and removeInstance
			this.varManagerModule.removeInstance(iGadgetId);
			this.activeWiring.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    this.activeWiring.sendEvent(gadget, event, value);
		}

		OpManager.prototype.restaure = function () {
		    this.activeWiring.restaure();
		}

		OpManager.prototype.loadEnviroment = function () {
		    // First, global modules must be loades (Context, Showcase, Catalogue)
			// Showcase is the first!
			// When it finish, it will invoke continueLoadingGlobalModules method!
			this.showcaseModule = ShowcaseFactory.getInstance();
		}

		OpManager.prototype.repaintCatalogue = function (url) {
	 	    this.catalogue.emptyResourceList();
		    this.catalogue.loadCatalogue(url);	
		}

		OpManager.prototype.igadgetLoaded = function () {
	 	    this.activeDragboard.igadgetLoaded();
		}
		
		OpManager.prototype.paintActiveWorkSpace = function () {
			dragboard = DragboardFactory.getInstance();
			dragboard.repaint();
	    	
			wiring = WiringFactory.getInstance();
			wiringInterface = WiringInterfaceFactory.getInstance();
		}
		
		OpManager.prototype.continueLoadingGlobalModules = function (module) {
		    // Asynchronous load of modules
		    // Each singleton module notifies OpManager it has finished loading!
		    
		    if (module == Modules.prototype.SHOWCASE) {
		    	this.contextManagerModule = ContextManagerFactory.getInstance();
		    	return;
		    }
		    
		    if (module == Modules.prototype.CONTEXT_MANAGER) {
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
		    	this.paintActiveWorkSpace();
		    	environmentLoadedCallback();
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
			if (this.errorCount++ == 0) {
				$("logs_tab").className="tab";
			}
			label = ngettext("%(errorCount)s error", "%(errorCount)s errors", this.errorCount);
			label = interpolate(label, {errorCount: this.errorCount}, true);
			$("logs_tab").innerHTML = label;

			var logentry = document.createElement("p");

			switch (level) {
			default:
			case Constants.Logging.ERROR_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/error.png");
				icon.setAttribute("class", "icon");
				icon.setAttribute("alt", "[Error] ");
				$("logs_console").appendChild(icon);
				try {
					console.error(msg);
				} catch (e) {}
				break;
			case Constants.Logging.WARN_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/warning.png");
				icon.setAttribute("class", "icon"); 
				icon.setAttribute("alt", "[Warning] ");
				$("logs_console").appendChild(icon);
				try {
					if (console) console.warn(msg);
				} catch (e) {}
				break;
			case Constants.Logging.INFO_MSG:
				icon = document.createElement("img");
				icon.setAttribute("src", "/ezweb/images/info.png");
				icon.setAttribute("class", "icon");
				icon.setAttribute("alt", "[Info] ");
				$("logs_console").appendChild(icon);
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
			$("logs_console").appendChild(logentry);
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
