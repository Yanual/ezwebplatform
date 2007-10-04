
function Persistence(){
	this.load = function(uri) { }
	this.save = function(uri, content) { alert('uri: ' + uri + '\ncontent: ' + content); }
	this.remove = function(uri) { }
	this.update = function(uri, content) { }
}

function Showcase(){
	var _gadgets = new Array();
	
	this.addGadget = function(uri) { }
	this.removeGadget = function(id) { }
	this.updateGadget = function(uri, id) { }
	this.addGadgetInstance = function(id) { }
	this.tagGadget = function(id,tag) { }
	this.repaint = function() { }
	this.addPrueba = function(gadget) { _gadgets.push(gadget); }
	
	this.save = function() {
		for (i=0; i<_gadgets.length; i++)
		{
			_gadgets[i].save();
		}
	}
}

function XHtml(code) {
	var _code = code;
	
	this.getCode = function(){ return _code; }
	this.setCode = function(code){ _code = code; }
	
	this.save = function(uri) {
		state = new XHtmlState(uri, this);
		state.save();
	}
}

function XHtmlState(uri, xhtml)
{
	this.save = function() {
		persistence = new Persistence();
		persistence.save(uri, xhtml.getCode());
	}
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
	this.addEvent = function(event) { _events.push(event); }
	this.removeEvent = function(event) { _events = _events.without(event); }
	
	this.setUserPrefs = function(userPrefs) { _userPrefs = userPrefs; }
	this.getUserPrefs = function() { return _userPrefs; }
	this.addUserPref = function(userPref) { _userPrefs.push(userPref); }
	this.removeUserPref = function(userPref) { _userPrefs = _userPrefs.without(userPref); }
	
	this.setStateVars = function(stateVars) { _stateVars = stateVars; }
	this.getStateVars = function() { return _stateVars; }
	this.addStateVar = function(stateVar) { _stateVars.push(stateVar); }
	this.removeStateVar = function(stateVar) { _stateVars = _stateVars.without(stateVar); }

	this.save = function(uri) {
		state = new TemplateState(uri, this);
		state.save();
	}
}

function TemplateState(uri, template)
{
	this.slots = template.getSlots();
	this.events = template.getEvents();
	this.userPrefs = template.getUserPrefs();
	this.stateVars = template.getStateVars();
	
	this.save = function() {
		persistence = new Persistence();
		persistence.save(uri, this.toJSONString());
	}
}

function Tag(value) {
	var _value = value;
	
	this.setValue = function(value) { _value = value; }
	this.getValue = function() { return _value; }
	
	this.save = function(uri) {
		state = new TagState(uri, this);
		state.save();
	}
}

function TagState(uri, tag)
{
	this.save = function() {
		persistence = new Persistence();
		persistence.save(uri, tag.getValue());
	}
}

function Gadget(vendor, name, version, tags, template, xhtml) {
	var _vendor = vendor;
	var _name = name;
	var _version = version;
	var _tags = tags;
	var _template = template;
	var _xhtml = xhtml;
	
	this.setTags = function(tags) { _tags = tags; }
	this.getTags = function() { return _tags; }
	this.addTag = function(tag) { _tags.push(tag); }
	this.removeTag = function(tag) { _tags = _tags.without(tag); }
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
	
	this.save = function() {
		state = new GadgetState('/user/<user_id>/gadgets/' + _vendor + '/' + _name + '/' + _version, this)
		state.save();
	}
}

function GadgetState(uri, gadget) {
	this.vendor = gadget.getVendor();
	this.name = gadget.getName();
	this.version = gadget.getVersion();
	this.uriTemplate = uri + '/template/json';
	this.uriXhtml = uri + '/xhtml';
	this.uriTags = new Array();
	var _tags = gadget.getTags();
	for (i=0; i<_tags.length; i++)
	{
		this.uriTags[i] = uri + '/tags/' + i;
	}
	
	this.save = function() {
		persistence = new Persistence();
		persistence.save(uri + '/json', this.toJSONString());
		gadget.getXHtml().save(this.uriXhtml);
		gadget.getTemplate().save(this.uriTemplate);
		for (i=0; i<_tags.length; i++)
		{
			_tags[i].save(this.uriTags[i]);
		}
	}
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

function ReadWriteVariable(value){
	this.base = Variable;
	this.base(value);
	
	this.setValue = function(value) { this._value = value; }
}

ReadWriteVariable.prototype = new Variable;

function ReadOnlyVariable(value){
	this.base = Variable;
	this.base(value);
	
	this.handler = function() { }
}

ReadOnlyVariable.prototype = new Variable;



