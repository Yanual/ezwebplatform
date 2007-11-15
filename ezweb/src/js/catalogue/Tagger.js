function Tagger(){
	
	var tags = new HashTable();
	
	this.addTag = function(tag_) {
		if (tag_.length < 3) {
			alert("La etiqueta debe tener al menos tres caracteres.");
		}
		else {
			if (!tags.contains(tag_)) {
				var id = 'new_tag_' + tags.size();
				tags.addElement(id, tag_);
				paintTag(id, tag_);
			}
		}
	}

	this.removeTag = function(id_) { 
		tags.removeElement(id_);
		eraserTag(id_);
	}
	
	this.removeAll = function() {
		tags.clear();
		eraserAll();
	}

	this.onSuccess = function(response) {
		alert (response);
	
	}

	this.onError = function(response) {
		alert (response);
	
	}
	
	this.sendTags = function(url, resourceURI)
	{
		var elements = tags.getValues();
		var tagsXML = 	//"<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + 
							"<tags>";
		for (var i=0; i<elements.size(); i++)
		{
			tagsXML += ("<tag>" + elements[i] + "</tag>");
		}
		tagsXML += "</tags>"
		alert(tagsXML);

		param = "tags_xml=" + tagsXML;

		PersistenceEngineFactory.getInstance().send_post(url + resourceURI, param, this, this.onSuccess, this.onError);
	}
	
	var paintTag = function(id_, tag_) {
		var newTag = document.createElement("div");
		newTag.setAttribute('id', id_);
		newTag.innerHTML = 	"<div class='new_tag' onmouseover=\"UIUtils.hidde('button_disable_" + id_ + "');UIUtils.show('button_enable_" + id_ + "');\" onmouseout=\"UIUtils.hidde('button_enable_" + id_ + "');UIUtils.show('button_disable_" + id_ + "');\">" + 
								tag_ + 
								"<div id='button_disable_" + id_ + "'>" +
									"<a>" +
										"<img src='images/cancel_gray.png' alt=''></img>" +
									"</a>" +
								"</div>" +
								"<div id='button_enable_" + id_ + "' style='display:none;'>" +
									"<a href='javascript:UIUtils.removeTag(\"" + id_ + "\");'>" +
										"<img src='images/cancel.png' alt=''></img>" +
									"</a>" +
								"</div>," + 
							"</div> ";
		var parentHTML = document.getElementById("my_tags");
		parentHTML.insertBefore(newTag, parentHTML.lastChild);
	}
	
	var eraserTag = function(id_) {
		var parentHTML = document.getElementById("my_tags");
		var tagHTML = document.getElementById(id_);
		parentHTML.removeChild(tagHTML);
	}
	
	var eraserAll = function() {
		var parentHTML = document.getElementById("my_tags");
		while(parentHTML.childNodes.length > 1)
		{
			parentHTML.removeChild(parentHTML.childNodes[0]);
		}
	} 
}