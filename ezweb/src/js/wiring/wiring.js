/**
 * @author rnogal
 */

<script src = "./connectable.js" type = "text/javascript"></script>;
<script src = "../lib/prototype.js" type = "text/javascript"></script>;

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


			// Constructing the structure
			var list = null;
			// restauring the iGadget structure
			for (i = 0; i < gadgets.length; i++) {
				var gadget = new Object();
				gadget.id = gadgets[i].id;

				list = gadgets[i].list;
				
				for (j = 0; j < list.length; j++) {
					var connectable = new Object();

					connectable.name = list[j].name;
					connectable.aspect = list[j].aspect;
					
					switch (connectable.aspect) {
						case Variable.prototype.EVENT:
							connectable.ref = new Event();							
							break;
						case Variable.prototype.SLOT:
							connectable.ref = new Slot();												
							break;
					}
					gadget["list"].push(connectable);
				}
				iGadgetList.id = gadget;
			}
			// we use this variable to insert all the connections and then serve them all.
			var inconnections = [];
			var outconnections = [];
			
			for (i = 0; i < inOuts.length; i++) {
				var inOut = new Object();
				// creating the object channel
				inOut.name = inOuts[i].name;
				inOut.ref = new Channel(inOuts[i]);
				// and inserting it in the wiring channel list
				inOutList.name = inOut;
				
				for (var z = 0; z < inOuts[i].inputHash.length; z++){
					var input = new Object();	
					input.from = inOut.name;
					input.to = inOuts[i].inputHash[z];
				}
				for (var t = 0; t < inOuts[i].outputHash.length; t++){
					var output = new Object();	
					output.from = inOut.name;
					output.to = inOuts[i].outputHash[t];
				}
			}
			// we reconnect every thing at this moment


		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error wiring GET");
			
			// Procesamiento
		}
		
		// *****************
		//  PRIVATE METHODS
		// *****************
		
		
		var iGadgetList = new Hash();
		var inOutList = new Hash();

		
		// ****************
		// PUBLIC METHODS
		// ****************
		// this method is used in the first version for painting the connections for the user.
		Wiring.prototype.connections = function (channel) {
			return inOutList["channel"].ref.connections();
		}

		Wiring.prototype.addInstance = function (iGadgetId, template) {
			var gadget = new Object();
			 
			if (iGadgetList[iGadgetId] == undefined) {
				//var connectables = template.getVariables();
				var connectables = template;

				var itemList = [];
				
				// The instance of the iGadget doesn't exist.
				gadget["id"] = iGadgetId;
		
				for (var i = 0; i < connectables.length; i++){
					var item = new Object();
				
					item["name"] = connectables[i].name;
					switch (connectables[i].aspect){
						case "EVENT":
							item["aspect"] = "EVENT";
							item["ref"] = new Event(iGadgetId, item.name);
							itemList.push(item);
					
							break;
						case "SLOT": 
							item["aspect"] = "SLOT";
							item["ref"] = new Slot(iGadgetId, item["name"]);
							itemList.push(item);		
								
							break;
						default: 
							break;
					}		
				}
				gadget["list"] = itemList;
				iGadgetList[iGadgetId] = gadget;
//				alert(Object.toJSON(iGadgetList[iGadgetId].list))
				// Insertar en los eventos y los slots las variables del template
				// Insertion in events and slots of the template variables.
				return 0;
			}
			else{
				alert("Gadget instance exists")
				return -1;
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
//					alert("Connections deleted:  "+list[i].ref.name);
				}
				iGadgetList.remove(iGadgetId)
				return 0;
			}
			else{
				alert("the instance doesn't exist")
				return 1;
			}
		}
		
		Wiring.prototype.createChannel = function (channelName){
			var channel = new Object();
			
			if (inOutList[channelName] == undefined){
				channel["name"] = channelName;

				channel["ref"] = new InOut(null, channelName);
				inOutList[channelName] = channel;
//				alert("channel doesn't exist")
				return 0;
			}
			else{
				alert("channel already exist")
				return -1;
			}

		}
		
		Wiring.prototype.removeChannel = function (channelName){
			var channel = inOutList[channelName];

			if (channel != undefined){
				// The selected channel exists
				channel.ref.clear();
				inOutList.remove(channelName);
//				alert("Channel deleted")
				return 0;
			}
			else {
				alert("Channel doesn't exist")
				return 1;
			}
		}
		
		Wiring.prototype.viewValue = function (channelName){
			// this method returns the actual value of the channel if it exits, if doesn't exists returns -1
			// ***********************
			var channel = inOutList[channelName];
			
			if (channel != undefined){
//			    alert("El nombre del canal es " + channelName);
				return channel.ref.getValue();
			}
			return undefined;
		}
		
		Wiring.prototype.sendEvent = function (iGadgetId, event, value) {
			// asynchronous
			var gadget = iGadgetList[iGadgetId];

			if (gadget != undefined){
				// The channel and the gadget selected exist.
				var list = gadget.list;
				
				// Find the EVENT in the gadget which name is channelName
				for (var i = 0; i < list.length; i++){
					if ((list[i].name == event) && (list[i].aspect == "EVENT")){
						list = list[i].ref;
						// Now the variable list has the event's reference.
						break;
					}
				}

				list.setValue(value);
				return 1;
			}
			else {
				alert("gadget doesn't exist");
				return -1;
			}
		}
		 
		Wiring.prototype.addChannelInput = function () {
			if (arguments.length == 3){
   	 		// Wiring.prototype.addChannelInput = function (idGadgetId, inputName, channelName) {
   				var channel = inOutList[arguments[2]];
				var gadget = iGadgetList[arguments[0]];

				if ((channel != undefined) && (gadget != undefined)){
					// The channel and the gadget selected exist.
					var list = gadget.list;

					// Find the EVENT in the gadget which name is channelName
					for (var i = 0; i < list.length; i++){
						if ((list[i].name == arguments[1]) && (list[i].aspect == "EVENT")){
							list = list[i].ref;
							// Now the variable list has the event's reference.
							break;
						}
					}
					
					// we need to connect both parts: the In connection and InOut connection
					list.addOutput(channel.ref);
					channel.ref.addInput(list);
//					alert("Added event between channel " + channel.name +" and " + gadget.id)
//					alert(channel.ref.getName());
//					alert(channel.ref.getValue());
					return 1;
				}			
			}
			else if (arguments.length == 2){
		    // Wiring.prototype.addChannelInput = function (inputName, channelName) {
				var channel = inOutList[arguments[1]];
				var input = inOutList[arguments[0]];
				
				if ((channel != undefined) && (input != undefined)){
//					alert("Both channels exist, " + input.name + " & " + channel.name)
					// Both channels exist.
					input = input.ref;
					channel = channel.ref;
	
//					alert("added channel to channel")
					
					input.addOutput(channel);
//					alert("added output")
					channel.addInput(input);
//					alert("valor propagado a "+ channel.getName()+ " es "+channel.getValue());
					return 1;
				}						
			}
		}
		
		Wiring.prototype.addChannelOutput = function (){
			if (arguments.length == 3){
		//		Wiring.prototype.addChannelOutput = function (idGadgetId, outputName, channelName) {
				var channel = inOutList[arguments[2]];
				var gadget = iGadgetList[arguments[0]];
	
				if ((channel != undefined) && (gadget != undefined)){
					// The channel and the gadget selected exist.
					var list = gadget.list;
					// Find the EVENT in the gadget which name is channelName
					for (var i = 0; i < list.length; i++){
						if ((list[i].name == arguments[1]) && (list[i].aspect == "SLOT")){
							list = list[i].ref;
							// Now the variable list has the 's reference.
							break;
						}
					}
					
					// Necesitamos realizar la conexion de ambos lados, una del canal al out, y otra del out al canal
					list.addInput(channel.ref);
					channel.ref.addOutput(list);
//					alert("valor en el slot " + list.getName()+" es " + list.getValue());
					return 1;
				}			
			}
			if (arguments.length == 2){
			//		Wiring.prototype.addChannelOutput = function (outputName, channelName) {
				var channel = inOutList[arguments[1]];
				var output = inOutList[arguments[0]];
				
				if ((channel != undefined) && (output != undefined)){
					// Both channels exist.
					
					channel.ref.addInput(output.ref);
					output.ref.addOutput(channel.ref);
//					alert("valor en el canal final " + output.ref.getValue());
					return 1;
				}	
			}
		}
		Wiring.prototype.removeChannelInput = function () {
			//Wiring.prototype.removeChannelInput = function (idGadgetId, inputName, channelName) {
			if (arguments.length == 3){
				var channel = inOutList[arguments[2]];
				var gadget = iGadgetList[arguments[0]];
	
				if ((channel != undefined) && (gadget != undefined)){
					// The channel and the gadget selected exist.
					var list = gadget.list;
					
					// Find the EVENT in the gadget which name is channelName
					for (var i = 0; i < list.length; i++){
						if ((list[i].name == arguments[1]) && (list[i].aspect == "EVENT")){
							list = list[i].ref;
							// Now the variable list has the event's reference.
							break;
						}
					}
					
					// Necesitamos realizar la desconexion de ambos lados, una del canal al out, y otra del out al canal
					list.removeOutput(channel.ref);
					channel.ref.removeInput(list);
					return 1;
				}			
				
			}
			if (arguments.length == 2){		
			//Wiring.prototype.removeChannelInput = function (inputName, channelName) {
				var channel = inOutList[arguments[1]];
				var input = inOutList[arguments[0]];
				
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
				var channel = inOutList[arguments[2]];
				var gadget = iGadgetList[arguments[0]];
	
				if ((channel != undefined) && (gadget != undefined)){
					// The channel and the gadget selected exist.
					var list = gadget.list;
					
					// Find the EVENT in the gadget which name is channelName
					for (var i = 0; i < list.length; i++){
						if ((list[i].name == arguments[1]) && (list[i].aspect == "SLOT")){
							list = list[i].ref;
							// Now the variable list has the event's reference.
							break;
						}
					}
					
					// Necesitamos realizar la conexion de ambos lados, una del canal al out, y otra del out al canal
					list.removeInput(channel.ref);
					channel.ref.removeOutput(list);
					return 1;
				}			
				
			}
			if (arguments.length == 2){
			//Wiring.prototype.removeChannelOutput = function (outputName, channelName) {
				var channel = inOutList[arguments[1]];
				var output = inOutList[arguments[0]];
				
				if ((channel != undefined) && (output != undefined)){
					// Both channels exist.
					
					output.ref.removeOutput(channel.ref);
					channel.ref.removeInput(output.ref);
					return 1;
				}		
			}
		}
	}
	
	
	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new Wiring();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();