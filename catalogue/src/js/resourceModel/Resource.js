
//////////////////////////////////////////////
//                RESOURCE                  //
//////////////////////////////////////////////

function Resource( id_, resourceXML_, urlTemplate_) {
	
	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.getVendor = function() { return state.getVendor(); }
	this.getName = function() { return state.getName(); }
	this.getVersion = function() { return state.getVersion(); }
	this.getDescription = function() { return state.getDescription(); }
	this.getUriImage = function() { return state.getUriImage(); }
	this.getUriTemplate = function() { return state.getUriTemplate(); }
	this.getUriWiki = function() { return state.getUriWiki(); }
	
	this.paint = function(){
		var newResource = document.createElement("div");
		newResource.innerHTML = "<div class='resource' id='" + id + "' onMouseOver='UIUtils.selectResource(\"" + id + "\");' onMouseOut='UIUtils.deselectResource(\"" + id + "\");'>" +
									"<div class='title'>" + state.getName() + "</div>" +
									"<div class='image'><a href='javascript:UIUtils.showResourceInfo(\"" + id + "\");'><img src='" + state.getUriImage() + "' alt='Click para m&aacute;s informaci&oacute;n'></img></a></div>" +
									"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(\"" + id + "\");'>A&ntilde;adir a la Paleta</button>";
								"</div>";
		var parentHTML = document.getElementById("resources");
		parentHTML.insertBefore(newResource, parentHTML.firstChild);
	}
	
	this.showInfo = function() {
		var tableInfo = document.getElementById("table_info_resource");
		tableInfo.innerHTML = "<fieldset>" +
									"<div class='title'><span class='name'>" + state.getName() + "</span>" +
									"<span class='version'>versi&oacute;n&nbsp;" + state.getVersion() + "</span></div>" +
									"<div class='vendor'>" + state.getVendor() + "</div>" +
									"<div class='description'>Descripci&oacute;n:<br/><textarea readonly='readonly'>" + state.getDescription() + "</textarea></div>" +
									"<div class='image'><img src='" + state.getUriImage() + "' alt='" + state.getName()+ "&nbsp;" + state.getVersion() + "'/></div>" +
									"<div class='link'><a href='" + state.getUriWiki() + "' target='_blank'>Acceder a la Wiki</a></div>" +
									"<div class='link'><a href='" + state.getUriTemplate() + "' target='_blank'>Acceder al Template</a></div>" +
								"</fieldset>" +
								"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(UIUtils.getSelectedResource());'>A&ntilde;adir a la Paleta</button>";
	}
	
	// *******************
	//  PRIVATE FUNCTIONS
	// *******************
	
	var _createResource = function(urlTemplate_) {
		
		// ******************
		//  CALLBACK METHODS 
		// ******************
	
		// Not like the remaining methods. This is a callback function to process AJAX requests, so must be public.
		
		onError = function(transport) {
			alert("Error Resource POST");
			// Process
		}
		
		loadResource = function(transport) {
			var response = transport.responseXML;
			state = new ResourceState(response);
			this.paint();
		}
		
		var persistenceEngine = PersistenceEngineFactory.getInstance();
		// Post Resource to PersistenceEngine. Asyncrhonous call!
		persistenceEngine.send_post(url_Server, url_, this, loadResource, onError);
	}
	
	// *******************
	//  PRIVATE VARIABLES
	// *******************

	var state = null;
	var id = id_;
	
	if (urlTemplate_ != null) {
		_createResource(urlTemplate_);
	}
	else {
		state = new ResourceState(resourceXML_);
		this.paint();
	}
}

//////////////////////////////////////////////
//       RESOURCESTATE (State Object)       //
//////////////////////////////////////////////

function ResourceState(resourceXML_) {

	// *******************
	//  PRIVATE VARIABLES
	// *******************
	
	var vendor = null;
	var name = null;
	var version = null;
	var description = null;
	var uriImage = null;
	var uriWiki = null;
	var uriTemplate = null;
	
	// Parsing XML Resource
	// Constructing the structure
	
	vendor = resourceXML_.getElementsByTagName("vendor")[0].firstChild.nodeValue;
	name = resourceXML_.getElementsByTagName("name")[0].firstChild.nodeValue;
	version = resourceXML_.getElementsByTagName("version")[0].firstChild.nodeValue;
	description = resourceXML_.getElementsByTagName("description")[0].firstChild.nodeValue;
	uriImage = resourceXML_.getElementsByTagName("uriImage")[0].firstChild.nodeValue;
	uriWiki = resourceXML_.getElementsByTagName("uriWiki")[0].firstChild.nodeValue;
	uriTemplate = resourceXML_.getElementsByTagName("uriTemplate")[0].firstChild.nodeValue;

	// ******************
	//  PUBLIC FUNCTIONS
	// ******************
	
	this.getVendor = function() { return vendor; }
	this.getName = function() { return name; }
	this.getVersion = function() { return version; }
	this.getDescription = function() { return description; }
	this.getUriImage = function() { return uriImage; }
	this.getUriTemplate = function() { return uriTemplate; }
	this.getUriWiki = function() { return uriWiki; }
}