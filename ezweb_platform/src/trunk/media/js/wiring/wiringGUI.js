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
  this.inputs = new Array(); // Input connections (events & inouts)
  this.outputs = new Array(); // Output connections (slots & inouts)
  this.channels = new Array();
  this.channelsForRemove = new Array();
  this.enabled = false;
  this.friend_codes = {};
  this.highlight_color = "#FFFFE0"; // TODO remove
  this.friend_codes_counter = 0;
  this.channels_counter = 1;
  this.channelBaseName = gettext("Channel");
  //this.anchors = new Hash();
  this.visible = false; // TODO temporal workarround

  this.event_list = $('events_list');//wiringContainer.getElementById('events_list');
  this.slot_list = $('slots_list');//wiringContainer.getElementById('slots_list');
  this.channels_list = $('channels_list');//wiringContainer.getElementById('channels_list');
  this.channel_name = $('channel_name');//wiringContainer.getElementById('channel_name');
  this.msgsDiv = $('wiring_messages');
  this.newChannel = $('newChannel');

  this._eventCreateChannel = function (e) {
    Event.stop(e);
    this._createChannel();
  }.bind(this)
  
  WiringInterface.prototype.show = function () {
    if (this.visible)
      return; // Nothing to do

    this.visible = true;

    this.renewInterface();

    LayoutManagerFactory.getInstance().showWiring(this);

    Event.observe(this.newChannel, 'click', this._eventCreateChannel);
  }

  WiringInterface.prototype.hide = function () {
    if (!this.visible)
      return; // Nothing to do

    this.visible = false;
    if(this.currentChannel){
		this.uncheckChannel(this.currentChannel);
    }
    this.saveWiring();
    this.channels.clear();
    Event.stopObserving(this.newChannel, 'click', this._eventCreateChannel);
    LayoutManagerFactory.getInstance().hideView(this.wiringContainer);
  }

  WiringInterface.prototype.saveWiring = function () {
    // Remove channels
    for (var i = 0; i < this.channelsForRemove.length; i++) {
      this.wiring.removeChannel(this.channelsForRemove[i].channel.getId());
    }

    // Create & update channels
    for (var i = 0; i < this.channels.length; i++) {
      this.channels[i].commitChanges(this.wiring);
    }
    
    // The wiring engine is notified in order to persist state!
    this.wiring.serialize();
  }

  WiringInterface.prototype._addChannelInterface = function (channel) {
    var context = {channel: channel, wiringGUI:this};
    var channelElement = document.createElement("div");
    channelElement.addClassName("channel");
    var itemName = "channel_chk_" + channel.getName();
    
    Event.observe(channelElement, "click",
                      function (e) {
                        Event.stop(e);
                        this.wiringGUI._changeChannel(this.channel);
                      }.bind(context));

    var inputDel = document.createElement("img");
    inputDel.setAttribute("alt", gettext("Remove"));
    inputDel.setAttribute("src", "/ezweb/images/remove.png");
    
    Event.observe(inputDel, "click",
                            function (e) {
                              Event.stop(e);
                              this.wiringGUI._removeChannel(this.channel);
                            }.bind(context));
    
    channelElement.appendChild(inputDel);
    
    var channelNameInput = document.createElement("input");
    
    channelNameInput.value=channel.getName();
    channelNameInput.className="channelNameInput";
    
    channelElement.appendChild(channelNameInput);
    Event.observe(channelNameInput, 'click', function(e){if(this.wiringGUI.currentChannel==this.channel)Event.stop(e);}.bind(context)); //do not propagate to div.
    
    var checkName = function(e){
    	if(e.target.value == "" || e.target.value.match(/^\s$/)){
	    	var msg = gettext("Error updating a channel. Invalid name");
			LogManagerFactory.getInstance().log(msg);
    		e.target.value=this.channel.getName();
    	}else if(this.wiringGUI.channelExists(e.target.value)){
    		var msg = interpolate(gettext("Error updating a channel. %(channelName)s: Channel already exists"),{channelName: e.target.value}, true);
			LogManagerFactory.getInstance().log(msg);
			e.target.value=this.channel.getName();
    	}else{
    		this.channel.setName(e.target.value)
    	}
    }
    Event.observe(channelNameInput, 'change', checkName.bind(context));
     
    var channelContent = document.createElement("div");
    channelContent.addClassName("channelContent");
    
    // Channel information showed when the channel is selected
    
    var textNodeValue = document.createTextNode("Value: " + channel.getValue());
    var liVal = document.createElement("div");
    liVal.appendChild(textNodeValue);
    channelContent.appendChild(liVal);
    channelElement.appendChild(channelContent);

    this.channels_list.appendChild(channelElement);
    channel.assignInterface(channelElement);

	this.channels.push(channel);
    channelNameInput.focus();
  }
  
  WiringInterface.prototype._addTab = function (tab) {
  	// TODO mirar esto
    var events = document.createElement("div");
    events.addClassName("tab");
    
    var slots = document.createElement("div");
    slots.addClassName("tab");
    
    //Tab events
    var connectableElement = document.createElement("div");
    connectableElement.addClassName("tabContent");
	connectableElement.appendChild(document.createTextNode(tab.tabInfo.name));
	events.appendChild(connectableElement);
    
    // Tab slot
    connectableElement = document.createElement("div");
    connectableElement.addClassName("tabContent");
	connectableElement.appendChild(document.createTextNode(tab.tabInfo.name));
	
	var chkItem = document.createElement("div");
	chkItem.addClassName("unchkItem");
	connectableElement.appendChild(chkItem);
	 
	var connectable = tab.connectable;
	var anchor = new ConnectionAnchor(tab.connectable, chkItem);
	
	var context = {anchor: anchor, wiringGUI:this};
	Event.observe(chkItem, "click",
	                         function () {
	                           this.wiringGUI._changeConnectionStatus(this.anchor);
	                         }.bind(context));
	
	// Cancel bubbling of _toggle
	function cancelbubbling(e) {
	   Event.stop(e);
	}
	
	connectableElement.addEventListener("click", cancelbubbling, false);

	slots.appendChild(connectableElement);
	this.outputs.push(anchor);

    
    // Igadget slots
    var igadgets = tab.dragboard.getIGadgets();
    for (var i = 0; i < igadgets.length; i++){
    	this._addIGadget(igadgets[i], events, slots);
    }
    
    if (events.childNodes.length > 1){ //Elements without title
  		this.event_list.appendChild(events);
    }
    
  	this.slot_list.appendChild(slots);
  }
  
  WiringInterface.prototype._addIGadget = function (igadget, events, slots) {
    // TODO mirar esto
    var ulEvents = document.createElement("div");
    ulEvents.addClassName("igadgetContent");
    var ulSlots = document.createElement("div");
    ulSlots.addClassName("igadgetContent");

    var connectables = this.wiring.getIGadgetConnectables(igadget);

    // Events & Slots
    for (var i = 0; i < connectables.length; i++) {
      var connectable = connectables[i];

      var connectableElement = document.createElement("div");
      connectableElement.appendChild(document.createTextNode(connectable.getName()));

      var chkItem = document.createElement("div");
      connectableElement.appendChild(chkItem);
      var anchor = new ConnectionAnchor(connectable, chkItem);
      anchor.setConnectionStatus(false, null, null);

      var context = {anchor: anchor, wiringGUI:this};
      Event.observe(chkItem, "click",
                             function () {
                               this.wiringGUI._changeConnectionStatus(this.anchor);
                             }.bind(context));

      // Harvest info about the friendCode of the connectable
      var friendCode = connectable.getFriendCode();
      if (friendCode != null) {
        if (!this.friend_codes[friendCode]) {
          // Create the friend code entry in the list of friend codes
          this.friend_codes[friendCode] = {};
          this.friend_codes[friendCode].list = [];
          this.friend_codes[friendCode].color = this.color_scheme[this.friend_codes_counter++];
        }

        this.friend_codes[friendCode].list.push(connectableElement);

        var context = {friendCode: friendCode, wiringGUI:this};

        connectableElement.addEventListener("mouseover",
                                function () {this.wiringGUI._highlight_friend_code(this.friendCode, true);}.bind(context),
                                false);
        connectableElement.addEventListener("mouseout",
                                function () {this.wiringGUI._highlight_friend_code(this.friendCode, false);}.bind(context),
                                false);
      }

      // Cancel bubbling of _toggle
      function cancelbubbling(e) {
        Event.stop(e);
      }

      connectableElement.addEventListener("click", cancelbubbling, false);

      // Insert it on the correct list of connectables
      if (connectable instanceof wIn) {
        ulEvents.appendChild(connectableElement);
        this.inputs.push(anchor);
      } else if (connectable instanceof wOut) {
        ulSlots.appendChild(connectableElement);
        this.outputs.push(anchor);
      }
    }

    // Generic information about the iGadget
    var gadget = igadget.getGadget();
    var IGadgetName = igadget.name;

    // Event column
    if (ulEvents.childNodes.length > 0) {
      var igadgetDiv = document.createElement("div");
      igadgetDiv.addClassName("igadget");
      igadgetDiv.appendChild(document.createTextNode(IGadgetName));
      igadgetDiv.appendChild(ulEvents);
      events.appendChild(igadgetDiv);
    }

    // Slot column
    if (ulSlots.childNodes.length > 0) {
      var igadgetDiv = document.createElement("div");
      igadgetDiv.addClassName("igadget");
      igadgetDiv.appendChild(document.createTextNode(IGadgetName));
      igadgetDiv.appendChild(ulSlots);
      slots.appendChild(igadgetDiv);
    }
  }

  WiringInterface.prototype.clearMessages = function () {
    this.msgsDiv.setStyle({display: null});
  }

  WiringInterface.prototype.renewInterface = function () {
    // Clean the interface
    this.event_list.innerHTML = "";
    this.slot_list.innerHTML = "";
    this.channels_list.innerHTML = "";
    this.clearMessages();

    // Clean data structures
    this.friend_codes_counter = 0;
    this.friend_codes = {};
    this.inputs.clear();
    this.outputs.clear();
    this.currentChannel = null;
    this.channelsForRemove = new Array();


    // Build the interface
    var tabs = this.workspace.tabInstances.keys();
    for (var i = 0; i < tabs.length; i++) {
    	this._addTab(this.workspace.tabInstances[tabs[i]]);
    }
    
    var channels = this.wiring.getChannels();
    for (var j = 0; j < channels.length; j++) {
      this._addChannelInterface(new ChannelInterface(channels[j]));
    }

    this.channels_counter = channels.length + 1;
  }

  WiringInterface.prototype._changeConnectionStatus = function (anchor) {
    if (this.currentChannel == null) {
      if (this.channels.length == 0) {
        this.msgsDiv.innerHTML = gettext("Please, create a new channel before creating connections.");
      } else {
        this.msgsDiv.innerHTML = gettext("Please, select a channel before creating connections.");
      }
      this.msgsDiv.setStyle({display: "block"});
      
      return;
    }

    var connectable = anchor.getConnectable();

    // add/remove the connection
    if (connectable instanceof wIn) {
      if (anchor.isConnected()) {
        this.currentChannel.disconnectInput(connectable);
        anchor.setConnectionStatus(false, null, null);
      } else {
        this.currentChannel.connectInput(connectable);
        anchor.setConnectionStatus(true, this.currentChannel.inPosition, null);
      }
    } else if (connectable instanceof wOut) {
      if (anchor.isConnected()) {
        this.currentChannel.disconnectOutput(connectable);
        anchor.setConnectionStatus(false, null, null);
      } else {
        this.currentChannel.connectOutput(connectable);
        anchor.setConnectionStatus(true, null, this.currentChannel.outPosition);
      }
    }
  }

	WiringInterface.prototype.channelExists = function(channelName){
		if(this.channels.getElementByName(channelName))
			return true;
		return false;
	}

  WiringInterface.prototype._createChannel = function () {
    var result = null;
    var channelName = this.channel_name.value;

    if (channelName == "") {
      // Build an initial channel name
      channelName = this.channelBaseName + "_" + this.channels_counter;
      this.channels_counter++;
    }

    // Check if there is another channel with the same name
    while (this.channelExists(channelName)) {
      // Build another channel name
      channelName = this.channelBaseName + "_" + this.channels_counter;
      this.channels_counter++;
    }

    var channel = new ChannelInterface(channelName, null);
    this._addChannelInterface(channel);
    this.clearMessages();
    this._changeChannel(channel);
  }

  WiringInterface.prototype._removeChannel = function (channel) {

    if (!this.channels.elementExists(channel))
      return; // Nothing to do

    // Check whether this channel exists in the current wiring model
    // or when it was created with the wiring interface and removed
    // before commiting changes
    if (channel.exists())
      this.channelsForRemove.push(channel);

    if (this.currentChannel == channel){
      this._changeChannel(channel);
	  this.channels_list.removeChild(channel.getInterface());
    }else{
      this.channels_list.removeChild(channel.getInterface());
      if(this.currentChannel){
		  //repaint status because the channel position may have changed
		  this.uncheckChannel(this.currentChannel);
    	  this.highlightChannel(this.currentChannel);
      }
	}
    
    this.channels.remove(channel);
  }

  WiringInterface.prototype._changeChannel = function(newChannel) {
    var oldChannel = this.currentChannel;
    this.currentChannel = newChannel;

    if (oldChannel) {
      this.uncheckChannel(oldChannel);
    }
    this.clearMessages();
    if (oldChannel != newChannel) {
      this.highlightChannel(newChannel);
      this._setEnableStatus(true);
    } else {
      this.currentChannel = null;
      this._setEnableStatus(false);
    }
  }
  
  WiringInterface.prototype._toggle = function (element) {
    element.toggleClassName("folded");
  }

  WiringInterface.prototype._highlight = function (chk, friendCode) {
    if (!this.friend_codes[friend_code]) {
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

  WiringInterface.prototype._highlight_friend_code = function (friend_code, highlight) {
    // Don't highligh if the interface is disabled
    if (!this.enabled)
      return;

    if (!this.friend_codes[friend_code]) {
      // Error
      return;
    }

    var fcList = this.friend_codes[friend_code].list;
    var fcColor = this.friend_codes[friend_code].color;
    var fcBgColor = "";

    for (var i = 0; i < fcList.length; i++) {
      if (fcElement = fcList[i]) {
        if (highlight) {
          fcElement.style.backgroundColor = fcColor;
        } else {
          fcElement.style.backgroundColor = fcBgColor;
        }
        fcElement.parentNode.parentNode.removeClassName("folded");
      }
    }
  }

  WiringInterface.prototype.uncheckChannel = function (channel) {
    channel.uncheck();

    var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; ++i){
    	var connectable = connectables[i];
    	for(var j = 0; j < this.inputs.length; j++){
    		if(connectable.getId() == this.inputs[j].connectable.getId()){
    			this.inputs[j].setConnectionStatus(false, null, null);
    			break;
    		}
    	}
    }

    var connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; ++i){
    	var connectable = connectables[i];
    	for(var j = 0; j < this.outputs.length; j++){
    		if(connectable.getId() == this.outputs[j].connectable.getId()){
    			this.outputs[j].setConnectionStatus(false, null, null);
    			break;
    		}
    	}
    }
 
  }

  WiringInterface.prototype.highlightChannel = function (channel) {
    channel.check();

    var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; ++i){
    	var connectable = connectables[i];
    	for(var j = 0; j < this.inputs.length; j++){
    		if(connectable.getId() == this.inputs[j].connectable.getId()){
    			this.inputs[j].setConnectionStatus(true, channel.inPosition, null);
    			break;
    		}
    	}
    }

    var connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; ++i){
       	var connectable = connectables[i];
    	for(var j = 0; j < this.outputs.length; j++){
    		if(connectable.getId() == this.outputs[j].connectable.getId()){
    			this.outputs[j].setConnectionStatus(true, null, channel.outPosition);
    			break;
    		}
    	}
    }	
  }

  WiringInterface.prototype._setEnableStatus = function(enabled) {
    if (this.enabled == enabled)
      return; // Nothing to do

    // TODO
    this.enabled = enabled;
  }

    // ***********************************
    //  COLOR SCHEME FOR HIGHLIGHTS
    //  More colors in color_scheme.js file but now it's not used!
    //  Too many colors at that file, it's has been optimized!
    // ***********************************

    this.color_scheme = [];

    this.color_scheme.push("#ffb0a1");

    this.color_scheme.push("#a6ffbf");
    this.color_scheme.push("#7a5e85");
    this.color_scheme.push("#b3f0ff");
    this.color_scheme.push("#cf36ff");
    this.color_scheme.push("#5496ff");
    this.color_scheme.push("#e854ff");

    this.color_scheme.push("#662500");
    this.color_scheme.push("#5a9e68");
    this.color_scheme.push("#bf6900");
    this.color_scheme.push("#a17800");
    this.color_scheme.push("#72cc85");
    this.color_scheme.push("#e6ff42");

    this.color_scheme.push("#becfbc");
    this.color_scheme.push("#005710");
    this.color_scheme.push("#00193f");
    this.color_scheme.push("#e0fffa");
    this.color_scheme.push("#f0ff3d");
    this.color_scheme.push("#f0d8d3");

    this.color_scheme.push("#ab5c00");
    this.color_scheme.push("#3c008f");
    this.color_scheme.push("#d6ff8a");
    this.color_scheme.push("#fac0e1");
    this.color_scheme.push("#4700ad");
    this.color_scheme.push("#ccc6ad");

    this.color_scheme.push("#261e06");
    this.color_scheme.push("#4fedff");
    this.color_scheme.push("#e6bebc");
    this.color_scheme.push("#f0ed73");
    this.color_scheme.push("#4f1800");
    this.color_scheme.push("#020073");

    this.color_scheme.push("#0fff00");
    this.color_scheme.push("#686b00");
    this.color_scheme.push("#804dff");
    this.color_scheme.push("#b100bd");
    this.color_scheme.push("#69ffab");
    this.color_scheme.push("#e6acb8");

    this.color_scheme.push("#8c7a77");
    this.color_scheme.push("#006bfa");
    this.color_scheme.push("#8cffab");
    this.color_scheme.push("#d1d190");
    this.color_scheme.push("#0d4000");
    this.color_scheme.push("#f0e8c4");

    this.color_scheme.push("#0048e8");
    this.color_scheme.push("#b8ffe0");
    this.color_scheme.push("#5effe0");
    this.color_scheme.push("#770000");
    this.color_scheme.push("#913dff");
    this.color_scheme.push("#5357cf");

}

/**********
 *
 **********/
function ConnectionAnchor(connectable, anchorDiv) {
  this.connectable = connectable;
  this.connected = false;
  this.htmlElement = anchorDiv;

}

ConnectionAnchor.prototype.getConnectable = function() {
  return this.connectable;
}

ConnectionAnchor.prototype.assignInterface = function(interface) {
  this.interface = interface;
}

ConnectionAnchor.prototype.getInterface = function() {
  return this.interface;
}

ConnectionAnchor.prototype.drawPolyLine = function(x1,y1,x2,y2,left)
{
	this.canvas= document.createElement('div');
	this.canvas.addClassName('canvas');
	$('wiring').appendChild(this.canvas);
	this.jg_doc = new jsGraphics(this.canvas); // draw directly into document
	var xList= new Array(x1, (x1+x2)/2, (x1+x2)/2, x2 );
	var yList= new Array(y1, y1, y2, y2);
	this.jg_doc.setColor("#2D6F9C");
	this.jg_doc.setStroke(2);  
	this.jg_doc.drawPolyline(xList, yList);
	var arrow = document.createElement('div');
	arrow.addClassName('arrow');
	arrow.style.display= 'none';
	this.canvas.appendChild(arrow);
	arrow.style.top = Math.round(y2 - arrow.getHeight()/2)+1 +"px";
	arrow.style.left = ((x2 - arrow.getWidth())+2) +"px";
	arrow.style.display = 'block';

	this.jg_doc.paint();
}

ConnectionAnchor.prototype.clearPolyLine = function()
{
	if(this.jg_doc){
		this.jg_doc.clear();
		$('wiring').removeChild(this.canvas);
		delete this.jg_doc;
	}
}

ConnectionAnchor.prototype.setConnectionStatus = function(newStatus, inChannelPos, outChannelPos) {
  this.connected = newStatus;
  
  if (newStatus){
	  this.htmlElement.className="chkItem";
	  //draw arrow
	  if(this.jg_doc){
	  	this.jg_doc.clear();
	  }
	  var coordinates = Position.cumulativeOffset(this.htmlElement);
	  var wiringPosition = Position.cumulativeOffset($('wiring'));
	  coordinates[0] = coordinates[0] - wiringPosition[0] - 1; //-1px of img border
	  coordinates[1] = coordinates[1] - wiringPosition[1] +(this.htmlElement.getHeight())/2 + 2;  
	  if (this.connectable instanceof wIn){
		  coordinates[0] = coordinates[0] + this.htmlElement.getWidth();
		  this.drawPolyLine(coordinates[0],coordinates[1], inChannelPos[0], inChannelPos[1], true);
	  }else{
	  	  this.drawPolyLine(outChannelPos[0], outChannelPos[1],coordinates[0],coordinates[1], false);
	  }
  }else{
	  this.htmlElement.className="unchkItem";
	  this.clearPolyLine();
  }
  
}

ConnectionAnchor.prototype.isConnected = function() {
  return this.connected;
}

/**********
 *
 **********/

function ChannelInterface(channel) {
  if (channel instanceof wChannel) {
    // Existant channel
    this.channel = channel;
    this.name = channel.getName();
    this.inputs = channel.inputs.clone();
    this.outputs = channel.outputs.clone();
  } else {
    // New channel
    this.channel = null;
    this.name = channel;
    this.inputs = new Array();
    this.outputs = new Array();
    this.provisional_id = new Date().getTime();
  }

  this.inputsForAdding = new Array();
  this.inputsForRemoving = new Array();
  this.outputsForAdding = new Array();
  this.outputsForRemoving = new Array();
  this.inPosition = new Array();		//coordinates of the point where the channel input arrow ends
  this.outPosition = new Array();		//coordinates of the point where the channel output arrow starts

  // Draw the interface
}

ChannelInterface.prototype.setName = function(newName) {
  this.name = newName;
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

ChannelInterface.prototype.getValue = function() {
  if (this.channel) {
    return this.channel.getValue();
  } else {
    return gettext("undefined"); // TODO
  }
}

ChannelInterface.prototype.commitChanges = function(wiring) {
  var changes = [];
  var i;

  //this.name = this.interface.getElementsByClassName('channelNameInput')[0].value;
  
  if (this.channel == null) {
    // The channel don't exists
    this.channel = wiring.createChannel(this.name, this.provisional_id);
  } else {
	  // Update channel name
	  this.channel._name = this.name;
  }

  // Inputs for removing
  for (i = 0; i < this.inputsForRemoving.length; i++) {
    this.inputsForRemoving[i].disconnect(this.channel);
  }
  this.inputsForRemoving.clear();

  // Outputs for removing
  for (i = 0; i < this.outputsForRemoving.length; i++) {
    this.channel.disconnect(this.outputsForRemoving[i]);
  }
  this.outputsForRemoving.clear();

  // Outputs for adding
  for (i = 0; i < this.outputsForAdding.length; i++) {
    this.channel.connect(this.outputsForAdding[i]);
  }
  this.outputsForAdding.clear();

  // Inputs for adding
  for (i = 0; i < this.inputsForAdding.length; i++) {
    this.inputsForAdding[i].connect(this.channel);
  }
  this.inputsForAdding.clear();

  return changes;
}

ChannelInterface.prototype.exists = function() {
  return this.channel != null;
}

ChannelInterface.prototype.check = function() {
  this.interface.addClassName("selected");
  this.interface.getElementsByClassName('channelNameInput')[0].focus();
  //calculate the position where de in arrows will end and the out ones will start
  this.inPosition = Position.cumulativeOffset(this.interface);
  var wiringPosition = Position.cumulativeOffset($('wiring'));
  this.inPosition[0] = this.inPosition[0] - wiringPosition[0] - 1; //border 
  this.inPosition[1] = this.inPosition[1] - wiringPosition[1] - 1 + (this.interface.getHeight())/2;
  this.outPosition[1] = this.inPosition[1];
  this.outPosition[0] = this.inPosition[0]+this.interface.getWidth();
}

ChannelInterface.prototype.uncheck = function() {
  this.interface.removeClassName("selected");
  this.interface.getElementsByClassName('channelNameInput')[0].blur();
}

ChannelInterface.prototype.assignInterface = function(interface) {
  this.interface = interface;
}

ChannelInterface.prototype.getInterface = function() {
  return this.interface;
}

ChannelInterface.prototype.connectInput = function(wIn) {
  if (this.channel != null &&
      this.channel.inputs.elementExists(wIn)) {
    	this.inputsForRemoving.remove(wIn);
  } else {
    this.inputsForAdding.push(wIn);
  }
  this.inputs.push(wIn);
}

ChannelInterface.prototype.disconnectInput = function(wIn) {
  if (this.channel != null &&
      this.channel.inputs.elementExists(wIn)) {
	    this.inputsForRemoving.push(wIn);
  } else {
   		this.inputsForAdding.remove(wIn);
  }
  this.inputs.remove(wIn);
}

ChannelInterface.prototype.connectOutput = function(connectable) {
  if (this.channel != null &&
      this.channel.outputs.elementExists(connectable)) {
	    this.outputsForRemoving.remove(connectable);
  } else {
	    this.outputsForAdding.push(connectable);
  }
  this.outputs.push(connectable);
}

ChannelInterface.prototype.disconnectOutput = function(connectable) {
  if (this.channel != null &&
      this.channel.outputs.elementExists(connectable)) {
	    this.outputsForRemoving.push(connectable);
  } else {
    	this.outputsForAdding.remove(connectable);
  }
  this.outputs.remove(connectable);
}
