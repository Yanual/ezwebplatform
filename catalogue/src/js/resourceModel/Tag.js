function Tag(value_)
{
	state = new StateTag(value_);
	
	this.getValue = function() {return state.getValue();}
	this.getAppearances = function() {return state.getAppearances();} 
}

function StateTag(value_)
{
	var value = value_;
	var appearances = appearances_;
	
	this.getValue = function() {return value;}
	this.getAppearances = function() {return appearances;} 
}