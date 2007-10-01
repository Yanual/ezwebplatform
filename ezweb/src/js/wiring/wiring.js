/**
 * @author rnogal
 */
<script src = "/lib/js/prototype.js" type = "text/javascript"></script>


var Wiring = Class.create()

Wiring.prototype = {
	// this method initialize the object.
	initialize: function(){
			this.iGadgetList = new Hash();
			this.inOutList = new Hash();
			this.InList = new Hash();
			this.outList = new Hash();
			this. himself = this;
			alert("Creado");
	},
	
	getInstance: function (){
		// This methed garantize the singleton pattern
		if (this.himself == undefined){
			this.himself = this;
			alert("Voy a crear");
			return new Wiring();
		}else{
			alert("Existe ya")
			return this;
		}
	},
	
	addInstance: function (id, template){
		// this method is used for adding an instance of a Gadget
				
	},
	
	removeInstance: function(id){
		// this method is used for removing an instance of a Gadget
	},
	
	registerEvent: function(id, event){
		// this method is used for creating a variable of an Event
	},
	
	sendEvent: function(id, event, value){
		// this method is used for sending an event.
	},
	
	registerSlot: function(id, slot){
		// this method is used for creating a variable of a Slot	
	},
	
	connectSlot: function(id, slot, channel){
		// this method is used for connecting a slot to the channel		
		
	},
	
	disconnectSlot: function(id, slot, channel){
		// this method is used for connecting a slot from the specified channel
	},
	
	connectEvent: function(id, event, channel){
		// this method is used for connecting an event to the channel		
	},
	
	disconnectEvent: function(id, event, channel){
		// this method is used for disconnecting an event from the specified channel
	},
	
	createChannel: function(name){
		// this method is used for creating a channel
	},

	removeChannel: function(name){
		// this method is used for deleting an existing channel
	},
	
	viewValue: function(name){
		// this method is used for showing the actual value of a channel
	},
	
	connectChannel: function(channelIn, channelOut){
		// this method is used for coneccting two channels. We specify
		// both extremes of the connection
		
	},
	
	disconnectChannel: function(channelIn, channelOut){
		// this method is used for disconeccting two channels. We specify
		// both extremes of the connection
	}
 }