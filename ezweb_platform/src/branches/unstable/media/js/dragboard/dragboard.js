/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


// TODO split this file

/**
 * @author aarranz
 */
function Dragboard(tabInfo, workSpace, dragboardElement) {
	// *********************************
	// PRIVATE VARIABLES
	// *********************************
	this.loaded = false;
	this.currentCode = 1;
	this.matrix = null;          // Matrix of gadget
	this.shadowMatrix = null;    // Temporal matrix of gadgets used for D&D
	this.shadowPositions = null;
	this.dragboardElement = null;
	this.dragboardStyle = null;
	this.dragboardCursor = null;
	this.gadgetToMove = null;
	this.iGadgets = new Hash();
	this.tabId = tabInfo.id;
	this.workSpace = workSpace;
	this.workSpaceId = workSpace.workSpaceState.id;

	// ***********************
	// PRIVATED FUNCTIONS 
	// ***********************
	Dragboard.prototype.paint = function (receivedData) {
		var iGadget, key, position, iGadgetsToReinsert = new Array(); // oldWidth, oldHeight

		this.dragboardElement.innerHTML = "";

		this._clearMatrix();

		// Insert igadgets
		var igadgetKeys = this.iGadgets.keys();
		for (var i=0; i<igadgetKeys.length; i++) {
			key = igadgetKeys[i];
			
			iGadget = this.iGadgets[key];

			position = iGadget.getPosition();
			// height + 2 for check that there is space with margins (1 cell at top and another at bottom)
			if (this._hasSpaceFor(this.matrix, position.x, position.y - 1, iGadget.getContentWidth(), iGadget.getHeight() + 2)) {
				iGadget.paint(this.dragboardElement);
				this._reserveSpace(this.matrix, iGadget);
			} else {
				iGadgetsToReinsert.push(iGadget);
			}
		}

		// Reinsert the igadgets that didn't fit in their positions
		for (i = 0; i < iGadgetsToReinsert.length; i++) {
			position = this._searchFreeSpace(iGadgetsToReinsert[i].getContentWidth(),
			                            iGadgetsToReinsert[i].getHeight());
			iGadgetsToReinsert[i].setPosition(position);
			iGadgetsToReinsert[i].paint(this.dragboardElement);
			this._reserveSpace(this.matrix, iGadgetsToReinsert[i]);
		}

		// remove holes moving igadgets to the topmost positions
		var iGadget;
		var keys = this.iGadgets.keys();
		for (var i = 0; i < keys.length; i++) {
			iGadget = this.iGadgets[keys[i]];
//				oldWidth = iGadget.getContentWidth();
//				oldHeight = iGadget.getHeight();
//				iGadget.height = null;
//				_resize(iGadget, oldWidth, oldHeight, iGadget.getContentWidth(), iGadget.getHeight());
			this._moveSpaceUp(this.matrix, iGadget);
		};
	}

	this._getPositionOn = function(_matrix, gadget) {
		if (_matrix == this.matrix)
			return gadget.getPosition();
		else
			return this.shadowPositions[gadget.getId()];
	}

	this._setPositionOn = function(_matrix, gadget, position) {
		if (_matrix == this.matrix)
			gadget.setPosition(position);
		else
			this.shadowPositions[gadget.getId()] = position;
	}

	this._destroyCursor = function(clearSpace) {
		if (this.dragboardCursor != null) {
			this.dragboardCursor.destroy();
			if (clearSpace)
				this._removeFromMatrix(this.matrix, this.dragboardCursor);
			this.dragboardCursor = null;
		}
	}

	this._clearMatrix = function() {
		this.matrix = new Array();

		for (var x = 0; x < this.dragboardStyle.getColumns(); x++)
			this.matrix[x] = new Array();
	}

	this._hasSpaceFor = function(_matrix, positionX, positionY, width, height) {
		var x, y;

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				if (_matrix[positionX + x][positionY + y] != null)
					return false;

		return true;
	}

	this._reserveSpace = function(_matrix, iGadget) {
		var x, y;
		var position = this._getPositionOn(_matrix, iGadget);
		var width = iGadget.getContentWidth();
		var height = iGadget.getHeight();

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				_matrix[position.x + x][position.y + y] = iGadget;
	}

	this._clearSpace = function(_matrix, iGadget) {
		var x, y;
		var position = this._getPositionOn(_matrix, iGadget);
		var width = iGadget.getContentWidth();
		var height = iGadget.getHeight();

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				delete _matrix[position.x + x][position.y + y];
	}

	this._searchInsertPoint = function(_matrix, x, y, width, height) {
		// Search the topmost position for the gadget

		// First if in the current position there is a gadget then... use atleat its position
		if (_matrix[x][y] != null) {
   				y = this._getPositionOn(_matrix, _matrix[x][y]).y - 1;
		}

		// If we are
		if ((y == 0) || (_matrix[x][y - 1] != null)) {
			y++;
		} else {
			var originalY = y;
			var lastY;
			var found = false;
			while ((y > 0) && (this._hasSpaceFor(_matrix, x, y - 1, width, 1))) {
//					if (_hasSpaceFor(_matrix, x, y, width, 1)) { // Skip margins spaces
					found = true;
					lastY = y;
//					}
				y--;
			}
			if (found) {
				y = lastY;
			} else {
				// Search collisions with gadgets of other columns
				var curGadget;
				var offsetX;
				lastY = 0;
				for (offsetX = 1; offsetX < width; offsetX++) {
					curGadget = _matrix[x + offsetX][originalY];
					if ((curGadget != null)) {
						y = this._getPositionOn(_matrix, curGadget).y;

						if (y > lastY) lastY = y;
					}
				}

				if (lastY > 0) {
					y = lastY;
				} else {
					y = originalY + 1;
				}
			}
		}
		return y;
	}

	this._moveSpaceDown = function(_matrix, iGadget, offsetY) {
		var affectedIGadgets = new Hash();
		var position = this._getPositionOn(_matrix, iGadget);
		var finalPosition = position.clone();
		finalPosition.y += offsetY;

		var edgeY = position.y + iGadget.getHeight() + 1; // we have to take in care the border so +1

		// Search affected gadgets
		// TODO move gadgets according to the biggest offset for optimizing
		var igadget, x, y;
		for (x = 0; x < iGadget.getContentWidth(); x++)
			for (y = 0; y < offsetY; y++) {
				igadget = _matrix[position.x + x][edgeY + y];
				if (igadget != null) {
					affectedIGadgets[igadget.getId()] = offsetY - y; // calculate the offset for this igadget
					break; // continue whit the next column
				}
			}

		// Move affected gadgets instances
		var keys = affectedIGadgets.keys();
		var igadget, i, key;
		for (i = 0; i < keys.length; i++) {
			key = keys[i];
			igadget = this.iGadgets[key];
			this._moveSpaceDown(_matrix, igadget, affectedIGadgets[key]);
		}

		// Move the gadget
		this._clearSpace(_matrix, iGadget);
		this._setPositionOn(_matrix, iGadget, finalPosition);
		this._reserveSpace(_matrix, iGadget);
	}

	this._moveSpaceUp = function(_matrix, iGadget) {
		var position = this._getPositionOn(_matrix, iGadget);
		var edgeY = position.y + iGadget.getHeight() + 1; // we have to take in care the border so +1

		var offsetY;
		for (offsetY = 1;
             ((position.y - offsetY) >= 0) && this._hasSpaceFor(_matrix, position.x, position.y - offsetY, iGadget.getContentWidth(), 1);
             offsetY++);

		if (offsetY > 1) {
			var affectedIGadgets = new Hash();
			var finalPosition = position.clone();
			finalPosition.y -= (offsetY - 2); // TODO

			// Search affected gadgets
			// TODO move the topmost gadget for optimizing
			var igadget, x, y, columnsize;
			for (x = 0; x < iGadget.getContentWidth(); x++) {
				columnsize = _matrix[position.x + x].length;
				for (y = edgeY; y < columnsize; y++) {
					igadget = _matrix[position.x + x][y];
					if (igadget != null) {
						affectedIGadgets[igadget.getId()] = igadget;
						break; // continue whit the next column
					}
				}
			}

			// Move the representation of the gadget
			this._clearSpace(_matrix, iGadget);
			this._setPositionOn(_matrix, iGadget, finalPosition);
			this._reserveSpace(_matrix, iGadget);

			// Move affected gadgets instances
			var keys = affectedIGadgets.keys();
			var i;
			for (i = 0; i < keys.length; i++)
				this._moveSpaceUp(_matrix, affectedIGadgets[keys[i]]);
		}
	}

	this._removeFromMatrix = function(_matrix, iGadget) {
		this._clearSpace(_matrix, iGadget);

		var affectedIGadgets = new Hash();
		var affectedgadget, x, y, columnsize;
		var position = this._getPositionOn(_matrix, iGadget);
		var edgeY = position.y + iGadget.getHeight() + 1; // we have to take in care the border so +1

		// check if we have to update the representations of the gadget instances
		for (x = 0; x < iGadget.getContentWidth(); x++) {
			columnsize = _matrix[position.x + x].length;
			for (y = edgeY; y < columnsize; y++) {
				affectedgadget = _matrix[position.x + x][y];
				if ((affectedgadget != null) && (affectedIGadgets[affectedgadget.getId()] == undefined)) {
					affectedIGadgets[affectedgadget.getId()] = 1;
					this._moveSpaceUp(_matrix, affectedgadget);
					break;
				}
			}
		}
	}

	this._reserveSpace2 = function(_matrix, iGadget, positionX, positionY, width, height) {
		var x, y;

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				_matrix[positionX + x][positionY + y] = iGadget;
	}

	this._clearSpace2 = function(_matrix, positionX, positionY, width, height) {
		var x, y;

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				delete _matrix[positionX + x][positionY + y];
	}

	this._resize = function(iGadget, oldWidth, oldHeight, newWidth, newHeight) {
		var x, y, step2Width = oldWidth;
		var position = iGadget.getPosition();

		// First Step
		if (newWidth > oldWidth) {
			// TODO implement this
			// Calculate the width for the next step
//				step2Width = oldWidth; // don't needed (default value)
		} else if (newWidth < oldWidth) {
			this._clearSpace2(this.matrix, position.x + newWidth, position.y, oldWidth - newWidth, oldHeight);
			// TODO implement this
			// Calculate the width for the next step
			step2Width = newWidth;
		}// else {
			// Calculate the width for the next step
//				step2Width = oldWidth; // don't needed (default value)
//			}

		// Second Step
		if (newHeight > oldHeight) {
			var limitY = position.y + newHeight + 1;
			var limitX = position.x + step2Width;
			for (y = position.y + oldHeight + 1; y < limitY; y++)
				for (x = position.x; x < limitX; x++)
					if (this.matrix[x][y] != null)
						this._moveSpaceDown(this.matrix, this.matrix[x][y], limitY - y);

			// Reserve Space
			this._reserveSpace2(this.matrix, iGadget, position.x, position.y + oldHeight, step2Width, newHeight - oldHeight);
		} else if (newHeight < oldHeight) {
			// Clear freed space
			this._clearSpace2(this.matrix, position.x, position.y + newHeight, step2Width, oldHeight - newHeight);

			y = position.y + oldHeight + 1; // Search in the edge of the gadget
			var limitX = position.x + step2Width;
			for (x = position.x; x < limitX; x++)
				if (this.matrix[x][y] != null)
					this._moveSpaceUp(this.matrix, this.matrix[x][y]);
		}
	}

	this._insertAt = function(iGadget, x, y) {
		var newPosition = new DragboardPosition(x, y);

		// Move other instances
		var affectedIGadgets = new Hash();
		var affectedgadget, x, offset, affectedY;

		for (x = 0; x < iGadget.getContentWidth(); x++)
			for (y = 0; y < iGadget.getHeight(); y++) {
				affectedgadget = this.matrix[newPosition.x + x][newPosition.y + y];
				if ((affectedgadget != null) && (affectedIGadgets[affectedgadget.getId()] == undefined)) {
					// only move the gadget if we didn't move it before
					affectedIGadgets[affectedgadget.getId()] = null;
					// we have to add a border so +1
					offset = iGadget.getHeight() + 1 - y;
					y = newPosition.y + y;
					affectedY = affectedgadget.getPosition().y;
					if (affectedY < y)
						offset += y - affectedY;
					this._moveSpaceDown(this.matrix, affectedgadget,  offset);
					// move only the topmost gadget in the column
					break;
				}
			}

		// Change Gadget instance position (insert it)
		iGadget.setPosition(newPosition);

		this._reserveSpace(this.matrix, iGadget);
	}

	this._searchFreeSpace = function(width, height) {
		var positionX = 0, positionY = 0;
		var columns = this.dragboardStyle.getColumns() - width + 1;
		height += 2; // margins

		for (positionY = 0; true ; positionY++)
			for (positionX = 0; positionX < columns; positionX++)
				if (this._hasSpaceFor(this.matrix, positionX, positionY, width, height)) {
					return new DragboardPosition(positionX, positionY + 1);
				}
	}

	this._commitChanges = function() {
		// Update igadgets positions in persistence
		function onSuccess() {}

		function onError(transport, e) {
			var msg;
			if (transport.responseXML) {
				msg = transport.responseXML.documentElement.textContent;
			} else {
				msg = "HTTP Error " + transport.status + " - " + transport.statusText;
			}

			msg = interpolate(gettext("Error committing dragboard changes to persistence: %(errorMsg)s."), {errorMsg: msg}, true);
			OpManagerFactory.getInstance().log(msg);

			alert (gettext("Error committing dragboard changes to persistence, please check the logs for further info."));
		}

		// TODO only send changes
		var iGadgetInfo, uri, position;
		var data = new Hash();
		data['iGadgets'] = new Array();

		var keys = this.iGadgets.keys();
		for (var i = 0; i < keys.length; i++) {
			iGadget = this.iGadgets[keys[i]];
			iGadgetInfo = new Hash();
			position = iGadget.getPosition();
			iGadgetInfo['id'] = iGadget.id;
			iGadgetInfo['top'] = position.y;
			iGadgetInfo['left'] = position.x;
			iGadgetInfo['minimized'] = iGadget.isMinimized() ? "true" : "false";
			data['iGadgets'].push(iGadgetInfo);	
		}

		data = {igadgets: data.toJSON()};
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		uri = URIs.GET_IGADGETS.evaluate({workspaceId: this.workSpaceId, tabId: this.tabId});
		persistenceEngine.send_update(uri, data, this, onSuccess, onError);
	}

	// ****************
	// PUBLIC METHODS 
	// ****************
	
	Dragboard.prototype.recomputeSize = function() {
	    this.dragboardStyle.recomputeSize();
	}

	Dragboard.prototype.parseTab = function(tabInfo) {
		var curIGadget, position, width, height, igadget, gadget, gadgetid, minimized;

		var opManager = OpManagerFactory.getInstance();

		this.currentCode = 1;
		this.iGadgets = new Hash();

		// For controlling when the igadgets are totally loaded!
		this.igadgetsToLoad = tabInfo.igadgetList;

		for (var i = 0; i < this.igadgetsToLoad.length; i++) {
			curIGadget = this.igadgetsToLoad[i];

			position = new DragboardPosition(parseInt(curIGadget.left), parseInt(curIGadget.top));
			width = parseInt(curIGadget.width);
			height = parseInt(curIGadget.height);

			// Parse gadget id
			gadgetid = curIGadget.gadget.split("/");
			gadgetid = gadgetid[4] + "_" + gadgetid[5] + "_" + gadgetid[6];
			// Get gadget model
			gadget = ShowcaseFactory.getInstance().getGadget(gadgetid);

			// Parse minimize status
			minimized = curIGadget.minimized == "true" ? true : false;

			// Create instance model
			igadget = new IGadget(gadget, curIGadget.id, curIGadget.code, this.dragboardStyle, position, width, height, minimized, this);
			this.iGadgets[curIGadget.id] = igadget;

			if (curIGadget.code >= this.currentCode)
				this.currentCode =  curIGadget.code + 1;

//				this._reserveSpace(this.matrix, igadget);
		}

		this.paint();
		this.loaded = true;
	}

	Dragboard.prototype.addInstance = function (gadget) {
		if ((gadget == null) || !(gadget instanceof Gadget))
			return; // TODO exception

		var template = gadget.getTemplate();
		var width = template.getWidth();
		var height = template.getHeight();

		// Search a position for the gadget
		// TODO height +2 for the menu
		var position = this._searchFreeSpace(width, height + 2);

		// Create the instance
		var iGadget = new IGadget(gadget, null, this.currentCode, this.dragboardStyle, position, width, height, false, this);
		iGadget.save();
	}

	Dragboard.prototype.removeInstance = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		this.iGadgets.remove(iGadgetId);

		var position = igadget.getPosition();
		this._removeFromMatrix(this.matrix, igadget);
		igadget.destroy();
	}

	Dragboard.prototype.move = function (iGadgetId) {
		// TODO implement this function
	}


	Dragboard.prototype.igadgetLoaded = function (iGadgetId) {
	    this.igadgetsToLoad--;
	    if (this.igadgetsToLoad == 0)
		VarManagerFactory.getInstance().planInterfaceInitialization();
	}


	Dragboard.prototype.maximize = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];

		var oldWidth = igadget.getContentWidth();
		var oldHeight = igadget.getHeight();
		igadget.setMinimizeStatus(false);

		var newHeight = igadget.getHeight();
		if (oldHeight != newHeight) {
			this._resize(igadget, oldWidth, oldHeight, oldWidth, newHeight);
			// Save new positions into persistence
			this._commitChanges();
		}
	}

	Dragboard.prototype.minimize = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];

		// TODO add effects?
//			var mySlider = new Effect.SlideUp(igadget.contentWrapper, {
//	                                                  afterFinish: function(element) {
//                                                             DragboardFactory.getInstance().maximize(element.element.iGadgetId); // TODO
//			             }
//			});

		var oldWidth = igadget.getContentWidth();
		var oldHeight = igadget.getHeight();
		igadget.setMinimizeStatus(true);

		var newHeight = igadget.getHeight();
		if (oldHeight != newHeight) {
			this._resize(igadget, oldWidth, oldHeight, oldWidth, newHeight);
			// Save new positions into persistence
			this._commitChanges();
		}
	}

	Dragboard.prototype.toggleMinimizeStatus = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];

		if (igadget.isMinimized())
			this.maximize(igadget.getId());
		else
			this.minimize(igadget.getId());
	}
	
	// TODO better implementation of toggle functionality (create a new function?)
	Dragboard.prototype.setConfigurationVisible = function (iGadgetId, newStatus) {
		var igadget = this.iGadgets[iGadgetId];
		if (newStatus == 'toggle') {
			var oldWidth = igadget.getContentWidth();
			var oldHeight = igadget.getHeight();
			igadget.setConfigurationVisible(!igadget.isConfigurationVisible());
			this._resize(igadget, oldWidth, oldHeight, oldWidth, igadget.getHeight());
		} else {
			var oldWidth = igadget.getContentWidth();
			var oldHeight = igadget.getHeight();
			igadget.setConfigurationVisible(newStatus);
			this._resize(igadget, oldWidth, oldHeight, oldWidth, igadget.getHeight());
		}
	}

	Dragboard.prototype.saveConfig = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		try {
			igadget.saveConfig();

			this.setConfigurationVisible(igadget.getId(), false);
		} catch (e) {
		}
	}

	Dragboard.prototype.setDefaultPrefs = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		igadget.setDefaultPrefs();
	}

	Dragboard.prototype.notifyErrorOnIGadget = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		igadget.notifyError();
	}

	/**
	 * Calculate what cell is at a given position
	 */
	Dragboard.prototype.getCellAt = function (x, y) {
		var dragboardWidth = this.dragboardStyle.getWidth();
		if ((x < 0) || (x > dragboardWidth) || (y < 0))
			return null;

		var columnWidth = dragboardWidth / this.dragboardStyle.getColumns();

		return new DragboardPosition(Math.floor(x / columnWidth),
			                    Math.floor(y / this.dragboardStyle.getCellHeight()));
	}


	Dragboard.prototype.showInstance = function (igadget) {
		igadget.paint(this.dragboardElement, this.dragboardStyle);
	}

	Dragboard.prototype.initializeMove = function (iGadgetId) {
		if (this.gadgetToMove != null) {
			OpManagerFactory.getInstance().log(gettext("There was a pending move that was cancelled because initializedMove function was called before it was finished."), Constants.WARN_MSG);
			this.cancelMove();
		}

		this.gadgetToMove = this.iGadgets[iGadgetId];

		if (this.dragboardCursor == null) {
			// Make a copy of the positions of the gadgets
			this.shadowPositions = new Array();

			var keys = this.iGadgets.keys();
			for (var i = 0; i < keys.length; i++) {
				this.shadowPositions[keys[i]] = this.iGadgets[keys[i]].getPosition().clone();
			}

			// Shadow matrix = current matrix without the gadget to move
			var i;
			this.shadowMatrix = new Array();
			for (i = 0; i < this.dragboardStyle.getColumns(); i++)
				this.shadowMatrix[i] = this.matrix[i].clone();
			this._removeFromMatrix(this.shadowMatrix, this.gadgetToMove);

			// Create dragboard cursor
			this.dragboardCursor = new DragboardCursor(this.gadgetToMove);
			this.dragboardCursor.paint(this.dragboardElement, this.dragboardStyle);
			this._reserveSpace(this.matrix, this.dragboardCursor);
		} /* else {
			TODO exception
		}*/

	}

	Dragboard.prototype.moveTemporally = function (x, y) {
		if (this.dragboardCursor == null) {
			OpManagerFactory.getInstance().log(gettext("Dragboard: You must call initializeMove function before calling to this function (moveTemporally)."), Constants.WARN_MSG);
			return;
		}

		var maxX = this.dragboardStyle.getColumns() - this.dragboardCursor.getContentWidth();
		if (x > maxX) x = maxX;

		// Check if we have to change the position of the cursor
		y = this._searchInsertPoint(this.shadowMatrix, x, y, this.dragboardCursor.getContentWidth(), this.dragboardCursor.getHeight());

		var cursorpos = this.dragboardCursor.getPosition();

		if ((cursorpos.y != y) || (cursorpos.x != x)) {
			// Change cursor position
			this._removeFromMatrix(this.matrix, this.dragboardCursor);
			this._insertAt(this.dragboardCursor, x, y);
		}
	}

	Dragboard.prototype.cancelMove = function() {
		if (this.gadgetToMove == null) {
			OpManagerFactory.getInstance().log(gettext("Dragboard: Trying to cancel an inexistant temporal move."), Constants.WARN_MSG);
			return;
		}

		this._destroyCursor(true);
		var position = this.gadgetToMove.getPosition();
		this._insertAt(this.gadgetToMove, position.x, position.y);
		this.gadgetToMove = null;
		this.shadowMatrix = null;
	}

	Dragboard.prototype.acceptMove = function() {
		if (this.gadgetToMove == null)
			throw new Exception(gettext("Dragboard: function acceptMove called when there is not any igadget's move started."));

		var oldposition = this.gadgetToMove.getPosition();
		var newposition = this.dragboardCursor.getPosition();
		this._destroyCursor(false);

		this.gadgetToMove.setPosition(newposition);
		this._reserveSpace(this.matrix, this.gadgetToMove);
		this.gadgetToMove = null;
		this.shadowMatrix = null;

		// Update igadgets positions in persistence
		if (oldposition.y != newposition.y || oldposition.x != newposition.x)
			this._commitChanges();
	}

	// TODO rename this method to something like getGadgetFromIGadget
	Dragboard.prototype.getGadget = function (iGadgetId) {
		var igadget = this.iGadgets[iGadgetId];
		return igadget.getGadget();
	}
	
	Dragboard.prototype.getWorkspace = function () {
		return this.workSpace;
	}
	
	Dragboard.prototype.addIGadget = function (iGadget) {
		this.iGadgets[iGadget.id] = iGadget;
		this.currentCode++;
		// Reserve the cells for the gadget instance
		this._reserveSpace(this.matrix, iGadget);
		this.workSpace.addIGadget(iGadget);
	}
	
	// *******************
	// INITIALIZING CODE
	// *******************
	this.dragboardElement = dragboardElement;
	this.dragboardStyle = new DragboardStyle(this.dragboardElement, 3, 12); // TODO 3 columns, cell height = 12px

	this._clearMatrix();

	this.parseTab(tabInfo);
}

/////////////////////////////////////
// IGadget
/////////////////////////////////////

/**
 * This class represents a instance of one Gadget.
 * @author aarranz
 */
function IGadget(gadget, iGadgetId, iGadgetCode, screen, position, width, height, minimized, dragboard) {
	this.id = iGadgetId;
	this.code = iGadgetCode;
	this.gadget = gadget;
	this.screen = screen;
	this.position = position;
	this.width = width;
	this.contentHeight = height;
	
	this.dragboard = dragboard;

	this.height = 2; // TODO 2 is a estimation of the menu's height
	if (!minimized)
	    this.height += height;

	this.configurationVisible = false;
	this.minimized = minimized;

	// Elements
	this.element = null;
	this.contentWrapper = null;
	this.content = null;
	this.configurationElement = null;
	this.settingsButtonElement = null;
	this.minimizeButtonElement = null;
	this.errorButtonElement = null;

	this.errorCount = 0;
	
	// Notify Context Manager of igadget height, width and position
	this.notifyContext = function() {
		if (this.dragboard != null){ 
			this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.HEIGHT, this.contentHeight);
			this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.WIDTH, this.width);
			this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.XPOSITION, this.position.x); 
			this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.YPOSITION, this.position.y);
		}
	}		
}

IGadget.prototype.getGadget = function() {
	return this.gadget;
}

/**
 * Sets the position of a gadget instance. The position is calculated relative
 * to the top-left square of the gadget instance box using cells units.
 */
IGadget.prototype.setPosition = function(position) {
	this.position = position;
	
	if (this.element != null) { // if visible
		this.element.style.left = this.screen.getColumnOffsetLeft(position.x);
		this.element.style.top = this.screen.fromVCellsToPixels(position.y) + "px";
		
		// Notify that igadget position has been modified		
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.XPOSITION, this.position.x); 
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.YPOSITION, this.position.y);
	}
}

/**
 * Gets the position of a gadget instance. The position is calculated relative
 * to the top-left square of the gadget instance box using cells units.
 */
IGadget.prototype.getPosition = function() {
	return this.position;
}

IGadget.prototype.setContentWidth = function(width) {
	this.width = width;
	
	// Notify that igadget width has been modified
	if (this.dragboard != null){
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.WIDTH, this.width);
	}
}

IGadget.prototype.getContentWidth = function() {
	return this.width;
}

IGadget.prototype.setContentHeight = function(height) {
	this.contentHeight = height;
	
	// Notify igadget height
	if (this.dragboard != null){
		this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.HEIGHT, this.contentHeight);
	}
}

/**
 * Return the content height.
 */
IGadget.prototype.getContentHeight = function() {
	return this.contentHeight;
}

/**
 * Return the actual height of the gadget. This depends in the status of the
 * gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getHeight = function() {
	if (this.height == null) {
		if (this.element != null) {
			if (!this.minimized) {
				var wrapperHeight = this.content.offsetHeight + this.configurationElement.offsetHeight;
				this.contentWrapper.setStyle({height: wrapperHeight + "px"});
			} else {
				this.contentWrapper.setStyle({height: 0 + "px"});
			}

			this.height = this.screen.fromPixelsToVCells(this.element.offsetHeight);
		} else {
			this.height = 0;
		}
	}

	return this.height;
//	return this.height + 2; // TODO assumed that the menu of the gadget has an height of 2
}

IGadget.prototype.getId = function() {
	return this.id;
}

IGadget.prototype.getElement = function() {
	return this.element;
}

IGadget.prototype.isVisible = function() {
	return this.element != null;
}

IGadget.prototype.paint = function(where) {
	if (this.element != null) // exit if the igadgets is already visible
		return; // TODO exception

	var gadgetElement, gadgetMenu;

	gadgetElement = document.createElement("div");
	//gadgetElement.setAttribute("id", "gadget_" + this.id + "_container");
	gadgetElement.setAttribute("class", "gadget_window");

	// Gadget Menu
	gadgetMenu = document.createElement("div");
	gadgetMenu.setAttribute("class", "gadget_menu");

	// buttons. Inserted from right to left
	var button;

	// close button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "closebutton");
	button.addEventListener("click", function() {OpManagerFactory.getInstance().removeInstance(this.id);}.bind(this), true);
	button.setAttribute("title", gettext("Close"));
	button.setAttribute("alt", gettext("Close"));
	gadgetMenu.appendChild(button);

	// settings button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "settingsbutton");
	button.addEventListener("click", function() {this.dragboard.setConfigurationVisible(this.id, 'toggle');}.bind(this), true);
	button.setAttribute("title", gettext("Preferences"));
	button.setAttribute("alt", gettext("Preferences"));
	gadgetMenu.appendChild(button);
	this.settingsButtonElement = button;

	// minimize button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.addEventListener("click", function() {this.dragboard.toggleMinimizeStatus(this.id)}.bind(this), true);
	if (this.minimized) {
		button.setAttribute("title", gettext("Maximize"));
		button.setAttribute("alt", gettext("Maximize"));
		button.addClassName("maximizebutton");
	} else {
		button.setAttribute("title", gettext("Minimize"));
		button.setAttribute("alt", gettext("Minimize"));
		button.addClassName("minimizebutton");
	}

	gadgetMenu.appendChild(button);
	this.minimizeButtonElement = button;

	// error button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "button errorbutton disabled");
	button.addEventListener("click", function() {showInterface("logs");}, true);
	gadgetMenu.appendChild(button);
	this.errorButtonElement = button;

	// Gadget title
	var title = this.gadget.getName() + " (Gadget " + this.id + ")"; // TODO
	gadgetMenu.appendChild(document.createTextNode(title));
	gadgetMenu.setAttribute("title", title);
	gadgetElement.appendChild(gadgetMenu);

	// Content wrapper
	this.contentWrapper = document.createElement("div");
	this.contentWrapper.setAttribute("class", "gadget_wrapper");
	gadgetElement.appendChild(this.contentWrapper);
	
	// Gadget configuration (Initially empty and hidden)
	this.configurationElement = document.createElement("form");
	this.configurationElement.setAttribute("class", "config_interface");
	this.configurationElement.setAttribute("onsubmit", "javascript:return false;");
	this.contentWrapper.appendChild(this.configurationElement);

	// Gadget Content
	this.content = document.createElement("object");
	this.content.setAttribute("id", "gadget_" + this.id);
	this.content.setAttribute("class", "gadget_object");
	this.content.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml
	if (this.gadget != null) // TODO remove this line this.gadgte must be not null
		this.content.setAttribute("data", this.gadget.getXHtml().getURICode() + "?id=" + this.id);
	this.content.setAttribute("standby", "Loading...");
	this.content.innerHTML = "<param name=\"IGadgetId\" value=\"" + this.id + "\" />Loading...."; // TODO add an animation

	this.contentWrapper.appendChild(this.content);

	// TODO use setStyle from prototype
	// Position
	gadgetElement.style.left = this.screen.getColumnOffsetLeft(this.position.x);
	gadgetElement.style.top = this.screen.fromVCellsToPixels(this.position.y) + "px";

	// Sizes
	gadgetElement.style.width = this.screen.fromHCellsToPercentage(this.width) + "%";
	var contentHeight = this.screen.fromVCellsToPixels(this.contentHeight) + "px";
	this.content.style.height = contentHeight;
	if (this.minimized) {
		this.contentWrapper.style.height = "0px";
		this.contentWrapper.style.borderTop = "0px";
		this.contentWrapper.style.visibility = "hidden";
	} else {
		this.contentWrapper.style.height = contentHeight;
	}

	// References
	gadgetElement.iGadgetId = this.id;
	this.content.iGadgetId = this.id;
	this.contentWrapper.iGadgetId = this.id;

	var dragboardStyle = this.screen;
	var dragboard = this.dragboard;

	var startFunc = function (draggable, iGadgetId) {
		dragboard.initializeMove(iGadgetId);
		draggable.setXOffset(dragboard.dragboardStyle.fromHCellsToPixels(1) / 2);
		draggable.setYOffset(dragboard.dragboardStyle.getCellHeight());
	}

	var updateFunc = function (draggable, iGadgetId, x, y) {
		var position = dragboard.getCellAt(x, y);

		// If the mouse is inside of the dragboard and we have enought columns =>
		// check if we have to change the cursor position
		if (position != null)
			dragboard.moveTemporally(position.x, position.y);
	};

	var finishFunc = function (draggable, iGadgetId) {
		dragboard.acceptMove(iGadgetId);
	};

	// Mark as draggable
	new Draggable(gadgetElement, gadgetMenu, this.id, startFunc, updateFunc, finishFunc);

	// Commit it
	where.appendChild(gadgetElement);
	this.element = gadgetElement;

	return this.element;
}

IGadget.prototype.destroy = function() {
	if (this.element != null) {
		function onSuccess() {}
		function onError(transport, e) {
			var msg;
			if (transport.responseXML) {
                                msg = transport.responseXML.documentElement.textContent;
			} else {
                                msg = "HTTP Error " + transport.status + " - " + transport.statusText;
			}

			msg = interpolate(gettext("Error removing igadget from persistence: %(errorMsg)s."), {errorMsg: msg}, true);
			OpManagerFactory.getInstance().log(msg);
		}
		this.element.parentNode.removeChild(this.element);
		this.element = null;
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		var uri = URIs.GET_IGADGET.evaluate({workspaceId: this.dragboard.workSpaceId, tabId: this.dragboard.tabId, iGadgetId: this.id})
		persistenceEngine.send_delete(uri, this, onSuccess, onError);
	}
}

IGadget.prototype._setDefaultPrefsInInterface = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var curPref;
	for (var i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		curPref.setDefaultValueInInterface(this.configurationElement[curPref.getVarName()]);
	}		
}

/**
 * Set all preferences of this gadget instance to their default value
 */
IGadget.prototype.setDefaultPrefs = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();

	for (var i = 0; i < prefs.length; i++)
		prefs[i].setToDefault(this.id);

	if (this.configurationVisible)
		this._setDefaultPrefsInInterface();
}

IGadget.prototype._makeConfigureInterface = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();

	var interfaceDiv = document.createElement("div");

	if (prefs.length == 0) {
		interfaceDiv.innerHTML = gettext("This IGadget does not have user prefs");
		return interfaceDiv;
	}

	this.prefElements = new Array();

	var row, cell, label, table = document.createElement("table");
	for (var i = 0; i < prefs.length; i++) {
		row = document.createElement("tr");

		// Settings label
		cell = document.createElement("td");
		cell.setAttribute("style", "width: 40%"); // TODO
		label = prefs[i].getLabel();
		cell.appendChild(label);
		row.appendChild(cell);

		// Settings control
		cell = document.createElement("td");
		curPrefInterface = prefs[i].makeInterface(this.id);
		this.prefElements[i] = curPrefInterface;
		cell.appendChild(curPrefInterface);
		row.appendChild(cell);

		table.appendChild(row);
	}
	interfaceDiv.appendChild(table);

	var buttons = document.createElement("div");
	buttons.setAttribute("class", "buttons");
	var button;

	// "Set Defaults" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Set Defaults"));
	button.addEventListener("click", this._setDefaultPrefsInInterface.bind(this), true);
	buttons.appendChild(button);

	// "Save" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Save"));
	button.addEventListener("click",
	                        function () {DragboardFactory.getInstance().saveConfig(this.id)}.bind(this),
	                        true);
	buttons.appendChild(button);

	// "Cancel" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Cancel"));
	button.addEventListener("click",
	                        function () {DragboardFactory.getInstance().setConfigurationVisible(this.id, false)}.bind(this),
	                        true);
	buttons.appendChild(button);
	interfaceDiv.appendChild(buttons);

	// clean floats
	var floatClearer = document.createElement("div");
	floatClearer.setAttribute("class", "floatclearer");
	interfaceDiv.appendChild(floatClearer);

	return interfaceDiv;
}

IGadget.prototype.isMinimized = function() {
	return this.minimized;
}

IGadget.prototype.setMinimizeStatus = function(newStatus) {
	if (this.minimized == newStatus)
	    return;

	this.minimized = newStatus;

	if (this.minimized) {
	    this.contentWrapper.setStyle({"visibility": "hidden" , "border": "0px"});
	    this.configurationElement.setStyle({"display": "none"});
	    this.minimizeButtonElement.setAttribute("title", gettext("Maximize"));
	    this.minimizeButtonElement.setAttribute("alt", gettext("Maximize"));
	    this.minimizeButtonElement.removeClassName("minimizebutton");
	    this.minimizeButtonElement.addClassName("maximizebutton");
	} else {
	    this.contentWrapper.setStyle({"visibility": "visible", "border": ""});
	    if (this.configurationVisible == true)
		this.configurationElement.setStyle({"display": "block"});
	    this.minimizeButtonElement.setAttribute("title", gettext("Minimize"));
	    this.minimizeButtonElement.setAttribute("alt", gettext("Minimize"));
	    this.minimizeButtonElement.removeClassName("maximizebutton");
	    this.minimizeButtonElement.addClassName("minimizebutton");
	}

	this.height = null; // force refreshing sizes (see getHeight function)
}

IGadget.prototype.notifyError = function() {
	if (this.errorCount++ == 0) { // First time
	    this.errorButtonElement.removeClassName("disabled");
	}
	label = ngettext("%(errorCount)s error", "%(errorCount)s errors", this.errorCount);
	label = interpolate(label, {errorCount: this.errorCount}, true);
	this.errorButtonElement.setAttribute("title", label);
}

IGadget.prototype.isConfigurationVisible = function() {
	return this.configurationVisible;
}

IGadget.prototype.setConfigurationVisible = function(newValue) {
	if (this.configurationVisible == newValue)
		return;

	if (newValue == true) {
		this.configurationVisible = true;
		this.configurationElement.appendChild(this._makeConfigureInterface());
		if (this.isMinimized())
			this.configurationElement.setStyle({"display": "none"});
		else
			this.configurationElement.setStyle({"display": "block"});
		this.settingsButtonElement.removeClassName("settingsbutton");
		this.settingsButtonElement.addClassName("settings2button");
		this.height = null; // force refreshing sizes (see getHeight function)
	} else {
		this.configurationElement.innerHTML = "";
		this.configurationElement.hide();
		this.configurationVisible = false;
		this.settingsButtonElement.removeClassName("settings2button");
		this.settingsButtonElement.addClassName("settingsbutton");
		this.height = null; // force refreshing sizes (see getHeight function)
	}
}

IGadget.prototype.saveConfig = function() {
	if (this.configurationVisible == false)
		throw new Error(""); // TODO

	var i, curPref, prefElement, validData = true;
	var prefs = this.gadget.getTemplate().getUserPrefs();

	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefElement = this.configurationElement[curPref.getVarName()];
		if (!curPref.validate(curPref.getValueFromInterface(prefElement))) {
			validData = false;
			this.prefElements[i].addClassName("invalid");
		} else {
			this.prefElements[i].removeClassName("invalid");
		}
	}

	if (!validData)
		throw new Error("Invalid data found"); // Don't save if the data is invalid

	var oldValue, newValue;
	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefElement = this.configurationElement[curPref.getVarName()];
		var oldValue = curPref.getCurrentValue(this.id);
		var newValue = curPref.getValueFromInterface(prefElement);

		if (newValue != oldValue)
			curPref.setValue(this.id, newValue);
	}

	VarManagerFactory.getInstance().commitModifiedVariables();
}

IGadget.prototype.save = function() {
	function onSuccess(transport) {
		this.id = transport.responseText;
		this.dragboard.addIGadget(this);
		// Now, all modules (particularly VarManager) have loaded the IGadget's variables
		// and we can notify context manager of new values of context variables
		this.notifyContext();
	}
	function onError(transport, e) {
		var msg;
		if (transport.responseXML) {
			msg = transport.responseXML.documentElement.textContent;
		} else {
			msg = "HTTP Error " + transport.status + " - " + transport.statusText;
		}

		msg = interpolate(gettext("Error adding igadget to persistence: %(errorMsg)s."), {errorMsg: msg}, true);
		OpManagerFactory.getInstance().log(msg);

		alert (gettext("Error adding igadget to persistence, please check the logs for further info."));
	}

	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var data = new Hash();
	data['left'] = this.position.x;
	data['top'] = this.position.y;
	data['width'] = this.width;
	data['height'] = this.contentHeight;
	data['code'] = this.code;
	
 	var uri = URIs.POST_IGADGET.evaluate({tabId: this.dragboard.tabId, workspaceId: this.dragboard.workSpaceId});
 	
 	data['uri'] = uri;
	data['gadget'] = URIs.GET_GADGET.evaluate({vendor: this.gadget.getVendor(),
	                                           name: this.gadget.getName(),
	                                           version: this.gadget.getVersion()});
	data = {igadget: data.toJSON()};
	persistenceEngine.send_post(uri , data, this, onSuccess, onError);
}

/////////////////////////////////////
// DragboardPosition
/////////////////////////////////////
function DragboardPosition(x, y) {
	this.x = x;
	this.y = y;
}

DragboardPosition.prototype.clone = function() {
	return new DragboardPosition(this.x, this.y);
}

/////////////////////////////////////
// DragboardStyle
/////////////////////////////////////
function DragboardStyle(dragboardElement, columns, cellHeight) {
	this.columns = columns;
	this.cellHeight = cellHeight;
	this.dragboardElement = dragboardElement;
	this.dragboardWidth = parseInt(dragboardElement.offsetWidth);

	var dragboardStyle = this;

	var recomputeSize = function(e) {
		dragboardStyle.dragboardWidth = parseInt(dragboardElement.offsetWidth);
	}

	// We can't use legacy event handlers for having multiple handlers of a given event
	// (There are more functions listening to this event, see ezweb/templates/index.html)
	window.addEventListener("resize", recomputeSize, true); // TODO this depends on a w3c compilant navigator (=> don't work on ie)
}

DragboardStyle.prototype.recomputeSize = function() {
    this.dragboardWidth = parseInt(this.dragboardElement.offsetWidth);
}

DragboardStyle.prototype.getWidth = function() {
	return this.dragboardWidth;
}

DragboardStyle.prototype.getColumns = function() {
	return this.columns;
}

DragboardStyle.prototype.getCellHeight = function() {
	return this.cellHeight;
}

DragboardStyle.prototype.fromPixelsToVCells = function(pixels) {
	return Math.ceil(pixels / this.cellHeight);
}

DragboardStyle.prototype.fromVCellsToPixels = function(cells) {
	return (cells * this.cellHeight);
}

DragboardStyle.prototype.fromHCellsToPixels = function(cells) {
	// TODO
	var tmp = cells * 0.32;
	if (cells > 1)
	  tmp += ((cells - 1) * 0.01);
	return (this.dragboardElement.offsetWidth * tmp);
}

DragboardStyle.prototype.fromHCellsToPercentage = function(cells) {
	// TODO
	var tmp = cells * 32;
	if (cells > 1)
	  tmp += (cells - 1) * 1;
	return tmp;
}

DragboardStyle.prototype.getColumnOffsetLeftInPixels = function(column) {
	var percentage = 1 + (column * 33); // TODO this is only for 3 columns
	return ((this.dragboardElement.offsetWidth * percentage) / 100);
}

DragboardStyle.prototype.getColumnOffsetLeft = function(column) {
	return (1 + (column * 33)) + "%"; // TODO this is only for 3 columns
}

/////////////////////////////////////
// DragboardCursor
/////////////////////////////////////
function DragboardCursor(iGadget, position) {
	var positiontmp = iGadget.getPosition();
	this.position = positiontmp.clone();

	this.screen = iGadget.screen;
	this.width = iGadget.getContentWidth();
	this.height = iGadget.getHeight();
	this.heightInPixels = iGadget.element.offsetHeight;
}

DragboardCursor.prototype = new IGadget();

DragboardCursor.prototype.getContentWidth = function() {
	return this.width;
}

DragboardCursor.prototype.getHeight = function() {
	return this.height;
}

DragboardCursor.prototype.paint = function(dragboard, style) {
	var dragboardCursor = document.createElement("div");
	dragboardCursor.setAttribute("id", "dragboardcursor");

	// Set width and height
	dragboardCursor.style.height = this.heightInPixels + "px";
	dragboardCursor.style.width = style.fromHCellsToPixels(this.width) + "px";

	// Set position
	dragboardCursor.style.left = (style.getColumnOffsetLeftInPixels(this.position.x) - 2) + "px"; // TODO -2 px for borders
	dragboardCursor.style.top = (style.fromVCellsToPixels(this.position.y) - 2) + "px"; // TODO -2 px for borders

	// assign the created element
	dragboard.appendChild(dragboardCursor);
	this.element = dragboardCursor;
}

DragboardCursor.prototype.destroy = function() {
	if (this.element != null) {
		Droppables.remove(this.element);
		this.element.parentNode.removeChild(this.element);
		this.element = null;
	}
}

/////////////////////////////////////
// Drag and drop support
/////////////////////////////////////
function Draggable(draggableElement, handler, data, onStart, onDrag, onFinish) {
	var xDelta = 0, yDelta = 0;
	var xStart = 0, yStart = 0;
	var xOffset = 0, yOffset = 0;
	var x, y;
	var objects;
	var draggable = this;

	// remove the events
	function enddrag(e) {
		if (e.button != 0)  // Only attend to left button (or right button for left-handed persons) events
			return false;

		document.removeEventListener("mouseup", enddrag, false);
		document.removeEventListener("mousemove", drag, false);

		for (var i = 0; i < objects.length; i++) {
			objects[i].contentDocument.onmouseup = null;
			objects[i].contentDocument.onmousemove = null;
		}

		onFinish(draggable, data);
		draggableElement.style.zIndex = "";

		handler.addEventListener("mousedown", startdrag, false);

		document.onmousedown = null;
		document.oncontextmenu = null;
		return false;
	}

	// fire each time it's dragged
	function drag(e) {
//		e = e || window.event;
		xDelta = xStart - parseInt(e.screenX);
		yDelta = yStart - parseInt(e.screenY);
		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = y - yDelta;
		x = x - xDelta;
		draggableElement.style.top = y + 'px';
		draggableElement.style.left = x + 'px';

		onDrag(draggable, data, x + xOffset, y + yOffset);
	}

	// initiate the drag
	function startdrag(e) {
		if (e.button != 0)  // Only attend to left button (or right button for left-handed persons) events
			return false;

		document.oncontextmenu = function() { return false; }; // disable context menu
		document.onmousedown = function() { return false; }; // disable text selection
		handler.removeEventListener("mousedown", startdrag, false);

		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = draggableElement.offsetTop;
		x = draggableElement.offsetLeft;
		draggableElement.style.top = y + 'px';
		draggableElement.style.left = x + 'px';
		document.addEventListener("mouseup", enddrag, false);
		document.addEventListener("mousemove", drag, false);

		objects = document.getElementsByTagName("object");
		for (var i = 0; i < objects.length; i++) {
			objects[i].contentDocument.onmouseup = enddrag;
			objects[i].contentDocument.onmousemove = drag;
		}

		draggableElement.style.zIndex = "200"; // TODO
		onStart(draggable, data);

		return false;
	}

	// cancels the call to startdrag function
	function cancelbubbling(e) {
		if (e.stopPropagation) e.stopPropagation();
	}

	// add mousedown event listener
	handler.addEventListener("mousedown", startdrag, false);
	var children = handler.childElements();
	for (var i = 0; i < children.length; i++)
		children[i].addEventListener("mousedown", cancelbubbling, false);

	this.setXOffset = function(offset) {
		xOffset = offset;
	}

	this.setYOffset = function(offset) {
		yOffset = offset;
	}
}
