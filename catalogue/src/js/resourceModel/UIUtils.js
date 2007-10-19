
	seleccionarResource = function(resourceId_) {
		var resource = document.getElementById(resourceId_);
		resource.style.background = "lightgray";
	}
	
	deseleccionarResource = function(resourceId_) {
		var resource = document.getElementById(resourceId_);
		resource.style.background = "#ccddff";
	}
	
	mostrarInfoResource = function(resourceId_) {
		var resources = CatalogueFactory.getInstance().getResources();
		var resource = resources[resourceId_];
		var vendor = document.getElementById("vendor");
		vendor.innerHTML = resource.getVendor();
	}