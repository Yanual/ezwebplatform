
function UIUtils()
{
	// *********************************
	//           STATIC CLASS
	// *********************************
}

UIUtils.selectedResource = null;
UIUtils.imageBottom = '';
UIUtils.imageContent = '';

UIUtils.getSelectedResource = function() {
	return selectedResource;
}
	
UIUtils.selectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	imageBottom = bottom.style.backgroundImage;
	bottom.style.backgroundImage = 'url(images/resource-left-bottom-select.png)';
	var content = document.getElementById(resourceId_ + '_content');
	imageContent = content.style.backgroundImage;
	content.style.backgroundImage = 'url(images/resource-left-fill-select.png)';
}
	
UIUtils.deselectResource = function(resourceId_) {
	var bottom = document.getElementById(resourceId_ + '_bottom');
	bottom.style.backgroundImage = imageBottom;
	var content = document.getElementById(resourceId_ + '_content');
	content.style.backgroundImage = imageContent;
}
	
UIUtils.showResourceInfo = function(resourceId_) {
	selectedResource = resourceId_;
	CatalogueFactory.getInstance().getResource(selectedResource).showInfo();
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
	var tagger = CatalogueFactory.getInstance().getResource(selectedResource).getTagger();
	tagger.removeTag(id_);
}

UIUtils.removeAllTags = function() {
	var tagger = CatalogueFactory.getInstance().getResource(selectedResource).getTagger();
	tagger.removeAll();
}

UIUtils.sendTags = function() {
	var tagger = CatalogueFactory.getInstance().getResource(selectedResource).getTagger();
	tagger.sendTags();
}

UIUtils.addTag = function(inputText_) {
	var tagger = CatalogueFactory.getInstance().getResource(selectedResource).getTagger();
	tagger.addTag(inputText_.value);
	inputText_.value = '';
	inputText_.focus();
}

// Enables you to react to return being pressed in an input
UIUtils.onReturn = function(event_, handler_, inputText_) {
  if (!event_) event_ = window.event;
  if (event_ && event_.keyCode && event_.keyCode == 13) handler_(inputText_);
};