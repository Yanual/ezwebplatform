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

function ContextVar(igadget_, varName_, conceptName_) {
	this._igadget = igadget_;
	this._varName = varName_;
	this._conceptName = conceptName_;
	this._value = null;
}

ContextVar.prototype.getName = function () {
	return this._varName;
}

ContextVar.prototype.getIGadget = function () {
	return this._igadget;
}

ContextVar.prototype.getConceptName = function () {
	return this._conceptName;
}

ContextVar.prototype.getValue = function () {
	return this._value;
}

ContextVar.prototype.setValue = function (newValue_) {
	this._value = newValue_;
	VarManagerFactory.getInstance().updateContextVar(this._igadget, this._varName, newValue_);
}

//////////////////////////////////////////////////////////
// Concept
//////////////////////////////////////////////////////////
function Concept(semanticConcept_, adaptor_) {
	this._semanticConcept = semanticConcept_;
	this._adaptor = adaptor_;
	this._type = null;
	this._value = null;

	this._igadgetVars = new Array();
	
	this._initAdaptor = function (ivar_) {
		if (ivar_ == null){
			// Adaptor of External Context variable doesn't receives any parameter   
			eval ('new ' + adaptor_ + "()"); 
		}else{
			// Adaptor of Gadget Context variable receives the IGadget as parameter			
			eval ('new ' + adaptor_ + "("+ ivar_.getIGadget() +")");
		}
	}
	
}

Concept.prototype.EXTERNAL = 'ECTX';
Concept.prototype.IGADGET = 'GCTX';

Concept.prototype.getSemanticConcept = function () {
	return this._semanticConcept;
}

Concept.prototype.getAdaptor = function () {
	return this._adaptor;
}

Concept.prototype.getValue = function () {
	if (this._type == Concept.prototype.EXTERNAL){
		return this.value_;
	}
	throw gettext("Concept does not have value, this is a Gadget Concept.");
}

Concept.prototype.setType = function (type_) {
	if (this._type == null){
		this._type = type_;			
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
			throw gettext("Concept does not have type yet.");
			break;
	}
}

Concept.prototype.addIGadgetVar = function (ivar_) {
	switch (this._type) {
		case Concept.prototype.EXTERNAL:
			if (this.value != null){
				ivar_.setValue(this._value);
				this._igadgetVars.push(ivar_);		
			}else{
				this._igadgetVars.push(ivar_);
				this._initAdaptor(null);
			}
			break;
		case Concept.prototype.IGADGET:
			this._igadgetVars.push(ivar_);
			this._initAdaptor(ivar_);
			break;
		default:
			throw gettext("Concept does not have type yet.");
			break;
	}
}

Concept.prototype.getIGadgetVar = function (igadgetId_) {
	switch (this._type) {
		case Concept.prototype.IGADGET:
			for (var i = 0; i < this._igadgetVars.length; i++){
				var ivar = this._igadgetVars[i];
				if (ivar.getIGadget() == igadgetId_){
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


