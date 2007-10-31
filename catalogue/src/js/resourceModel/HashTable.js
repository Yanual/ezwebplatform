function HashTable() {
	
	var list = [];
	
	this.addElement = function(key_, value_) {
		list.push(new TableElement(key_, value_));
	}
	
	this.removeElement = function(key_) {
		for (var i=0; i<list.length; i++)
		{
			if (list[i].getKey() == key_) {
				list = list.without(list[i]);
			}
		}
	}
	
	this.getValue = function(key_) {
		for (var i=0; i<list.length; i++)
		{
			if (list[i].getKey() == key_) {
				return list[i].getValue();
			}
		}
		return '';
	}
	
	this.clear = function() {
		while (list.length > 0)
		{
			list = list.without(list[0]);
		}
	}
	
	this.size = function() {
		return list.length;
	}
	
	this.getValues = function() {
		var values = [];
		for (var i=0; i<list.length; i++){
			values[i] = list[i].getValue();
		}		
		return values;
	}
	
	this.contains = function(value_) {
		for (var i=0; i<list.length; i++){
			if (list[i].getValue() == value_) {
				return true;
			}
		}
		return false;
	}
	
	// ***************
	//  PRIVATE CLASS
	// ***************
	
	var TableElement = function(key_, value_) {
		var key = key_;
		var value = value_;
		
		this.getKey = function() { return key; }
		this.getValue = function() { return value; }
	}
}