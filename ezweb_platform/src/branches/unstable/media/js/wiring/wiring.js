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
			var channel = this._insertChannel(currentInout.name, channelVar);

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
			OpManagerFactory.getInstance().log(msg);
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
			    var connectable = new wEvent(variable, variable.type, variable.friend_code, connectableId);
			    
			    gadgetEntry.events[variable.name] = connectable;
			    gadgetEntry.connectables["event_" + variable.name] = connectable;
			}
			
			if (variable.aspect == "SLOT" && variableData.connectable) {
			    var connectableId = variableData.connectable.id;
			    var connectable = new wSlot(variable, variable.type, variable.friend_code, connectableId);

			    gadgetEntry.slots[variable.name] = connectable;
			    gadgetEntry.connectables["slot_" + variable.name] = connectable;
			}
			
			this.iGadgets[iGadgetId] = gadgetEntry;
		}

	}

	// TODO
	Wiring.prototype.removeInstance = function (iGadgetId) {
		var entry = this.iGadgets[iGadgetId];

		if (!entry) {
			var msg = gettext("Wiring error: Trying to remove an inexistant igadget.");
			OpManagerFactory.getInstance().log(msg);
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
			OpManagerFactory.getInstance().log(msg);
			return;
		}

		return iGadgetEntry.connectables.values();
	}

	Wiring.prototype.getChannels = function() {
		return this.channels.values();
	}

	Wiring.prototype._insertChannel = function (channelName, channelVar) {
		if (this.channels[channelName] != undefined) {
			var msg = gettext("Error creating channel %(channelName)s: Channel already exists");
			msg = interpolate(msg, {channelName: channelName});
			OpManagerFactory.getInstance().log(msg);
			return;
		}		

		var channel = new wChannel(channelVar, channelName);
		this.channels[channelName] = channel;
			
		return channel;
	}

	Wiring.prototype.createChannel = function (channelName) {
		var channelVar = this.workspace.getVarManager().createWorkspaceVariable(channelName);

		return this._insertChannel(channelName, channelVar);
	}

	Wiring.prototype.removeChannel = function (channelName) {
		var channel = this.channels[channelName];

		if (channel == undefined) {
			var msg = gettext("Error removing channel %(channelName)s: Channel does not exists");
			msg = interpolate(msg, {channelName: channelName});
			OpManagerFactory.getInstance().log(msg);
			return;
		}

		channel.fullDisconnect();
		
		this.channels.remove(channelName);
	}

	Wiring.prototype.serializationSuccess = function (response){

	}

	Wiring.prototype.serializationError = function (response) {
		var p = response.responseText;
		msg = interpolate(gettext("Error : %(errorMsg)s."), {errorMsg: p}, true);
		OpManagerFactory.getInstance().log(msg);
	}

	Wiring.prototype.serialize = function () {
		var gadgets = [], inouts = [];
		var gadgetKeys = this.iGadgets.keys();
		var inOutKeys = this.copyList.keys();


		// Channels
		for (var i = 0; i < this.channels.length; t++) {
			var channel = this.channels[inOutKeys[i]];
			inouts[i] = new Object();
			inouts[i].value = channel.getValue();
			inouts[i].name = this.channels[inOutKeys[i]].getName();

			inouts[i].inputs = [];

			for (var j = 0; v < this.copyList[inOutKeys[t]].ref.inputList.length; v++) {
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

		var json = {'inOutList' : inouts};
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
	
	// copy is the list that is used for making new connections or disconnections with the interface.
	this.copyList = new Hash();

	this.loadWiring(workSpaceGlobalInfo);
}

