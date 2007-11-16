function _EzWebAPI() {
	this.platform = window.parent;

	// Get id from the URL
	var tmp = document.URL.split("?");
	tmp = tmp[1].split("=");
	this.id = tmp[1];
}

_EzWebAPI.prototype.getId = function() {
	return EzWebAPI.id;
}

_EzWebAPI.prototype.createRWGadgetVariable = function(name) {
	var variable = new EzWebAPI.platform.RWGadgetVariable(EzWebAPI.id, name);
	variable.register();

	return variable;
}

_EzWebAPI.prototype.createRGadgetVariable = function(name, handler) {
	var variable = new EzWebAPI.platform.RGadgetVariable(EzWebAPI.id, name, handler);
//	variable.register(handler);

	return variable;
}

var EzWebAPI = new _EzWebAPI();


