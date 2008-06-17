if(!window["mymw"]){
   
   mymw = new function(){
   
    var DIV_COMBO_AJAX_PREFIX = "_mymw_sel_";
   
    var DIV_COMBO_TITLE_AJAX_PREFIX = "_mymw_title_";
   
    var DIV_CHAINED_MENU_AJAX_PREFIX = "_mymw_div_";
      
    var EMPTY_STRING = "";
   
    var AMP = "&";
   
    var EQUAL = "=";
      
    var AJAX_ENABLED = "aj";
	
	this.http_request = false;
		
    if (window.XMLHttpRequest) { // Mozilla, Safari,...
            this.http_request = new XMLHttpRequest();
            //if (this.http_request.overrideMimeType) {			
				//this.http_request.overrideMimeType('text/xml');		
            //}
    } else if (window.ActiveXObject) { // IE
            try {
                this.http_request = new ActiveXObject("Msxml2.XMLHTTP");              
            } catch (e) {
                try {
                    this.http_request = new ActiveXObject("Microsoft.XMLHTTP");                                        
                } catch (e) {}
            }
    }
		
	this.makeRequest = function (method, url, successCallBack, errorCallBack, async) {
		
		// We stablish the function that are going to be callBack in success and error cases
		mymw.successCallBack = successCallBack;
		mymw.errorCallBack = errorCallBack;
		
        // Open the socket
        mymw.http_request.open(method, url, async);
        mymw.http_request.onreadystatechange = checkRequest;
	        
	    // Depending od the method, we need to make the request in a different way
		if (method == 'GET') {
			mymw.http_request.send(null);
		} else {
			mymw.http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			mymw.http_request.send(url);
		}
	        
    	}	
    	
	
	function checkRequest(){	 	
		if (mymw.http_request.readyState == 4) {			
		    if (mymw.http_request.status == 200) {
				mymw.successCallBack();
		    } else {				
				mymw.errorCallBack();
		    }
		}	
	}	
	
	function getElementById(id) {
		
		var ret = EMPTY_STRING;
  		
        if (document.all) {                	 
     		ret = document.all[id];       
    	} else if (document.getElementById) {
      		ret = document.getElementById(id);
      	} else if (document.layers) {                	    
      		ret = document.layers[0].id;
      	}	
  		
  		return ret;
  		
	}
	
   	this.makeURL =  function (pathServlet, idchmen, idmenu, positionNextMenu, idnextmen, selectElement, isAjax){
						
		// EventsParams						
		var parameters = [];
		parameters.push("_C");
		parameters.push(EQUAL);
		parameters.push(idmenu);
		parameters.push(AMP);
		parameters.push("_E");
		parameters.push(EQUAL);
		
		var value_E = EMPTY_STRING;
		if (isAjax){
			value_E = "onchange";
		} else{
			value_E = "onfinish";
		}
		
		parameters.push(value_E);
		parameters.push(AMP);
		parameters.push(idmenu);
		parameters.push("_VAL");
		parameters.push(EQUAL);
		
		var value_VAL = selectElement.options[selectElement.selectedIndex].value;				
		// If there is no element selected, we return an empty URL
		/*if (value_VAL == EMPTY_STRING){			
			return EMPTY_STRING;
		};*/
		
		parameters.push(value_VAL);
		parameters.push(AMP);
		parameters.push("_P_idchmen");
		parameters.push(EQUAL);
		parameters.push(idchmen);
					
		if (isAjax){
			parameters.push(AMP);
			parameters.push("_P_posmen_");
			parameters.push(idmenu);
			parameters.push(EQUAL);
			parameters.push(positionNextMenu);
			parameters.push(AMP);
			parameters.push("_P_idmen_");
			parameters.push(idmenu);
			parameters.push(EQUAL);
			parameters.push(idnextmen);
			parameters.push(AMP);
			parameters.push(AJAX_ENABLED);
			parameters.push(EQUAL);
			parameters.push(isAjax);			
		}
		
		return (pathServlet + AMP + parameters.join(EMPTY_STRING));	
		
	}
    	
		this.changeMenu =  function (pathServlet, idchmen, idmenu, positionNextMenu, idnextmen, t, s, selectElement, isAjax){   	
  	
		var requestURL = mymw.makeURL(pathServlet, idchmen,  idmenu, positionNextMenu, idnextmen, t, s, selectElement, isAjax);   	
		
		if (requestURL == EMPTY_STRING){return;};
		
		type ="POST";
		async = true;		
		
		// Make the Request
		mymw.idMenu = idmenu;
		mymw.makeRequest(type,requestURL,mymw.successChangeMenuCallBack,mymw.errorChangeMenuCallBack,async);
    	}
    	
    	this.successChangeMenuCallBack =  function (){    	    	
    	    	
			var json = eval('('+mymw.http_request.responseText+')');
					
			// Show message		
			if (json._mymw_msg) {
			
				alert(json._mymw_msg);
				
			} else {		
			
				var pathServlet = json.pathServlet;
				var idChaninedMenu = json.idChaninedMenu;
				var positionNextMenu = json.positionNextMenu;			
				var idNextMenu = json.idNextMenu;			
				var isAjax = json.aj;
			
				var chaninedMenuNames = json.chaninedMenuNames;			
							
				if (getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style) {						
					getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style.display='none';
					getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style.visibility='hidden';
				}			
							
			// Delete all the nodes of elements that are not needed						
			for (var i=positionNextMenu; i<= chaninedMenuNames.length; i ++){
				var menuActual = chaninedMenuNames[i-1];
				var divBorrar = DIV_COMBO_AJAX_PREFIX + menuActual;
				if (getElementById(divBorrar).innerHTML != EMPTY_STRING){				
					getElementById(divBorrar).innerHTML = EMPTY_STRING;					
				}
				var titleBorrar = DIV_COMBO_TITLE_AJAX_PREFIX + menuActual;
				if (getElementById(titleBorrar)){
					if (getElementById(titleBorrar).innerHTML != EMPTY_STRING){
						getElementById(titleBorrar).innerHTML = EMPTY_STRING;
					}
				}
			}
						
			for (i=0; i< json.menus.length; i ++){
				
				var nameMenu = json.menus[i].name;
				var comboDiv = DIV_COMBO_AJAX_PREFIX + json.menus[i].name;				
				var nameMenuVal = json.menus[i].name + "_VAL";
				var menuTitle = json.menus[i].menuTitle;
				
				var titleDiv = DIV_COMBO_TITLE_AJAX_PREFIX + json.menus[i].name;
				if (getElementById(titleDiv)){
					var titleInnerHTML = [];
					titleInnerHTML.push("<b><font size='-1'>");
					titleInnerHTML.push(menuTitle);
					titleInnerHTML.push("</font></b>");
					getElementById(titleDiv).innerHTML = titleInnerHTML.join(EMPTY_STRING);
				}					
					
				var url_onChange = [];				
				if (isAjax){
					url_onChange.push("javascript:mymw.changeMenu('");
					url_onChange.push(pathServlet);
					url_onChange.push("','");
					url_onChange.push(idChaninedMenu);
					url_onChange.push("','");
					url_onChange.push(nameMenu);
					url_onChange.push("','");
					url_onChange.push(positionNextMenu);
					url_onChange.push("','");
					url_onChange.push(idNextMenu);
					url_onChange.push("',this,");
					url_onChange.push(isAjax);
					url_onChange.push(");");
				}
				else{
					url_onChange.push("javascript: var requestURL = mymw.makeURL('");
					url_onChange.push(pathServlet);
					url_onChange.push("','");
					url_onChange.push(idChaninedMenu);
					url_onChange.push("','");
					url_onChange.push(nameMenu);
					url_onChange.push("','");
					url_onChange.push(positionNextMenu);
					url_onChange.push("','");
					url_onChange.push(idNextMenu);
					url_onChange.push("',this,'");
					url_onChange.push(isAjax);
					url_onChange.push("'); window.location=requestURL");								
				}
				
				var optionSelect = [];
				
				optionSelect.push(EMPTY_STRING);				 
				if (json.menus[i].elements.length>1){
					optionSelect.push("<option value=''>");
					optionSelect.push(getMessage('MyMobileWeb_Choose_One'));
					optionSelect.push("</option>");
				}				
				
				var comboInnerHTML = [];
							
				comboInnerHTML.push("<select id=");
				comboInnerHTML.push(nameMenuVal);
				comboInnerHTML.push(" onChange=\"");
				comboInnerHTML.push(url_onChange.join(EMPTY_STRING));
				comboInnerHTML.push("\">");
				comboInnerHTML.push(optionSelect.join(EMPTY_STRING));
					
				for (var j=0; j < json.menus[i].elements.length; j ++){
					comboInnerHTML.push("<option value=");
					comboInnerHTML.push(json.menus[i].elements[j].value);
					comboInnerHTML.push(">");
					comboInnerHTML.push(json.menus[i].elements[j].label);
					comboInnerHTML.push("</option>");
				}	
				comboInnerHTML.push("</select>");				
				getElementById(comboDiv).innerHTML = comboInnerHTML.join(EMPTY_STRING);												
			}
			
			if (getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style){
				getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style.display=EMPTY_STRING;	
				getElementById(DIV_CHAINED_MENU_AJAX_PREFIX + idChaninedMenu).style.visibility='visible';
			}
			
			}

    	}    	
    	
    	
    	this.errorChangeMenuCallBack =  function (){
    		alert("errorChangeMenuCallBack");
    	}
    	    	
    	    	
    }
    
    
  
}
