if (!("elementFromPoint" in document)) {

	var elementPositions = function () {
		// *********************************
		// PRIVATE VARIABLES
		// *********************************
		this.elements = [];

		this.getElementByPoint = function(x, y){
			for (var i=0; i<this.elements.length; i++){
				var element = this.elements[i];
				var box = element.ownerDocument.getBoxObjectFor(element);			
				if (box.x <= x && x <= (box.x+box.width) && box.y <= y && y <= (box.y+box.height)) {
					return element;
				}
			}
			return null;
		}

		this.addElement = function(element){
			this.elements.push(element);
		}

		this.removeElement = function(element){
			this.elements = this.elements.without(element);
		}
	};
	
	elementPositions = new elementPositions();

	document.elementFromPoint = function(x, y) {
		return elementPositions.getElementByPoint(x, y);
	}
	
	// Adding a new css rule for the tabs
	var css = document.styleSheets[1];
	css.insertRule('#tab_section .tab {-moz-binding: url("elementfrompoint.xbl#default")}', css.cssRules.length);
}
