	var selectedResource = null;
	var auxColor = 'none';
	
	selectResource = function(resourceId_) {
		var resource = document.getElementById(resourceId_);
		auxColor = resource.style.backgroundColor;
		resource.style.backgroundColor = "#aabbff";
	}
	
	deselectResource = function(resourceId_) {
		var resource = document.getElementById(resourceId_);
		resource.style.backgroundColor = auxColor;
	}
	
	showResourceInfo = function(resourceId_) {
		selectedResource = resourceId_;
		var resources = CatalogueFactory.getInstance().getResources();
		var resource = resources[resourceId_];
		var tableInfo = document.getElementById("table_info_resource");
		tableInfo.innerHTML = "<table>" +
									"<tr><td>Nombre:</td><td>" + resource.getName() + "</td></tr>" +
									"<tr><td>Versi&oacute;n:</td><td>" + resource.getVersion() + "</td></tr>" +
									"<tr><td>Vendedor:</td><td>" + resource.getVendor() + "</td></tr>" +
									"<tr><td>Descripci&oacute;n:</td><td>" + resource.getDescription() + "</td></tr>" +
									"<tr><td><center><img src='" + resource.getUriImage() + "' alt=''/></center></td></tr>" +
									"<tr><td><a href='" + resource.getUriWiki() + "'>Acceder a la Wiki</a></td></tr>" +
									"<tr><td><a href='" + resource.getUriTemplate() + "'>Ver el Template</a></td></tr>" +
								"</table>";

	}