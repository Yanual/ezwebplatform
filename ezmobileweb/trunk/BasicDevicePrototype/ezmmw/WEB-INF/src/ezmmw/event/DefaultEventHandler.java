package ezmmw.event;

import ezmmw.Constants;
import ezmmw.MyContextVariables;
import ezmmw.MyOPs;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

/* This file is autogenerate */
public class DefaultEventHandler {


public void lindex_onclick(RequestData req, IActionExecutor act) 
 throws Throwable {
	// EzWeb logout
	HttpClient client = (HttpClient) req.getContext().getElement("HttpClient");
	GetMethod logout = new GetMethod(Constants.EZWEB_LOGOUT_URL);
	client.executeMethod(logout);
	
	// To destroy HttpClient from the context
	req.getContext().removeElement(MyContextVariables.HTTP_CLIENT);
	req.getContext().removeElement(MyContextVariables.USER);
	
	// MyMobileWeb logout
	act.callOP(MyOPs.LOGIN, null, req);
 }

public void lback_onclick(RequestData req, IActionExecutor act) 
 throws Throwable {
 }

}