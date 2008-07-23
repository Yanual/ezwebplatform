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

function ContextVar(igadgetId_, varName_, conceptName_) {
	this._igadgetId = igadgetId_;
	this._varName = varName_;
	this._conceptName = conceptName_;
	this._varManager = null;
	this._value = null;
	this._gadgetLoaded = false;
}

ContextVar.prototype.getName = function () {
	return this._varName;
}

ContextVar.prototype.getIGadgetId = function () {
	return this._igadgetId;
}

ContextVar.prototype.getConceptName = function () {
	return this._conceptName;
}

ContextVar.prototype.getValue = function () {
	return this._value;
}

ContextVar.prototype.propagateValue = function () {
	if (this._gadgetLoaded)
		return;
	
	this._gadgetLoaded = true;
	this.setValue(this._value);
}

ContextVar.prototype.setValue = function (newValue_) {
	this._value = newValue_;
	if (this._varManager !=null)
		this._varManager.getVariableByName(this._igadgetId, this._varName).set(newValue_);
}

ContextVar.prototype.setVarManager = function (varManager_) {
	this._varManager = varManager_;
}

ContextVar.prototype.unload = function () {
	delete this._igadgetId;
	delete this._varName;
	delete this._conceptName;
	delete this._varManager;
	delete this._value;
	
	delete this;
}

//////////////////////////////////////////////////////////
// Concept
//////////////////////////////////////////////////////////
function Concept(semanticConcept_, adaptor_) {
	this._semanticConcept = semanticConcept_;
	this._adaptor = adaptor_;
	this._type = null;
	this._value = null;
	this._initialValue = null;

	this._igadgetVars = new Array();

	this._initAdaptor = function (ivar_) {
		if (ivar_ == null){
			// Adaptor of External Context variable doesn't receives any parameter   
			eval ('new ' + adaptor_ + "()"); 
		}else{
			// Adaptor of Gadget Context variable receives the IGadget as parameter			
			eval ('new ' + adaptor_ + "("+ ivar_.getIGadgetId() +")");
		}
	}
	
}

// Known concept types
Concept.prototype.EXTERNAL = 'ECTX';
Concept.prototype.IGADGET = 'GCTX';

// Known concepts
Concept.prototype.USERNAME = "username";
Concept.prototype.LANGUAGE = "language";
Concept.prototype.WIDTH = "width";
Concept.prototype.WIDTHINPIXELS = "widthInPixels";
Concept.prototype.HEIGHT = "height";
Concept.prototype.HEIGHTINPIXELS = "heightInPixels";
Concept.prototype.XPOSITION = "xPosition";
Concept.prototype.YPOSITION = "yPosition";
Concept.prototype.LOCKSTATUS = "lockStatus";

Concept.prototype.getSemanticConcept = function () {
	return this._semanticConcept;
}

Concept.prototype.getAdaptor = function () {
	return this._adaptor;
}

Concept.prototype.getValue = function () {
	if (this._type == Concept.prototype.EXTERNAL){
		return this._value;
	}
	throw gettext("Concept does not have value, this is a Gadget Concept.");
}

Concept.prototype.setType = function (type_) {
	if (this._type == null){
		this._type = type_;
		switch (this._type) {
			case Concept.prototype.EXTERNAL:
				if (this._initialValue != null){
					this._value = this._initialValue;
				}
				break;
			default:
				this._initialValue = null;						
				break;
			}
	} else if (this._type != type_) {
		throw gettext("Unexpected change of concept type.");
	}
}

Concept.prototype.setValue = function (value_) {
	switch (this._type) {
		case Concept.prototype.EXTERNAL:
			this._value = value_;
			for (var i = 0; i < this._igadgetVars.length; i++){
				var ivar = this._igadgetVars[i];
				ivar.setValue(value_);
			} 
			break;
		case Concept.prototype.IGADGET:
			throw gettext("Concept does not have value, this is a Gadget Concept.");
			break;
		default:
			throw gettext("Unexpected concept value. Please, check the concept type (is EXTERNAL?)");
			break;
	}
}

Concept.prototype.setInitialValue = function (newValue_) {
	this._initialValue = newValue_;
	this._value = newValue_;
}

Concept.prototype.propagateIGadgetVarValues = function (iGadget_) {
	for (var i = 0; i < this._igadgetVars.length; i++){
		var ivar = this._igadgetVars[i];
		if ((iGadget_ == null) || (ivar.getIGadgetId() == iGadget_))
			ivar.propagateValue();
	} 
}

Concept.prototype.addIGadgetVar = function (ivar_) {
	switch (this._type) {
		case Concept.prototype.EXTERNAL:
			if (this._value != null){
				ivar_.setValue(this._value);
				this._igadgetVars.push(ivar_);		
			}else{
				this._igadgetVars.push(ivar_);
				if (this._adaptor)
					this._initAdaptor(null);
			}
			break;
		case Concept.prototype.IGADGET:
			this._igadgetVars.push(ivar_);
			if (this._adaptor)
				this._initAdaptor(ivar_);
			break;
		default:
			throw gettext("Unexpected igadget variables. Concept does not have type yet.");
			break;
	}
}

Concept.prototype.deleteIGadgetVars = function (igadgetId_) {
	var i = 0;
	while (i < this._igadgetVars.length){
		var ivar = this._igadgetVars[i];
		if (ivar.getIGadgetId() == igadgetId_){
				this._igadgetVars.splice(i, 1);
		}else{
			i++;
		}
	}
}

Concept.prototype.getIGadgetVar = function (igadgetId_) {
	switch (this._type) {
		case Concept.prototype.IGADGET:
			for (var i = 0; i < this._igadgetVars.length; i++){
				var ivar = this._igadgetVars[i];
				if (ivar.getIGadgetId() == igadgetId_){
					return ivar;
				}
			}
			throw interpolate (gettext("%(concept)s Concept is not related to IGadget number %(var)s."), {'concept': this._semanticConcept, 'var': igadgetId_}, true)
			break;
		case Concept.prototype.EXTERNAL:
			throw gettext("This is a External Concept, 'getIGadgetVar' is only for Gadget Concept.");
			break;
		default:
			throw gettext("Concept does not have type yet.");
	}
}

Concept.prototype.unload = function () {
	
	// Delete all the igadget variables related to this concept
	var keys = this._igadgetVars.keys();
	for (var i=0; i<keys.length; i++) {
		this._igadgetVars[keys[i]].unload();
		delete this._igadgetVars[keys[i]];
	}
	
	// Delete all the Concept attributes
	delete this._semanticConcept;
	delete this._adaptor;
	delete this._type;
	delete this._value;
	delete this._initialValue;
	
	delete this.EXTERNAL;
	delete this.IGADGET;
	delete this.USERNAME;
	delete this.LANGUAGE;
	delete this.WIDTH;
	delete this.WIDTHINPIXELS;
	delete this.HEIGHT;
	delete this.HEIGHTINPIXELS;
	delete this.XPOSITION;
	delete this.YPOSITION;
	delete this.LOCKSTATUS;
	
	delete this;

}



