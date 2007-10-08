function Gadget(vendor, name, version, tags, template, xhtml) {
	var _vendor = vendor;
	var _name = name;
	var _version = version;
	var _tags = tags;
	var _template = template;
	var _xhtml = xhtml;
	
	this.setTags = function(tags) { _tags = tags; }
	this.getTags = function() { return _tags; }
	this.addTag = function(tag) { _tags.push(tag); }
	this.removeTag = function(tag) { _tags = _tags.without(tag); }
	this.setVendor = function(vendor) { _vendor = vendor; }
	this.getVendor = function() { return _vendor; }
	this.setName = function(name) { _name = name; }
	this.getName = function() { return _name; }
	this.setVersion = function(version) { _version = version; }
	this.getVersion = function() { return _version; }
	this.setTemplate = function(template) { _template = template; }
	this.getTemplate = function() { return _template; }
	this.setXHtml = function(xhtml) { _xhtml = xhtml; }
	this.getXHtml = function() { return _xhtml; }
	
	this.save = function() {
		state = new GadgetState('/user/<user_id>/gadgets/' + _vendor + '/' + _name + '/' + _version, this)
		state.save();
	}
}

function GadgetState(uri, gadget) {
	this.vendor = gadget.getVendor();
	this.name = gadget.getName();
	this.version = gadget.getVersion();
	this.uriTemplate = uri + '/template/json';
	this.uriXhtml = uri + '/xhtml';
	this.uriTags = new Array();
	var _tags = gadget.getTags();
	for (i=0; i<_tags.length; i++)
	{
		this.uriTags[i] = uri + '/tags/' + i;
	}
	
	this.save = function() {
		persistence = new Persistence();
		persistence.save(uri + '/json', this.toJSONString());
		gadget.getXHtml().save(this.uriXhtml);
		gadget.getTemplate().save(this.uriTemplate);
		for (i=0; i<_tags.length; i++)
		{
			_tags[i].save(this.uriTags[i]);
		}
	}
}