function AjaxWrapper()
{
        // *********************************
        //           STATIC CLASS
        // *********************************
}

AjaxWrapper.send_get = function(url, context, successHandler, errorHandler) {
	var params = 'url=';
	params += url;
	params += '&method=GET';
	new Ajax.Request(URIConstant.prototype.PROXY, {
			method: 'post',
			parameters: params,
                        onSuccess: successHandler.bind(context),
                        onFailure: errorHandler.bind(context),
                        onException: errorHandler.bind(context)
	});
}

AjaxWrapper.send_post = function(url, parameters, context, successHandler, errorHandler) {
        var params = 'url=';
        params += url;
        params += '&method=POST';
	params += '&params=' + parameters;
        new Ajax.Request(URIConstant.prototype.PROXY, {
                        method: 'post',
                        parameters: params,
                        onSuccess: successHandler.bind(context),
                        onFailure: errorHandler.bind(context),
                        onException: errorHandler.bind(context)
        });
}

