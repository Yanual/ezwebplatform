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
function Dragboard(tab, workSpace, dragboardElement) {
	// *********************************
	// PRIVATE VARIABLES
	// *********************************
	this.loaded = false;
	this.currentCode = 1;
	this.matrix = null;          // Matrix of gadget
	this.shadowMatrix = null;    // Temporal matrix of gadgets used for D&D
	this.shadowPositions = null;
	this.dragboardElement, this.dragboardStyle;
	this.dragboardCursor = null;
	this.gadgetToMove = null;
	this.iGadgets = new Hash();
	this.tab = tab;
	this.tabId = tab.tabInfo.id;
	this.workSpace = workSpace;
	this.workSpaceId = workSpace.workSpaceState.id;

	// ***********************
	// PRIVATED FUNCTIONS 
	// ***********************
	Dragboard.prototype.paint = function () {
		var iGadget, key, position, iGadgetsToReinsert = new Array(); // oldWidth, oldHeight

		this.dragboardElement.innerHTML = "";

		this._clearMatrix();

		// Insert igadgets
		var igadgetKeys = this.iGadgets.keys();
		for (var i=0; i<igadgetKeys.length; i++) {
			key = igadgetKeys[i];
			
			iGadget = this.iGadgets[key];

			position = iGadget.getPosition();
			if (this._hasSpaceFor(this.matrix, position.x, position.y, iGadget.getWidth(), iGadget.getHeight())) {
				iGadget.paint(this.dragboardElement);
				this._reserveSpace(this.matrix, iGadget);
			} else {
				iGadgetsToReinsert.push(iGadget);
			}
		}

		// Reinsert the igadgets that didn't fit in their positions
		for (i = 0; i < iGadgetsToReinsert.length; i++) {
			position = this._searchFreeSpace(iGadgetsToReinsert[i].getWidth(),
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
			this._moveSpaceUp(this.matrix, iGadget);
		};
	}

	Dragboard.prototype._notifyWindowResizeEvent = function () {
		var iGadget;

		// Insert igadgets
		var igadgetKeys = this.iGadgets.keys();
		for (var i = 0; i < igadgetKeys.length; i++) {
			iGadget = this.iGadgets[igadgetKeys[i]];
			iGadget._notifyWindowResizeEvent();
		}
	}.bind(this);

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
		var width = iGadget.getWidth();
		var height = iGadget.getHeight();

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				_matrix[position.x + x][position.y + y] = iGadget;
	}

	this._clearSpace = function(_matrix, iGadget) {
		var x, y;
		var position = this._getPositionOn(_matrix, iGadget);
		var width = iGadget.getWidth();
		var height = iGadget.getHeight();

		for (x = 0; x < width; x++)
			for (y = 0; y < height; y++)
				delete _matrix[position.x + x][position.y + y];
	}

	this._searchInsertPoint = function(_matrix, x, y, width, height) {
		// Search the topmost position for the gadget

//		// First check if there is an instance of a gadget in that position
//		if (_matrix[x][y] != null) {
//				// In this case, we can use their position as start point
//				y = this._getPositionOn(_matrix, _matrix[x][y]).y;
//		}

		/* Check for special cases
		   y == 0                             => we are on the topmost position
		                                      so this is the insert point
		   _matrix[x][y - 1] != _matrix[x][y] => this is the topmost cell of the
		                                      igadget at (x,y). Replace it
		*/
		if ((y == 0) || ((_matrix[x][y - 1] != null) && (_matrix[x][y - 1] != _matrix[x][y]))) {
			y;
		} else {
			var originalY = y;
			var lastY;
			var found = false;
			while ((y >= 0) && (this._hasSpaceFor(_matrix, x, y, width, 1))) {
				found = true;
				lastY = y;
				y--;
			}
			if (found) {
				y = lastY;
			} else {
				// Search collisions with gadgets on other columns
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

				y = lastY;
			}
		}
		return y;
	}

	this._moveSpaceDown = function(_matrix, iGadget, offsetY) {
		var affectedIGadgets = new Hash();
		var position = this._getPositionOn(_matrix, iGadget);
		var finalPosition = position.clone();
		finalPosition.y += offsetY;

		var edgeY = position.y + iGadget.getHeight();

		// Search affected gadgets
		// TODO move gadgets according to the biggest offset for optimizing
		var igadget, x, y;
		for (x = 0; x < iGadget.getWidth(); x++)
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
		var edgeY = position.y + iGadget.getHeight();

		var offsetY;
		for (offsetY = 1;
		     ((position.y - offsetY) >= 0) && this._hasSpaceFor(_matrix, position.x, position.y - offsetY, iGadget.getWidth(), 1);
		     offsetY++);
		--offsetY;

		if (offsetY > 0) {
			var affectedIGadgets = new Hash();
			var finalPosition = position.clone();
			finalPosition.y -= offsetY;

			// Search affected gadgets
			// TODO move the topmost gadget for optimizing
			var igadget, x, y, columnsize;
			for (x = 0; x < iGadget.getWidth(); x++) {
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
		var edgeY = position.y + iGadget.getHeight();

		// check if we have to update the representations of the gadget instances
		for (x = 0; x < iGadget.getWidth(); x++) {
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

	this._notifyResizeEvent = function(iGadget, oldWidth, oldHeight, newWidth, newHeight, persist) {
		var x, y;
		var step2Width = oldWidth; // default value, used when the igdaget's width doesn't change
		var position = iGadget.getPosition();

		// First Step
		if (newWidth > oldWidth) {
			// Calculate the width for the next step
			step2Width = oldWidth;

			// Move affected igadgets
			var finalYPos = position.y + newHeight;

			for (x = position.x + oldWidth; x < position.x + newWidth; ++x) {
			  for (y = 0; y < newHeight; ++y) {
			    var iGadgetToMove = this.matrix[x][position.y + y];
			    if (iGadgetToMove != null) {
			      this._moveSpaceDown(this.matrix, iGadgetToMove, finalYPos - iGadgetToMove.position.y);
			      break; // Continue with the next column
			    }
			  }
			}

			// Reserve this space
			this._reserveSpace2(this.matrix, iGadget,
			                                 position.x + oldWidth, position.y,
			                                 newWidth - oldWidth, newHeight);
			
		} else if (newWidth < oldWidth) {
			// Calculate the width for the next step
			step2Width = newWidth;

			// Clear space
			this._clearSpace2(this.matrix, position.x + newWidth, position.y, oldWidth - newWidth, oldHeight);

			// Move affected igadgets
			y = position.y + oldHeight;
			var limitX = position.x + oldWidth;
			for (x = position.x + newWidth; x < limitX; ++x)
				if (this.matrix[x][y] != null)
					this._moveSpaceUp(this.matrix, this.matrix[x][y]);
		}


		// Second Step
		if (newHeight > oldHeight) {
			var limitY = position.y + newHeight ;
			var limitX = position.x + step2Width;
			for (y = position.y + oldHeight; y < limitY; y++)
				for (x = position.x; x < limitX; x++)
					if (this.matrix[x][y] != null)
						this._moveSpaceDown(this.matrix, this.matrix[x][y], limitY - y);

			// Reserve Space
			this._reserveSpace2(this.matrix, iGadget, position.x, position.y + oldHeight, step2Width, newHeight - oldHeight);
		} else if (newHeight < oldHeight) {
			// Clear freed space
			this._clearSpace2(this.matrix, position.x, position.y + newHeight, step2Width, oldHeight - newHeight);

			y = position.y + oldHeight;
			var limitX = position.x + step2Width;
			for (x = position.x; x < limitX; x++)
				if (this.matrix[x][y] != null)
					this._moveSpaceUp(this.matrix, this.matrix[x][y]);
		}

		// Save new positions into persistence
		if (persist)
		  this._commitChanges();
	}

	this._insertAt = function(iGadget, x, y) {
		var newPosition = new DragboardPosition(x, y);

		// Move other instances
		var affectedIGadgets = new Hash();
		var affectedgadget, x, offset, affectedY;

		for (x = 0; x < iGadget.getWidth(); x++)
			for (y = 0; y < iGadget.getHeight(); y++) {
				affectedgadget = this.matrix[newPosition.x + x][newPosition.y + y];
				if ((affectedgadget != null) && (affectedIGadgets[affectedgadget.getId()] == undefined)) {
					// only move the gadget if we didn't move it before
					affectedIGadgets[affectedgadget.getId()] = null;
					offset = iGadget.getHeight() - y;
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

		for (positionY = 0; true ; positionY++)
			for (positionX = 0; positionX < columns; positionX++)
				if (this._hasSpaceFor(this.matrix, positionX, positionY, width, height)) {
					return new DragboardPosition(positionX, positionY);
				}
	}

	this._commitChanges = function() {
		// Update igadgets positions in persistence
		var onSuccess = function(transport) { }

		var onError = function(transport, e) {
			var msg;
			if (transport.responseXML) {
				msg = transport.responseXML.documentElement.textContent;
			} else {
				msg = "HTTP Error " + transport.status + " - " + transport.statusText;
			}

			msg = interpolate(gettext("Error committing dragboard changes to persistence: %(errorMsg)s."), {errorMsg: msg}, true);
			OpManagerFactory.getInstance().log(msg);
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
			iGadgetInfo['width'] = iGadget.getContentWidth();
			iGadgetInfo['height'] = iGadget.getContentHeight();
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

		this.loaded = true;
	}

	Dragboard.prototype.addInstance = function (gadget) {
		if ((gadget == null) || !(gadget instanceof Gadget))
			return; // TODO exception

		var template = gadget.getTemplate();
		var width = template.getWidth();
		var height = template.getHeight();

		// Search a position for the gadget
		var position = this._searchFreeSpace(width, height + this.dragboardStyle.getTitlebarSize());

		// Create the instance
		var iGadget = new IGadget(gadget, null, this.currentCode, this.dragboardStyle, position, width, height, false, this);
		this.currentCode++;

		// TODO this can cause problems if errors are raised on the server
		// Pre-reserve the cells for the gadget instance
		this._reserveSpace(this.matrix, iGadget);

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

		var maxX = this.dragboardStyle.getColumns() - this.dragboardCursor.getWidth();
		if (x > maxX) x = maxX;

		// Check if we have to change the position of the cursor
		y = this._searchInsertPoint(this.shadowMatrix, x, y, this.dragboardCursor.getWidth(), this.dragboardCursor.getHeight());

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

	Dragboard.prototype.getIGadgets = function() {
		return this.iGadgets.values();
	}

	Dragboard.prototype.getIGadget = function (iGadgetId) {
		return this.iGadgets[iGadgetId];
	}

	Dragboard.prototype.getWorkspace = function () {
		return this.workSpace;
	}
	

	Dragboard.prototype.addIGadget = function (iGadget, igadgetInfo) {

		this.iGadgets[iGadget.id] = iGadget;

		if (iGadget.position == null) {
			// Search a position for the gadget
			// TODO height +2 for the menu
			var position = this._searchFreeSpace(width, height + 2);

			// Reserve the cells for the gadget instance
			this._reserveSpace(this.matrix, iGadget);
		}

		this.workSpace.addIGadget(this.tab, iGadget, igadgetInfo);
	}
	
	// *******************
	// INITIALIZING CODE
	// *******************
	this.dragboardElement = dragboardElement;

	/*
	 * nº columns        = 20
	 * cell height       = 12 pixels
	 * vertical Margin   = 2 pixels
	 * horizontal Margin = 4 pixels
	 */
	this.dragboardStyle = new DragboardStyle(this.dragboardElement, 20, 12, 2, 5);
	Event.observe(window, 'resize', this._notifyWindowResizeEvent);

	this._clearMatrix();

	this.parseTab(tab.tabInfo);
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
	this.contentWidth = width;
	this.contentHeight = height;
	
	this.dragboard = dragboard;

	this.height = screen.getTitlebarSize();
	if (!minimized)
	    this.height += height;

	this.configurationVisible = false;
	this.minimized = minimized;

	// Elements
	this.element = null;
	this.gadgetMenu = null;
	this.contentWrapper = null;
	this.content = null;
	this.configurationElement = null;
	this.settingsButtonElement = null;
	this.minimizeButtonElement = null;
	this.errorButtonElement = null;

	this.errorCount = 0;
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
		this.element.style.left = this.screen.getColumnOffset(position.x) + "px";
		this.element.style.top = this.screen.getRowOffset(position.y) + "px";

		// Notify Context Manager of igadget's position
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

/**
 * Return the content width.
 */
IGadget.prototype.getContentWidth = function() {
	return this.contentWidth;
}

/**
 * Return the content height.
 */
IGadget.prototype.getContentHeight = function() {
	return this.contentHeight;
}

/**
 * Return the actual width of the gadget. This depends in the status of the
 * gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getWidth = function() {
	// For now, the igadget width is always the width of the igadget content
	return this.contentWidth;
}

/**
 * Return the actual height of the gadget. This depends in the status of the
 * gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getHeight = function() {
	if (this.height == null) {
		if (this.element != null) {
			if (!this.minimized) {
				if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
					this.content.height = this.screen.fromVCellsToPixels(this.contentHeight) + "px";
				}
				var wrapperHeight = this.content.offsetHeight + this.configurationElement.offsetHeight;
				this.contentWrapper.setStyle({height: wrapperHeight + "px"});
			} else {
				this.contentWrapper.setStyle({height: 0 + "px"});
				if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
					this.content.height = 0;
				}
			}

			var fullsize = this.element.offsetHeight + this.screen.topMargin + this.screen.bottomMargin;
			this.height = Math.ceil(this.screen.fromPixelsToVCells(fullsize));
		} else {
			this.height = 0;
		}
	}

	return this.height;
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
	var contentHeight = this.screen.fromVCellsToPixels(this.contentHeight) + "px";

	gadgetElement = document.createElement("div");
	this.element = gadgetElement;
	gadgetElement.setAttribute("class", "gadget_window");
	gadgetElement.setAttribute("className", "gadget_window"); //IE hack

	// Gadget Menu
	this.gadgetMenu = document.createElement("div");
	this.gadgetMenu.setAttribute("class", "gadget_menu");
	this.gadgetMenu.setAttribute("className", "gadget_menu"); //IE hack

	// buttons. Inserted from right to left
	var button;

	// close button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "closebutton");
	button.setAttribute("className", "closebutton"); //IE hack
	Event.observe (button, "click", function() {OpManagerFactory.getInstance().removeInstance(this.id);}.bind(this), true);
	button.setAttribute("title", gettext("Close"));
	button.setAttribute("alt", gettext("Close"));
	this.gadgetMenu.appendChild(button);

	// settings button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "settingsbutton");
	button.setAttribute("className", "settingsbutton"); //IE hack
	Event.observe (button, "click", function() {this.toggleConfigurationVisible(this.id);}.bind(this), true);
	button.setAttribute("title", gettext("Preferences"));
	button.setAttribute("alt", gettext("Preferences"));
	this.gadgetMenu.appendChild(button);
	this.settingsButtonElement = button;

	// minimize button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	Event.observe (button, "click", function() {this.toggleMinimizeStatus()}.bind(this), true);
	if (this.minimized) {
		button.setAttribute("title", gettext("Maximize"));
		button.setAttribute("alt", gettext("Maximize"));
		button.addClassName("maximizebutton");
	} else {
		button.setAttribute("title", gettext("Minimize"));
		button.setAttribute("alt", gettext("Minimize"));
		button.addClassName("minimizebutton");
	}

	this.gadgetMenu.appendChild(button);
	this.minimizeButtonElement = button;

	// error button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("class", "button errorbutton disabled");
	button.setAttribute("className", "button errorbutton disabled"); //IE hack
	Event.observe (button, "click", function() {showInterface("logs");}, true);
	this.gadgetMenu.appendChild(button);
	this.errorButtonElement = button;

	// Gadget title
	var title = this.gadget.getName() + " (Gadget " + this.id + ")"; // TODO
	this.gadgetMenu.appendChild(document.createTextNode(title));
	this.gadgetMenu.setAttribute("title", title);
	gadgetElement.appendChild(this.gadgetMenu);

	// Content wrapper
	this.contentWrapper = document.createElement("div");
	this.contentWrapper.setAttribute("class", "gadget_wrapper");
	this.contentWrapper.setAttribute("className", "gadget_wrapper"); //IE hack
	gadgetElement.appendChild(this.contentWrapper);

	// Gadget configuration (Initially empty and hidden)
	this.configurationElement = document.createElement("form");
	this.configurationElement.setAttribute("class", "config_interface");
	this.configurationElement.setAttribute("className", "config_interface"); //IE hack
	Event.observe(this.configurationElement, "submit", function(){return false;}) //W3C and IE compliant
	this.contentWrapper.appendChild(this.configurationElement);

	// Gadget Content
	if (BrowserUtilsFactory.getInstance().getBrowser() == "IE6") {
		this.content = document.createElement("iframe"); 
		this.content.setAttribute("class", "gadget_object"); 
		this.content.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml 
		this.content.setAttribute("src", this.gadget.getXHtml().getURICode() + "?id=" + this.id); 
		this.content.setAttribute("standby", "Loading..."); 
//		this.content.innerHTML = "Loading...."; // TODO add an animation ?

		this.content.setAttribute("width", "100%");
		this.content.setAttribute("height", contentHeight);
	} else { //non IE6
		this.content = document.createElement("object"); 
		this.content.setAttribute("class", "gadget_object"); 
		this.content.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml 
		this.content.setAttribute("data", this.gadget.getXHtml().getURICode() + "?id=" + this.id); 
		this.content.setAttribute("standby", "Loading..."); 
		this.content.innerHTML = "Loading...."; // TODO add an animation ?

		this.content.setStyle({"width": "100%", "height": contentHeight});
	}
	this.contentWrapper.appendChild(this.content);

	// resize handle
	var resizeHandle = document.createElement("div");
	resizeHandle.setAttribute("class", "resizeHandle");
	this.contentWrapper.appendChild(resizeHandle);
	new IGadgetResizeHandle(resizeHandle, this);

	// TODO use setStyle from prototype
	// Position
	gadgetElement.style.left = this.screen.getColumnOffset(this.position.x) + "px";
	gadgetElement.style.top = this.screen.getRowOffset(this.position.y) + "px";

	// Notify Context Manager of igadget's position
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.XPOSITION, this.position.x); 
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.YPOSITION, this.position.y);

	// Sizes
	gadgetElement.style.width = this.screen.getWidthInPixels(this.contentWidth) + "px";
	if (this.minimized) {
		this.contentWrapper.style.height = "0px";
		this.contentWrapper.style.borderTop = "0px";
		this.contentWrapper.style.visibility = "hidden";
	} else {
		this.contentWrapper.style.height = contentHeight;
	}
	
	// Notify Context Manager of igadget's size
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.HEIGHT, this.contentHeight);
	this.dragboard.getWorkspace().getContextManager().notifyModifiedGadgetConcept(this.id, Concept.prototype.WIDTH, this.contentWidth);

	// Insert it on the dragboard
	where.appendChild(gadgetElement);

	// Mark as draggable
	new IGadgetDraggable(this);

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
		curPref.setDefaultValueInInterface(this.prefElements[curPref.getVarName()]);
	}		
}

/**
 * Set all preferences of this gadget instance to their default value
 */
IGadget.prototype.setDefaultPrefs = function() {
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var varManager = this.dragboard.workSpace.getVarManager();

	for (var i = 0; i < prefs.length; i++) {
		prefs[i].setToDefault(varManager, this.id);
	}

	if (this.configurationVisible)
		this._setDefaultPrefsInInterface();
}

IGadget.prototype._makeConfigureInterface = function() {

	var varManager = this.dragboard.workSpace.getVarManager();
	var prefs = this.gadget.getTemplate().getUserPrefs();

	var interfaceDiv = document.createElement("div");

	if (prefs.length == 0) {
		interfaceDiv.innerHTML = gettext("This IGadget does not have user prefs");
		return interfaceDiv;
	}

	this.prefElements = new Array();

	var row, cell, label, table = document.createElement("table");
	tbody = document.createElement("tbody");
	table.appendChild(tbody);
	for (var i = 0; i < prefs.length; i++) {
		row = document.createElement("tr");

		// Settings label
		cell = document.createElement("td");
		cell.setAttribute("width", "40%"); // TODO
		label = prefs[i].getLabel();
		cell.appendChild(label);
		row.appendChild(cell);

		// Settings control
		cell = document.createElement("td");
		cell.setAttribute("width", "60%"); // TODO
		curPrefInterface = prefs[i].makeInterface(varManager, this.id);
		this.prefElements[curPrefInterface.name] = curPrefInterface;
		Element.extend(this.prefElements[curPrefInterface.name]);
		cell.appendChild(curPrefInterface);
		row.appendChild(cell);

		tbody.appendChild(row);
	}
	interfaceDiv.appendChild(table);

	var buttons = document.createElement("div");
	buttons.setAttribute("class", "buttons");
	buttons.setAttribute("className", "buttons"); //IE hack
	var button;

	// "Set Defaults" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Set Defaults"));
	Event.observe (button, "click", this._setDefaultPrefsInInterface.bind(this), true);
	buttons.appendChild(button);

	// "Save" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Save"));
	Event.observe (button, "click", function () {this.dragboard.saveConfig(this.id)}.bind(this), true);
	buttons.appendChild(button);

	// "Cancel" button
	button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("value", gettext("Cancel"));
	Event.observe (button, "click", function () {this.setConfigurationVisible(false)}.bind(this), true);
	buttons.appendChild(button);
	interfaceDiv.appendChild(buttons);

	// clean floats
	var floatClearer = document.createElement("div");
	floatClearer.setAttribute("class", "floatclearer");
	floatClearer.setAttribute("className", "floatclearer"); //IE hack
	interfaceDiv.appendChild(floatClearer);

	return interfaceDiv;
}

/**
 * TODO
 * Sets the size of the igadget's content.
 */
IGadget.prototype.setContentSize = function(newWidth, newHeight) {
  this.contentWidth = newWidth;
  this.contentHeight = newHeight;
}

IGadget.prototype._notifyWindowResizeEvent = function() {
	if (!this.element)
		return;

	// Recompute position
	this.element.style.left = this.screen.getColumnOffset(this.position.x) + "px";
	this.element.style.top = this.screen.getRowOffset(this.position.y) + "px";

	// Recompute width
	this.element.style.width = this.screen.getWidthInPixels(this.contentWidth) + "px";
}

/**
 * Sets the absolute size of the igadget. See setContentSize for resizing the area for the igadget content.
 */
IGadget.prototype._setSize = function(newWidth, newHeight, persist) {
	var oldWidth = this.getWidth();
	var oldHeight = this.getHeight();

	// Assign new values
	this.contentWidth = newWidth;
	this.height = newHeight;

	// Recompute sizes
	this.element.style.width = this.screen.getWidthInPixels(this.contentWidth) + "px";

	var contentHeight = this.screen.getHeightInPixels(this.height);
	contentHeight -= this.configurationElement.offsetHeight + this.gadgetMenu.offsetHeight;
	contentHeight -= 3; // TODO offsetHeight don't take into account borders
	this.content.style.height = contentHeight + "px";
	this.height = null;

	this.getHeight();
	this.contentHeight = Math.floor(this.screen.fromPixelsToVCells(this.content.offsetHeight));

	// Notify resize event
	this.dragboard._notifyResizeEvent(this, oldWidth, oldHeight, this.contentWidth, this.height, persist);
}

IGadget.prototype.isMinimized = function() {
	return this.minimized;
}

IGadget.prototype.setMinimizeStatus = function(newStatus) {
	if (this.minimized == newStatus)
	    return; // Nothing to do

	// TODO add effects?

	// New Status
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

	// Notify resize event
	var oldHeight = this.getHeight();
	this.height = null; // recompute igadget's height (see getHeight function)
	this.dragboard._notifyResizeEvent(this, this.contentWidth, oldHeight, this.contentWidth, this.getHeight(), true);
}

IGadget.prototype.toggleMinimizeStatus = function () {
	this.setMinimizeStatus(!this.minimized);
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
	} else {
		this.configurationElement.innerHTML = "";
		this.configurationElement.hide();
		this.configurationVisible = false;
		this.settingsButtonElement.removeClassName("settings2button");
		this.settingsButtonElement.addClassName("settingsbutton");
	}

	// Notify resize event
	var oldHeight = this.getHeight();
	this.height = null; // recompute igadget's height (see getHeight function)
	this.dragboard._notifyResizeEvent(this, this.contentWidth, oldHeight, this.contentWidth, this.getHeight(), true);
}

IGadget.prototype.toggleConfigurationVisible = function () {
	this.setConfigurationVisible(!this.configurationVisible);
}

IGadget.prototype.saveConfig = function() {
	if (this.configurationVisible == false)
		throw new Error(""); // TODO

	var varManager = this.dragboard.workSpace.getVarManager();
	var i, curPref, prefElement, validData = true;
	var prefs = this.gadget.getTemplate().getUserPrefs();
	var prefName = null;
	
	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefName = curPref.getVarName();
		prefElement = this.prefElements[prefName];
		if (!curPref.validate(curPref.getValueFromInterface(prefElement))) {
			validData = false;
			prefElement.addClassName("invalid");
		} else {
			prefElement.removeClassName("invalid");
		}
	}

	if (!validData)
		throw new Error("Invalid data found"); // Don't save if the data is invalid

	// Start propagation of the new values of the user pref variables
	varManager.incNestingLevel();

	var oldValue, newValue;
	for (i = 0; i < prefs.length; i++) {
		curPref = prefs[i];
		prefName = curPref.getVarName();
		prefElement = this.prefElements[prefName];
		var oldValue = curPref.getCurrentValue(varManager, this.id);
		var newValue = curPref.getValueFromInterface(prefElement);

		if (newValue != oldValue)
			curPref.setValue(varManager, this.id, newValue);
	}

	// Commit
	varManager.decNestingLevel();

	this.setConfigurationVisible(false);
}

IGadget.prototype.save = function() {
	function onSuccess(transport) {
		var igadgetInfo = eval ('(' + transport.responseText + ')');
		this.id = igadgetInfo['igadget']['id'];
		this.dragboard.addIGadget(this, igadgetInfo);
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
	}

	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var data = new Hash();
	data['left'] = this.position.x;
	data['top'] = this.position.y;
	data['width'] = this.contentWidth;
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

/**
 * Represents the style that will be used to place igadgets into the dragboard.
 *
 * @param dragboardElement HTML element that will be used
 * @param columns number of columns of the dragboard
 * @param cellHeight the height of the dragboard's cells in pixels
 * @param verticalMargin vertical margin between igadgets
 * @param horizontalMargin horizontal margin between igadgets
 */
function DragboardStyle(dragboardElement, columns, cellHeight, verticalMargin, horizontalMargin) {
	this.columns = columns;
	this.cellHeight = cellHeight;
	this.dragboardElement = dragboardElement;
	this.dragboardWidth = parseInt(dragboardElement.offsetWidth);

	if ((verticalMargin % 2) == 0) {
		this.topMargin = verticalMargin / 2;
		this.bottomMargin = verticalMargin / 2;
	} else {
		this.topMargin = Math.floor(verticalMargin / 2);
		this.bottomMargin = Math.floor(verticalMargin / 2) + 1;
	}

	if ((horizontalMargin % 2) == 0) {
		this.leftMargin = horizontalMargin / 2;
		this.rigthMargin = horizontalMargin / 2;
	} else {
		this.leftMargin = Math.floor(horizontalMargin / 2);
		this.rightMargin = Math.floor(horizontalMargin / 2) + 1;
	}

	var dragboardStyle = this;

	var recomputeSize = function(e) {
		dragboardStyle.dragboardWidth = parseInt(dragboardElement.offsetWidth);
	}

	// We can't use legacy event handlers for having multiple handlers of a given event
	// (There are more functions listening to this event, see ezweb/templates/index.html)
	Event.observe(window, 'resize', recomputeSize); //W3C and IE compliant
}

DragboardStyle.prototype.recomputeSize = function() {
	this.dragboardWidth = parseInt(this.dragboardElement.offsetWidth);
}

DragboardStyle.prototype.getTitlebarSize = function() {
	return 2;
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
	return (pixels / this.cellHeight);
}

DragboardStyle.prototype.fromVCellsToPixels = function(cells) {
	return (cells * this.cellHeight);
}

DragboardStyle.prototype.getWidthInPixels = function (cells) {
	return this.fromHCellsToPixels(cells) - this.leftMargin - this.rightMargin;
}

DragboardStyle.prototype.getHeightInPixels = function (cells) {
	return this.fromVCellsToPixels(cells) - this.topMargin - this.bottomMargin;
}

DragboardStyle.prototype.fromHCellsToPixels = function(cells) {
	return Math.floor((this.dragboardWidth * this.fromHCellsToPercentage(cells)) / 100);
}

DragboardStyle.prototype.fromHCellsToPercentage = function(cells) {
	return cells * (100 / this.columns);
}

DragboardStyle.prototype.getColumnOffset = function(column) {
	var tmp = Math.floor((this.dragboardWidth * this.fromHCellsToPercentage(column)) / 100);
	tmp += this.leftMargin;
	return tmp;
}

DragboardStyle.prototype.getRowOffset = function(row) {
	return this.fromVCellsToPixels(row) + this.topMargin;
}

/////////////////////////////////////
// DragboardCursor
/////////////////////////////////////
function DragboardCursor(iGadget, position) {
	var positiontmp = iGadget.getPosition();
	this.position = positiontmp.clone();

	this.screen = iGadget.screen;
	this.width = iGadget.getWidth();
	this.height = iGadget.getHeight();
	this.heightInPixels = iGadget.element.offsetHeight;
	this.widthInPixels = iGadget.element.offsetWidth;
}

DragboardCursor.prototype.getWidth = function() {
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
	dragboardCursor.style.width = this.widthInPixels + "px";

	// Set position
	dragboardCursor.style.left = (style.getColumnOffset(this.position.x) - 2) + "px"; // TODO -2 px for borders
	dragboardCursor.style.top = (style.getRowOffset(this.position.y) - 2) + "px"; // TODO -2 px for borders

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

DragboardCursor.prototype.getWidth = function() {
	return this.width;
}

DragboardCursor.prototype.getPosition = IGadget.prototype.getPosition;

DragboardCursor.prototype.setPosition = function (position) {
	this.position = position;

	if (this.element != null) { // if visible
		this.element.style.left = (this.screen.getColumnOffset(position.x) - 2) + "px"; // TODO -2 px for borders
		this.element.style.top = (this.screen.getRowOffset(position.y) - 2) + "px"; // TODO -2 px for borders
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
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;

		Event.stopObserving (document, "mouseup", enddrag);
		Event.stopObserving (document, "mousemove", drag);

		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.stopObserving(objects[i].contentDocument, "mouseup", enddrag, true);
				Event.stopObserving(objects[i].contentDocument, "mousemove", drag, true);
			}
		}
	
		onFinish(draggable, data);
		draggableElement.style.zIndex = "";
	
		Event.observe (handler, "mousedown", startdrag);
	
		document.onmousedown = null; // reenable context menu
		document.oncontextmenu = null; // reenable text selection

		return false;
	}

	// fire each time it's dragged
	function drag(e) {
		e = e || window.event; // needed for IE

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
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;

		document.oncontextmenu = function() { return false; }; // disable context menu
		document.onmousedown = function() { return false; }; // disable text selection
		Event.stopObserving (handler, "mousedown", startdrag);

		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = draggableElement.offsetTop;
		x = draggableElement.offsetLeft;
		draggableElement.style.top = y + 'px';
		draggableElement.style.left = x + 'px';
		Event.observe (document, "mouseup", enddrag);
		Event.observe (document, "mousemove", drag);

		objects = document.getElementsByTagName("object");
		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.observe(objects[i].contentDocument, "mouseup" , enddrag, true);
				Event.observe(objects[i].contentDocument, "mousemove", drag, true);
			}
		}

		draggableElement.style.zIndex = "200"; // TODO
		onStart(draggable, data);

		return false;
	}

	// cancels the call to startdrag function
	function cancelbubbling(e) {
		e = e || window.event; // needed for IE
		Event.stop(e);
	}

	// add mousedown event listener
	Event.observe (handler, "mousedown", startdrag);
	var children = handler.childElements();
	for (var i = 0; i < children.length; i++)
		Event.observe (children[i], "mousedown", cancelbubbling);

	this.setXOffset = function(offset) {
		xOffset = offset;
	}

	this.setYOffset = function(offset) {
		yOffset = offset;
	}
}

/////////////////////////////////////
// IGadget drag & drop support
/////////////////////////////////////
function IGadgetDraggable (iGadget) {
	var context = new Object();
	context.dragboard = iGadget.dragboard;
	context.iGadgetId = iGadget.id;
	Draggable.call(this, iGadget.element, iGadget.gadgetMenu, context,
	                     IGadgetDraggable.prototype.startFunc,
	                     IGadgetDraggable.prototype.updateFunc,
	                     IGadgetDraggable.prototype.finishFunc);
}

IGadgetDraggable.prototype.startFunc = function (draggable, context) {
	context.dragboard.initializeMove(context.iGadgetId);
	draggable.setXOffset(context.dragboard.dragboardStyle.fromHCellsToPixels(1) / 2);
	draggable.setYOffset(context.dragboard.dragboardStyle.getCellHeight());
}

IGadgetDraggable.prototype.updateFunc = function (draggable, context, x, y) {
	var position = context.dragboard.getCellAt(x, y);

	// If the mouse is inside of the dragboard and we have enought columns =>
	// check if we have to change the cursor position
	if (position != null)
		context.dragboard.moveTemporally(position.x, position.y);
}

IGadgetDraggable.prototype.finishFunc = function (draggable, context) {
	context.dragboard.acceptMove();
}

/////////////////////////////////////
// resize support
/////////////////////////////////////

function ResizeHandle(resizableElement, handleElement, data, onStart, onResize, onFinish) {
	var xDelta = 0, yDelta = 0;
	var xStart = 0, yStart = 0;
	var objects;
	var x, y;

	// remove the events
	function endresize(e) {
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;

		Event.stopObserving (document, "mouseup", endresize);
		Event.stopObserving (document, "mousemove", resize);

		onFinish(data);
		resizableElement.style.zIndex = null;

		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.stopObserving(objects[i].contentDocument, "mouseup", endresize, true);
				Event.stopObserving(objects[i].contentDocument, "mousemove", resize, true);
			}
		}

		// Restore start event listener
		Event.observe (handleElement, "mousedown", startresize);
	
		document.onmousedown = null; // reenable context menu
		document.oncontextmenu = null; // reenable text selection

		return false;
	}

	// fire each time the mouse is moved while resizing
	function resize(e) {
		e = e || window.event; // needed for IE

		xDelta = xStart - parseInt(e.screenX);
		yDelta = yStart - parseInt(e.screenY);
		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		y = y - yDelta;
		x = x - xDelta;

		onResize(data, x, y);
	}

	// initiate the resizing
	function startresize(e) {
		e = e || window.event; // needed for IE

		// Only attend to left button (or right button for left-handed persons) events
		if (!BrowserUtilsFactory.getInstance().isLeftButton(e.button))
			return false;
		
		document.oncontextmenu = function() { return false; }; // disable context menu
		document.onmousedown = function() { return false; }; // disable text selection
		Event.stopObserving (handleElement, "mousedown", startresize);
	
		xStart = parseInt(e.screenX);
		yStart = parseInt(e.screenY);
		x = resizableElement.offsetLeft + resizableElement.offsetWidth;
		y = resizableElement.offsetTop + resizableElement.offsetHeight;
		Event.observe (document, "mouseup", endresize);
		Event.observe (document, "mousemove", resize);

		objects = document.getElementsByTagName("object");
		for (var i = 0; i < objects.length; i++) {
			if (objects[i].contentDocument) {
				Event.observe(objects[i].contentDocument, "mouseup" , endresize, true);
				Event.observe(objects[i].contentDocument, "mousemove", resize, true);
			}
		}

		resizableElement.style.zIndex = "200"; // TODO
		onStart(data);

		return false;
	}

	// Add event listener
	Event.observe (handleElement, "mousedown", startresize);
}


/////////////////////////////////////
// IGadget resize support
/////////////////////////////////////
function IGadgetResizeHandle(handleElement, iGadget) {
	ResizeHandle.call(this, iGadget.element, handleElement, iGadget,
	                        IGadgetResizeHandle.prototype.startFunc,
	                        IGadgetResizeHandle.prototype.updateFunc,
	                        IGadgetResizeHandle.prototype.finishFunc);
}

IGadgetResizeHandle.prototype.startFunc = function (iGadget) {
}

IGadgetResizeHandle.prototype.updateFunc = function (iGadget, x, y) {
	var position = iGadget.dragboard.getCellAt(x, y);

	// Skip if the mouse is outside the dragboard
	if (position != null) {
		var currentPosition = iGadget.position;
		var width = position.x - currentPosition.x + 1;
		var height = position.y - currentPosition.y + 1;

		if (width < 1)  // Minimum width = 1 cells
		  width = 1;

		if (height < 3) // Minimum height = 3 cells
		  height = 3;

		if (width != iGadget.getWidth() || height != iGadget.getHeight())
		  iGadget._setSize(width, height, false);
	}
}

IGadgetResizeHandle.prototype.finishFunc = function (iGadget) {
	iGadget._setSize(iGadget.getWidth(), iGadget.getHeight(), true);
}

