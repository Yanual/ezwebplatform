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
  this.inputs = new Hash(); // Input connections (events & inouts)
  this.outputs = new Hash(); // Output connections (slots & inouts)
  this.channels = new Hash();
  this.channelsForRemoving = new Hash();
  this.enabled = false;
  this.friend_codes = {};
  this.highlight_color = "#FFFFE0"; // TODO remove
  this.channels_counter = 1;
  this.channelBaseName = gettext("Wire");
  this.anchors = new Hash();
  this.visible = false; // TODO temporal workarround

  this.event_list = $('events_list');//wiringContainer.getElementById('events_list');
  this.slot_list = $('slots_list');//wiringContainer.getElementById('slots_list');
  this.channels_list = $('channels_list');//wiringContainer.getElementById('channels_list');
  this.channel_name = $('channel_name');//wiringContainer.getElementById('channel_name');
  this.channelForm = $('newChannelForm');

  this._eventCreateChannel = function (e) {
    Event.stop(e);
    this._createChannel();
  }.bind(this)
  
  WiringInterface.prototype.show = function () {
    if (this.visible)
      return; // Nothing to do

    this.visible = true;

    this.renewInterface();
    this.wiringContainer.setStyle({'zIndex' : 2, 'visibility': 'visible'});
    this.wiringLink.className = "toolbar_marked";
    Event.observe($('newChannelForm'), 'submit', this._eventCreateChannel);
  }

  WiringInterface.prototype.hide = function () {
    if (!this.visible)
      return; // Nothing to do

    this.visible = false;

    this.saveWiring();
    Event.stopObserving(this.channelForm, 'submit', this._eventCreateChannel);
    this.wiringContainer.setStyle({'zIndex' : 1, 'visibility': 'hidden'});
  }

  WiringInterface.prototype.saveWiring = function () {
    var keys = this.channels.keys();
    for (var i = 0; i < keys.length; i++) {
      this.channels[keys[i]].commitChanges(this.wiring);
    }
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
    inputDel.setAttribute("src", "/ezweb/images/dialog-cancel.png");
    Event.observe(inputDel, "click",
                            function () {
                              this.wiringGUI._removeChannel(this.channel);
                            }.bind(context));
    channelElement.appendChild(inputDel);
    channelElement.appendChild(document.createTextNode(channel.getName()));

    var channelContent = document.createElement("div");
    channelContent.addClassName("channelContent");
    var textNodeValue = document.createTextNode(channel.getValue());
    var liVal = document.createElement("div");
    liVal.appendChild(textNodeValue);
    channelContent.appendChild(liVal);
    channelElement.appendChild(channelContent);

    this.channels_list.appendChild(channelElement);
    channel.assignInterface(channelElement);

    this.channels[channel.getName()] = channel;
  }

  WiringInterface.prototype._addIGadget = function (iGadget) {
    // TODO mirar esto
    var ulEvents = document.createElement("div");
    ulEvents.addClassName("igadgetContent");
    var ulSlots = document.createElement("div");
    ulSlots.addClassName("igadgetContent");

    var connectables = this.wiring.getIGadgetConnectables(iGadget);

    // Events & Slots
    for (var i = 0; i < connectables.length; i++) {
      var connectable = connectables[i];
      var anchor = new ConnectionAnchor(connectable);

      var connectableElement = document.createElement("div");
      connectableElement.appendChild(document.createTextNode(connectable.getName()));

      var chkItem = document.createElement("div");
      chkItem.addClassName("chkItem");
      connectableElement.appendChild(chkItem);

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
        this.inputs[connectable.getQualifiedName()] = anchor;
      } else if (connectable instanceof wOut) {
        ulSlots.appendChild(connectableElement);
        this.outputs[connectable.getQualifiedName()] = anchor;
      }
    }

    // Generic information about the iGadget
    var gadget = iGadget.getGadget();
    var IGadgetName = gadget.getName() + " [" + iGadget.id + "]";

    // Event column
    if (ulEvents.childNodes.length > 0) {
      var igadgetDiv = document.createElement("div");
      igadgetDiv.addClassName("igadget");
      igadgetDiv.appendChild(document.createTextNode(IGadgetName));

      var context = {element: igadgetDiv, wiringGUI:this};
      Event.observe(igadgetDiv,
                    "click",
                    function () {this.wiringGUI._toggle(this.element);}.bind(context));

      igadgetDiv.appendChild(ulEvents);
      this.event_list.appendChild(igadgetDiv);
    }

    // Slot column
    if (ulSlots.childNodes.length > 0) {
      var igadgetDiv = document.createElement("div");
      igadgetDiv.addClassName("igadget");
      igadgetDiv.appendChild(document.createTextNode(IGadgetName));

      var context = {element: igadgetDiv, wiringGUI:this};
      Event.observe(igadgetDiv,
                    "click",
                    function () {this.wiringGUI._toggle(this.element);}.bind(context));
      igadgetDiv.appendChild(ulSlots);
      this.slot_list.appendChild(igadgetDiv);
    }
  }

  WiringInterface.prototype.renewInterface = function () {
    // Clean the interface
    this.event_list.innerHTML = "";
    this.slot_list.innerHTML = "";
    this.channels_list.innerHTML = "";

    // Clean data structures
    this.friend_codes = {};
    this.inputs = new Hash();
    this.outputs = new Hash();
    this.currentChannel = null;

    // Build the interface
    var iGadgets = this.workspace.getIGadgets();
    var channels = this.wiring.getChannels();

    for (var i = 0; i < iGadgets.length; i++) {
      this._addIGadget(iGadgets[i]);
    }

    for (var j = 0; j < channels.length; j++) {
      this._addChannelInterface(new ChannelInterface(channels[j]));
    }

    this.channels_counter = channels.length + 1;
  }

  WiringInterface.prototype._changeConnectionStatus = function (anchor) {
    if (this.currentChannel == null) {
      if (this.channels.size() == 0) {
        // Warn user about creating a channel
      } else {
        // Warn user about selecting a channel
      }
      
      return;
    }

    var connectable = anchor.getConnectable();

    // add/remove the connection
    if (connectable instanceof wIn) {
      if (anchor.isConnected()) {
        this.currentChannel.disconnectInput(connectable);
        anchor.setConnectionStatus(false);
      } else {
        this.currentChannel.connectInput(connectable);
        anchor.setConnectionStatus(true);
      }
    } else if (connectable instanceof wOut) {
      if (anchor.isConnected()) {
        this.currentChannel.disconnectOutput(connectable);
        anchor.setConnectionStatus(false);
      } else {
        this.currentChannel.connectOutput(connectable);
        anchor.setConnectionStatus(true);
      }
    }
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
    while (this.channels[channelName] != undefined) {
      // Build another channel name
      channelName = this.channelBaseName + "_" + this.channels_counter;
      this.channels_counter++;
    }

    var channel = new ChannelInterface(channelName, null);
    this._addChannelInterface(channel);
    this._changeChannel(channel);
  }

  WiringInterface.prototype._removeChannel = function (channel) {
    var channelName = channel.getName()
    if (this.channels[channelName] == null)
      return; // Nothing to do

    // Check whether this channel exists in the current wiring model
    // or when it was created with the wiring interface and removed
    // before commiting changes
    if (channel.exists())
      this.channelsForRemove.push(channel);

    this._setEnableStatus(false);
    this.channels_list.removeChild(channel.getInterface());
    delete this.channels[channelName];
  }

  WiringInterface.prototype._changeChannel = function(newChannel) {
    var oldChannel = this.currentChannel;
    this.currentChannel = newChannel;

    if (oldChannel) {
      this._uncheckChannel(oldChannel);
    }

    if (oldChannel != newChannel) {
      this._highlightChannel(newChannel);
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
    if (!this.enabled && highlight)
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

  WiringInterface.prototype._uncheckChannel = function (channel) {
    channel.uncheck();

    var connectables = channel.getInputs();
    var keys = connectables.keys();
    for (var i = 0; i < keys.length; ++i)
      this.inputs[keys[i]].setConnectionStatus(false);

    var connectables = channel.getOutputs();
    var keys = connectables.keys();
    for (var i = 0; i < keys.length; ++i)
      this.outputs[keys[i]].setConnectionStatus(false);
  }

  WiringInterface.prototype._highlightChannel = function (channel) {
    channel.check();

    var connectables = channel.getInputs();
    var keys = connectables.keys();
    for (var i = 0; i < keys.length; ++i)
      this.inputs[keys[i]].setConnectionStatus(true);

    var connectables = channel.getOutputs();
    var keys = connectables.keys();
    for (var i = 0; i < keys.length; ++i)
      this.outputs[keys[i]].setConnectionStatus(true);
  }

  WiringInterface.prototype._setEnableStatus = function(enabled) {
    if (this.enabled == enabled)
      return; // Nothing to do

    // TODO
    this.enabled = enabled;
  }

    // ***********************************
    //  COLOR SCHEME FOR HIGHLIGTHS
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

    this.color_scheme.push("#b3ab00");
    this.color_scheme.push("#b3ffeb");
    this.color_scheme.push("#ffb08f");
    this.color_scheme.push("#ffbff5");
    this.color_scheme.push("#40ffed");
    this.color_scheme.push("#e6dfcf");

    this.color_scheme.push("#f0f2ff");
    this.color_scheme.push("#d1ffeb");
    this.color_scheme.push("#91ffe6");
    this.color_scheme.push("#2800b0");
    this.color_scheme.push("#c4ffde");
    this.color_scheme.push("#a82fe0");

    this.color_scheme.push("#ff5200");
    this.color_scheme.push("#ed9eff");
    this.color_scheme.push("#5c97e6");
    this.color_scheme.push("#ff0dba");
    this.color_scheme.push("#1c778c");
    this.color_scheme.push("#0058a1");

    this.color_scheme.push("#f7cbb2");
    this.color_scheme.push("#8f2e00");
    this.color_scheme.push("#631cff");
    this.color_scheme.push("#a5cf00");
    this.color_scheme.push("#997354");
    this.color_scheme.push("#ff73eb");

    this.color_scheme.push("#c41200");
    this.color_scheme.push("#3b00ed");
    this.color_scheme.push("#13f2ce");
    this.color_scheme.push("#ff8ac7");
    this.color_scheme.push("#ffbae0");
    this.color_scheme.push("#91ffba");

}

/**********
 *
 **********/
function ConnectionAnchor(connectable) {
  this.connectable = connectable;
  this.connected = false;
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

ConnectionAnchor.prototype.setConnectionStatus = function(newStatus) {
  this.connected = newStatus;
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
    this.inputs = new Hash();
    this.outputs = new Hash();    
  }

  this.inputsForAdding = new Hash();
  this.inputsForRemoving = new Hash();
  this.outputsForAdding = new Hash();
  this.outputsForRemoving = new Hash();

  // Draw the interface
}

//ChannelInterface.prototype.setName = function(newName) {
//  this.name = newName;
//}

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
  var keys, i;

  if (this.channel == null) {
    // The channel don't exists
    this.channel = wiring.createChannel(this.name);
  }

  // Inputs for removing
  keys = this.inputsForRemoving.keys();
  for (i = 0; i < keys.length; i++) {
    this.inputsForRemoving[keys[i]].disconnect(this.channel);
  }
  this.inputsForRemoving = new Hash();

  // Outputs for removing
  keys = this.outputsForRemoving.keys();
  for (i = 0; i < keys.length; i++) {
    this.channel.disconnect(this.outputsForRemoving[keys[i]]);
  }
  this.outputsForRemoving = new Hash();

  // Outputs for adding
  keys = this.outputsForAdding.keys();
  for (i = 0; i < keys.length; i++) {
    this.channel.connect(this.outputsForAdding[keys[i]]);
  }
  this.outputsForAdding = new Hash();

  // Inputs for adding
  keys = this.inputsForAdding.keys();
  for (i = 0; i < keys.length; i++) {
    this.inputsForAdding[keys[i]].connect(this.channel);
  }
  this.inputsForAdding = new Hash();

  return changes;
}

ChannelInterface.prototype.exists = function() {
  return this.channel != null;
}

ChannelInterface.prototype.check = function() {
  this.interface.addClassName("selected");
}

ChannelInterface.prototype.uncheck = function() {
  this.interface.removeClassName("selected");
}

ChannelInterface.prototype.assignInterface = function(interface) {
  this.interface = interface;
}

ChannelInterface.prototype.getInterface = function() {
  return this.interface;
}

ChannelInterface.prototype.connectInput = function(wIn) {
  if (this.channel != null &&
      this.channel.inputs[wIn.getQualifiedName()] != undefined) {
    delete this.inputsForRemoving[wIn.getQualifiedName()];
  } else {
    this.inputsForAdding[wIn.getQualifiedName()] = wIn;
  }
  this.inputs[wIn.getQualifiedName()] = wIn;
}

ChannelInterface.prototype.disconnectInput = function(wIn) {
  if (this.channel != null &&
      this.channel.inputs[wIn.getQualifiedName()] != undefined) {
    delete this.inputsForAdding[wIn.getQualifiedName()];
  } else {
    this.inputsForRemoving[wIn.getQualifiedName()] = wIn;
  }
  delete this.inputs[wIn.getQualifiedName()];
}

ChannelInterface.prototype.connectOutput = function(connectable) {
  if (this.channel != null &&
      this.channel.outputs[connectable.getQualifiedName()] != undefined) {
    delete this.outputsForRemoving[connectable.getQualifiedName()];
  } else {
    this.outputsForAdding[connectable.getQualifiedName()] = connectable;
  }
  this.outputs[connectable.getQualifiedName()] = connectable;
}

ChannelInterface.prototype.disconnectOutput = function(connectable) {
  if (this.channel != null &&
      this.channel.inputs[connectable.getQualifiedName()] != undefined) {
    delete this.outputsForAdding[connectable.getQualifiedName()];
  } else {
    this.outputsForRemoving[connectable.getQualifiedName()] = connectable;
  }
  delete this.outputs[connectable.getQualifiedName()];
}
