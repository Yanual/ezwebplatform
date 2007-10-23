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
				inputs.inputHash = inOuts[i].inputHash;
				inputs.outputHash = inOuts[i].outputHash;
				connections.push(inputs);	
			}
			// reconnecting every thing at this moment
			for (var r = 0; r < connections.length; r++){
				var item = connections[r];
				for (var i = 0; i < item.inputHash.length; i++){
					var input = item.inputHash[i];		
					if (input["id"] == "null"){
						//the input is a channel
						this.addChannelInput(input["name"],item["from"]);
					}
					else{
						// the input is an event
						this.addChannelInput(input["id"],input["name"],item["from"]);
					}
				}
				for (var j = 0; j < item.outputHash.length; j++){
					var output = item.outputHash[j];
					if (output["id"] == "null"){
						//the output is a channel
						this.addChannelOutput(output["name"],item["from"]);
					}
					else{
						//the output is a slot
						this.addChannelOutput(output["id"], output["name"],item["from"]);
					}
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
		persistenceEngine.send_get('../wiring.json', this, loadWiring, onError);
		
		// ****************
		// PUBLIC METHODS
		// this method is used in the first version for painting the connections for the user.
		Wiring.prototype.getGadgetsId = function (){
			//alert(iGadgetList.keys());
			return iGadgetList.keys();
		}
		Wiring.prototype.getInOutId = function (){
			return inOutList.keys();
		}
		
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
			
			if (arguments.length == 2){
				if (iGadgetList[iGadgetId] == undefined) {
		//			var events = template.getEventsId();
		//			var slots = template.getSlotsId();
					var events = template["events"];
					var slots = template["slots"];	
						
					var itemList = [];
					gadget["id"] = iGadgetId;
			
					// The instance of the iGadget doesn't exist.
					for (var i = 0; i < events.length; i++){
						var item = new Object();
						item["name"] = events[i].name;
						item["aspect"] = "EVENT";
						item["ref"] = new Event(iGadgetId, item["name"]);
						itemList.push(item);
								
					}
					for (var j = 0; j < slots.length; j++){
						var item = new Object();
						item["name"] = slots[j].name;
						item["aspect"] = "SLOT";
						item["ref"] = new Slot(iGadgetId, item["name"]);
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

				list = arguments[0].list;
				for (var j = 0; j < list.length; j++){
					var connectable = new Object();

					connectable.name = list[j].name;
					connectable.aspect = list[j].aspect;
					switch (connectable.aspect) {
						case "EVENT":
							connectable.ref = new Event(null, null, list[j]);							
							break;
						case "SLOT":
							connectable.ref = new Slot(null, null, list[j]);												
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
				if (inOutList[newChannel] == undefined){
					channel["name"] = newChannel;
	
					channel["ref"] = new InOut(null, newChannel);
					inOutList[newChannel] = channel;
					return 0;
				}
				else{
					alert("channel already exist")
					return -1;
				}
			}
			else {
				// this way is ejecuted when channels are added from persistence.
				channel["name"] = newChannel["name"];
				channel["ref"] = new InOut(null, null, newChannel);
				inOutList[newChannel["name"]] = channel;
				return 0;	
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
					return 1;
				}			
			}
			else if (arguments.length == 2){
		    // Wiring.prototype.addChannelInput = function (inputName, channelName) {
				var channel = inOutList[arguments[1]];
				var input = inOutList[arguments[0]];
				
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


/*		CODIGO A ELIMINAR (L32)
	 			var gadget = new Object();
				gadget["list"] = [];
				gadget["id"] = gadgets[i]["id"];

				list = gadgets[i].list;
				alert("el gadget es " + gadget["id"]);
				for (var j = 0; j < list.length; j++){
					var connectable = new Object();

					connectable.name = list[j].name;
					connectable.aspect = list[j].aspect;
					
					switch (connectable.aspect) {
						case "EVENT":
							connectable.ref = new Event(null, null, list[j]);							
							break;
						case "SLOT":
							connectable.ref = new Slot(null, null, list[j]);												
							break;
					}
					gadget["list"].push(connectable);
				}
				alert(Object.toJSON(gadget["list"]));
			
				
				iGadgetList[gadget["id"]] = gadget;
				alert("creado gadget: " + Object.toJSON(iGadgetList[gadget.id]))
		*/
