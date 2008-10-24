/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2008 Telefónica Investigación y Desarrollo 
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


/**
 * abstract
 * @author jmostazo-upm
 */
function PlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	this.name = null;
	this.label = null;
	this.desc = null;
	this.defaultValue = null;
	this.selectedValue = null;
	this.concept = null;
	this.formElement = null;
	this.labelElement = null;
}

PlatformPref.prototype.PlatformPref = function (name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	this.name = name_;
	this.concept = concept_;
	this.label = label_;
	this.desc = desc_;
	this.defaultValue = defaultValue_;
	this.selectedValue = selectedValue_;
        this.formElement = null;
        this.labelElement = null;
}

PlatformPref.prototype.getName = function () {
	return this.name;
}

PlatformPref.prototype.getConcept = function () {
        return this.concept;
}

PlatformPref.prototype.getLabel = function () {
        return this.label;
}

PlatformPref.prototype.getDescription = function () {
        return this.description;
}

PlatformPref.prototype.getDefaultValue = function () {
        return this.getDefaultValue;
}

PlatformPref.prototype.getValue = function () {
        return this.selectedValue;
}

PlatformPref.prototype.setValue = function (value_) {
        if (this.validate(value_)) {
		this.selectedValue = value_;
	}
}

PlatformPref.prototype.validate = function (newValue_) {
	this.labelElement.style.color = "black";
	return true;
}

PlatformPref.prototype.setDefaultValue = function () {
	this.setValue(this.defaultValue);
}

PlatformPref.prototype.getValueFromInterface = function () {
	return this.formElement.value;
}

PlatformPref.prototype.setValueInInterface = function () {
	this.formElement.value = this.selectedValue;
}

PlatformPref.prototype.getLabelInterface = function () {
	var label = document.createElement("label");
	label.appendChild(document.createTextNode(gettext(this.label)));
	label.setAttribute("title", gettext(this.desc));
	label.setAttribute("for", this.name);
	this.labelElement = label;
	return label;
}

PlatformPref.prototype.notifyContextVariable = function () {
	if (this.concept != null) {
		OpManagerFactory.getInstance().activeWorkSpace.getContextManager().notifyModifiedConcept(this.concept, this.selectedValue);
	}
}

//////////////////////////////////////////////
// PUBLIC CONSTANTS
//////////////////////////////////////////////
PlatformPref.prototype.TEXT     = "S"; // "S"tring
PlatformPref.prototype.INTEGER  = "N"; // "N"umber
PlatformPref.prototype.DATE     = "D"; // "D"ate
PlatformPref.prototype.LIST     = "L"; // "L"ist
PlatformPref.prototype.BOOLEAN  = "B"; // "B"oolean
PlatformPref.prototype.PASSWORD = "P"; // "P"assword

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
function ListPlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_, options_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_, selectedValue_);
	this.options = options_;
}

ListPlatformPref.prototype = new PlatformPref();

ListPlatformPref.prototype.makeInterface = function () {
	var element = StyledElements.createStyledSelect(this.name, this.selectedValue, this.options);
	this.formElement = element.getElementsByTagName("select")[0];
	return element;
}

ListPlatformPref.prototype.validate = function () {
	if (this.options == null)
		this.options = [];

	for (var i=0; i<this.options.length; i++) {
		if (this.options[i][0] == this.formElement.value) {
			this.labelElement.style.color = "black";
			return true;
		}
	}
	
	this.labelElement.style.color = "red";
	return false;
}

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
function IntPlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_, selectedValue_);
}

IntPlatformPref.prototype = new PlatformPref();

IntPlatformPref.prototype.makeInterface = function () {
	var element = StyledElements.createStyledNumericField(this.name, this.selectedValue);
	this.formElement = element.getElementsByTagName("input")[0];
        return element;
}

IntPlatformPref.prototype.validate = function () {
	if (!isNaN(Number(this.formElement.value))) {
		this.formElement.style.color = "black";
                return true;
	}
	this.labelElement.style.color = "red";
       	return false;
}

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
function TextPlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_, selectedValue_);
}

TextPlatformPref.prototype = new PlatformPref();

TextPlatformPref.prototype.makeInterface = function () {
	var element = StyledElements.createStyledTextField(this.name, this.selectedValue);
        this.formElement = element.getElementsByTagName("input")[0];
        return element;
}

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
function DatePlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_, selectedValue_);
}

DatePlatformPref.prototype = new PlatformPref();

DatePlatformPref.prototype.makeInterface = function () {
	var element = StyledElements.createStyledTextField(this.name, this.selectedValue);
        this.formElement = element.getElementsByTagName("input")[0];
        return element;
}

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
function BoolPlatformPref(name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_.strip().toLowerCase(), selectedValue_.strip().toLowerCase());
}

BoolPlatformPref.prototype = new PlatformPref();

BoolPlatformPref.prototype.makeInterface = function () {
	var element = document.createElement("input");
	element.setAttribute("name", this.name);
	element.setAttribute("type", "checkbox");
	if (this.selectedValue == "true")
		element.setAttribute("checked", true);
	this.formElement = element;
	return element;
}

BoolPlatformPref.prototype.getValueFromInterface = function() {
	return (this.formElement.checked)? "true" : "false";
}

BoolPlatformPref.prototype.setValueInInterface = function() {
	if (this.selectedValue == "true")
                this.formElement.checked = true;
	else
		this.formElement.checked = false;
}

/**
 * extends PlatformPref
 * @author jmostazo-upm
 */
PasswordPlatformPref = function (name_, concept_, label_, desc_, defaultValue_, selectedValue_) {
	PlatformPref.prototype.PlatformPref.call(this, name_, concept_, label_, desc_, defaultValue_, selectedValue_);
}

PasswordPlatformPref.prototype = new PlatformPref();

PasswordPlatformPref.prototype.makeInterface = function () {
	var element = StyledElements.createStyledPasswordField(this.name, this.selectedValue);
        this.formElement = element.getElementsByTagName("input")[0];
        return element;	
}
