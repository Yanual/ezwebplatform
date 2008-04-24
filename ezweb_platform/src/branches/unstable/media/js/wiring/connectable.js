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


//////////////////////////////////////////////////////////////////////////////////////////////////
// This is the class has the common properties of every connectable object of the wiring module //
// The other connectable classes from the wiring module will inherit from this class            //
//////////////////////////////////////////////////////////////////////////////////////////////////
function wConnectable (name, type, friendCode) {
  this._name = name;
  this._type = type;
  this._friendCode = friendCode;
}

wConnectable.prototype.getType = function() {
  return this.type;
}

wConnectable.prototype.getValue = function() {
  throw new Exception("Unimplemented function"); // TODO
}

wConnectable.prototype.getName = function() {
  return this._name;
}

wConnectable.prototype.getFriendCode = function() {
  return this._friendCode;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may be placed in the middle of a connection between a In object and wOut object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function wOut(name, type, friendCode) {
   wConnectable.call(this, name, type, friendCode);
}

wOut.prototype = new wConnectable();

////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents every object which may initialize one transmission through the wiring module //
////////////////////////////////////////////////////////////////////////////////////////////////////////
function wIn(name, type, friendCode) {
  wConnectable.call(this, name, type, friendCode);
  this.outputs = new Hash();
}

wIn.prototype = new wConnectable();

wIn.prototype.connect = function(out) {
  //if (!(out instanceof wInOut))
  //  throw new Exception();

  this.outputs[out.getQualifiedName()] = out;
  if (out instanceof wInOut)
    out._addInput(this);
}

wIn.prototype.disconnect = function(out) {
  //if (!(out instanceof wInOut)) {
  //  throw new Exception();

  if (this.outputs[out.getQualifiedName()] == out) {
    if (out instanceof wInOut)
      out._removeInput(this);

    delete this.outputs[out.getQualifiedName()];
  }
}

wIn.prototype.propagate = function(value) {
  var keys = this.outputs.keys();
  for (var i = 0; i < keys.length; ++i)
    this.outputs[keys[i]].propagate(value);
}

/////////////////////////////////////////////////////////////////////
// This class represents every object which may transmit some data //
/////////////////////////////////////////////////////////////////////
function wInOut(name, type, friendCode) {
  wIn.call(this, name, type, friendCode);

  this.inputs = new Hash();
}

wInOut.prototype = new wIn();

wInOut.prototype._addInput = function(wIn) {
  this.inputs[wIn.getQualifiedName()] = wIn;
}

wInOut.prototype._removeInput = function(wIn) {
  if (this.inputs[wIn.getQualifiedName()] == wIn)
    delete this.inputs[wIn.getQualifiedName()];
}

wInOut.prototype.fullDisconnect = function() {
  // Inputs
  var keys = this.inputs.keys();
  for (var i = 0; i < keys.length; ++i)
    this.inputs[keys[i]].disconnect(this);

  // Outputs
  var keys = this.outputs.keys();
  for (var i = 0; i < keys.length; ++i)
    this.disconnect(this.outputs[keys[i]]);
}

// TODO implement this function
//wInOut.prototype.searchCycle = function(name)

//////////////////////////////////////////////////////////////////////////
// This class represents a iGadget variable which may produce some data //
//////////////////////////////////////////////////////////////////////////
function wEvent(variable, type, friendCode) {
  this.variable = variable;
  wIn.call(this, this.variable.name, type, friendCode);
  this.variable.assignEvent(this);
}

wEvent.prototype = new wIn();

wEvent.prototype.getQualifiedName = function () {
  return "event_" + this.variable.id;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This class represents a wConnectable whose only purpose is to redistribute the data produced by an wIn object //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function wChannel (variable, name) {
  this.variable = variable;
  wInOut.call(this, name, null, null);
}

wChannel.prototype = new wInOut();

wChannel.prototype.getValue = function() {
  return this.variable.get();
}

wChannel.prototype.propagate = function(newValue) {
  this.variable.set(newValue);
  wInOut.prototype.propagate.call(this, newValue);
}

wChannel.prototype.getQualifiedName = function () {
  return "channel_" + this._name;
}

/////////////////////////////////////////////////////////////////////////////
// This class representents a iGadget variable which may receive some data //
/////////////////////////////////////////////////////////////////////////////
function wSlot(variable, type, friendCode) {
  this.variable = variable;
  wOut.call(this, this.variable.name, type, friendCode);
  this.variable.assignSlot(this);
}

wSlot.prototype = new wOut();

wSlot.prototype.propagate = function(newValue) {
  this.variable.set(newValue);
}

wSlot.prototype.getQualifiedName = function () {
  return "slot_" + this.variable.id;
}

