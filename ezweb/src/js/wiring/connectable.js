///////////////////////////////////////////////////////////////////////////////////////////////////
// This is the class has the common properties of every connectable object of the wiring module //
// The other connectable classes from the wiring module will inherit from this class             //
///////////////////////////////////////////////////////////////////////////////////////////////////
function Connectable(id,name){
   // Private attributes
   this.id = id;
   this.type = null;
   this.value = null;
   this.name = name;
}
// Public methods 

Connectable.prototype.getId = function(){
   return this.id;
}

Connectable.prototype.setId = function(value){
   this.id=value;
}

Connectable.prototype.getType = function(){
   return this.type;
}

Connectable.prototype.setType = function(value){
   this.type=value;
}

Connectable.prototype.getValue = function(){
   return this.value;
}

Connectable.prototype.setValue = function(value){
   this.value=value;
}

Connectable.prototype.getName = function(){
   return this.name;
}

Connectable.prototype.clear = function(value){
   null; // It will be overriden in the other classes
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may be placed in the middle of a connection between a In object and Out object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Out(id,name){
   Connectable.call(this,id,name);
   this.inputHash = [];
}
Out.prototype = new Connectable();

Out.prototype.addInput = function(input){
   if (input instanceof InOut){
      if (!(this.inputHash[input.getName()] instanceof Connectable)){
         this.inputHash[input.getName()] = input;
         return 0;
      }
      return 1; // warning: the input is already connected
   }
   return -1; // error: the input is not a InOut object
}

Out.prototype.removeInput = function(input){
   if (input instanceof InOut){
      if (this.inputHash[input.getName()] instanceof Connectable){
         this.inputHash[input.getName()] = null;
         return 0;
      }
      return 1; // warning: the input does not exist
   }
   return -1; // error: the input is not a InOut object
}

Out.prototype.setValue = function(value){
   this.value=value;
   // here goes the calling to the method writeSlot of the VarManager
}

Out.prototype.clear = function(){
   for (i in this.inputHash){
      if (this.inputHash[i] instanceof InOut){
         this.inputHash[i].removeOutput(this);
      }
   }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may initialize one transmission through the wiring module //
////////////////////////////////////////////////////////////////////////////////////////////////////////
function In(id,name){
   Connectable.call(this,id,name);
   this.outputHash = [];
}
In.prototype = new Connectable();

In.prototype.addOutput = function(output){
   if (output instanceof InOut){
      if (!(this.outputHash[output.getName()] instanceof InOut)){
         if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
            output.setValue(this.value);
            this.outputHash[output.getName()] = output;
            return 0;
         } else if (output.getType() == null){
            output.setTypeForward(this.type);
            output.setValue(this.value);
            this.outputHash[output.getName()] = output;
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
   return -1; // error: the input is not a InOut object
}

In.prototype.removeOutput = function(output){
   if (output instanceof InOut){
      if (this.outputHash[output.getName()] instanceof InOut){
         this.outputHash[output.getName()] = null;
         return 0;
      }
      return 1; // warning: the input does not exist
   }
   return -1; // error: the input is not a InOut object
}

In.prototype.setValue = function(value){
   this.value = value;
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof InOut){
        this.outputHash[i].setValue(value);
      }
   }
}

/////////////////////////////////////////////////////////////////////
// This class represents every object which may transmit some data //
/////////////////////////////////////////////////////////////////////
function InOut(id,name){
   Connectable.call(this,id,name);
   this.inputHash = [];
   this.outputHash = [];
   this.inputCounter = 0;
   this.outputCounter = 0;
}
InOut.prototype = new Connectable();

InOut.prototype.setTypeForward = function(type){
   this.type = type;
   if (this.outputHash["channels"] instanceof Array) {
      for (i in this.outputHash["channels"]) {
         if (this.outputHash["channels"][i] instanceof InOut){
            this.outputHash["channels"][i].setTypeForward(this.type);
         }
      }
   }
}

InOut.prototype.setTypeBack = function(type){
   this.type = type;
   if (this.inputHash["channels"] instanceof Array) {
      for (i in this.inputHash["channels"]) {
         if (this.inputHash["channels"][i] instanceof InOut){
            this.inputHash["channels"][i].setTypeBack(this.type);
         }
      }
   }
}

InOut.prototype.addOutput = function(output){
   if (output instanceof Out){
      if (!(this.outputHash[output.getId()] instanceof Array)) {
         this.outputHash[output.getId()] =[];
      }
      if (!(this.outputHash[output.getId()][output.getName()] instanceof Out)) {
         if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
            output.setValue(this.value);
            this.outputCounter++;
            this.outputHash[output.getId()][output.getName()] = output;
            return 0;
         } else if (this.type == null){
            this.setTypeBack(output.getType());
            this.outputCounter++;
            this.outputHash[output.getId()][output.getName()] = output;
            return 0;
         } else if (output.getType() == null){ // in the final version this case should not happen
            this.outputCounter++;
            this.outputHash[output.getId()][output.getName()] = output;
            return 0;
         } else {
            return -2; // error: the types are incompatible
         }
      } else {
         return 1; // warning: the output is already connected
      }
   } else if ((output instanceof InOut) && (this.name != output.getName())){ //for avoiding loops with itself
      if (!(this.outputHash["channels"] instanceof Array)) {
         this.outputHash["channels"] =[];
      }
      if (!(this.outputHash["channels"][output.getName()] instanceof InOut)){ // it may be changed when the filters were defined
         if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
            output.setValue(this.value);
            this.outputCounter++;
            this.outputHash["channels"][output.getName()] = output;
            return 0;
         } else if (output.getType() == null){
            output.setTypeForward(this.type);
            output.setValue(this.value);
            this.outputCounter++;
            this.outputHash["channels"][output.getName()] = output;
            return 0;
         } else if (this.type == null){
            this.setTypeBack(output.getType());
            this.outputHash["channels"][output.getName()] = output;
            return 0;
         } else {
            return -2; // error: the types are incompatible
         }
      } else {
         return 1; // warning: the output is already connected or it would create a loop
      }
   } else {
      return -1; // error: the output is a In object
   }
}

InOut.prototype.removeOutput = function(output){
   if (output instanceof Out){
      if (this.outputHash[output.getId()] instanceof Array) {
         if (!(this.outputHash[output.getId()][output.getName()] instanceof Out)) {
            return 1; // warning: the output does not exist
         } else {
            this.outputHash[output.getId()][output.getName()] = null;
            if (--this.outputCounter == 0 && this.inputCounter == 0) {
               this.type = null;
            }
            return 0;
         }
      } else {
         return 1; // warning: the output does not exist
      }
   } else if (output instanceof InOut) { 
      if (this.outputHash["channels"] instanceof Array) {
         if (!(this.outputHash["channels"][output.getName()] instanceof InOut)){ // it may be changed when the filters were defined
            return 1; // warning: the output does not exist
         } else {
            this.outputHash["channels"][output.getName()] = null;
            if (--this.outputCounter == 0 && this.inputCounter == 0) {
               this.type = null;
            }
            return 0;
         }
      } else {
         return 1; // warning: the output does not exist
      }
   } else {
      return -1; // error: the output is a In object
   }
}

InOut.prototype.addInput = function(input){
   if (input instanceof In){
      if (!(this.inputHash[input.getId()] instanceof Array)) {
         this.inputHash[input.getId()] =[];
      }
      if (!(this.inputHash[input.getId()][input.getName()] instanceof In)) {
         this.inputHash[input.getId()][input.getName()] = input;
         this.inputCounter++;
         return 0;
      } else {
         return 1; // warning: the input is already connected
      }
   } else if ((input instanceof InOut) && (this.name != input.getName())){ //for avoiding loops with himself
      if (!(this.inputHash["channels"] instanceof Array)) {
         this.inputHash["channels"] =[];
      }
      if (!(this.inputHash["channels"][input.getName()] instanceof InOut)){ // it may be changed when the filters were defined
         this.inputHash["channels"][input.getName()] = input;
         this.inputCounter++;
         return 0;
      } else {
         return 1; // warning: the input is already connected or it would create a loop
      }
   } else {
      return -1; // error: the input is a In object
   }
}

InOut.prototype.removeInput = function(input){
   if (input instanceof In){
      if (this.inputHash[input.getId()] instanceof Array) {
         if (!(this.inputHash[input.getId()][input.getName()] instanceof In)) {
            return 1; // warning: the input does not exist
         } else {
            this.inputHash[input.getId()][input.getName()] = null;
            if (this.outputCounter == 0 && --this.inputCounter == 0) {
               this.type = null;
            }
            return 0;
         }
      } else {
         return 1; // warning: the input does not exist
      }
   } else if (input instanceof InOut) { 
      if (this.inputHash["channels"] instanceof Array) {
         if (!(this.inputHash["channels"][input.getName()] instanceof InOut)){ // it may be changed when the filters were defined
            return 1; // warning: the input does not exist
         } else {
            this.inputHash["channels"][input.getName()] = null;
            if (this.outputCounter == 0 && --this.inputCounter == 0) {
               this.type = null;
            }
            return 0;
         }
      } else {
         return 1; // warning: the input does not exist
      }
   } else {
      return -1; // error: the output is a In object
   }
}

InOut.prototype.setValue = function(value){
   this.value = value;
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof Array){
         for (j in this.outputHash[i]){
            if (this.outputHash[i][j] instanceof Connectable){
               this.outputHash[i][j].setValue(value);
            }
         }
      }
   }
}

InOut.prototype.clear = function(){
   for (i in this.inputHash){
      if (this.inputHash[i] instanceof Array){
         for (j in this.inputHash[i]){
            if (this.inputHash[i][j] instanceof Connectable){
               this.inputHash[i][j].removeOutput(this);
            }
         }
      }
   }
}

InOut.prototype.connections = function(){
   var result = [];
}

//////////////////////////////////////////////////////////////////////////
// This class represents a iGadget variable which may produce some data //
//////////////////////////////////////////////////////////////////////////
function Event(id,name){
   In.call(this,id,name);
}
Event.prototype = new In();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents a connectable whose only purpose is to redistribute the data produced by an In object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Channel(id,name){
   InOut.call(this,id,name);
}
Channel.prototype = new InOut();

/////////////////////////////////////////////////////////////////////////////
// This class representents a iGadget variable which may receive some data //
/////////////////////////////////////////////////////////////////////////////
function Slot(id,name){
   Out.call(this,name);
}
Slot.prototype = new Out();