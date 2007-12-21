/**
 * @author luismarcos.ayllon
 */
var MyClassFactory  = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;

	function MyClass () {
		
		// *********************************
		// PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
		var myPrivateVar = "private variable accessed";
	    function myPrivateMethod(){ 
			alert ("private method accessed");
		}
	
		// *********************
		// PRIVILEGED METHODS
		// *********************
		this.getMyPrivateVar = function(){ return myPrivateVar }
		
	
		// *******************
		// PUBLIC PROPERTIES 
		// *******************
		this.myPublicVar = "public var accessed";
	
		// ****************
		// PUBLIC METHODS
		// ****************
		MyClass.prototype.myPublicMethod = function () {alert ("public method accessed")}
			
	}
	
	// ************************
	// SINGLETON GET INSTANCE
	// ************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null) {
        		instance = new MyClass();
            	instance.constructor = null;
         	}
         	return instance;
       	}
	}
	
}();

var myInstance = MyClassFactory.getInstance();
myInstance.myPublicMethod(); // OK
alert (myInstance.myPublicVar); // OK
alert (myInstance.getMyPrivateVar()); // OK
myInstance.myPrivateMethod (); // NO
alert (myInstance.myPrivateVar); // NO