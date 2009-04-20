package org.morfeo.ezweb.proxy;
/*
 * Creado el Jun 13, 2005
 *
 * CVS info:
 * $Id: Invoker.java 4 2009-01-22 12:30:30Z pjm $
 */
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HostConfiguration;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.NTCredentials;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.protocol.Protocol;
import org.apache.commons.httpclient.protocol.ProtocolSocketFactory;
import org.apache.log4j.Logger;

/**
 * @author fabio
 * @version 1.0
 *
 * Clase que provee mecanismos de invocacion de urls.
 */
public final class Invoker {

    /** Variable <code>DEF_SSL_PORT_DEF</code> */
    private static final String DEF_SSL_PORT_DEF = "443";

    /** Variable <code>MAX_CONNECTIONS_PER_HOST_DEF</code> */
    private static final String MAX_CONNECTIONS_PER_HOST_DEF = "40";

    /** Variable <code>MAX_TOTAL_CONECTIONS_DEF</code> */
    private static final String MAX_TOTAL_CONNECTIONS_DEF = "100";

    /** Variable <code>client</code> */
    private HttpClient client = null;

    /** Variable <code>invoker</code> */
    private static Invoker invoker = null;
    
    /** Variable <code>hostConfigWithProxy</code> */
    private static HostConfiguration hostConfigWithProxy = null;
    
    /** Variable <code>httpStateWithProxy</code> */
    private static HttpState httpStateWithProxy = null;
    
    /** Variable <code>proxyAuthScope</code> */
    private static AuthScope proxyAuthScope = null;
    
    /** Variable <code>hostconfig</code> */
    private static HostConfiguration hostConfig = null;
    
    /** Variable <code>nonProxyHosts</code> */
    private static List<String> nonProxyHosts = null;
    
    protected Logger log=Logger.getLogger(this.getClass());

    /**
     * Constructor privado
     */
    private Invoker() {
        MultiThreadedHttpConnectionManager connectionManager = new MultiThreadedHttpConnectionManager();
        connectionManager.getParams().setDefaultMaxConnectionsPerHost(Integer.parseInt(MAX_CONNECTIONS_PER_HOST_DEF));
        connectionManager.getParams().setMaxTotalConnections(Integer.parseInt(MAX_TOTAL_CONNECTIONS_DEF));
        client = new HttpClient(connectionManager);
        Protocol easyhttps = new Protocol("https",
                (ProtocolSocketFactory) new EasySSLProtocolSocketFactory(),
                Integer.parseInt(DEF_SSL_PORT_DEF));
        Protocol.registerProtocol("https", easyhttps);
        
        // Global non-proxy HostConfiguration
        hostConfig = client.getHostConfiguration();
        
     // Set optional proxy
        try {
			Properties proxyProp = PropertiesUtils.instanceFromClasspath("proxy.properties",log);
		
			String proxyHost = proxyProp.getProperty("proxy.host");
			if (proxyHost != null && !proxyHost.equals("")) {
				int proxyPort = Integer.parseInt(proxyProp.getProperty("proxy.port","8080"));
				hostConfigWithProxy = new HostConfiguration();
				hostConfigWithProxy.setProxy(proxyHost, proxyPort);
				
				// Check if is an Authenticated Proxy
				String proxyUser = proxyProp.getProperty("proxy.user");
				String proxyPass = proxyProp.getProperty("proxy.pass");
				String proxyAuthType = proxyProp.getProperty("proxy.authentication_type");
				String proxyNtmlHost = proxyProp.getProperty("proxy.ntlm.host");
				String proxyNtmlDomain = proxyProp.getProperty("proxy.ntlm.domain");
				
				String _nonProxyHosts = proxyProp.getProperty("proxy.nonProxyHosts");
				if (_nonProxyHosts != null) {
					// Remove white spaces and split hosts list into an array 
					String [] nonProxyHostsArray = _nonProxyHosts.replaceAll(" ", "").split(",");
					nonProxyHosts = Arrays.asList(nonProxyHostsArray);
				}
							
				if (proxyUser != null && proxyPass != null) {
					UsernamePasswordCredentials usernamePasswordCredentials = null;
					if (proxyAuthType != null && proxyAuthType.equalsIgnoreCase("NTLM")) {
						usernamePasswordCredentials = new NTCredentials(proxyUser, proxyPass, proxyNtmlHost, proxyNtmlDomain);
					} else {
						usernamePasswordCredentials = new UsernamePasswordCredentials(proxyUser, proxyPass);
					}
					httpStateWithProxy = new HttpState();
					proxyAuthScope = new AuthScope(proxyHost, proxyPort);
					httpStateWithProxy.setProxyCredentials(proxyAuthScope, usernamePasswordCredentials);
				} 
			}
        } catch (Exception e) {
			log.error("Properties file not found!!!");
		}
    }

    /**
     * @return Unica instancia de Invoker
     */
    public static synchronized Invoker getInstance() {
        if (invoker == null) {
            invoker = new Invoker();
        }
        return invoker;
    }

    /**
     * No se permite la clonacion de este objeto.
     *
     * @see java.lang.Object#clone()
     */
    public Object clone() throws CloneNotSupportedException {
      throw new CloneNotSupportedException();
    }

    /**
     * @param url Url a invocar
     * @param headers Headers de la request
     * @param user Usuario (si null, sin definir autenticacion)
     * @param password Clave
     * @param content Content Type de la request
     * @param timeout
     *            Tiempo de espera en milisegundos:
     *              - < 0: espera definida por omision
     *              - = 0: espera indefinida
     *              - > 0: valor indicado
     * @return Respuesta de la invocacion
     * @throws IOException
     *             IOException
     */
    public GetMethod invokeGET(String url,
        	NameValuePair[] headers, String user, String password,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (GetMethod) invokeForAjaxProxy (url, "GET", null, headers, user, password, null, content, timeout, responseHeaders);
    	
	}
    
    public PostMethod invokePOST(String url, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (PostMethod) invokeForAjaxProxy (url, "POST", params, headers, user, password, requestEntityData, content, timeout, responseHeaders);
    	
	}
    
    public PostMethod invokePUT(String url, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (PostMethod) invokeForAjaxProxy (url, "PUT", params, headers, user, password, requestEntityData, content, timeout, responseHeaders);
    	
	}
    
    public GetMethod invokeDELETE(String url,
        	NameValuePair[] headers, String user, String password,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (GetMethod) invokeForAjaxProxy (url, "DELETE", null, headers, user, password, null, content, timeout, responseHeaders);
    	
	}
        
    private HttpMethod invokeForAjaxProxy(String url, String method, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders)
                throws IOException {

		HttpMethod requestHttpMethod = getHttpMethod(url, method, params, requestEntityData);

		URI uri = new URI(url, false);
        requestHttpMethod.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

        if (content.length() > 0) {
            requestHttpMethod.setRequestHeader("Content-type", content);
        }

        if (headers != null) {
            for (int i = 0; i < headers.length; i++) {
                requestHttpMethod.setRequestHeader(headers[i].getName(), headers[i].getValue());
            }
        }

        
        HttpState requestState = null; //client.getState();
        HostConfiguration requestHostConfig = null;
        Credentials requestCredentials = null;
        if (user != null && !user.equalsIgnoreCase("")) {
        	requestCredentials = new UsernamePasswordCredentials(user, password);
        }
        if (hostConfigWithProxy == null || nonProxyHosts.contains(uri.getHost())) {
        	// NO Proxy or host in nonProxyHosts list
        	requestState = new HttpState();
        	requestHostConfig = (HostConfiguration) hostConfig.clone();
        } else {
        	// Proxy
        	requestState = new HttpState();
        	requestHostConfig = (HostConfiguration) hostConfigWithProxy.clone();
        	if (httpStateWithProxy != null && proxyAuthScope != null) {
        		// Authenticated Proxy
        		requestState.setProxyCredentials(proxyAuthScope, httpStateWithProxy.getProxyCredentials(proxyAuthScope));
        	}
        }
        
        if (requestCredentials != null) {
    		// Set Request Authentication
    		requestState.setCredentials(
    				new AuthScope(uri.getHost(), uri.getPort(), AuthScope.ANY_REALM),
    				requestCredentials);
    		client.getParams().setAuthenticationPreemptive(true);
    	}            

        //HostConfiguration hostconfig = client.getHostConfiguration();
        requestHostConfig.setHost(uri.getHost(), uri.getPort());
        
        if (timeout >= 0) {
            requestHttpMethod.getParams().setSoTimeout(timeout);
        }

        client.executeMethod(requestHostConfig, requestHttpMethod, requestState);
        
        Header[] respHeaders = requestHttpMethod.getResponseHeaders();
		for (int i = 0; i < respHeaders.length; i++) {
        	responseHeaders.put(respHeaders[i].getName(), respHeaders[i]);
		}
        
		log.debug("\"" + url + "\" " + requestHttpMethod.getStatusLine());
		
        return requestHttpMethod;
    }
    
    private HttpMethod getHttpMethod (String url, String method, NameValuePair[] params, RequestEntity requestEntityData) throws URIException, NullPointerException {
    	HttpMethod httpRequestMethod = null;
        URI uri = new URI(url, false);
        if (method.equalsIgnoreCase("GET")) {
           	httpRequestMethod = new GetMethod(uri.getURI());
        } else if (method.equalsIgnoreCase("POST")) {
           	httpRequestMethod = new PostMethod(uri.getURI());
        } else if (method.equalsIgnoreCase("PUT")) {
           	httpRequestMethod = new PutMethod(uri.getURI());
        } else if (method.equalsIgnoreCase("DELETE")) {
           	httpRequestMethod = new DeleteMethod(uri.getURI());
        } 
        
        if (method.equalsIgnoreCase("POST") || method.equalsIgnoreCase("PUT")) {
        	if (params != null) {
        		((PostMethod)httpRequestMethod).addParameters(params);
        	}
        
        	if (requestEntityData != null) {
        		((PostMethod)httpRequestMethod).setRequestEntity(requestEntityData);
        	}
        }
        
        return httpRequestMethod;
        
    }
    
    
    
    
}