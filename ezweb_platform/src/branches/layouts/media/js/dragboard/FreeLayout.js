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
 * @class Represents a dragboard layout to be used to place igadgets into the dragboard.
 *
 * This dragobard uses percentages for horizontal units and px for vertical units.
 *
 * @extends DragboardLayout
 */
function FreeLayout(dragboard, scrollbarSpace) {
	if (arguments.length == 0)
		return; // Allow empty constructor (allowing hierarchy)

	DragboardLayout.call(this, dragboard, scrollbarSpace);
}

FreeLayout.prototype = new DragboardLayout();

FreeLayout.prototype.MAX_HLU = 1000000;

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

FreeLayout.prototype.fromPixelsToHCells = function(pixels) {
	return (pixels  * this.MAX_HLU/ this.dragboardWidth);
}

FreeLayout.prototype.fromHCellsToPixels = function(cells) {
	return Math.ceil((this.dragboardWidth * cells) / this.MAX_HLU);
}

FreeLayout.prototype.fromHCellsToPercentage = function(cells) {
	return cells / (this.MAX_HLU / 100);
}

FreeLayout.prototype.getColumnOffset = function(column) {
	return Math.ceil((this.dragboardWidth * column) / this.MAX_HLU);
}

FreeLayout.prototype.getRowOffset = function(row) {
	return row;
}

FreeLayout.prototype.adaptColumnOffset = function(pixels) {
	var offsetInLU = Math.ceil(this.fromPixelsToHCells(pixels));
	return new MultiValuedSize(this.fromHCellsToPixels(offsetInLU), offsetInLU);
}

FreeLayout.prototype.adaptRowOffset = function(pixels) {
	return new MultiValuedSize(pixels, pixels);
}

FreeLayout.prototype.adaptHeight = function(contentHeight, fullSize) {
	return new MultiValuedSize(contentHeight, fullSize);
}

FreeLayout.prototype.adaptWidth = function(contentWidth, fullSize) {
	var widthInLU = Math.floor(this.fromPixelsToHCells(fullSize));
	return new MultiValuedSize(this.fromHCellsToPixels(widthInLU), widthInLU);
}

FreeLayout.prototype._notifyResizeEvent = function(iGadget, oldWidth, oldHeight, newWidth, newHeight, resizeLeftSide, persist) {
	if (resizeLeftSide) {
		var widthDiff = newWidth - oldWidth;
		var position = iGadget.getPosition();
		position.x -= widthDiff;

		if (persist)
			iGadget.setPosition(position);
		else
			iGadget._notifyWindowResizeEvent();
	}

	if (persist) {
		// Save new position into persistence
		this.dragboard._commitChanges([iGadget.code]);
	}
}

FreeLayout.prototype.initialize = function () {
	var iGadget, key;

	// Insert igadgets
	var igadgetKeys = this.iGadgets.keys();
	for (var i = 0; i < igadgetKeys.length; i++) {
		key = igadgetKeys[i];
		iGadget = this.iGadgets[key];
		iGadget.paint();
	}
}

/**
 * Calculate what cell is at a given position in pixels
 */
FreeLayout.prototype.getCellAt = function (x, y) {
	return new DragboardPosition((x * this.MAX_HLU) / this.dragboardWidth,
	                             y);
}

FreeLayout.prototype.addIGadget = function(iGadget, affectsDragboard) {
	DragboardLayout.prototype.addIGadget.call(this, iGadget, affectsDragboard);

	if (iGadget.getPosition() == null)
		iGadget.setPosition(new DragboardPosition(0, 0));
}

FreeLayout.prototype.initializeMove = function(igadget, draggable) {
	draggable = draggable || null; // default value for the draggable parameter

	// Check for pendings moves
	if (this.igadgetToMove != null) {
		var msg = gettext("There was a pending move that was cancelled because initializedMove function was called before it was finished.")
		LogManagerFactory.getInstance().log(msg, Constants.WARN_MSG);
		this.cancelMove();
	}

	this.igadgetToMove = igadget;
	this.newPosition = igadget.getPosition().clone();

	if (draggable) {
		draggable.setXOffset(0);
		draggable.setYOffset(0);
	}
}

FreeLayout.prototype.moveTemporally = function(x, y) {
	if (this.igadgetToMove == null) {
		var msg = gettext("Dragboard: You must call initializeMove function before calling to this function (moveTemporally).");
		LogManagerFactory.getInstance().log(msg, Constants.WARN_MSG);
		return;
	}

	this.newPosition.x = x;
	this.newPosition.y = y;
}

FreeLayout.prototype.acceptMove = function() {
	if (this.igadgetToMove == null) {
		var msg = gettext("Function acceptMove called when there is not an started igadget move.");
		LogManagerFactory.getInstance().log(msg, Constants.WARN_MSG);
		return;
	}

	if (this.newPosition.x > (this.MAX_HLU - 1))
		this.newPosition.x = (this.MAX_HLU - 1);
	if (this.newPosition.y < 0)
		this.newPosition.y = 0;

	this.igadgetToMove.setPosition(this.newPosition);
	this.igadgetToMove._notifyWindowResizeEvent();
	this.dragboard._commitChanges([this.igadgetToMove.code]);

	this.igadgetToMove = null;
	this.newPosition = null;
}

FreeLayout.prototype.cancelMove = function() {
	if (this.igadgetToMove == null) {
		var msg = gettext("Trying to cancel an inexistant temporal move.");
		LogManagerFactory.getInstance().log(msg, Constants.WARN_MSG);
		return;
	}

	this.igadgetToMove._notifyWindowResizeEvent();
	this.igadgetToMove = null;
	this.newPosition = null;
}
