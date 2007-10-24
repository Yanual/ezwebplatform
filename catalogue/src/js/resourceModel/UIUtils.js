
function UIUtils()
{
	// *********************************
	//           STATIC CLASS
	// *********************************
}

UIUtils.selectedResource = null;
UIUtils.auxColor = 'none';

UIUtils.getSelectedResource = function() {
	return selectedResource;
}
	
UIUtils.selectResource = function(resourceId_) {
	var resource = document.getElementById(resourceId_);
	auxColor = resource.style.backgroundColor;
	resource.style.backgroundColor = "#aabbff";
}
	
UIUtils.deselectResource = function(resourceId_) {
	var resource = document.getElementById(resourceId_);
	resource.style.backgroundColor = auxColor;
}
	
UIUtils.showResourceInfo = function(resourceId_) {
	selectedResource = resourceId_;
	CatalogueFactory.getInstance().getResources()[resourceId_].showInfo();
}
	
UIUtils.toggle = function(elementId_) {
	var element = document.getElementById(elementId_);
	if (element.style.display != 'none')
	{
		element.style.display = 'none';
	}
	else
	{
		element.style.display = 'inherit';
	}
}

UIUtils.evaluarFormulario = function(form_)
{
	alert(form_.search_text.value);
}