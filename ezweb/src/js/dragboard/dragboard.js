// TODO split this file

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
		var matrix = new Array();
		var dragboard, dragboardStyle;
		var dragboardCursor = null;
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

			iGadgets.each( function (pair) {
				iGadget = pair.value;

				// TODO checkSpace
				// TODO reserveSpace
				gadgetElement = iGadget.paint(dragboard, dragboardStyle);
			});

			// TODO debug
			for (x = 0; x < dragboardStyle.getColumns(); x++)
				for (y = 0; y < 40; y++) {
					if (matrix[x][y] != null) {
						tmp = document.createElement("div");
						tmp.setAttribute("class", "occupedcell");
						grid.appendChild(tmp);
						tmp.style.top = dragboardStyle.fromVCellsToPixels(y) + "px";
						posX = 3 + (x * 32);
						tmp.style.left = posX + "%";
					}
				}
			// TODO end debug
		}

		/**
		 * Loads data from persistenceEngine
		 */
		function _load(receivedData) {
			var response = eval ('(' + receivedData.responseText + ')');
			var curIGadget, position, width, height, igadget;

			currentId = response.currentId;
			iGadgets = new Hash();

			tmp = response.iGadgets;
			for (var i = 0; i < response.iGadgets.length; i++) {
				curIGadget = response.iGadgets[i];

				position = new Object();
				position.x = parseInt(curIGadget.left);
				position.y = parseInt(curIGadget.top);
				width = parseInt(curIGadget.width);
				height = parseInt(curIGadget.height);

				igadget = new IGadget(null, curIGadget.id, position, width, height);
				iGadgets[curIGadget.id] = igadget;
				reserveSpace(position.x, position.y, width, igadget.getHeight(), igadget);
			}

			loaded = true;
			_repaint(); // TODO the OpManager must call to this method => remove from here
			OpManagerFactory.getInstance().continueLoading(Modules.prototype.DRAGBOARD);
		}

		function onError(receivedData) {
			alert("Error receiving dragboard data");
		}

		function destroyCursor() {
			if (dragboardCursor != null) {
				dragboardCursor.destroy();
				dragboardCursor = null;
			}
		}

		function reserveSpace(positionX, positionY, width, height, iGadget) {
			var x, y;

			for (x = 0; x < width; x++)
				for (y = 0; y < height; y++)
					matrix[positionX + x][positionY + y] = iGadget;
		}

		function clearSpace(positionX, positionY, width, height) {
			var x, y;

			for (x = 0; x < width; x++)
				for (y = 0; y < height; y++)
					matrix[positionX + x][positionY + y] = null;
		}

		function insertAt(gadget, x, y, style) {
			// Check width
			if ((x + gadget.getContentWidth()) > dragboardStyle.getColumns())
				return; // TODO Exception

			// Search the topmost position for the gadget
			if (matrix[x][y] != null) {
				y = matrix[x][y].getPosition().y;
			} else {
				if ((y == 0) || (matrix[x][y - 1] != null)) {
					y++;
				} else {
					while ((y > 0) && (matrix[x][y - 2] == null))
						y--;
				}
			}

			// 
			var position = new Object();
			position.x = x;
			position.y = y;
			gadget.setPosition(position, style);
		}

		// ****************
		// PUBLIC METHODS 
		// ****************
		Dragboard.prototype.addInstance = function (gadget) {
			// Search a position for the gadget
			var positionX, positionY, x, y;

			positionX = 0; // tmp
			positionY = 0;
			var width = 1;
			var height = 4 + 2; // one cell of margin at the top and at the bottom

			dragboard_addInstance_outermost: while (true) {
				for (x = 0; x < width; x++)
					for (y = 0; y < height; y++)
						if (matrix[positionX + x][positionY + y] != null) {
							positionY = positionY + y + 1;
							continue dragboard_addInstance_outermost;
						}
				break; // We have found a location for the gadget
			}

			// Add the offset of the margin (one cell of margin) and remove
			// margins to the height
			positionY++;
			height -= 2;

			// Create the instance
			var position = new Object();
			position.x = positionX;
			position.y = positionY;
			var iGadget = new IGadget(gadget, currentId, position, width, height);
			iGadgets[currentId] = iGadget;
			currentId++;

			// Configure it
			iGadget.setDefaultPrefs();

			// Reserve the cells for the gadget instance
			reserveSpace(positionX, positionY, width, iGadget.getHeight(), iGadget);

			return iGadget.getId();
		}

		Dragboard.prototype.removeInstance = function (iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			iGadgets.remove(iGadgetId);

			var position = igadget.getPosition();
			clearSpace(position.x, position.y, igadget.getContentWidth(), igadget.getHeight());
			igadget.destroy();
		}

		Dragboard.prototype.move = function (iGadgetId) {
			
		}

		Dragboard.prototype.maximize = function (iGadgetId) {
			var element = document.getElementById('gadget_' + iGadgetId);
			var mySlider = new Effect.SlideDown(element);
		}

		Dragboard.prototype.minimize = function (iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			var element = igadget.getElement();
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

			var position = new Object();
			var columnWidth = dragboard.offsetWidth / dragboardStyle.getColumns();

			position.x = Math.floor(x / columnWidth);
			position.y = Math.floor(y / dragboardStyle.getCellHeight());

			return position;
		}


		Dragboard.prototype.showInstance = function (iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			igadget.paint(dragboard, dragboardStyle);
		}

		Dragboard.prototype.moveTemporally = function (iGadgetId, x, y) {
			var igadget = iGadgets[iGadgetId];
			// if (igadget == null) exception

			if (dragboardCursor == null) {
				// Create dragboard cursor if needed
				var position = new Object();
				position.x = x;
				position.y = y;
				dragboardCursor = new DragboardCursor(igadget, position);
				dragboardCursor.paint(dragboard, dragboardStyle);
			}

			// Change cursor position
			insertAt(dragboardCursor, x, y, dragboardStyle);
//			dragboardCursor.style.top = (y * cellHeight) + "px";
//			dragboardCursor.style.left = (3 + (x * (30 + 2))) + "%"; // TODO
		}

		Dragboard.prototype.cancelMove = function(iGadgetId) {
			destroyCursor();
		}

		Dragboard.prototype.acceptMove = function(iGadgetId) {
			var igadget = iGadgets[iGadgetId];
			// if (igadget == null) exception

			var newposition = dragboardCursor.getPosition();
			igadget.setPosition(newposition, dragboardStyle);

			destroyCursor();
		}

		// *******************
		// INITIALIZING CODE
		// *******************
		dragboard = document.getElementById("dragboard");
		dragboardStyle = new DragboardStyle(dragboard, 3, 15); // 3 columns, cell height = 15px

		for (var x = 0; x < dragboardStyle.getColumns(); x++)
			matrix[x] = new Array();

		var persistenceEngine = PersistenceEngineFactory.getInstance();
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
	gadgetMenu.innerHTML = "<div class=\"right button\" onclick=\"javascript:DragboardFactory.getInstance().removeInstance(" + this.id + ")\" >X</div>"	// close button
						 + "<div class=\"right button\" onclick=\"javascript:DragboardFactory.getInstance().configure(" + this.id + ")\" >P</div>"	// settings button
						 + "<div class=\"right button\" onclick=\"javascript:DragboardFactory.getInstance().minimize(" + this.id + ")\" >-</div>"	// minimize button
						 + "Gadget " + this.id;	// TODO Gadget Title

	gadgetElement.appendChild(gadgetMenu);


	// Gadget Content
	gadgetContent = document.createElement("div");
	gadgetContent.setAttribute("id", "gadget_" + this.id);

	gadgetContent.innerHTML = this.makeConfigureInterface();
//	innerContent += this.gadget.getXhtml();
//	gadgetContent.innerHTML = "<b>hola</b>";

	gadgetElement.appendChild(gadgetContent);

	// Position // TODO
	gadgetElement.style.left = (3 + (this.position.x) * 32) + "%";
	gadgetElement.style.top = style.fromVCellsToPixels(this.position.y) + "px";

	// Sizes
	var width = this.getContentWidth();
	gadgetElement.style.width = ((30 * width) + (2 * (width - 1))) + "%";  // TODO
	gadgetContent.style.height = style.fromVCellsToPixels(this.height) + "px";
	gadgetMenu.style.height = (style.fromVCellsToPixels(2) - 8) + "px"; // borders and margins
//(cellHeight - gadgetMenu.style.marginTop - gadgetMenu.style.marginBottom - gadgetMenu.style.borderTopWidth - gadgetMenu.style.borderBottomWidth) + "px";

	// References
	gadgetElement.iGadgetId = this.id;
	gadgetContent.iGadgetId = this.id;


	var updateFunc = function (draggable, event) {
//		document.getElementById("debugconsole").innerHTML += "X:" + event.layerX + " Y: " + event.layerY  + "<br />";
		var position = DragboardFactory.getInstance().getCellAt(Event.pointerX(event), Event.pointerY(event));
		if (position != null)
			DragboardFactory.getInstance().moveTemporally(draggable.element.iGadgetId, position.x, position.y);
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
											  onStart:
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
	IGadget.call(this, null, null, position, iGadget.getContentWidth(), iGadget.getContentHeight());
}

DragboardCursor.prototype = new IGadget();

DragboardCursor.prototype.paint = function(dragboard, style) {
	var dragboardCursor = document.createElement("div");
	dragboardCursor.setAttribute("id", "dragboardcursor");
	dragboard.appendChild(dragboardCursor);

	// Set width and height according to the size of the gadget to move
	dragboardCursor.style.height = style.fromVCellsToPixels(this.getHeight()) + "px";
	dragboardCursor.style.width = (style.fromHCellsToPixels(this.getContentWidth()) - 2) + "px"; // -2 px for borders

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

