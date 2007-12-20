//////////////////////////////////////////////
//                  XHTML                   //
//////////////////////////////////////////////

function XHtml(xhtml_) {
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************
	
	var uri = null;
	uri = xhtml_.uri;

	
	// ****************
	//  PUBLIC METHODS
	// ****************
	
	this.getURICode = function() { return uri; }
}

