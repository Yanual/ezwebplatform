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
		/*
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		loadWiring = function (transport) {
			// JSON-coded iGadget-variable mapping
			var response = transport.responseText;
			var tempList = eval ('(' + response + ')');

			var gadgets = tempList.iGadgetList;
			var inOuts = tempList.inOutList;


			// Constructing the structure
			
			var objVars = [];
			var id = -1;
			var rawVars = null;
			var rawVar = null;
			
			for (i = 0; i < gadgets.length; i++) {
				id = tempList[i].id;
				rawVars = tempList[i].variables;
				
				for (j = 0; j<rawVars.length; j++) {
					rawVar = rawVars[j];
					
					switch (rawVar.aspect) {
						case Variable.prototype.PROPERTY:
						case Variable.prototype.EVENT:
							objVars[rawVar.name] = new RWVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
						case Variable.prototype.SLOT:
						case Variable.prototype.USER_PREF:
							objVars[rawVar.name] = new RVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
					}
				}
				
				iGadgets[id] = objVars;
			}

			for (i = 0; i < inOuts.length; i++) {
				id = tempList[i].id;
				rawVars = tempList[i].variables;
				
				for (j = 0; j<rawVars.length; j++) {
					rawVar = rawVars[j];
					
					switch (rawVar.aspect) {
						case Variable.prototype.PROnautiPERTY:
						case Variable.prototype.EVENT:
							objVars[rawVar.name] = new RWVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
						case Variable.prototype.SLOT:
						case Variable.prototype.USER_PREF:
							objVars[rawVar.name] = new RVariable(id, rawVar.name, rawVar.aspect, rawVar.value);
							break;
					}
				}
				
				iGadgets[id] = objVars;
			}
			
			alert(iGadgets);
		}
		
		onError = function (transport) {
			// JSON-coded iGadget-variable mapping
			alert("error wiring GET");
			
			// Procesamiento
		}
		*/
		// *****************
		//  PRIVATE METHODS
		// *****************
		
		
		var iGadgetList = new Hash();
		var inOutList = new Hash();

		
		// ****************
		// PUBLIC METHODS
		// ****************
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
							item["ref"] = new In(item.name);
							itemList.push(item);
					
							break;
						case "SLOT": 
							item["aspect"] = "SLOT";
							item["ref"] = new Out(item["name"]);
							itemList.push(item);		
								
							break;
						default: 
							break;
					}
				}
				
				gadget["list"] = itemList;
				iGadgetList[iGadgetId] = gadget;
				// Insertar en los eventos y los slots las variables del template
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
					alert("Elimino conexiones de "+list[i].ref.name);
				}
				iGadgetList.remove(iGadgetId)
				return 0;
			}
			else{
				alert("la instancia no existe")
				return 1;
			}
		}
		
		Wiring.prototype.createChannel = function (channelName){
			var channel = new Object();
			
			if (inOutList[channelName] == undefined){
				channel["name"] = channelName;

				channel["ref"] = new InOut(channelName);
				inOutList[channelName] = channel;
				alert("El canal no existe")
				return 0;
			}
			else{
				alert("El canal existe")
				return -1;
			}

		}
		
		Wiring.prototype.removeChannel = function (channelName){
			var channel = inOutList[channelName];

			if (channel != undefined){
				// The selected channel exists
				channel.ref.clear();
				inOutList.remove(channelName);
				alert("El canal ha sido borrado")
				return 0;
			}
			else {
				alert("El canal no existe")
				return 1;
			}
		}
		
		Wiring.prototype.viewValue = function (channelName){
			// this method returns the actual value of the channel if it exits, if doesn't exists returns -1
			// ***********************
			var channel = inOutList[channelName];
			
			if (channel != undefined){
			    alert("El nombre del canal es " + channelName);
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
				alert("no existe el gadget");
				return -1;
			}
		}
		 
		Wiring.prototype.addChannelInput = function (idGadgetId, inputName, channelName) {
			var channel = inOutList[channelName];
			var gadget = iGadgetList[iGadgetId];

			if ((channel != undefined) && (gadget != undefined)){
				// The channel and the gadget selected exist.
				var list = gadget.list;
				
				// Find the EVENT in the gadget which name is channelName
				for (var i = 0; i < list.length; i++){
					if ((list[i].name == inputName) && (list[i].aspect == "EVENT")){
						list = list[i].ref;
						// Now the variable list has the event's reference.
						break;
					}
				}
				
				// Necesitamos realizar la conexion de ambos lados, una del canal al out, y otra del out al canal
				list.addOutput(channel.ref);
				channel.ref.addInput(list);
				return 1;
			}			
		}
		
		Wiring.prototype.addChannelInput = function (inputName, channelName) {
			var channel = inOutList[channelName];
			var input = inOutList[inputName];
			
			if ((channel != undefined) && (input != undefined)){
				alert("Existen ambos canales, " + input.name + " & " + channelName)
				// Both channels exist.
				input = input.ref;
				channel = channel.ref;
				
			//	input.addOutput(channel.ref);
			//	channel.addInput(input.ref);
				alert(input.ref.inputHash.keys());
				return 1;
			}			
		}
		
		Wiring.prototype.addChannelOutput = function (idGadgetId, outputName, channelName) {
			var channel = inOutList[channelName];
			var gadget = iGadgetList[iGadgetId];

			if ((channel != undefined) && (gadget != undefined)){
				// The channel and the gadget selected exist.
				var list = gadget.list;
				
				// Find the EVENT in the gadget which name is channelName
				for (var i = 0; i < list.length; i++){
					if ((list[i].name == outputName) && (list[i].aspect == "SLOT")){
						list = list[i].ref;
						// Now the variable list has the event's reference.
						break;
					}
				}
				
				// Necesitamos realizar la conexion de ambos lados, una del canal al out, y otra del out al canal
				list.addInput(channel.ref);
				channel.ref.addOutput(list);
				return 1;
			}			
		}
		
		Wiring.prototype.addChannelOutput = function (outputName, channelName) {
			var channel = inOutList[channelName];
			var output = inOutList[outputName];
			
			if ((channel != undefined) && (output != undefined)){
				// Both channels exist.
				
				output.ref.addInput(channel.ref);
				channel.ref.addOutput(output.ref);
				return 1;
			}	
		}
		
		Wiring.prototype.removeChannelInput = function (idGadgetId, inputName, channelName) {
			var channel = inOutList[channelName];
			var gadget = iGadgetList[iGadgetId];

			if ((channel != undefined) && (gadget != undefined)){
				// The channel and the gadget selected exist.
				var list = gadget.list;
				
				// Find the EVENT in the gadget which name is channelName
				for (var i = 0; i < list.length; i++){
					if ((list[i].name == outputName) && (list[i].aspect == "EVENT")){
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
		
		Wiring.prototype.removeChannelInput = function (inputName, channelName) {
			var channel = inOutList[channelName];
			var input = inOutList[outputName];
			
			if ((channel != undefined) && (input != undefined)){
				// Both channels exist.
				
				input.ref.removeOutput(channel.ref);
				channel.ref.removeInput(input.ref);
				return 1;
			}			
		}
		
		Wiring.prototype.removeChannelOutput = function (idGadgetId, outputName, channelName) {
			var channel = inOutList[channelName];
			var gadget = iGadgetList[iGadgetId];

			if ((channel != undefined) && (gadget != undefined)){
				// The channel and the gadget selected exist.
				var list = gadget.list;
				
				// Find the EVENT in the gadget which name is channelName
				for (var i = 0; i < list.length; i++){
					if ((list[i].name == outputName) && (list[i].aspect == "SLOT")){
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
		
		Wiring.prototype.removeChannelOutput = function (outputName, channelName) {
			var channel = inOutList[channelName];
			var output = inOutList[outputName];
			
			if ((channel != undefined) && (output != undefined)){
				// Both channels exist.
				
				output.ref.removeInput(channel.ref);
				channel.ref.removeOutput(output.ref);
				return 1;
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