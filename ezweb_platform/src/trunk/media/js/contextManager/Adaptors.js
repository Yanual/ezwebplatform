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

/**
 * @author luismarcos.ayllon
 */
function UserAdaptador(param) {

	function _onSuccess(receivedData) {
		var usernameJson = eval ('(' + receivedData.responseText + ')');
		var value = usernameJson.username;
		ContextManagerFactory.getInstance().setConceptValue(UserAdaptador.prototype.CONCEPT, value)
	}

	function _onError(transport, e) {
		var msg;
		if (e)
			msg = e;
		else
			msg = transport.status + " " + transport.statusText;
		alert ("Error getting concept " + UserAdaptador.prototype.CONCEPT + ":"+ msg);
	}
	
	var uri = URIs.GET_CONTEXT.evaluate({concept: UserAdaptador.prototype.CONCEPT});
	PersistenceEngineFactory.getInstance().send_get(uri , this, _onSuccess, _onError);			
	
}

UserAdaptador.prototype.CONCEPT = 'username'

function WidthAdaptador(gadgetID) {

	function _onSuccess(receivedData) {
		var json = eval ('(' + receivedData.responseText + ')');
		var value = json.width;
		ContextManagerFactory.getInstance().setConceptValue(WidthAdaptador.prototype.CONCEPT, value)
	}

	function _onError(transport, e) {
		var msg;
		if (e)
			msg = e;
		else
			msg = transport.status + " " + transport.statusText;
		alert ("Error getting concept " + WidthAdaptador.prototype.CONCEPT + ":"+ msg);
	}
	
	uri = URIs.GET_IGADGET.evaluate({id: gadgetID});
	PersistenceEngineFactory.getInstance().send_get(uri , this, _onSuccess, _onError);			
	
}

WidthAdaptador.prototype.CONCEPT = 'width'


function HighAdaptador(gadgetID) {

	function _onSuccess(receivedData) {
		var json = eval ('(' + receivedData.responseText + ')');
		var value = json.height;
		ContextManagerFactory.getInstance().setConceptValue(HighAdaptador.prototype.CONCEPT, value)
	}

	function _onError(transport, e) {
		var msg;
		if (e)
			msg = e;
		else
			msg = transport.status + " " + transport.statusText;
		alert ("Error getting concept " + HighAdaptador.prototype.CONCEPT + ":"+ msg);
	}
	
	uri = URIs.GET_IGADGET.evaluate({id: gadgetID});
	PersistenceEngineFactory.getInstance().send_get(uri , this, _onSuccess, _onError);			
	
}

HighAdaptador.prototype.CONCEPT = 'high'



