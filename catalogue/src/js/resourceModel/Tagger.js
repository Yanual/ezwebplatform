function Tagger(){
	var tags = [];
	var nextTag = 0;
	
	this.addTag = function(tag_) {
		var id = 'new_tag_' + (nextTag++);
		tags[id] = tag_;
		paintTag(id, tag_);
	}
	this.removeTag = function(id_) { 
		tags[id_] = null;
		eraserTag(id_);
	}
	
	this.removeAll = function() {
		tags.clear();
		eraserAll();
	}
	
	var paintTag = function(id_, tag_) {
		var newTag = document.createElement("div");
		newTag.setAttribute('id', id_);
		newTag.setAttribute('class', 'new_tag');
		newTag.setAttribute('onmouseover', "UIUtils.hidde('button_disable_" + id_ + "');UIUtils.show('button_enable_" + id_ + "');");
		newTag.setAttribute('onmouseout', "UIUtils.hidde('button_enable_" + id_ + "');UIUtils.show('button_disable_" + id_ + "');");
		newTag.innerHTML = 	tag_ + 
							"<div id='button_disable_" + id_ + "'>" +
								"<a>" +
									"<img src='images/remove_disable.gif' alt=''></img>" +
								"</a>" +
							"</div>" +
							"<div id='button_enable_" + id_ + "' style='display:none;'>" +
								"<a href='#' onclick='javascript:UIUtils.removeTag(\"" + id_ + "\");'>" +
									"<img src='images/remove_enable.gif' alt=''></img>" +
								"</a>" +
							"</div>,";
		var parentHTML = document.getElementById("my_tags");
		parentHTML.insertBefore(newTag, parentHTML.lastChild);
	}
	
	var eraserTag = function(id_) {
		var parentHTML = document.getElementById("my_tags");
		var tagHTML = document.getElementById(id_);
		parentHTML.removeChild(tagHTML);
	}
	
	var eraserAll = function() {
		
	} 
}