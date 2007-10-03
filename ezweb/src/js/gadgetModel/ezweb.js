
function XHtml(code) {
	var _code = code;
	this.getCode = function(){ return _code; }
	this.setCode = function(code){ _code = code; }
}

function Template() {
	var _slots = new Array();
	var _events = new Array();
	var _userPrefs = new Array();
	var _stateVars = new Array();

	this.setSlots = function(slots) { _slots = slots; }
	this.getSlots = function() { return _slots; }
	this.addSlot = function(slot) { _slots.push(slot); }
	this.removeSlot = function(slot) { _slots = _slots.without(slot); }
	
	this.setEvents = function(events) { _events = events; }
	this.getEvents = function() { return _events; }
	this.addEvents = function(event) { _events.push(event); }
	this.removeEvents = function(event) { _events = _events.without(event); }
	
	this.setUserPrefs = function(userPrefs) { _userPrefs = userPrefs; }
	this.getUserPrefs = function() { return _userPrefs; }
	this.addUserPrefs = function(userPref) { _userPrefs.push(userPref); }
	this.removeUserPrefs = function(userPref) { _userPrefs = _userPrefs.without(userPref); }
	
	this.setStateVars = function(stateVars) { _stateVars = stateVars; }
	this.getStateVars = function() { return _stateVars; }
	this.addStateVars = function(stateVar) { _stateVars.push(stateVar); }
	this.removeStateVars = function(stateVar) { _stateVars = _stateVars.without(stateVar); }
}

function Tag(value) {
	var _value = value;
	
	this.setValue = function(value) { _value = value; }
	this.getValue = function() { return _value; }
}

function Gadget(vendor, name, version, template, xhtml) {
	var _vendor = vendor;
	var _name = name;
	var _version = version;
	var _template = template;
	var _xhtml = xhtml;
	
	this.setVendor = function(vendor) { _vendor = vendor; }
	this.getVendor = function() { return _vendor; }
	this.setName = function(name) { _name = name; }
	this.getName = function() { return _name; }
	this.setVersion = function(version) { _version = version; }
	this.getVersion = function() { return _version; }
	this.setTemplate = function(template) { _template = template; }
	this.getTemplate = function() { return _template; }
	this.setXHtml = function(xhtml) { _xhtml = xhtml; }
	this.getXHtml = function() { return _xhtml; }
}

function IGadget(gadget, top, left){
	var _gadget = gadget;
	var _top = top;
	var _left = left;
	
	this.setGadget = function(gadget) { _gadget = gadget; }
	this.getGadget = function() { return _gadget; }
	this.setTop = function(top) { _top = top; }
	this.getTop = function() { return _top; }
	this.setLeft = function(left) { _left = left; }
	this.getLeft = function() { return _left; }
	
	this.allocate = function(top, left) {}
	this.getId = function() {}
	this.droptTo = function(top, left) {}
	this.reload = function() {}
	this.minimize = function() {}
	this.maximize = function() {}
	this.bindUIEvents = function() {}
}

function Variable(value){
	this._value = value;
	
	this.getValue = function() { return this._value; }
}

function WriteOnlyVariable(value){
	this.base = Variable;
	this.base(value);
	
	this.setValue = function(value) { this._value = value; }
}

WriteOnlyVariable.prototype = new Variable;



