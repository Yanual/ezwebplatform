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
 * @author aarranz
 */

/////////////////////////////////////
// DragboardLayout
/////////////////////////////////////

/**
 * Represents a dragboard layout to be used to place igadgets into the dragboard.
 * Despite javascript not having a way to mark classes abstract, this class is
 * abstract, so please do not try to create an instance of this clase.
 *
 * @param dragboard      associated dragboard
 * @param scrollbarSpace space reserved for the right scroll bar in pixels
 */
function DragboardLayout(dragboard, scrollbarSpace) {
	if (arguments.length == 0)
		return; // Allow empty constructor (allowing hierarchy)

	this.dragboard = dragboard;
	this.scrollbarSpace = scrollbarSpace;
	this.iGadgets = new Hash();

	// Window Resize event dispacher function
	this._notifyWindowResizeEvent = function () {
		this._recomputeSize();

		// Notify each igadget
		var iGadget;
		var igadgetKeys = this.iGadgets.keys();
		for (var i = 0; i < igadgetKeys.length; i++) {
			iGadget = this.iGadgets[igadgetKeys[i]];
			iGadget._notifyWindowResizeEvent();
		}
	}.bind(this);

	this._recomputeSize();
	Event.observe(window, 'resize', this._notifyWindowResizeEvent);
}

DragboardLayout.prototype.getMenubarSize = function() {
	return 18; // TODO calculate this
}

DragboardLayout.prototype.getMenubarSizeInCells = function() {
	return Math.ceil(this.fromPixelsToVCells(this.getMenubarSize()));
}

DragboardLayout.prototype.getStatusbarSize = function() {
	return 16; // TODO calculate this
}

DragboardLayout.prototype.getExtraCells = function() {
	var sizeInPixels = this.getMenubarSize() + this.getStatusbarSize();
	return Math.ceil(this.fromPixelsToVCells(sizeInPixels));
}

/////////////////////////////////////
// Layout Units (LU) conversion.
/////////////////////////////////////

/**
 * Converts
 */
DragboardLayout.prototype.adaptColumnOffset = function(pixels) {
	throw new Exception("Unimplemented method");
}

/**
 * This function is slow. Please, only call it when really necessary.
 */
DragboardLayout.prototype._recomputeSize = function() {
	var dragboardElement = this.dragboard.dragboardElement;
	this.dragboardWidth = parseInt(dragboardElement.offsetWidth);

	var tmp = this.dragboardWidth;
	tmp-= parseInt(dragboardElement.clientWidth);

	if (tmp > this.scrollbarSpace)
		this.dragboardWidth-= tmp;
	else
		this.dragboardWidth-= this.scrollbarSpace;
}

/**
 * Checks if the point is inside the dragboard
 *
 * @param x  X coordinate
 * @param y  Y coordinate
 * @return   true if the point is inside
 */
DragboardLayout.prototype.isInside = function (x, y) {
	return (x >= 0) && (x < this.dragboardWidth) && (y >= 0);
}

/**
 * Gets the width of the usable dragboard area
 *
 * @return The width of the usable dragboard area
 */
DragboardLayout.prototype.getWidth = function() {
	return this.dragboardWidth;
}

/**
 * Adds an iGadget to this layout.
 * @param iGadget          iGadget to add
 * @param affectsDragboard true if the associated dragboard must be notified
 */
DragboardLayout.prototype.addIGadget = function(iGadget, affectsDragboard) {
	if (affectsDragboard) {
		this.dragboard._registerIGadget(iGadget);

		if (iGadget.element != null) // TODO
			this.dragboard.dragboardElement.appendChild(iGadget.element);
	}

	this.iGadgets[iGadget.code] = iGadget;
}

/**
 * Removes an iGadget from this layout.
 * @param iGadget          iGadget to remove
 * @param affectsDragboard true if the associated dragboard must be notified
 */
DragboardLayout.prototype.removeIGadget = function(iGadget, affectsDragboard) {
	delete this.iGadgets[iGadget.code];

	if (affectsDragboard) {
		this.dragboard._deregisterIGadget(iGadget);

		if (iGadget.element != null) // TODO
			this.dragboard.dragboardElement.removeChild(iGadget.element);
	}
}

/**
 * Disables the cursor if it is active. This method must be implemented by
 * real Layout classes whether they use cursors. The default implementation
 * does nothing.
 */
DragboardLayout.prototype.disableCursor = function() {
}

/**
 * This method must be called to avoid memory leaks caused by circular references.
 */
DragboardLayout.prototype.destroy = function() {
	Event.stopObserving(window, 'resize', this._notifyWindowResizeEvent);

	var keys = this.iGadgets.keys();
	for (var i = 0; i < keys.length; i++) {
		this.iGadgets[keys[i]].destroy();
	}
	this.iGadgets = null;
}

DragboardLayout.prototype.acceptMove = function(iGadget, newposition) {
	iGadget.setPosition(newposition);
}

DragboardLayout.prototype.measure = function(testElement, units) {
	testElement.style.visibility = "hidden";
	this.dragboard.dragboardElement.appendChild(testElement);

	// Retrieve target measurements
	var res = new Array();
	res[0] = getComputedStyle(testElement, null).getPropertyCSSValue("width").getFloatValue(units);
	res[1] = getComputedStyle(testElement, null).getPropertyCSSValue("height").getFloatValue(units);

	// Remove the test element
	testElement.parentNode.removeChild(testElement);

	return res;
}

DragboardLayout.prototype.unitConvert = function(value, newUnits) {
	// Create a square div using the given value
	var testDiv = document.createElement("div");
	testDiv.style.height = value;
	testDiv.style.width = value;

	return this.measure(testDiv, newUnits);
}

/////////////////////////////////////
// MultiValuedSize
/////////////////////////////////////

function MultiValuedSize (inPixels, inLU) {
	this.inPixels = inPixels;
	this.inLU = inLU;
}
