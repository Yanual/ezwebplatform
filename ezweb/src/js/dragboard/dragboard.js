// TODO split this file[6~

/**
 * @author aarranz
 */
var DragboardFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function Dragboard() {
		// *********************************
		// PRIVATE VARIABLES
		// *********************************
		var loaded = false;
		var currentId = 1;
		var matrix = null;
		var shadowMatrix = null; shadowPositions = null;
		var dragboard, dragboardStyle;
		var dragboardCursor = null;
		var gadgetToMove = null;
		var iGadgets = new Hash();

		// ***********************
		// PRIVATED FUNCTIONS 
		// ***********************
		function _repaint(receivedData) {
			var iGadget, gadgetElement;
			iGadgets.each( function (pair) {
				iGadget = pair.value;

				gadgetElement = iGadget.destroy();
			});

			dragboard.innerHTML = "";

			// TODO debug
			var x, y, tmp, posX;
			var grid = document.createElement("div");
			grid.setAttribute("id", "grid");
			dragboard.appendChild(grid);
			for (x = 0; x < dragboardStyle.getColumns(); x++)
				for (y = 0; y < 15; y++) {
					tmp = document.createElement("div");
					tmp.setAttribute("class", "cell");
					grid.appendChild(tmp);
					tmp.style.top = dragboardStyle.fromVCellsToPixels((y * 2) + 1) + "px";
					posX = 3 + (x * 32);
					tmp.style.left = posX + "%";
				}
			// TODO end debug

			_clearMatrix();

			iGadgets.each( function (pair) {
				iGadget = pair.value;

				// TODO checkSpace
				gadgetElement = iGadget.paint(dragboard, dragboardStyle);
				_reserveSpace(matrix, iGadget);
			});
		}

		/**
		 * Loads data from persistenceEngine
		 */
		function _load(receivedData) {
			var response = eval ('(' + receivedData.responseText + ')');
			var curIGadget, position, width, height, igadget, gadget;

			currentId = response.currentId;
			iGadgets = new Hash();

			tmp = response.iGadgets;
			for (var i = 0; i < response.iGadgets.length; i++) {
				curIGadget = response.iGadgets[i];

				position = new DragboardPosition(parseInt(curIGadget.left), parseInt(curIGadget.top));
				width = parseInt(curIGadget.width);
				height = parseInt(curIGadget.height);

				gadget = ShowcaseFactory.getInstance().getGadget(curIGadget.gadgetid); // TODO
				igadget = new IGadget(gadget, curIGadget.id, position, width, height);
				iGadgets[curIGadget.id] = igadget;
				_reserveSpace(matrix, igadget);
			}

			loaded = true;
			_repaint(); // TODO the OpManager must call to this method => remove from here
			OpManagerFactory.getInstance().continueLoading(Modules.prototype.DRAGBOARD);
		}

		function onError(receivedData) {
			alert("Error receiving dragboard data");
		}

		function _getPositionOn(_matrix, gadget) {
			if (_matrix == matrix)
				return gadget.getPosition();
			else
				return shadowPositions[gadget.getId()];
		}

		function _setPositionOn(_matrix, gadget, position) {
			if (_matrix == matrix)
				gadget.setPosition(position, dragboardStyle);
			else
				shadowPositions[gadget.getId()] = position;
		}

		function _destroyCursor(clearSpace) {
			if (dragboardCursor != null) {
				dragboardCursor.destroy();
				if (clearSpace)
					_removeFromMatrix(matrix, dragboardCursor);
				dragboardCursor = null;
			}
		}

		function _clearMatrix() {
			matrix = new Array();

			for (var x = 0; x < dragboardStyle.getColumns(); x++)
				matrix[x] = new Array();
		}

		function _hasSpaceFor(_matrix, positionX, positionY, width, height) {
			var x, y;

			for (x = 0; x < width; x++)
				for (y = 0; y < height; y++)
					if (_matrix[positionX + x][positionY + y] != null)
						return false;

			return true;
		}

		function _reserveSpace(_matrix, iGadget) {
			var x, y;
			var position = _getPositionOn(_matrix, iGadget);
			var width = iGadget.getContentWidth();
			var height = iGadget.getHeight();

			for (x = 0; x < width; x++)
				for (y = 0; y < height; y++)
					_matrix[position.x + x][position.y + y] = iGadget;
		}

		function _clearSpace(_matrix, iGadget) {
			var x, y;
			var position = _getPositionOn(_matrix, iGadget);
			var width = iGadget.getContentWidth();
			var height = iGadget.getHeight();

			for (x = 0; x < width; x++)
				for (y = 0; y < height; y++)
					delete _matrix[position.x + x][position.y + y];
		}

		function _searchInsertPoint(_matrix, x, y, width, height) {
			// Search the topmost position for the gadget
			if (_matrix[x][y] != null) {
       				y = _getPositionOn(_matrix, _matrix[x][y]).y - 1;
			}

			if ((y == 0) || (_matrix[x][y - 1] != null)) {
				y++;
			} else {
				var originalY = y;
				var lastY;
				var found = false;
				while ((y > 0) && (_hasSpaceFor(_matrix, x, y - 1, width, 1))) {
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
							y = _getPositionOn(_matrix, curGadget).y;

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

		function _moveSpaceDown(_matrix, iGadget, offsetY) {
			var affectedIGadgets = new Hash();
			var position = _getPositionOn(_matrix, iGadget);
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
				igadget = iGadgets[key];
				_moveSpaceDown(_matrix, igadget, affectedIGadgets[key]);
			}

			// Move the gadget
			_clearSpace(_matrix, iGadget);
			_setPositionOn(_matrix, iGadget, finalPosition);
			_reserveSpace(_matrix, iGadget);
		}

		function _moveSpaceUp(_matrix, iGadget) {
			var position = _getPositionOn(_matrix, iGadget);
			var edgeY = position.y + iGadget.getHeight() + 1; // we have to take in care the border so +1

			var offsetY;
			for (offsetY = 1;
                 ((position.y - offsetY) >= 0) && _hasSpaceFor(_matrix, position.x, position.y - offsetY, iGadget.getContentWidth(), 1);
                 offsetY++);

			if (offsetY > 1) {
				var affectedIGadgets = new Hash();
				var finalPosition = position.clone();
				finalPosition.y -= (offsetY - 2); // TODO

				// Search affected gadgets
				// TODO move the topmost gadgets for optimizing
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
				_clearSpace(_matrix, iGadget);
				_setPositionOn(_matrix, iGadget, finalPosition);
				_reserveSpace(_matrix, iGadget);

				// Move affected gadgets instances
				var keys = affectedIGadgets.keys();
				var i;
				for (i = 0; i < keys.length; i++)
					_moveSpaceUp(_matrix, affectedIGadgets[keys[i]]);
			}
		}

		function _removeFromMatrix(_matrix, iGadget) {
			_clearSpace(_matrix, iGadget);

			var affectedIGadgets = new Hash();
			var affectedgadget, x, y, columnsize;
			var position = _getPositionOn(_matrix, iGadget);
			var edgeY = position.y + iGadget.getHeight() + 1; // we have to take in care the border so +1

			// check if we have to update the representations of the gadget instances
			for (x = 0; x < iGadget.getContentWidth(); x++) {
				columnsize = _matrix[position.x + x].length;
				for (y = edgeY; y < columnsize; y++) {
					affectedgadget = _matrix[position.x + x][y];
					if ((affectedgadget != null) && (affectedIGadgets[affectedgadget.getId()] == undefined)) {
						affectedIGadgets[affectedgadget.getId()] = 1;
						_moveSpaceUp(_matrix, affectedgadget);
						break;
					}
				}
			}
		}

		function _insertAt(iGadget, x, y) {
			var newPosition = new DragboardPosition(x, y);

			// Move other instances
			var affectedIGadgets = new Hash();
			var affectedgadget, x, offset, affectedY;

			for (x = 0; x < iGadget.getContentWidth(); x++)
				for (y = 0; y < iGadget.getHeight(); y++) {
					affectedgadget = matrix[newPosition.x + x][newPosition.y + y];
					if ((affectedgadget != null) && (affectedIGadgets[affectedgadget.getId()] == undefined)) {
						// only move the gadget if we didn't move it before
						affectedIGadgets[affectedgadget.getId()] = null;
						// we have to add a border so +1
						offset = iGadget.getHeight() + 1 - y;
						y = newPosition.y + y;
						affectedY = affectedgadget.getPosition().y;
						if (affectedY < y)
							offset += y - affectedY;
						_moveSpaceDown(matrix, affectedgadget,  offset);
						// move only the topmost gadget in the column
						break;
					}
				}

			// Change Gadget instance position (insert it)
			iGadget.setPosition(newPosition, dragboardStyle);

			_reserveSpace(matrix, iGadget);
		}

		// ****************
		// PUBLIC METHODS 
		// ****************
		Dragboard.prototype.addInstance = function (gadget) {
			if ((gadget == null) || !(gadget instanceof Gadget))
				return; // TODO exception

			// Search a position for the gadget
			var positionX, positionY, found;

			positionX = 0; // tmp
			positionY = 0;
			var width = 1;
			// TODO +2 for the menu
			var height = 4 + 2 + 2; // one cell of margin at the top and at the bottom
			var columns = dragboardStyle.getColumns();

			// Search first free space
			dragboard_addInstance_exit: for (; !found; positionY++)
				for (positionX = 0; positionX < columns; positionX++)
					if (_hasSpaceFor(matrix, positionX, positionY, width, height)) {
						found = true;
						break dragboard_addInstance_exit;
					}

			// Add the offset of the margin (one cell of margin) and remove
			// margins to the height
			positionY++;
			height -= (2 + 2); 

			// Create the instance
			var position = new DragboardPosition(positionX, positionY);
			var iGadget = new IGadget(gadget, currentId, position, width, height);
			iGadgets[currentId] = iGadget;
			currentId++;

			// Configure it
			iGadget.setDefaultPrefs();

			// Reserve the cells for the gadget instance
			_reserveSpace(matrix, iGadget);

			return iGadget.getId();
		}

		Dragboard.prototype.removeInstance = function (iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			iGadgets.remove(iGadgetId);

			var position = igadget.getPosition();
			_removeFromMatrix(matrix, igadget);
			igadget.destroy();
		}

		Dragboard.prototype.move = function (iGadgetId) {
			
		}

		Dragboard.prototype.maximize = function (iGadgetId) {
			var element = document.getElementById('gadget_' + iGadgetId);
			var mySlider = new Effect.SlideDown(element);
		}

		Dragboard.prototype.minimize = function (iGadgetId) {
//			var igadget = iGadgets[iGadgetId];
//			var element = igadget.getElement(); // TODO get correct div
			var element = document.getElementById('gadget_' + iGadgetId);
			var mySlider = new Effect.SlideUp(element, {
			                     afterFinish: function(element) {
			                       DragboardFactory.getInstance().maximize(element.element.iGadgetId); // TODO
			                     }
			                   });
		}

		Dragboard.prototype.configure = function (iGadgetId) {
			
		}

		Dragboard.prototype.repaint = function (iGadgetId) {
			_repaint();
		}

		/**
		 * Calculate what cell is a 
		 */
		Dragboard.prototype.getCellAt = function (x, y) {
			x = x - dragboard.offsetLeft;
			if ((x < 0) || (x > dragboard.offsetWidth))
				return null;

			y = y - dragboard.offsetTop;
			if (y < 0)
				return null;

			var columnWidth = dragboard.offsetWidth / dragboardStyle.getColumns();

			return new DragboardPosition(Math.floor(x / columnWidth),
			                    Math.floor(y / dragboardStyle.getCellHeight()));
		}


		Dragboard.prototype.showInstance = function (iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			igadget.paint(dragboard, dragboardStyle);
		}

		Dragboard.prototype.initializeMove = function (iGadgetId) {
			if (gadgetToMove != null) {
				alert("exception at initializeMove"); // TODO
				this.cancelMove();
			}

			gadgetToMove = iGadgets[iGadgetId];

			if (dragboardCursor == null) {
				// Make a copy of the positions of the gadgets
				shadowPositions = new Array();
				iGadgets.each( function (pair) {
					shadowPositions[pair.key] = pair.value.getPosition().clone();
				});

				// Shadow matrix = current matrix without the gadget to move
				var i;
				shadowMatrix = new Array();
				for (i = 0; i < dragboardStyle.getColumns(); i++)
					shadowMatrix[i] = matrix[i].clone();
				_removeFromMatrix(shadowMatrix, gadgetToMove);

				// Create dragboard cursor
				dragboardCursor = new DragboardCursor(gadgetToMove);
				dragboardCursor.paint(dragboard, dragboardStyle);
				_reserveSpace(matrix, dragboardCursor);
			} /* else {
				TODO exception
			}*/

		}

		Dragboard.prototype.moveTemporally = function (x, y) {
			if (dragboardCursor == null)
				return; // TODO exception

			var maxX = dragboardStyle.getColumns() - dragboardCursor.getContentWidth();
			if (x > maxX) x = maxX;

			// Check if we have to change the position of the cursor
			y = _searchInsertPoint(shadowMatrix, x, y, dragboardCursor.getContentWidth(), dragboardCursor.getHeight());

			var cursorpos = dragboardCursor.getPosition();

			if ((cursorpos.y != y) || (cursorpos.x != x)) {
				// Change cursor position
				_removeFromMatrix(matrix, dragboardCursor);
				_insertAt(dragboardCursor, x, y);
			}
		}

		Dragboard.prototype.cancelMove = function() {
			if (gadgetToMove == null)
				alert("exception at cancelMove"); // TODO

			_destroyCursor(true);
			var position = gadgetToMove.getPosition();
			_insertAt(gadgetToMove, position.x, position.y);
			gadgetToMove = null;
			shadowMatrix = null;
		}

		Dragboard.prototype.acceptMove = function() {
			if (gadgetToMove == null)
				alert("exception at acceptMove"); // TODO

			var newposition = dragboardCursor.getPosition();
			_destroyCursor(false);

			gadgetToMove.setPosition(newposition, dragboardStyle);
			_reserveSpace(matrix, gadgetToMove);
			gadgetToMove = null;
			shadowMatrix = null;
		}

		// *******************
		// INITIALIZING CODE
		// *******************
		dragboard = document.getElementById$("dragboard");
		dragboardStyle = new DragboardStyle(dragboard, 3, 15); // 3 columns, cell height = 15px

		_clearMatrix();

		var persistenceEngine = PersistenceEngineFactory.getInstance();
//		persistenceEngine.send_get(URIConstants.prototype.IGADGETS, this, _load, onError);
		persistenceEngine.send_get("dragboard.json", this, _load, onError);
	}

	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
		this.getInstance = function() {
			if (instance == null) {
				instance = new Dragboard();
				instance.constructor = null;
			}
			return instance;
		}
	}

}();


/////////////////////////////////////
// IGadget
/////////////////////////////////////

/**
 * This class represents a instance of one Gadget.
 * @author aarranz
 */
function IGadget(gadget, iGadgetId, position, width, height) {
	this.id = iGadgetId;
	this.gadget = gadget;
	this.position = position;
	this.width = width;
	this.height = height;
	this.element = null;
}

IGadget.prototype.getGadget = function() {
	return this.gadget;
}

/**
 * Sets the position of a gadget instance. The position is calculated relative
 * to the top-left square of the gadget instance box using cells units.
 */
IGadget.prototype.setPosition = function(position, style) {
	this.position = position;

	if (this.element != null) { // if visible
		this.element.style.left = style.getColumnOffsetLeft(position.x);
		this.element.style.top = style.fromVCellsToPixels(position.y) + "px";
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
}

IGadget.prototype.getContentWidth = function() {
	return this.width;
}

IGadget.prototype.setContentHeight = function(height) {
	this.height = height;
}

IGadget.prototype.getContentHeight = function() {
	return this.height;
}

/**
 * Return the actual height of the gadget. This depends in the status of the
 * gadget (minimized, with the configuration dialog, etc...)
 */
IGadget.prototype.getHeight = function() {
	return this.height + 2; // TODO assumed that the menu of the gadget has an height of 2
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

IGadget.prototype.bindUIEvents = function() {
}

IGadget.prototype.paint = function(where, style) {
	if (this.element != null) // if visible
		return; // TODO exception

	var gadgetElement, gadgetMenu, gadgetContent;

	gadgetElement = document.createElement("div");
	gadgetElement.setAttribute("id", "gadget_" + this.id + "_container");
	gadgetElement.setAttribute("class", "gadget_window");

	// Gadget Menu
	gadgetMenu = document.createElement("div");
	gadgetMenu.setAttribute("class", "gadget_menu");

	// buttons. Inserted from right to left
	gadgetMenu.innerHTML = "<div class=\"floatright button\" onclick=\"javascript:DragboardFactory.getInstance().removeInstance(" + this.id + ")\" >X</div>"	// close button
						 + "<div class=\"floatright button\" onclick=\"javascript:DragboardFactory.getInstance().configure(" + this.id + ")\" >P</div>"	// settings button
						 + "<div class=\"floatright button\" onclick=\"javascript:DragboardFactory.getInstance().minimize(" + this.id + ")\" >-</div>"	// minimize button
						 + "Gadget " + this.id;	// TODO Gadget Title

	gadgetElement.appendChild(gadgetMenu);

	// Gadget Content
	gadgetContent = document.createElement("object");
	gadgetContent.setAttribute("id", "gadget_" + this.id);
	gadgetContent.setAttribute("class", "gadget_object");
	gadgetContent.setAttribute("type", "text/html"); // TODO xhtml? => application/xhtml+xml
	if (this.gadget != null) // TODO remove this line this.gadgte must be not null
	gadgetContent.setAttribute("data", this.gadget.getXhtml().getURICode());
	gadgetContent.setAttribute("standby", "Loading...");
	gadgetContent.innerHTML = "Loading...."; // TODO add an animation

	gadgetElement.appendChild(gadgetContent);

	// Position // TODO
	gadgetElement.style.left = (3 + (this.position.x) * 32) + "%";
	gadgetElement.style.top = style.fromVCellsToPixels(this.position.y) + "px";

	// Sizes
	var width = this.getContentWidth();
	gadgetElement.style.width = ((30 * width) + (2 * (width - 1))) + "%";  // TODO
	gadgetContent.style.height = style.fromVCellsToPixels(this.height) + "px";
	gadgetContent.style.width = "100%";
	gadgetMenu.style.height = (style.fromVCellsToPixels(2) - 8) + "px"; // borders and margins
//(cellHeight - gadgetMenu.style.marginTop - gadgetMenu.style.marginBottom - gadgetMenu.style.borderTopWidth - gadgetMenu.style.borderBottomWidth) + "px";

	// References
	gadgetElement.iGadgetId = this.id;
	gadgetContent.iGadgetId = this.id;

	var startFunc = function (draggable) {
		draggable.element.style.zIndex = 200;
		DragboardFactory.getInstance().initializeMove(draggable.element.iGadgetId);
	}

	var updateFunc = function (draggable, event) {
		var position = DragboardFactory.getInstance().getCellAt(Event.pointerX(event), Event.pointerY(event));

		// If the mouse is inside of the dragboard and we have enought columns =>
		// check if we have to change the cursor position
		if (position != null)
			DragboardFactory.getInstance().moveTemporally(position.x, position.y);
	};

	var revertFunc = function (element) {
		if (element.revert == false) {
			delete element.revert;
			return false;
		} else {
			DragboardFactory.getInstance().cancelMove(); // TODO
			return true;
		}
	};

	// Mark as draggable
	var drag = new Draggable(gadgetElement, {
	                            handle: gadgetMenu,
	                            revert: revertFunc,
	                            onStart: startFunc,
	                            onDrag: updateFunc
	                         });

	// Commit it
	where.appendChild(gadgetElement);
	this.element = gadgetElement;

	return this.element;
}

IGadget.prototype.destroy = function() {
	if (this.element != null) {
		this.element.parentNode.removeChild(this.element);
		this.element = null;
	}	
}

/**
 * Set all preferences of this gadget instance to their default value
 */
IGadget.prototype.setDefaultPrefs = function() {
//	var prefs = this.gadget.getTemplate().getUserPrefs(); // TODO valid line, commented for testing
	var prefs = new Array();

	for (var i = 0; i < prefs.length; i++)
		prefs[i].setToDefault(this.id);
}

IGadget.prototype.makeConfigureInterface = function() {
//	var prefs = this.gadget.getTemplate().getUserPrefs(); // TODO valid line, commented for testing
	var prefs = new Array(); // TODO for testing
	var interface = "<form><div>";

	for (var i = 0; i < prefs.length; i++)
		interface += prefs[i].makeInterface(this.id);

	interface += "<div class=\"buttons\">" +
                 "<input type=\"submit\" name=\"op\" value=\"Save\" />" +
                 "<input type=\"submit\" name=\"op\" value=\"Cancel\" />" +
                 "</div>" +
                 "</div></form>";

	return interface;
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
}

DragboardStyle.prototype.getColumns = function() {
	return this.columns;
}

DragboardStyle.prototype.getCellHeight = function() {
	return this.cellHeight;
}

DragboardStyle.prototype.fromVCellsToPixels = function(cells) {
	return (cells * this.cellHeight);
}

DragboardStyle.prototype.fromHCellsToPixels = function(cells) {
	return (cells * (this.dragboardElement.offsetWidth * 0.30)); // TODO
}

DragboardStyle.prototype.getColumnOffsetLeft = function(column) {
	var percentage = 3 + (column * 32); // TODO this is for 3 columns
	return ((this.dragboardElement.offsetWidth * percentage) / 100) + "px"; // TODO script.aculo.us sucks with percentages
}

/////////////////////////////////////
// DragboardCursor
/////////////////////////////////////
function DragboardCursor(iGadget, position) {
	var positiontmp = iGadget.getPosition();
	this.position = positiontmp.clone();

	this.width = iGadget.getContentWidth();
	this.height = iGadget.getContentHeight();
}

DragboardCursor.prototype = new IGadget();

DragboardCursor.prototype.paint = function(dragboard, style) {
	var dragboardCursor = document.createElement("div");
	dragboardCursor.setAttribute("id", "dragboardcursor");
	dragboard.appendChild(dragboardCursor);

	// Set width and height
	dragboardCursor.style.height = style.fromVCellsToPixels(this.getHeight()) + "px";
	dragboardCursor.style.width = (style.fromHCellsToPixels(this.getContentWidth()) - 2) + "px"; // -2 px for borders

	// Set position
	dragboardCursor.style.left = style.getColumnOffsetLeft(this.position.x);
	dragboardCursor.style.top = style.fromVCellsToPixels(this.position.y) + "px";

	// Add as a droppable
	Droppables.add(dragboardCursor, {
		onDrop: function(element, cursor, event) {
			// Cancel revert effect
			element.revert = false; // see revert function in draggable

			// Accept the new position
			DragboardFactory.getInstance().acceptMove(element.iGadgetId); // TODO
		}
	});

	// assign the created element
	this.element = dragboardCursor;
}

DragboardCursor.prototype.destroy = function() {
	if (this.element != null) {
		Droppables.remove(this.element);
		this.element.parentNode.removeChild(this.element);
		this.element = null;
	}
}

