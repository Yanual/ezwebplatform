/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2008 Telefónica Investigación y Desarrollo 
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


function Wiring (workspace, workSpaceGlobalInfo) {

	// *****************
	//  PRIVATE METHODS
	// *****************

	// ****************
	// PUBLIC METHODS
	// ****************
	
	Wiring.prototype.getConnectableId = function (variables, name, igadgetId) {
		for (i=0; i<variables.length; i++) {
			var variable = variables[i];
			
			if (variable.name = name && variable.igadgetId == igadgetId) {
				return variable.connectable.id;
			}
		}
	}

	Wiring.prototype.processTab = function (tabData) {
		var igadgets = tabData['igadgetList'];
		var dragboard = this.workspace.getTab(tabData['id']).getDragboard();

		for (var i = 0; i < igadgets.length; i++) {
			this.addInstance(dragboard.getIGadget(igadgets[i].id), igadgets[i].variables);
		}
	}

	Wiring.prototype.loadWiring = function (workSpaceData) {
		var workSpace = workSpaceData['workspace'];
		var inOuts = workSpace['wiringInfo'];
		var tabs = workSpace['tabList'];

		for (var i = 0; i < tabs.length; i++) {
			this.processTab(tabs[i]);
		}

		// Load InOuts
		var varManager = this.workspace.getVarManager();

		for (var i = 0; i < inOuts.length; i++) {
			var currentInout = inOuts[i];
			// TODO Check inout type, for now we can assumme that it is "channel" always.
			var channelVar = varManager.getWorkspaceVariableById(currentInout.variableId);
			var channel = this._insertChannel(currentInout.name, channelVar, currentInout.id);

			for (var j = 0; j < currentInout.inputs.length; j++) {
				var input = currentInout.inputs[j];

				switch (input.type) {
				case "EVEN":
					input = varManager.getVariableById(input.varId).getAssignedEvent();
					break;
				case "CHANNEL":
					input = this.channels[input.name];
					break;
				default:
					// TODO log
					continue;
				}

				// Connect the input to the channel
				input.connect(channel);
			}

			for (var j = 0; j < inOuts[i].outputs.length; j++) {
				// outputs are always of slot type, because when an inout is used as
				// input, they are automatically connected to the output of that inout.
				// So here, we only see slots as outputs
				var output = currentInout.outputs[j];

				output = varManager.getVariableById(output.varId).getAssignedSlot();

				// Connect the output to the channel
				channel.connect(output);
			}

			// Save it on the channel list
			this.channels[currentInout.name] = channel;
		}

		this.loaded = true;
	}

	Wiring.prototype.addInstance = function (igadget, variables) {
		var varManager = this.workspace.getVarManager();
		var gadgetEntry = new Object();
		var iGadgetId = igadget.getId();

		if (this.iGadgets[iGadgetId]) {
			var msg = gettext("Error adding iGadget into the wiring module of the workspace: Gadget instance already exists.");
			LogManagerFactory.getInstance().log(msg);
		}

		gadgetEntry.events = new Hash();
		gadgetEntry.slots = new Hash();
		gadgetEntry.connectables = new Hash();

		var varManager = this.workspace.getVarManager();
		var i;

		for (i = 0; i < variables.length; i++) {
			var variableData = variables[i];
			var variable = varManager.getVariableByName(variableData.igadgetId, variableData.name);
			
			if (variable.aspect == "EVEN" && variableData.connectable) {
				var connectableId = variableData.connectable.id;
			    var connectable = new wEvent(variable, variableData.type, variableData.friend_code, connectableId);
			    
			    gadgetEntry.events[variableData.name] = connectable;
			    gadgetEntry.connectables["event_" + variableData.name] = connectable;
			}
			
			if (variable.aspect == "SLOT" && variableData.connectable) {
			    var connectableId = variableData.connectable.id;
			    var connectable = new wSlot(variable, variableData.type, variableData.friend_code, connectableId);

			    gadgetEntry.slots[variableData.name] = connectable;
			    gadgetEntry.connectables["slot_" + variableData.name] = connectable;
			}
			
			this.iGadgets[iGadgetId] = gadgetEntry;
		}

	}

	// TODO
	Wiring.prototype.removeInstance = function (iGadgetId) {
		var entry = this.iGadgets[iGadgetId];

		if (!entry) {
			var msg = gettext("Wiring error: Trying to remove an inexistant igadget.");
			LogManagerFactory.getInstance().log(msg);
			return;
		}
		
		for (var i = 0; i < entry.events; i++)
			entry.events[i].fullDisconnect();
		
		for (var i = 0; i < entry.slots; i++)
			entry.slots[i].fullDisconnect();

		this.iGadgets.remove(iGadgetId)
	}

	Wiring.prototype.getIGadgetConnectables = function(iGadget) {
		var iGadgetEntry = this.iGadgets[iGadget.id];

		if (iGadgetEntry == null) {
			var msg = gettext("Wiring error: Trying to retreive the connectables of an inexistant igadget.");
			LogManagerFactory.getInstance().log(msg);
			return;
		}

		return iGadgetEntry.connectables.values();
	}

	Wiring.prototype.getChannels = function() {
		return this.channels.values();
	}

	Wiring.prototype._insertChannel = function (channelName, channelVar, id) {
		if (this.channels[channelName] != undefined) {
			var msg = gettext("Error creating channel %(channelName)s: Channel already exists");
			msg = interpolate(msg, {channelName: channelName});
			LogManagerFactory.getInstance().log(msg);
			return;
		}		

		var channel = new wChannel(channelVar, channelName, id);
		this.channels[channelName] = channel;
			
		return channel;
	}

	Wiring.prototype.createChannel = function (channelName, channelId) {
		var channelVar = this.workspace.getVarManager().createWorkspaceVariable(channelName);
		
		this.channelsForAdding.push(channelId);

		return this._insertChannel(channelName, channelVar, channelId);
	}

	Wiring.prototype.removeChannel = function (channelName) {
		var channel = this.channels[channelName];

		if (channel == undefined) {
			var msg = gettext("Error removing channel %(channelName)s: Channel does not exists");
			msg = interpolate(msg, {channelName: channelName});
			LogManagerFactory.getInstance().log(msg);
			return;
		}

		channel.fullDisconnect();
		
		this.channelsForRemoving.push(channel.id);
		
		this.channels.remove(channelName);
	}

	Wiring.prototype.serializationSuccess = function (response){
		delete this.channelsForRemoving;
		delete this.channelsForAdding;
		
		this.channelForRemoving = [];
		this.channelForAdding = [];
	}

	Wiring.prototype.serializationError = function (response) {
		var p = response.responseText;
		msg = interpolate(gettext("Error : %(errorMsg)s."), {errorMsg: p}, true);
		LogManagerFactory.getInstance().log(msg);
	}

	Wiring.prototype.serialize = function () {
		var gadgetKeys = this.iGadgets.keys();
		var serialized_channels = new Object();
		
		// Channels
		var channel_keys = this.channels.keys();
		for (var i = 0; i < channel_keys.length; i++) {
			var key = channel_keys[i];
			var channel = this.channels[key];
			
//			serialized_channels[i] = new Object;
//			// Filling channel info!!!
//			
//			
//			serialized_channels[i].ins = []
//
//			var input_keys = channel.inputs.keys()
//			for (var j = 0; j < input_keys.length; j++) {
//				var key = input_keys[j];
//				var input = channel.inputs[key];
//				
//				
//			}
//
//			serialized_channels[i].outs = [];
//			
//			var output_keys = channel.outputs.keys()
//			for (var j = 0; j < output_keys.length; j++) {
//				var key = input_keys[j];
//				var output = channel.inputs[key];
//				
//				
//			}
		}
		
		//Channels for adding
		
		//Channels for removing

		var json = {'inOutList' : serialized_channels};
		var param = {'json': Object.toJSON(json)};
		
		var url = URIs.GET_POST_WIRING.evaluate({'id': this.workspace.workSpaceState.id});
		
		PersistenceEngineFactory.getInstance().send_post(url, param, this, this.serializationSuccess, this.serializationError); 
	}

	// ***************
	// CONSTRUCTOR
	// ***************
	this.workspace = workspace;

	this.loaded = false;
	this.persistenceEngine = PersistenceEngineFactory.getInstance();
	this.iGadgets = new Hash();
	this.channels = new Hash();
	this.channelsForRemoving = [];
	this.channelsForAdding = [];
	
	
	this.loadWiring(workSpaceGlobalInfo);
}

