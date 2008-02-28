/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2004 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */


function Tagger(){
	
	var _this = this;
	var tags  = new HashTable();
	
	this.addTag = function(tag_) {
		if (tag_.length < 3) {
			alert(gettext ("Tag must have at least three characters."));
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
	
	this.sendTags = function(url, resourceURI)
	{
		UIUtils.toggle('add_tags_panel');
		UIUtils.toggle('add_tags_link');
		if (tags.size()>0)
		{
			var onError = function(transport) {
				alert(gettext ("Error POST"));
				// Process
			}
			
			var loadTags = function(transport) {
				var resource = CatalogueFactory.getInstance().getResource(UIUtils.selectedResource);
				var responseJSON = transport.responseText;
				var jsonResourceList = eval ('(' + responseJSON + ')');
				resource.setTags(jsonResourceList.tagList);
				resource.updateTags();
			}
			
			var elements = tags.getValues();
			var tagsXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + 
								"<Tags>";
			for (var i=0; i<elements.size(); i++)
			{
				tagsXML += ("<Tag>" + elements[i] + "</Tag>");
			}
			tagsXML += "</Tags>"
	
			var param = {tags_xml: tagsXML};
	
			PersistenceEngineFactory.getInstance().send_post(url + resourceURI, param, this, loadTags, onError);
			_this.removeAll();
		}
	}
	
this.removeTagUser = function(url, resourceURI,id)
	{
			var resource = CatalogueFactory.getInstance().getResource(id);

			var onError = function(transport) {
				alert(gettext ("Error DELETE"));
				// Process
			}
			
			var loadTags = function(transport) {
				
				var responseJSON = transport.responseText;
				var jsonResourceList = eval ('(' + responseJSON + ')');
				resource.setTags(jsonResourceList.tagList);
				resource.updateTags();
			}
			
			PersistenceEngineFactory.getInstance().send_delete(url + resourceURI, this, loadTags, onError);
			
  }

	
	var paintTag = function(id_, tag_) {
		var newTag = document.createElement("div");
		newTag.setAttribute('id', id_);
		newTag.innerHTML = 	"<div class='new_tag' onmouseover=\"UIUtils.hidde('button_disable_" + id_ + "');UIUtils.show('button_enable_" + id_ + "');\" onmouseout=\"UIUtils.hidde('button_enable_" + id_ + "');UIUtils.show('button_disable_" + id_ + "');\">" + 
								tag_ + 
								"<div id='button_disable_" + id_ + "'>" +
									"<a>" +
										"<img src='/ezweb/images/cancel_gray.png' alt=''></img>" +
									"</a>" +
								"</div>" +
								"<div id='button_enable_" + id_ + "' style='display:none;'>" +
									"<a href='javascript:UIUtils.removeTag(\"" + id_ + "\");'>" +
										"<img src='/ezweb/images/cancel.png' alt=''></img>" +
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
