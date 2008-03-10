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


/**
 * @author rnogal
 */

var WiringFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Wiring () {

		// ****************
		// CALLBACK METHODS 
		// ****************
		
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		loadWiring = function (transport) {
			// JSON-coded iGadget-variable mapping
			var response = transport.responseText;
			var tempList = eval ('(' + response + ')');

			var gadgets = tempList.iGadgetList;
			var inOuts = tempList.inOutList;
			var connections = [];
			var list = null;
	
			// restauring the iGadget structure
			for (var i = 0; i < gadgets.length; i++) {
				this.addInstance(gadgets[i]);
				}		
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
			loaded = true;
			OpManagerFactory.getInstance().continueLoading(Modules.prototype.WIRING);
		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error wiring GET");
			
			// Procesamiento
		}
		
		// *****************
		//  PRIVATE METHODS
		// *****************
		var loaded = false
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var iGadgetList = new Hash();
		var inOutList = new Hash();
		// copy is the list that is used for making new connections or disconnections with the interface.
		var copyList = new Hash(); 

		// Allow to pack in an only PUT request, all the variable changes of a VariablePlatform.set invocation
		var modifiedVars = [];

		persistenceEngine.send_get(URIs.GET_POST_WIRING, this, loadWiring, onError);
		
		
		// ****************
		// PUBLIC METHODS
		// ****************
		
		
		
		// this method is used in the first version for painting the connections for the user.
		Wiring.prototype.getGadgetsId = function (){
			var gadgetsId = iGadgetList.keys();
			var result = []
			for (var i = 0; i<gadgetsId.length; i++){
				var iGadget = new Object();
				iGadget.name = iGadgetList[gadgetsId[i]].name;
				iGadget.id = gadgetsId[i];
				result.push(iGadget);
			}
			return result;
		}
		
		Wiring.prototype.getInOutsId = function (){
			return copyList.keys();
		}
		
		// this method is used in the first version for painting the connections for the user.
		Wiring.prototype.connections = function (channel) {
			var channel = copyList[channel].ref;
			var connections = channel.connections();
			return connections;
		}

		Wiring.prototype.gadgetConnections = function (gadgetId) {
			var list = [];
			if (iGadgetList[gadgetId] != undefined){
				for (var i = 0;i < iGadgetList[gadgetId].list.length ;i++){
					var item = new Object();
					item.name = iGadgetList[gadgetId].list[i].name;
					item.aspect = iGadgetList[gadgetId].list[i].aspect;
                    item.friend_code = iGadgetList[gadgetId].list[i].friend_code;
					list.push(item);
				}
				return list;
			}
			else{
				return null;			
			}
		}

		Wiring.prototype.addInstance = function (iGadgetId, template) {
			var gadget = new Object();
			
			if (arguments.length == 2){
				if (iGadgetList[iGadgetId] == undefined) {
					var events = template.getEvents();
					var slots = template.getSlots();
					
					var itemList = [];
					gadget["id"] = iGadgetId;

					//var gadgetModel = DragboardFactory.getInstance().getGadget(iGadgetId);

					//gadget["vendor"] = gadgetModel.getVendor();
					//gadget["version"] = gadgetModel.getVersion();	
					//gadget["name"] = gadgetModel.getName();	
					
					// The instance of the iGadget doesn't exist.
					for (var i = 0; i < events.length; i++){
						var item = new Object();
						item["name"] = events[i].name;
						item["aspect"] = events[i].aspect;
						item["friend_code"] = events[i].friend_code;
						item["ref"] = new wEvent(iGadgetId, item["name"]);
						itemList.push(item);
								
					}
					
					for (var j = 0; j < slots.length; j++){
						var item = new Object();
						item["name"] = slots[j].name;
						item["aspect"] = slots[j].aspect;
						item["friend_code"] = slots[j].friend_code;
						item["ref"] = new wSlot(iGadgetId, item["name"]);
						itemList.push(item);
					}
					
					gadget["list"] = itemList;
					iGadgetList[iGadgetId] = gadget;
					return 0;
				}
				else{
					alert("Gadget instance exists")
					return -1;
				}
			}
			else if (arguments.length == 1){
				var gadget = new Object();
				gadget["list"] = [];
				gadget["id"] = arguments[0]["id"];
	
//				var gadgetModel = DragboardFactory.getInstance().getGadget(arguments[0]["id"]);
//				gadget["vendor"] = gadgetModel.getVendor();
//				gadget["version"] = gadgetModel.getVersion();		
//				gadget["name"] = gadgetModel.getName();
				
				list = arguments[0].list;
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
					gadget["list"].push(connectable);
				}
				iGadgetList[gadget["id"]] = gadget;
			}
		} 
		
		Wiring.prototype.removeInstance = function (iGadgetId) {
			var instance = iGadgetList[iGadgetId];
			
			if (instance != undefined){
				// the iGadget exists in the hash, we have to delete that entrance
				var list = instance["list"];

				for (var i = 0; i < list.length; i++){
					// We need to delete every connection with inOut objects
					list[i].ref.clear();
				}
				iGadgetList.remove(iGadgetId)
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
				if (copyList[newChannel] == undefined){
					channel["name"] = newChannel;
	
					channel["ref"] = new wInOut(null, newChannel);
					copyList[newChannel] = channel;
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
				inOutList[newChannel["name"]] = channel;
				return 0;	
			}
		}
		
		Wiring.prototype.removeChannel = function (channelName){
			var channel = copyList[channelName];

			if (channel != undefined){
				// The selected channel exists
				channel.ref.clear();
				
				copyList.remove(channelName);
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
			var channel = inOutList[channelName];
			
			if (channel != undefined){
				return channel.ref.getValue();
			}
			return undefined;
		}
		
		Wiring.prototype.sendEvent = function (iGadgetId, event, value) {
			// asynchronous
			var gadget = iGadgetList[iGadgetId];
			var channelList;

			// Reset modifiedVars variable
			modifiedVars = []

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

				return modifiedVars;
			}
			else {
				alert("gadget doesn't exist");
				return -1;
			}
		}


		Wiring.prototype.markVariableAsModified = function (varInfo) {
		    var modVar;
		    var found = false;

		    for (j=0; j<modifiedVars.length; j++) {
			modVar = modifiedVars[j];
			
			if (modVar.iGadget == varInfo.iGadget && modVar.name == varInfo.name) {
			    modVar.value = varInfo.value;
			    found = true;
			    break;
			}			  			    
		    }
		    
		    if (found == false) {
			modifiedVars.push(varInfo);
		    }			    
		}
		 
		Wiring.prototype.addChannelInput = function () {
			if (arguments.length == 3){
   	 		// Wiring.prototype.addChannelInput = function (idGadgetId, inputName, channelName) {
				if (loaded){var channel = copyList[arguments[2]];}
				else{var channel = inOutList[arguments[2]];}
				
				var gadget = iGadgetList[arguments[0]];

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
					var channel = copyList[arguments[1]];
					var input = copyList[arguments[0]];	
				}
				else{
					var channel = inOutList[arguments[1]];
					var input = inOutList[arguments[0]];
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
				if (loaded){var channel = copyList[arguments[2]];}
				else{var channel = inOutList[arguments[2]];}
				
				var gadget = iGadgetList[arguments[0]];
	
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
					var channel = copyList[arguments[1]];
					var output = copyList[arguments[0]];	
				}
				else{
					var channel = inOutList[arguments[1]];
					var output = inOutList[arguments[0]];
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
				if (loaded){var channel = copyList[arguments[2]];}
				else{var channel = inOutList[arguments[2]];}
				
				var gadget = iGadgetList[arguments[0]];
	
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
					var channel = copyList[arguments[1]];
					var input = copyList[arguments[0]];	
				}
				else{
					var channel = inOutList[arguments[1]];
					var input = inOutList[arguments[0]];
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
				if (loaded){var channel = copyList[arguments[2]];}
				else{var channel = inOutList[arguments[2]];}
				
				var gadget = iGadgetList[arguments[0]];
	
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
					var channel = copyList[arguments[1]];
					var output = copyList[arguments[0]];	
				}
				else{
					var channel = inOutList[arguments[1]];
					var output = inOutList[arguments[0]];
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
			copyList = new Hash();
			var keys = inOutList.keys();
			var channelConnections = new Hash();
		
			for (var i = 0; i < keys.length; i++){
				var element = inOutList[keys[i]].ref;
				var newElement = element.duplicate();
				// newElement has the new object channel with the connectios to the channel's names which have to reconnect
				var item = new Object();
				item["name"] = keys[i];
				item["ref"] = newElement["InOut"];
				copyList[keys[i]] = item;
				
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
			var keys = inOutList.keys();
			var copyKeys = copyList.keys();
			var iGadgets = iGadgetList.keys();
			
			for (var t = 0; t<iGadgets.length; t++){
				var list = iGadgetList[iGadgets[t]].list;
				for (var z = 0; z < list.length; z++){
					list[z].ref.eraseConnections();
				}	
			}
			
			for (var i = 0; i < copyKeys.length; i++){
				var channel = copyList[copyKeys[i]];
				if (keys.indexOf(copyKeys[i]) != -1){
					channel.ref.value = inOutList[copyKeys[i]].ref.getValue();
				}
				channel.ref.refresh(channel.ref);
				keys = keys.without(copyKeys[i]);
			}
			for (var j= 0; j < keys.length; j++){
				var deletedChannel = inOutList[keys[j]].ref;
				deletedChannel.delConnections();	
			}
			inOutList = copyList;
		}

		Wiring.prototype.serializationSuccess = function (response){

		}

		Wiring.prototype.serializationError = function (response){
		    var p = response.responseText;
		    alert("ERROR: Channel and its connections cannot be saved");		
		}

		Wiring.prototype.serialize = function (){
		    var gadgets = [], inouts = [];
		    var gadgetKeys = iGadgetList.keys();
		    var inOutKeys = copyList.keys();
		    
		    // IGadgets
		    for (var i = 0; i < gadgetKeys.length; i++){
			var list = [];
			for (var j = 0; j < iGadgetList[gadgetKeys[i]].list.length; j++){
			    var connectablejson = new Object();

			    connectablejson.name = iGadgetList[gadgetKeys[i]].list[j].name;
			    connectablejson.uri =  iGadgetList[gadgetKeys[i]].list[j].ref.getURI();
				connectablejson.value =  iGadgetList[gadgetKeys[i]].list[j].ref.getValue();
				connectablejson.aspect =  iGadgetList[gadgetKeys[i]].list[j].aspect;
				connectablejson.type =  iGadgetList[gadgetKeys[i]].list[j].ref.getType();
				connectablejson.igadget =  iGadgetList[gadgetKeys[i]].list[j].ref.getId();

				list.push(connectablejson);
			}

			var iGadget = new Object();	
		
			var iGadgetId = {iGadgetId: iGadgetList[gadgetKeys[i]].id};

			iGadget.uri = URIs.POST_IGADGET.evaluate(iGadgetId);
			iGadget.id = iGadgetList[gadgetKeys[i]].id;
			iGadget.list = list;
			gadgets.push(iGadget);
		    }

		    // Channels
		    for(var t = 0; t < inOutKeys.length; t++){
				inouts[t] = new Object();
				inouts[t].uri = copyList[inOutKeys[t]].ref.getURI();
    			inouts[t].friend_code = ''
    			inouts[t].value = copyList[inOutKeys[t]].ref.getValue();
    			inouts[t].name = copyList[inOutKeys[t]].ref.getName();
    			
				inouts[t].ins = [];
				for (var v = 0; v < copyList[inOutKeys[t]].ref.inputList.length; v++){
					var nextIn = copyList[inOutKeys[t]].ref.inputList[v];
					inouts[t].ins[v] = new Object();
					inouts[t].ins[v].name = nextIn.getName();
					inouts[t].ins[v].uri = nextIn.getURI();
					inouts[t].ins[v].igadget = nextIn.getId();
				}

				inouts[t].outs = [];
				for (var v = 0; v < copyList[inOutKeys[t]].ref.outputList.length; v++){
					var nextOut = copyList[inOutKeys[t]].ref.outputList[v];
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

	}	
	
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
 	   	this.getInstance = function() {
    			if (instance == null) {
        			instance = new Wiring();
         		}
      		   	return instance;
      	 	}
	}
	
}();

