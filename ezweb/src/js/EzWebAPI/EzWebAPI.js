function _EzWebAPI() {
	this.platform = window.parent;

	// Get id from the URL
	var tmp = document.URL.split("?");
	tmp = tmp[1].split("=");
	this.id = tmp[1];
}

_EzWebAPI.prototype.getId = function() {
	return this.id;
}

_EzWebAPI.prototype.createRWGadgetVariable = function(name) {
	var variable = new this.platform.RWGadgetVariable(this.id, name);
	variable.register();

	return variable;
}

_EzWebAPI.prototype.createRGadgetVariable = function(name, handler) {
	var variable = new this.platform.RGadgetVariable(this.id, name, handler);
	variable.register();

	return variable;
}

var EzWebAPI = new _EzWebAPI();

//EzWebAPI = new _EzWebAPI();

//function RWGadgetVariable(name) {
//        this.platform.RWGadgetVariable(this, EzWebAPI.getID(), name);
//}

