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
		var ws_vars_info = workSpace['workSpaceVariableList'];
		var tabs = workSpace['tabList'];

		for (var i = 0; i < tabs.length; i++) {
			this.processTab(tabs[i]);
		}

		// Load WorkSpace variables
		var varManager = this.workspace.getVarManager();

		for (var i = 0; i < ws_vars_info.length; i++) {
			var current_var_info = ws_vars_info[i];
			
			var variable = varManager.getWorkspaceVariableById(current_var_info.id);
			
			if (current_var_info.aspect == "TAB" && current_var_info.connectable) {
				var connectableId = current_var_info.connectable.id;
				var tab_id = current_var_info.tab_id;
				
				var tab = this.workspace.getTab(tab_id);
				
			    var connectable = new wTab(variable, current_var_info.name, tab, connectableId);
			    
			    tab.connectable = connectable;
			}
			
			if (current_var_info.aspect == "CHANNEL" && current_var_info.connectable) {
				var connectableId = current_var_info.connectable.id;
			    var channel = new wChannel(variable, current_var_info.name, connectableId, false);
			    
			    // Connecting channel input		
			    var connectable_ins = current_var_info.connectable.ins;
			    for (var j = 0; j < connectable_ins.length; j++) {
			    	// Input can be: {wEvent, wChannel}
			    	var current_input = connectable_ins[j];
			    	
			    	var in_connectable = varManager.getVariableById(current_input.id).getConnectable();

			    	channel.connect(in_connectable);
			    }
			    
			    // Connecting channel output  
			    var connectable_outs = current_var_info.connectable.outs;
			    for (var j = 0; j < connectable_outs.length; j++) {
			    	// Outputs can be: {wSlot, wTab}
			    	var current_output = connectable_outs[j];
			    	
			    	var out_connectable = varManager.getVariableById(current_output.id).getConnectable();

			    	channel.connect(out_connectable);
			    }

				// Save it on the channel list
			    this.channels[current_var_info.name] = channel;
			}
			
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

		// IGadget variables
		for (var i = 0; i < variables.length; i++) {
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

	Wiring.prototype._insertChannel = function (channelName, channelVar, id, provisional_id) {
		if (this.channels[channelName] != undefined) {
			var msg = gettext("Error creating channel %(channelName)s: Channel already exists");
			msg = interpolate(msg, {channelName: channelName});
			LogManagerFactory.getInstance().log(msg);
			return;
		}		
		
		if (!provisional_id) 
			provisional_id=false;

		var channel = new wChannel(channelVar, channelName, id, provisional_id);
		this.channels[channelName] = channel;
					
		return channel;
	}

	Wiring.prototype.createChannel = function (channelName, channelId) {
		var channelVar = this.workspace.getVarManager().createWorkspaceVariable(channelName);

		return this._insertChannel(channelName, channelVar, channelId, true);
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
		
		this.channelForRemoving = [];
	}

	Wiring.prototype.serializationError = function (response) {
		var p = response.responseText;
		msg = interpolate(gettext("Error : %(errorMsg)s."), {errorMsg: p}, true);
		LogManagerFactory.getInstance().log(msg);
	}
	
	Wiring.prototype.serialize = function () {
		var gadgetKeys = this.iGadgets.keys();
		var serialized_channels = [];
		
		// Channels
		var channel_keys = this.channels.keys();
		for (var i = 0; i < channel_keys.length; i++) {
			var key = channel_keys[i];
			var channel = this.channels[key];
			
			var serialized_channel = new Object();
			
			// Filling channel info!!!
			serialized_channel['id'] = channel.id; 
			serialized_channel['name'] = channel._name;
			serialized_channel['type'] = channel._type;
			serialized_channel['friend_code'] = channel._friendCode;
			serialized_channel['var_id'] = channel.variable.id;
			serialized_channel['provisional_id'] = channel.provisional_id;
			
			serialized_channel.ins = [];
			                              
			var serialized_inputs = serialized_channel.ins;

			var input_keys = channel.inputs.keys()
			for (var j = 0; j < input_keys.length; j++) {
				var key = input_keys[j];
				var input = channel.inputs[key];
				
				var serialized_input = new Object();
				
				serialized_input['id'] = input.id;
				serialized_input['connectable_type'] = input.connectableType;
				
				serialized_inputs.push(serialized_input);
			}

			serialized_channel.outs = [];
			
			var serialized_outputs = serialized_channel.outs;
			
			var output_keys = channel.outputs.keys()
			for (var j = 0; j < output_keys.length; j++) {
				var key = output_keys[j];
				var output = channel.outputs[key];
				
				var serialized_output = new Object();
				
				serialized_output['id'] = output.id;
				serialized_output['connectable_type'] = output.connectableType;
				
				serialized_outputs.push(serialized_output);
			}
			
			serialized_channels.push(serialized_channel);
		}
		
		//Channels for adding

		var json = {'inOutList' : serialized_channels};
		
		json['channelsForRemoving'] = this.channelsForRemoving;
		
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
	
	
	this.loadWiring(workSpaceGlobalInfo);
}

