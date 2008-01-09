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
	this.igadget = igadget_;
	this.varName = varName_;
	this.conceptName = conceptName_;
}

//ContextVar.prototype.ContextVar = function (igadget_, varName_, conceptName_) {
//	this.igadget = igadget_;
//	this.varName = varName_;
//	this.conceptName = conceptName_;
//}

ContextVar.prototype.getName = function () {
	return this.varName;
}

ContextVar.prototype.getIGadget = function () {
	return this.igadget;
}

ContextVar.prototype.getConceptName = function () {
	return this.conceptName;
}

ContextVar.prototype.setValue = function (newValue) {
	VarManagerFactory.getInstance().updateContextVar(this.igadget, this.varName, newValue);
}

//////////////////////////////////////////////////////////
// Concept
//////////////////////////////////////////////////////////
function Concept(semanticConcept_, adaptor_, conceptName_) {
	this.semanticConcept = semanticConcept_;
	this.adaptor = adaptor_;
	this.conceptName = conceptName_;
}

//Concept.prototype.Concept = function (semanticConcept_, adaptor_, conceptName_) {
//	this.semanticConcept = semanticConcept_;
//	this.adaptor = adaptor_;
//	this.conceptName = conceptName_;
//}

Concept.prototype.getSemanticConcept = function () {
	return this.semanticConcept;
}

Concept.prototype.getAdaptor = function () {
	return this.adaptor;
}

Concept.prototype.getConceptName = function () {
	return this.conceptName;
}