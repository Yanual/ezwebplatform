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
function DropDownMenu(idLauncher, idSubmenu){

	//Constructor
	this.idLauncher = idLauncher;	//Launcher: clicked point from which the menu is launched
	this.launcher = $(idLauncher);
	this.idSubmenu = idSubmenu;	//Submenu: menu element in the HTLM code (<div>)
	this.submenu = $(idSubmenu);
	this.position;				//position related to the launcher
	
	//Calculates the absolute position of the menu according to the point from which it is launched
	//The menu can be displayed either at the bottom or top (on the right/left) of the launcher
	DropDownMenu.prototype.calculatePosition = function(){

				
		var coordenates = Position.cumulativeOffset(this.launcher);
		var smWidth = this.submenu.getWidth();
			
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
		this.submenu.style.top = coordenates[1]+"px";
		this.submenu.style.left = coordenates[0]+"px";
		
	}

	//Adds an option to the menu created from the HTML.
	//imgPath to be shown beside the option (may be null)-- option text -- event:function called on clicking
	DropDownMenu.prototype.addOption = function(imgPath, option, event){
		
		var lastOption = $$('#'+this.idSubmenu+' div:last-child')[0];

		if( lastOption){//last option doesn't have a underline
			lastOption.toggleClassName('underlined');
		}
		//create the HTML code for the option and insert it in the menu
		var opHtml = '<div>';
		if (imgPath){
			opHtml += '<img src="'+imgPath+'"/>';
		}
		opHtml += '<span>'+option+'</span></div>';
		new Insertion.Bottom(this.submenu, opHtml);
		lastOption = $$('#'+this.idSubmenu+' div:last-child')[0];
		Event.observe(lastOption, 'click', event);
			
	}

	//displays the menu in the correct position
	DropDownMenu.prototype.showSubmenu = function(){

		this.submenu.style.display="none";
		this.calculatePosition();	
		new Effect.BlindDown(this.idSubmenu, {duration:0.8});
	}

	//hides the menu and changes the image of the launcher (in case it has to)
	DropDownMenu.prototype.hide = function (){

		this.launcher.addClassName(this.idLauncher+'_show');
		this.launcher.removeClassName(this.idLauncher+'_hide');

		new Effect.BlindUp(this.idSubmenu, {duration:0.5});	
	}

	//shows the menu (calling showSubmenu function) and changes the image of the launcher (in case it has to)	
	DropDownMenu.prototype.show = function (position){
		//the menu may have change its position on the layout, so it's necessary to recover the element.
		this.launcher=$(this.idLauncher);
		this.launcher.addClassName(this.idLauncher+'_hide');
		this.launcher.removeClassName(this.idLauncher+'_show');
		this.position = position;

		this.showSubmenu(position);
	}

	//Clears the menu options
        DropDownMenu.prototype.clearOptions = function(){
		this.submenu.update();
	}

}	

