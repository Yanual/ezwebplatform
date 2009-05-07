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
 * FIXME hacer que herede de ConnectableGroupInterface y eliminar los métodos caca
 * @abstract
 */
function ConnectableTabInterface (wiringGUI_, headerText_) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	//atributes
	this.wiringGUI = wiringGUI_;
	this.folded = false;
	this.connections = 0;
	this.openedByUser = false;

	this.tabDiv = document.createElement("div");
	this.tabDiv.addClassName("tab");
	this.igadgetsOpenedByUser = 0;

	// Content
	this.htmlElement = document.createElement("div");
	this.htmlElement.addClassName("tabContent");
	this.htmlElement.addClassName("bckgrnd_folder");
	this.htmlElement.appendChild(document.createTextNode(headerText_));

    //folding event
	Event.observe(this.htmlElement, "click",
		function(e) {
			if (this.connections > 0)
				return;

			this.toggleOpenedByUser();
			this.forceToggle();
			this.repaintSiblings();
		}.bind(this)
	);
	this.tabDiv.appendChild(this.htmlElement);
}

/**
 * @private
 * Increments the counter of connections in this tab.
 */
ConnectableTabInterface.prototype._increaseConnections = function() {
	this.connections++;
}

/**
 * @private
 * Decrements the counter of connections in this tab.
 */
ConnectableTabInterface.prototype._decreaseConnections = function() {
	this.connections--;
}

ConnectableTabInterface.prototype.toggleOpenedByUser = function(){
	if (this.folded ||(!this.folded && this.openedByUser)) {
		this.openedByUser = !this.openedByUser;
	}
}

//toggle ordered automatically, for instance, changing channels
ConnectableTabInterface.prototype.toggle = function () {
	//if the user hasn't touch the tab, it can automatically toggle
	if(this.folded || (!this.folded && !this.openedByUser && this.igadgetsOpenedByUser <= 0)){
		this.forceToggle();
	}
}

ConnectableTabInterface.prototype.forceToggle = function () {
	//forced toggle
	this.folded = !this.folded;
	var igadgets = this.tabDiv.getElementsByClassName("igadget");

	for (var i = 0; i < igadgets.length; i++) {
		igadgets[i].toggleClassName("folded");
	}
}

/**
 *
 * @param {ConnectableGroupInterface} group
 */
ConnectableTabInterface.prototype._addConnectableGroup = function (group) {
	this.tabDiv.appendChild(group.getHTMLElement());
}

ConnectableTabInterface.prototype.isAnyFolded = function () {
	return this.folded;
}

ConnectableTabInterface.prototype.isAnyUnfolded = function () {
	return !this.folded;
}


/////////////////////////////////////////////////
//    SLOT AND EVENT INTERFACE FOR THE TAB     //
/////////////////////////////////////////////////


/**
 * @class
 * This class represents the interface that groups all the slots (classified by
 * igadgets) of a Tab. This interface also has the anchor for connecting this
 * tab as output of a channel.
 *
 * @param {Tab}
 * @param {WiringInterface}
 */
function SlotTabInterface (tab, wiringGUI) {
	ConnectableTabInterface.call(this, wiringGUI, tab.tabInfo.name);

	this.tabConnectable = tab.connectable;
	wiringGUI._registerConnectable(this);

	// create an anchor for the tab
	this.tabAnchor = new TabConnectionAnchor(this);
	var chkItem = this.tabAnchor.getHTMLElement();
	this.htmlElement.appendChild(chkItem);

	Event.observe(chkItem, "click",
		function (e) {
			this.wiringGUI._changeConnectionStatus(this.tabAnchor);
			Event.stop(e); // Stop event propagation
		}.bind(this), false);
	this.wiringGUI.outputs.push(this);
}
SlotTabInterface.prototype = new ConnectableTabInterface();

/**
 * As this <code>SlotTabInterface</code> acts as the interface for the tab.
 * This method returns the <code>wConnectable</code> associated to the
 * connectable of this tab.
 */
SlotTabInterface.prototype.getConnectable = function() {
	return this.tabConnectable;
}

/**
 * As this <code>SlotTabInterface</code> acts as the interface for the tab,
 * this method returns the <code>TabConnectionAnchor</code> associated to the
 * connectable of this tab.
 */
SlotTabInterface.prototype.getAnchor = function() {
	return this.tabAnchor;
}

SlotTabInterface.prototype.getFriendCode = function() {
	return "go_tab_event";
}

SlotTabInterface.prototype.show = function () {
	this.wiringGUI.slot_list.appendChild(this.tabDiv);
	if (this.tabDiv.childNodes.length == 1) { //Elements withouth gadgets
		this.tabDiv.getElementsByClassName("tabContent")[0].removeClassName("bckgrnd_folder");
	}

	//fold the tab if the user hasn't specify not doing it.
	if(!this.wiringGUI.unfold_on_entering)
		this.forceToggle();
}

SlotTabInterface.prototype.repaintSiblings = function () {
	if (this.wiringGUI.currentChannel == null)
		return;

	this.wiringGUI._uncheckChannelOutputs(this.wiringGUI.currentChannel);
	this.wiringGUI._highlightChannelOutputs(this.wiringGUI.currentChannel);
}

/**
 * @class
 * This class represents the interface that groups all the events (classified by
 * igadgets) of a Tab.
 *
 * @param {Tab}
 * @param {WiringInterface}
 */
function EventTabInterface (tab, wiringGUI) {
	ConnectableTabInterface.call(this, wiringGUI, tab.tabInfo.name);
}
EventTabInterface.prototype = new ConnectableTabInterface();

EventTabInterface.prototype.show = function () {
	if (this.tabDiv.childNodes.length > 1) { //Elements with gadgets
		this.wiringGUI.event_list.appendChild(this.tabDiv);
	} else {
		this.tabDiv.getElementsByClassName("tabContent")[0].removeClassName("bckgrnd_folder");
	}

	//fold the tab if the user hasn't specify not doing it.
	if (!this.wiringGUI.unfold_on_entering)
		this.forceToggle();
}

EventTabInterface.prototype.repaintSiblings = function () {
	if (this.wiringGUI.currentChannel == null)
		return;

	this.wiringGUI._uncheckChannelInputs(this.wiringGUI.currentChannel);
	this.wiringGUI._highlightChannelInputs(this.wiringGUI.currentChannel);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Generic class for the lists of Events and Slots of the igadgets
 */
function ConnectableGroupInterface (wiringGUI, parentInterface, headerText) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	this.wiringGUI = wiringGUI;
	this.folded = false;
	this.headerText = headerText;
	this.connections = 0;
	this.parentInterface = parentInterface;
	this.openedByUser = false;  //is the igadget open and has the user done it??

	this.htmlElement = document.createElement("div");
	this.htmlElement.addClassName("igadget");

	// Header
	var headerHtml = document.createElement("div");
	headerHtml.addClassName("igadgetName");
	if (headerText != null)
		headerHtml.appendChild(document.createTextNode(headerText));

	//folding event
	Event.observe(headerHtml, "click",
		function(e) {
			Event.stop(e);
			if (this.connections <= 0){
				this.toggleOpenedByUser();
				this.forceToggle();
				this.repaintSiblings() // repaint the arrows if needed
			}
		}.bind(this));

	this.htmlElement.appendChild(headerHtml);

	// List of connectables
	this.ulConnectables = document.createElement("div");
	this.ulConnectables.addClassName("igadgetContent");
	this.htmlElement.appendChild(this.ulConnectables);

	this.parentInterface._addConnectableGroup(this);
}

ConnectableGroupInterface.prototype._increaseConnections = function() {
	this.connections++;
	this.parentInterface._increaseConnections();
}

ConnectableGroupInterface.prototype._decreaseConnections = function() {
	if (this.connection >= 1) {
		this.connections--;
		this.parentInterface._decreaseConnections();
	} /* else {
		TODO warning
	*/
}

ConnectableGroupInterface.prototype.toggleOpenedByUser = function() {
	if (this.folded || (!this.folded && this.openedByUser)) {
		this.openedByUser = !this.openedByUser;
		if (this.openedByUser)
			this.parentInterface.igadgetsOpenedByUser++;
		else
			this.parentInterface.igadgetsOpenedByUser--;
	}
}

ConnectableGroupInterface.prototype.hasConnectables = function() {
	return this.htmlElement != null;
}

ConnectableGroupInterface.prototype.getConnectables = function() {
	return this.htmlElement;
}

ConnectableGroupInterface.prototype.getHTMLElement = function() {
	return this.htmlElement;
}

/**********
 *
 **********/

/**
 * @abstract
 * This class represents the interface associated to a given connectable in the
 * wiring GUI. As each connectable has a different interface, this class can not be
 * used directly (it is abstract).
 *
 * @param {Connectable} connectable
 * @param {ConnectableAnchor} anchor
 */
function ConnectableInterface(connectable, anchor) {
	this.connectable = connectable;
	this.anchor = anchor;
}

ConnectableInterface.prototype.getConnectable = function() {
	return this.connectable;
}

ConnectableInterface.prototype.getAnchor = function() {
	return this.anchor;
}

/**
 *
 * @see ConnectableInterface
 */
function ChannelInterface(channel, wiringGUI) {
	this.wiringGUI = wiringGUI;

	if (channel instanceof wChannel) {
		// Existant channel
		this.connectable = channel;
		this.name = channel.getName();
		this.inputs = channel.inputs.clone();
		this.outputs = channel.outputs.clone();
		this.filter = channel.getFilter();
		this.filterParams = channel.getFilterParams();
	} else {
		// New channel
		this.connectable = null;
		this.name = channel;
		this.inputs = new Array();
		this.outputs = new Array();
		this.provisional_id = wiringGUI._newProvisionalChannelId();
		this.filter = null;
		this.filterParams = new Array();
	}

	this.inputsForAdding = new Array();
	this.inputsForRemoving = new Array();
	this.outputsForAdding = new Array();
	this.outputsForRemoving = new Array();

	// Anchors
	this.inAnchor = new OutConnectionAnchor(this);
	this.outAnchor = new InConnectionAnchor(this);

	// HTML interface
	this.htmlElement = document.createElement("div");
	this.htmlElement.addClassName("channel");

	var channelPipe = document.createElement("div");
	channelPipe.className = 'channelPipe';
	this.htmlElement.appendChild(channelPipe);

	Event.observe(channelPipe, "click",
	                function (e) {
	                  Event.stop(e);
	                  this.wiringGUI._changeChannel(this);
	                }.bind(this));

	var inputDel = document.createElement("img");
	channelPipe.appendChild(inputDel);
	inputDel.setAttribute("alt", gettext("Remove"));
	inputDel.setAttribute("src", "/ezweb/images/remove.png");
	Event.observe(inputDel,
	              'click',
	              function (e) {
	                  Event.stop(e);
	                  this.wiringGUI._removeChannel(this);
	              }.bind(this));

	var channelNameInput = document.createElement("input");
	channelPipe.appendChild(channelNameInput);
	channelNameInput.setAttribute ("value", this.name);
	channelNameInput.addClassName ("channelNameInput");
	Event.observe(channelNameInput,
	              'click',
	              function(e) {
	                  if (this.wiringGUI.currentChannel == this)
	                      Event.stop(e); //do not propagate to div.
	              }.bind(this));

	var checkName = function(e) {
		if (e.target.value == "" || e.target.value.match(/^\s$/)) {
			var msg = gettext("Error updating a channel. Invalid name");
			LogManagerFactory.getInstance().log(msg);
			e.target.value=this.channel.getName();
		} else if (this.wiringGUI.channelExists(e.target.value)) {
			var msg = gettext("Error updating a channel. %(channelName)s: Channel already exists");
			msg = interpolate(msg, {channelName: e.target.value}, true);
			LogManagerFactory.getInstance().log(msg);
			e.target.value=this.channel.getName();
		} else {
			this.setName(e.target.value)
		}
	}
	Event.observe(channelNameInput, 'change', checkName.bind(this));

	var channelContent = document.createElement("div");
	this.htmlElement.appendChild(channelContent);
	channelContent.addClassName("channelContent");
	Event.observe(channelContent, 'click', function(e) {Event.stop(e);});

	// Channel information showed when the channel is selected
	var contentTable = document.createElement("table");
	contentTable.addClassName("contentTable");
	channelContent.appendChild(contentTable);

	// Creates the row for the channel information
	var contentRow = document.createElement("tr");
	contentTable.appendChild(contentRow);

	// Creates a layer for the labels
	var labelCol = document.createElement("td");
	labelCol.addClassName("column");
	contentRow.appendChild(labelCol);
	var labelLayer = document.createElement("div");
	labelLayer.addClassName("labelContent");
	labelCol.appendChild(labelLayer);

	// Creates a layer for the information
	var contentCol = document.createElement("td");
	contentCol.addClassName("column");
	contentRow.appendChild(contentCol);
	var contentLayer = document.createElement("div");
	contentCol.appendChild(contentLayer);

	// Adds all labels
	var filterLabel = document.createElement("div");
	labelLayer.appendChild(filterLabel);
	filterLabel.appendChild(document.createTextNode(gettext("Filter") + ":"));
	var paramLabelLayer = document.createElement("div");
	labelLayer.appendChild(paramLabelLayer);
	if (this.filter) {
		for (var p = 0; p < this.filterParams.length; p++)
			paramLabelLayer.appendChild(this.filterParams[p].createHtmlLabel());
	}
	var valueLabel = document.createElement("div");
	labelLayer.appendChild(valueLabel);
	valueLabel.appendChild(document.createTextNode(gettext("Value") + ":"));

	// Adds the information
	var filterText = document.createElement("div");
	filterText.addClassName("filterValue");
	contentLayer.appendChild(filterText);
	if (this.filter)
		filterText.appendChild(document.createTextNode(this.filter.getLabel()));
	else
		filterText.appendChild(document.createTextNode(gettext("Empty")));

	var filterMenuButton = document.createElement("input");
	filterText.appendChild(filterMenuButton);
	filterMenuButton.setAttribute("type", "button");
	filterMenuButton.addClassName("filterMenuLauncher");
	Event.observe(filterMenuButton, 'click',
		function(e) {
			e.target.blur();
			Event.stop(e);
			LayoutManagerFactory.getInstance().showDropDownMenu(
				'filterMenu',
				this.wiringGUI.filterMenu,
				Event.pointerX(e),
				Event.pointerY(e));
		}.bind(this)
	);
	var paramValueLayer = document.createElement("div");
	contentLayer.appendChild(paramValueLayer);

	// Adds the channel value
	var valueText = document.createElement("div");
	contentLayer.appendChild(valueText);
	if (this.filter) {
		for (var p = 0; p < this.filterParams.length; p++)
			paramValueLayer.appendChild(this.filterParams[p].createHtmlValue(this, channel, valueText));
	}
	valueText.appendChild(document.createTextNode(this.getValue()));

	channelNameInput.focus();

	// Anchors
	var inAnchorElement = this.inAnchor.getHTMLElement();
	inAnchorElement.addClassName("inAnchor");
	Event.observe(inAnchorElement, "click",
		function (e) {
			this.wiringGUI._changeConnectionStatus(this.inAnchor);
			Event.stop(e); // Stop event propagation
		}.bind(this), false);
	this.htmlElement.appendChild(inAnchorElement);

	var outAnchorElement = this.outAnchor.getHTMLElement()
	outAnchorElement.addClassName("outAnchor");
	Event.observe(outAnchorElement, "click",
		function (e) {
			this.wiringGUI._changeConnectionStatus(this.outAnchor);
			Event.stop(e); // Stop event propagation
		}.bind(this), false);
	this.htmlElement.appendChild(outAnchorElement);
}
ChannelInterface.prototype = new ConnectableInterface();

/**
 */
ChannelInterface.prototype.initialize = function() {
	for (var i = 0; i < this.inputs.length; i++)
		this.inputs[i] = this.wiringGUI.getConnectableByQName(this.inputs[i].getQualifiedName());

	for (var i = 0; i < this.outputs.length; i++)
		this.outputs[i] = this.wiringGUI.getConnectableByQName(this.outputs[i].getQualifiedName());
}

/**
 * Returns the anchor that represents the input anchor for this channel. This
 * anchor is an <code>OutConnectionAnchor</code> as it really acts as a target
 * for connections (as an Slot).
 *
 * @return {OutConnectionAnchor}
 */
ChannelInterface.prototype.getInputAnchor = function() {
	return this.inAnchor;
}

/**
 * Returns the anchor that represents the output anchor for this channel. This
 * anchor is an <code>InConnectionAnchor</code> as it really acts as a source
 * for connections (as an Event).
 *
 * @return {InConnectionAnchor}
 */
ChannelInterface.prototype.getOutputAnchor = function() {
	return this.outAnchor;
}

ChannelInterface.prototype.getFriendCode = function() {
	return "";
}

ChannelInterface.prototype.setName = function(newName) {
	this.name = newName;
}

ChannelInterface.prototype.getId = function() {
	if (this.connectable != null)
		return this.connectable.getId();
	else
		return this.provisional_id;
}

ChannelInterface.prototype.getInputs = function() {
	return this.inputs;
}

ChannelInterface.prototype.getOutputs = function() {
	return this.outputs;
}

ChannelInterface.prototype.getName = function() {
	return this.name;
}

ChannelInterface.prototype.getFilter = function() {
	return this.filter;
}

ChannelInterface.prototype.setFilter = function(filter_) {
	this.filter = filter_;
	this.filterParams = new Array ();

	// Sets parameter values by default
	if (filter_ != null) {
		var paramDefinition = filter_.getParams();
		this.filterParams = new Array (paramDefinition.length);
		for (var p = 0; p < paramDefinition.length; p++) {
			var defaultaValue = paramDefinition[p].getDefaultValue();
			if ((defaultaValue == null) || (defaultaValue == "") || defaultaValue.match(/^\s$/)) {
				this.filterParams[p] = "";
			} else {
				this.filterParams[p] = defaultaValue;
			}
		}
	}
}

ChannelInterface.prototype.getFilterParams = function() {
	return this.filterParams;
}


ChannelInterface.prototype.setFilterParams = function(params_) {
	this.filterParams = params_;
}

ChannelInterface.prototype.getValue = function() {
	if (this.connectable) {
		return this.connectable.getValue();
	} else {
		return gettext("undefined"); // TODO
	}
}

ChannelInterface.prototype.getValueWithoutFilter = function() {
	if (this.connectable) {
		return this.connectable.getValueWithoutFilter();
	} else {
		return gettext("undefined"); // TODO
	}
}

/**
 * @param {Wiring} wiring
 * @param {Number} phase current phase:
 *                 1 -> Creation
 *                 2 -> Updating
 */
ChannelInterface.prototype.commitChanges = function(wiring, phase) {
	var i;
	switch (phase) {
	case 1: // Creation
		if (this.connectable == null)
			this.connectable = wiring.createChannel(this.name, this.provisional_id);
		break;
	case 2: // Updates
		// Update channel name
		this.connectable._name= this.name;

		// Update filter and filter params
		this.connectable.setFilter(this.filter);
		this.connectable.setFilterParams(this.filterParams);

		// Inputs for removing
		for (i = 0; i < this.inputsForRemoving.length; i++)
			this.inputsForRemoving[i].getConnectable().disconnect(this.connectable.getConnectable());

		this.inputsForRemoving.clear();

		// Outputs for removing
		for (i = 0; i < this.outputsForRemoving.length; i++)
			this.connectable.disconnect(this.outputsForRemoving[i].getConnectable());

		this.outputsForRemoving.clear();

		// Outputs for adding
		for (i = 0; i < this.outputsForAdding.length; i++)
			this.connectable.connect(this.outputsForAdding[i].getConnectable());

		this.outputsForAdding.clear();

		// Inputs for adding
		for (i = 0; i < this.inputsForAdding.length; i++)
			this.inputsForAdding[i].getConnectable().connect(this.connectable);

		this.inputsForAdding.clear();
		break;
	}
}

/**
 * Returns whether this ChannelInterface represents a channel currently existing
 * in the wiring module.
 *
 * @return {Boolean} true if this ChannelInterface represents a channels that
 * exists in the wiring module.
 */
ChannelInterface.prototype.exists = function() {
	return this.connectable != null;
}

ChannelInterface.prototype.check = function() {
	this.htmlElement.addClassName("selected");
	this.htmlElement.getElementsByClassName('channelNameInput')[0].focus();
}

ChannelInterface.prototype.uncheck = function() {
	this.htmlElement.removeClassName("selected");
	this.htmlElement.getElementsByClassName('channelNameInput')[0].blur();
}

ChannelInterface.prototype.getHTMLElement = function() {
	return this.htmlElement;
}

/**
 * Marks this ChannelInterface for deletion. All the connections with other
 * connectables will be disconnected. As all the operations over Connectable
 * Interfaces, it wont be reflected on the wiring module until the changes were
 * commited.
 */
ChannelInterface.prototype.remove = function() {
	var inputs = this.inputs.clone();
	for (var i = 0; i < inputs.length; i++)
		this.disconnectInput(inputs[i]);

	var outputs = this.outputs.clone();
	for (var i = 0; i < outputs.length; i++)
		this.disconnectOutput(outputs[i]);
}

/**
 * @param {ConnectableInterface} interface connectable to connect as input for
 *        this Channel.
 */
ChannelInterface.prototype.connectInput = function(interface) {
	if (interface instanceof ChannelInterface) {
		this.inputs.push(interface);
		return;
	}

	if (this.connectable != null &&
		this.connectable.inputs.elementExists(interface.getConnectable())) {
		this.inputsForRemoving.remove(interface);
	} else {
		this.inputsForAdding.push(interface);
	}
	this.inputs.push(interface);
}

/**
 * @param {ConnectableInterface} interface connectable to disconnect as input
 *        for this Channel.
 */
ChannelInterface.prototype.disconnectInput = function(interface) {
	if (interface instanceof ChannelInterface) {
		this.inputs.remove(interface);
		return;
	}

	if (this.connectable != null &&
		this.connectable.inputs.elementExists(interface.getConnectable())) {
		this.inputsForRemoving.push(interface);
	} else {
		this.inputsForAdding.remove(interface);
	}
	this.inputs.remove(interface);
}

/**
 * @param {ConnectableInterface} interface connectable to connect as output for
 *        this Channel.
 */
ChannelInterface.prototype.connectOutput = function(interface) {
	if (this.connectable != null &&
		this.connectable.outputs.elementExists(interface.getConnectable())) {
		this.outputsForRemoving.remove(interface);
	} else {
		this.outputsForAdding.push(interface);
	}
	this.outputs.push(interface);
}

/**
 * @param {ConnectableInterface} interface connectable to disconnect as output
 *        for this Channel.
 */
ChannelInterface.prototype.disconnectOutput = function(interface) {
	if (this.connectable != null &&
		this.connectable.outputs.elementExists(interface.getConnectable())) {
		this.outputsForRemoving.push(interface);
	} else {
		this.outputsForAdding.remove(interface);
	}
	this.outputs.remove(interface);
}

/**
 * This method ensures that this object does not reference to other objects,
 * avoiding circual references and allowing to the garbage collector to remove
 * they from memory.
 */
ChannelInterface.prototype.destroy = function() {
	this.wiringGUI = null;
}

/**
 * @abstract
 * This class is the base for the simple connectable interfaces. For now, this
 * basic interfaces are the ones for the slots and the events of the igadgets.
 *
 * @param {wConnectable} connectable
 * @param {ConnectableAnchor} anchor
 * @param {ConnectableGroupInterface} group
 */
function SimpleConnectableInterface (connectable, anchor, group) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	this.connected = false;

	ConnectableInterface.call(this, connectable, anchor);
	this.parentInterface = group;
	this.htmlElement = document.createElement("div");

	this.htmlElement.appendChild(document.createTextNode(connectable.getLabel()));

	var chkItem = anchor.getHTMLElement();
	this.htmlElement.appendChild(chkItem);

	var context = {chkItemAnchor: anchor, wiringGUI:this.wiringGUI};
	Event.observe(chkItem,
		"click",
		function () {
			this.wiringGUI._changeConnectionStatus(this.chkItemAnchor);
		}.bind(context));

	// Harvest info about the friendCode of the connectable
	var friendCode = connectable.getFriendCode();
	if (friendCode != null) {
		var context = {friendCode: friendCode, wiringGUI:this.wiringGUI};

		this.htmlElement.addEventListener("mouseover",
			function () {
				this.wiringGUI._highlight_friend_code(this.friendCode, true);
			}.bind(context),
			false);

		this.htmlElement.addEventListener("mouseout",
			function () {
				this.wiringGUI._highlight_friend_code(this.friendCode, false);
			}.bind(context),
			false);
	}

	// Cancel bubbling of forceToggle
	function cancelbubbling(e) {
		Event.stop(e);
	}

	this.htmlElement.addEventListener("click", cancelbubbling, false);
}
SimpleConnectableInterface.prototype = new ConnectableInterface();

SimpleConnectableInterface.prototype.getFriendCode = function() {
	return this.connectable.getFriendCode();
}

SimpleConnectableInterface.prototype.getHTMLElement = function() {
	return this.htmlElement;
}

SimpleConnectableInterface.prototype._increaseConnections = function() {
	if (this.connected == true) {
		// TODO log
		return;
	}

	this.connected = true;
	this.parentInterface._increaseConnections();
}

SimpleConnectableInterface.prototype._decreaseConnections = function() {
	if (this.connected == false) {
		// TODO log
		return;
	}

	this.connected = false;
	this.parentInterface._decreaseConnections();
}

/**
 * This class corresponds with the interface to represent an Slot into the
 * wiring Interface.
 *
 * @param {WiringInterface} wiringGUI
 * @param {wSlot} connectable
 * @param {ConnectableGroupInterface} group
 */
function SlotInterface(wiringGUI, connectable, group) {
	this.chkItemAnchor = new SlotConnectionAnchor(this);
	this.wiringGUI = wiringGUI;

	SimpleConnectableInterface.call(this, connectable, this.chkItemAnchor, group);
	this.wiringGUI._registerSlot(this);
}
SlotInterface.prototype = new SimpleConnectableInterface();

/**
 * This class corresponds with the interface to represent an Event into the
 * wiring Interface.
 *
 * @param {WiringInterface} wiringGUI
 * @param {wSlot} connectable
 * @param {ConnectableGroupInterface} group
 */
function EventInterface(wiringGUI, connectable, group) {
	this.chkItemAnchor = new EventConnectionAnchor(this);
	this.wiringGUI = wiringGUI;

	SimpleConnectableInterface.call(this, connectable, this.chkItemAnchor, group);
	this.wiringGUI._registerEvent(this);
}
EventInterface.prototype = new SimpleConnectableInterface();

/**
 * Toggles this <code>ConnectableGroupInterface</code> except in the case the user
 * opened it manually.
 */
ConnectableGroupInterface.prototype.toggle = function () {
	//if the user hasn't touch the igadget, it can automatically toggle
	if (!this.openedByUser)
		this.forceToggle();

	if (this.folded != this.parentInterface.folded)
		this.parentInterface.toggle();
}

/**
 * Toggles this <code>ConnectableGroupInterface</code>
 */
ConnectableGroupInterface.prototype.forceToggle = function () {
	this.folded = !this.folded;
	this.htmlElement.getElementsByClassName("igadgetContent")[0].toggleClassName("folded");
	this.htmlElement.getElementsByClassName("igadgetName")[0].toggleClassName("bckgrnd_folded");
}

/**
 * Returns true if there are any unfolded interface.
 */
ConnectableGroupInterface.prototype.isAnyFolded = function () {
	return this.folded || this.parentInterface.folded;
}

/**
 * Returns true if there are any unfolded interface.
 */
ConnectableGroupInterface.prototype.isAnyUnfolded = function () {
	return !this.folded || !this.parentInterface.folded;
}

/**
 * Expands this <code>ConnectableGroupInterface</code>.
 */
ConnectableGroupInterface.prototype.massiveExpand = function () {
	if (this.folded) {
		// the igadget is folded
		this.toggleOpenedByUser();
		this.forceToggle();
		if (this.folded != this.parentInterface.folded) {//if the parent is folded
			this.parentInterface.toggle();
		}
	} else if (this.openedByUser && this.parentInterface.folded) {
		// if the gadget is open by the user but the parent is folded
		this.parentInterface.toggle();
	} else if (!this.openedByUser) {
		//the igadget is open because it is conected to an opened channel
		this.openedByUser = true;
		this.parentInterface.igadgetsOpenedByUser++;
	}
}

/**
 * Collapses all the connectables of this
 * <code>ConnectableGroupInterface</code>.
 */
ConnectableGroupInterface.prototype.massiveCollapse = function () {
	if (!this.folded && this.openedByUser) { //the igadget is folded
		this.toggleOpenedByUser();
		if (this.connections <= 0) { //collapse only if the gadget don't have any connections
			this.forceToggle();
		}
	}
	if (this.folded != this.parentInterface.folded) {//if the parent isn't folded
		if (this.parentInterface.connections <= 0) {
			this.parentInterface.toggleOpenedByUser();
			this.parentInterface.toggle();
		}
	}
}


////////////////////////////////////////////////////////////
//       SLOT AND EVENT INTERFACE OF THE IGADGETS         //
////////////////////////////////////////////////////////////

/**
 * @class
 *
 * This class represents the interface that groups all the slots of a given
 * IGadget.
 */
function IGadgetSlotsInterface (igadget, wiringGUI, parentInterface) {
	ConnectableGroupInterface.call(this, wiringGUI, parentInterface, igadget.name);

	var connectables = wiringGUI.wiring.getIGadgetConnectables(igadget);

	// Create Slot interfaces for the slots of this igadget
	for (var i = 0; i < connectables.length; i++) {
		var connectable = connectables[i];
		if (!(connectable instanceof wSlot))
			continue;

		var interface = new SlotInterface(wiringGUI, connectable, this);

		// Insert the HTMLElement of the interface on the ul element
		this.ulConnectables.appendChild(interface.getHTMLElement());
	}
}
IGadgetSlotsInterface.prototype = new ConnectableGroupInterface();

IGadgetSlotsInterface.prototype.repaintSiblings = function(channel) {
	if (this.wiringGUI.currentChannel == null)
		return

	this.wiringGUI._uncheckChannelOutputs(channel);
	this.wiringGUI._highlightChannelOutputs(channel);
}

/**
 * @class
 *
 * This class represents the interface that groups all the events of a given
 * IGadget.
 */
function IGadgetEventsInterface (igadget, wiringGUI, parentInterface) {
	ConnectableGroupInterface.call(this, wiringGUI, parentInterface, igadget.name);

	var connectables = wiringGUI.wiring.getIGadgetConnectables(igadget);

	// Create Event interfaces for the events of this igadget
	for (var i = 0; i < connectables.length; i++) {
		var connectable = connectables[i];
		if (!(connectable instanceof wEvent))
			continue;

		var interface = new EventInterface(wiringGUI, connectable, this);

		// Insert the HTMLElement of the interface on the ul element
		this.ulConnectables.appendChild(interface.getHTMLElement());
	}
}
IGadgetEventsInterface.prototype = new ConnectableGroupInterface();

IGadgetEventsInterface.prototype.repaintSiblings = function(channel) {
	if (this.wiringGUI.currentChannel == null)
		return;

	this.wiringGUI._uncheckChannelInputs(channel);
	this.wiringGUI._highlightChannelInputs(channel);
}
