/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2007-2008 Telefónica Investigación y Desarrollo 
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

/**
 * This class represents a instance of a Gadget.
 * @author aarranz
 */
function IGadget(gadget, iGadgetId, iGadgetCode, layoutStyle, position, width, height, minimized, dragboard) {
	this.id = iGadgetId;
	this.code = iGadgetCode;
	this.gadget = gadget;
	this.layoutStyle = layoutStyle;
	this.position = position;
	this.contentWidth = width;
	this.contentHeight = height;
	
	this.dragboard = dragboard;

	this.height = layoutStyle.getTitlebarSize();
	if (!minimized)
	    this.height += height;

	this.configurationVisible = false;
	this.minimized = minimized;

	// Elements
	this.element = null;
	this.gadgetMenu = null;
	this.contentWrapper = null;
	this.content = null;
	this.configurationElement = null;
	this.settingsButtonElement = null;
	this.minimizeButtonElement = null;
	this.errorButtonElement = null;

	this.errorCount = 0;
}

/**
 * Returns the associated Gadget class.
 */
IGadget.prototype.getGadget = function() {
	return this.gadget;
}

/**
 * Sets the position of a gadget instance. The position is calculated relative
 * to the top-left square of the gadget instance box using cells units.
 */
IGadget.prototype.setPosition = function(position) {
	this.position = position;

	if (this.element != null) { // if visible
		this.element.style.left = this.layoutStyle.getColumnOffset(position.x) + "px";
		this.element.style.top = this.layoutStyle.getRowOffset(position.y) + "px";

		// Notify Context Manager of igadget's position
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.XPOSITION, this.position.x); 
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.YPOSITION, this.position.y);
	}
}

/**
 * Gets the position of a gadget instance. The position is calculated relative
 * to the top-left square of the gadget instance box using cells units.
 */
IGadget.prototype.getPosition = function() {
	return this.position;
}

/**
 * Return the content width in cells.
 */
IGadget.prototype.getContentWidth = function() {
	return this.contentWidth;
}

/**
 * Return the content height in cells.
 */
IGadget.prototype.getContentHeight = function() {
	return this.contentHeight;
}

/**
 * Return the actual width of the gadget in cells. This depends in the status of
 * the gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getWidth = function() {
	// For now, the igadget width is always the width of the igadget content
	return this.contentWidth;
}

/**
 * Return the actual height of the gadget in cells. This depends in the status
 * of the gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getHeight = function() {
	if (this.height == null) {
		if (this.element != null) {
			if (!this.minimized) {
				if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
					this.content.height = this.layoutStyle.fromVCellsToPixels(this.contentHeight) + "px";
				}
				var wrapperHeight = this.content.offsetHeight + this.configurationElement.offsetHeight;
				this.contentWrapper.setStyle({height: wrapperHeight + "px"});
			} else {
				this.contentWrapper.setStyle({height: 0 + "px"});
				if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
					this.content.height = 0;
				}
			}

			var fullsize = this.element.offsetHeight + this.layoutStyle.topMargin + this.layoutStyle.bottomMargin;
			this.height = Math.ceil(this.layoutStyle.fromPixelsToVCells(fullsize));
		} else {
			this.height = 0;
		}
	}

	return this.height;
}

IGadget.prototype.getId = function() {
	return this.id;
}

IGadget.prototype.getElement = function() {
	return this.element;
}

/**
 * Returns true if the igadget is actually visible in a dragboard.
 */
IGadget.prototype.isVisible = function() {
	return this.element != null;
}

/**
 * Paints the gadget instance
 * @param where HTML Element where the igadget will be painted
 */
IGadget.prototype.paint = function(where) {
	if (this.element != null) // exit if the igadgets is already visible
		return; // TODO exception

	var gadgetElement, gadgetMenu;
	var contentHeight = this.layoutStyle.fromVCellsToPixels(this.contentHeight) + "px";

	gadgetElement = document.createElement("div");
	this.element = gadgetElement;
	gadgetElement.setAttribute("class", "gadget_window");
	gadgetElement.setAttribute("className", "gadget_window"); //IE hack

	// Gadget Menu
	this.gadgetMenu = document.createElement("div");
	this.gadgetMenu.setAttribute("class", "gadget_menu");
	this.gadgetMenu.setAttribute("className", "gadget_menu"); //IE hack

	// buttons. Inserted from right to left
	var button;

	// close button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "closebutton");
	button.setAttribute("className", "closebutton"); //IE hack
	Event.observe (button, "click", function() {OpManagerFactory.getInstance().removeInstance(this.id);}.bind(this), true);
	button.setAttribute("title", gettext("Close"));
	button.setAttribute("alt", gettext("Close"));
	this.gadgetMenu.appendChild(button);

	// settings button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "settingsbutton");
	button.setAttribute("className", "settingsbutton"); //IE hack
	Event.observe (button, "click", function() {this.toggleConfigurationVisible(this.id);}.bind(this), true);
	button.setAttribute("title", gettext("Preferences"));
	button.setAttribute("alt", gettext("Preferences"));
	this.gadgetMenu.appendChild(button);
	this.settingsButtonElement = button;

	// minimize button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	Event.observe (button, "click", function() {this.toggleMinimizeStatus()}.bind(this), true);
	if (this.minimized) {
		button.setAttribute("title", gettext("Maximize"));
		button.setAttribute("alt", gettext("Maximize"));
		button.addClassName("maximizebutton");
	} else {
		button.setAttribute("title", gettext("Minimize"));
		button.setAttribute("alt", gettext("Minimize"));
		button.addClassName("minimizebutton");
	}

	this.gadgetMenu.appendChild(button);
	this.minimizeButtonElement = button;

	// error button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "button errorbutton disabled");
	button.setAttribute("className", "button errorbutton disabled"); //IE hack
	Event.observe (button, "click", function() {OpManagerFactory.getInstance().showLogs();}, true);
	this.gadgetMenu.appendChild(button);
	this.errorButtonElement = button;

	// Gadget title
	var title = this.gadget.getName() + " (Gadget " + this.id + ")"; // TODO
	this.gadgetMenu.appendChild(document.createTextNode(title));
	this.gadgetMenu.setAttribute("title", title);
	gadgetElement.appendChild(this.gadgetMenu);

	// Content wrapper
	this.contentWrapper = document.createElement("div");
	this.contentWrapper.setAttribute("class", "gadget_wrapper");
	this.contentWrapper.setAttribute("className", "gadget_wrapper"); //IE hack
	gadgetElement.appendChild(this.contentWrapper);

	// Gadget configuration (Initially empty and hidden)
	this.configurationElement = document.createElement("form");
	this.configurationElement.setAttribute("class", "config_interface");
	this.configurationElement.setAttribute("className", "config_interface"); //IE hack
	Event.observe(this.configurationElement, "submit", function(){return false;}) //W3C and IE compliant
	this.contentWrapper.appendChild(this.configurationElement);

	// Gadget Content
	if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
		this.content = document.createElement("iframe"); 
		this.content.setAttribute("class", "gadget_object"); 
		this.content.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml 
		this.content.setAttribute("src", this.gadget.getXHtml().getURICode() + "?id=" + this.id); 
		this.content.setAttribute("standby", "Loading..."); 
//		this.content.innerHTML = "Loading...."; // TODO add an animation ?

		this.content.setAttribute("width", "100%");
		this.content.setAttribute("height", contentHeight);
	} else { //non IE6
		this.content = document.createElement("object"); 
		this.content.setAttribute("class", "gadget_object"); 
		this.content.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml 
		this.content.setAttribute("data", this.gadget.getXHtml().getURICode() + "?id=" + this.id); 
		this.content.setAttribute("standby", "Loading..."); 
		this.content.innerHTML = "Loading...."; // TODO add an animation ?

		this.content.setStyle({"width": "100%", "height": contentHeight});
	}
	this.contentWrapper.appendChild(this.content);

	// resize handle
	var resizeHandle = document.createElement("div");
	resizeHandle.setAttribute("class", "resizeHandle");
	this.contentWrapper.appendChild(resizeHandle);
	new IGadgetResizeHandle(resizeHandle, this);

	// TODO use setStyle from prototype
	// Position
	gadgetElement.style.left = this.layoutStyle.getColumnOffset(this.position.x) + "px";
	gadgetElement.style.top = this.layoutStyle.getRowOffset(this.position.y) + "px";

	// Notify Context Manager of igadget's position
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.XPOSITION, this.position.x); 
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.YPOSITION, this.position.y);

	// Sizes
	gadgetElement.style.width = this.layoutStyle.getWidthInPixels(this.contentWidth) + "px";
	if (this.minimized) {
		this.contentWrapper.style.height = "0px";
		this.contentWrapper.style.borderTop = "0px";
		this.contentWrapper.style.visibility = "hidden";
	} else {
		this.contentWrapper.style.height = contentHeight;
	}
	
	// Notify Context Manager of igadget's size
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.HEIGHT, this.contentHeight);
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.WIDTH, this.contentWidth);

	// Insert it on the dragboard
	where.appendChild(gadgetElement);

	// Mark as draggable
	new IGadgetDraggable(this);

	return this.element;
}

/**
 * Removes this igadget form the dragboard. Also this notify EzWeb Platform for remove the igadget form persistence.
 */
IGadget.prototype.destroy = function() {
	if (this.element != null) {
		function onSuccess() {}
		function onError(transport, e) {
			var msg;

			if (transport.responseXML) {
                                msg = transport.responseXML.documentElement.textContent;
			} else {
                                msg = "HTTP Error " + transport.status + " - " + transport.statusText;
			}

			msg = interpolate(gettext("Error removing igadget from persistence: %(errorMsg)s."), {errorMsg: msg}, true);
			LogManagerFactory.getInstance().log(msg);
		}
		this.element.parentNode.removeChild(this.element);
		this.element = null;
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var uri = URIs.GET_IGADGET.evaluate({workspaceId: this.dragboard.workSpaceId, tabId: this.dragboard.tabId, iGadgetId: this.id})
		persistenceEngine.send_delete(uri, this, onSuccess, onError);
	}
}

/**
 * Change the values shown in the configuration form of this igadget to the default ones.
 */
IGadget.prototype._setDefaultPrefsInInterface = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var curPref;

	for (var i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		curPref.setDefaultValueInInterface(this.prefElements[curPref.getVarName()]);
	}
}

/**
 * Set all preferences of this gadget instance to their default value
 */
IGadget.prototype.setDefaultPrefs = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var varManager = this.dragboard.workSpace.getVarManager();

	for (var i = 0; i < prefs.length; i++) {
		prefs[i].setToDefault(varManager, this.id);
	}

	if (this.configurationVisible)
		this._setDefaultPrefsInInterface();
}

/**
 * This function builds the igadget configuration form.
 */
IGadget.prototype._makeConfigureInterface = function() {

	var varManager = this.dragboard.workSpace.getVarManager();
	var prefs = this.gadget.getTemplate().getUserPrefs();

	var interfaceDiv = document.createElement("div");

	if (prefs.length == 0) {
		interfaceDiv.innerHTML = gettext("This IGadget does not have user prefs");
		return interfaceDiv;
	}

	this.prefElements = new Array();

	var row, cell, label, table = document.createElement("table");
	tbody = document.createElement("tbody");
	table.appendChild(tbody);
	for (var i = 0; i < prefs.length; i++) {
		row = document.createElement("tr");

		// Settings label
		cell = document.createElement("td");
		cell.setAttribute("width", "40%"); // TODO
		label = prefs[i].getLabel();
		cell.appendChild(label);
		row.appendChild(cell);

		// Settings control
		cell = document.createElement("td");
		cell.setAttribute("width", "60%"); // TODO
		curPrefInterface = prefs[i].makeInterface(varManager, this.id);
		this.prefElements[curPrefInterface.name] = curPrefInterface;
		Element.extend(this.prefElements[curPrefInterface.name]);
		cell.appendChild(curPrefInterface);
		row.appendChild(cell);

		tbody.appendChild(row);
	}
	interfaceDiv.appendChild(table);

	var buttons = document.createElement("div");
	buttons.setAttribute("class", "buttons");
	buttons.setAttribute("className", "buttons"); //IE hack
	var button;

	// "Set Defaults" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Set Defaults"));
	Event.observe (button, "click", this._setDefaultPrefsInInterface.bind(this), true);
	buttons.appendChild(button);

	// "Save" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Save"));
	Event.observe (button, "click", function () {this.dragboard.saveConfig(this.id)}.bind(this), true);
	buttons.appendChild(button);

	// "Cancel" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Cancel"));
	Event.observe (button, "click", function () {this.setConfigurationVisible(false)}.bind(this), true);
	buttons.appendChild(button);
	interfaceDiv.appendChild(buttons);

	// clean floats
	var floatClearer = document.createElement("div");
	floatClearer.setAttribute("class", "floatclearer");
	floatClearer.setAttribute("className", "floatclearer"); //IE hack
	interfaceDiv.appendChild(floatClearer);

	return interfaceDiv;
}

/**
 * TODO
 * Sets the size of the igadget's content.
 */
IGadget.prototype.setContentSize = function(newWidth, newHeight) {
  this.contentWidth = newWidth;
  this.contentHeight = newHeight;
}

/**
 * This function is called when the browser window is resized.
 */
IGadget.prototype._notifyWindowResizeEvent = function() {
	if (!this.element)
		return;

	// Recompute position
	this.element.style.left = this.layoutStyle.getColumnOffset(this.position.x) + "px";
	this.element.style.top = this.layoutStyle.getRowOffset(this.position.y) + "px";

	// Recompute width
	this.element.style.width = this.layoutStyle.getWidthInPixels(this.contentWidth) + "px";
}

/**
 * This function is called when the dragboard is locked or unlocked.
 */
IGadget.prototype._notifyLockEvent = function(newLockStatus) {
	if (!this.element){
		return;
	}

	if(newLockStatus){
		this.element.class = "gadget_window_locked";
		this.element.className = "gadget_window_locked"; //IE hack
	} else {
		this.element.class = "gadget_window";
		this.element.className = "gadget_window"; //IE hack
	}

	var oldWidth = this.getWidth();
	var oldHeight = this.getHeight();

	this.height = null;

	// Notify resize event
	this.dragboard._notifyResizeEvent(this, oldWidth, oldHeight, this.getWidth(), this.getHeight(), false);
}

/**
 * Sets the absolute size of the igadget. See setContentSize for resizing the area for the igadget content.
 *
 * @param newWidth the new width of this igadget in cells. This will be the
 *                 final width for this gadget.
 * @param newHeight the new height of this igadget in cells. This will be the
 *                  final height for this gadget (that is, counting the
 *                  igadget's title bar, the configuration form, etc)
 * @param persist true if is needed to send the new widths/positions of the
 *                igadgets (the resize operation can move other igadgets) to
 *                persistence.
 */
IGadget.prototype._setSize = function(newWidth, newHeight, persist) {
	var oldWidth = this.getWidth();
	var oldHeight = this.getHeight();

	// Assign new values
	this.contentWidth = newWidth;
	this.height = newHeight;

	// Recompute sizes
	this.element.style.width = this.layoutStyle.getWidthInPixels(this.contentWidth) + "px";

	var contentHeight = this.layoutStyle.getHeightInPixels(this.height);
	contentHeight -= this.configurationElement.offsetHeight + this.gadgetMenu.offsetHeight;
	contentHeight -= 3; // TODO offsetHeight don't take into account borders
	this.content.style.height = contentHeight + "px";
	this.height = null;

	this.getHeight();
	this.contentHeight = Math.floor(this.layoutStyle.fromPixelsToVCells(this.content.offsetHeight));

	if (persist) {
		// Notify Context Manager of igadget's size
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.HEIGHT, this.contentHeight);
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.WIDTH, this.contentWidth);
	}

	// Notify resize event
	this.dragboard._notifyResizeEvent(this, oldWidth, oldHeight, this.contentWidth, this.height, persist);
}

/**
 * Returns true if this igadget is minimized.
 */
IGadget.prototype.isMinimized = function() {
	return this.minimized;
}

/**
 * Changes minimize status of this igadget
 *
 * @param newStatus new minimize status of the igadget
 */
IGadget.prototype.setMinimizeStatus = function(newStatus) {
	if (this.minimized == newStatus)
	    return; // Nothing to do

	// TODO add effects?

	// New Status
	this.minimized = newStatus;

	if (this.minimized) {
	    this.contentWrapper.setStyle({"visibility": "hidden" , "border": "0px"});
	    this.configurationElement.setStyle({"display": "none"});
	    this.minimizeButtonElement.setAttribute("title", gettext("Maximize"));
	    this.minimizeButtonElement.setAttribute("alt", gettext("Maximize"));
	    this.minimizeButtonElement.removeClassName("minimizebutton");
	    this.minimizeButtonElement.addClassName("maximizebutton");
	} else {
	    this.contentWrapper.setStyle({"visibility": "visible", "border": ""});
	    if (this.configurationVisible == true)
		this.configurationElement.setStyle({"display": "block"});
	    this.minimizeButtonElement.setAttribute("title", gettext("Minimize"));
	    this.minimizeButtonElement.setAttribute("alt", gettext("Minimize"));
	    this.minimizeButtonElement.removeClassName("maximizebutton");
	    this.minimizeButtonElement.addClassName("minimizebutton");
	}

	// Notify resize event
	var oldHeight = this.getHeight();
	this.height = null; // recompute igadget's height (see getHeight function)
	this.dragboard._notifyResizeEvent(this, this.contentWidth, oldHeight, this.contentWidth, this.getHeight(), true);
}

/**
 * Toggles the minimize status of this gadget
 */
IGadget.prototype.toggleMinimizeStatus = function () {
	this.setMinimizeStatus(!this.minimized);
}

/**
 * Increment the error counter of this igadget
 */
IGadget.prototype.notifyError = function() {
	if (this.errorCount++ == 0) { // First time
	    this.errorButtonElement.removeClassName("disabled");
	}
	label = ngettext("%(errorCount)s error", "%(errorCount)s errors", this.errorCount);
	label = interpolate(label, {errorCount: this.errorCount}, true);
	this.errorButtonElement.setAttribute("title", label);
}

/**
 * Returns true if the configuration form of this igadget is visible
 */
IGadget.prototype.isConfigurationVisible = function() {
	return this.configurationVisible;
}

/**
 * Changes the visibility status of the configuration form of this igadget
 *
 * @param newValue new visibility status of the configuration form of this igadget
 */
IGadget.prototype.setConfigurationVisible = function(newValue) {
	if (this.configurationVisible == newValue)
		return;

	if (newValue == true) {
		this.configurationVisible = true;
		this.configurationElement.appendChild(this._makeConfigureInterface());
		if (this.isMinimized())
			this.configurationElement.setStyle({"display": "none"});
		else
			this.configurationElement.setStyle({"display": "block"});
		this.settingsButtonElement.removeClassName("settingsbutton");
		this.settingsButtonElement.addClassName("settings2button");
	} else {
		this.configurationElement.innerHTML = "";
		this.configurationElement.hide();
		this.configurationVisible = false;
		this.settingsButtonElement.removeClassName("settings2button");
		this.settingsButtonElement.addClassName("settingsbutton");
	}

	// Notify resize event
	var oldHeight = this.getHeight();
	this.height = null; // recompute igadget's height (see getHeight function)
	this.dragboard._notifyResizeEvent(this, this.contentWidth, oldHeight, this.contentWidth, this.getHeight(), true);
}

/**
 * Toggles the visibility status of the configuration form of this igadget.
 */
IGadget.prototype.toggleConfigurationVisible = function () {
	this.setConfigurationVisible(!this.configurationVisible);
}

/**
 * Saves the values of the preferences from the config form of this igadget.
 */
IGadget.prototype.saveConfig = function() {
	if (this.configurationVisible == false)
		throw new Error(""); // TODO

	var varManager = this.dragboard.workSpace.getVarManager();
	var i, curPref, prefElement, validData = true;
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var prefName = null;
	
	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefName = curPref.getVarName();
		prefElement = this.prefElements[prefName];
		if (!curPref.validate(curPref.getValueFromInterface(prefElement))) {
			validData = false;
			prefElement.addClassName("invalid");
		} else {
			prefElement.removeClassName("invalid");
		}
	}

	if (!validData)
		throw new Error("Invalid data found"); // Don't save if the data is invalid

	// Start propagation of the new values of the user pref variables
	varManager.incNestingLevel();

	var oldValue, newValue;
	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefName = curPref.getVarName();
		prefElement = this.prefElements[prefName];
		var oldValue = curPref.getCurrentValue(varManager, this.id);
		var newValue = curPref.getValueFromInterface(prefElement);

		if (newValue != oldValue)
			curPref.setValue(varManager, this.id, newValue);
	}

	// Commit
	varManager.decNestingLevel();

	this.setConfigurationVisible(false);
}

/**
 * Saves the igadget into persistence. Used only for the first time, that is, for creating igadgets.
 */
IGadget.prototype.save = function() {
	function onSuccess(transport) {
		var igadgetInfo = eval ('(' + transport.responseText + ')');
		this.id = igadgetInfo['id'];
		this.dragboard.addIGadget(this, igadgetInfo);
	}

	function onError(transport, e) {
		var msg;
		if (e) {
			msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
			                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
			                  true);
		} else if (transport.responseXML) {
			msg = transport.responseXML.documentElement.textContent;
		} else {
			msg = "HTTP Error " + transport.status + " - " + transport.statusText;
		}

		msg = interpolate(gettext("Error adding igadget to persistence: %(errorMsg)s."), {errorMsg: msg}, true);
		LogManagerFactory.getInstance().log(msg);
	}

	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var data = new Hash();
	data['left'] = this.position.x;
	data['top'] = this.position.y;
	data['width'] = this.contentWidth;
	data['height'] = this.contentHeight;
	data['code'] = this.code;
	
	var uri = URIs.POST_IGADGET.evaluate({tabId: this.dragboard.tabId, workspaceId: this.dragboard.workSpaceId});
	
	data['uri'] = uri;
	data['gadget'] = URIs.GET_GADGET.evaluate({vendor: this.gadget.getVendor(),
	                                           name: this.gadget.getName(),
	                                           version: this.gadget.getVersion()});
	data = {igadget: data.toJSON()};
	persistenceEngine.send_post(uri , data, this, onSuccess, onError);
}
