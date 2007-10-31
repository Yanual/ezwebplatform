function Tag(tagXML_)
{
	state = new StateTag(tagXML_);
	
	this.getValue = function() {return state.getValue();}
	this.getAppearances = function() {return state.getAppearances();} 
}

function StateTag(tagXML_)
{
	var value = tagXML_.getElementsByTagName("value")[0].firstChild.nodeValue;
	var appearances = tagXML_.getElementsByTagName("appearances")[0].firstChild.nodeValue;
	
	this.getValue = function() {return value;}
	this.getAppearances = function() {return appearances;} 
}