
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

UIUtils.evaluarFormulario = function(form_) {
	alert(form_.search_text.value);
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
	var tagger = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource).getTagger();
	tagger.sendTags();
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
	UIUtils.isInfoResourcesOpen = true;
	UIUtils.setResourcesWidth();
	UIUtils.show('info_resource');
	UIUtils.hidde('tab_info_resource_open');
	UIUtils.show('tab_info_resource_close');
}

UIUtils.closeInfoResource = function() {
	UIUtils.isInfoResourcesOpen = false;
	UIUtils.hidde('info_resource');
	UIUtils.setResourcesWidth();
	UIUtils.hidde('tab_info_resource_close');
	UIUtils.show('tab_info_resource_open');
}

// Enables you to react to return being pressed in an input
UIUtils.onReturn = function(event_, handler_, inputText_) {
  if (!event_) event_ = window.event;
  if (event_ && event_.keyCode && event_.keyCode == 13) handler_(inputText_);
};