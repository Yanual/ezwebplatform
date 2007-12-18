//This class is the controller of the interface provided for managing the wiring module

function wiringInterface(){
	this.loaded = false;
	w = WiringFactory.getInstance();
	wiringInterface.prototype.friend_codes = {};
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
	$("channel_name").value = "Channel_"+ this.channels_counter;
}

wiringInterface.prototype.addChannelInterface = function (name){
    var idChannel = "channel_"+ name;
    var li = document.createElement("li");
	var inputDel = document.createElement("input");
	inputDel.setAttribute("type", "image");
	inputDel.setAttribute("onclick", "wiringInterface.prototype.deleteChannel('"+ name +"'); opManager.restaure(); WiringFactory.getInstance().serialize();");
    inputDel.setAttribute("src", "/ezweb/js/wiring/delete.png");
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
	labelItem.appendChild(textNode);
	li.appendChild(labelItem);
	li.setAttribute("id", idChannel);

    var ulVal = document.createElement("ul");
    var textNodeValue = document.createTextNode("Value: "+ w.viewValue(name));
    var liVal = document.createElement("li");
    liVal.appendChild(textNodeValue);
    ulVal.appendChild(liVal);
    li.appendChild(ulVal);

    $("channels_list").appendChild(li);
}

wiringInterface.prototype.addGadgetInterface = function (object){
    var ulEvents = document.createElement("ul");
    var ulSlots = document.createElement("ul");
    var connections = w.gadgetConnections(object.id);
	if (connections) {
		for (var i = 0; i < connections.length; i++) {
            var liItem = document.createElement("li");
            var chkItem = document.createElement("input");
            var idItem = "gadget_"+ object.id +"_"+ connections[i].name;
            chkItem.setAttribute("id", "chk_"+ idItem);
            chkItem.setAttribute("disabled", "disabled");
            chkItem.setAttribute("type", "checkbox");
            liItem.appendChild(chkItem);
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
				liItem.setAttribute("onclick", "javascript:{wiringInterface.prototype._changeChannel('chk_"+ idItem +"', '"+ object.id +"', '"+ connections[i].name +"', '"+ connections[i].aspect +"');}");
                liItem.setAttribute("onmouseover", "wiringInterface.prototype._highlight_friend_code('"+ connections[i].friend_code +"');");
                liItem.setAttribute("onmouseout", "wiringInterface.prototype._highlight_friend_code('"+ connections[i].friend_code +"');");

            }
			labelItem.appendChild(textNodeItem);
			liItem.appendChild(labelItem);
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
    li.appendChild(textNode);
    if (ulEvents.childNodes.length > 0) {
        li.appendChild(ulEvents);
        $("events_list").appendChild(li);
    }

    var li = document.createElement("li");
    var textNode = document.createTextNode(object.name+ " [" +object.id+ "]");
    li.id = "slots_list_gadget_"+ object.id;
    li.appendChild(textNode);
    if (ulSlots.childNodes.length > 0) {    
        li.appendChild(ulSlots);
        $("slots_list").appendChild(li);
    }
}

wiringInterface.prototype.renewInterface = function (w){
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
        this.channels_counter = channels.length + 1;
	    $("channel_name").value = "Channel_"+ this.channels_counter;
		this.loaded = true;
	}
}

wiringInterface.prototype.addChannel = function () {
	var result = null;
	var name = $("channel_name").value;
	name = name.strip();
	if (!name.empty()) {
		if (!(result = w.createChannel(name))){	
			this.addChannelInterface(name);
            this.channels_counter += 1;
	        $("channel_name").value = "Channel_"+ this.channels_counter;
		}
	}
}

wiringInterface.prototype.deleteChannel = function (object){
	var result = null;
	if (!(result = w.removeChannel(object))){
        var idChannel = "channel_"+ object;
        $(idChannel).remove();
        wiringInterface.prototype._enable_all(false);
	}
}

wiringInterface.prototype._changeChannel = function(chk_id, gadget_id, event_name, aspect) {
    channel_name = this.last_checked;
    if ($(chk_id).checked) {
        if (aspect == "EVEN") {
            w.addChannelInput(gadget_id, event_name, channel_name);
        } else {
            w.addChannelOutput(gadget_id, event_name, channel_name);
        }
    } else {
        if (aspect == "EVEN") {
            w.removeChannelInput(gadget_id, event_name, channel_name);
        } else {
            w.removeChannelOutput(gadget_id, event_name, channel_name);
        }

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
        for (var i = 0; i < fcList.length; i++) {
            tmp_color = $(fcList[i]).style.backgroundColor;
            $(fcList[i]).style.backgroundColor = fcColor;
            this.friend_codes[friend_code].color = tmp_color;
        }
    }
}


wiringInterface.prototype._highlight_channel = function (chk_id, channel_name) {
    wiringInterface.prototype._enable_all();
    if (this.last_checked) {
        $("channel_"+ this.last_checked).style.backgroundColor = null;
        channels = w.connections(this.last_checked);
        if (channels) {
            channel_list = channels["input"].concat(channels["output"]);
            for(var i = 0; i < channel_list.length; i++) {
                var chk_gadget_id = "chk_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name;
                $(chk_gadget_id).checked = false;
                $("gadget_"+ channel_list[i].id +"_"+ channel_list[i].name).style.backgroundColor = null;
                $("lbl_"+ chk_gadget_id).style.fontWeight = "normal";
            }
        }
    }
    $("channel_"+ channel_name).style.backgroundColor = "#FFFFE0";
    channels = w.connections(channel_name);
    if (channels) {
        channel_list = channels["input"].concat(channels["output"]);
        for(var i = 0; i < channel_list.length; i++) {
            var chk_gadget_id = "chk_gadget_"+ channel_list[i].id +"_"+ channel_list[i].name;
            $(chk_gadget_id).checked = $(chk_id).checked;
            $("gadget_"+ channel_list[i].id +"_"+ channel_list[i].name).style.backgroundColor = "#FFFFE0";
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
            $(idItem).style.backgroundColor = null;
        }
	}
    this.disabled_all = false;
}
