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


function Tag(tagJSON_)
{
	var state = new StateTag(tagJSON_);
	
	this.getValue = function() { return state.getValue(); }
	this.getAppearances = function() { return state.getAppearances(); }
	
	this.tagToHTML = function() {
		var jsCall = 'javascript:UIUtils.searchByTag(URIs.GET_RESOURCES_BY_TAG, "' + state.getValue() + '");';

		return "<a title='Buscar " + state.getValue() +"' href='" + jsCall + "'>" + state.getValue() + "</a>";
	}
	
	this.tagToTypedHTML = function() {
		var classAux = '';
		if (state.getAppearances()<5)		classAux = 'tag_type_1';
		else if (state.getAppearances()<15) classAux = 'tag_type_2';
		else if (state.getAppearances()<25) classAux = 'tag_type_3';
		else classAux = 'tag_type_4';
		
		var jsCall = 'javascript:UIUtils.searchByTag(URIs.GET_RESOURCES_BY_TAG, "' + state.getValue() + '");';

		var result = "<a class='" + classAux + "' title='Buscar "+ state.getValue() +"' href='" + jsCall + "'>" + state.getValue() + "</a>";

		return result;
	}
	
	this.equals = function(tag_) {
		return ((tag_.getValue() == state.getValue()) && (tag_.getAppearances() == state.getAppearances()));
	}
	
	this.compareTo = function(tag_) {
		if 		(state.getAppearances() < (tag_.getAppearances())) return -1;
		else if	(state.getAppearances() > (tag_.getAppearances())) return 1;
		else return 0;
	}
}

function StateTag(tagJSON_) 
{
    var value = tagJSON_.value;
	var appearances = 1;
	//var value = tagXML_.getElementsByTagName("value")[0].firstChild.nodeValue;
	//var appearances = parseInt(tagXML_.getElementsByTagName("appearances")[0].firstChild.nodeValue);
	
	this.getValue = function() { return value; }
	this.getAppearances = function() { return appearances; } 
}
