/**
 * @author rnogal
 */

<script src = "../persistenceEngine/PersistenceEngine.js" type = "text/javascript"></script>;
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
			for (var i = 0; i < gadgets.length; i++) {
				var gadget = new Object();
				gadget.id = gadgets[i].id;

				list = gadgets[i].list;
				
				for (var j = 0; j < list.length; j++) {
					var connectable = new Object();

					connectable.name = list[j].name;
					connectable.aspect = list[j].aspect;
					
					switch (connectable.aspect) {
						case Variable.prototype.EVENT:
							connectable.ref = new Event(list[j]);							
							break;
						case Variable.prototype.SLOT:
							connectable.ref = new Slot(list[j]);												
							break;
					}
					gadget["list"].push(connectable);
				}
				iGadgetList.id = gadget;
			}
			// at this moment we have  all the iGadgets retaured in the system.
			
			// we use this variable to insert all the connections and then serve them all.
			var connections = [];
		
			for (var i = 0; i < inOuts.length; i++) {
				var element = new Object();
				// creating the object inOut
				element.name = inOuts[i].name;
				element.ref = new Channel(inOuts[i]);
				// and inserting it in the wiring channel list
				inOutList[element.name] = element;
				
				var inputs = new Object();

				inputs.from = element.name; 
				inputs.inputHash = inOuts[i].inputputHash;
				inputs.outputHash = inOuts[i].outputHash;
				connections.push(inputs);
			}
			// reconnecting every thing at this moment
			
			for (var r = 0; r < connections.length; r++){
				var item = connections[r];
				var channel = inOutList[item.from].ref;
				
				for (var i = 0; i < item.inputHash.length; i++){
					var input = item.inputHash[i];
					
					if (input.id == null){
						input = inOutList[input.id].ref;
					}
					else{
						var gadgetlist = iGadgetList[input.id].list;
						for (var z = 0; z < gadgetlist.length; z++){
							if (gadgetlist[z].name == input.name){
								input = gadgetlist[z].ref;
								// Now the variable input has the event's reference.
								break;
							}
						}
					}
					input.addOutput(channel);
					channel.addInput(input);				 	
				}
				
				for (var j = 0; j < item.outputHash.length; j++){
					var output = item.outputHash[j];
					
					if (output.id == null){output = inOutList[output.id].ref}
					else{
						var gadgetlist = iGadgetList[output.id].list;
						for (var z = 0; z < gadgetlist.length; z++){
							if (gadgetlist[z].name == output.name){
								output = gadgetlist[z].ref;
								// Now the variable output has the slot's reference.
								break;
							}
						}
					}
					output.addInput(channel);
					channel.addOutput(output);				 	
				}		
						
			}

		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error wiring GET");
			
			// Procesamiento
		}
		
		// *****************
		//  PRIVATE METHODS
		// *****************
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
	
		var iGadgetList = new Hash();
		var inOutList = new Hash();
//		persistenceEngine.send_get('wiring.json', this, loadWiring, onError);
		
		// ****************
		// PUBLIC METHODS
		// ****************
		// this method is used in the first version for painting the connections for the user.
		Wiring.prototype.connections = function (channel) {
			var channel = inOutList[channel].ref;
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
							item["ref"] = new Event(iGadgetId, item["name"]);
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
				alert("Channel deleted")
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
					
					alert("salida: " + input.getName()+"; entrada: "+ channel.getName());
					input.addOutput(channel);
					//alert("Input es: "+input.toJSON());
					channel.addInput(input);
					//alert("Output es: "+channel.toJSON());
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
					
					output.ref.addInput(channel.ref);
					channel.ref.addOutput(output.ref);
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
					
					output.ref.removeInput(channel.ref);
					channel.ref.removeOutput(output.ref);
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