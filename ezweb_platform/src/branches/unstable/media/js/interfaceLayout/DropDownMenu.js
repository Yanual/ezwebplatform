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

//Class for managing a drop down menu whose HTML code is in templates/index.html.
//The options may be created either by default in the HTML code or dinamically with the addOption function
function DropDownMenu(idMenu){

	//Constructor
	this.idLauncher;	//Launcher: clicked point from which the menu is launched
	this.launcher;
	this.idMenu = idMenu;	//menu: menu element in the HTLM code (<div>)
	this.menu = $(idMenu);
	this.position;				//position related to the launcher
	this.submenu = $$('#'+this.idMenu+' .submenu')[0];
	this.option_id = 0;		//identifier for options
	
	//Calculates the absolute position of the menu according to the point from which it is launched
	//The menu can be displayed either at the bottom or top (on the right/left) of the launcher
	DropDownMenu.prototype.calculatePosition = function(){
		var coordenates = Position.cumulativeOffset(this.launcher);
		var smWidth = this.menu.getWidth();
			
		if(this.position == 'bottom-left'){
			coordenates[1] = coordenates[1] + this.launcher.getHeight();
			coordenates[0] = coordenates[0] + this.launcher.getWidth() - smWidth;
		}
		else if(this.position == 'top-right'){
			coordenates[0] = coordenates[0] + this.launcher.getWidth();
		}
		else if(this.position == 'top-left'){
			coordenates[0] = coordenates[0] - smWidth;
			
		}
		else{//bottom-right by default
			coordenates[1] = coordenates[1] + this.launcher.getHeight();
		}
		//set position
		this.menu.style.top = coordenates[1]+"px";
		this.menu.style.left = coordenates[0]+"px";
		
	}

	//Adds an option to the menu created from the HTML.
	//imgPath to be shown beside the option (may be null)-- option text -- event:function called on clicking
	DropDownMenu.prototype.addOption = function(imgPath, option, event){
		
		var lastOptionList = $$('#'+this.idMenu+' .option');
		var lastOption = lastOptionList[lastOptionList.length-1];

		if( lastOption){//last option doesn't have a underline
			lastOption.toggleClassName('underlined');
		}
		//create the HTML code for the option and insert it in the menu
		var opId='op_'+this.idMenu+'_'+this.option_id;
		var opHtml = '<div id="'+ opId +'" class = "option">';
		if (imgPath){
			opHtml += '<img src="'+imgPath+'"/>';
		}
		opHtml += '<span>'+option+'</span></div>';
		if(lastOption){
			new Insertion.After(lastOption, opHtml);
		}else{
			new Insertion.Top(this.menu, opHtml);
		}
		lastOption = $(opId);
		Event.observe(lastOption, 'click', event);
		this.option_id++;
		
		return opId;
	}
	
	//removes an option
	DropDownMenu.prototype.removeOption = function(opId){
		var option=$(opId).remove();
		if(!option.hasClassName('underlined')){
			var lastOption = $$('#'+this.idMenu+ ' .option:last-child')[0];
			if( lastOption){//last option doesn't have a underline
				lastOption.toggleClassName('underlined');
			}
		}
		
	}
		
	//updates an option
	DropDownMenu.prototype.updateOption = function(opId, imgPath, option, handler){
		var old=$(opId);
		var opHtml='<div id="'+ opId +'" class = "option">';
		if (imgPath){
			opHtml += '<img src="'+imgPath+'"/>';
		}
		opHtml += '<span>'+option+'</span>';
		new Insertion.Before(old, opHtml);
		old=old.remove();
		var newOp = $(opId);
		if(old.hasClassName('underlined')){
			newOp.toggleClassName('underlined');
		}
		Event.observe(newOp, 'click', handler);
		
	}

	//submenu operations
	DropDownMenu.prototype.addOptionToSubmenu = function(imgPath, option, event){
		
		var lastOption = $$('#'+this.idMenu+ ' .submenu div:last-child')[0];

		if( lastOption){//last option doesn't have a underline
			lastOption.toggleClassName('underlined');
		}
		//create the HTML code for the option and insert it in the menu
		var opId='secondary_op_'+this.idMenu+'_'+this.option_id;
		var opHtml = '<div id="'+ opId +'" class = "option">';
		if (imgPath){
			opHtml += '<img src="'+imgPath+'"/>';
		}
		opHtml += '<span>'+option+'</span></div>';
		new Insertion.Bottom(this.submenu, opHtml);
		lastOption = $(opId);
		Event.observe(lastOption, 'click', event);
		this.option_id++;
		
		return opId;			
	}
	
		//removes an option
	DropDownMenu.prototype.removeSecondaryOption = function(opId){
		var option=$(opId).remove();
		if(!option.hasClassName('underlined')){
			var lastOption = $$('#'+this.idMenu+ ' .submenu div:last-child')[0];
			if( lastOption){//last option doesn't have a underline
				lastOption.toggleClassName('underlined');
			}
		}
		
	}

	//displays the menu in the correct position
	DropDownMenu.prototype.showMenu = function(){

		this.calculatePosition();	
		
	}

	//hides the menu and changes the image of the launcher (in case it has to)
	DropDownMenu.prototype.hide = function (){

		this.menu.style.display="none";	
	}

	//shows the menu (calling showMenu function)	
	DropDownMenu.prototype.show = function (idLauncher, position){
		this.idLauncher = idLauncher;
		this.launcher = $(idLauncher);
		this.position = position;
		this.calculatePosition();
		this.menu.style.display="block";
	}

	//Clears the menu options
    DropDownMenu.prototype.clearOptions = function(){
		this.menu.update();
	}
	//Clears the submenu options
    DropDownMenu.prototype.clearSubmenuOptions = function(){
		this.submenu.update();
	}
}	

