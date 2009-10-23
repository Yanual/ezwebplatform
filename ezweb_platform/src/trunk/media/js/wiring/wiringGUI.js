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


function WiringInterface(wiring, workspace, wiringContainer, wiringLink) {

	// ***********************************
	//  PRIVATE METHODS AND ATTRIBUTES
	// ***********************************

	this.workspace = workspace;
	this.wiring = wiring;
	this.wiringContainer = wiringContainer;
	this.wiringLink = wiringLink;

	this.opmanager = OpManagerFactory.getInstance();
	this.currentChannel = null;
	this.connectablesByQName = {};
	this.inputs = new Array(); // Input connections (events & inouts)
	this.outputs = new Array(); // Output connections (slots & inouts)
	this.channels = new Array();
	this.channelsByName = {};
	this.channelsToRemove = [];
	this.friend_codes = {};
	this.friend_codes_counter = 0;
	this.channelBaseName = gettext("Channel");
	this.visible = false; // TODO temporal workarround
	this.unfold_on_entering = false; //Does the user want all tabs to be expanded?

	Event.observe($('wiring_link'), "click", function(){OpManagerFactory.getInstance().activeWorkSpace.showWiring()}, false, "show_wiring");

	this.eventColumn = $('eventColumn');
	this.slotColumn = $('slotColumn');
	this.event_list = $('events_list');
	this.slot_list = $('slots_list');
	this.channels_list = $('channels_list');
	this.newChannel = $('newChannel');
	this.wiringTable = $('wiring_table');

	// Create the canvas for the connection arrows
	this.canvas = new Canvas();
	this.canvas.addClassName('canvas');
	this.canvasElement = this.canvas.getHTMLElement();
	$('wiring_wrapper').appendChild(this.canvasElement);


	// folding/unfolding all tabs events
	var titleElement;

	this.eventTabs = new ConnectableColumnInterface(this.event_list);
	titleElement = this.eventColumn.getElementsByClassName("title")[0];

	this._toggleEventColumnEvent = function (e) {this.toggleEventColumn()}.bind(this);
	Event.observe(titleElement, "click", this._toggleEventColumnEvent);

	// Slots
	this.slotTabs = new ConnectableColumnInterface(this.slot_list);
	titleElement = this.slotColumn.getElementsByClassName("title")[0];

	this._toggleSlotColumnEvent = function (e) {this.toggleSlotColumn()}.bind(this);
	Event.observe(titleElement, "click", this._toggleSlotColumnEvent);

	Event.observe($('unfold_all_link'), "click",
	            function () {
	              this.toggleEventColumn(true);
	              this.toggleSlotColumn(true);
	          }.bind(this));

	Event.observe($('unfold_chkItem'), "click",
	            function(e) {
	              //the user wants all unfolded
	              var target = BrowserUtilsFactory.getInstance().getTarget(e);
	              target.toggleClassName('chkItem');
	              this.unfold_on_entering = target.hasClassName('chkItem');
	            }.bind(this));

	this._eventCreateChannel = function (e) {
		Event.stop(e);
		this._createChannel();
		this.toggleEventColumn(true);
		this.toggleSlotColumn(true);
	}.bind(this)

	Event.observe(this.newChannel, 'click', this._eventCreateChannel);

	// Menues
	this._createFilterMenu();
	this._createRemoteChannelOperationsMenu();
}

WiringInterface.prototype.show = function () {
	if (this.visible)
		return; // Nothing to do

	this.visible = true;
	this.renewInterface();
	LayoutManagerFactory.getInstance().showWiring(this);
}

WiringInterface.prototype.hide = function () {
	if (!this.visible)
		return; // Nothing to do

	this.visible = false;
	if (this.currentChannel) {
		this.uncheckChannel(this.currentChannel);
		this.currentChannel = null;
	}

	this.saveWiring();

	LayoutManagerFactory.getInstance().hideView(this.wiringContainer);
}

WiringInterface.prototype.unload = function () {
	this._clear();

	Event.stopObserving(this.newChannel, 'click', this._eventCreateChannel);

	// Remove canvas
	this.canvas.clear();
	$('wiring_wrapper').removeChild(this.canvasElement);
	this.canvas = null;
	this.canvasElement = null;

	// Remove Filter Menu
	var filterMenu = $('wiring_filter_menu');
	this.filterMenu.remove();
	this.filterMenu = null;
}

WiringInterface.prototype.setFilterParam = function () {
	this.changed = true;
}

WiringInterface.prototype.notifyRemoteSubscriptionChange = function () {
	this.changed = true;
}

WiringInterface.prototype.saveWiring = function () {
	if (!this.changed)
		return; // Nothing to do

	// Phase 1. Connection deletion
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].commitChanges(this.wiring, 1);
	}

	// Phase 2. Channel deletion
	for (var i = 0; i < this.channelsToRemove.length; i++) {
		this.wiring.removeChannel(this.channelsToRemove[i].getConnectable());
		this.channelsToRemove[i].destroy();
	}

	// Phase 3. Channel creation and general updates
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].commitChanges(this.wiring, 3);
	}

	// Phase 4. Connection creation
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].commitChanges(this.wiring, 4);
	}

	this.channelsToRemove = {};

	// The wiring engine is notified in order to persist state!
	this.wiring.serialize();
	
	// Re-subscribing to all external channels!
	this.workspace.subscribe_to_channels();

	// TODO error control
	this.changed = false;
}

/**
 * Adds a Tab into the wiring interface adding all the igadgets in that Tab
 * with their slots and events.
 *
 * @private
 * @param {Tab} tab
 */
WiringInterface.prototype._addTab = function (tab) {
	var tabEvents = new EventTabInterface(tab, this);
	this.eventTabs.add(tabEvents);

	var tabSlots = new SlotTabInterface(tab, this);
	this.slotTabs.add(tabSlots);

	// Igadgets
	var igadgets = tab.dragboard.getIGadgets();
	for (var i = 0; i < igadgets.length; i++) {
		this._addIGadget(igadgets[i], tabEvents, tabSlots);
	}

	if (!this.unfold_on_entering) {
		tabEvents.toggle(false);
		tabSlots.toggle(false);
	}
}

/**
 * Adds a IGadget into the wiring interface adding all its slots and events.
 *
 * @private
 * @param {IGadget} igadget
 * @param {EventTabInterface} tabEvents
 * @param {SlotsTabInterface} tabSlots
 */
WiringInterface.prototype._addIGadget = function (igadget, tabEvents, tabSlots) {
	var igadgetEvents = new IGadgetEventsInterface(igadget, this, tabEvents);
	var igadgetSlots = new IGadgetSlotsInterface(igadget, this, tabSlots);
}

/**
 * @private
 * This function is used by _registerEvent and _registerSlot
 *
 * @param {ConnectableInterface} _interface
 */
WiringInterface.prototype._registerConnectable = function(_interface) {
	this.connectablesByQName[_interface.getConnectable().getQualifiedName()] = _interface;

	// Harvest friend code info
	var friendCode = _interface.getFriendCode();

	if (friendCode === null)
		return;

	if (this.friend_codes[friendCode] == undefined) {
		// Create the friend code entry in the list of friend codes
		this.friend_codes[friendCode] = {};
		this.friend_codes[friendCode].list = [];
		this.friend_codes[friendCode].color = this.color_scheme[this.friend_codes_counter++];
	}
	this.friend_codes[friendCode].list.push(_interface);
}

/**
 *
 */
WiringInterface.prototype.getConnectableByQName = function(qname) {
	return this.connectablesByQName[qname];
}

/**
 * @private used by <code>ChannelInterface</code>
 */
WiringInterface.prototype._notifyNameChange = function(oldName, newName, channel) {
	if (this.channelsByName[oldName] == channel) {
		this.channelsByName[newName] = channel;
		delete this.channelsByName[oldName];
		this.changed = true;
	} else {
		// TODO log error
	}
}

/**
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._registerChannel = function(channel) {
	if (channel.exists())
		this._registerConnectable(channel);

	this.channels.push(channel);
	this.channelsByName[channel.getName()] = channel;
}

/**
 * @param {EventInterface} event
 */
WiringInterface.prototype._registerEvent = function(event) {
	this._registerConnectable(event);

	this.inputs.push(event);
}

/**
 * @param {SlotInterface} slot
 */
WiringInterface.prototype._registerSlot = function(slot) {
	this._registerConnectable(slot);

	this.outputs.push(slot);
}

/**
 * Expands or collapses all tabs & gadgets of the Events column, according to
 * the expand parameter.
 *
 * @param expand
 */
WiringInterface.prototype.toggleEventColumn = function (expand) {
	if (expand !== undefined) {
		if (expand)
			this.eventTabs.massiveExpand(false);
		else
			this.eventTabs.massiveFold(false);
	} else {
		this.eventTabs.massiveToggle(false);
	}

	if (this.currentChannel)
		this.redrawChannelInputs(this.currentChannel);
}

/**
 * Expands or collapses all tabs & gadgets on the Slots column, according to
 * the expand parameter.
 *
 * @param expand
 */
WiringInterface.prototype.toggleSlotColumn = function (expand) {
	if (expand !== undefined) {
		if (expand)
			this.slotTabs.massiveExpand();
		else
			this.slotTabs.massiveFold();
	} else {
		this.slotTabs.massiveToggle();
	}

	if (this.currentChannel)
		this.redrawChannelOutputs(this.currentChannel);
}

WiringInterface.prototype._clear = function() {
	// Clean the interface
	this.event_list.innerHTML = "";
	this.slot_list.innerHTML = "";
	this.channels_list.innerHTML = "";
	this.canvas.clear();

	// Clean data structures
	this.friend_codes_counter = 0;
	this.friend_codes = {};
	this.inputs.clear();
	this.outputs.clear();
	this.channelsByName = {};
	this.channelsToRemove = [];
	this.currentChannel = null;
	this.changed = false;

	// Free channel structures
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].destroy();
	}

	this.channels = new Array();
}

WiringInterface.prototype.renewInterface = function () {
	this._clear();

	// Build the interface
	var tabs = this.workspace.tabInstances.keys();
	for (var i = 0; i < tabs.length; i++)
		this._addTab(this.workspace.tabInstances[tabs[i]]);

	var channels = this.wiring.getChannels();
	for (var i = 0; i < channels.length; i++) {
		var chInterface = new ChannelInterface(channels[i], this);
		this._registerChannel(chInterface);

		this.channels_list.appendChild(chInterface.getHTMLElement());
	}

	for (var i = 0; i < this.channels.length; i++)
		this.channels[i].initialize();
}

WiringInterface.prototype.showMessage = function (msg, type) { 
	if (type != undefined) 
		LayoutManagerFactory.getInstance().showInfoMessage(msg, type, gettext('Warning')); 
	else 
		LayoutManagerFactory.getInstance().showAlertMessage(msg); 
} 

/**
 * Toggles the connection status of the given anchor in relation to the current
 * selected channel.
 *
 * @param {ConnectionAnchor} anchor
 */
WiringInterface.prototype._changeConnectionStatus = function (anchor) {

	if (this.currentChannel == null) {
		if (this.channels.length == 0) {
			this.showMessage(gettext("Please, create a new channel before creating connections."), 10);
		} else {
			this.showMessage(gettext("Please, select a channel before creating connections."), 11);
		}
		return;
	}

	/*
	 * Change connection status on the interface and on the temporal model
	 */
	var connectable = anchor.getConnectableInterface();
	if (connectable == this.currentChannel)
		return; // nothing to do

	// Detecting in and out connectables and target anchor
	if (anchor instanceof InConnectionAnchor) {
		var connectMethod = 'connectInput';
		var connectMethod2 = 'connectOutput';
		var disconnectMethod = 'disconnectInput';
		var disconnectMethod2 = 'disconnectOutput';
		var sourceAnchor = anchor;
		var targetAnchor = this.currentChannel.getInputAnchor();
	} else {
		var connectMethod = 'connectOutput';
		var connectMethod2 = 'connectInput';
		var disconnectMethod = 'disconnectOutput';
		var disconnectMethod2 = 'disconnectInput';
		var sourceAnchor = this.currentChannel.getOutputAnchor();
		var targetAnchor = anchor;
	}

	// Change the connection status
	if (anchor.isConnected()) {
		var arrow = anchor.getConnectionArrows()[0];
		arrow.disconnect();
		this.canvasElement.removeChild(arrow.arrow);

		this.currentChannel[disconnectMethod](connectable);

		if (connectable instanceof ChannelInterface)
			connectable[disconnectMethod2](this.currentChannel);
	} else {
		if (connectable instanceof ChannelInterface) {
			var sourceConnectable = sourceAnchor.getConnectableInterface();
			var targetConnectable = targetAnchor.getConnectableInterface();
			if (!sourceConnectable.isConnectable(targetConnectable)) {
				var msg = gettext("You can not make that connection because if you do it, a loop will be created.");
				LayoutManagerFactory.getInstance().showMessageMenu(msg, Constants.Logging.WARN_MSG);
				return;
			}
		}

		var arrow = this._drawArrow(sourceAnchor, targetAnchor);

		this.currentChannel[connectMethod](connectable);

		if (connectable instanceof ChannelInterface)
			connectable[connectMethod2](this.currentChannel);
	}

	this.changed = true;
}

/**
 * Checks whether a channel with a given name exists in the current wiring
 * interface status.
 *
 * @param {String} channelName name of the channel to check
 *
 * @return true if there is a channel with the given name
 */
WiringInterface.prototype.channelExists = function(channelName) {
	return this.channelsByName[channelName] != null;
}

WiringInterface.prototype._getChannelInterfaceByName = function(channelName) {
	return this.channelsByName[channelName];
}

WiringInterface.prototype._createChannel = function () {
	var result = null;

	// Build an initial channel name
	var auxName = this.channels.length + 1;
	var channelName = this.channelBaseName + "_" + auxName++;

	// Check if there is another channel with the same name
	while (this.channelExists(channelName)) {
		// Build another channel name
		channelName = this.channelBaseName + "_" + auxName++;
	}

	// Creates the channel interface
	var channel = new ChannelInterface(channelName, this);
	this._registerChannel(channel);

	this.channels_list.appendChild(channel.getHTMLElement());

	this.changed = true;

	this._changeChannel(channel);
}

/**
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._removeChannel = function (channel) {
	if (!this.channels.elementExists(channel))
		return; // Nothing to do

	// Remove the channel from the interface
	if (this.currentChannel == channel)
		this._changeChannel(channel);

	this.channels_list.removeChild(channel.getHTMLElement());

	// Mark channel as removed
	channel.remove();

	// Repaint the wiring interface as the channel position may have changed
	if (this.currentChannel) {
		this.uncheckChannel(this.currentChannel);
		this.highlightChannel(this.currentChannel);
	}

	// If channel exists in the wiring module, destroy it when saving
	if (channel.exists())
		this.channelsToRemove.push(channel);
	else
		channel.destroy();

	// Remove the channel from the internal list of channels
	this.channels.remove(channel);
	delete this.channelsByName[channel.getName()];

	this.changed = true;
}

WiringInterface.prototype._changeChannel = function(newChannel) {
	var oldChannel = this.currentChannel;
	this.currentChannel = newChannel;

	if (oldChannel)
		this.uncheckChannel(oldChannel);

	if (oldChannel != newChannel)
		this.highlightChannel(newChannel);
	else
		this.currentChannel = null;
}

WiringInterface.prototype._highlight = function (chk, friendCode) {
	if (!this.friend_codes[friend_code]) {
		// TODO Warning
		return; // Nothing to do
	}

	var fcList = this.friend_codes[friendCode].list;
	var fcColor = this.friend_codes[friend_code].color;

	if (chk.checked) {
		for (var i = 0; i < fcList.length; i++) {
			var currentElement = fcList[i];
			currentElement.style.backgroundColor = fcColor;
		}
	} else {
		var allUnchecked = true;
		for (var i = 0; i < fcList.length; i++) {
			var currentElement = fcList[i];
			allUnchecked &= !currentElement.checked;
		}

		if (allUnchecked) {
			for (var i = 0; i < fcList.length; i++) {
				var currentElement = fcList[i];
				currentElement.style.backgroundColor = null;
			}
		}
	}
}

/**
 * @private
 *
 * Highlights all the connectables with the given friend_code
 *
 * @param {String} friend_code
 * @param {Boolean} highligh
 */
WiringInterface.prototype._highlight_friend_code = function (friend_code, highlight) {
	if (!this.friend_codes[friend_code]) {
		// TODO Warning
		return; // Nothing to do
	}

	var connectables = this.friend_codes[friend_code].list;
	var fcColor = this.friend_codes[friend_code].color;
	var fcBgColor = "#F7F7F7";
	var fcElement = null;

	if (this.friend_codes[friend_code].fadder !== undefined)
		this.friend_codes[friend_code].fadder.reset();

	if (highlight) {
		for (var i = 0; i < connectables.length; i++)
			connectables[i].getHTMLElement().style.backgroundColor = fcColor;
	} else {
		var timeout = connectables.length > 1 ? 1700 : 0;
		if (!this.friend_codes[friend_code].fadder)
			this.friend_codes[friend_code].fadder = new BackgroundFadder(connectables, fcColor, fcBgColor, timeout, 300);

		this.friend_codes[friend_code].fadder.fade();
	}
}

/**
 * Redraws all the inputs of the given channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype.redrawChannelInputs = function (channel) {
	var channelAnchor = channel.getInputAnchor();
	var connectionArrows = channelAnchor.getConnectionArrows().clone();
	for (var i = 0; i < connectionArrows.length; i++) {
		var arrow = connectionArrows[i];
		var targetAnchor = arrow.getSourceAnchor();
		arrow.disconnect();
		this.canvasElement.removeChild(arrow.arrow);

		this._drawArrow(targetAnchor, channelAnchor);
	}
}

/**
 * Redraws all the outputs of the given channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype.redrawChannelOutputs = function (channel) {
	var channelAnchor = channel.getOutputAnchor();
	var connectionArrows = channelAnchor.getConnectionArrows().clone();
	for (var i = 0; i < connectionArrows.length; i++) {
		var arrow = connectionArrows[i];
		var targetAnchor = arrow.getTargetAnchor()
		arrow.disconnect();
		this.canvasElement.removeChild(arrow.arrow);

		this._drawArrow(channelAnchor, targetAnchor);
	}
}

/**
 * @private
 *
 * Disconnects (on the Wiring Interface view) all the inputs of the given
 * channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._uncheckChannelInputs = function (channel) {
	var anchor = channel.getInputAnchor();
	var connection = anchor.getConnectionArrows().clone();
	for (var i = 0; i < connection.length; i++) {
		var arrow = connection[i];
		arrow.disconnect();
		this.canvasElement.removeChild(arrow.arrow);
	}
}


/**
 * @private
 *
 * Disconnects (on the Wiring Interface view) all the outputs of the given
 * channel. For now, this is done removing all the arrows starting
 * in the given channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._uncheckChannelOutputs = function (channel) {
	var anchor = channel.getOutputAnchor();
	var connections = anchor.getConnectionArrows().clone();
	for (var i = 0; i < connections.length; i++) {
		var arrow = connections[i];
		arrow.disconnect();
		this.canvasElement.removeChild(arrow.arrow);
	}
}

WiringInterface.prototype.uncheckChannel = function (channel) {
	channel.uncheck();

	//notify through a CSS class that there is no channel marked
	this.wiringTable.removeClassName('selected_channel');

	this._uncheckChannelInputs(channel);
	this._uncheckChannelOutputs(channel);
}

/**
 * @private
 * Makes visible the input connections of the given channel. For now, this
 * means drawing arrows from the connected Events connected to this channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._highlightChannelInputs = function (channel) {
	var channelAnchor = channel.getInputAnchor();
	var connectables = channel.getInputs();
	for (var i = 0; i < connectables.length; i++) {
		var input = connectables[i];

		if (input instanceof ChannelInterface)
			this._drawArrow(input.getOutputAnchor(), channelAnchor);
		else
			this._drawArrow(input.getAnchor(), channelAnchor);
	}
}

/**
 * @private
 * Makes visible the output connections of the given channel. For now, this
 * means drawing arrows from this channel to the connected Slots.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._highlightChannelOutputs = function (channel) {
	var channelAnchor = channel.getOutputAnchor();
	var connectables = channel.getOutputs();

	for (var i = 0; i < connectables.length; i++) {
		var output = connectables[i];

		if (output instanceof ChannelInterface)
			this._drawArrow(channelAnchor, output.getInputAnchor());
		else
			this._drawArrow(channelAnchor, output.getAnchor());
	}
}

/**
 * Makes visible the output and input connections of the given channel. For now,
 * this means drawing arrows from this channel to the connected Slots and from
 * the connected Events to this channel.
 *
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype.highlightChannel = function (channel) {
	channel.check(); //highlight the channel

	//notify through a CSS class that there is a channel marked
	this.wiringTable.addClassName('selected_channel');

	//mark the connections with the channel
	this._highlightChannelInputs(channel);
	this._highlightChannelOutputs(channel);
}

// ***********************************
//  COLOR SCHEME FOR HIGHLIGHTS
//  More colors in color_scheme.js file but now it is not used!
//  Too many colors at that file, it is has been optimized!
// ***********************************

WiringInterface.prototype.color_scheme = [];

WiringInterface.prototype.color_scheme.push("#ffb0a1");

WiringInterface.prototype.color_scheme.push("#a6ffbf");
WiringInterface.prototype.color_scheme.push("#7a5e85");
WiringInterface.prototype.color_scheme.push("#b3f0ff");
WiringInterface.prototype.color_scheme.push("#cf36ff");
WiringInterface.prototype.color_scheme.push("#5496ff");
WiringInterface.prototype.color_scheme.push("#e854ff");

WiringInterface.prototype.color_scheme.push("#662500");
WiringInterface.prototype.color_scheme.push("#5a9e68");
WiringInterface.prototype.color_scheme.push("#bf6900");
WiringInterface.prototype.color_scheme.push("#a17800");
WiringInterface.prototype.color_scheme.push("#72cc85");
WiringInterface.prototype.color_scheme.push("#e6ff42");

WiringInterface.prototype.color_scheme.push("#becfbc");
WiringInterface.prototype.color_scheme.push("#005710");
WiringInterface.prototype.color_scheme.push("#00193f");
WiringInterface.prototype.color_scheme.push("#e0fffa");
WiringInterface.prototype.color_scheme.push("#f0ff3d");
WiringInterface.prototype.color_scheme.push("#f0d8d3");

WiringInterface.prototype.color_scheme.push("#ab5c00");
WiringInterface.prototype.color_scheme.push("#3c008f");
WiringInterface.prototype.color_scheme.push("#d6ff8a");
WiringInterface.prototype.color_scheme.push("#fac0e1");
WiringInterface.prototype.color_scheme.push("#4700ad");
WiringInterface.prototype.color_scheme.push("#ccc6ad");

WiringInterface.prototype.color_scheme.push("#261e06");
WiringInterface.prototype.color_scheme.push("#4fedff");
WiringInterface.prototype.color_scheme.push("#e6bebc");
WiringInterface.prototype.color_scheme.push("#f0ed73");
WiringInterface.prototype.color_scheme.push("#4f1800");
WiringInterface.prototype.color_scheme.push("#020073");

WiringInterface.prototype.color_scheme.push("#0fff00");
WiringInterface.prototype.color_scheme.push("#686b00");
WiringInterface.prototype.color_scheme.push("#804dff");
WiringInterface.prototype.color_scheme.push("#b100bd");
WiringInterface.prototype.color_scheme.push("#69ffab");
WiringInterface.prototype.color_scheme.push("#e6acb8");

WiringInterface.prototype.color_scheme.push("#8c7a77");
WiringInterface.prototype.color_scheme.push("#006bfa");
WiringInterface.prototype.color_scheme.push("#8cffab");
WiringInterface.prototype.color_scheme.push("#d1d190");
WiringInterface.prototype.color_scheme.push("#0d4000");
WiringInterface.prototype.color_scheme.push("#f0e8c4");

WiringInterface.prototype.color_scheme.push("#0048e8");
WiringInterface.prototype.color_scheme.push("#b8ffe0");
WiringInterface.prototype.color_scheme.push("#5effe0");
WiringInterface.prototype.color_scheme.push("#770000");
WiringInterface.prototype.color_scheme.push("#913dff");
WiringInterface.prototype.color_scheme.push("#5357cf");


/**
 * This is the base class for the classes representing the anchors used to
 * connect the connectables on the wiring interface. They are usually
 * represented by a checkbox and used as target or source of arrows.
 *
 * @abstract
 */
function ConnectionAnchor(_interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	this._interface = _interface;
	this.connectionArrows = [];
	this.channelType = null;

	this.htmlElement = document.createElement("div");
	Element.extend(this.htmlElement);
	this.htmlElement.addClassName('anchor');
}

/**
 * Returns the <code>ConnectableInterface</code> associated to this
 * <code>ConnectionAnchor</code>
 *
 * @return {ConnectableInterface}
 */
ConnectionAnchor.prototype.getConnectableInterface = function() {
	return this._interface;
}

/**
 * Returns the HTMLElement associated with this anchor.
 *
 * @return {HTMLElement}
 */
ConnectionAnchor.prototype.getHTMLElement = function() {
	return this.htmlElement;
}

/**
 * @private
 *
 * @param {ConnectionArrow} connectionArrow the arrow that is going to be
 *        connected to this anchor.
 */
ConnectionAnchor.prototype._addConnectionArrow = function(connectionArrow) {
	if (!this.isConnected())
		this.htmlElement.addClassName('checked');

	if (this._interface._increaseConnections)
		this._interface._increaseConnections();

	this.connectionArrows.push(connectionArrow);
}

/**
 * @private
 *
 * @param {ConnectionArrow} connectionArrow the arrow that is going to be
 *        disconnected from this anchor.
 */
ConnectionAnchor.prototype._removeConnectionArrow = function(connectionArrow) {
	this.connectionArrows.remove(connectionArrow);

	if (this._interface._decreaseConnections)
		this._interface._decreaseConnections();

	if (!this.isConnected())
		this.htmlElement.removeClassName('checked');
}

function Coordinates(topLeftSquare, width, height) {
	this.topLeftSquare = topLeftSquare;
	this.width = width;
	this.height = height;
}

Coordinates.prototype.getCenter = function() {
	return {posX: Math.round(this.topLeftSquare.posX + (this.width/2)),
	        posY: Math.round(this.topLeftSquare.posY + (this.height/2))};
}

Coordinates.prototype.getAngle = function(angle) {
	switch (angle) {
	case 0:
		return {posX: this.topLeftSquare.posX + this.width,
		        posY: this.topLeftSquare.posY + Math.round(this.height/2)};
	case 180:
		return {posX: this.topLeftSquare.posX,
		        posY: this.topLeftSquare.posY + Math.round(this.height/2)};
	default:
		throw new Error();
	}
}

/**
 * Retreives the coordinates of this anchor relative to another HTML Element.
 *
 * @param {HTMLElement} baseElement element of reference.
 */
ConnectionAnchor.prototype.getCoordinates = function(baseElement) {
	var coordinates = {posX: this.htmlElement.offsetLeft,
	                   posY: this.htmlElement.offsetTop};
	var parentNode = this.htmlElement.parentNode;
	while (parentNode != baseElement) {
		var cssStyle = document.defaultView.getComputedStyle(parentNode, null);
		var p = cssStyle.getPropertyValue('position');
		if (p != 'static') {
			coordinates.posY += parentNode.offsetTop + cssStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
			coordinates.posX += parentNode.offsetLeft + cssStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
		}
		parentNode = parentNode.parentNode;
	}
	return new Coordinates(coordinates, this.htmlElement.offsetWidth, this.htmlElement.offsetHeight);
}

/**
 * @return {Boolean}
 */
ConnectionAnchor.prototype.isConnected = function() {
	return this.connectionArrows.length > 0;
}

/**
 * @return {ConnectionArrow[]}
 */
ConnectionAnchor.prototype.getConnectionArrows = function() {
	return this.connectionArrows;
}

/**
 * @class
 * @param {ConnectableInterface} _interface
 */
function InConnectionAnchor(_interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	ConnectionAnchor.call(this, _interface);
}
InConnectionAnchor.prototype = new ConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} _interface
 */
function OutConnectionAnchor(_interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	ConnectionAnchor.call(this, _interface);
}
OutConnectionAnchor.prototype = new ConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} _interface
 */
function EventConnectionAnchor(_interface) {
	InConnectionAnchor.call(this, _interface);
}
EventConnectionAnchor.prototype = new InConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} _interface
 */
function SlotConnectionAnchor(_interface) {
	OutConnectionAnchor.call(this, _interface);
}
SlotConnectionAnchor.prototype = new OutConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} _interface
 */
function TabConnectionAnchor(_interface) {
	OutConnectionAnchor.call(this, _interface);
}
TabConnectionAnchor.prototype = new OutConnectionAnchor();


EventConnectionAnchor.prototype.setConnectionStatus = function(newStatus) {
	ConnectionAnchor.prototype.setConnectionStatus.call(this, newStatus);

	if (newStatus)
		this._interface._increaseConnections();
	else
		this._interface._decreaseConnections();
}
SlotConnectionAnchor.prototype.setConnectionStatus = EventConnectionAnchor.prototype.setConnectionStatus;
TabConnectionAnchor.prototype.setConnectionStatus = EventConnectionAnchor.prototype.setConnectionStatus;


/**
 * @private
 * Build the points list for drawing a line between sourceAnchor and
 * targetAnchor.
 *
 * @param {ConnectableAnchor} sourceAnchor
 * @param {ConnectableAnchor} targetAnchor
 */
WiringInterface.prototype._buildArrowPointList = function(sourceAnchor, targetAnchor) {
	var scoordinates = sourceAnchor.getCoordinates(this.wiringContainer);
	var tcoordinates = targetAnchor.getCoordinates(this.wiringContainer);

	var pointList = []

	var scenter = scoordinates.getCenter();
	var tcenter = scoordinates.getCenter();

	if (scenter.posX < tcenter.posX) {
		scoordinates = scoordinates.getAngle(180);
		tcoordinates = tcoordinates.getAngle(0);
	} else {
		scoordinates = scoordinates.getAngle(0);
		tcoordinates = tcoordinates.getAngle(180);
	}

	pointList.push(scoordinates);

	if (sourceAnchor instanceof EventConnectionAnchor ||
		targetAnchor instanceof SlotConnectionAnchor ||
		targetAnchor instanceof TabConnectionAnchor)
	{

	// TODO
/*		var middleX = (scoordinates.posX + tcoordinates.posX) / 2;
		pointList.push({posY: scoordinates.posY, posX: middleX});
		pointList.push({posY: tcoordinates.posY, posX: middleX});*/
	} else {
		var crossingY;

		var targetElement = targetAnchor.getConnectableInterface().getHTMLElement();
		var rect = Element.getRelativeBoundingClientRect(targetElement,
		                                                 this.wiringContainer);

		if (sourceAnchor.getConnectableInterface() == this.currentChannel) {
			var left = tcoordinates.posX - 50;
			var right = scoordinates.posX + 30;

			if (scoordinates.posY < tcoordinates.posY) {
				crossingY = rect.top - 15;
			} else {
				crossingY = rect.bottom + 15;
			}
		} else {
			var left = tcoordinates.posX - 30;
			var right = scoordinates.posX + 50;

			if (scoordinates.posY < tcoordinates.posY) {
				crossingY = rect.top - 15;
			} else {
				crossingY = rect.bottom + 15;
			}
		}
		pointList.push({posX: right, posY: scoordinates.posY});
		pointList.push({posX: right, posY: crossingY});
		pointList.push({posX: left, posY: crossingY});
		pointList.push({posX: left, posY: tcoordinates.posY});
	}
	pointList.push(tcoordinates);

	return pointList;
}

/**
 * @private
 * Build a <code>ConnectionArrow</code> between sourceAnchor and targetAnchor.
 *
 * @param {ConnectableAnchor} sourceAnchor
 * @param {ConnectableAnchor} targetAnchor
 *
 * @return {ConnectionArrow}
 */
WiringInterface.prototype._drawArrow = function(sourceAnchor, targetAnchor) {
	var arrowClass = 'arrow';

	var sourceInterface = sourceAnchor.getConnectableInterface();
	var targetInterface = targetAnchor.getConnectableInterface();

	if (sourceInterface == this.currentChannel) {
		arrowClass = 'outToChannel';
	} else {
		arrowClass = 'inFromChannel';
	}

	// Ensure source interface visibility
	if (sourceInterface.makeVisible)
		sourceInterface.makeVisible(false);

	// Ensure target interface visibility
	if (targetInterface.makeVisible)
		targetInterface.makeVisible(false);

	var pointList = this._buildArrowPointList(sourceAnchor, targetAnchor);
	if (pointList.length == 2)
		var arrow = this.canvas.drawArrow(pointList[0], pointList[1], {});
	else
		var arrow = this.canvas.drawPolyLine(pointList, {});

	arrow.addClassName(arrowClass);

	return new ConnectionArrow(sourceAnchor, targetAnchor, arrow);
}

/**
 * @private
 * Creates the menu with all the available filters.
 */
WiringInterface.prototype._createFilterMenu = function () {
	var filterMenuHTML = '<div id="wiring_filter_menu" class="drop_down_menu"><div id="wiring_filter_submenu" class="submenu"></div></div>';
	new Insertion.After($('menu_layer'), filterMenuHTML);
	var filterMenu = new FilterDropDownMenu('wiring_filter_menu');

	var callback = function() {
		this.wiringGUI._updateFilterFunc(this.wiringGUI.currentChannel, this.filter);
	};

	filterMenu.addOptionWithHelp (
		_currentTheme.getIconURL('filter'),
		gettext('None'),
		gettext("Returns the value of the channel unfiltered."),
		callback.bind({wiringGUI:this, filter: null}),
		0);
	var filters = this.wiring.getFiltersSort();
	for (var i = 0; i < filters.length; i++) {
		var context = {wiringGUI:this, filter:filters[i]};
		filterMenu.addOptionWithHelp (
			_currentTheme.getIconURL('filter'),
			filters[i].getLabel(),
			filters[i].getHelpText(),
			callback.bind(context),
			i+1);
	}

	this.filterMenu = filterMenu;
}

/**
 * Creating the menu for presenting the channel remote operations available to users.
 *
 * @private
 */
WiringInterface.prototype._createRemoteChannelOperationsMenu = function () {
	this.remote_operations_menu = new RemoteChannelOperationsDropDownMenu('remote_channel_operations', null);
	
	var disabled = gettext("Disabled");
	var read = gettext("Read");
	var write = gettext('Write');
	
	var callback = function(e) {
		var target = BrowserUtilsFactory.getInstance().getTarget(e);
		target.blur();
		
		Event.stop(e);
		
		var operation_full_id = null;
		if (target.id)
			operation_full_id = target.id;
		else
			operation_full_id = target.parentNode.id;;
		
		var op_code = parseInt(operation_full_id.charAt(operation_full_id.length - 1));
		var text = target.innerHTML;
		
		// Update channel interface according to operation code!
		this.currentChannel.remote_subscription.setOpCode(op_code);
		this.currentChannel.updateRemoteSubscription();
	}.bind(this)
	
	this.remote_operations_menu.addOption(null, disabled, callback, 0, null, null);
	this.remote_operations_menu.addOption(null, read, callback, 1, null, null);
	this.remote_operations_menu.addOption(null, write, callback, 2, null, null);
}

/**
 * Callback used when the user selects a filter in the filter menu.
 *
 * @private
 */
WiringInterface.prototype._updateFilterFunc = function(channel, filter) {
	// Close Filter Menu
	LayoutManagerFactory.getInstance().hideCover();

	if (channel.getFilter() == filter)
		return; // There is not a real change => nothing to do

	this.changed = true;
	channel.setFilter(filter, this.wiring);

	// The filter content size has changed, and the selected channel and its arrows must be repainted
	this.uncheckChannel(channel);
	this.highlightChannel(channel);
}

/**
 * Callback function to display help about the event, channel and slot columns
 */
WiringInterface.prototype._displayHelpWiringHeader = function(element, event) {
	Event.stop(event);
	var divout = document.createElement('div');
	Element.extend(divout);
	divout.setAttribute ('id', 'help_background');
	divout.style.cssText = "top:0;bottom:0;right:0;left:0;position:absolute;z-index:3001;"
	divout.observe('click', function (e) {
		Event.stop(e);
		var target = BrowserUtilsFactory.getInstance().getTarget(e);
		target.parentNode.removeChild(target);
	});
	// Sets the help style
	var helpOpElement = document.createElement('div');
	Element.extend(helpOpElement);
	helpOpElement.addClassName ('helpwiringheader');
	helpOpElement.style.padding = '5px';
	helpOpElement.style.position = 'absolute';
	helpOpElement.style.top = Event.pointerY(event)+'px';
	divout.appendChild(helpOpElement)
	document.body.appendChild (divout);

	switch (element.name) {
	case 'event':
		helpOpElement.style.left = Event.pointerX(event)+'px';
		helpOpElement.innerHTML = gettext("Lists of gadgets with events.\nThis events produces a value\nwhich will be received by\nother gadgets as slots.");
		break;
	case 'channels':
		helpOpElement.style.left = Event.pointerX(event)+'px';
		helpOpElement.innerHTML = gettext("Channels allows you to manage\nthe connections between different\ninstantiated gadgets.");
		break;
	case 'slot':
		helpOpElement.innerHTML = gettext("Lists of gadgets with slots.\nThis slots receives values\nwhich are produced by\nother gadgets as events.");
		helpOpElement.style.left = (Event.pointerX(event) - helpOpElement.offsetWidth) +'px';
		break;
	}
}

/**
 *
 */
function ConnectionArrow(sourceAnchor, targetAnchor, arrow) {
	this.sourceAnchor = sourceAnchor;
	this.targetAnchor = targetAnchor;
	this.arrow = arrow;

	// Connect it
	sourceAnchor._addConnectionArrow(this);
	targetAnchor._addConnectionArrow(this);
}

ConnectionArrow.prototype.getSourceAnchor = function() {
	return this.sourceAnchor;
}

ConnectionArrow.prototype.getTargetAnchor = function() {
	return this.targetAnchor;
}

/**
 * Removes the arrow from the canvas and prepares this instance for being freed
 * by the garbage collector.
 */
ConnectionArrow.prototype.disconnect = function() {
	this.sourceAnchor._removeConnectionArrow(this);
	this.targetAnchor._removeConnectionArrow(this);

	this.sourceAnchor = null;
	this.targetAnchor = null;
}

/*
 * Canvas
 */

if (BrowserUtilsFactory.getInstance().isIE()) {

	/* Enable vml support */
	document.namespaces.add('vml', 'urn:schemas-microsoft-com:vml', "#default#VML");

	var s = document.createStyleSheet();
	s.addRule('vml\\: polyline', 'behavior:url(#default#VML);display:inline-block;');
	s.addRule('vml\\: shape', 'behavior:url(#default#VML);display:inline-block;');

	var Canvas = function() {
		this.canvasElement = document.createElement('div');
		Element.extend(this.canvasElement);
		this.context = {'stroke': '#00F',
		                'fill': 'none',
		                'stroke-width': '2px'};
	}

	Canvas.prototype.addClassName = function(className) {
		this.canvasElement.addClassName(className);
	}

	/**
	 * IE does not support modifing vml element attributes by css. Workarround this.
	 */
	Canvas.prototype._elementAddClassName = function(className) {
		switch (className) {
		case 'inFromChannel':
			this.strokecolor = "green";
			this.filled = false;
			this.strokeweight = 2;
			break;
		case 'outToChannel':
			this.strokecolor = "#F00000";
			this.filled = false;
			this.strokeweight = 2;
			break;
		}
	}

	Canvas.prototype._propMapping = {
	    'fill': 'fillcolor',
	    'stroke': 'strokecolor',
	    'stroke-width': 'strokeweight'
	};

	Canvas.prototype._applyStyle = function(style, element) {
		var key;
		for (key in style) {
			var value = style[key];

			if (this._propMapping[key] != undefined)
				key = this._propMapping[key];

			if (key == 'fillcolor' && value == 'none')
				element.filled = false;
			else
				element[key] = value;
		}
	}

	Canvas.prototype.drawPolyLine = function(points, style) {
		var pointsAttr = "";
		for (var i = 0; i < points.length; i++)
			pointsAttr += "," + points[i].posX + "," + points[i].posY;

		pointsAttr = pointsAttr.substr(1);
		var polyline = this.canvasElement.ownerDocument.createElement("<vml:polyline points=\"" + pointsAttr + "\" />"); // IE 6

		this._applyStyle(style ? style : this.context, polyline);

		this.canvasElement.appendChild(polyline);
		polyline.outerHTML = polyline.outerHTML; // IE bug
		polyline = this.canvasElement.childNodes[this.canvasElement.childNodes.length - 1];

		polyline.addClassName = Canvas.prototype._elementAddClassName;
		return polyline;
	}

	Canvas.prototype.drawArrow = function(from, to, style) {

		var middleX = Math.floor((from.posX + to.posX) / 2);

		var path = "m " + from.posX + "," + (from.posY - 1) + " " +
		           "c " + middleX + "," + (from.posY - 1) + " " + middleX + "," + (to.posY - 1) + " " +
		           to.posX + "," + (to.posY - 1) + " e";

		var arrow = this.canvasElement.ownerDocument.createElement("<vml:shape path=\"" + path + "\" />"); // IE6
		this.canvasElement.appendChild(arrow);
		arrow.style.width = "10000px";
		arrow.style.height = "10000px";
		arrow.style.top = "0px";
		arrow.style.left = "0px";
		arrow.style.position = "absolute";
		arrow.coordorigin = "0 0";
		arrow.coordsize = "10000 10000";

		this._applyStyle(style ? style : this.context, arrow);

		arrow.outerHTML = arrow.outerHTML; // IE bug
		arrow = this.canvasElement.childNodes[this.canvasElement.childNodes.length - 1];

		arrow.addClassName = Canvas.prototype._elementAddClassName;
		return arrow;
	}

} else {
	var Canvas = function() {
		this.canvasElement = document.createElementNS(this.SVG_NAMESPACE, 'svg:svg');
		this.context = {'stroke': '#00F',
		                'fill': 'transparent',
		                'stroke-width': '2'};
	}

	Canvas.prototype.SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	Canvas.prototype.addClassName = function(className) {
		this.canvasElement.setAttribute('class', className);
	}

	Canvas.prototype._elementAddClassName = function(className) {
		this.setAttribute('class', className);
	}

	Canvas.prototype._applyStyle = function(style, element) {
		var styleAttr = element.getAttribute('style');
		if (styleAttr == null)
			styleAttr = "";

		for (var key in style) {
			styleAttr += key + ":" + style[key] + ";";
		}
		element.setAttribute('style', styleAttr);
	}

	Canvas.prototype.drawPolyLine = function(points, style) {
		var polyline = this.canvasElement.ownerDocument.createElementNS(this.SVG_NAMESPACE, "svg:polyline");
		var pointsAttr = "";
		for (var i = 0; i < points.length; i++)
			pointsAttr += " " + points[i].posX + "," + points[i].posY;

		polyline.setAttribute('points', pointsAttr);
		this._applyStyle(style ? style : this.context, polyline);
		this.canvasElement.appendChild(polyline);
		polyline.addClassName = Canvas.prototype._elementAddClassName;
		return polyline;
	}

	Canvas.prototype.drawArrow = function(from, to, style) {
		var arrow = this.canvasElement.ownerDocument.createElementNS(this.SVG_NAMESPACE, "svg:path");

		var middleX = (from.posX + to.posX) / 2;

		arrow.setAttribute("d", "M " + from.posX + "," + from.posY + " " +
		                        "C " + middleX + "," + from.posY + " " + middleX + "," + to.posY + " " +
		                        to.posX + "," + to.posY);
		this._applyStyle(style ? style : this.context, arrow);
		this.canvasElement.appendChild(arrow);
		arrow.addClassName = Canvas.prototype._elementAddClassName;
		return arrow;
	}

}

Canvas.prototype.clear = function() {
	while (this.canvasElement.childNodes.length > 0)
		this.canvasElement.removeChild(this.canvasElement.childNodes[0]);
}

Canvas.prototype.getHTMLElement = function() {
	return this.canvasElement;
}
