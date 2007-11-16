
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

UIUtils.addResource = function(url, paramName, paramValue) {
	var newResourceOnSuccess = function (response) {
		OpManagerFactory.getInstance().repaintCatalogue();
	}
	
	var newResourceOnError = function (response) {
		alert (response.responseText);
	}
	
	var persistenceEngine = PersistenceEngineFactory.getInstance();	

	var params = paramName + "=" + paramValue;

	persistenceEngine.send_post(url, params, this, newResourceOnSuccess, newResourceOnError);
}

UIUtils.getSelectedResource = function() {
	return UIUtils.selectedResource;
}
	
UIUtils.selectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	UIUtils.imageBottom = bottom.style.backgroundImage;
	bottom.style.backgroundImage = 'url(images/resource-left-bottom-select.png)';
	var content = document.getElementById(resourceId_ + '_content');
	UIUtils.imageContent = content.style.backgroundImage;
	content.style.backgroundImage = 'url(images/resource-left-fill-select.png)';
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

	opManager.repaintCatalogue(url + tag + "/");
}

UIUtils.removeTag = function(id_) {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeTag(id_);
}

UIUtils.removeAllTags = function() {
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.removeAll();
}

UIUtils.sendTags = function() {
	var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);
	var tagger = resource.getTagger();
	var resourceURI = resource.getVendor() + "/" + resource.getName() + "/" + resource.getVersion() + "/";

	tagger.sendTags("http://europa.ls.fi.upm.es:8000/user/admin/catalogue/tags/", resourceURI);
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
	  	document.getElementById('advanced_search_text').focus();
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