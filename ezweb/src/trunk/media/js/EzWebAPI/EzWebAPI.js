function _EzWebAPI() {
	this.platform = window.parent;

	// Get id from the URL
	var tmp = document.URL.split("?");
	tmp = tmp[1].split("=");
	this.id = tmp[1];

	function resizeEvent() {
		alert ("hola");
	}

	document.addEventListener("resize", resizeEvent, true);

	// overwrite open and send methods of XMLHttpRequest
	var _open = XMLHttpRequest.prototype.open;
	var _send = XMLHttpRequest.prototype.send;

	XMLHttpRequest.prototype.open = function (method, URL, async) {
		this.ezwebproxy_method = method;
		this.ezwebproxy_url = URL;
		_open("POST", EzWebAPI.platform.URIs.PROXY, async);
	}

	XMLHttpRequest.prototype.send = function (content) {
		content = {url: this.ezwebproxy_url, method: this.ezwebproxy_method, params: content};
		_send("POST", EzWebAPI.platform.URIs.PROXY, async);
	}

//	XMLHttpRequest = function () {
//		this.method = null;
//		this.URL = null;
//	}

////	XMLHttpRequest.prototype = new _XMLHttpRequest();
//	XMLHttpRequest.prototype.open = function(method, URL, async) {
//		this.method = method;
//		this.URL = URL;
//	}

//	XMLHttpRequest.prototype.send = function(content) {
//		switch (this.method) {
//		case 'GET':
//			var params = {url: this.URL, method: 'GET'};
//			this.onreadystatechange.bind = EzWebAPI.platform.Function.prototype.bind;
//			EzWebAPI.platform.PersistenceEngineFactory.getInstance().send_post(EzWebAPI.platform.URIs.PROXY, params, null, this.onreadystatechange, null);
//			break;
//		case 'POST':
//			break;
//		}
//	}
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

