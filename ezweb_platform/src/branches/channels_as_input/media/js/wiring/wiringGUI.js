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
	this.currentProvisionalId = 1;
	this.channels = new Array();
	this.channelsByName = {};
	this.channelsToRemove = [];
	this.friend_codes = {};
	this.highlight_color = "#FFFFE0"; // TODO remove
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
	this.channel_name = $('channel_name');
	this.msgsDiv = $('wiring_messages');
	this.newChannel = $('newChannel');
	this.wiringTable = $('wiring_table');

	// Create the canvas for the connection arrows
	this.canvas = new Canvas();
	this.canvasElement = this.canvas.getHTMLElement();
	this.canvasElement.setAttribute('class', 'canvas');
	$('wiring').appendChild(this.canvasElement);

	// folding/unfolding all tabs events

	titleElement = this.eventColumn.getElementsByClassName("title")[0];

	Event.observe(titleElement, "click",
	                       function (e) {
	                          var expand = null;
	                          var folded = e.target.hasClassName('folded');
	                          var nIgadgets = $$('#events_list .igadget').length;
	                          var nIgadgetsFolded = $$('#events_list .igadget.folded').length;
	                          if(folded && nIgadgetsFolded == 0) {
	                            expand = false;
	                          } else if(!folded && nIgadgetsFolded == nIgadgets) {
	                            expand = true;
	                          } else {
	                            expand = folded;
	                            e.target.toggleClassName('folded');
	                          }
	                          this.toggleEventColumn(expand);
	                        }.bind(this));

	// Slots
	titleElement=this.slotColumn.getElementsByClassName("title")[0];
	Event.observe(titleElement, "click",
	                   function (e) {
	                     var expand = null;
	                     var folded = e.target.hasClassName('folded');
	                     var nIgadgets = $$('#slots_list .igadget').length;
	                     var nIgadgetsFolded = $$('#slots_list .igadget.folded').length;
	                     if (folded && nIgadgetsFolded == 0) {
	                       expand = false;
	                     } else if (!folded && nIgadgetsFolded == nIgadgets) {
	                       expand = true;
	                     } else {
	                       expand = folded;
	                       e.target.toggleClassName('folded');
	                     }
	                     this.toggleSlotColumn(expand);
	                   }.bind(this));

	Event.observe($('unfold_all_link'), "click",
	            function () {
	              this.toggleEventColumn(true);
	              this.toggleSlotColumn(true);
	          }.bind(this));

	Event.observe($('unfold_chkItem'), "click",
	            function(e) {
	              //the user wants all unfolded
	              e.target.toggleClassName('chkItem');
	              this.unfold_on_entering = e.target.hasClassName('chkItem');
	            }.bind(this));

	this._eventCreateChannel = function (e) {
		Event.stop(e);
		this._createChannel();
		this.toggleEventColumn(true);
		this.toggleSlotColumn(true);
	}.bind(this)

	Event.observe(this.newChannel, 'click', this._eventCreateChannel);

	// Filter Menu
	this._createFilterMenu();
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
	$('wiring').removeChild(this.canvasElement);
	this.canvas = null;
	this.canvasElement = null;

	// Remove Filter Menu
	var filterMenu = $('wiring_filter_menu');
	this.filterMenu.remove();
	this.filterMenu = null;
}

WiringInterface.prototype.saveWiring = function () {

	// Phase 1. Creation
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].commitChanges(this.wiring, 1);
	}

	// Phase 2. Updating
	for (var i = 0; i < this.channels.length; i++) {
		this.channels[i].commitChanges(this.wiring, 2);
	}

	// Phase 3. Deletions
	for (var i = 0; i < this.channelsToRemove.length; i++) {
		this.wiring.removeChannel(this.channelsToRemove[i].getConnectable());
		this.channelsToRemove[i].destroy();
	}

	this.channelsToRemove = {};

	// The wiring engine is notified in order to persist state!
	this.wiring.serialize();
}

WiringInterface.prototype._showFilterParams = function (channel, filter, paramLabelElement, paramValueElement, valueElement) {
	// No filter, no params
	if (filter == null)
		return;

	// Adds a new row for each param of the current filter
	var params = filter.getParams();
	for (var p = 0; p < params.length; p++) {
		paramLabelElement.appendChild(params[p].createHtmlLabel());
		paramValueElement.appendChild(params[p].createHtmlValue(this, channel, valueElement));
	}
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
	var tabSlots = new SlotTabInterface(tab, this);

	// Igadgets
	var igadgets = tab.dragboard.getIGadgets();
	for (var i = 0; i < igadgets.length; i++) {
		this._addIGadget(igadgets[i], tabEvents, tabSlots);
	}

	tabEvents.show();
	tabSlots.show();
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

	// fold the igadget if the user hasn't specify not doing it.
	if (!this.unfold_on_entering) {
		igadgetEvents.forceToggle();
		igadgetSlots.forceToggle();
	} else {
		igadgetEvents.openedByUser = true;
		igadgetEvents.parentInterface.igadgetsOpenedByUser++;
		igadgetSlots.openedByUser = true;
		igadgetSlots.parentInterface.igadgetsOpenedByUser++;
	}
}

/**
 * @private
 * This function is used by _registerEvent and _registerSlot
 *
 * @param {ConnectableInterface} interface
 */
WiringInterface.prototype._registerConnectable = function(interface) {
	this.connectablesByQName[interface.getConnectable().getQualifiedName()] = interface;

	// Harvest friend code info
	var friendCode = interface.getFriendCode();

	if (friendCode === null)
		return;

	if (this.friend_codes[friendCode] == undefined) {
		// Create the friend code entry in the list of friend codes
		this.friend_codes[friendCode] = {};
		this.friend_codes[friendCode].list = [];
		this.friend_codes[friendCode].color = this.color_scheme[this.friend_codes_counter++];
	}
	this.friend_codes[friendCode].list.push(interface);
}

/**
 *
 */
WiringInterface.prototype.getConnectableByQName = function(qname) {
	return this.connectablesByQName[qname];
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
 */
WiringInterface.prototype.clearMessages = function () {
	this.msgsDiv.setStyle({display: null});
}

/**
 * Expands or collapses all tabs & gadgets of the Events column, according to
 * the expand parameter.
 *
 * @param expand
 */
WiringInterface.prototype.toggleEventColumn = function (expand) {
	var input = null;
	for (var i = 0; i < this.inputs.length; i++) {
		input = this.inputs[i];
		if (!(input instanceof ChannelInterface)) { //we leave channels apart
			if (expand)
				input.parentInterface.massiveExpand();
			else
				input.parentInterface.massiveCollapse();
		}
	}
	if (this.currentChannel) {
		this._highlightChannelInputs(this.currentChannel)
	}
}

/**
 * Expands or collapses all tabs & gadgets on the Slots column, according to
 * the expand parameter.
 *
 * @param expand
 */
WiringInterface.prototype.toggleSlotColumn = function (expand) {
	var output = null;
	var i = 0;
	for (i = 0; i < this.outputs.length; i++) {
		output = this.outputs[i];
		if (!(output instanceof ChannelInterface) && !(output instanceof SlotTabInterface)) { //we leave channels apart
			if (expand) {
				output.parentInterface.massiveExpand();
			} else {
				output.parentInterface.massiveCollapse();
			}
		}
	}

	if (this.currentChannel)
		this._highlightChannelOutputs(this.currentChannel);
}

WiringInterface.prototype._clear = function() {
	// Clean the interface
	this.event_list.innerHTML = "";
	this.slot_list.innerHTML = "";
	this.channels_list.innerHTML = "";
	this.clearMessages();
	this.canvas.clear();

	// Clean data structures
	this.currentProvisionalId = 1;
	this.friend_codes_counter = 0;
	this.friend_codes = {};
	this.inputs.clear();
	this.outputs.clear();
	this.channelsByName = {};
	this.channelsToRemove = [];
	this.currentChannel = null;

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

WiringInterface.prototype.showMessage = function (msg) {
	this.msgsDiv.innerHTML = msg;
	this.msgsDiv.setStyle({display: "block"});
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
			this.showMessage(gettext("Please, create a new channel before creating connections."));
		} else {
			this.showMessage(gettext("Please, select a channel before creating connections."));
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

		this.currentChannel[disconnectMethod](connectable);

		if (connectable instanceof ChannelInterface)
			connectable[disconnectMethod2](this.currentChannel);
	} else {
		var arrow = this._drawArrow(sourceAnchor, targetAnchor);

		this.currentChannel[connectMethod](connectable);

		if (connectable instanceof ChannelInterface)
			connectable[connectMethod2](this.currentChannel);
	}

}

WiringInterface.prototype.channelExists = function(channelName) {
	return this.channelsByName[channelName] != null ? true : false;
}

WiringInterface.prototype._getChannelInterfaceByName = function(channelName) {
	return this.channelsByName[channelName];
}

WiringInterface.prototype._createChannel = function () {
	var result = null;

	// Build an initial channel name
	var auxName = this.channels.length + 1;
	var channelName = this.channelBaseName + "_" + auxName;

	// Check if there is another channel with the same name
	while (this.channelExists(channelName)) {
		// Build another channel name
		channelName = this.channelBaseName + "_" + auxName;
		auxName++;
	}

	// Creates the channel interface
	var channel = new ChannelInterface(channelName, this);
	this._registerChannel(channel);

	this.channels_list.appendChild(channel.getHTMLElement());

	this.clearMessages();
	this._changeChannel(channel);
}

/**
 * @param {ChannelInterface} channel
 */
WiringInterface.prototype._removeChannel = function (channel) {
	if (!this.channels.elementExists(channel))
		return; // Nothing to do

	if (this.currentChannel == channel) {
		this._changeChannel(channel);
		this.channels_list.removeChild(channel.getHTMLElement());
	} else {
		this.channels_list.removeChild(channel.getHTMLElement());
		if (this.currentChannel) {
			//repaint status because the channel position may have changed
			this.uncheckChannel(this.currentChannel);
			this.highlightChannel(this.currentChannel);
		}
	}

	channel.remove();
	// If channel exists in the wiring module, destroy it on saving
	if (channel.exists())
		this.channelsToRemove.push(channel);
	else
		channel.destroy();

	// Remove the channel from the internal list of channels
	this.channels.remove(channel);
	delete this.channelsByName[channel.getName()];
}

WiringInterface.prototype._changeChannel = function(newChannel) {
	var oldChannel = this.currentChannel;
	this.currentChannel = newChannel;

	if (oldChannel)
		this.uncheckChannel(oldChannel);

	this.clearMessages();
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
 * Generates and returns a new provisional channel id.
 */
WiringInterface.prototype._newProvisionalChannelId = function () {
	return this.currentProvisionalId++;
}

/**
 * @private
 * 
 */
WiringInterface.prototype._highlight_friend_code = function (friend_code, highlight) {
	if (!this.friend_codes[friend_code]) {
		// TODO Warning
		return; // Nothing to do
	}

	var connectables = this.friend_codes[friend_code].list;
	var bgColor = highlight ? this.friend_codes[friend_code].color : null;

/*	for (var i = 0; i < connectables.length; i++)
		connectables[i].style.backgroundColor = bgColor;*/
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
	var connections = anchor.getConnectionArrows().clone();
	for (var i = 0; i < connections.length; i++) {
		var arrow = connections[i];

//		if (output.parentInterface && output.parentInterface.isAnyUnfolded()) //if the interface is unfolded unfold it
//			output.parentInterface.toggle();

		arrow.disconnect();
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

//		if (output.parentInterface && output.parentInterface.isAnyUnfolded()) //if the interface is unfolded unfold it
//			output.parentInterface.toggle();

		arrow.disconnect();
	}
}

WiringInterface.prototype.uncheckChannel = function (channel) {
	channel.uncheck();

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

		// TODO this is a hackism
		// If the interface of this Event is folded, unfold it
		if (input.parentInterface && input.parentInterface.isAnyFolded())
			input.parentInterface.toggle();

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

		// If the interface of this Slot is folded, unfold it
		if (output.parentInterface && output.parentInterface.isAnyFolded())
			output.parentInterface.toggle();

		if (output instanceof ChannelInterface)
			arrow = this._drawArrow(channelAnchor, output.getInputAnchor());
		else
			arrow = this._drawArrow(channelAnchor, output.getAnchor());
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

	//mark the connections with the channel
	this._highlightChannelInputs(channel);
	this._highlightChannelOutputs(channel);
}

// ***********************************
//  COLOR SCHEME FOR HIGHLIGHTS
//  More colors in color_scheme.js file but now it's not used!
//  Too many colors at that file, it's has been optimized!
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
function ConnectionAnchor(interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	this.interface = interface;
	this.connectionArrows = [];
	this.channelType = null;

	this.htmlElement = document.createElement("div");
	this.htmlElement.addClassName('anchor');
}

/**
 * Returns the <code>ConnectableInterface</code> associated to this
 * <code>ConnectionAnchor</code>
 *
 * @return {ConnectableInterface}
 */
ConnectionAnchor.prototype.getConnectableInterface = function() {
	return this.interface;
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
	this.connectionArrows.push(connectionArrow);

	if (this.isConnected()) {
		this.htmlElement.addClassName('checked');
	} else {
		this.htmlElement.removeClassName('checked');
	}
}

/**
 * @private
 *
 * @param {ConnectionArrow} connectionArrow the arrow that is going to be
 *        disconnected from this anchor.
 */
ConnectionAnchor.prototype._removeConnectionArrow = function(connectionArrow) {
	this.connectionArrows.remove(connectionArrow);

	if (this.isConnected()) {
		this.htmlElement.addClassName('checked');
	} else {
		this.htmlElement.removeClassName('checked');
	}
}

function Coordinates(topLeftSquare, width, height) {
	this.topLeftSquare = topLeftSquare;
	this.width = width;
	this.height = height;
}

Coordinates.prototype.getCenter = function() {
	return {x: Math.round(this.topLeftSquare.x + (this.width/2)),
	        y: Math.round(this.topLeftSquare.y + (this.height/2))};
}

Coordinates.prototype.getAngle = function(angle) {
	switch (angle) {
	case 0:
		return {x: this.topLeftSquare.x + this.width,
		        y: this.topLeftSquare.y + Math.round(this.height/2)};
	case 180:
		return {x: this.topLeftSquare.x,
		        y: this.topLeftSquare.y + Math.round(this.height/2)};
	}
}

/**
 *
 */
ConnectionAnchor.prototype.getCoordinates = function(baseElement) {
	var coordinates = {x: this.htmlElement.offsetLeft,
	                   y: this.htmlElement.offsetTop};

	var parentNode = this.htmlElement.parentNode;
	while (parentNode != baseElement) {
		var p = Element.getStyle(parentNode, 'position');
		if (p != 'static') {
			var cssStyle = document.defaultView.getComputedStyle(parentNode, null);
			coordinates.x += parentNode.offsetLeft + cssStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
			coordinates.y += parentNode.offsetTop + cssStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
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
 * @param {ConnectableInterface} interface
 */
function InConnectionAnchor(interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	ConnectionAnchor.call(this, interface);
}
InConnectionAnchor.prototype = new ConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} interface
 */
function OutConnectionAnchor(interface) {
	// Allow hierarchy
	if (arguments.length == 0)
		return;

	ConnectionAnchor.call(this, interface);
}
OutConnectionAnchor.prototype = new ConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} interface
 */
function EventConnectionAnchor(interface) {
	InConnectionAnchor.call(this, interface);
}
EventConnectionAnchor.prototype = new InConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} interface
 */
function SlotConnectionAnchor(interface) {
	OutConnectionAnchor.call(this, interface);
}
SlotConnectionAnchor.prototype = new OutConnectionAnchor();

/**
 * @class
 * @param {ConnectableInterface} interface
 */
function TabConnectionAnchor(interface) {
	OutConnectionAnchor.call(this, interface);
}
TabConnectionAnchor.prototype = new OutConnectionAnchor();


EventConnectionAnchor.prototype.setConnectionStatus = function(newStatus) {
	ConnectionAnchor.prototype.setConnectionStatus.call(this, newStatus);

	if (newStatus)
		this.interface._increaseConnections();
	else
		this.interface._decreaseConnections();
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

	if (scenter.x < tcenter.x) {
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
/*		var middleX = (scoordinates.x + tcoordinates.x) / 2;
		pointList.push({x: middleX, y: scoordinates.y});
		pointList.push({x: middleX, y: tcoordinates.y});*/
	} else {
		var crossingY;

		var targetElement = targetAnchor.getConnectableInterface().getHTMLElement();
		var rect = Element.getRelativeBoundingClientRect(targetElement,
		                                                 this.wiringContainer);

		if (sourceAnchor.getConnectableInterface() == this.currentChannel) {
			var left = tcoordinates.x - 50;
			var right = scoordinates.x + 30;

			if (scoordinates.y < tcoordinates.y) {
				crossingY = rect.top - 15;
			} else {
				crossingY = rect.bottom + 15;
			}
		} else {
			var left = tcoordinates.x - 30;
			var right = scoordinates.x + 50;

			if (scoordinates.y < tcoordinates.y) {
				crossingY = rect.top - 15;
			} else {
				crossingY = rect.bottom + 15;
			}
		}
		pointList.push({x: right, y: scoordinates.y});
		pointList.push({x: right, y: crossingY});
		pointList.push({x: left, y: crossingY});
		pointList.push({x: left, y: tcoordinates.y});
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

	if (sourceAnchor.getConnectableInterface() == this.currentChannel) {
		arrowClass = 'outToChannel'; // outFromChannel
	} else {
		arrowClass = 'inFromChannel'; // inToChannel
	}

	var pointList = this._buildArrowPointList(sourceAnchor, targetAnchor);
	if (pointList.length == 2)
		var arrow = this.canvas.drawArrow(pointList[0], pointList[1], {});
	else
		var arrow = this.canvas.drawPolyLine(pointList, {}); /* 'marker-end': 'url(#inEndArrow)' }); */
	arrow.setAttribute('class', arrowClass);

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

	filterMenu.addOptionWithHelp (
		"/ezweb/images/filter.gif",
		gettext('Empty'),
		gettext("Returns the value of the channel unfiltered."),
		this._updateFilterFunc.bind({wiringGUI:this, filter: null}),
		0);
	var filters = this.wiring.getFiltersSort();
	for (var i = 0; i < filters.length; i++) {
		var context = {wiringGUI:this, filter:filters[i]};
		filterMenu.addOptionWithHelp (
			"/ezweb/images/filter.gif",
			filters[i].getLabel(),
			filters[i].getHelpText(),
			this._updateFilterFunc.bind(context),
			i+1);
	}

	this.filterMenu = filterMenu;
}

/**
 * Callback used when the user selects a filter in the filter menu.
 *
 * @private
 */
WiringInterface.prototype._updateFilterFunc = function() {
	// Close Filter Menu
	LayoutManagerFactory.getInstance().hideCover();

	var wiringGUI = this.wiringGUI;
	var filter = this.filter;
	var channel = wiringGUI.currentChannel;

	// Harvest filter data
	var filterValue;

	// TODO there are better and more easy ways of doing this...
	var selected_channel_cells = $$('.channel.selected td');
	var filter_content = selected_channel_cells[1].firstChild.childNodes[0];
	var param_label_content = selected_channel_cells[0].firstChild.childNodes[1];
	var param_content = selected_channel_cells[1].firstChild.childNodes[1];
	var value_content = selected_channel_cells[1].firstChild.childNodes[2];

	channel.setFilter(filter);

	// Removes the params of the other filter
	while (param_label_content.childNodes.length > 0)
		param_label_content.childNodes[param_label_content.childNodes.length - 1].remove();

	while (param_content.childNodes.length > 0)
		param_content.childNodes[param_content.childNodes.length - 1].remove();

	// Sets the filter name
	if (filter_content.childNodes[0].nodeType ==  Node.TEXT_NODE) {
		filterValue = filter_content.childNodes[0];
	} else {
		filterValue = filter_content.childNodes[1];
	}

	if (filter == null) {
		filterValue.textContent = gettext("Empty");
	} else {
		filterValue.textContent = filter.getLabel();
	}

	// Sets the channel value and the channel filter params
	if (filter == null || !filter.hasParams()) {
		value_content.update(channel.getValue());
	} else {
		// The channel value will be calculated with the params given by user.
		value_content.update(channel.getValueWithoutFilter());
		wiringGUI._showFilterParams(channel, filter, param_label_content, param_content, value_content);
	}

	// The filter content size has changed, and the selected channel and its arrows must be repainted
	wiringGUI.uncheckChannel(channel);
	wiringGUI.highlightChannel(channel);
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
	this.arrow.parentNode.removeChild(this.arrow);
}

/*
 * Canvas
 */

/*if (IE) {

	Canvas.prototype.clear = function() {
		this.canvasElement.innerHTML = "";
	}

} else {*/
	function Canvas() {
		this.canvasElement = document.createElementNS(this.SVG_NAMESPACE, 'svg:svg');
		this.context = {'stroke': '#00F',
		                'fill': 'transparent',
		                'stroke-width': '2'};

/*
		// Markers
		var defs = document.createElementNS(this.SVG_NAMESPACE, 'svg:defs');

		var inEndArrowMarker = document.createElementNS(this.SVG_NAMESPACE, 'svg:marker');
		inEndArrowMarker.setAttribute('id', 'inEndArrow');
		inEndArrowMarker.setAttribute('viewBox', '0 0 16 12');
		inEndArrowMarker.setAttribute('refX', '14');
		inEndArrowMarker.setAttribute('refY', '6');
		inEndArrowMarker.setAttribute('markerUnits', 'strokeWidth');
		inEndArrowMarker.setAttribute('orient', 'auto');
		inEndArrowMarker.setAttribute('markerWidth', '9');
		inEndArrowMarker.setAttribute('markerHeight', '9');

		var polyline = document.createElementNS(this.SVG_NAMESPACE, 'svg:polyline');
		polyline.setAttribute('points', '0,0 16,6 0,12 4,6');

		inEndArrowMarker.appendChild(polyline);
		defs.appendChild(inEndArrowMarker);

		var outEndArrowMarker = document.createElementNS(this.SVG_NAMESPACE, 'svg:marker');
		outEndArrowMarker.setAttribute('id', 'outEndArrow');
		outEndArrowMarker.setAttribute('viewBox', '0 0 16 12');
		outEndArrowMarker.setAttribute('refX', '14');
		outEndArrowMarker.setAttribute('refY', '6');
		outEndArrowMarker.setAttribute('markerUnits', 'strokeWidth');
		outEndArrowMarker.setAttribute('orient', 'auto');
		outEndArrowMarker.setAttribute('markerWidth', '9');
		outEndArrowMarker.setAttribute('markerHeight', '9');

		var polyline = document.createElementNS(this.SVG_NAMESPACE, 'svg:polyline');
		polyline.setAttribute('points', '0,0 16,6 0,12 4,6');

		outEndArrowMarker.appendChild(polyline);
		defs.appendChild(outEndArrowMarker);

		this.canvasElement.appendChild(defs);
*/
/* FIXME
		var a = document.createElement("div");
		a.appendChild(document.createTextNode("hola"));
		this.canvasElement.appendChild(a);
*/
	}

	Canvas.prototype.SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	Canvas.prototype.clear = function() {
		while (this.canvasElement.childNodes.length > 0)
			this.canvasElement.removeChild(this.canvasElement.childNodes[0]);
	}
/*}*/


Canvas.prototype.getHTMLElement = function() {
	return this.canvasElement;
}


Canvas.prototype._mkDiv = function(x, y, w, h) {
	var div = this.canvasElement.ownerDocument.createElement("div");
	div.style.position = 'absolute';
	div.style.left = x + 'px';
	div.style.top = y + 'px';
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	div.style.overflow = 'hidden';
	div.style.backgroundColor = this.context.color;

	return div;
}

Canvas.prototype._drawLine = function(x1, y1, x2, y2) {
	var line = this.canvasElement.ownerDocument.createElement("div");
	if (x1 > x2) {
		var _x2 = x2;
		var _y2 = y2;
		x2 = x1;
		y2 = y1;
		x1 = _x2;
		y1 = _y2;
	}
	var dx = x2-x1, dy = Math.abs(y2-y1),
	x = x1, y = y1,
	yIncr = (y1 > y2)? -1 : 1;

	if (dx >= dy) {
		var pr = dy<<1,
		pru = pr - (dx<<1),
		p = pr-dx,
		ox = x;
		while(dx > 0)
		{--dx;
			++x;
			if(p > 0)
			{
				line.appendChild(this._mkDiv(ox, y, x-ox, 1));
				y += yIncr;
				p += pru;
				ox = x;
			}
			else p += pr;
		}
		line.appendChild(this._mkDiv(ox, y, x2-ox+1, 1));
	} else {
		var pr = dx<<1,
		pru = pr - (dy<<1),
		p = pr-dy,
		oy = y;
		if(y2 <= y1) {
			while(dy > 0)
			{--dy;
				if(p > 0)
				{
					line.appendChild(this._mkDiv(x++, y, 1, oy-y+1));
					y += yIncr;
					p += pru;
					oy = y;
				} else {
					y += yIncr;
					p += pr;
				}
			}
			line.appendChild(this._mkDiv(x2, y2, 1, oy-y2+1));
		} else {
			while(dy > 0)
			{--dy;
				y += yIncr;
				if(p > 0)
				{
					line.appendChild(this._mkDiv(x++, oy, 1, y-oy));
					p += pru;
					oy = y;
				}
				else p += pr;
			}
			line.appendChild(this._mkDiv(x2, oy, 1, y2-oy+1));
		}
	}

	return line;
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
		pointsAttr += " " + points[i].x + "," + points[i].y;

	polyline.setAttribute('points', pointsAttr);
	this._applyStyle(style ? style : this.context, polyline);
	this.canvasElement.appendChild(polyline);
	return polyline;
/*
	var polyline = this.canvasElement.ownerDocument.createElement("div");
	for (var i = 1; i < points.length; i++) {
		var line = this._drawLine(points[i-1].x, points[i-1].y, points[i].x, points[i].y);
		polyline.appendChild(line);
	}
	this.canvasElement.appendChild(polyline);
	return polyline;*/
}

Canvas.prototype.drawArrow = function(from, to, style) {
	var polyline = this.canvasElement.ownerDocument.createElementNS(this.SVG_NAMESPACE, "svg:path");

	var middleX = (from.x + to.x) / 2;

	polyline.setAttribute("d", "M " + from.x + "," + from.y + " " +
	                           "C " + middleX + "," + from.y + " " + middleX + "," + to.y + " " +
	                           to.x + "," + to.y);
	this._applyStyle(style ? style : this.context, polyline);
	this.canvasElement.appendChild(polyline);
	return polyline;
}
