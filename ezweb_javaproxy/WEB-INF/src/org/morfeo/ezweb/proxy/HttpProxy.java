package org.morfeo.ezweb.proxy;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.log4j.Logger;


public class HttpProxy extends HttpServlet {
	
	/**
	 * Generated serialVersionUID
	 */
	private static final long serialVersionUID = 4238680006739516442L;
	
	protected Logger log=Logger.getLogger(this.getClass());
	
	public void doGet(HttpServletRequest req, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		String title = "Simple Get Example";
		out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">" +
				"<HTML>" +
				"<HEAD><TITLE>" + title + "</TITLE>" + 
				"</HEAD>" +
		        "<BODY BGCOLOR=\"#FDF5E6\">\n" +
		        "<H3 ALIGN=CENTER>Hello World!!!</H3>\n");
		out.println("</BODY></HTML>");
		out.close();
	}
	
	
	@SuppressWarnings("unchecked")
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
		throws ServletException, IOException {
	
		String url = request.getParameter("url");
		String method = request.getParameter("method");
		String params = request.getParameter("params");
		String requestHeaders = request.getParameter("headers");
			
		//JSONObject object = new JSONObject()
		
		NameValuePair[] postNameValuePairs = extractNameValueParams(params);
		NameValuePair[] requestHeaderNameValuePairs = extractNameValueParams(requestHeaders);
		
		if (requestHeaderNameValuePairs.length == 0) {
			// If there are no request headers, add the EzWeb 'standards': User-Agent, Via and propagate Cookies
			requestHeaderNameValuePairs = new NameValuePair[] {
					new NameValuePair("User-Agent", request.getHeader("User-Agent")),
					new NameValuePair("Via", "EzWeb-Proxy"),
					new NameValuePair("Cookie", request.getHeader("Cookie")),
					};	

		}
		
		// Content Type
		String contentType = request.getContentType();
		
		//Add Content-Type (Servlets bug)
        if ((method.equalsIgnoreCase("POST") || method.equalsIgnoreCase("PUT"))) {
        	if (contentType == null || contentType.equals("")) { 
        		contentType = "application/x-www-form-urlencoded";
        	}
		} else {
			// Peticiones GET o DELETE no llevan Content-Type
			contentType = "";
		}
		
		HttpMethod responseMethod;	
		
		HashMap<String, Header> responseHeaders = new HashMap<String, Header>();
		
		if (method != null) {
			if (method.equalsIgnoreCase("GET")) {
				responseMethod = Invoker.getInstance().invokeGET(url, method, requestHeaderNameValuePairs, null, null, contentType, 60000, responseHeaders);
			} else if (method.equalsIgnoreCase("POST")) {
				responseMethod = Invoker.getInstance().invokePOST(url, method, postNameValuePairs,
						requestHeaderNameValuePairs, null, null, null,
			        	contentType, 60000, responseHeaders);
			} else if (method.equalsIgnoreCase("PUT")) {
				responseMethod = Invoker.getInstance().invokePUT(url, method, postNameValuePairs,
						requestHeaderNameValuePairs, null, null, null,
			        	contentType, 60000, responseHeaders);
			} else if (method.equalsIgnoreCase("DELETE")) {
				responseMethod = Invoker.getInstance().invokeDELETE(url, method, requestHeaderNameValuePairs, null, null, contentType, 60000, responseHeaders);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Method: " + method + " is not allowed");
				return;
			}
			
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No method received");
			return;
		}
		
		// Add all the headers recieved to the response (including Content-Type)
		for (Iterator iterator = responseHeaders.keySet().iterator(); iterator.hasNext();) {
			String key = (String) iterator.next();
			
			response.setHeader(key, responseHeaders.get(key).getValue());
		}
		
		// Set status code to the response
		response.setStatus(responseMethod.getStatusCode());
		
		InputStream in = responseMethod.getResponseBodyAsStream();
		OutputStream out = response.getOutputStream();
		
		org.apache.commons.io.IOUtils.copy(in, out);
		in.close();
		out.flush();
		out.close();

	}
	
	@SuppressWarnings("unchecked")
	private NameValuePair[] extractNameValueParams (String params) throws UnsupportedEncodingException { 
		NameValuePair[] nameValuePairs;
		
		if (params == null || params.equals("")) {
			return new NameValuePair[0];
		}
		
		try {
			JSONObject jsonObject = JSONObject.fromObject(params);  
			nameValuePairs = new NameValuePair[jsonObject.size()];
			int i = 0;
			Iterator<String> iter = jsonObject.keys();
			for (; iter.hasNext();i++) {
				String key = (String) iter.next();
				String value = (String) jsonObject.get(key);
				nameValuePairs[i] = new NameValuePair(key, value);
			}
		} catch (Throwable je) {
			// Parseamos los parametros con el formato 'query'
			params = URLDecoder.decode(params, "UTF-8");
			String [] paramValue = params.split("&");
			
			nameValuePairs = new NameValuePair[paramValue.length];
			for (int j = 0; j<paramValue.length; j++) {
				String []param = paramValue[j].split("=");
				if (param.length == 2) {
					nameValuePairs[j] = new NameValuePair(param[0], param[1]);
				} else if (param.length == 1) {
					nameValuePairs[j] = new NameValuePair(param[0], ""); 
				}
			}
			
		}
		return nameValuePairs;
	}

}
