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


//////////////////////////////////////////////////////////////////////////////////////////////////
// This is the class has the common properties of every connectable object of the wiring module //
// The other connectable classes from the wiring module will inherit from this class            //
//////////////////////////////////////////////////////////////////////////////////////////////////
function wConnectable(id,name,source){
   if (source==undefined || source==null){
      // Private attributes
      this.id = id;
      this.type = null;
      this.value = null;
      this.name = name;
   }else{
      this.id = source.id;
      this.type = source.type;
      this.value = source.value;
      this.name = source.name;
   }
}
// Public methods 

wConnectable.prototype.getId = function(){
   return this.id;
}

wConnectable.prototype.setId = function(value){
   this.id=value;
}

wConnectable.prototype.getType = function(){
   return this.type;
}

wConnectable.prototype.setType = function(value){
   this.type=value;
}

wConnectable.prototype.getValue = function(){
   return this.value;
}

wConnectable.prototype.setValue = function(value){
   this.value=value;
}

wConnectable.prototype.getName = function(){
   return this.name;
}

wConnectable.prototype.clear = function(){ //this method will be overriden in each class
   null; // it does not have any connection to clear
}

wConnectable.prototype.refresh = function(){ //this method will be overriden in each class
   null;
}

wConnectable.prototype.connections = function(){ //this method will be overriden in each class
   null;
}

wConnectable.prototype.getURI = function(){ //this method will be overriden in wInOut
    var values = {'iGadgetId': this.id, 'varName': this.name};

    return URIs.GET_POST_GADGET_VARIABLE.evaluate(values);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may be placed in the middle of a connection between a In object and wOut object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function wOut(id,name,source){
   wConnectable.call(this,id,name,source);
   this.inputHash = [];
}
wOut.prototype = new wConnectable();

wOut.prototype.addInput = function(input){
   if (input instanceof wInOut){
      if (!(this.inputHash[input.getName()] instanceof wConnectable)){
         this.inputHash[input.getName()] = input;
         return 0;
      }
      return 1; // warning: the input is already connected
   }
   return -1; // error: the input is not a wInOut object
}

wOut.prototype.removeInput = function(input){
   if (input instanceof wInOut){
      if (this.inputHash[input.getName()] instanceof wConnectable){
         this.inputHash[input.getName()] = null;
         return 0;
      }
      return 1; // warning: the input does not exist
   }
   return -1; // error: the input is not a wInOut object
}

wOut.prototype.setValue = function(value){
   this.value=value;

   var wiring = WiringFactory.getInstance();

   var varInfo = new Object();

   varInfo.iGadget = this.id;
   varInfo.name = this.name;
   varInfo.value = value;

   wiring.markVariableAsModified(varInfo);

   return "";
}

wOut.prototype.clear = function(){
   for (i in this.inputHash){
      if (this.inputHash[i] instanceof wInOut){
         this.inputHash[i].removeOutput(this);
      }
   }
}

wOut.prototype.connections = function(){
   var result = [];
   for (i in this.inputHash){
      if (this.inputHash[i] instanceof wInOut){
         result.push(this.inputHash[i].getName());
      }
   }
   return result;
}

wOut.prototype.refresh = function (channelRef){
	this.inputHash[channelRef.getName()] = channelRef;
//	this.setValue(channelRef.getValue());
}

wOut.prototype.eraseConnections = function (){
	this.inputHash = [];
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may initialize one transmission through the wiring module //
////////////////////////////////////////////////////////////////////////////////////////////////////////
function wIn(id,name,source){
   wConnectable.call(this,id,name,source);
   this.outputHash = [];
}
wIn.prototype = new wConnectable();

wIn.prototype.addOutput = function(output){
   if (output instanceof wInOut){
      if (!(this.outputHash[output.getName()] instanceof wInOut)){
         if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
            this.outputHash[output.getName()] = output;
            //output.setValue(this.value);
            return 0;
         } else if (output.getType() == null){
            //output.setValue(this.value);
            this.outputHash[output.getName()] = output;
            //output.setTypeForward(this.type);
            return 0;
         } else if (this.type == null){ // this should not happen y the final version
            this.type = output.getType();
            this.outputHash[output.getName()] = output;
            return 0;
         } else {
            return -2; // error: the types are incompatible
         }
      }
      return 1; // warning: the input is already connected
   }
   return -1; // error: the input is not a wInOut object
}

wIn.prototype.removeOutput = function(output){
   if (output instanceof wInOut){
      if (this.outputHash[output.getName()] instanceof wInOut){
         this.outputHash[output.getName()] = null;
         return 0;
      }
      return 1; // warning: the input does not exist
   }
   return -1; // error: the input is not a wInOut object
}

wIn.prototype.setValue = function(value){
   this.value = value;
   var channelList = ""
   var changes ="{\"value\":\""+this.value+"\",\"channels\":[";
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof wInOut){
         channelList = this.outputHash[i].setValue(value) + channelList;
		 if (this.outputHash[i]==null){
		 	this.outputHash[i].setTypeForward(this.type);
		 }
      }
   }
   if (channelList != ""){
      changes += channelList.slice(1);
   } else {
      changes += channelList;
   }
   return changes + "]}"
}

wIn.prototype.clear = function(){
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof wInOut){
         this.outputHash[i].removeInput(this);
      }
   }
}

wIn.prototype.refresh = function (channelRef){
	this.outputHash[channelRef.getName()] = channelRef;
	channelRef.setValue(this.value);
}

wIn.prototype.connections = function(){
   var result = [];
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof wInOut){
         result.push(this.outputHash[i].getName());
      }
   }
   return result;
}

wIn.prototype.eraseConnections = function (){
	this.outputHash = [];
}

/////////////////////////////////////////////////////////////////////
// This class represents every object which may transmit some data //
/////////////////////////////////////////////////////////////////////
function wInOut(id,name,source){
   wConnectable.call(this,id,name,source);
   this.inputList = [];
   this.outputList = [];
   this.inputCounter = 0;
   this.outputCounter = 0;
}
wInOut.prototype = new wConnectable();

wInOut.prototype.setTypeForward = function(type){
   this.type = type;
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof wInOut){
         this.outputList[i].setTypeForward(type);
      }
   }
}


wInOut.prototype.setTypeBack = function(type){
   this.type = type;
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof wInOut){
         this.inputList[i].setTypeBack(type);
      }
   }
}

wInOut.prototype.searchCycle = function(name){
    if (this.name == name) {
        return true;
    } else {
        var cycle = false;
        var i = 0;
        while (i<this.outputCounter && !cycle){
           if (this.outputList[i] instanceof wInOut){
              cycle = cycle || this.outputList[i].searchCycle(name);
           }
           i++;
        }
        return cycle;
    }
}

wInOut.prototype.addOutput = function(output){
   if (!(output instanceof wIn)){
      if (output instanceof wOut || !output.searchCycle(this.name)){
         var i = 0;
         var located = 0;
         while (i<this.outputCounter && located == 0){
            if (this.outputList[i].getId() == output.getId() && this.outputList[i].getName() == output.getName()){
               located = 1; // warning: the output is already connected
            }
            i++;
         }
         if (located != 1){
            if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
               this.outputList[this.outputCounter++]=output;
               return 0;
            } else if (output.getType() == null){
               output.setValue(this.value);
               this.outputList[this.outputCounter++]=output;
               //if (output instanceof wInOut){
                 // output.setTypeForward(this.type);
               //}
               return 0;
            } else if (this.type == null){ // in the final version this case should not happen
               //this.setTypeBack(output.getType());
               this.outputList[this.outputCounter++]=output;
               return 0;
            } else {
               return -2; // error: the types are incompatible
            }
         } else {
            return 1; // warning: the input is already connected
         }
      } else {
         return 2; // warning: the output would create a loop
      }
   }else {
      return -1; // error: the output is an wIn object
   }
}

wInOut.prototype.removeOutput = function(output){
   if (!(output instanceof wIn)){
      var i = 0;
      var located = false;
      var position = 0;
      while (i<this.outputCounter && !located){
         if (this.outputList[i].getId() == output.getId() && this.outputList[i].getName() == output.getName()){
            located = true; // warning: the output is already connected
            position = i;
         }
         i++;
      }
      if (located){
         this.outputList.splice(position,1);
         this.outputCounter--;
         if (this.outputCounter == 0 && this.inputCounter == 0) {
            this.type = null;
            this.value = null;
         }
         return 0;
      } else {
         return 1; // warning: the output does not exist
      }
   }else {
      return -1; // error: the output is an wIn object
   }
}

wInOut.prototype.addInput = function(input){
   if (!(input instanceof wOut)){
      if (input instanceof wIn || !this.searchCycle(input.getName())){ 
         var i = 0;
         var located = 0;
         while (i<this.inputCounter && located == 0){
            if (this.inputList[i].getId() == input.getId() && this.inputList[i].getName() == input.getName()){
               located = 1; // warning: the input is already connected
            }
            i++;
         }
         if (located != 1){
            this.inputList[this.inputCounter++]=input;
            return 0;
         } else {
            return 1; // warning: the input is already connected
         }
      } else {
         return 2; // warning: the input would create a loop with itself
      }
   }else {
      return -1; // error: the input is an wOut object
   }
}

wInOut.prototype.removeInput = function(input){
   if (!(input instanceof wOut)){
      var i = 0;
      var located = false;
      var position = 0;
      while (i<this.inputCounter && !located){
         if (this.inputList[i].getId() == input.getId() && this.inputList[i].getName() == input.getName()){
            located = true; // warning: the input is already connected
            position = i;
         }
         i++;
      }
      if (located){
         this.inputList.splice(position,1);
         this.inputCounter--;
         if (this.outputCounter == 0 && this.inputCounter == 0) {
            this.type = null;
            this.value = null;
         }
         return 0;
      } else {
         return 1; // warning: the input does not exist
      }
   }else {
      return -1; // error: the input is an wOut object
   }
}

wInOut.prototype.setValue = function(value){
   var changes = "";
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof wConnectable){
         changes = this.outputList[i].setValue(value) + changes;
		 if (this.outputList[i]==null && this.outputList[i] instanceof wInOut){
		 	this.outputList[i].setTypeForward(this.type);
		 }
      }
   }
   if (this.value != value){
      this.value = value;
      changes += ",{\"name\":\""+this.name+"\"}"
   }
   return changes;
}

wInOut.prototype.clear = function(){
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof wConnectable){
         this.inputList[i].removeOutput(this);
      }
   }
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof wConnectable){
         this.outputList[i].removeInput(this);
      }
   }
}

wInOut.prototype.connections = function(){
   var result = new Object();
   result["input"] = [];
   result["output"] = [];
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof wConnectable){
         var connection = new Object();
         connection["id"] = this.inputList[i].getId();
         connection["name"] = this.inputList[i].getName();
		 
		 if (connection["id"] != null && connection["id"] != "null"){
		 	var gadgetModel = DragboardFactory.getInstance().getGadget(connection["id"]);
			connection["gadgetName"] = gadgetModel.getName();			
		 }
		 else{connection["gadgetName"] = ""}
		
         result["input"].push(connection);
      }
   }
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof wConnectable){
         var connection = new Object();
         connection["id"] = this.outputList[i].getId();
         connection["name"] = this.outputList[i].getName();
        
		 if (connection["id"] != null && connection["id"] != "null"){
		 	var gadgetModel = DragboardFactory.getInstance().getGadget(connection["id"]);
			connection["gadgetName"] = gadgetModel.getName();			
		 }
		 else{connection["gadgetName"] = ""}
		
		 result["output"].push(connection);
      }
   }
   return result;
}

wInOut.prototype.duplicate = function(){
   var clone = new Object();
   clone["InOut"] = new wInOut(this.getId(),this.getName());
   clone["InOut"].setType(this.type);
   clone["InOut"].setValue(this.value);
   clone["input"] = [];
   clone["output"] = [];
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof wIn){
         clone["InOut"].addInput(this.inputList[i]);
      } else {
         clone["input"].push(this.inputList[i].getName());
      }
   }
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof wOut){
         clone["InOut"].addOutput(this.outputList[i]);
      } else {
         clone["output"].push(this.outputList[i].getName());
      }
   }
   return clone;
}

wInOut.prototype.refresh = function (channelRef){
	for (var i = 0; i < this.inputCounter; i++){
		if (this.inputList[i] instanceof wIn){
			this.inputList[i].refresh(channelRef);
		}
	}
	for (var j = 0; j < this.outputCounter; j++){
		if (this.outputList[j] instanceof wOut){
			this.outputList[j].refresh(channelRef);
		}
	}
}

wInOut.prototype.delConnections = function () {
	for (var i = 0; i < this.inputCounter; i++){
			this.inputList[i].removeOutput(this);
	}
	for (var j = 0; j < this.outputCounter; j++){
			this.outputList[j].removeInput(this);
	}
}

wInOut.prototype.propagate = function () {
    for (var j = 0; j < this.outputCounter; j++){
	if (this.outputList[j] instanceof wOut){
	    this.outputList[j].setValue(this.value);
	}
    }
}

wInOut.prototype.getURI = function(){ 
    var values = {'channelName' : this.name};

    return URIs.GET_POST_CHANNEL.evaluate(values);
}

wInOut.prototype.getPersistence = function(){
	var json = new Object();
	json.name = this.name;
	json.value = this.value;
	json.friendcode = this.type;
	json.uri = this.getURI();
	json.ins = [];
	json.outs = [];
	for (var i = 0; i < this.inputCounter; i++){
		var element = new Object();
		element.variable = this.inputList[i].getURI();
		json.ins.push(element);
	}
	for (var i=0;i<this.outputCounter;i++){
		var element = new Object();
		element.variable = this.outputList[i].getURI();
		json.outs.push(element);
	}
	return json;
}
//////////////////////////////////////////////////////////////////////////
// This class represents a iGadget variable which may produce some data //
//////////////////////////////////////////////////////////////////////////
function wEvent(id,name,source){
   wIn.call(this,id,name,source);
}
wEvent.prototype = new wIn();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents a wConnectable whose only purpose is to redistribute the data produced by an wIn object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function wChannel(id,name,source){
   wInOut.call(this,id,name,source);
}
wChannel.prototype = new wInOut();

/////////////////////////////////////////////////////////////////////////////
// This class representents a iGadget variable which may receive some data //
/////////////////////////////////////////////////////////////////////////////
function wSlot(id,name,source){
   wOut.call(this,id,name,source);
}
wSlot.prototype = new wOut();