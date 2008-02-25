	//////////////////////////////////////////////
  //                RESOURCE                  //
  //////////////////////////////////////////////

function Resource( id_, resourceJSON_, urlTemplate_, items) {
	
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
	this.getAddedBy = function() { return state.getAddedBy(); }
	this.getTags = function() { return state.getTags(); }
	this.setTags = function(tags_) { state.setTags(tags_); }
	this.getSlots = function() { return state.getSlots(); }
	this.setSlots = function(slots_) { state.setSlots(slots_); }
	this.getEvents = function() { return state.getEvents(); }
	this.setEvents = function(events_) { state.setEvents(events_); }
	this.getTagger = function() { return tagger; }
	
	this.paint = function(){
		var newResource = document.createElement("div");
		newResource.setAttribute('id', id);
		newResource.innerHTML = "<div class='resource' onMouseOver='UIUtils.selectResource(\"" + id + "\");UIUtils.show(\"" + id + "_toolbar\");' onMouseOut='UIUtils.deselectResource(\"" + id + "\");UIUtils.hidde(\"" + id + "_toolbar\");'>" +
									"<div class='top'></div>" +
									"<div class='toolbar'>" +
										"<div id='" + id + "_toolbar' style='display:none;'>" +
											"<a id='" + id + "_description' title='" + gettext ('Show description') + "' onmouseover=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconDescriptionBalloon('/ezweb/images/description.png');\" onmouseout=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconDescriptionBalloon('/ezweb/images/description_gray.png');\">" +
											"</a>" +
											"<a title='" + gettext ('Access to Wiki') + "' href='" + state.getUriWiki() + "' target='_blank'  onmouseover=\"UIUtils.changeImage('" + id + "_wiki_img', '/ezweb/images/wiki.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_wiki_img', '/ezweb/images/wiki_gray.png');\">" +
												"<img id='" + id + "_wiki_img' src='/ezweb/images/wiki_gray.png'></img>" +
											"</a>" +
											"<a title='" + gettext ('Show Template') + "' href='" + state.getUriTemplate() + "' target='_blank' onmouseover=\"UIUtils.changeImage('" + id + "_template_img', '/ezweb/images/template.png');\" onmouseout=\"UIUtils.changeImage('" + id + "_template_img', '/ezweb/images/template_gray.png');\">" +
												"<img id='" + id + "_template_img' src='/ezweb/images/template_gray.png'></img>" +
											"</a>" +
										"</div>" +
									"</div>" +
									"<div id='" + id + "_content' class='content'>" +
										"<div class='title'>" + state.getName() + "</div>" +
										"<div class='image'><a title='" + gettext ('Show resource details') + "' href='javascript:UIUtils.showResourceInfo(\"" + id + "\");UIUtils.openInfoResource();UIUtils.selectConnectableResources(\"" + id + "\");'><img src='" + state.getUriImage() + "'></img></a></div>" +
										"<div class='tags'>" +
											"<div id='" + id + "_important_tags' class='important_tags'>" + 
												_tagsToMoreImportantTags(3) +
											"</div>" +
											"<div class='more_tags'>" +
												"<a id='" + id + "_tagcloud_balloon' title='" + gettext ('Show resource tag cloud') + "' onmouseover=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconTagcloudBalloon('/ezweb/images/more_tags.png');\" onmouseout=\"CatalogueFactory.getInstance().getResource('" + id + "').changeIconTagcloudBalloon('/ezweb/images/more_tags_gray.png');\">" +
												"</a>" + 
											"</div>" +
										"</div>" +
										"<button onclick='CatalogueFactory.getInstance().addResourceToShowCase(\"" + id + "\");'>" + gettext ('Add Instance') + "</button>" +
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
		tableInfo.innerHTML = 	"<div class='title_fieldset'>" + gettext ('Resource details') + "</div>" +
								"<div class='fieldset'>" +
									"<div class='title'><span class='name'>" + state.getName() + "</span>" +
									"<span class='version'>" + state.getVersion() + "</span></div>" +
									"<div class='vendor'>" + state.getVendor() + "</div>" +
									"<div class='image'><img src='" + state.getUriImage() + "' alt='" + state.getName()+ "&nbsp;" + state.getVersion() + "'/></div>" +
									"<div class='description'>" + gettext ('Description:') + "<br/><div class='text'>" + state.getDescription() + "</div></div><br/>" +
									"<div class='connect'>" + gettext ('Gadget connectivity') + "</div><br/>" +
									"<div class='Events'>" + gettext ('Events: ') + _events()+ "</div>" +
									"<div class='Slots'>" + gettext ('Slots: ') +_slots()+ "</div>" +
									"<div class='tagcloud'>" + gettext ('Tagcloud') + ":<br/><div id='" + id + "_tagcloud' class='tags'>" + _tagsToTagcloud() + "</div></div>" +
									"<div id='add_tags_panel' class='new_tags' style='display:none;'>" +
										"<div class='title'>" + gettext ('New Tags') + ":</div>" +
										"<div id='my_tags' class='my_tags'>" +
											"<div id='new_tag_text' class='new_tag_text'><input id='new_tag_text_input' type='text' onkeypress=\"UIUtils.onReturn(event,UIUtils.addTag,this);\"/></div>" +
										"</div>" +
										"<div class='buttons'>" +
											"<button onclick='javascript:UIUtils.sendTags();'>" + gettext ('To label') + ":</button>" +
											"<button onClick='javascript:UIUtils.toggle(\"add_tags_panel\");UIUtils.toggle(\"add_tags_link\");UIUtils.removeAllTags();'>" + gettext ('Cancel') + ":</button>" +
										"</div>" +
									"</div>" +
									
"<div id='add_tags_link' class='link'><a href='javascript:UIUtils.toggle(\"add_tags_link\");UIUtils.toggle(\"add_tags_panel\");document.getElementById(\"new_tag_text_input\").focus();'>" + gettext ('To label the resource') + "</a></div>" +
"<div class='link'><a href='" + state.getUriWiki() + "' target='_blank'>" + gettext ('Access to Wiki') + "</a></div>" +

"<div class='link'><a href='" + state.getUriTemplate() + "' target='_blank'>" + gettext ('Access to Template') + "</a></div>" + 

"<div class='link'><a href='javascript:UIUtils.updateGadgetXHTML();'>" + gettext ('Update Gadget Code') + "</a></div>" + 

"<div class='link'>" + _deleteGadget() + "</div>" +

"</div><button onclick='CatalogueFactory.getInstance().addResourceToShowCase(UIUtils.getSelectedResource());'>" + gettext ('Add Instance') + "</button>";
	}
	
	this.paginate = function(items) {
		var pageInfo = document.getElementById("paginate");
		pageInfo.innerHTML = 	"<center>" + _paginate(items) + "</center>";
	}
	
	this.updateTags = function()
	{
		document.getElementById(id + "_important_tags").innerHTML = _tagsToMoreImportantTags(3);
		document.getElementById(id + '_tagcloud_balloon').innerHTML = "\n";
		_createTagcloudBalloon();
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
	
 var _paginate = function(items){
		var eventsHTML = '';

		eventsHTML=( "<div id='results_per_page' class='results_per_page'>" +
		                  "<label for='combo_results_per_page'>" + gettext("Gadgets per page: ") + "</label>" +
		                  "<select id='combo_results_per_page' size=1 onChange=" + 
		                      "'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, document.getElementById(\"combo_results_per_page\").options[document.getElementById(\"combo_results_per_page\").selectedIndex].value.toString(), \"first\", \"" + items + "\");'" +
		                  "\">");
        var max;
        if(items>100) {
            max = 100;
        } else {
            max = Math.ceil(items/4);
        }
		for (var i=1; i<=max; i++)
		{
		  eventsHTML+=("<option value=\"" + i*4 + "\"");
		      if(UIUtils.getOffset() == i*4)
		      {
		          eventsHTML+=(" SELECTED");
		      }
		  eventsHTML+=(">" + i*4);
		}
		eventsHTML+=("</select></div></br>");
          
		var end_page = Math.ceil(items/UIUtils.getOffset());
        
        if(UIUtils.getPage()!=1)
        {
           var jsCall_first = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"first", "' + items + '");';
           eventsHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to first page') + "' href='" + jsCall_first + "'>" + "<img src='/ezweb/images/go-first.png'/>" + "</a></span>");
        } else {
           eventsHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-first-dim.png'/>" + "</span>");
        }
		if(UIUtils.getPage()!=1)
		{
           var jsCall_prev = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"prev", "' + items + '");';
	       eventsHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to previous page') + "' href='" + jsCall_prev + "'>" + "<img src='/ezweb/images/go-previous.png'/>" + "</a></span>");
		} else {
		   eventsHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-previous-dim.png'/>" + "</span>");
        }
        
		for (var i=1; i<=end_page; i++)
		{
            if(UIUtils.getPage()!=i)
            {
			     var jsCall_num = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ', "' + i + '", "' + items + '");';
			     eventsHTML += ("<span class='multiple_size_tag'>"+"<a title='" + gettext ('Go to page ') + i + "' href='" + jsCall_num + "'>" + i + "</a></span>");
		    } else {
                 eventsHTML += ("<span class='multiple_size_tag'>" + i + "</span>");
		    }
		}
		if(end_page == UIUtils.getPage())
        {
              eventsHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-next-dim.png'/>" + "</span>");
        } else {
		      var jsCall_next = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"next", "' + items + '");';
		      eventsHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to next page') + "' href='" + jsCall_next + "'>" + "<img src='/ezweb/images/go-next.png'/>" + "</a></span>");
		}
		
        if(end_page == UIUtils.getPage())
        {
                eventsHTML += ("<span class='multiple_size_tag'>" + "<img src='/ezweb/images/go-last-dim.png'/>" + "</span>");
        } else {
                var jsCall_last = 'javascript:UIUtils.cataloguePaginate(URIs.GET_POST_RESOURCES, ' + UIUtils.getOffset() + ',"last", "' + items + '");';
                eventsHTML += ("<span class='multiple_size_tag'><a title='" + gettext ('Go to last page') + "' href='" + jsCall_last + "'>" + "<img src='/ezweb/images/go-last.png'/>" + "</a></span>");
        }
		return eventsHTML;
	}
	
	var _events = function(){
		var eventsHTML = '';
		var eventsAux = state.getEvents();
		
		for (var i=0; i<eventsAux.length; i++)
		{
			
			var jsCall = 'javascript:UIUtils.searchByWiring(URIs.GET_RESOURCES_BY_WIRING, "' + eventsAux[i] + '", "' + 'connectEvent' + '");';
			eventsHTML += ("<span class='multiple_size_tag'>"+"<a title='" + gettext ('Search by ') + eventsAux[i] +"' href='" + jsCall + "'>" + eventsAux[i] + "</a>" + ((i<(eventsAux.length-1))?",":"") + "</span> ");
		}
		return eventsHTML;
	}
	
	var _deleteGadget = function(){
		var deleteHTML = '';
		var addedBy = state.getAddedBy();
		
		if (addedBy == 'Yes'){
		
	     deleteHTML += ("<a href='javascript:UIUtils.deleteGadget()'>" + gettext ('Delete Gadget') + "</a>");
    }
		return deleteHTML;
	}
	
	var _slots = function(){
		var slotsHTML = '';
		var slotsAux = state.getSlots();
		
		for (var i=0; i<slotsAux.length; i++)
		{
			
			var jsCall = 'javascript:UIUtils.searchByWiring(URIs.GET_RESOURCES_BY_WIRING, "' + slotsAux[i] + '", "' + 'connectSlot' + '");';
			slotsHTML += ("<span class='multiple_size_tag'>"+"<a title=" + gettext ('Search by ') + slotsAux[i] +"' href='" + jsCall + "'>" + slotsAux[i] + "</a>" + ((i<(slotsAux.length-1))?",":"") + "</span> ");
		}
		return slotsHTML;
	}
	
	var _tagsToTagcloud = function(){
		var tagsHTML = '';
		var URL = '';
		var tagsAux = state.getTags();
		
		
		for (var i=0; i<tagsAux.length; i++)
		{
			var version = state.getVersion();
			var added = tagsAux[i].getAdded_by();
			
			if(tagsAux[i].getAdded_by() == 'Yes'){  
			
			var jsCall = 'javascript:UIUtils.removeTagUser("' + tagsAux[i].getValue() + '");';
			tagsHTML += ("<a href='" + jsCall + "'><img src='/ezweb/images/cancel_gray.png' border=0 name=op1></a><span class='multiple_size_tag'>" + tagsAux[i].tagToTypedHTML() + ((i<(tagsAux.length-1))?",":"") + "</span>");
			
		}
		  else{
		  
		  tagsHTML += ("<span class='multiple_size_tag'>" + tagsAux[i].tagToTypedHTML() + ((i<(tagsAux.length-1))?",":"") + "</span>");		  
		}
		}
		return tagsHTML;
	}
	
	var _createDescriptionBalloon = function()
	{
		descriptionBalloon = new HelpBalloon({
									returnElement: true,
									icon: 		'/ezweb/images/description_gray.png',	//url to the icon to use
									altText: 	gettext ('Description'), 				//Alt text of the help icon
									title: 		gettext ('Description') + ':',			//Title of the balloon topic
									content:	"<p class='description_balloon'>" + 	//Static content of the help balloon
													state.getDescription() + 
												"</p>",
									imagePath: 	'/ezweb/js/lib/helpballoon/images/'
		});
		$(id + '_description').appendChild(descriptionBalloon._elements.icon);
	}

	var _createTagcloudBalloon = function()
	{
		tagcloudBalloon = new HelpBalloon({
									returnElement: true,
									icon: 		'/ezweb/images/more_tags_gray.png',	//url to the icon to use
									altText: 	gettext ('TagCloud'),				//Alt text of the help icon
									title: 		gettext ('TagCloud') + ':',			//Title of the balloon topic
									content:	"<p class='tagcloud_balloon'>" +	//Static content of the help balloon
													_tagsToTagcloud() + 
												"</p>",
									imagePath: 	'/ezweb/js/lib/helpballoon/images/'
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
		state = new ResourceState(resourceJSON_);
		this.paint();
		this.paginate(items);
	}
}

  //////////////////////////////////////////////
  //       RESOURCESTATE (State Object)       //
  //////////////////////////////////////////////
  
	function ResourceState(resourceJSON_) {

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
	var slots = [];
	var events = [];
	
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
	this.getAddedBy = function() { return addedBy; }

	this.setTags = function(tagsJSON_) {
		tags.clear();
		//var tagsXMLList = tagsXML_.getElementsByTagName("Tag");
		for (var i=0; i<tagsJSON_.length; i++)
		{
			tags.push(new Tag(tagsJSON_[i]));
		}
	}
	
	
	this.setSlots = function(slotsJSON_) {
		slots.clear();
		for (var i=0; i<slotsJSON_.length; i++)
		{
			slots.push(slotsJSON_[i].friendcode);
		}
	}
	
	this.setEvents = function(eventsJSON_) {
		events.clear();
		for (var i=0; i<eventsJSON_.length; i++)
		{
			events.push(eventsJSON_[i].friendcode);
		}
	}
	
	this.getTags = function() { return tags; }
	this.getSlots = function() { return slots; }
	this.getEvents = function() { return events; }
	
	// Parsing JSON Resource
	// Constructing the structure
	
	vendor = resourceJSON_.vendor;
	name = resourceJSON_.name;
	version = resourceJSON_.version;
	description = resourceJSON_.description;
	uriImage = resourceJSON_.uriImage;
	uriWiki = resourceJSON_.uriWiki;
	addedBy = resourceJSON_.added_by;
	uriTemplate = resourceJSON_.uriTemplate;
	this.setEvents(resourceJSON_.events);
	this.setSlots(resourceJSON_.slots);
	this.setTags(resourceJSON_.tags);
	
	

}