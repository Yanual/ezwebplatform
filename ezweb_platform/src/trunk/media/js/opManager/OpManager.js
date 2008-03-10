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
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		var errorCount = 0;
		
		// Already loaded modules
		this.persistenceEngine = PersistenceEngineFactory.getInstance();
		
		// Still to load modules
		this.varManagerModule = null;
		this.wiringModule = null;
		this.dragboardModule = null;
		this.showcaseModule = null;
		this.contextManagerModule = null;
		this.catalogue = null;
		
		this.loadCompleted = false;
		
		// ****************
		// PUBLIC METHODS 
		// ****************
			
		OpManager.prototype.addInstance = function (gadgetId) {
		        if (!this.loadCompleted)
				return;

			var gadget = this.showcaseModule.getGadget(gadgetId);
				
			var iGadgetId = this.dragboardModule.addInstance(gadget);
			
			this.varManagerModule.addInstance(iGadgetId, gadget.getTemplate());
			this.wiringModule.addInstance(iGadgetId, gadget.getTemplate());
			
			this.contextManagerModule.addInstance(iGadgetId, gadget);
			
			this.dragboardModule.showInstance(iGadgetId);

			// The dragboard must be shown after an igadget insertion
			show_dragboard()
		}

		OpManager.prototype.removeInstance = function (iGadgetId) {
			if (!this.loadCompleted)
				return;

			this.dragboardModule.removeInstance(iGadgetId); // TODO split into hideInstance and removeInstance
			this.varManagerModule.removeInstance(iGadgetId);
			this.wiringModule.removeInstance(iGadgetId);
		}
		
		
		OpManager.prototype.sendEvent = function (gadget, event, value) {
		    this.wiringModule.sendEvent(gadget, event, value);
		}

		OpManager.prototype.restaure = function () {
		    this.wiringModule.restaure();
		}

		OpManager.prototype.loadEnviroment = function () {
			//alert (gettext('Testing'));
			this.varManagerModule = VarManagerFactory.getInstance();
		}

		OpManager.prototype.repaintCatalogue = function (url) {
	 	    this.catalogue.emptyResourceList();
		    this.catalogue.loadCatalogue(url);	
		}

		OpManager.prototype.igadgetLoaded = function () {
	 	    this.dragboardModule.igadgetLoaded();
		}
		
		OpManager.prototype.continueLoading = function (module) {
			// Asynchronous load of modules
			// Each module notifies OpManager it has finished loading!
			
			if (module == Modules.prototype.VAR_MANAGER) {
				this.showcaseModule = ShowcaseFactory.getInstance();
				return; 
			}
			
			if (module == Modules.prototype.SHOWCASE) {
				this.wiringModule = WiringFactory.getInstance();
				return;
			}
			
			if (module == Modules.prototype.WIRING) {
				this.contextManagerModule = ContextManagerFactory.getInstance();
				return;
			}

		    if (module == Modules.prototype.CONTEXT_MANAGER) {
				this.dragboardModule = DragboardFactory.getInstance();
				return;
			}
		    
			if (module == Modules.prototype.DRAGBOARD) {
				this.catalogue = CatalogueFactory.getInstance();
				this.catalogue.loadCatalogue(URIs.GET_POST_RESOURCES);

				this.loadCompleted = true;
				environmentLoadedCallback();
				return;
			}
		}
		
		OpManager.prototype.logIGadgetError = function(iGadgetId, msg, level) {
			var dragboard = DragboardFactory.getInstance();
			var gadgetInfo = dragboard.getGadget(iGadgetId).getInfoString();
			msg = msg + "\n" + gadgetInfo;

			this.log(msg, level);
			dragboard.notifyErrorOnIGadget(iGadgetId);
		}

		OpManager.prototype.log = function(msg, level) {
			if (errorCount++ == 0) {
				$("logs_tab").className="tab";
			}
			label = ngettext("%(errorCount)s error", "%(errorCount)s errors", errorCount);
			label = interpolate(label, {errorCount: errorCount}, true);
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
