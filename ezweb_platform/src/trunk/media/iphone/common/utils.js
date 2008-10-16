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
 
 /******GENERAL UTILS **********/
 
 //ARRAY EXTENSIONS
 Array.prototype.elementExists = function (element){
 	if(this.indexOf(element) != -1)
 		return true;
 	return false;
 }
 Array.prototype.getElementById = function (id){
 	for(var i=0;i < this.length;i++){
 		if(this[i].getId() == id)
 			return this[i];
 	}
 	return null;
 }
 
 Array.prototype.getElementByName = function (elementName){
 	for(var i=0;i < this.length;i++){
 		if(this[i].getName() == elementName)
 			return this[i];
 	}
 	return null;
 }
 
 Array.prototype.remove = function(element){
 	var index = this.indexOf(element);
	if(index != -1)this.splice(index, 1);
 }
 
 Array.prototype.removeById = function (id){
 	var element;
 	for(var i=0;i < this.length;i++){ 	
 		if(this[i].getId() == id){
 			element = this[i];
 			this.splice(i, 1);
 			return element;
 		}
 	}
 	return null;
 }

/* Slide utility function */
var percent = 100;
var slideSpeed = 20;
var timer;
var percent;

function slide (backwards, element)
{
    percent -= slideSpeed;
    if (this.percent <= 0)
    {
        this.percent = 0;
    }
    element.style.left = (backwards ? -percent : percent) + "%"; 
    if (this.percent != 0)
    	setTimeout(function(){slide(backwards, element)}, 0);
    else
    	percent = 100;
}

/* language selection */
function setLanguage(language) {
	var onSuccess = function() {
		window.location.reload();
	}
	
	var onError = function() {}
	
	var persistenceEngine = PersistenceEngineFactory.getInstance();
	var params = {language: language};
	persistenceEngine.send_post("/i18n/setlang/", params, this, onSuccess, onError);
	return false;
}

/* layout change function (landscape or portrait) */
function updateLayout()
{
	var orient = (window.orientation==0 || window.orientation==180) ? "portrait" : "landscape";
    if (!loaded)
    {
    
    /*if (window.innerWidth != _currentWidth || !loaded)
	{
		_currentWidth = window.innerWidth;
		var orient = _currentWidth == 320 ? "portrait" : "landscape";
	*/
    	// change the orientation properties
    	document.body.setAttribute("orient", orient);
    	if (OpManagerFactory.getInstance().loadCompleted){
    		loaded=true;
    		clearInterval(updateInterval);
    		OpManagerFactory.getInstance().activeWorkSpace.updateLayout(orient);
    	}
    	else{
    		loaded=false;
    	}            
    }
    else{
    	//the onorientationchange has hapenned
    	document.body.setAttribute("orient", orient);
    	OpManagerFactory.getInstance().activeWorkSpace.updateLayout(orient);
    }
}

/* tab change function */
function checkTab()
{
	if (OpManagerFactory.getInstance().visibleLayer == "tabs_container"){
		var xoffset = window.pageXOffset;
	
		var tabWidth = window.innerWidth;	
		var halfTabWidth = tabWidth / 2;
	
		var scroll = xoffset < halfTabWidth 
			? - xoffset 
			: - (xoffset - halfTabWidth) % tabWidth + halfTabWidth;
		
		if (scroll != 0)
		{
			var STEP_H = tabWidth / 52;
			var steps = Math.abs(scroll / STEP_H);
			var step = scroll < 0 ? - STEP_H : STEP_H;
			
			for (var i=0; i<steps; i++) {
				window.scrollBy(step, 0);
			}		
			window.scrollTo(xoffset + scroll, 1);
			
			//update the visible Tab
			OpManagerFactory.getInstance().activeWorkSpace.updateVisibleTab(Math.round(window.pageXOffset / tabWidth));
		}
	}
	else if (OpManagerFactory.getInstance().visibleLayer == "dragboard"){ // dragboard
		window.scrollTo(0, 1);
	}
}