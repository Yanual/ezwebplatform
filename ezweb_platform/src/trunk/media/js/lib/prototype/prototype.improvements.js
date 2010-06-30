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
	keyPressed: function(event) {
		return Browser.isMSIE() ? window.event.keyCode : event.which;
	}
});

Element.prototype.triggerEvent = function(eventName)
{
    if (document.createEvent)
    {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, true);

        return this.dispatchEvent(evt);
    }

    if (this.fireEvent)
        return this.fireEvent('on' + eventName);
}


if ( window.EzSteroidsAPI.is_activated() ) {
	// Backup prototype observe method
	var _observe = Event.observe;

	Object.extend(Event, {
		// Old prototype observe method
		_observe: _observe,

		/*
		 * Event extension to manage user privileges
		 */
		observe: function(element, name, observer, useCapture, featureId) {
			if (featureId && !EzSteroidsAPI.evaluePolicy(featureId)) {
				// If the user isn't allowed
				observer = function(msg) {
					var msg = gettext("You are not allowed to perform this operation");
					LogManagerFactory.getInstance().showMessage(msg);
				}
			}
			this._observe(element, name, observer, useCapture);
		}
	});
}



var Browser = {
	
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


if (document.documentElement.textContent != undefined) {
	/**
	 * Changes the inner content of an Element treating it as pure text. If
	 * the provided text contains HTML special characters they will be encoded.
	 */
	Element.prototype.setTextContent = function(text) {
		this.textContent = text;
	}

	/**
	 * Return the inner content of an Element treating it as pure text. All
	 * encoded characters will be decoded.
	 */
	Element.prototype.getTextContent = function() {
		return this.textContent;
	}
} else if (document.documentElement.innerText != undefined) {
	Element.Methods.setTextContent = function(element, text) {
		element.innerText = text;
	}

	Element.Methods.getTextContent = function(element) {
		return element.innerText;
	}
}

if (Prototype.BrowserFeatures.ElementExtensions) {
	var isElement = function(el) {
		return el instanceof Element;
	}
} else {
	var isElement = function(el) {
		return el && ('nodeType' in el) && (el.nodeType === 1);
	}
}

//if (Prototype.Browser.IE || Element.prototype.getBoundingClientRect != undefined) {

if (document.documentElement.getBoundingClientRect != undefined) {
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
} else if (document.getBoxObjectFor != undefined) {
	Element.getRelativeBoundingClientRect = function(element1, element2) {
		var box1 = document.getBoxObjectFor(element1);
		var box2 = document.getBoxObjectFor(element2);
		return {
			top: box1.screenY - box2.screenY,
			left: box1.screenX - box2.screenX,
			right: box1.screenX + box1.width - box2.screenX,
			bottom: box1.screenY + box1.height - box2.screenY
		}
	}
} else {
	// Unsupported browser
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


/*
 * ARRAY EXTENSIONS
 */

Array.prototype.elementExists = function (element) {
	return this.indexOf(element) !== -1;
}

Array.prototype.getElementById = function (id) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].getId() == id)
			return this[i];
	}
	return null;
}

Array.prototype.getElementByName = function (elementName) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].getName() == elementName)
			return this[i];
	}
	return null;
}

Array.prototype.remove = function(element) {
	var index = this.indexOf(element);
	if (index != -1)
		this.splice(index, 1);
}

Array.prototype.removeById = function (id) {
	var element;
	var elementId;
	for (var i = 0; i < this.length; i++) {
		if (typeof this[i].getId == "function") {
			elementId = this[i].getId();
		} else {
			elementId = this[i].id;
		}

		if (elementId == id) {
			element = this[i];
			this.splice(i, 1);
			return element;
		}
	}
	return null;
}


/*
 * COOKIE EXTENSIONS
 */

var CookieManager = new Object();

/**
 * Creates or updates a cookie.
 *
 * @param {String} name cookie name
 * @param {String | Object} value value for this cookie
 * @param {Number} days number of days this cookie will be valid
 */
CookieManager.createCookie = function(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	} else {
		var expires = "";
	}

	if (typeof value === 'object')
		value = value.toJSON();

	document.cookie = name+"="+value+expires+"; path=/";
}

/**
 * Reads a cookie
 *
 * @param {String} name name of the cookie to read
 * @param {Boolean} json thread cookie data as json
 *
 * @return
 */
CookieManager.readCookie = function(name, json) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) {
			var value = c.substring(nameEQ.length,c.length);
			if (json) {
				try {
					return value.evalJSON();
				} catch (e) {
					return null;
				}
			} else {
				return value;
			}
		}
	}
	return null;
}

/**
 * Erases a cookie.
 *
 * @param {String} name
 */
CookieManager.eraseCookie = function(name) {
	createCookie(name, "", -1);
}

/**
 * Renew a cookie if it already exists.
 */
CookieManager.renewCookie = function(name, days) {
	var cookieValue = this.readCookie(name);
	if (cookieValue !== null) {
		this.createCookie(name, cookieValue, days);
	}
}

/*----------------------------------------------------------------------------*
 *                                                                            *
 *----------------------------------------------------------------------------*/

var useInternalComputedStyle = window.getComputedStyle === undefined;
if (!useInternalComputedStyle) {
	var computedStyle = document.defaultView.getComputedStyle(document.body, null);
	try {
		var width = computedStyle.getPropertyCSSValue('width');
		width = width.getFloatValue(CSSPrimitiveValue.CSS_PX);
	} catch (e) {
		useInternalComputedStyle = true;

		var _nativeGetComputedStyle = document.defaultView.getComputedStyle;
		var _internalGetCurrentStyle = function(element, property, ieProperty) {
			var computedStyle = _nativeGetComputedStyle.call(document.defaultView, element, null);
			return computedStyle.getPropertyValue(property);
		}
	}
} else {
	var _internalGetCurrentStyle = function(element, property, ieProperty) {
		var value = element.currentStyle[ieProperty];

		if (value == 'auto')
			value = element.runtimeStyle[ieProperty];

		return value;
	}
}

if (useInternalComputedStyle) {
	/**
	 * Partial implementation of CSSPrimitiveValue.
	 */
	function CSSPrimitiveValue(element, property, ieProperty) {
		if (arguments.length == 0)
			return;

		this._element = element;
		this._property = property;
		this._ieProperty = ieProperty;

		this.cssText = _internalGetCurrentStyle(this._element,
		                                        this._property,
		                                        this._ieProperty);
	}
	CSSPrimitiveValue.CSS_PX = 1;
	CSSPrimitiveValue._ValueRegExp = new RegExp('\(\\d+|\\d+.\\d+\)\(\\w+\)');

	CSSPrimitiveValue.prototype.getFloatValue = function(unit) {
		switch (unit) {
		case CSSPrimitiveValue.CSS_PX:
			if (this.cssText == "")
				return 0;

			var parentNode = this._element.parentNode;
			var testElement = this._element.ownerDocument.createElement('div');
			testElement.style.visibility = "hidden";
			testElement.style.padding = "0";
			testElement.style.margin = "0";
			testElement.style.border = "0";

			var matching = /border-(top|right|bottom|left)-width/.exec(this._property);
			var side = matching !== null ? matching[1] : null;

			// Test if the css value has a basic value (px, em, ex)
			matching = CSSPrimitiveValue._ValueRegExp.exec(this.cssText);
			if (matching != null) {
				var value = matching[1];
				var units = matching[2];
				if (units == "px")
					// Value is already in pixels
					return parseInt(value);
				else
					testElement.style.height = this.cssText;
			} else if ((matching == null) && (side != null)) {
				var property = 'border-' + side + '-style';
				var ieProperty = ComputedCSSStyleDeclaration.prototype._getIEProperty(property);
				var borderStyle = _internalGetCurrentStyle(this._element, property, ieProperty);
				if (borderStyle == "none")
					return 0;

				// border width accepts special values: medium, normal, ...
				var extraElement = this._element.ownerDocument.createElement('div');
				testElement.style.fontSize = "0";
				testElement.style.lineHeight = "0";
				extraElement.style.padding = "0";
				extraElement.style.margin = "0";
				extraElement.style.border = "0";
				extraElement.style.width = "1px";
				extraElement.style.borderTopWidth = this.cssText;
				extraElement.style.borderTopStyle = borderStyle;
				testElement.appendChild(extraElement);
			} else {
				throw new Error();
			}

			parentNode.appendChild(testElement);

			if (testElement.offsetHeight != null) {
				var result = testElement.offsetHeight;
			} else {
				throw new Error();
			}

			parentNode.removeChild(testElement);

			return result;
			break;
		default:
			throw new Error();
		}
	}

	CSSPrimitiveValue._rgbaColorParser = new RegExp('rgba\\\(\\s*\(\\d+\)\\s*,\\s*\(\\d+\)\\s*,\\s*\(\\d+\)\\s*\\\,\\s*\(\\d+\)\\s*\\\)');
	CSSPrimitiveValue._rgbColorParser = new RegExp('rgb\\\(\\s*\(\\d+\)\\s*,\\s*\(\\d+\)\\s*,\\s*\(\\d+\)\\s*\\\)');
	CSSPrimitiveValue._hexColorParser = new RegExp('#\([0-9A-F]{2}\)\([0-9A-F]{2}\)\([0-9A-F]{2}\)', 'i');
	/**
	 *
	 */
	CSSPrimitiveValue.prototype.getRGBColorValue = function() {
		switch (this._property) {
		case 'background-color':
		case 'color':
			var red, green, blue, alpha = '1';
			var matching = CSSPrimitiveValue._rgbColorParser.exec(this.cssText);
			if (matching !== null) {
				red = matching[1];
				green = matching[2];
				blue = matching[3];
			} else {
				matching = CSSPrimitiveValue._rgbaColorParser.exec(this.cssText);
				if (matching !== null) {
					red = matching[1];
					green = matching[2];
					blue = matching[3];
					alpha = matching[4];
				} else {
					matching = CSSPrimitiveValue._hexColorParser.exec(this.cssText);
					if (matching === null) {
						var parentNode = this._element.parentNode;
						var testElement = this._element.ownerDocument.createElement('table');
						testElement.setAttribute('bgcolor', this.cssText);
						testElement.style.visibility = "hidden";
						parentNode.appendChild(testElement);
						var bgColor = testElement.bgColor;
						matching = CSSPrimitiveValue._hexColorParser.exec(bgColor);
						if (matching === null)
							throw new Error('Error on getRGBColorValue');

						parentNode.removeChild(testElement);
					}

					function hex2value(hex) {
						hex = hex.toUpperCase();
						return ("0123456789ABCDEF".indexOf(hex.substr(0,1)) * 16) +
						       "0123456789ABCDEF".indexOf(hex.substr(1,1));
					}

					// Build the result
					var red = hex2value(matching[1]);
					var green = hex2value(matching[2]);
					var blue = hex2value(matching[3]);
				}
			}

			var result = new Object();
			result.red = new CSSColorComponentValue(red);
			result.green = new CSSColorComponentValue(green);
			result.blue = new CSSColorComponentValue(blue);
			result.alpha = new CSSColorComponentValue(alpha);
			return result;
			break;
		default:
			throw new Error();
		}
	}

	/**
	 *
	 */
	function CSSColorComponentValue(value) {
		this.cssText = "" + value;
	}
	CSSColorComponentValue.prototype = new CSSPrimitiveValue();

	CSSColorComponentValue.prototype.getFloatValue = function(unit) {
		return parseInt(this.cssText);
	}

	/**
	 * Partial implementation of ComputedCSSStyleDeclaration
	 */
	function ComputedCSSStyleDeclaration(element) {
		this._element = element;
	}

	ComputedCSSStyleDeclaration.prototype._getIEProperty = function(property) {
		switch (property) {
		case 'float':
			return "cssFloat";
		default:
			return property.replace(/-\w/g, function(a){return a.substr(1,1).toUpperCase()});
		}
	}

	ComputedCSSStyleDeclaration.prototype.getPropertyCSSValue = function(property) {
		return new CSSPrimitiveValue(this._element, property, this._getIEProperty(property));
	}

	ComputedCSSStyleDeclaration.prototype.getPropertyValue = function(property) {
		return _internalGetCurrentStyle(this._element,
		                                property,
		                                this._getIEProperty(property));
	}

	/**
	 * WARNING This is not a full implementation of the getComputedStyle, some
	 * things will not work.
	 *
	 * @param element
	 * @param context not used by this implementation
	 */
	window.getComputedStyle = function(element, context) {
		return new ComputedCSSStyleDeclaration(element);
	}

	if (document.defaultView === undefined)
		document.defaultView = window;
}