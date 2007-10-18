/**
 * abstract
 * @author aarranz
 */
function UserPref(varName_, desc_) {
	var varName = null;
	var desc = null;
}

UserPref.prototype.UserPref = function (varName_, desc_) {
    var varName = varName_;
	var desc = desc_;
}

UserPref.prototype.validate = function (newValue) {
	return true;
}

UserPref.prototype.getCurrentValue = function (iGadgetId) {
//  return "ValorInicial" // For testing
	return VarManagerFactory.getInstance().getVariable(iGadgetId, varName).get();
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
function ComboBoxUserPref(name_, desc_, options_) {
	UserPref.call(this, name_, desc_);
	this.options = options_;
}

ComboBoxUserPref.prototype = new UserPref();

ComboBoxUserPref.prototype.makeInterface = function (iGadgetId) {
	var output = "";

	output += "<select>";
	for (var i; i < options.lenght; i++)
		output += "<option value=\"" + i + "\">" + option[i] + "</option>";
	output += "</select>";

	return output;
}

ComboBoxUserPref.prototype.getOptions = function () {
}

ComboBoxUserPref.prototype.setOptions = function () {
}

ComboBoxUserPref.prototype.addOption = function (option) {
}

ComboBoxUserPref.prototype.removeOption = function (option) {
}

ComboBoxUserPref.prototype.validate = function (newValue) {
}

/**
 * extends UserPref
 * @autor aarranz
 */
function IntUserPref(name_, _desc) {
	UserPref.prototype.UserPref.call(this, name_, desc_);
}

IntUserPref.prototype.makeInterface = function (IGadgetId) {
	var output = "";

	output += "<input type=\"text\" ";
	var currentValue = VarManagerFactory.getInstance().getVariable(IGadgetId, varName);
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
function TextUserPref(name_, desc_) {
	UserPref.prototype.UserPref.call(this, name_, desc_);
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

