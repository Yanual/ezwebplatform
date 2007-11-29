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
	var params = 'url=';
	params += url;
	params += '&method=GET';
	new Ajax.Request(this.platform.URIConstants.prototype.PROXY, {
			method: 'post',
			parameters: params,
                        onSuccess: successHandler.bind(context),
                        onFailure: errorHandler.bind(context),
                        onException: errorHandler.bind(context)
	});
}

_EzWebAPI.prototype.send_post = function(url, parameters, context, successHandler, errorHandler) {
	var params = 'url=';
        params += url;
        params += '&method=POST';
	params += '&params=' + parameters;
        new Ajax.Request(this.platform.URIConstants.prototype.PROXY, {
                        method: 'post',
                        parameters: params,
                        onSuccess: successHandler.bind(context),
                        onFailure: errorHandler.bind(context),
                        onException: errorHandler.bind(context)
        });
}

var EzWebAPI = new _EzWebAPI();


