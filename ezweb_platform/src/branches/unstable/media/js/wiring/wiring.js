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


function Wiring (workSpaceGlobalInfo) {
		
    // *****************
    //  PRIVATE METHODS
    // *****************
	
		
    // ****************
    // PUBLIC METHODS
    // ****************
	
	Wiring.prototype.processTab = function (tabData) {
		var igadgets = tabData['igadgetList'];
		
		for (var i = 0; i < igadgets.length; i++) {
		    this.addInstance(igadgets[i]);
		}	
	}
	
	Wiring.prototype.loadWiring = function (workSpaceData) {
		var workSpace = workSpaceData['workspace'];
		var inOuts = workSpace['inoutList'];
		var tabs = workSpace['tabList'];
		
		for (var i=0; i< tabs.length; i++) {
			this.processTab(tabs[i]);
		}
		
		
		var connections = [];
		var list = null;
		
		// restauring the iGadget structure
	
		for (var i = 0; i < inOuts.length; i++) {
		    var inputs = new Object();
				
		    this.createChannel(inOuts[i]);	
		    inputs["from"] = inOuts[i].name; 
		    inputs.inputHash = inOuts[i].ins;
		    inputs.outputHash = inOuts[i].outs;
		    connections.push(inputs);	
		}
		// reconnecting every thing at this moment
		for (var r = 0; r < connections.length; r++){
		    var item = connections[r];
		    for (var i = 0; i < item.inputHash.length; i++){
			var input = item.inputHash[i];		
			if (input["igadget"] == "null"){
			    //the input is a channel
			    this.addChannelInput(input["name"],item["from"]);
			}
			else{
			    // the input is an event
			    this.addChannelInput(input["igadget"],input["name"],item["from"]);
			}
		    }
		    for (var j = 0; j < item.outputHash.length; j++){
			var output = item.outputHash[j];
			if (output["igadget"] == "null"){
			    //the output is a channel
			    this.addChannelOutput(output["name"], item["from"]);
			}
			else{
			    //the output is a slot
			    this.addChannelOutput(output["igadget"], output["name"],item["from"]);
			}
		    }
		}
		this.loaded = true;
    }
    
    // this method is used in the first version for painting the connections for the user.
    Wiring.prototype.getGadgetsId = function (){
	var gadgetsId = this.iGadgetList.keys();
	var result = [];

	// Initialization of igadget template info!
	// Only done one time!
//	if (!this.igadgetInfoComplete) {
//	    var dragboard = DragboardFactory.getInstance();
//			    
//	    for (var i = 0; i<gadgetsId.length; i++){
//		var gadgetId = gadgetsId[i];
//		var gadget = dragboard.getGadget(gadgetId);
//			    
//		this.iGadgetList[gadgetId].vendor = gadget.getVendor();
//		this.iGadgetList[gadgetId].name = gadget.getName();
//		this.iGadgetList[gadgetId].version = gadget.getVersion();
//	    }
//
//	    this.igadgetInfoComplete = true;
//	}

	for (var i = 0; i<gadgetsId.length; i++){
	    var gadgetId = gadgetsId[i];

	    var iGadget = new Object();
	    iGadget.name = this.iGadgetList[gadgetId].name;
	    iGadget.id = gadgetId;
	    result.push(iGadget);
	}

	return result;
    }
		
    Wiring.prototype.getInOutsId = function (){
	return this.copyList.keys();
    }
		
    // this method is used in the first version for painting the connections for the user.
    Wiring.prototype.connections = function (channel) {
	var channel = this.copyList[channel].ref;
	var connections = channel.connections();
	return connections;
    }

    Wiring.prototype.gadgetConnections = function (gadgetId) {
	var list = [];
	if (this.iGadgetList[gadgetId] != undefined){
	    for (var i = 0;i < this.iGadgetList[gadgetId].list.length ;i++){
		var item = new Object();
		item.name = this.iGadgetList[gadgetId].list[i].name;
		item.aspect = this.iGadgetList[gadgetId].list[i].aspect;
		item.friend_code = this.iGadgetList[gadgetId].list[i].friend_code;
		list.push(item);
	    }
	    return list;
	}
	else{
	    return null;			
	}
    }

    Wiring.prototype.addInstance = function (iGadget, template) {
	var gadget = new Object();
			
	if (arguments.length == 2){
	    if (this.iGadgetList[iGadget.id] == undefined) {
		var events = template.getEvents();
		var slots = template.getSlots();
					
		var itemList = [];
		gadget["id"] = iGadget.id;
					
		// The instance of the iGadget doesn't exist.
		for (var i = 0; i < events.length; i++){
		    var item = new Object();
		    item["name"] = events[i].name;
		    item["aspect"] = events[i].aspect;
		    item["friend_code"] = events[i].friend_code;
		    item["ref"] = new wEvent(iGadget.id, item["name"]);
		    itemList.push(item);
								
		}
					
		for (var j = 0; j < slots.length; j++){
		    var item = new Object();
		    item["name"] = slots[j].name;
		    item["aspect"] = slots[j].aspect;
		    item["friend_code"] = slots[j].friend_code;
		    item["ref"] = new wSlot(iGadget.id, item["name"]);
		    itemList.push(item);
		}
					
		gadget["list"] = itemList;
		this.iGadgetList[iGadget.id] = gadget;
		return 0;
	    }
	    else{
		alert("Gadget instance exists")
		    return -1;
	    }
	}
	else if (arguments.length == 1){
	    var gadget = new Object();
	    gadget["variables"] = [];
	    gadget["id"] = arguments[0]["code"];

		list = arguments[0].variables;
	    for (var j = 0; j < list.length; j++){
		var connectable = new Object();

		connectable.name = list[j].name;
		connectable.aspect = list[j].aspect;
		connectable.friend_code = list[j].friend_code;
		switch (connectable.aspect) {
		case "EVEN":
		    connectable.ref = new wEvent(null, null, list[j]);							
		    break;
		case "SLOT":
		    connectable.ref = new wSlot(null, null, list[j]);												
		    break;
		}
		gadget["variables"].push(connectable);
	    }
	    this.iGadgetList[gadget["id"]] = gadget;
	}
    } 
		
    Wiring.prototype.removeInstance = function (iGadgetId) {
	var instance = this.iGadgetList[iGadgetId];
			
	if (instance != undefined){
	    // the iGadget exists in the hash, we have to delete that entrance
	    var list = instance["list"];

	    for (var i = 0; i < list.length; i++){
		// We need to delete every connection with inOut objects
		list[i].ref.clear();
	    }
	    this.iGadgetList.remove(iGadgetId)
		return 0;
	}
	else{
	    alert("the instance doesn't exist")
	    return 1;
	}
    }
		
    Wiring.prototype.createChannel = function (newChannel){
	var channel = new Object();			
	if (!(newChannel instanceof Object)){
	    // this way is ejecuted when we create a new channel.
	    if (this.copyList[newChannel] == undefined){
		channel["name"] = newChannel;
	
		channel["ref"] = new wInOut(null, newChannel);
		this.copyList[newChannel] = channel;
		return 0;
	    }
	    else{
		// alert("Channel already exist")
		return -1;
	    }
	}
	else {
	    // this way is ejecuted when channels are added from persistence.
	    channel["name"] = newChannel["name"];
	    channel["ref"] = new wInOut(null, null, newChannel);
	    this.inOutList[newChannel["name"]] = channel;
	    return 0;	
	}
    }
		
    Wiring.prototype.removeChannel = function (channelName){
	var channel = this.copyList[channelName];

	if (channel != undefined){
	    // The selected channel exists
	    channel.ref.clear();
				
	    this.copyList.remove(channelName);
	    // alert("Channel deleted")
	    return 0;
	}
	else {
	    // alert("Channel doesn't exist")
	    return 1;
	}
    }
		
    Wiring.prototype.viewValue = function (channelName){
	// this method returns the actual value of the channel if it exits, if doesn't exists returns -1
	// ***********************
	var channel = this.inOutList[channelName];
			
	if (channel != undefined){
	    return channel.ref.getValue();
	}
	return undefined;
    }
		
    Wiring.prototype.sendEvent = function (iGadgetId, event, value) {
	// asynchronous
	var gadget = this.iGadgetList[iGadgetId];
	var channelList;

	// Reset modifiedVars variable
	this.modifiedVars = []

	if (gadget != undefined){
	    // The channel and the gadget selected exist.
	    var list = gadget.list;
				
	    // Find the EVENT in the gadget which name is channelName
	    for (var i = 0; i < list.length; i++){
		if ((list[i].name == event) && (list[i].aspect == "EVEN")){
		    list = list[i].ref;
		    // Now the variable list has the event's reference.
		    break;
		}
	    }

	    channelList = list.setValue(value);

	    return this.modifiedVars;
	}
	else {
	    alert("gadget doesn't exist");
	    return -1;
	}
    }


    Wiring.prototype.markVariableAsModified = function (varInfo) {
	var modVar;
	var found = false;

	for (j=0; j<this.modifiedVars.length; j++) {
	    modVar = this.modifiedVars[j];
			
	    if (modVar.iGadget == varInfo.iGadget && modVar.name == varInfo.name) {
		modVar.value = varInfo.value;
		found = true;
		break;
	    }			  			    
	}
		    
	if (found == false) {
	    this.modifiedVars.push(varInfo);
	}			    
    }
		 
    Wiring.prototype.addChannelInput = function () {
	if (arguments.length == 3){
	    // Wiring.prototype.addChannelInput = function (idGadgetId, inputName, channelName) {
	    if (loaded){var channel = this.copyList[arguments[2]];}
	    else{var channel = this.inOutList[arguments[2]];}
				
	    var gadget = this.iGadgetList[arguments[0]];

	    if ((channel != undefined) && (gadget != undefined)){
		// The channel and the gadget selected exist.
		var list = gadget.list;

		// Find the EVENT in the gadget which name is channelName
		for (var i = 0; i < list.length; i++){
		    if ((list[i].name == arguments[1]) && (list[i].aspect == "EVEN")){
			list = list[i].ref;
			// Now the variable list has the event's reference.
			break;
		    }
		}
					
		// we need to connect both parts: the In connection and InOut connection
		if (!loaded)
		    list.addOutput(channel.ref);
		channel.ref.addInput(list);
		return 1;
	    }			
	}
	else if (arguments.length == 2){
	    // Wiring.prototype.addChannelInput = function (inputName, channelName) {
	    if (loaded){
		var channel = this.copyList[arguments[1]];
		var input = this.copyList[arguments[0]];	
	    }
	    else{
		var channel = this.inOutList[arguments[1]];
		var input = this.inOutList[arguments[0]];
	    }
				
				
	    if ((channel != undefined) && (input != undefined)){
		// Both channels exist.
		input = input.ref;
		channel = channel.ref;
	
					
		input.addOutput(channel);
		channel.addInput(input);
		return 1;
	    }						
	}
    }
		
    Wiring.prototype.addChannelOutput = function (){
			
	if (arguments.length == 3){
	    //		Wiring.prototype.addChannelOutput = function (idGadgetId, outputName, channelName) {
	    if (loaded){var channel = this.copyList[arguments[2]];}
	    else{var channel = this.inOutList[arguments[2]];}
				
	    var gadget = this.iGadgetList[arguments[0]];
	
	    if ((channel != undefined) && (gadget != undefined)){
		// The channel and the gadget selected exist.
		var list = gadget.list;
		// Find the EVEN in the gadget which name is channelName
		for (var i = 0; i < list.length; i++){
		    if ((list[i].name == arguments[1]) && (list[i].aspect == "SLOT")){
			list = list[i].ref;
			// Now the variable list has the 's reference.
			break;
		    }
		}
					
		//  we need to connect both parts to make the doubled linked list 
		if (!loaded)
		    list.addInput(channel.ref);
		channel.ref.addOutput(list);
		return 1;
	    }			
	}
	if (arguments.length == 2){
	    //		Wiring.prototype.addChannelOutput = function (outputName, channelName) {
	    if (loaded){
		var channel = this.copyList[arguments[1]];
		var output = this.copyList[arguments[0]];	
	    }
	    else{
		var channel = this.inOutList[arguments[1]];
		var output = this.inOutList[arguments[0]];
	    }
				
	    if ((channel != undefined) && (output != undefined)){
		// Both channels exist.
					
		output.ref.addInput(channel.ref);
		channel.ref.addOutput(output.ref);
		return 1;
	    }	
	}
    }
    Wiring.prototype.removeChannelInput = function () {
			
	//Wiring.prototype.removeChannelInput = function (idGadgetId, inputName, channelName) {
	if (arguments.length == 3){
	    if (loaded){var channel = this.copyList[arguments[2]];}
	    else{var channel = this.inOutList[arguments[2]];}
				
	    var gadget = this.iGadgetList[arguments[0]];
	
	    if ((channel != undefined) && (gadget != undefined)){
		// The channel and the gadget selected exist.
		var list = gadget.list;
					
		// Find the EVEN in the gadget which name is channelName
		for (var i = 0; i < list.length; i++){
		    if ((list[i].name == arguments[1]) && (list[i].aspect == "EVEN")){
			list = list[i].ref;
			// Now the variable list has the event's reference.
			break;
		    }
		}
					
		//  we need to connect both parts to make the doubled linked list 
		//list.removeOutput(channel.ref);
		channel.ref.removeInput(list);
		return 1;
	    }			
				
	}
	if (arguments.length == 2){		
	    //Wiring.prototype.removeChannelInput = function (inputName, channelName) {
	    if (loaded){
		var channel = this.copyList[arguments[1]];
		var input = this.copyList[arguments[0]];	
	    }
	    else{
		var channel = this.inOutList[arguments[1]];
		var input = this.inOutList[arguments[0]];
	    }
				
	    if ((channel != undefined) && (input != undefined)){
		// Both channels exist.
					
		input.ref.removeOutput(channel.ref);
		channel.ref.removeInput(input.ref);
		return 1;
	    }			
	}
    }

    Wiring.prototype.removeChannelOutput = function () {
			
	//	Wiring.prototype.removeChannelOutput = function (idGadgetId, outputName, channelName) {
	if (arguments.length == 3){
	    if (loaded){var channel = this.copyList[arguments[2]];}
	    else{var channel = this.inOutList[arguments[2]];}
				
	    var gadget = this.iGadgetList[arguments[0]];
	
	    if ((channel != undefined) && (gadget != undefined)){
		// The channel and the gadget selected exist.
		var list = gadget.list;
					
		// Find the EVEN in the gadget which name is channelName
		for (var i = 0; i < list.length; i++){
		    if ((list[i].name == arguments[1]) && (list[i].aspect == "SLOT")){
			list = list[i].ref;
			// Now the variable list has the event's reference.
			break;
		    }
		}
					
		// we need to connect both parts to make the doubled linked list 
		//list.removeInput(channel.ref);
		channel.ref.removeOutput(list);
		return 1;
	    }			
				
	}
	if (arguments.length == 2){
	    //Wiring.prototype.removeChannelOutput = function (outputName, channelName) {
	    if (loaded){
		var channel = this.copyList[arguments[1]];
		var output = this.copyList[arguments[0]];	
	    }
	    else{
		var channel = this.inOutList[arguments[1]];
		var output = this.inOutList[arguments[0]];
	    }
				
	    if ((channel != undefined) && (output != undefined)){
		// Both channels exist.
					
		output.ref.removeInput(channel.ref);
		channel.ref.removeOutput(output.ref);
		return 1;
	    }		
	}
    }
		
    Wiring.prototype.edition = function () {
	this.copyList = new Hash();
	var keys = this.inOutList.keys();
	var channelConnections = new Hash();
		
	for (var i = 0; i < keys.length; i++){
	    var element = this.inOutList[keys[i]].ref;
	    var newElement = element.duplicate();
	    // newElement has the new object channel with the connectios to the channel's names which have to reconnect
	    var item = new Object();
	    item["name"] = keys[i];
	    item["ref"] = newElement["InOut"];
	    this.copyList[keys[i]] = item;
				
	    var channel = new Object();
	    channel["inputs"] = newElement["input"];
	    channel["outputs"] = newElement["output"];
	    channelConnections[keys[i]] = channel;	
	}
	// making connections from channel to channel
	for (var i = 0; i < keys.length; i++){
	    var newInput = channelConnections[keys[i]];
				
	    var iteration = newInput.inputs;
	    for (var j = 0; j < iteration.length; j++){
		this.addChannelInput(iteration[j],keys[i])
		    }

	    iteration = newInput.outputs;
	    for (var z = 0; z < iteration.length; z++){
		this.addChannelOutput(iteration[z],keys[i])
		    }
	}
    }
		
    Wiring.prototype.restaure = function () {
	// we nedd to reconnect every thing to this part
	var keys = this.inOutList.keys();
	var copyKeys = this.copyList.keys();
	var iGadgets = this.iGadgetList.keys();
			
	for (var t = 0; t<iGadgets.length; t++){
	    var list = this.iGadgetList[iGadgets[t]].list;
	    for (var z = 0; z < list.length; z++){
		list[z].ref.eraseConnections();
	    }	
	}
			
	for (var i = 0; i < copyKeys.length; i++){
	    var channel = this.copyList[copyKeys[i]];
	    if (keys.indexOf(copyKeys[i]) != -1){
		channel.ref.value = this.inOutList[copyKeys[i]].ref.getValue();
	    }
	    channel.ref.refresh(channel.ref);
	    keys = keys.without(copyKeys[i]);
	}
	for (var j= 0; j < keys.length; j++){
	    var deletedChannel = this.inOutList[keys[j]].ref;
	    deletedChannel.delConnections();	
	}
	this.inOutList = this.copyList;
    }

    Wiring.prototype.serializationSuccess = function (response){

    }

    Wiring.prototype.serializationError = function (response){
	var p = response.responseText;
	alert("ERROR: Channel and its connections cannot be saved");		
    }

    Wiring.prototype.serialize = function (){
	var gadgets = [], inouts = [];
	var gadgetKeys = this.iGadgetList.keys();
	var inOutKeys = this.copyList.keys();
		    
	// IGadgets
	for (var i = 0; i < gadgetKeys.length; i++){
	    var list = [];
	    for (var j = 0; j < this.iGadgetList[gadgetKeys[i]].list.length; j++){
		var connectablejson = new Object();

		connectablejson.name = this.iGadgetList[gadgetKeys[i]].list[j].name;
		connectablejson.uri =  this.iGadgetList[gadgetKeys[i]].list[j].ref.getURI();
		connectablejson.value =  this.iGadgetList[gadgetKeys[i]].list[j].ref.getValue();
		connectablejson.aspect =  this.iGadgetList[gadgetKeys[i]].list[j].aspect;
		connectablejson.type =  this.iGadgetList[gadgetKeys[i]].list[j].ref.getType();
		connectablejson.igadget =  this.iGadgetList[gadgetKeys[i]].list[j].ref.getId();

		list.push(connectablejson);
	    }

	    var iGadget = new Object();	
		
	    var iGadgetId = {iGadgetId: this.iGadgetList[gadgetKeys[i]].id};

		//TODO: reconstruir uri
	    iGadget.uri = URIs.GET_IGADGET.evaluate(iGadgetId);
	    iGadget.id = this.iGadgetList[gadgetKeys[i]].id;
	    iGadget.list = list;
	    gadgets.push(iGadget);
	}

	// Channels
	for(var t = 0; t < inOutKeys.length; t++){
	    inouts[t] = new Object();
	    inouts[t].uri = this.copyList[inOutKeys[t]].ref.getURI();
	    inouts[t].friend_code = ''
	    inouts[t].value = this.copyList[inOutKeys[t]].ref.getValue();
	    inouts[t].name = this.copyList[inOutKeys[t]].ref.getName();
    			
	    inouts[t].ins = [];
	    for (var v = 0; v < this.copyList[inOutKeys[t]].ref.inputList.length; v++){
		var nextIn = this.copyList[inOutKeys[t]].ref.inputList[v];
		inouts[t].ins[v] = new Object();
		inouts[t].ins[v].name = nextIn.getName();
		inouts[t].ins[v].uri = nextIn.getURI();
		inouts[t].ins[v].igadget = nextIn.getId();
	    }

	    inouts[t].outs = [];
	    for (var v = 0; v < this.copyList[inOutKeys[t]].ref.outputList.length; v++){
		var nextOut = this.copyList[inOutKeys[t]].ref.outputList[v];
		inouts[t].outs[v] = new Object();
		inouts[t].outs[v].name = nextOut.getName();
		inouts[t].outs[v].uri = nextOut.getURI();
		inouts[t].outs[v].igadget = nextOut.getId();
	    }

	}

	var json = new Object();

	json['iGadgetList'] = gadgets;
	json['inOutList'] = inouts;
		    
	var param = {json: Object.toJSON(json)};
		    
	PersistenceEngineFactory.getInstance().send_post(URIs.GET_POST_WIRING, param, this, this.serializationSuccess, this.serializationError); 
		    
    }
    
    // ***************
    // CONSTRUCTOR
	// ***************
    this.workSpaceInfo = workSpaceGlobalInfo;

    this.loaded = false;
    this.persistenceEngine = PersistenceEngineFactory.getInstance();
    this.iGadgetList = new Hash();
    this.inOutList = new Hash();
    // copy is the list that is used for making new connections or disconnections with the interface.
    this.copyList = new Hash(); 

    // Avoiding dependence between Wiring and Dragboard modules! Now the Wiring load before Dragboard!
    this.igadgetInfoCompleted = false;

    // Allow to pack in an only PUT request, all the variable changes of a VariablePlatform.set invocation
    this.modifiedVars = [];	
    
    this.loadWiring(this.workSpaceInfo);

}     	
	
	


