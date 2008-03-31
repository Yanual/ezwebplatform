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

UIUtils.tagmode = false;
UIUtils.selectedResource = null;
UIUtils.balloonResource = null;
UIUtils.imageBottom = '';
UIUtils.imageContent = '';
UIUtils.imageConnectableBottom = '';
UIUtils.imageConnectableContent = '';
UIUtils.infoResourcesWidth = 400;
UIUtils.isInfoResourcesOpen = false;
UIUtils.page = 1;
UIUtils.off = 4;
UIUtils.orderby = '-creation_date';
UIUtils.num_items = 0;
UIUtils.search = 'false';
UIUtils.searchValue = '';
UIUtils.searchCriteria = '';
UIUtils.counter=0;
UIUtils.globalTags='all';

UIUtils.addResource = function(url, paramName, paramValue) {
	var newResourceOnSuccess = function (response) {
		UIUtils.orderby = '-creation_date';
		UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, UIUtils.getOffset(), Math.ceil(UIUtils.getNum_items()/UIUtils.getOffset()), UIUtils.getNum_items());
	}
	
	var newResourceOnError = function (transport, e) {
		var msg;
		if (e) {
			msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
			                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
					  true);
		} else if (transport.responseXML) {
                        msg = transport.responseXML.documentElement.textContent;
		} else {
                        msg = "HTTP Error " + transport.status + " - " + transport.statusText;
		}

		msg = interpolate(gettext("The resource could not be added to the catalogue: %(errorMsg)s."), {errorMsg: msg}, true);
		OpManagerFactory.getInstance().log(msg);
		alert (gettext("The resource could not be added to the catalogue, please check the logs for further info."));
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
	var content = document.getElementById(resourceId_ + '_content');
	if (!UIUtils.tagmode)
	{
	    UIUtils.imageBottom = bottom.style.backgroundImage;
	    UIUtils.imageContent = content.style.backgroundImage;
	}
	bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom-select.png)';
	content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill-select.png)';
    
}

UIUtils.deselectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	var content = document.getElementById(resourceId_ + '_content');
	if (!UIUtils.tagmode)
	{
	    bottom.style.backgroundImage = UIUtils.imageBottom;
	    content.style.backgroundImage = UIUtils.imageContent;
	} else {
	    bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom.gif)';
	    content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill.gif)';
	}
}

UIUtils.selectConnectableResources = function(resourceId_) {
	UIUtils.deselectConnectableResources();
	UIUtils.selectResource(resourceId_);
	UIUtils.lightUpConnectableResources(UIUtils.selectedResource);
}

/* This method selects all the resources related by wiring in the catalogue*/
UIUtils.lightUpConnectableResources = function(resourceId_) {

	var resource = CatalogueFactory.getInstance().getResource(resourceId_);
	var slots = resource.getSlots();
	var events = resource.getEvents();
	var resources = CatalogueFactory.getInstance().getResources().getValues();
	var slots2;
	var events2;
	for (var i=0; i<resources.length; i++){
		slots2 = resources[i].getSlots();
		var lookup = {};
		for (var j=0; j<slots2.length; j++) {
			lookup[slots2[j]] = slots2[j];
		}
		for (var k =0; k<events.length; k++) {
			if (typeof lookup[events[k]] != 'undefined') {
				var bottom = document.getElementById('resource_'+i + '_bottom');
				UIUtils.imageConnectableBottom = bottom.style.backgroundImage;
				bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom-select-slot.png)';
				var content = document.getElementById('resource_'+i + '_content');
				UIUtils.imageConnectableContent = content.style.backgroundImage;
				content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill-select-slot.png)';
				break;
			}
		}
		events2 = resources[i].getEvents();
		var lookup = {};
		for (var j=0; j<events2.length; j++) {
			lookup[events2[j]] = events2[j];
		}
		for (var k =0; k<slots.length; k++) {
			if (typeof lookup[slots[k]] != 'undefined') {
				var bottom = document.getElementById('resource_'+i + '_bottom');
				UIUtils.imageConnectableBottom = bottom.style.backgroundImage;
				bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom-select-event.png)';
				var content = document.getElementById('resource_'+i + '_content');
				UIUtils.imageConnectableContent = content.style.backgroundImage;
				content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill-select-event.png)';
				break;
			}
		}
	}
}

UIUtils.deselectConnectableResources = function() {
	var resources = CatalogueFactory.getInstance().getResources().getValues();
	for (var i=0; i<resources.length; i++){
		var bottom = document.getElementById('resource_'+i + '_bottom');
		bottom.style.backgroundImage = UIUtils.imageConnectableBottom;
		var content = document.getElementById('resource_'+i + '_content');
		content.style.backgroundImage = UIUtils.imageConnectableContent;
	}
}
	
UIUtils.showResourceInfo = function(resourceId_) {
	UIUtils.selectedResource = resourceId_;
	CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).showInfo();
}

UIUtils.updateGadgetXHTML = function() {
    var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);

    var dict = {vendor: resource.getVendor(), name: resource.getName(), version: resource.getVersion()};

    var resourceURI = URIs.GET_GADGET.evaluate(dict) + "/xhtml";

    var onError = function(transport) {
	alert(gettext ("Error PUT"));
	// Process
    }
			
    var onSuccess = function(transport) {
	
    }
    
    PersistenceEngineFactory.getInstance().send_update(resourceURI, "", this, onSuccess, onError);

}

UIUtils.toggle_elements = function(elementIds_) {
	for (i=0;i<elementIds_.length ;i++ )
	{
		UIUtils.toggle(elementIds_[i]);
	}
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

	if (UIUtils.balloonResource)
	{
		CatalogueFactory.getInstance().getResource(UIUtils.balloonResource).closeTagcloudBalloon();
	}

  if (tag == ""){
  	alert(gettext ("Indicate a criteria in search formulary"));
  }
  else{
	  UIUtils.setPage(1);
      UIUtils.search = 'tag';
      UIUtils.searchValue = tag;
      UIUtils.searchCriteria = 'tag' ;
	  opManager.repaintCatalogue(url + "/" + tag  + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
}
}

UIUtils.searchByWiring = function(url, value, wiring) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();
	
	if (value == ""){
		alert(gettext ("Indicate a criteria in search formulary"));
	}else{
		if (UIUtils.balloonResource)
		{
			CatalogueFactory.getInstance().getResource(UIUtils.balloonResource).closeTagcloudBalloon();
		}
		UIUtils.setPage(1);
		UIUtils.search = 'wiring';
		UIUtils.searchValue = value;
		UIUtils.searchCriteria = wiring ;
		opManager.repaintCatalogue(url + "/" + wiring + "/" + value  + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
	}
}

UIUtils.cataloguePaginate = function(url, offset, pag, items) {
	this.closeInfoResource();
	UIUtils.off=offset;
	UIUtils.num_items=items;
	var opManager = OpManagerFactory.getInstance();
	var pages = Math.ceil(UIUtils.getNum_items()/UIUtils.getOffset());

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
	if (pag == "first"){
		pag = 1;
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
    if (pag == "last"){
          pag = pages;
    }
	UIUtils.page = pag; 
  
	opManager.repaintCatalogue(url + "/" + pag + "/" + UIUtils.getOffset());
}

UIUtils.setOrderby = function(orderby) {
    UIUtils.orderby = orderby.value;
}

UIUtils.getPage = function() {
    return UIUtils.page;
}

UIUtils.setPage = function(page) {
    UIUtils.page = page;
}

UIUtils.getOffset = function() {
    return UIUtils.off;
}

UIUtils.setOffset = function(offset) {
    UIUtils.off = offset;
}

UIUtils.getNum_items = function() {
    return UIUtils.num_items;
}

UIUtils.searchGeneric = function(url, param, criteria) {
	this.closeInfoResource();
	var opManager = OpManagerFactory.getInstance();
	
	if (param == ""){
		$('header_always_error').innerHTML = "<img src='/ezweb/images/ico_error_mini.gif'></img>" + gettext ("Indicate a criteria in search formulary");
		$('header_always_error').style.display = 'block';
	}
	else{
		$('header_always_error').style.display = 'none';
		if (UIUtils.balloonResource)
		{
			CatalogueFactory.getInstance().getResource(UIUtils.balloonResource).closeTagcloudBalloon();
		}
		UIUtils.setPage(1);
		UIUtils.searchValue = param;
		UIUtils.searchCriteria = criteria ;
		UIUtils.search = 'generic';
		opManager.repaintCatalogue(url + "/" + param + "/" + criteria + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
	}
}

UIUtils.removeTag = function(id_) {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeTag(id_);
}

UIUtils.removeGlobalTag = function(id_) {
	var tagger;
	selectedResources = CatalogueFactory.getInstance().getSelectedResources();
	for(var i=0; i<selectedResources.length;i++){
		tagger = CatalogueFactory.getInstance().getResource(selectedResources[i]).getTagger();
		tagger.removeTag(id_);
	}
	var parentHTML = document.getElementById("my_global_tags");
	var tagHTML = document.getElementById(id_);
	parentHTML.removeChild(tagHTML);
}

UIUtils.removeAllTags = function() {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeAll();
	document.getElementById("tag_alert").style.display='none';
	document.getElementById("new_tag_text_input").value="";
	document.getElementById("new_tag_text_input").size=5;
	document.getElementById("new_tag_text_input").focus();
}

UIUtils.removeAllGlobalTags = function() {
	if(UIUtils.tagmode){
		selectedResources=CatalogueFactory.getInstance().getSelectedResources();
		for(var i=0; i<selectedResources.length;i++){
			tagger = CatalogueFactory.getInstance().getResource(selectedResources[i]).getTagger();
			tagger.removeAll();
		}
	}
	var parentHTML = $("my_global_tags");
	while(parentHTML.childNodes.length > 1)
	{
		parentHTML.removeChild(parentHTML.childNodes[0]);
	}
	document.getElementById("global_tag_alert").style.display='none';
	
}

UIUtils.removeTagUser = function(tag,id) {	
	
	var resource = CatalogueFactory.getInstance().getResource(id);

    var tagger = resource.getTagger();
    var resourceURI = "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion() + "/" + tag;
	tagger.removeTagUser(URIs.DELETE_TAG, resourceURI,id);		
}

UIUtils.sendTags = function() {
	var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);
	var tagger = resource.getTagger();
	var resourceURI = "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion();

	if (tagger.getTags().size() == 0 || document.getElementById('new_tag_text_input').value.length!= 0)
	{
		UIUtils.addTag(document.getElementById('new_tag_text_input'));
	}
	
	tagger.sendTags(URIs.POST_RESOURCE_TAGS, resourceURI, resource);
}

UIUtils.sendGlobalTags = function() {
	//TBD
	/*
	var resource;
	var tagger;
	var resourceURI;
	for(var i=0; i<CatalogueFactory.getInstance().selectedResources.length;i++){
		resource = CatalogueFactory.getInstance().getResource(CatalogueFactory.getInstance().selectedResource[i]);
		tagger = resource.getTagger();
		resourceURI = "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion();
		
		if (tagger.getTags().size() == 0 || document.getElementById('new_global_tag_text_input').value.length!= 0)
		{
			//TODO control de errores
			UIUtils.addGlobalTag(document.getElementById('new_global_tag_text_input'));
		}
		//TODO Aviso de si todo ha ido bien o no
		
		tagger.sendGlobalTags(URIs.POST_RESOURCE_TAGS, resourceURI, resource);
	}
 	*/
}

UIUtils.deleteGadget = function(id) {
	var resource = CatalogueFactory.getInstance().getResource(id);
	var resourceURI = URIs.GET_POST_RESOURCES + "/" + resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion();
	
	var onError = function(transport) {
				alert(gettext ("Error DELETE"));
				// Process
			}
			
	var loadTags = function(transport) {
				opManager.repaintCatalogue(URIs.GET_POST_RESOURCES + "/" + UIUtils.getPage() + "/" + UIUtils.getOffset());
			}
	PersistenceEngineFactory.getInstance().send_delete(resourceURI, this, loadTags, onError);
}

UIUtils.addTag = function(inputText_) {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.addTag(inputText_.value);
	inputText_.value = '';
	inputText_.focus();
	inputText_.size = 5;
}

UIUtils.addGlobalTag = function(inputText_) {
	if(inputText_.value.length<3)	{
		document.getElementById("global_tag_alert").style.display='inline';
		document.getElementById("global_tag_alert").innerHTML = gettext ("Tags must have at least three characters.");
	}else{
		var id = 'new_global_tag_' + UIUtils.counter;
		UIUtils.counter++;
		var tagger;
		selectedResources=CatalogueFactory.getInstance().getSelectedResources();
		for(var i=0; i<selectedResources.length;i++){
			tagger = CatalogueFactory.getInstance().getResource(selectedResources[i]).getTagger();
			tagger.addGlobalTag(inputText_.value);
		}
		UIUtils.paintGlobalTag(id,inputText_.value);
		document.getElementById("global_tag_alert").style.display='none';
		
		inputText_.value = '';
		inputText_.focus();
		inputText_.size = 5;
	}
}

UIUtils.paintGlobalTag = function(id_, tag_) {
	var newTag = document.createElement("div");
	newTag.setAttribute('id', id_);
	newTag.innerHTML = 	"<div class='new_global_tag' onmouseover=\"UIUtils.hidde('button_disable_" + id_ + "');UIUtils.show('button_enable_" + id_ + "');\" onmouseout=\"UIUtils.hidde('button_enable_" + id_ + "');UIUtils.show('button_disable_" + id_ + "');\">" + 
							tag_ + 
							"<div id='button_disable_" + id_ + "'>" +
								"<a>" +
									"<img src='/ezweb/images/cancel_gray.png' alt=''></img>" +
								"</a>" +
							"</div>" +
							"<div id='button_enable_" + id_ + "' style='display:none;'>" +
								"<a href='javascript:UIUtils.removeGlobalTag(\"" + id_ + "\");'>" +
									"<img src='/ezweb/images/delete.png' alt=''></img>" +
								"</a>" +
							"</div>," + 
						"</div> ";
	var parentHTML = document.getElementById("my_global_tags");
	parentHTML.insertBefore(newTag,parentHTML.lastChild);
}

UIUtils.setResourcesWidth = function() {
	var tab = document.getElementById('tab_info_resource');
	var head = document.getElementById('head');
	var resources = document.getElementById('resources');
	var center = document.getElementById('center');
	//UIUtils.search = false;
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
		UIUtils.deselectConnectableResources();
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
        {UIUtils.show('tab_info_resource_close'); }
    })
  );
	if (UIUtils.selectedResource != null) {
		 UIUtils.lightUpConnectableResources(UIUtils.selectedResource);
	}
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
        { Element.hide(effect.element); UIUtils.setResourcesWidth(); UIUtils.hidde('tab_info_resource_close'); }
    })
  );
}

UIUtils.restoreSlide = function() {
	var div = $("head");
    var nodeList = div.childNodes;
    var aux = '';
    var tab = '';
    for(i=0;i<nodeList.length;i++){
    	if(nodeList.item(i).nodeName=="DIV" && nodeList.item(i).id!='header_always'){
	        if(Element.visible(nodeList.item(i))==true){
	        	nodeList.item(i).style.display = "none";
	           	//Effect.BlindUp(nodeList.item(i),{queue:{position:'end',scope:'menuScope',limit:2},});
	            aux = nodeList.item(i).id.split("_");
	            switch (aux[1].toLowerCase()) {
	            	case "tag":
	            		tab = gettext("Advanced Tagging");
	            		break;
	            	case "search":
	            		tab = gettext("Advanced Search");
	            		break;
	            	default:
	            		break;
	            }
	            $(nodeList.item(i).id+"_toggle").innerHTML = tab;
	            $(nodeList.item(i).id+"_toggle").style.background="lightBlue";
	            if(nodeList.item(i).id=="advanced_tag"){UIUtils.deactivateTagMode();}
	        }
	    }
    }
}

UIUtils.SlideAdvanced = function(element,container) {
    var div = $(container);
    var nodeList = div.childNodes;
    var queue = Effect.Queues.get('menuScope');
    var aux = '';
    var tab = '';
    
    if(queue.toArray().length<1){
        if(Element.visible(element)==false){
            for(i=0;i<nodeList.length;i++){
                if(nodeList.item(i).nodeName=="DIV" && nodeList.item(i).id!=element && nodeList.item(i).id!='header_always'){
                    if(Element.visible(nodeList.item(i))==true){
                        Effect.BlindUp(nodeList.item(i),{queue:{position:'end',scope:'menuScope',limit:2},});
                        aux = nodeList.item(i).id.split("_");
                        switch (aux[1].toLowerCase()) {
			            	case "tag":
			            		tab = gettext("Advanced Tagging");
			            		break;
			            	case "search":
			            		tab = gettext("Advanced Search");
			            		break;
			            	default:
			            		break;
			            }
                        $(nodeList.item(i).id+"_toggle").innerHTML = tab;
                        $(nodeList.item(i).id+"_toggle").style.background="transparent";
                        if(nodeList.item(i).id=="advanced_tag"){UIUtils.deactivateTagMode();}
                    }
                }
            }
            Effect.BlindDown(element,{queue:{position:'end',scope:'menuScope',limit:2}});
            aux = element.split("_");
            switch (aux[1].toLowerCase()) {
            	case "tag":
            		tab = gettext("Hide Tagging");
            		break;
            	case "search":
            		tab = gettext("Simple Search");
            		break;
            	default:
            		break;
            }
            $(element+"_toggle").innerHTML = tab;
			$(element+"_toggle").style.background="lightBlue";
			if(element=="advanced_tag"){UIUtils.activateTagMode();}
       }
       else {
       		Effect.BlindUp(element,{queue:{position:'end',scope:'menuScope',limit:2}});
            aux = element.split("_");
            switch (aux[1].toLowerCase()) {
            	case "tag":
            		tab = gettext("Advanced Tagging");
            		break;
            	case "search":
            		tab = gettext("Advanced Search");
            		break;
            	default:
            		break;
            }
            $(element+"_toggle").innerHTML = tab;
            $(element+"_toggle").style.background="transparent"; 
            if(element=="advanced_tag"){UIUtils.deactivateTagMode();}      
       }
   }
}

UIUtils.SlideAdvanced2 = function(element) {
	switch (element) {
		case "advanced_tag":
			element1=$(element).cleanWhitespace();
			element2=$("advanced_search").cleanWhitespace();
			event="Tag";
			break;
		case "advanced_search":
			element1=$(element).cleanWhitespace();
			element2=$("advanced_tag").cleanWhitespace();
			event="Search";
			break;
		default:
			alert ("error de SlideAdvanced");
			break;
	}
	if (element1.style.display == 'none') {
		new Effect.BlindDown(element1,
			{
				duration:1,
				beforeStart: function() {
					if(element2.style.display != 'none')
					{
						new Effect.BlindUp(element2,
						{
							duration:1,
							beforeStart: function() {
								element1.style.zIndex=2;
								element2.style.zIndex=1;
							},
							afterFinish: function() {
								element2.style.display = 'none';
								$(element2.id+"_toggle").innerHTML = gettext("Advanced "+event);
								$(element2.id+"_toggle").style.background="lightBlue";
							}
						});
					}
					element1.style.zIndex=2;
					element2.style.zIndex=1;
					element1.style.display='true';
				},
				afterFinish: function() {
					$(element1.id+"_toggle").innerHTML = gettext("Simple "+event);
					$(element1.id+"_toggle").style.background="darkBlue";
				}
			});
	} else {
		new Effect.BlindUp(element1,
			{
				duration:1,
				afterFinish: function() {
					element1.style.display='none';
					$(element1.id+"_toggle").innerHTML = gettext("Advanced "+event);
					$(element1.id+"_toggle").style.background="lightBlue";
				}
			});
	}
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

UIUtils.activateTagMode = function() {
	UIUtils.tagmode = true;
	UIUtils.removeAllGlobalTags();
	UIUtils.closeInfoResource();
	$("global_tagcloud").innerHTML = '';
	$("my_global_tags").childNodes[0].style.display="none";
	//document.getElementById("tab_info_resource").style.display='none';
}

UIUtils.deactivateTagMode = function() {
	UIUtils.tagmode = false;
	selectedResources=CatalogueFactory.getInstance().getSelectedResources();
	for(var i=0; i<selectedResources.length;i++){
		UIUtils.deselectResource(selectedResources[i]);
	}
	CatalogueFactory.getInstance().clearSelectedResources();
	//document.getElementById("tab_info_resource").style.display='true';
}

UIUtils.clickOnResource = function(id_) {
	if(UIUtils.tagmode){
		UIUtils.toggleSelectedResource(id_);
	}else{
		UIUtils.showResourceInfo(id_);
		UIUtils.openInfoResource();
		UIUtils.selectConnectableResources(id_);
	}
}

UIUtils.toggleSelectedResource = function(id_) {
	UIUtils.removeAllGlobalTags();
	if(CatalogueFactory.getInstance().isSelectedResource(id_)){
		var bottom = document.getElementById(id_ + '_bottom');
	    var content = document.getElementById(id_ + '_content');
	    bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom.gif)';
	    content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill.gif)';
		CatalogueFactory.getInstance().removeSelectedResource(id_);
	} else{
		var bottom = document.getElementById(id_ + '_bottom');
	    var content = document.getElementById(id_ + '_content');
	    bottom.style.backgroundImage = 'url(/ezweb/images/resource-left-bottom-tagmode.png)';
	    content.style.backgroundImage = 'url(/ezweb/images/resource-left-fill-tagmode.png)';
		CatalogueFactory.getInstance().addSelectedResource(id_);
	}
	CatalogueFactory.getInstance().updateGlobalTags();
	
	if (CatalogueFactory.getInstance().getSelectedResources().length == 0){
		$("my_global_tags").childNodes[0].style.display="none";
	}else{
		$("my_global_tags").childNodes[0].style.display="inline";
	}
}

UIUtils.mouseOverResource = function(id_) {
	if(!((UIUtils.tagmode)&&(CatalogueFactory.getInstance().isSelectedResource(id_)))){
			UIUtils.selectResource(id_);
	}
	UIUtils.show(id_ + "_toolbar");
}

UIUtils.mouseOutResource = function(id_) {
	if(!((UIUtils.tagmode)&&(CatalogueFactory.getInstance().isSelectedResource(id_)))){
			UIUtils.deselectResource(id_);
	}
	UIUtils.hidde(id_ + "_toolbar");
}

//enlarge an input depending on the size of the text
UIUtils.enlargeInput = function(inputText_) {
	if (inputText_.value.length>5) inputText_.size = inputText_.value.length+1;
}

// Enables you to react to return being pressed in an input
UIUtils.onReturn = function(event_, handler_, inputText_) {
  if (!event_) event_ = window.event;
  if (event_ && event_.keyCode && event_.keyCode == 13) {
	  handler_(inputText_);
  }
};

