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

/////////////////////////////////////
// FreeLayout
/////////////////////////////////////

/**
 * Represents a dragboard layout to be used to place igadgets into the dragboard.
 *
 * This dragobard uses percentages for horizontal units and mm for vertical units
 *
 * @param dragboard      associated dragboard
 * @param scrollbarSpace space reserved for the right scroll bar in pixels
 */
function FreeLayout(dragboard, scrollbarSpace) {
	if (arguments.length == 0)
		return; // Allow empty constructor (allowing hierarchy)

	DragboardLayout.call(this, dragboard, scrollbarSpace);

	this.scrollbarSpace = scrollbarSpace;

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

function unitConvert(element, from, toUnits, value) {
	// Create a square div using the given value
	var testDiv = document.createElement("div");
	testDiv.style.height = value;
	testDiv.style.width = value;
	testDiv.style.visibility = "hidden";
	element.appendChild(testDiv);

	// Retrieve target measurements
	var xres = getComputedStyle(testDiv, null).getPropertyCSSValue("width").getFloatValue(toUnits);
	var yres = getComputedStyle(testDiv, null).getPropertyCSSValue("height").getFloatValue(toUnits);

	// Remove the test element
	testDiv.parentNode.removeChild(testDiv);

	// Return results in an array
	return Array(xres,yres);
}

FreeLayout.prototype = new DragboardLayout();

FreeLayout.prototype.getWidth = function() {
	return this.dragboardWidth;
}

FreeLayout.prototype.fromPixelsToVCells = function(pixels) {
	return pixels;
}

FreeLayout.prototype.fromVCellsToPixels = function(cells) {
	return cells;
}

FreeLayout.prototype.getWidthInPixels = function (cells) {
	return this.fromHCellsToPixels(cells);
}

FreeLayout.prototype.getHeightInPixels = function (cells) {
	return this.fromVCellsToPixels(cells);
}

FreeLayout.prototype.fromHCellsToPixels = function(cells) {
	return Math.ceil((this.dragboardWidth * cells) / 100);
}

FreeLayout.prototype.fromHCellsToPercentage = function(cells) {
	return cells;
}

FreeLayout.prototype.getColumnOffset = function(column) {
	return Math.ceil((this.dragboardWidth * column) / 100);
}

FreeLayout.prototype.getRowOffset = function(row) {
	return row;
}

FreeLayout.prototype._notifyResizeEvent = function(iGadget, oldWidth, oldHeight, newWidth, newHeight, resizeLeftSide, persist) {
	// Nothing to do, except if we have to persit the changes
	if (persist) {
		// Save new position into persistence
		this.dragboard._commitChanges([iGadget.code]);
	}
}

FreeLayout.prototype.initialize = function (iGadgets) {
	var iGadget, key;

	this.iGadgets = iGadgets;

	// Insert igadgets
	var igadgetKeys = iGadgets.keys();
	for (var i=0; i<igadgetKeys.length; i++) {
		key = igadgetKeys[i];
		iGadget = iGadgets[key];
		iGadget.paint();
	}
}

/**
 * Calculate what cell is at a given position in pixels
 */
FreeLayout.prototype.getCellAt = function (x, y) {
	return new DragboardPosition((x * 100) / this.dragboardWidth,
	                             y);
}

FreeLayout.prototype.addIGadget = function(iGadget, affectsDragboard) {
	DragboardLayout.prototype.addIGadget.call(this, iGadget, affectsDragboard);
	iGadget.setPosition(new DragboardPosition(0, 0));
}

FreeLayout.prototype.initializeMove = function(igadget) {
	this.igadgetToMove = igadget;
	this.newPosition = igadget.getPosition().clone();
}

FreeLayout.prototype.moveTemporally = function(x, y) {
	this.newPosition.x = x;
	this.newPosition.y = y;
}

FreeLayout.prototype._acceptMove = function() {
	if (this.newPosition.x > 99)
		this.newPosition.x = 99;
	if (this.newPosition.y < 0)
		this.newPosition.y = 0;

	this.igadgetToMove.setPosition(this.newPosition);
	this.igadgetToMove._notifyWindowResizeEvent();
	this.dragboard._commitChanges([this.igadgetToMove.code]);

	this.igadgetToMove = null;
	this.newPosition = null;
}

FreeLayout.prototype.cancelMove = function() {
	this.igadgetToMove._notifyWindowResizeEvent();
	this.igadgetToMove = null;
	this.newPosition = null;
}
