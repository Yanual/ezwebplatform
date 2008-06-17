package ezmmw.oa;

import ezmmw.MyContextVariables;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezmmw.Constants;

/* This file is autogenerate */
public class Authenticate extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	GetMethod authget = null;
	PostMethod authpost =  null;
	
	try{
		HttpClient client = new HttpClient();
		client.getHostConfiguration().setHost(Constants.EZWEB_HOST, Constants.EZWEB_PORT, "http");
	
		client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
		
		// Get the login page -> init the session
		authget = new GetMethod("/");
		int status = client.executeMethod(authget);		
		
		// Do the authentication
		authpost = new PostMethod(Constants.EZWEB_LOGIN_URL);	    
	    // Prepare login parameters
	    NameValuePair userName   = new NameValuePair("username", the_context.getElement(MyContextVariables.USER).toString());
	    NameValuePair password = new NameValuePair("password", the_context.getElement("password").toString());
	    NameValuePair loginForm = new NameValuePair("this_is_the_login_form", "1");
	    NameValuePair postData = new NameValuePair("post_data", "");
	    authpost.setRequestBody(
	    new NameValuePair[] {userName, password, loginForm, postData});
	    
	    // execute the POST
	    status = client.executeMethod(authpost);
	    if (status == 302){
	    	the_context.setSessionElement(MyContextVariables.HTTP_CLIENT, client);
	    }else{
	    	the_context.setSessionElement(MyContextVariables.HTTP_CLIENT, null);
	    }
	}catch(Exception e){
		e.printStackTrace();
	}
	finally{
		if (authget!=null)
			authget.releaseConnection();
		if (authpost!=null)
			authpost.releaseConnection();
	}
 }

}