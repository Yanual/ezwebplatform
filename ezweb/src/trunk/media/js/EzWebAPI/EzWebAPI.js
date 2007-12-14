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
	return new EzWebAPI.platform.RWGadgetVariable(EzWebAPI.id, name);
}

_EzWebAPI.prototype.createRGadgetVariable = function(name, handler) {
	return new EzWebAPI.platform.RGadgetVariable(EzWebAPI.id, name, handler);
}

_EzWebAPI.prototype.send_get = function(url, context, successHandler, errorHandler) {
	var params = {url: url, method: 'GET'};

	successHandler.bind = EzWebAPI.platform.Function.prototype.bind;
	errorHandler.bind = EzWebAPI.platform.Function.prototype.bind;

	EzWebAPI.platform.PersistenceEngineFactory.getInstance().send_post(this.platform.URIs.PROXY, params, context, successHandler, errorHandler);
}

_EzWebAPI.prototype.send_post = function(url, parameters, context, successHandler, errorHandler) {
	var params = {url: url, method: 'POST', params: parameters};

	successHandler.bind = EzWebAPI.platform.Function.prototype.bind;
	errorHandler.bind = EzWebAPI.platform.Function.prototype.bind;

	EzWebAPI.platform.PersistenceEngineFactory.getInstance().send_post(this.platform.URIs.PROXY, params, context, successHandler, errorHandler);
}

var EzWebAPI = new _EzWebAPI();


