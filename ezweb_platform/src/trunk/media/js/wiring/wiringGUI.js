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


//This class is the controller of the interface provided for managing the wiring module

function wiringInterface(){
	this.loaded = false;
	w = WiringFactory.getInstance();
	wiringInterface.prototype.friend_codes = {};
	wiringInterface.prototype.highlight_color = "#FFFFE0";
	this.friend_codes_counter = 0;
    this.channels_counter = 1;
    this.last_checked = null;
    this.disabled_all = true;
}

wiringInterface.prototype.unloaded = function (){
    this.disabled_all = true;
	this.loaded = false;

	$("events_list").innerHTML = "";
	$("slots_list").innerHTML = "";
	$("channels_list").innerHTML = "";
	$("channel_name").value = "Wire_"+ this.channels_counter;
}

wiringInterface.prototype.addChannelInterface = function (name){
    var idChannel = "channel_"+ name;
    var li = document.createElement("li");
	var inputDel = document.createElement("input");
	inputDel.setAttribute("type", "image");
	inputDel.setAttribute("onclick", "wiringInterface.prototype.deleteChannel('"+ name +"'); opManager.restaure(); WiringFactory.getInstance().serialize();");
    inputDel.setAttribute("src", "/ezweb/images/dialog-cancel.png");
//    inputDel.setAttribute("style", "padding-right: 2px;");
    li.appendChild(inputDel);
    var chkChannel = document.createElement("input");
    chkChannel.setAttribute("type", "radio");
    chkChannel.setAttribute("name", "channels_options");
//    chkChannel.setAttribute("style", "display: none;");
    chkChannel.setAttribute("id", "chk_"+ idChannel);
    chkChannel.setAttribute("onclick", "javascript:{wiringInterface.prototype._highlight_channel('chk_"+ idChannel +"', '"+ name +"'); opManager.restaure(); WiringFactory.getInstance().serialize();}");
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
//    var textNodeValue = document.createTextNode("Value: "+ w.viewValue(name));
    var textNodeValue = document.createTextNode(w.viewValue(name));
    var liVal = document.createElement("li");
    liVal.appendChild(textNodeValue);
    ulVal.appendChild(liVal);
    li.appendChild(ulVal);
	
    $("channels_list").appendChild(li);
    
    wiringInterface.prototype._highlight_channel("chk_"+ idChannel, name);
}

wiringInterface.prototype.addGadgetInterface = function (object){
    var ulEvents = document.createElement("ul");
    ulEvents.setAttribute("id", "events_ul_gadget_"+ object.id);
    var ulSlots = document.createElement("ul");
    ulSlots.setAttribute("id", "slots_ul_gadget_"+ object.id);
    var connections = w.gadgetConnections(object.id);
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

            divItem.appendChild(chkItem);
			var labelItem = document.createElement("label");
			labelItem.setAttribute("for", "chk_"+ idItem);
			labelItem.setAttribute("id", "lbl_chk_"+ idItem);
			var textNodeItem = document.createTextNode(connections[i].name);
			if ((connections[i].friend_code != "undefined") || (connections[i].friend_code != undefined)) {
			    if (!wiringInterface.prototype.friend_codes[connections[i].friend_code]) {
			        wiringInterface.prototype.friend_codes[connections[i].friend_code] = {};
			        wiringInterface.prototype.friend_codes[connections[i].friend_code].list = [];
                    wiringInterface.prototype.friend_codes[connections[i].friend_code].color = wiringInterface.prototype.color_scheme[this.friend_codes_counter++];
			    }
                wiringInterface.prototype.friend_codes[connections[i].friend_code].list.push(idItem);
				liItem.setAttribute("onclick", "javascript:{wiringInterface.prototype._changeChannel('"+ idItem +"', '"+ object.id +"', '"+ connections[i].name +"', '"+ connections[i].aspect +"', '"+ connections[i].friend_code +"');}");
                liItem.setAttribute("onmouseover", "wiringInterface.prototype._highlight_friend_code('"+ connections[i].friend_code +"', true);");
                liItem.setAttribute("onmouseout", "wiringInterface.prototype._highlight_friend_code('"+ connections[i].friend_code +"', false);");

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
    li.setAttribute("onclick", "javascript:{wiringInterface.prototype._toggle('EVEN', '"+ object.id +"');}");
    li.appendChild(textNode);
    if (ulEvents.childNodes.length > 0) {
        li.appendChild(ulEvents);
        $("events_list").appendChild(li);
    }

    var li = document.createElement("li");
    li.setAttribute("onclick", "javascript:{wiringInterface.prototype._toggle('SLOT', '"+ object.id +"');}");
    var textNode = document.createTextNode(object.name+ " [" +object.id+ "]");
    li.id = "slots_list_gadget_"+ object.id;
    li.appendChild(textNode);
    if (ulSlots.childNodes.length > 0) {    
        li.appendChild(ulSlots);
        $("slots_list").appendChild(li);
    }
}

wiringInterface.prototype.addChannelsAsGadgetInterface = function (channels) {
//    for (var j = 0; j<channels.length; j++) {
//    
//    }
}

wiringInterface.prototype.renewInterface = function (wi) {
    w = wi;
	w.edition();
	if (!this.loaded){
		var iGadgets = w.getGadgetsId();
		var channels = w.getInOutsId();
		for (var i = 0; i<iGadgets.length; i++){
			this.addGadgetInterface(iGadgets[i]);
		}
		for (var j = 0; j<channels.length; j++){
			this.addChannelInterface(channels[j])
		}
        this.addChannelsAsGadgetInterface(channels)
        this.channels_counter = channels.length + 1;
	    $("channel_name").value = "Wire_"+ this.channels_counter;
	    while(channels.include($("channel_name").value)) {
            this.channels_counter++;
	        $("channel_name").value = "Wire_"+ this.channels_counter;
        }
		this.loaded = true;
	}
}

wiringInterface.prototype.addChannel = function () {
	var result = null;
	var name = $("channel_name").value;
    while(w.getInOutsId().include($("channel_name").value)) {
        this.channels_counter++;
        $("channel_name").value = "Wire_"+ this.channels_counter;
    }
	name = name.strip();
	if (!name.empty()) {
		if (!(result = w.createChannel(name))){	
			this.addChannelInterface(name);
            this.channels_counter++;
	        $("channel_name").value = "Wire_"+ this.channels_counter;
		}
	}
}

wiringInterface.prototype.deleteChannel = function (object){
	var result = null;
	if (!(result = w.removeChannel(object))){
        var idChannel = "channel_"+ object;
        $(idChannel).remove();
        wiringInterface.prototype._enable_all(false);
        this.channels_counter--;
	}
}

wiringInterface.prototype._changeChannel = function(item_id, gadget_id, event_name, aspect, friend_code) {
    channel_name = this.last_checked;
    chk_id = "chk_"+ item_id;
    if ($(chk_id).getAttribute("disabled") != "disabled") {
        if ($(chk_id).checked) {
            $("div_"+ item_id).style.backgroundColor = wiringInterface.prototype.highlight_color;
            $("lbl_"+ chk_id).style.fontWeight = "bold";
            if (aspect == "EVEN") {
                w.addChannelInput(gadget_id, event_name, channel_name);
            } else {
                w.addChannelOutput(gadget_id, event_name, channel_name);
            }
        } else {
            $("div_"+ item_id).style.backgroundColor = "";
            $("lbl_"+ chk_id).style.fontWeight = "normal";
            if (aspect == "EVEN") {
                w.removeChannelInput(gadget_id, event_name, channel_name);
            } else {
                w.removeChannelOutput(gadget_id, event_name, channel_name);
            }

        }
    }
}

wiringInterface.prototype._toggle = function (aspect, id) {
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

wiringInterface.prototype._highlight = function (chk_id, friend_code) {
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

wiringInterface.prototype._highlight_friend_code = function (friend_code, highlight) {
    if (this.friend_codes[friend_code]) {
        var fcList = this.friend_codes[friend_code].list;
        var fcColor = this.friend_codes[friend_code].color;
        var fcBgColor = "";
        for (var i = 0; i < fcList.length; i++) {
            if (highlight) {
                $(fcList[i]).style.backgroundColor = fcColor;
                $(fcList[i]).parentNode.parentNode.className = "on";
            } else {
                $(fcList[i]).style.backgroundColor = fcBgColor;            
                $(fcList[i]).parentNode.parentNode.className = "on";
            }
        }
    }
}

wiringInterface.prototype._highlight_channel = function (chk_id, channel_name) {
    wiringInterface.prototype._enable_all();
    if (this.last_checked && $("channel_"+ this.last_checked)) {
        $("channel_"+ this.last_checked).style.backgroundColor = "";
        channels = w.connections(this.last_checked);
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
    $("channel_"+ channel_name).style.backgroundColor = wiringInterface.prototype.highlight_color;
    channels = w.connections(channel_name);
    if (channels) {
        channel_list = channels["input"].concat(channels["output"]);
        for(var i = 0; i < channel_list.length; i++) {
            var chk_gadget_id = "chk_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name;
            $(chk_gadget_id).checked = true;
            $("div_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name).style.backgroundColor = wiringInterface.prototype.highlight_color;
            $("lbl_"+ chk_gadget_id).style.fontWeight = "bold";
        }
    }
    this.last_checked = channel_name;
}

wiringInterface.prototype._enable_all = function(enabled) {
    var iGadgets = w.getGadgetsId();
	for (var i = 0; i<iGadgets.length; i++){
        var connections = w.gadgetConnections(iGadgets[i].id);
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

wiringInterface.prototype.currentTab = function(tab) {
    var current_tab = {"tab": tab}
    // alert(Object.toJSON(current_tab));
}
