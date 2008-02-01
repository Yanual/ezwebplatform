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



function UIUtils()
{
	// *********************************
	//           STATIC CLASS
	// *********************************
}

UIUtils.selectedResource = null;
UIUtils.imageBottom = '';
UIUtils.imageContent = '';
UIUtils.infoResourcesWidth = 400;
UIUtils.isInfoResourcesOpen = false;
UIUtils.page = 1;
UIUtils.search = 'false';
UIUtils.searchValue = '';
UIUtils.searchCriteria = '';

UIUtils.addResource = function(url, paramName, paramValue) {
	var newResourceOnSuccess = function (response) {
		OpManagerFactory.getInstance().repaintCatalogue(URIs.GET_POST_RESOURCES);
	}
	
	var newResourceOnError = function (response) {
		alert (response.responseText);
	}
	
	var persistenceEngine = PersistenceEngineFactory.getInstance();	

	var params = new Hash();
	params[paramName] = paramValue;

	persistenceEngine.send_post(url, params, this, newResourceOnSuccess, newResourceOnError);
}

UIUtils.getSelectedResource = function() {
	return UIUtils.selectedResource;
}
	
UIUtils.selectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	UIUtils.imageBottom = bottom.style.backgroundImage;
	bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom-select.png)';
	var content = document.getElementById(resourceId_ + '_content');
	UIUtils.imageContent = content.style.backgroundImage;
	content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill-select.png)';
}
	
UIUtils.deselectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	bottom.style.backgroundImage = UIUtils.imageBottom;
	var content = document.getElementById(resourceId_ + '_content');
	content.style.backgroundImage = UIUtils.imageContent;
}
	
UIUtils.showResourceInfo = function(resourceId_) {
	UIUtils.selectedResource = resourceId_;
	CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).showInfo();
}
	
UIUtils.toggle = function(elementId_) {
	var element = document.getElementById(elementId_);
	if (element.style.display != 'none')
	{
		element.style.display = 'none';
	}
	else
	{
		element.style.display = 'block';
	}
}

UIUtils.show = function(elementId_) {
	var element = document.getElementById(elementId_);
	element.style.display = 'inline';
}

UIUtils.hidde = function(elementId_) {
	var element = document.getElementById(elementId_);
	element.style.display = 'none';
}

UIUtils.changeImage = function(elementId_, newImage_) {
	var element = document.getElementById(elementId_);
	element.src = newImage_;
}

UIUtils.searchByTag = function(url, tag) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();

  if (tag == ""){
  	alert("Introduzca un valor en el formulario de búsqueda");
  }
  else{
      UIUtils.search = 'tag';
      UIUtils.searchValue = tag;
      UIUtils.searchCriteria = 'tag' ;
	    opManager.repaintCatalogue(url + "/" + tag );
}
}

UIUtils.searchByWiring = function(url, value, wiring) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();
	
	if (value == ""){
		alert(gettext ("Indicate a criteria in search formulary"));
	}
  
  else{
  UIUtils.search = 'wiring';
  UIUtils.searchValue = value;
  UIUtils.searchCriteria = wiring ;
	opManager.repaintCatalogue(url + "/" + wiring + "/" + value );
}
}

UIUtils.cataloguePaginate = function(url, offset, pag, items) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();
	var pages = Math.ceil(items/offset);
	
	if (UIUtils.search == 'false'){
		 url = URIs.GET_POST_RESOURCES;
	}
	if (UIUtils.search == 'generic'){
		url = URIs.GET_RESOURCES_SEARCH_GENERIC + "/" + UIUtils.searchValue + "/" + UIUtils.searchCriteria;
	}
  if (UIUtils.search == 'wiring'){
		url = URIs.GET_RESOURCES_BY_WIRING + "/" + UIUtils.searchCriteria + "/" + UIUtils.searchValue;
	}
  if (UIUtils.search == 'tag'){
		url = URIs.GET_RESOURCES_BY_TAG + "/" + UIUtils.searchValue;
	}
	
  if (pag == "prev"){
  	
  	if(UIUtils.page == 1){
  		pag = 1;
  	}
    else{
  		pag = UIUtils.page - 1;
  	}
  }
  
  if (pag == "next"){
  	if(UIUtils.page == pages){
  		pag = pages;
  	}
    else{
  	  pag = parseInt(UIUtils.page) + 1;
  }
  }
  UIUtils.page = pag;    
	opManager.repaintCatalogue(url + "/" + pag + "/" + offset);
	
}


UIUtils.searchGeneric = function(url, param, criteria) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();
	
	if (param == ""){
		alert(gettext ("Indicate a criteria in search formulary"));
		}
	else{ 
	UIUtils.searchValue = param;
  UIUtils.searchCriteria = criteria ;
	UIUtils.search = 'generic';
	
	opManager.repaintCatalogue(url + "/" + param + "/" + criteria + "/1/10");
}
}

UIUtils.removeTag = function(id_) {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeTag(id_);
}

UIUtils.removeAllTags = function() {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeAll();
}

UIUtils.removeTagUser = function(tag)
	{	
		  
		  var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);
	    var tagger = resource.getTagger();
	    var resourceURI = "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion() + "/" + tag;
			
			tagger.removeTagUser(URIs.DELETE_TAG, resourceURI);	
			
	}

UIUtils.sendTags = function() {
	var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);
	var tagger = resource.getTagger();
	var resourceURI = "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion();

	tagger.sendTags(URIs.POST_RESOURCE_TAGS, resourceURI);
}

UIUtils.addTag = function(inputText_) {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.addTag(inputText_.value);
	inputText_.value = '';
	inputText_.focus();
}

UIUtils.setResourcesWidth = function() {
	var tab = document.getElementById('tab_info_resource');
	var head = document.getElementById('head');
	var resources = document.getElementById('resources');
	var center = document.getElementById('center');
	UIUtils.search = false;
	center.style.width = head.offsetWidth + 'px';
	resources.style.width = (center.offsetWidth - (tab.offsetWidth + (UIUtils.isInfoResourcesOpen?UIUtils.infoResourcesWidth:0))) + 'px';
}

UIUtils.openInfoResource = function() {
	if (!UIUtils.isInfoResourcesOpen)
	{
		UIUtils.isInfoResourcesOpen = true;
		UIUtils.SlideInfoResourceIntoView('info_resource');
	}
}

UIUtils.closeInfoResource = function() {
	if (UIUtils.isInfoResourcesOpen)
	{
		UIUtils.isInfoResourcesOpen = false;
		UIUtils.SlideInfoResourceOutOfView('info_resource');
	}
}

UIUtils.SlideInfoResourceIntoView = function(element) {
  $(element).style.width = '0px';
  $(element).style.overflow = 'hidden';
  $(element).firstChild.style.position = 'relative';
  UIUtils.setResourcesWidth();
  Element.show(element);
  new Effect.Scale(element, 100,
    Object.extend(arguments[1] || {}, {
      scaleContent: false,
      scaleY: false,
      scaleMode: 'contents',
      scaleFrom: 0,
      afterUpdate: function(effect){},
	  afterFinish: function(effect)
        { UIUtils.hidde('tab_info_resource_open'); UIUtils.show('tab_info_resource_close'); }
    })
  );
}

UIUtils.SlideInfoResourceOutOfView = function(element) {
  $(element).style.overflow = 'hidden';
  $(element).firstChild.style.position = 'relative';
  Element.show(element);
  new Effect.Scale(element, 0,
    Object.extend(arguments[1] || {}, {
      scaleContent: false,
      scaleY: false,
      afterUpdate: function(effect){},
      afterFinish: function(effect)
        { Element.hide(effect.element); UIUtils.setResourcesWidth(); UIUtils.hidde('tab_info_resource_close'); UIUtils.show('tab_info_resource_open'); }
    })
  );
}

UIUtils.SlideAdvancedSearchIntoView = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({ 
    scaleContent: false, 
    scaleX: false, 
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if(window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show(); 
    },
    afterUpdateInternal: function(effect) {
      	effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' }); 
    },
    afterFinishInternal: function(effect) {
      	effect.element.undoClipping().undoPositioned();
      	effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); 
	},
	afterFinish: function(effect) {
		UIUtils.hidde('simple_search');
	  	UIUtils.show('advanced_search_bottom');
	  	document.getElementById('advanced_search_text_tag').focus();
	}
    }, arguments[1] || {})
  );
}

UIUtils.SlideAdvancedSearchOutOfView = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false, 
    scaleX: false, 
    scaleMode: 'box',
    scaleFrom: 100,
    restoreAfterFinish: true,
    beforeStartInternal: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if(window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },  
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned().setStyle({bottom: oldInnerBottom});
      effect.element.down().undoPositioned();
    },
	afterFinish: function(effect) {
	  	UIUtils.hidde('advanced_search_bottom');
	  	UIUtils.show('simple_search');
	  	document.getElementById('simple_search_text').focus();
	}
   }, arguments[1] || {})
  );
}


// Enables you to react to return being pressed in an input
UIUtils.onReturn = function(event_, handler_, inputText_) {
  if (!event_) event_ = window.event;
  if (event_ && event_.keyCode && event_.keyCode == 13) handler_(inputText_);
};
