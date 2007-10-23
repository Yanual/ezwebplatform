//////////////////////////////////////////////////////////////////////////////////////////////////
// This is the class has the common properties of every connectable object of the wiring module //
// The other connectable classes from the wiring module will inherit from this class            //
//////////////////////////////////////////////////////////////////////////////////////////////////
function Connectable(id,name,source){
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

Connectable.prototype.clear = function(){ //this method will be overriden in each class
   null; // it does not have any connection to clear
}

Connectable.prototype.serialize = function(){ //this method will be overriden in each class
   return "{\"id\":\""+this.id+"\",\"type\":\""+this.type+"\",\"value\":\""+this.value+"\",\"name\":\""+this.name+"\"}";
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may be placed in the middle of a connection between a In object and Out object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Out(id,name,source){
   Connectable.call(this,id,name,source);
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
 //  var varManager = VarManagerFactory.getInstance();
 //  varManager.writeSlot(this.id,this.name,this.value);
 alert("Valor en " + this.name + " es " + this.value)
}

Out.prototype.clear = function(){
   for (i in this.inputHash){
      if (this.inputHash[i] instanceof InOut){
         this.inputHash[i].removeOutput(this);
      }
   }
}

Out.prototype.serialize = function(){
   return "{\"aspect\":\"SLOT\",\"id\":\""+this.id+"\",\"type\":\""+this.type+"\",\"value\":\""+this.value+"\",\"name\":\""+this.name+"\"}";
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may initialize one transmission through the wiring module //
////////////////////////////////////////////////////////////////////////////////////////////////////////
function In(id,name,source){
   Connectable.call(this,id,name,source);
   this.outputHash = [];
}
In.prototype = new Connectable();

In.prototype.addOutput = function(output){
   if (output instanceof InOut){
      if (!(this.outputHash[output.getName()] instanceof InOut)){
	     if (this.type == output.getType()){ // the checking of the types may be changed when the filters were included
            this.outputHash[output.getName()] = output;
            output.setValue(this.value);
            return 0;
         } else if (output.getType() == null){
            output.setValue(this.value);
            this.outputHash[output.getName()] = output;
          //  output.setTypeForward(this.type);
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
   var changes ="{\"idEvent\":\""+this.id;
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof InOut){
        this.outputHash[i].setValue(value);
      }
   }
   return changes + "]}"
}

In.prototype.clear = function(){
   for (i in this.outputHash){
      if (this.outputHash[i] instanceof InOut){
         this.outputHash[i].removeInput(this);
      }
   }
}

In.prototype.serialize = function(){
   return "{\"aspect\":\"EVENT\",\"id\":\""+this.id+"\",\"type\":\""+this.type+"\",\"value\":\""+this.value+"\",\"name\":\""+this.name+"\"}";
}

/////////////////////////////////////////////////////////////////////
// This class represents every object which may transmit some data //
/////////////////////////////////////////////////////////////////////
function InOut(id,name,source){
   Connectable.call(this,id,name,source);
   this.inputList = [];
   this.outputList = [];
   this.inputCounter = 0;
   this.outputCounter = 0;
}
InOut.prototype = new Connectable();

InOut.prototype.setTypeForward = function(type){
   this.type = type;
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof InOut){
         this.outputList[i].setTypeForward(type);
      }
   }
}


InOut.prototype.setTypeBack = function(type){
   this.type = type;
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof InOut){
         this.inputList[i].setTypeBack(type);
      }
   }
}

InOut.prototype.addOutput = function(output){
   if (!(output instanceof In)){
      if (output.getId() != this.id || output.getName() != this.name){ // for avoiding loops with itself
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
               output.setValue(this.value);
               return 0;
            } else if (output.getType() == null){
               output.setValue(this.value);
               this.outputList[this.outputCounter++]=output;
               if (output instanceof InOut){
                  output.setTypeForward(this.type);
               }
               return 0;
            } else if (this.type == null){ // in the final version this case should not happen
               this.setTypeBack(output.getType());
               this.outputList[this.outputCounter++]=output;
               return 0;
            } else {
               return -2; // error: the types are incompatible
            }
         } else {
            return 1; // warning: the input is already connected
         }
      } else {
         return 2; // warning: the output would create a loop with itself
      }
   }else {
      return -1; // error: the output is an Out object
   }
}

InOut.prototype.removeOutput = function(output){
   if (!(output instanceof In)){
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
      return -1; // error: the output is an In object
   }
}

InOut.prototype.addInput = function(input){
   if (!(input instanceof Out)){
      if (input.getId() != this.id || input.getName() != this.name){ // for avoiding loops with itself
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
      return -1; // error: the input is an Out object
   }
}

InOut.prototype.removeInput = function(input){
   if (!(input instanceof Out)){
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
      return -1; // error: the input is an Out object
   }
}

InOut.prototype.setValue = function(value){
   this.value = value;
   for (var i=0;i<=this.outputCounter;i++){
   //var i =1;
   //while(i<=this.outputList.length){ // this is temporal, somehow a for loop does not work
      if (this.outputList[i] instanceof Connectable){
         this.outputList[i].setValue(value);
      }
      //i++;
   }
}

InOut.prototype.clear = function(){
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof Connectable){
         this.inputList[i].removeOutput(this);
      }
   }
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof Connectable){
         this.outputList[i].removeInput(this);
      }
   }
}

InOut.prototype.connections = function(){
   var result = new Object();
   result["input"] = [];
   result["output"] = [];
   for (var i=0;i<this.inputCounter;i++){
      if (this.inputList[i] instanceof Connectable){
         var connection = new Object();
         connection["id"] = this.inputList[i].getId();
         connection["name"] = this.inputList[i].getName();
         result["input"].push(connection);
      }
   }
   for (var i=0;i<this.outputCounter;i++){
      if (this.outputList[i] instanceof Connectable){
         var connection = new Object();
         connection["id"] = this.outputList[i].getId();
         connection["name"] = this.outputList[i].getName();
         result["output"].push(connection);
      }
   }
   return result;
}

InOut.prototype.serialize = function(){
   var result = "{\"id\":\""+this.id+"\",\"type\":\""+this.type+"\",\"value\":\""+this.value+"\",\"name\":\""+this.name+"\",\"inputList\":[";
   if (this.inputCounter != 0){
      for (var i=0;i<(this.inputCounter-1);i++){
         result+="{\"id\":\""+this.inputList[i].getId()+"\",\"name\":\""+this.inputList[i].getName()+"\"},";
      }
      result+="{\"id\":\""+this.inputList[this.inputCounter-1].getId()+"\",\"name\":\""+this.inputList[this.inputCounter-1].getName()+"\"}";
   }
   result+="],\"outputList\":[";
   if (this.outputList.length != 0){
      for (var i=0;i<(this.outputCounter-1);i++){
         result+="{\"id\":\""+this.outputList[i].getId()+"\",\"name\":\""+this.outputList[i].getName()+"\"},";
      }
      result+="{\"id\":\""+this.outputList[this.outputCounter-1].getId()+"\",\"name\":\""+this.outputList[this.outputCounter-1].getName()+"\"}";
   }
   result+="]}";
   return result;
}

//////////////////////////////////////////////////////////////////////////
// This class represents a iGadget variable which may produce some data //
//////////////////////////////////////////////////////////////////////////
function Event(id,name,source){
   In.call(this,id,name,source);
}
Event.prototype = new In();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents a connectable whose only purpose is to redistribute the data produced by an In object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Channel(id,name,source){
   InOut.call(this,id,name,source);
}
Channel.prototype = new InOut();

/////////////////////////////////////////////////////////////////////////////
// This class representents a iGadget variable which may receive some data //
/////////////////////////////////////////////////////////////////////////////
function Slot(id,name,source){
   Out.call(this,id,name,source);
}
Slot.prototype = new Out();