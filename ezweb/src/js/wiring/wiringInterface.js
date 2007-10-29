//This class is the controller of the interface provided for managing the wiring module

function wiringInterface(){
	null;
}

wiringInterface.prototype.addChannelInterface = function(name, selector, itemize){
	var element = document.createElement("option");
	element.setAttribute("class", name)
	element.setAttribute("selected", true)
	var text = document.createTextNode(name);
	element.appendChild(text);
	selector.appendChild(element);
	var element = document.createElement("option");
	var text = document.createTextNode(name);
	element.setAttribute("class", name)
	element.appendChild(text);
	itemize.appendChild(element);
}

wiringInterface.prototype.addGadgetInterface = function (object,selector){
	var element = document.createElement("option");
	element.setAttribute("id", object)
	var text = document.createTextNode(object);
	element.appendChild(text);
	selector.appendChild(element);
}

wiringInterface.prototype.renewInterface = function (w,selector,sGadgets,itemize){
	w.edition();
	var iGadgets = w.getGadgetsId();
	var channels = w.getInOutId();
	for (var i = 0; i<iGadgets.length; i++){
		this.addGadgetInterface(iGadgets[i],sGadgets);
	}
	for (var j = 0; j<channels.length; j++){
		this.addChannelInterface(channels[j],selector,itemize)
	}
	selector.value = ""
}

wiringInterface.prototype.anadirCanal = function (w,selector,itemize,slots,events){
	var result = null;
	var name = prompt("Insert Channel Name:","Channel Name...");
	if (name != null){
		if (!(result = w.createChannel(name))){	
			this.addChannelInterface(name,selector,itemize);
			this.renewChannel(w,name,slots,events)
		}
	}
}

wiringInterface.prototype.borrarCanal = function (w,object,selector,itemize,slots,events){
	var result = null;
	if (!(result = w.removeChannel(object))){
		//the first id is from the channel list	
		var hijo = $$('option.' + object);
		selector.removeChild(hijo[0]);
		// the new identifier is from the item list
		itemize.removeChild(hijo[1]);
		this.renewChannel(w,"",slots,events)
	}
}

wiringInterface.prototype.renewChannel = function (w,channel,slots,events){
	slots.innerHTML = "";
	events.innerHTML = "";
	if (channel != ""){
		var connections = w.connections(channel);
		var inputs = connections["input"];
		var outputs = connections["output"];
		$("valor").value = w.viewValue(channel);
		for (var i = 0; i < inputs.length; i++){
			this.addChannelLine (w,events, "w.removeChannelInput", inputs[i].id, inputs[i].name)
		}
		for (var j = 0; j < outputs.length; j++){
			this.addChannelLine (w, slots, "w.removeChannelOutput", outputs[j].id, outputs[j].name)
		}
	}
}

wiringInterface.prototype.renewItem = function (w,object,slots,events){
	slots.innerHTML = "";
	events.innerHTML = "";
	if (object != ""){
		var connections = w.gadgetConnections(object);
		if (connections){
			for (var i = 0; i < connections.length; i++){
				if (connections[i].aspect == "SLOT"){
					this.addLine(w, slots,  "w.addChannelOutput", object, connections[i].name);
				}
				else{
					this.addLine(w, events,  "w.addChannelInput", object, connections[i].name);
				}
			}
		}
		else{
			this.addLine(w, events,  "w.addChannelInput", "null", object);
			this.addLine(w, slots,  "w.addChannelOutput", "null", object);
		}
	}
}

wiringInterface.prototype.addLine = function (w, table, operation, gadget, name){	
	// This function is used to actualize the  tables of connections of any channel
	var line = document.createElement("tr");
	var col1 = document.createElement("td");
	var col2 = document.createElement("td");
	var button = document.createElement("input");
	var text;
	if (gadget == "null" || gadget == null){
		text = document.createTextNode(name);
		button.setAttribute("onClick", operation + "('" + name + "', $F('selectCanal'));wI.renewChannel(w,$F('selectCanal'),$('slotsConnection'),$('eventsConnection'))");
	}
	else{
		text = document.createTextNode(gadget + "::" + name);
		button.setAttribute("onClick", operation + "('" + gadget+ "','" +name+"', $F('selectCanal'));wI.renewChannel(w,$F('selectCanal'),$('slotsConnection'),$('eventsConnection'))");
	}
	button.setAttribute("type", "image");
	button.setAttribute("src", "tick.png");
	button.setAttribute("title", "add connection");
	col1.appendChild(button);
	col2.appendChild(text);
	line.setAttribute("class", gadget)
	line.setAttribute("id", name)
	line.appendChild(col1);
	line.appendChild(col2);
	table.appendChild(line);
}

wiringInterface.prototype.addChannelLine = function (w,table, operation, gadget, name){	
	// This function is used to actualize the  tables of connections of any channel
	var line = document.createElement("tr");
	var col1 = document.createElement("td");
	var col2 = document.createElement("td");
	var button = document.createElement("input");
	var text;
	if (gadget == "null" || gadget == null){
		text = document.createTextNode(name);
		button.setAttribute("onClick", operation + "('" + name + "', $F('selectCanal'));wI.renewChannel(w,$F('selectCanal'),$('slotsConnection'),$('eventsConnection'))");
	}
	else{
		text = document.createTextNode(gadget + "::" + name);
		button.setAttribute("onClick", operation + "('" + gadget+ "','" +name+"', $F('selectCanal'));wI.renewChannel(w,$F('selectCanal'),$('slotsConnection'),$('eventsConnection'))");
	}
	button.setAttribute("type", "image");
	button.setAttribute("src", "cross.png");
	button.setAttribute("title", "delete connection");
	col1.appendChild(button);
	col2.appendChild(text);
	line.setAttribute("class", gadget)
	line.setAttribute("id", name)
	line.appendChild(col1);
	line.appendChild(col2);
	table.appendChild(line);
}