
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
		var newResource = document.createElement("div");
		newResource.setAttribute('id', id);
		newResource.innerHTML = "<div class='resource' onMouseOver='UIUtils.selectResource(\"" + id + "\");UIUtils.show(\"" + id + "_toolbar\");' onMouseOut='UIUtils.deselectResource(\"" + id + "\");UIUtils.hidde(\"" + id + "_toolbar\");'>" +
									"<div class='top'></div>" +
									"<div class='toolbar'>" +
										"<div id='" + id + "_toolbar' style='display:none;'>" +
											"<a id='" + id + "_description' title='Ver Descripci&oacute;n' onmouseover=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconDescriptionBalloon('images/description.png');\" onmouseout=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconDescriptionBalloon('images/description_gray.png');\">" +
											"</a>" +
											"<a title='Acceder a la Wiki' href='" + state.getUriWiki() + "' target='_blank'  onmouseover=\"UIUtils.changeImage('" + id + "_wiki_img', 'images/wiki.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_wiki_img', 'images/wiki_gray.png');\">" +
												"<img id='" + id + "_wiki_img' src='images/wiki_gray.png'></img>" +
											"</a>" +
											"<a title='Ver el Template' href='" + state.getUriTemplate() + "' target='_blank' onmouseover=\"UIUtils.changeImage('" + id + "_template_img', 'images/template.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_template_img', 'images/template_gray.png');\">" +
												"<img id='" + id + "_template_img' src='images/template_gray.png'></img>" +
											"</a>" +
										"</div>" +
									"</div>" +
									"<div id='" + id + "_content' class='content'>" +
										"<div class='title'>" + state.getName() + "</div>" +
										"<div class='image'><a title='Mostrar informaci&oacute;n del recurso' href='javascript:UIUtils.showResourceInfo(\"" + id + "\");UIUtils.openInfoResource();'><img src='" + state.getUriImage() + "'></img></a></div>" +
										"<div class='tags'>" +
											"<div id='" + id + "_important_tags' class='important_tags'>" + 
												_tagsToMoreImportantTags(3) +
											"</div>" +
											"<div class='more_tags'>" +
												"<a id='" + id + "_tagcloud_balloon' title='Ver el Tagcloud del recurso' onmouseover=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconTagcloudBalloon('images/more_tags.png');\" onmouseout=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconTagcloudBalloon('images/more_tags_gray.png');\">" +
												"</a>" + 
											"</div>" +
										"</div>" +
										"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(\"" + id + "\");'>A&ntilde;adir Instancia</button>" +
									"</div>" +
									"<div id='" + id + "_bottom' class = 'bottom'></div>" +
								"</div>";
		var parentHTML = document.getElementById("resources");
		parentHTML.insertBefore(newResource, parentHTML.firstChild);
		
		_createDescriptionBalloon();
		_createTagcloudBalloon();
	}
	
	this.showInfo = function() {
		var tableInfo = document.getElementById("info_resource_content");
		tableInfo.innerHTML = 	"<div class='title_fieldset'>Informaci&oacute;n del Recurso</div>" +
								"<div class='fieldset'>" +
									"<div class='title'><span class='name'>" + state.getName() + "</span>" +
									"<span class='version'>" + state.getVersion() + "</span></div>" +
									"<div class='vendor'>" + state.getVendor() + "</div>" +
									"<div class='image'><img src='" + state.getUriImage() + "' alt='" + state.getName()+ "&nbsp;" + state.getVersion() + "'/></div>" +
									"<div class='description'>Descripci&oacute;n:<br/><div class='text'>" + state.getDescription() + "</div></div>" +
									"<div class='tagcloud'>Tagcloud:<br/><div id='" + id + "_tagcloud' class='tags'>" + _tagsToTagcloud() + "</div></div>" +
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
								"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(UIUtils.getSelectedResource());'>A&ntilde;adir Instancia</button>";
	}
	
	this.updateTags = function()
	{
		document.getElementById(id + "_important_tags").innerHTML = _tagsToMoreImportantTags(3);
		document.getElementById(id + '_tagcloud_balloon').innerHTML = "\n";
		//_createTagcloudBalloon();
		if (id == UIUtils.selectedResource) document.getElementById(id + "_tagcloud").innerHTML = _tagsToTagcloud();
	}
	
	this.changeIconDescriptionBalloon = function(src_)
	{
		descriptionBalloon._elements.icon.src = src_;
	}
	
	this.changeIconTagcloudBalloon = function(src_)
	{
		tagcloudBalloon._elements.icon.src = src_;
	}
	
	// *******************
	//  PRIVATE FUNCTIONS
	// *******************
	
	var _getFirstTagNonRepeat = function(list1_, list2_) {
		for (var i=0; i<list1_.length; i++) {
			if (!_containsTag(list1_[i], list2_)) return list1_[i];
		}
		return list_[0];
	}
	
	var _containsTag = function(element_, list_)
	{
		for (var i=0; i<list_.length; i++) {
			if (element_.equals(list_[i])) {
				return true;
			}
		}
		return false;
	}
	
	var _tagsToMoreImportantTags = function(tagsNumber_){
		var tagsHTML = '';
		var tagsAux = state.getTags();
		var moreImportantTags = [];
		
		for (var i=0; i<((tagsNumber_<tagsAux.length)?tagsNumber_:tagsAux.length); i++)
		{
			moreImportantTags[i] = _getFirstTagNonRepeat(tagsAux, moreImportantTags);
			for (var j=0; j<tagsAux.length; j++)
			{
				if ((!_containsTag(tagsAux[j], moreImportantTags)) && (moreImportantTags[i].compareTo(tagsAux[j]) < 0)) {
					moreImportantTags[i] = tagsAux[j];
				}
			}
		}
		
		for (var i=0; i<moreImportantTags.length; i++)
		{
			tagsHTML += (moreImportantTags[i].tagToHTML() + ((i<(((moreImportantTags.length>tagsNumber_)?tagsNumber_:moreImportantTags.length)-1))?", ":""));
		}
		return tagsHTML;
	}
	
	var _tagsToTagcloud = function(){
		var tagsHTML = '';
		var tagsAux = state.getTags();
		for (var i=0; i<tagsAux.length; i++)
		{
			tagsHTML += ("<span class='multiple_size_tag'>" + tagsAux[i].tagToTypedHTML() + ((i<(tagsAux.length-1))?",":"") + "</span> ");
		}
		return tagsHTML;
	}
	
	var _createDescriptionBalloon = function()
	{
		descriptionBalloon = new HelpBalloon({
									returnElement: true,
									icon: 		'images/description_gray.png',			//url to the icon to use
									altText: 	'Descripcion', 							//Alt text of the help icon
									title: 		'Descripcion:',							//Title of the balloon topic
									content:	"<p class='description_balloon'>" + 	//Static content of the help balloon
													state.getDescription() + 
												"</p>",
									imagePath: 	'lib/helpballoon/images/'
		});
		$(id + '_description').appendChild(descriptionBalloon._elements.icon);
	}

	var _createTagcloudBalloon = function()
	{
		tagcloudBalloon = new HelpBalloon({
									returnElement: true,
									icon: 		'images/more_tags_gray.png',										//url to the icon to use
									altText: 	'TagCloud', 														//Alt text of the help icon
									title: 		'TagCloud:',														//Title of the balloon topic
									content:	"<p class='tagcloud_balloon'>" +	//Static content of the help balloon
													_tagsToTagcloud() + 
												"</p>",
									imagePath: 	'lib/helpballoon/images/'
		});
		$(id + '_tagcloud_balloon').appendChild(tagcloudBalloon._elements.icon);
	}

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
	var descriptionBalloon = null;
	var tagcloudBalloon = null;
	
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