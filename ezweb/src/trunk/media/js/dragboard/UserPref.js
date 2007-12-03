/**
 * abstract
 * @author aarranz
 */
function UserPref(varName_, label_, desc_, defaultValue_) {
	this.varName = null;
	this.label = null;
	this.desc = null;
	this.defaultValue = null;
}

UserPref.prototype.UserPref = function (varName_, label_, desc_, defaultValue_) {
	this.varName = varName_;
	this.label = label_;
	this.desc = desc_;

	if ((defaultValue_ == null) || (defaultValue_ == undefined))
		this.defaultValue = "";
	else
		this.defaultValue = defaultValue_;
}

UserPref.prototype.getVarName = function () {
	return this.varName;
}

UserPref.prototype.validate = function (newValue) {
	return true;
}

UserPref.prototype.getCurrentValue = function (iGadgetId) {
	return VarManagerFactory.getInstance().getVariable(iGadgetId, this.varName);
}

UserPref.prototype.setValue = function (iGadgetId, newValue) {
	if (this.validate(newValue)) {
		var varManager = VarManagerFactory.getInstance();
		varManager.updateUserPref(iGadgetId, this.varName, newValue);
	}
}

UserPref.prototype.setToDefault = function (iGadgetId) {
    var varManager = VarManagerFactory.getInstance();
	varManager.updateUserPref(iGadgetId, this.varName, this.defaultValue);
}

//////////////////////////////////////////////
// PUBLIC CONSTANTS
//////////////////////////////////////////////
UserPref.prototype.TEXT    = "S"; // "S"tring
UserPref.prototype.INTEGER = "N"; // "N"umber
UserPref.prototype.DATE    = "D"; // "D"ate
UserPref.prototype.LIST    = "L"; // "L"ist
UserPref.prototype.BOOLEAN = "B"; // "B"oolean

/**
 * extends UserPref
 * @author aarranz
 */
function ListUserPref(name_, label_, desc_, ValueOptions_, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
	this.options = options_;
}

ListUserPref.prototype = new UserPref();

ListUserPref.prototype.makeInterface = function (iGadgetId) {
	var output = "";

	output += "<select>";
	for (var i; i < options.lenght; i++)
		output += "<option value=\"" + i + "\">" + option[i] + "</option>";
	output += "</select>";

	return output;
}

ListUserPref.prototype.validate = function (newValue) {
    return this.options[newValue] != undefined;
}

/**
 * extends UserPref
 * @autor aarranz
 */
function IntUserPref(name_, label_, desc_, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
}

IntUserPref.prototype = new UserPref();

IntUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<label title=\"" + this.desc + "\">" + this.label;
	output += "<input name=\"" + this.varName + "\" type=\"text\" ";

	var currentValue =this.getCurrentValue(IGadgetId);
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";
	output += "/></label>";

	return output;
}

IntUserPref.prototype.validate = function (newValue) {
	return !isNaN(parseInt(newValue));
}

/**
 * extends UserPref
 * @autor aarranz
 */
function TextUserPref(name_, label_, desc_, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
}

TextUserPref.prototype = new UserPref();

TextUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<label title=\"" + this.desc + "\">" + this.label;
	output += "<input name=\"" + this.varName + "\" type=\"text\" ";

	var currentValue = this.getCurrentValue(IGadgetId);
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";

	output += "/></label>";

	return output;
}

/**
 * extends UserPref
 * @autor aarranz
 */
function DateUserPref(name_, label_, desc_, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
}

DateUserPref.prototype = new UserPref();

DateUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<label title=\"" + this.desc + "\">" + this.label;
	output += "<input name=\"" + this.varName + "\" type=\"text\" ";

	var currentValue = this.getCurrentValue(IGadgetId);
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";

	output += "/></label>";

	return output;
}

/**
 * extends UserPref
 * @autor aarranz
 */
function BoolUserPref(name_, label_, desc_, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
}

BoolUserPref.prototype = new UserPref();

BoolUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<label title=\"" + this.desc + "\">" + this.label;
	output += "<input name=\"" + this.varName +"\" type=\"checkbox\" ";

	var currentValue = this.getCurrentValue(IGadgetId);
	if (currentValue)
		output += "checked=\"true\" ";

	output += "/></label>";

	return output;
}

