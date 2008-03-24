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
}
wiringInterface.prototype.unloaded = function (){
	this.loaded = false;
	this._hideItems();
	$("eventsConnection").innerHTML = "";
	$("slotsConnection").innerHTML = "";
	$("events").innerHTML = "";
	$("slots").innerHTML = "";
	
	$("selectCanal").innerHTML = "";
	$("wCanales").innerHTML = "";
	$("wGadgets").innerHTML = "";
	var element = document.createElement("option");
	element.setAttribute("value","")
	element.setAttribute("selected", true)
	var text = document.createTextNode("----");
	element.appendChild(text);
	$("selectCanal").appendChild(element);
	this.renewItem(WiringFactory.getInstance(),"","eventsConnection","slotsConnection")
	
}

wiringInterface.prototype.addChannelInterface = function(name, selector, itemize){
	var element = document.createElement("option");
	element.setAttribute("id","option_select_"+name)
	element.setAttribute("selected", true)
	var text = document.createTextNode(name);
	element.appendChild(text);
	selector.appendChild(element);
	var element = document.createElement("option");
	var text = document.createTextNode(name);
	element.setAttribute("id", "option_itemize_"+name)
	element.appendChild(text);
	itemize.appendChild(element);
}

wiringInterface.prototype.addGadgetInterface = function (object,selector){
	var element = document.createElement("option");
	element.setAttribute("id", object.id)
	element.setAttribute("value", object.id)
	var text = document.createTextNode(object.name+"_"+object.id);
	element.appendChild(text);
	selector.appendChild(element);
}

wiringInterface.prototype.renewInterface = function (w,selector,sGadgets,itemize){
//wiringInterface.prototype.renewInterface = function (){
	w.edition();
	if (!this.loaded){
		var iGadgets = w.getGadgetsId();
		var channels = w.getInOutsId();
		for (var i = 0; i<iGadgets.length; i++){
			this.addGadgetInterface(iGadgets[i],sGadgets);
		}
		for (var j = 0; j<channels.length; j++){
			this.addChannelInterface(channels[j],selector,itemize)
		}
		selector.value = ""
		this.loaded = true
	}
}

wiringInterface.prototype.addChannel = function (w,selector,itemize,slots,events){
	var result = null;
	var name = prompt("Insert Channel Name:","Channel Name...");
	if (name != null){
		if (!(result = w.createChannel(name))){	
			this.addChannelInterface(name,selector,itemize);
			this.renewChannel(w,name,slots,events)
		}
	}
}

wiringInterface.prototype.deleteChannel = function (w,object,selector,itemize,slots,events){
	var result = null;
	if (!(result = w.removeChannel(object))){
		//the first id is from the channel list	
		var hijo = $('option_select_' + object);
		selector.removeChild(hijo);
		// the new identifier is from the item list
		var hijo = $('option_itemize_' + object);
		itemize.removeChild(hijo);
		this.renewChannel(w,"",slots,events)
	}
}

wiringInterface.prototype.renewChannel = function (w,channel,slots,events){
	slots.innerHTML = "";
	events.innerHTML = "";
	if (channel != ""){
		this._nameChannel(channel);
		var connections = w.connections(channel);
		var inputs = connections["input"];
		var outputs = connections["output"];
		$("valor").value = w.viewValue(channel);
		for (var i = 0; i < inputs.length; i++){
			this.addChannelLine (w,events, "w.removeChannelInput",inputs[i].gadgetName,inputs[i].id, inputs[i].name)
		}
		for (var j = 0; j < outputs.length; j++){
			this.addChannelLine (w, slots, "w.removeChannelOutput", outputs[j].gadgetName,outputs[j].id, outputs[j].name)
		}
		this._showItems();
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
	button.setAttribute("src", "/ezweb/js/wiring/tick.png");
	button.setAttribute("title", "add connection");
	col1.appendChild(button);
	col2.appendChild(text);
	line.setAttribute("class", gadget)
	line.setAttribute("id", name)
	line.appendChild(col1);
	line.appendChild(col2);
	table.appendChild(line);
}

wiringInterface.prototype.addChannelLine = function (w,table, operation,gadgetName, gadget, name){	
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
		text = document.createTextNode(gadgetName+"_"+gadget + "::" + name);
		button.setAttribute("onClick", operation + "('" + gadget+ "','" +name+"', $F('selectCanal'));wI.renewChannel(w,$F('selectCanal'),$('slotsConnection'),$('eventsConnection'))");
	}
	button.setAttribute("type", "image");
	button.setAttribute("src", "/ezweb/js/wiring/cross.png");
	button.setAttribute("title", "delete connection");
	col1.appendChild(button);
	col2.appendChild(text);
	line.setAttribute("class", gadget)
	line.setAttribute("id", name)
	line.appendChild(col1);
	line.appendChild(col2);
	table.appendChild(line);
}

wiringInterface.prototype._showItems = function (){
	$("items_panel").style.visibility = "visible";
}

wiringInterface.prototype._hideItems = function (){
	$("items_panel").style.visibility = "hidden";
}

wiringInterface.prototype._nameChannel = function(channelName){
	var inputHeader = $("input_header");
	var outputHeader = $("output_header");
	var firstChild = inputHeader.firstChild;
	
	if (firstChild != undefined){
		inputHeader.removeChild(firstChild);
		outputHeader.removeChild(outputHeader.firstChild);
	}
	channelName1 = document.createTextNode(channelName);
	channelName2 = document.createTextNode(channelName);
	inputHeader.appendChild(channelName1);
	outputHeader.appendChild(channelName2);
}
