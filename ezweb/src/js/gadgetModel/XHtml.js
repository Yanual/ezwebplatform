//////////////////////////////////////////////
//                  XHTML                   //
//////////////////////////////////////////////

function XHtml(xhtml_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************
	
	var uri = null;
	var elements = [];
	
	// JSON-coded XHtml mapping
	// Constructing the structure
	
	uri = xhtml_.uri;
	for (i = 0; i<xhtml_.elements.length; i++) {
		elements.push(new ElementsHtml(xhtml_.elements[i].id, xhtml_.elements[i].event, xhtml_.elements[i].handler));
	}
	
	// ****************
	//  PUBLIC METHODS
	// ****************
	
	XHtml.prototype.getURICode = function() { return uri; }
	XHtml.prototype.getElements = function() { return elements; }
}

//////////////////////////////////////////////
//              ELEMENTHTML                 //
//////////////////////////////////////////////

function ElementHtml(id_, event_, handler_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************

	var id = id_;
	var event = event_;
	var handler = handler_;
	
	// ****************
	//  PUBLIC METHODS
	// ****************
	
	ElementHtml.prototype.getId = function() { return id; }
	ElementHtml.prototype.getEvent = function() { return event; }
	ElementHtml.prototype.getHandler = function() { return handler; }
}