
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
	this.getTags = function() { return state.getTags(); }
	this.setTags = function(tags_) { state.setTags(tags_); }
	this.getTagger = function() { return tagger; }
	
	this.paint = function(){
		var tagsHTML = '';
		var tagsAux = state.getTags();
		for (var i=0; i<((tagsAux.length>3)?3:tagsAux.length); i++)
		{
			tagsHTML += ("<a title='Buscar "+ tagsAux[i].getValue() +"' href='#'>" + tagsAux[i].getValue() + "</a>" + ((i<(((tagsAux.length>3)?3:tagsAux.length)-1))?",&nbsp;":""));
		}	
		var tagcloudHTML = '';
		var classAux = '';
		for (var i=0; i<tagsAux.length; i++)
		{
			if (tagsAux[i].getAppearances()<5)		 classAux = 'tag_type_1';
			else if (tagsAux[i].getAppearances()<15) classAux = 'tag_type_2';
			else if (tagsAux[i].getAppearances()<25) classAux = 'tag_type_3';
			else									 classAux = 'tag_type_4';
			
			tagcloudHTML += ("<a class='" + classAux + "' title='Buscar "+ tagsAux[i].getValue() +"' href='#'>" + tagsAux[i].getValue() + "</a>" + ((i<(tagsAux.length-1))?",&nbsp;":""));
		}
		alert(tagcloudHTML);
		var newResource = document.createElement("div");
		newResource.setAttribute('id', id);
		newResource.innerHTML = "<div class='resource' onMouseOver='UIUtils.selectResource(\"" + id + "\");UIUtils.show(\"" + id + "_toolbar\");' onMouseOut='UIUtils.deselectResource(\"" + id + "\");UIUtils.hidde(\"" + id + "_toolbar\");'>" +
									"<div class='top'></div>" +
									"<div class='toolbar'>" +
										"<div id='" + id + "_toolbar' style='display:none;'>" +
											"<div id='" + id + "_description' class='description'> </div>" +
											"<script>" +
												"var " + id + "_description_hb = new HelpBalloon({" +
													"returnElement: true," +
													"icon: '../js/lib/HelpBalloons/images/icon_info.gif'," +	//url to the icon to use
													"altText: 'Descripci&oacute;n'," +							//Alt text of the help icon
													"title: 'Descripci�n:'," +							//Title of the balloon topic
													"content: '" + state.getDescription() + "'," +				//Static content of the help balloon
													"imagePath: '../js/lib/HelpBalloons/images/'" +
												"});" +
												"$('" + id + "_description').appendChild(" + id + "_description_hb._elements.icon);" +
											"</script>" +
											//"<a title='Ver Descripci&oacute;n' href='#' onmouseover=\"UIUtils.changeImage('" + id + "_description', 'images/description.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_description', 'images/description_gray.png');\">" +
											//	"<img id='" + id + "_description' src='images/description_gray.png'></img>" +
											//"</a>" +
											"<a title='Acceder a la Wiki' href='" + state.getUriWiki() + "' target='_blank'  onmouseover=\"UIUtils.changeImage('" + id + "_wiki', 'images/wiki.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_wiki', 'images/wiki_gray.png');\">" +
												"<img id='" + id + "_wiki' src='images/wiki_gray.png'></img>" +
											"</a>" +
											"<a title='Ver el Template' href='" + state.getUriTemplate() + "' target='_blank' onmouseover=\"UIUtils.changeImage('" + id + "_template', 'images/template.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_template', 'images/template_gray.png');\">" +
												"<img id='" + id + "_template' src='images/template_gray.png'></img>" +
											"</a>" +
										"</div>" +
									"</div>" +
									"<div id='" + id + "_content' class='content'>" +
										"<div class='title'>" + state.getName() + "</div>" +
										"<div class='image'><a title='Mostrar informaci&oacute;n del recurso' href='javascript:UIUtils.showResourceInfo(\"" + id + "\");UIUtils.openInfoResource();'><img src='" + state.getUriImage() + "'></img></a></div>" +
										"<div class='tags'>" +
											"<div class='important_tags'>" + 
												tagsHTML +
											"</div>" +
											"<div class='more_tags'>" +
												//"<a title='Ver el Tagcloud del recurso' href='#' onmouseover=\"UIUtils.changeImage('" + id + "_tag_cloud_img', 'images/more_tags.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_tag_cloud_img', 'images/more_tags_gray.png');\">" +
												//	"<img id='" + id + "_tag_cloud_img' src='images/more_tags_gray.png'></img>" +
												//"</a>" + 
												"<div id='" + id + "_tagcloud' class='tagcloud'> </div>" +
												"<script>" +
													"var " + id + "_tagcloud_hb = new HelpBalloon({" +
														"returnElement: true," +
														"icon: '../js/lib/HelpBalloons/images/icon_info.gif'," +	//url to the icon to use
														"altText: 'TagCloud'," +							//Alt text of the help icon
														"title: 'TagCloud:'," +									//Title of the balloon topic
														"content: \"" + tagcloudHTML + "\"," +							//Static content of the help balloon
														"imagePath: '../js/lib/HelpBalloons/images/'" +
													"});" +
													"$('" + id + "_tagcloud').appendChild(" + id + "_tagcloud_hb._elements.icon);" +
												"</script>" +
											"</div>" +
										"</div>" +
										"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(\"" + id + "\");'>A&ntilde;adir a la Paleta</button>" +
									"</div>" +
									"<div id='" + id + "_bottom' class = 'bottom'></div>" +
								"</div>";
		var parentHTML = document.getElementById("resources");
		parentHTML.insertBefore(newResource, parentHTML.firstChild);
	}
	
	this.showInfo = function() {
		var tableInfo = document.getElementById("info_resource_content");
		var tagsHTML = '';
		var tagsAux = state.getTags();
		var classAux = '';
		for (var i=0; i<tagsAux.length; i++)
		{
			if (tagsAux[i].getAppearances()<5)		 classAux = 'tag_type_1';
			else if (tagsAux[i].getAppearances()<15) classAux = 'tag_type_2';
			else if (tagsAux[i].getAppearances()<25) classAux = 'tag_type_3';
			else									 classAux = 'tag_type_4';
			
			tagsHTML += ("<a class='" + classAux + "' title='Buscar "+ tagsAux[i].getValue() +"' href='#'>" + tagsAux[i].getValue() + "</a>" + ((i<(tagsAux.length-1))?",&nbsp;":""));
		}
		tableInfo.innerHTML = 	"<div class='title_fieldset'>Informaci&oacute;n del Recurso</div>" +
								"<div class='fieldset'>" +
									"<div class='title'><span class='name'>" + state.getName() + "</span>" +
									"<span class='version'>" + state.getVersion() + "</span></div>" +
									"<div class='vendor'>" + state.getVendor() + "</div>" +
									"<div class='image'><img src='" + state.getUriImage() + "' alt='" + state.getName()+ "&nbsp;" + state.getVersion() + "'/></div>" +
									"<div class='description'>Descripci&oacute;n:<br/><div class='text'>" + state.getDescription() + "</div></div>" +
									"<div class='tagcloud'>Tagcloud:<br/><div class='tags'>" + tagsHTML + "</div></div>" +
									"<div id='add_tags_panel' class='new_tags' style='display:none;'>" +
										"<div class='title'>Nuevas Etiquetas:</div>" +
										"<div id='my_tags' class='my_tags'>" +
											"<div id='new_tag_text' class='new_tag_text'><input id='new_tag_text_input' type='text' onkeypress=\"UIUtils.onReturn(event,UIUtils.addTag,this);\"/></div>" +
										"</div>" +
										"<div class='buttons'>" +
											"<button onclick='javascript:UIUtils.sendTags();'>Etiquetar</button>" +
											"<button onClick='javascript:UIUtils.toggle(\"add_tags_panel\");UIUtils.toggle(\"add_tags_link\");UIUtils.removeAllTags();'>Cancelar</button>" +
										"</div>" +
									"</div>" +
									"<div id='add_tags_link' class='link'><a href='javascript:UIUtils.toggle(\"add_tags_link\");UIUtils.toggle(\"add_tags_panel\");document.getElementById(\"new_tag_text_input\").focus();'>Etiquetar el recurso</a></div>" +
									"<div class='link'><a href='" + state.getUriWiki() + "' target='_blank'>Acceder a la Wiki</a></div>" +
									"<div class='link'><a href='" + state.getUriTemplate() + "' target='_blank'>Acceder al Template</a></div>" +
								"</div>" +
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
	var tagger = new Tagger();
	
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
	var tags = [];
	
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

	this.setTags = function(tagsXML_) {
		tags.clear();
		var tagsXMLList = tagsXML_.getElementsByTagName("tag");
		for (var i=0; i<tagsXMLList.length; i++)
		{
			tags.push(new Tag(tagsXMLList[i]));
		}
	}
	
	this.getTags = function() { return tags; }
	
	// Parsing XML Resource
	// Constructing the structure
	
	vendor = resourceXML_.getElementsByTagName("vendor")[0].firstChild.nodeValue;
	name = resourceXML_.getElementsByTagName("name")[0].firstChild.nodeValue;
	version = resourceXML_.getElementsByTagName("version")[0].firstChild.nodeValue;
	description = resourceXML_.getElementsByTagName("description")[0].firstChild.nodeValue;
	uriImage = resourceXML_.getElementsByTagName("uriImage")[0].firstChild.nodeValue;
	uriWiki = resourceXML_.getElementsByTagName("uriWiki")[0].firstChild.nodeValue;
	uriTemplate = resourceXML_.getElementsByTagName("uriTemplate")[0].firstChild.nodeValue;
	this.setTags(resourceXML_.getElementsByTagName("tags")[0]);
}