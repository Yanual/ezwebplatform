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
	this.defaultValue = defaultValue_;
}

UserPref.prototype.validate = function (newValue) {
	return true;
}

UserPref.prototype.getCurrentValue = function (iGadgetId) {
//  return "ValorInicial" // For testing
	var variable = VarManagerFactory.getInstance().getVariable(this.iGadgetId, this.varName);

	if (variable != null)
		return variable.get();
	else
		return "";
}

UserPref.prototype.setValue = function (iGadgetId, newValue) {
	if (this.validate(newValue)) {

	    var varManager = VarManagerFactory.getInstance();
		varManager.getVariable(iGadgetId, name).set(newValue);
	}
}

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
}

/**
 * extends UserPref
 * @autor aarranz
 */
function IntUserPref(name_, label_, _desc, defaultValue_) {
	UserPref.prototype.UserPref.call(this, name_, label_, desc_, defaultValue_);
}

IntUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<input type=\"text\" ";
	var currentValue =this.getCurrentValue();
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";
	output += "/>";

	return output;
}

IntUserPref.prototype.validate = function (newValue) {
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

	output += "<input type=\"text\" ";

	var currentValue = this.getCurrentValue();
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";

	output += "/>";

	return output;
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

	output += "<input type=\"text\" ";

	var currentValue = this.getCurrentValue();
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";

	output += "/>";

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

	output += "<input type=\"text\" ";

	var currentValue = this.getCurrentValue();
	if (currentValue != null)
		output += "value=\"" + currentValue + "\" ";

	output += "/>";

	return output;
}

