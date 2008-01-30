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



var WiringInterfaceFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function WiringInterface() {

	    // ***********************************
	    //  PRIVATE METHODS AND ATTRIBUTES
	    // ***********************************

	    this.wiring = WiringFactory.getInstance();
	    this.opmanager = OpManagerFactory.getInstance();
	    this.friend_codes = {};
	    this.highlight_color = "#FFFFE0";
	    this.friend_codes_counter = 0;
	    this.channels_counter = 1;
	    this.last_checked = null;
	    this.disabled_all = true;
	    this.modified = false;


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


	WiringInterface.prototype.unloaded = function (){
	    this.disabled_all = true;

	    $("events_list").innerHTML = "";
	    $("slots_list").innerHTML = "";
	    $("channels_list").innerHTML = "";
	    $("channel_name").value = "Wire_"+ this.channels_counter;
	}

	WiringInterface.prototype.saveWiring = function (){
	    // Only it's needed to save wiring structure when it has been modified!
	    if (this.modified == true) {
		this.opmanager.restaure();
		this.wiring.serialize();
	
		this.modified=false;
	    }
	}

	WiringInterface.prototype.addChannelInterface = function (name){
	    var idChannel = "channel_"+ name;
	    var li = document.createElement("li");
	    
	    var inputDel = document.createElement("input");
	    inputDel.setAttribute("type", "image");
	    inputDel.setAttribute("onclick", "javascript:wiringInterface.deleteChannel('"+ name +"');");
	    inputDel.setAttribute("src", "/ezweb/images/dialog-cancel.png");
	    
	    li.appendChild(inputDel);
	    
	    var chkChannel = document.createElement("input");
	    chkChannel.setAttribute("type", "radio");
	    chkChannel.setAttribute("name", "channels_options");
	    chkChannel.setAttribute("id", "chk_"+ idChannel);
	    chkChannel.setAttribute("onclick", "javascript:{wiringInterface._highlight_channel('chk_"+ idChannel +"', '"+ name +"');}");
	    
	    var textNode = document.createTextNode(name);
	    chkChannel.appendChild(textNode);
	    li.appendChild(chkChannel);

	    var labelItem = document.createElement("label");
	    labelItem.setAttribute("for", "chk_"+ idChannel);
	    labelItem.setAttribute("style", "cursor: pointer; cursor: hand;");
	    labelItem.appendChild(textNode);
	    li.appendChild(labelItem);
	    li.setAttribute("id", idChannel);
	    
	    var ulVal = document.createElement("ul");
	    var textNodeValue = document.createTextNode(this.wiring.viewValue(name));
	    var liVal = document.createElement("li");
	    liVal.appendChild(textNodeValue);
	    ulVal.appendChild(liVal);
	    li.appendChild(ulVal);
	    
	    $("channels_list").appendChild(li);
	    
	    this._highlight_channel("chk_"+ idChannel, name);
	}

	WiringInterface.prototype.addGadgetInterface = function (object){
	    var ulEvents = document.createElement("ul");
	    ulEvents.setAttribute("id", "events_ul_gadget_"+ object.id);
	    
	    var ulSlots = document.createElement("ul");
	    ulSlots.setAttribute("id", "slots_ul_gadget_"+ object.id);
	    
	    var connections = this.wiring.gadgetConnections(object.id);
	    
	    if (connections) {
		for (var i = 0; i < connections.length; i++) {
		    var liItem = document.createElement("li");
		    var divItem = document.createElement("div");
		    var chkItem = document.createElement("input");
		    var idItem = "gadget_"+ object.id +"_"+ connections[i].name;
		    
		    divItem.setAttribute("id", "div_"+ idItem);
		    
		    chkItem.setAttribute("id", "chk_"+ idItem);
		    chkItem.setAttribute("disabled", "disabled");
		    chkItem.setAttribute("type", "checkbox");
		    chkItem.setAttribute("onClick", "javascript:{wiringInterface.changeConnectionStatus(this, " + object.id + ", '"  + connections[i].name + "', '" + connections[i].aspect + "')}");
		    
		    divItem.appendChild(chkItem);
		    
		    var labelItem = document.createElement("label");
		    labelItem.setAttribute("for", "chk_"+ idItem);
		    labelItem.setAttribute("id", "lbl_chk_"+ idItem);
		    
		    var textNodeItem = document.createTextNode(connections[i].name);
		    if ((connections[i].friend_code != "undefined") || (connections[i].friend_code != undefined)) {
			if (!this.friend_codes[connections[i].friend_code]) {
			    this.friend_codes[connections[i].friend_code] = {};
			    this.friend_codes[connections[i].friend_code].list = [];
			    this.friend_codes[connections[i].friend_code].color = 
				this.color_scheme[this.friend_codes_counter++];
			}
                
			this.friend_codes[connections[i].friend_code].list.push(idItem);

			liItem.setAttribute("onclick", "javascript:{wiringInterface._changeChannel('"+ idItem +"', '"+ object.id +"', '"+ connections[i].name +"', '"+ connections[i].aspect +"', '"+ connections[i].friend_code +"');}");
			liItem.setAttribute("onmouseover", "javascript:wiringInterface._highlight_friend_code('"+ connections[i].friend_code +"', true);");
			liItem.setAttribute("onmouseout", "javascript:wiringInterface._highlight_friend_code('"+ connections[i].friend_code +"', false);");
			
		    }    
		    
		    labelItem.appendChild(textNodeItem);
		    divItem.appendChild(labelItem);
		    liItem.appendChild(divItem);
		    liItem.setAttribute("id", idItem);

		    if (connections[i].aspect == "EVEN") {
			ulEvents.appendChild(liItem);
		    } else if (connections[i].aspect == "SLOT") {
			ulSlots.appendChild(liItem);
		    }
		}
	    }

	    var li = document.createElement("li");
	    li.id = "events_list_gadget_"+ object.id;

	    var textNode = document.createTextNode(object.name+ " [" +object.id+ "]");
	    li.setAttribute("onclick", "javascript:{wiringInterface._toggle('EVEN', '"+ object.id +"');}");
	    li.appendChild(textNode);

	    if (ulEvents.childNodes.length > 0) {
		li.appendChild(ulEvents);
		$("events_list").appendChild(li);
	    }

	    var li = document.createElement("li");
	    li.setAttribute("onclick", "javascript:{wiringInterface._toggle('SLOT', '"+ object.id +"');}");

	    var textNode = document.createTextNode(object.name+ " [" +object.id+ "]");
	    li.id = "slots_list_gadget_"+ object.id;
	    li.appendChild(textNode);
    
	    if (ulSlots.childNodes.length > 0) {    
		li.appendChild(ulSlots);
		$("slots_list").appendChild(li);
	    }
	}

	WiringInterface.prototype.addChannelsAsGadgetInterface = function (channels) {
	    for (channel in channels) {
		alert(channel);
	    }

	}

	WiringInterface.prototype.renewInterface = function () {
	    this.unloaded();
	    this.wiring.edition();
	    
	    var iGadgets = this.wiring.getGadgetsId();
	    var channels = this.wiring.getInOutsId();
	    
	    for (var i = 0; i<iGadgets.length; i++){
		this.addGadgetInterface(iGadgets[i]);
	    }
	    
	    for (var j = 0; j<channels.length; j++){
		this.addChannelInterface(channels[j])
	    }
	    
	    //this.addChannelsAsGadgetInterface(channels)
	    this.channels_counter = channels.length + 1;
	    
	    $("channel_name").value = "Wire_"+ this.channels_counter;
	    
	    while(channels.include($("channel_name").value)) {
		this.channels_counter++;
		$("channel_name").value = "Wire_"+ this.channels_counter;
	    }    
	}
	
	WiringInterface.prototype.addChannel = function () {
	    var result = null;
	    var name = $("channel_name").value;
	    
	    while(this.wiring.getInOutsId().include($("channel_name").value)) {
		this.channels_counter++;
		$("channel_name").value = "Wire_"+ this.channels_counter;
	    }
	    
	    name = name.strip();
	    
	    if (!name.empty()) {
		if (!(result = this.wiring.createChannel(name))){	
		    this.addChannelInterface(name);
		    this.channels_counter++;
		    $("channel_name").value = "Wire_"+ this.channels_counter;
		    
		    this.modified=true;
		}
	    }
	}
	
	WiringInterface.prototype.changeConnectionStatus = function (checkbox_element, iGadgetId, connectableName, typeOfConnectable){
	    var channelName = this.last_checked;
	    
	    if (checkbox_element.checked == true) {
		this.addConnection(channelName, iGadgetId, connectableName, typeOfConnectable);
	    }
	    
	    // Delete connection
	    this.deleteConnection(channelName, iGadgetId, connectableName, typeOfConnectable);
	}
	

	WiringInterface.prototype.addConnection = function (channelName, iGadgetId, connectableName, typeOfConnectable){
	    this.modified=true;
	    
	    if (typeOfConnectable == 'EVEN') {
		this.wiring.addChannelInput(iGadgetId, connectableName, channelName);
		return;
	    }
	    
	    if (typeOfConnectable == 'SLOT') {
		this.wiring.addChannelOutput(iGadgetId, connectableName, channelName);
		return;
	    }
	}

	WiringInterface.prototype.deleteConnection = function (channelName, iGadgetId, connectableName, typeOfConnectable){
	    this.modified=true;
	    
	    if (typeOfConnectable == 'EVEN') {
		this.wiring.removeChannelInput(iGadgetId, connectableName, channelName);
		return;
	    }
	    
	    if (typeOfConnectable == 'SLOT') {
		this.wiring.removeChannelOutput(iGadgetId, connectableName, channelName);
		return;
	    }
	}
	
	WiringInterface.prototype.deleteChannel = function (object){
	    var result = null;
    
	    if (!(result = this.wiring.removeChannel(object))){
		var idChannel = "channel_"+ object;
		
		$(idChannel).remove();
		this._enable_all(false);
		this.channels_counter--;
	    }
	    
	    this.modified=true;
	}
	
	WiringInterface.prototype._changeChannel = function(item_id, gadget_id, event_name, aspect, friend_code) {
	    channel_name = this.last_checked;
	    chk_id = "chk_"+ item_id;
	    
	    if ($(chk_id).getAttribute("disabled") != "disabled") {
		if ($(chk_id).checked) {
		    $("div_"+ item_id).style.backgroundColor = this.highlight_color;
		    $("lbl_"+ chk_id).style.fontWeight = "bold";
		    if (aspect == "EVEN") {
			this.wiring.addChannelInput(gadget_id, event_name, channel_name);
		    } else {
			this.wiring.addChannelOutput(gadget_id, event_name, channel_name);
		    }
		} else {
		    $("div_"+ item_id).style.backgroundColor = "";
		    $("lbl_"+ chk_id).style.fontWeight = "normal";
		    if (aspect == "EVEN") {
			this.wiring.removeChannelInput(gadget_id, event_name, channel_name);
		    } else {
			this.wiring.removeChannelOutput(gadget_id, event_name, channel_name);
		    }
		    
		}
		
	    }
	}
	
	WiringInterface.prototype._toggle = function (aspect, id) {
	    if (aspect == "EVEN") {
		list = $("events_list_gadget_"+ id);
	    } else {
		list = $("slots_list_gadget_"+ id);
	    }
	    if (list.className == "off") {
		list.className = "on";
	    } else {
		list.className = "off";
	    }
	}

	WiringInterface.prototype._highlight = function (chk_id, friend_code) {
	    if (this.friend_codes[friend_code]) {
		var fcList = this.friend_codes[friend_code].list;
		var fcColor = this.friend_codes[friend_code].color;
		
		if ($(chk_id).checked) {
		    for (var i = 0; i < fcList.length; i++) {
			$(fcList[i]).style.backgroundColor = fcColor;
		    }
		} else {
		    var allUnchecked = true;
		    for (var i = 0; i < fcList.length; i++) {
			allUnchecked &= !$("chk_"+ fcList[i]).checked;
		    }
		    if (allUnchecked) {
			for (var i = 0; i < fcList.length; i++) {
			    $(fcList[i]).style.backgroundColor = null;
                }
		    }
		}
	    }
	}

	WiringInterface.prototype._highlight_friend_code = function (friend_code, highlight) {
	    if (this.friend_codes[friend_code]) {
		var fcList = this.friend_codes[friend_code].list;
		var fcColor = this.friend_codes[friend_code].color;
		var fcBgColor = "";
		
		for (var i = 0; i < fcList.length; i++) {
		    if (highlight && $(fcList[i])) {
			$(fcList[i]).style.backgroundColor = fcColor;
			$(fcList[i]).parentNode.parentNode.className = "on";
		    } else {
			$(fcList[i]).style.backgroundColor = fcBgColor;            
			$(fcList[i]).parentNode.parentNode.className = "on";
		    }
		}
	    }
	}
	
	WiringInterface.prototype._highlight_channel = function (chk_id, channel_name) {
	    this._enable_all();
	    
	    if (this.last_checked && $("channel_"+ this.last_checked)) {
		$("channel_"+ this.last_checked).style.backgroundColor = "";
		channels = this.wiring.connections(this.last_checked);
		if (channels) {
		    channel_list = channels["input"].concat(channels["output"]);
		    for(var i = 0; i < channel_list.length; i++) {
			var chk_gadget_id = "chk_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name;
			$(chk_gadget_id).checked = false;
			$("div_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name).style.backgroundColor = "";
			$("lbl_"+ chk_gadget_id).style.fontWeight = "normal";
		    }
		}
	    }
	    
	    $("channel_"+ channel_name).style.backgroundColor = this.highlight_color;
	    channels = this.wiring.connections(channel_name);
	    
	    if (channels) {
		channel_list = channels["input"].concat(channels["output"]);
		for(var i = 0; i < channel_list.length; i++) {
		    var chk_gadget_id = "chk_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name;
		    $(chk_gadget_id).checked = true;
		    $("div_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name).style.backgroundColor = this.highlight_color;
		    $("lbl_"+ chk_gadget_id).style.fontWeight = "bold";
		}
	    }

	    this.last_checked = channel_name;
	}

	WiringInterface.prototype._enable_all = function(enabled) {
	    var iGadgets = this.wiring.getGadgetsId();
	    for (var i = 0; i<iGadgets.length; i++){
		var connections = this.wiring.gadgetConnections(iGadgets[i].id);
		
		for (var j = 0; j < connections.length; j++) {
		    var idItem = "gadget_"+ iGadgets[i].id +"_"+ connections[j].name; 
		    
		    if ((enabled == null) || (enabled)) {
			$("chk_"+ idItem).removeAttribute("disabled");
		    } else {
			$("chk_"+ idItem).setAttribute("disabled", "disabled");
		    }
		    
		    $(idItem).style.backgroundColor = "";
		    $("div_"+ idItem).style.backgroundColor = "";
		    $("chk_"+ idItem).checked = false;
		    $("lbl_chk_"+ idItem).style.fontWeight = "normal";
		}
	    }
	    
	    if (this.last_checked && $("channel_"+ this.last_checked)) {
		$("channel_"+ this.last_checked).style.backgroundColor = "";
	    }
	    
	    this.disabled_all = false;
	}
    
	WiringInterface.prototype.currentTab = function(tab) {
	    var current_tab = {"tab": tab}
	}

	}
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
	    this.getInstance = function() {
		if (instance == null) {
		    instance = new WiringInterface();
		}
		return instance;
	    }
	}
	
}();