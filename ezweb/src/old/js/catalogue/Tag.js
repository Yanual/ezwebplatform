function Tag(tagXML_)
{
	var state = new StateTag(tagXML_);
	
	this.getValue = function() { return state.getValue(); }
	this.getAppearances = function() { return state.getAppearances(); }
	
	this.tagToHTML = function() {
		var jsCall = 'javascript:UIUtils.searchByTag("http://europa.ls.fi.upm.es:8000/user/admin/catalogue/resources/", "' + state.getValue() + '");';

		return "<a title='Buscar " + state.getValue() +"' href='" + jsCall + "'>" + state.getValue() + "</a>";
	}
	
	this.tagToTypedHTML = function() {
		var classAux = '';
		if (state.getAppearances()<5)		classAux = 'tag_type_1';
		else if (state.getAppearances()<15) classAux = 'tag_type_2';
		else if (state.getAppearances()<25) classAux = 'tag_type_3';
		else classAux = 'tag_type_4';
		
		var jsCall = 'javascript:UIUtils.searchByTag("http://europa.ls.fi.upm.es:8000/user/admin/catalogue/resources/", "' + state.getValue() + '");';

		var result = "<a class='" + classAux + "' title='Buscar "+ state.getValue() +"' href='" + jsCall + "'>" + state.getValue() + "</a>";

		return result;
	}
	
	this.equals = function(tag_) {
		return ((tag_.getValue() == state.getValue()) && (tag_.getAppearances() == state.getAppearances()));
	}
	
	this.compareTo = function(tag_) {
		if 		(state.getAppearances() < (tag_.getAppearances())) return -1;
		else if	(state.getAppearances() > (tag_.getAppearances())) return 1;
		else return 0;
	}
}

function StateTag(tagXML_) 
{
	var value = tagXML_.firstChild.nodeValue;
	var appearances = 1;
	//var value = tagXML_.getElementsByTagName("value")[0].firstChild.nodeValue;
	//var appearances = parseInt(tagXML_.getElementsByTagName("appearances")[0].firstChild.nodeValue);
	
	this.getValue = function() { return value; }
	this.getAppearances = function() { return appearances; } 
}