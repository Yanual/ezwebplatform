/* 
*     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
*     S.A.Unipersonal (Telefonica I+D)
*
*     This file is part of Morfeo EzWeb Platform.
*
*     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
*     it under the terms of the GNU Affero General Public License as published by
*     the Free Software Foundation, either version 3 of the License, or
*     (at your option) any later version.
*
*     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
*     but WITHOUT ANY WARRANTY; without even the implied warranty of
*     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*     GNU Affero General Public License for more details.
*
*     You should have received a copy of the GNU Affero General Public License
*     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
*
*     Info about members and contributors of the MORFEO project
*     is available at
*
*     http://morfeo-project.org
 */


/**
 * Prototype Improvements v0.1
 *
 * Various additions to the prototype.js
 */

Object.extend(Event, {
	KEY_SHIFT:    16,
	KEY_CONTROL:  17,
	KEY_CAPSLOCK: 20,
	KEY_SPACE: 32,
	keyPressed: function(event)
	{
		return Browser.isMSIE() ? window.event.keyCode : event.which;
	},
	/*
	 * Event extension to manage user privileges 
	 * */
	observe: function(element, name, observer, useCapture, featureId){
		var _observer = observer;
		if (featureId && typeof(EzSteroidsAPI)!="undefined"){
			//check the user policies
			if (!EzSteroidsAPI.evaluePolicy(featureId)){
				//if the user isn't allowed
				_observer = function(msg){LogManagerFactory.getInstance().showMessage("You are not allowed to perform this operation");};
			}
		}
		element = $(element);
    	useCapture = useCapture || false;

    	if (name == 'keypress' && (Prototype.Browser.WebKit || element.attachEvent))
      		name = 'keydown';

   		Event._observeAndCache(element, name, _observer, useCapture);
	}
});

Browser = {
	
	/**
	 * Returns the user agent
	 * @param {bool} useAlert
	 */
	inspect: function(useAlert)
	{
		if(useAlert)
			alert(navigator.userAgent);
		else
			return navigator.userAgent;
	},
	/**
	 * Returns true if browser is MS Internet Explorer
	 */
	isMSIE: function()
	{
		return (navigator.userAgent.toLowerCase().indexOf("msie") > -1) && !this.isOpera();
	},
	/**
	 * Returns true if browser is Opera
	 */
	isOpera: function()
	{
		return navigator.userAgent.toLowerCase().indexOf("opera") > -1;
	},
	/**
	 * Returns true if browzer is Mozilla
	 */
	isMozilla: function()
	{
		return (navigator.userAgent.toLowerCase().indexOf("mozilla") > -1) && !this.isOpera() && !this.isMSIE();
	}
}


Object.genGUID = function()
{
	var len = 8;
	if(!isNaN(parseInt(arguments[0]))) len = parseInt(arguments[0]);
	var chars = "abcdef0123456789";
	var output = "";
	while(output.length < len)
	{
		var rnd = Math.floor(Math.random() * (chars.length - 1));
		output += chars.charAt(rnd);
	}
	return output;
}

Hash.prototype.clone = function() {
  var newHash = new Hash();

  this.each(function (pair) {
    newHash[pair.key] = pair.value;
  });

  return newHash;
}

if (Element.prototype.getBoundingClientRect != undefined) {
    Element.getRelativeBoundingClientRect = function(element1, element2) {
        var rect1 = element1.getBoundingClientRect();
        var rect2 = element2.getBoundingClientRect();
        return {
            top: rect1.top - rect2.top,
            left: rect1.left - rect2.left,
            right: rect1.right - rect2.left,
            bottom: rect1.bottom - rect2.top
        }
    }
} else {
    Element.getRelativeBoundingClientRect = function(element1, element2) {
    }
}

//    Hack for right HTTP verbs
Ajax.Request.prototype.request = function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

//    if (!['get', 'post'].include(this.method)) {
//      // simulate other verbs over post
//      params['_method'] = this.method;
//      this.method = 'post';
//    }

    this.parameters = params;

    if (params = Hash.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      if (this.options.onCreate) this.options.onCreate(this.transport);
      Ajax.Responders.dispatch('onCreate', this, this.transport);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous)
        setTimeout(function() { this.respondToReadyState(1) }.bind(this), 10);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

//      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.body = ['put', 'post'].include(this.method) ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  }
