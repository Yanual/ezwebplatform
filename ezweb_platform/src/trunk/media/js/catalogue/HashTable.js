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


function HashTable() {
	
	var list = [];
	
	this.addElement = function(key_, value_) {
		list.push(new TableElement(key_, value_));
	}
	
	this.removeElement = function(key_) {
		for (var i=0; i<list.length; i++)
		{
			if (list[i].getKey() == key_) {
				list = list.without(list[i]);
			}
		}
	}
	
	this.getValue = function(key_) {
		for (var i=0; i<list.length; i++)
		{
			if (list[i].getKey() == key_) {
				return list[i].getValue();
			}
		}
		return '';
	}
	
	this.clear = function() {
		while (list.length > 0)
		{
			list = list.without(list[0]);
		}
	}
	
	this.size = function() {
		return list.length;
	}
	
	this.getValues = function() {
		var values = [];
		for (var i=0; i<list.length; i++){
			values[i] = list[i].getValue();
		}		
		return values;
	}
	
	this.contains = function(value_) {
		for (var i=0; i<list.length; i++){
			if (list[i].getValue() == value_) {
				return true;
			}
		}
		return false;
	}
	
	// ***************
	//  PRIVATE CLASS
	// ***************
	
	var TableElement = function(key_, value_) {
		var key = key_;
		var value = value_;
		
		this.getKey = function() { return key; }
		this.getValue = function() { return value; }
	}
}