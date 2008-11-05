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

  this.eventColumn = $('eventColumn');
  this.slotColumn = $('slotColumn');
  this.event_list = $('events_list');//wiringContainer.getElementById('events_list');
  this.slot_list = $('slots_list');//wiringContainer.getElementById('slots_list');
  this.channels_list = $('channels_list');//wiringContainer.getElementById('channels_list');
  this.channel_name = $('channel_name');//wiringContainer.getElementById('channel_name');
  this.msgsDiv = $('wiring_messages');
  this.newChannel = $('newChannel');
  this.wiringTable = $('wiring_table');

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
		this.currentChannel = null;
    }
    
    this.saveWiring();
    this.channels.clear();
    
	if($('toggleEvents'))
	    $('toggleEvents').remove();
    $('toggleSlots').remove();    
    Event.stopObserving(this.newChannel, 'click', this._eventCreateChannel);
    LayoutManagerFactory.getInstance().hideView(this.wiringContainer);
  }
  
  WiringInterface.prototype.unload = function () {
	    // Saving wiring structure and hiding!
	    //this.wiringContainer.update();
	    
	    delete this;
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
  	var tabEvents = new EventTabInterface(tab, this);
  	var tabSlots = new SlotTabInterface(tab, this);
/*
	// Cancel bubbling of _toggle
	function cancelbubbling(e) {
	   Event.stop(e);
	}
	
	connectableElement.addEventListener("click", cancelbubbling, false);*/

    // Igadgets
    var igadgets = tab.dragboard.getIGadgets();
    for (var i = 0; i < igadgets.length; i++){
    	this._addIGadget(igadgets[i], tabEvents, tabSlots);
    }
    
    if (tabEvents.tabDiv.childNodes.length > 1){ //Elements with gadgets
  		this.event_list.appendChild(tabEvents.tabDiv);  		
    }else{
    	tabEvents.tabDiv.getElementsByClassName("tabContent")[0].removeClassName("bckgrnd_folder");
    }
    
  	this.slot_list.appendChild(tabSlots.tabDiv);
    if (tabSlots.tabDiv.childNodes.length == 1){ //Elements withouth gadgets
	    tabSlots.tabDiv.getElementsByClassName("tabContent")[0].removeClassName("bckgrnd_folder");
    }
  	
  	tabEvents._toggle();
  	tabSlots._toggle();

  }
  
  WiringInterface.prototype._addIGadget = function (igadget, tabEvents, tabSlots) {
    // TODO mirar esto
  	var igadgetEvents = new EventIgadgetInterface(igadget, this, tabEvents);
  	var igadgetSlots = new SlotIgadgetInterface(igadget, this, tabSlots);
  	
	//if the igadget has events, add it
	if (igadgetEvents.igadgetDiv){
	    tabEvents.tabDiv.appendChild(igadgetEvents.igadgetDiv);
	    igadgetEvents._toggle();
	}
	//if the igadget has slots, add it
	if (igadgetSlots.igadgetDiv){
	    tabSlots.tabDiv.appendChild(igadgetSlots.igadgetDiv);
	    igadgetSlots._toggle();
	} 
    
  }

  WiringInterface.prototype.clearMessages = function () {
    this.msgsDiv.setStyle({display: null});
  }
   //expands or collapses all tabs & gadgets according to the expand parameter
   // Events 
  WiringInterface.prototype.toggleEventColumn = function (expand) {
  	var input = null;
  	var i=0;
  	for (i=0;i<this.inputs.length;i++){
  		input = this.inputs[i];
  		if(!(input.connectable instanceof wInOut) && !(input.connectable instanceof wTab)){ //we leave channels apart
  			if(expand){
  				input.parentInterface.massiveExpand();
  			}else{
  				input.parentInterface.massiveCollapse();
  			}
  		}
  	}
  	if(this.currentChannel){
  		this.highlightChannelInputs(this.currentChannel)
  	}
  }

  //Slots
  WiringInterface.prototype.toggleSlotColumn = function (expand) {
  	var output = null;
  	var i=0;
  	for (i=0;i<this.outputs.length;i++){
  		output = this.outputs[i];
  		if(!(output.connectable instanceof wInOut) && !(output.connectable instanceof wTab)){ //we leave channels apart
  			if(expand){
	  			output.parentInterface.massiveExpand();
  			}else{
  				output.parentInterface.massiveCollapse();  				
  			}
  		}
  	}
  	if(this.currentChannel){
  		this.highlightChannelOutputs(this.currentChannel)
  	}
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
    
    //button for unfolding all tabs
    //events
    if(this.inputs.length > 0){
		var eventInput = document.createElement("input");
		eventInput.setAttribute("type", "button");
	    eventInput.setAttribute("id", "toggleEvents");
	    eventInput.setAttribute("alt", gettext("fold/unfold"));
	    eventInput.addClassName('folding_img');
	    
	    Event.observe(eventInput, "click",
	                            function (e) {
									var expand = e.target.hasClassName('folding_img');
									e.target.toggleClassName('folding_img');
									e.target.blur();
									this.toggleEventColumn(expand);
	                            }.bind(this));
	    this.eventColumn.getElementsByClassName("title")[0].appendChild(eventInput);
    }
    
    //slots
    var slotInput = document.createElement("input");
    slotInput.setAttribute("type", "button");
    slotInput.setAttribute("id", "toggleSlots");
    slotInput.setAttribute("alt", gettext("fold/unfold"));
    slotInput.addClassName('folding_img');
    Event.observe(slotInput, "click",
                            function (e) {
                            	var expand = e.target.hasClassName('folding_img');
								e.target.toggleClassName('folding_img');
								e.target.blur();
								this.toggleSlotColumn(expand);
                            }.bind(this));
    this.slotColumn.getElementsByClassName("title")[0].appendChild(slotInput);
    
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
 //       fcElement.parentNode.parentNode.removeClassName("folded");
      }
    }
  }

  /*Uncheck channel*/
  
  WiringInterface.prototype.uncheckChannelInputs = function (channel){
  	var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; i++){
    	connectables[i].view.setConnectionStatus(false, null, null);
    }
  }
  
  WiringInterface.prototype.uncheckChannelOutputs = function (channel){
  	var connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; i++){
    	connectables[i].view.setConnectionStatus(false, null, null);
    }
  }

  WiringInterface.prototype.uncheckChannel = function (channel) {
    channel.uncheck();
    
   //fold all the tabs related to the channel
    var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; i++){
    	
  		if(connectables[i].view.parentInterface && connectables[i].view.parentInterface.isAnyUnfolded()){
			connectables[i].view.parentInterface.toggle(); 	//if the interface is unfolded fold it
    	}
    }  	 
    
    connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; i++){
   		if(connectables[i].view.parentInterface && connectables[i].view.parentInterface.isAnyUnfolded()){	//if the interface is unfolded unfold it
				connectables[i].view.parentInterface.toggle();
	
    	}
    }  	 
   
	this.uncheckChannelInputs(channel);
	this.uncheckChannelOutputs(channel);
 
  }

  /*Highlight channel*/  

  WiringInterface.prototype.highlightChannelInputs = function (channel){
    var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; i++){
    	connectables[i].view.setConnectionStatus(true, channel.inPosition, null);
   	}	
  }

  WiringInterface.prototype.highlightChannelOutputs = function (channel){
	var connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; i++){
    	connectables[i].view.setConnectionStatus(true, null, channel.outPosition);
    }	
  	
  }

  WiringInterface.prototype.highlightChannel = function (channel) {
    //unfold all the tabs related to the channel so that the arrows are displayed in the correct position
    var connectables = channel.getInputs();
    for (var i = 0; i < connectables.length; i++){
		if(connectables[i].view.parentInterface && connectables[i].view.parentInterface.isAnyFolded()){	//if the interface is folded unfold it
				connectables[i].view.parentInterface.toggle();
    	}
    }  	 
    connectables = channel.getOutputs();
    for (var i = 0; i < connectables.length; i++){
   		if(connectables[i].view.parentInterface && connectables[i].view.parentInterface.isAnyFolded()){	//if the interface is folded unfold it
				connectables[i].view.parentInterface.toggle();
		}
    }  	 

    channel.check(); //highlight the channel
    
    //mark the connections with the channel
	this.highlightChannelInputs(channel);
	this.highlightChannelOutputs(channel);
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
function ConnectionAnchor(connectable, anchorDiv, parentInterface) {
  this.connectable = connectable;
  this.connected = false;
  this.htmlElement = anchorDiv;
  this.parentInterface = parentInterface;
  this.jg_doc=null;
  this.canvas = null;
  this.arrow = null;
  
  this.connectable.setInterface(this);

	ConnectionAnchor.prototype.getConnectable = function() {
	  return this.connectable;
	}
	
	ConnectionAnchor.prototype.getParentInterface = function() {
	  return this.parentInterface;
	}
	
	ConnectionAnchor.prototype.assignInterface = function(interface) {
	  this.interface = interface;
	}
	
	ConnectionAnchor.prototype.getInterface = function() {
	  return this.interface;
	}
	
	ConnectionAnchor.prototype.drawArrow = function(inChannelPos, outChannelPos){
		if(this.jg_doc){
			this.jg_doc.clear();
			this.arrow.update();
			//decrement number of connections in the parent
			if(this.parentInterface && this.parentInterface.connections > 0)
				this.parentInterface.decreaseConnections();
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
	  	
	}
	
	ConnectionAnchor.prototype.drawPolyLine = function(x1,y1,x2,y2,left)
	{
		if(!this.canvas){
			this.canvas= document.createElement('div');
			this.canvas.addClassName('canvas');
			$('wiring').appendChild(this.canvas);
			this.jg_doc = new jsGraphics(this.canvas); // draw directly into document		
		}
		var xList= new Array(x1, (x1+x2)/2, (x1+x2)/2, x2 );
		var yList= new Array(y1, y1, y2, y2);
		this.jg_doc.setColor("#2D6F9C");
		this.jg_doc.setStroke(2);  
		this.jg_doc.drawPolyline(xList, yList);
		if(!this.arrow){
			this.arrow = document.createElement('div');
			this.arrow.addClassName('arrow');
			this.arrow.style.display= 'none';
			this.canvas.appendChild(this.arrow);
		}
		this.arrow.style.top = Math.round(y2 - this.arrow.getHeight()/2)+1 +"px";
		this.arrow.style.left = ((x2 - this.arrow.getWidth())+2) +"px";
		this.arrow.style.display = 'block';
	
		this.jg_doc.paint();
		//increment number of connections in the parent
		if(this.parentInterface){
			this.parentInterface.increaseConnections();
		}
	}
	
	ConnectionAnchor.prototype.clearPolyLine = function()
	{
		if(this.jg_doc){
			this.jg_doc.clear();
			$('wiring').removeChild(this.canvas);
			this.canvas = null;
			this.arrow = null;
			delete this.jg_doc;
			//decrement number of connections in the parent
			if(this.parentInterface && this.parentInterface.connections > 0)
				this.parentInterface.decreaseConnections();
		}
	}
	
	ConnectionAnchor.prototype.setConnectionStatus = function(newStatus, inChannelPos, outChannelPos) {
	  this.connected = newStatus;
	  
	  if (newStatus){
		this.htmlElement.className="chkItem";
		//draw the arrow
		this.drawArrow(inChannelPos, outChannelPos);
	  }else{
		this.htmlElement.className="unchkItem";
		//clear the arrow
		this.clearPolyLine();

	  }
	}
	
	ConnectionAnchor.prototype.isConnected = function() {
	  return this.connected;
	}
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
}

/* Tab interface*/
function SlotTabInterface (tab, wiringGUI) {
  	//CREATOR
  	//atributes
  	this.wiringGUI = wiringGUI;
  	this.folded = false;
  	this.connections = 0;
  	this.openedByUser = false;
  	
  	this.tabDiv = document.createElement("div");
    this.tabDiv.addClassName("tab");
    this.igadgetsOpenedByUser = 0;
   
    //Tab content
    var htmlElement = document.createElement("div");
    htmlElement.addClassName("tabContent");
    htmlElement.addClassName("bckgrnd_folder");   
    
    //folding event
    Event.observe(htmlElement, "click", function(e){
    												if(this.connections<=0){
    													this.toggleOpenedByUser();
    													this._toggle();
    													if(this.wiringGUI.currentChannel)
	    												   this.wiringGUI.highlightChannelOutputs(this.wiringGUI.currentChannel)}}.bind(this));
    												
   
	htmlElement.appendChild(document.createTextNode(tab.tabInfo.name));
    
    //create a ckeck item and an anchor for relating a tab to a channel output
	var chkItem = document.createElement("div");
	chkItem.addClassName("unchkItem");
	htmlElement.appendChild(chkItem);
	 
	var connectable = tab.connectable;
	var chkItemAnchor = new ConnectionAnchor(tab.connectable, chkItem, this);
	
	var context = {chkItemAnchor: chkItemAnchor, tabInterface:this};
	Event.observe(chkItem, "click",
	                         function (e) {if(!this.tabInterface.folded){
				                         	Event.stop(e);
	                         			   }else{
	                         				this.tabInterface.toggle();
    										if(this.tabInterface.wiringGUI.currentChannel)
	    									   this.tabInterface.wiringGUI.highlightChannelOutputs(this.tabInterface.wiringGUI.currentChannel);
	                         			   }
	        			                   this.tabInterface.wiringGUI._changeConnectionStatus(this.chkItemAnchor);
	                    			     }.bind(context), false);

    this.tabDiv.appendChild(htmlElement);
    this.wiringGUI.outputs.push(chkItemAnchor);
    
    SlotTabInterface.prototype.increaseConnections=function(){
		this.connections++;
	}
	
	SlotTabInterface.prototype.decreaseConnections=function(){
		this.connections--;
	}	
    
 	SlotTabInterface.prototype.toggleOpenedByUser=function(){
 		if(this.folded ||(!this.folded && this.openedByUser)){
  		//if(this.openedByUser || (!this.openedByUser && this.igadgetsOpenedByUser <= 0)){ //has the user touch the tab or igadgets?
			this.openedByUser = !this.openedByUser;
  		}
 	}
    
	//toggle ordered automatically, for instance, changing channels
  	SlotTabInterface.prototype.toggle = function () {
  		//if the user hasn't touch the tab, it can automatically toggle
  		if(this.folded || (!this.folded && !this.openedByUser && this.igadgetsOpenedByUser<=0)){
  			this._toggle();
  		}
  	}

	//forced toggle
	SlotTabInterface.prototype._toggle = function () {
		this.folded = !this.folded;
		var igadgets = this.tabDiv.getElementsByClassName("igadget");
		var i=0;
		for(i=0;i<igadgets.length;i++){
			igadgets[i].toggleClassName("folded");
		}
	}
	
	SlotTabInterface.prototype.isAnyFolded = function () {
		return this.folded;		
	}
	
	SlotTabInterface.prototype.isAnyUnfolded = function () {
		return !this.folded;		
	}	
}

 function EventTabInterface (tab, wiringGUI) {
  	//CREATOR
  	//atributes
  	this.wiringGUI = wiringGUI;
  	this.folded = false;
  	this.connections = 0;
  	this.openedByUser = false;		//is the tab open and has the user done it??
  	
  	this.tabDiv = document.createElement("div");
    this.tabDiv.addClassName("tab");
    this.igadgetsOpenedByUser = 0;
    
    //Tab content
    var htmlElement = document.createElement("div");
    htmlElement.addClassName("tabContent");
    htmlElement.addClassName("bckgrnd_folder"); 
	htmlElement.appendChild(document.createTextNode(tab.tabInfo.name));
    
    //folding event
    Event.observe(htmlElement, "click", function(e){ Event.stop(e);
    												if(this.connections<=0){
    													this.toggleOpenedByUser();
	    												this._toggle();
    													if(this.wiringGUI.currentChannel)
	    												   this.wiringGUI.highlightChannelInputs(this.wiringGUI.currentChannel)}}.bind(this));
    												

    this.tabDiv.appendChild(htmlElement);  	
	
	EventTabInterface.prototype.increaseConnections=function(){
		this.connections++;
	}
	
	EventTabInterface.prototype.decreaseConnections=function(){
		this.connections--;
	}  	 
  	
  	EventTabInterface.prototype.toggleOpenedByUser=function(){
 		if(this.folded ||(!this.folded && this.openedByUser)){
			this.openedByUser = !this.openedByUser;
  		}
 	}
 	
 	//toggle ordered automatically, for instance, changing channels
  	EventTabInterface.prototype.toggle = function () {
  		//if the user hasn't touch the tab, it can automatically toggle
  		if(this.folded || (!this.folded && !this.openedByUser && this.igadgetsOpenedByUser<=0)){
  			this._toggle();
  		}
  	}
  	
 	//forced toggle 
	EventTabInterface.prototype._toggle = function () {
		this.folded = !this.folded;
		var igadgets = this.tabDiv.getElementsByClassName("igadget");
		var i=0;
		for(i=0;i<igadgets.length;i++){
	 		igadgets[i].toggleClassName("folded");
	  	}
	}	
		
	EventTabInterface.prototype.isAnyFolded = function () {
		return this.folded;		
	}
	
	EventTabInterface.prototype.isAnyUnfolded = function () {
		return !this.folded;		
	}

}

/*
 iGadget interface*/

function SlotIgadgetInterface (igadget, wiringGUI, parentInterface) {
  	//CREATOR
  	//atributes
  	this.wiringGUI = wiringGUI;
  	this.folded = false;
  	this.friendCode = null;
  	this.igadgetDiv = null;
  	this.connections = 0;
  	this.parentInterface = parentInterface;
  	this.openedByUser = false;		//is the igadget open and has the user done it??
  	
  	var ulSlots = document.createElement("div");
    ulSlots.addClassName("igadgetContent");
  	
  	var connectables = this.wiringGUI.wiring.getIGadgetConnectables(igadget);

    // Slots
    for (var i = 0; i < connectables.length; i++) {
	    var connectable = connectables[i];
	    if(connectable instanceof wOut){
			var htmlElement = document.createElement("div");
			htmlElement.appendChild(document.createTextNode(connectable.getName()));
			
			var chkItem = document.createElement("div");
			chkItem.addClassName("unchkItem");
			htmlElement.appendChild(chkItem);
			
			var chkItemAnchor = new ConnectionAnchor(connectable, chkItem, this);
			//this.chkItemAnchor.setConnectionStatus(false, null, null);

			var context = {chkItemAnchor: chkItemAnchor, wiringGUI:this.wiringGUI};			
			Event.observe(chkItem, "click",
			                    function () {
			                      this.wiringGUI._changeConnectionStatus(this.chkItemAnchor);
			                    }.bind(context));
			
			// Harvest info about the friendCode of the connectable
			var friendCode = connectable.getFriendCode();
			if (friendCode != null) {
			    if (!this.wiringGUI.friend_codes[friendCode]) {
			      // Create the friend code entry in the list of friend codes
			      this.wiringGUI.friend_codes[friendCode] = {};
			      this.wiringGUI.friend_codes[friendCode].list = [];
			      this.wiringGUI.friend_codes[friendCode].color = this.wiringGUI.color_scheme[this.wiringGUI.friend_codes_counter++];
			    }
			
			    this.wiringGUI.friend_codes[friendCode].list.push(htmlElement);
			
			    var context = {friendCode: friendCode, wiringGUI:this.wiringGUI};
			
			    htmlElement.addEventListener("mouseover",
			                            function () {this.wiringGUI._highlight_friend_code(this.friendCode, true);}.bind(context),
			                            false);
			    htmlElement.addEventListener("mouseout",
			                            function () {this.wiringGUI._highlight_friend_code(this.friendCode, false);}.bind(context),
			                            false);	      
			}
			// Cancel bubbling of _toggle
			function cancelbubbling(e) {
				Event.stop(e);
			}
			
			htmlElement.addEventListener("click", cancelbubbling, false);
			      
			// Insert it on the correct list of connectables	
			ulSlots.appendChild(htmlElement);
			this.wiringGUI.outputs.push(chkItemAnchor);
	    }
    }
			      
	// Generic information about the iGadget
	var gadget = igadget.getGadget();
	var iGadgetName = igadget.name;
			
	// Slot column
	if (ulSlots.childNodes.length > 0) {
		this.igadgetDiv = document.createElement("div");
		this.igadgetDiv.addClassName("igadget");
		var igadgetName = document.createElement("div");
		igadgetName.addClassName("igadgetName");
		igadgetName.appendChild(document.createTextNode(iGadgetName));
			  
		//folding event
		Event.observe(igadgetName, "click", function(e){
							Event.stop(e);
							if(this.connections<=0){
								this.toggleOpenedByUser();
								this._toggle();
								if(this.wiringGUI.currentChannel)
								   this.wiringGUI.highlightChannelOutputs(this.wiringGUI.currentChannel)}}.bind(this));			  
				  
		this.igadgetDiv.appendChild(igadgetName);
		this.igadgetDiv.appendChild(ulSlots);
	}
	
	SlotIgadgetInterface.prototype.increaseConnections=function(){
		this.connections++;
		this.parentInterface.increaseConnections();
	}
	
	SlotIgadgetInterface.prototype.decreaseConnections=function(){
		this.connections--;
		this.parentInterface.decreaseConnections();
	}

 	SlotIgadgetInterface.prototype.toggleOpenedByUser=function(){
 		if(this.folded || (!this.folded && this.openedByUser)){
			this.openedByUser = !this.openedByUser;
			if(this.openedByUser)
				this.parentInterface.igadgetsOpenedByUser++;
			else
				this.parentInterface.igadgetsOpenedByUser--;
 		}
 	}
 	
	
	//toggle ordered automatically, for instance, changing channels
  	SlotIgadgetInterface.prototype.toggle = function () {
  		//if the user hasn't touch the igadget, it can automatically toggle
  		if(!this.openedByUser){
  			this._toggle();
  		}
  		if(this.folded != this.parentInterface.folded){
	  			this.parentInterface.toggle();
  		}
  	} 
 	//forced toggle 
	SlotIgadgetInterface.prototype._toggle = function () {
		this.folded = !this.folded;
		this.igadgetDiv.getElementsByClassName("igadgetContent")[0].toggleClassName("folded");
		this.igadgetDiv.getElementsByClassName("igadgetName")[0].toggleClassName("bckgrnd_folded");
	}
	
	SlotIgadgetInterface.prototype.isAnyFolded = function () {
		return this.folded || this.parentInterface.folded;
	}
	
	SlotIgadgetInterface.prototype.isAnyUnfolded = function () {
		return !this.folded || !this.parentInterface.folded;
	}
	
	//methods invoked when the user wants to expand/collapse all the slot tabs
	SlotIgadgetInterface.prototype.massiveExpand = function () {
		if(this.folded){//the igadget is folded
			this.toggleOpenedByUser();
			this._toggle();
			if(this.folded != this.parentInterface.folded){//if the parent is folded
	  			this.parentInterface.toggle();
			}
		}else if(!this.openedByUser){//the igadget is open because it is conected to an opened channel
			this.openedByUser = true;
			this.parentInterface.igadgetsOpenedByUser++;
			
		}
	}

	SlotIgadgetInterface.prototype.massiveCollapse = function () {
		if(!this.folded && this.openedByUser){//the igadget is folded
			this.toggleOpenedByUser();
			if(this.connections<=0){//collapse only if the gadget don't have any connections
				this._toggle();
			}
		}
		if(this.folded != this.parentInterface.folded){//if the parent isn't folded
			if(this.parentInterface.connections<=0){
				this.parentInterface.toggleOpenedByUser();
				this.parentInterface.toggle();
			}
		}
	}	
}


function EventIgadgetInterface (igadget, wiringGUI, parentInterface) {
  	//CREATOR
  	//atributes
  	this.wiringGUI = wiringGUI;
  	this.folded = false;
  	this.igadgetDiv = null;
  	this.connections = 0;
  	this.openedByUser = false;		//is the igadget open and has the user done it??
  	this.parentInterface = parentInterface;
  	
  	var ulEvents = document.createElement("div");
    ulEvents.addClassName("igadgetContent");
  	
  	var connectables = this.wiringGUI.wiring.getIGadgetConnectables(igadget);

    // Events
    for (var i = 0; i < connectables.length; i++) {
	    var connectable = connectables[i];
	    if(connectable instanceof wIn){
			var htmlElement = document.createElement("div");
			htmlElement.appendChild(document.createTextNode(connectable.getName()));
			
			var chkItem = document.createElement("div");
			chkItem.addClassName("unchkItem");
			htmlElement.appendChild(chkItem);
			
			var chkItemAnchor = new ConnectionAnchor(connectable, chkItem, this);
			//this.chkItemAnchor.setConnectionStatus(false, null, null);
			
			var context = {chkItemAnchor: chkItemAnchor, wiringGUI:this.wiringGUI};
			Event.observe(chkItem, "click",
			                    function () {
			                      this.wiringGUI._changeConnectionStatus(this.chkItemAnchor);
			                    }.bind(context));
			
			// Harvest info about the friendCode of the connectable
			var friendCode = connectable.getFriendCode();
			if (friendCode != null) {
			    if (!this.wiringGUI.friend_codes[friendCode]) {
			      // Create the friend code entry in the list of friend codes
			      this.wiringGUI.friend_codes[friendCode] = {};
			      this.wiringGUI.friend_codes[friendCode].list = [];
			      this.wiringGUI.friend_codes[friendCode].color = this.wiringGUI.color_scheme[this.wiringGUI.friend_codes_counter++];
			    }
			
			    this.wiringGUI.friend_codes[friendCode].list.push(htmlElement);
			
			    var context = {friendCode: friendCode, wiringGUI:this.wiringGUI};
			
			    htmlElement.addEventListener("mouseover",
			                            function () {this.wiringGUI._highlight_friend_code(this.friendCode, true);}.bind(context),
			                            false);
			    htmlElement.addEventListener("mouseout",
			                            function () {this.wiringGUI._highlight_friend_code(this.friendCode, false);}.bind(context),
			                            false);	      
			}
			// Cancel bubbling of _toggle
			function cancelbubbling(e) {
				Event.stop(e);
			}
			
			htmlElement.addEventListener("click", cancelbubbling, false);
			      
			// Insert it on the correct list of connectables
			ulEvents.appendChild(htmlElement);
			this.wiringGUI.inputs.push(chkItemAnchor);
	    }
    }	      
	// Generic information about the iGadget
	var gadget = igadget.getGadget();
	var iGadgetName = igadget.name;
	
	
	// Event column
	if (ulEvents.childNodes.length > 0) {
	  this.igadgetDiv = document.createElement("div");
	  this.igadgetDiv.addClassName("igadget");
	  var igadgetName = document.createElement("div");
	  igadgetName.addClassName("igadgetName");
	  igadgetName.appendChild(document.createTextNode(iGadgetName));
	  
	  //folding event
	  Event.observe(igadgetName, "click", function(e){Event.stop(e);
								if(this.connections<=0){
									this.toggleOpenedByUser();
									this._toggle();
									if(this.wiringGUI.currentChannel)
									   this.wiringGUI.highlightChannelInputs(this.wiringGUI.currentChannel)}}.bind(this));			  
		  
	  this.igadgetDiv.appendChild(igadgetName);
	  this.igadgetDiv.appendChild(ulEvents);
    }
    
 	EventIgadgetInterface.prototype.increaseConnections=function(){
		this.connections++;
		this.parentInterface.increaseConnections();
	}
	
	EventIgadgetInterface.prototype.decreaseConnections=function(){
		this.connections--;
		this.parentInterface.decreaseConnections();
	}

 	EventIgadgetInterface.prototype.toggleOpenedByUser=function(){
 		if(this.folded || (!this.folded && this.openedByUser)){
			this.openedByUser = !this.openedByUser;
			if(this.openedByUser)
				this.parentInterface.igadgetsOpenedByUser++;
			else
				this.parentInterface.igadgetsOpenedByUser--;
 		}
 	}
	
	//toggle ordered automatically, for instance, changing channels
  	EventIgadgetInterface.prototype.toggle = function () {
  		//if the user hasn't touch the igadget, it can automatically toggle
  		if(!this.openedByUser){
  			this._toggle();
  		}
 		if(this.folded != this.parentInterface.folded){
	  			this.parentInterface.toggle();
  		}
  	} 
 	//forced toggle 
	EventIgadgetInterface.prototype._toggle = function () {
		this.folded = !this.folded;
		this.igadgetDiv.getElementsByClassName("igadgetContent")[0].toggleClassName("folded");
		this.igadgetDiv.getElementsByClassName("igadgetName")[0].toggleClassName("bckgrnd_folded");
	}
	
	EventIgadgetInterface.prototype.isAnyFolded = function () {
		return this.folded || this.parentInterface.folded;
	}
	
	EventIgadgetInterface.prototype.isAnyUnfolded = function () {
		return !this.folded || !this.parentInterface.folded;
	}

	//methods invoked when the user wants to expand/collapse all the event tabs	
	EventIgadgetInterface.prototype.massiveExpand = function () {
		if(this.folded){//the igadget is folded
			this.toggleOpenedByUser();
			this._toggle();
			if(this.folded != this.parentInterface.folded){//if the parent is folded
	  			this.parentInterface.toggle();
			}
		}else if(!this.openedByUser){//the igadget is open because it is conected to an opened channel
			this.openedByUser = true;
			this.parentInterface.igadgetsOpenedByUser++;
			
		}
	}

	EventIgadgetInterface.prototype.massiveCollapse = function () {
		if(!this.folded && this.openedByUser){//the igadget is folded
			this.toggleOpenedByUser();
			if(this.connections<=0){//collapse only if the gadget don't have any connections
				this._toggle();
			}
		}
		if(this.folded != this.parentInterface.folded){//if the parent isn't folded
			if(this.parentInterface.connections<=0){
				this.parentInterface.toggleOpenedByUser();
				this.parentInterface.toggle();
			}
		}
	}
}