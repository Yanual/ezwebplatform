package org.morfeo.ezweb.proxy;
/*
 * Creado el Jun 13, 2005
 *
 * CVS info:
 * $Id: Invoker.java 4 2009-01-22 12:30:30Z pjm $
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
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

    /** Variable <code>client</code> */
    private static Invoker invoker = null;
    
    protected Logger log=Logger.getLogger(this.getClass());

    /**
     * Constructor privado
     */
    private Invoker() {
        MultiThreadedHttpConnectionManager connectionManager
            = new MultiThreadedHttpConnectionManager();
        connectionManager.getParams().setDefaultMaxConnectionsPerHost(
                Integer.parseInt(MAX_CONNECTIONS_PER_HOST_DEF));
        connectionManager.getParams().setMaxTotalConnections(
                Integer.parseInt(MAX_TOTAL_CONNECTIONS_DEF));
        client = new HttpClient(connectionManager);
        Protocol easyhttps = new Protocol("https",
                (ProtocolSocketFactory) new EasySSLProtocolSocketFactory(),
                Integer.parseInt(DEF_SSL_PORT_DEF));
        Protocol.registerProtocol("https", easyhttps);
        // Set optional proxy
        
        try {
			Properties proxyProp = PropertiesUtils.instanceFromClasspath("proxy.properties",log);
		
			String proxyHost = proxyProp.getProperty("proxy.host");
			if (proxyHost != null && !proxyHost.equals("")) {
				int proxyPort = Integer.parseInt(proxyProp.getProperty("proxy.port","8080"));
				client.getHostConfiguration().setProxy(proxyHost, proxyPort);
				
				// Check if is an Authenticated Proxy
				String proxyUser = proxyProp.getProperty("proxy.user");
				String proxyPass = proxyProp.getProperty("proxy.pass");
				String proxyAuthType = proxyProp.getProperty("proxy.authentication_type");
				String proxyNtmlHost = proxyProp.getProperty("proxy.ntlm.host");
				String proxyNtmlDomain = proxyProp.getProperty("proxy.ntlm.domain");
							
				if (proxyUser != null && proxyPass != null) {
					UsernamePasswordCredentials usernamePasswordCredentials = null;
					if (proxyAuthType != null && proxyAuthType.equalsIgnoreCase("NTLM")) {
						usernamePasswordCredentials = new NTCredentials(proxyUser, proxyPass, proxyNtmlHost, proxyNtmlDomain);
					} else {
						usernamePasswordCredentials = new UsernamePasswordCredentials(proxyUser, proxyPass);
					}
					client.getState().setProxyCredentials(
							new AuthScope(proxyHost, proxyPort),
							usernamePasswordCredentials);
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
     * @param url
     *            Url a invocar
     * @param params
     *            Parametros de la Url
     * @param headers
     *            Headers de la request
     * @param user
     *            Usuario (si null, sin definir autenticacion)
     * @param password
     *            Clave
     * @param data
     *            Datos al inputStream de la request
     * @param content
     * 		      Content Type
     * @param timeout
     *            Tiempo de espera en milisegundos:
     *              - < 0: espera definida por omision
     *              - = 0: espera indefinida
     *              - > 0: valor indicado
     * @return Respuesta de la invocacion
     * @throws IOException
     *             IOException
     */
    public String invokeForString(String url, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password,  RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {

        PostMethod postM = invoke(url, params,
            	headers, user, password, requestEntityData,
            	content, timeout, responseHeaders);
        try {
        	InputStream in = postM.getResponseBodyAsStream();

            StringBuffer buff = new StringBuffer();
            if (in != null) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(in));

                int r = 0;
                while ((r = reader.read()) != -1) {
                    buff.append((char) r);
                }
                reader.close();
                return buff.toString();
            }
            return null;
        } finally {
            if (postM != null) {
                postM.releaseConnection();
            }
        }
    }

    /**
     * @param url
     *            Url a invocar, si null se utiliza el grupo como nombre de
     *            servicio del repositorio
     * @param params
     *            Parametros de la Url
     * @param headers
     *            Headers de la request
     * @param prop
     *            Properties Properties con la configuracion, soporta:
     *            invoker.{grupo}.timeout - < 0: espera definida por omision - =
     *            0: espera indefinida - > 0: valor indicado
     *            invoker.{grupo}.user invoker.{grupo}.passwd
     *            invoker.{grupo}.content-type
     * @param grupo
     *            String Clave de las properties Normalmente en nombre del
     *            respositorio
     * @param data
     *            Datos al inputStream de la request Si hay parametros debe ir a
     *            null
     * @return Respuesta de la invocacion (será necesario liberar la conexion
     *         con releaseConnection())
     * @throws IOException
     *             IOException
     */
    public PostMethod invoke(String url, NameValuePair[] params,
    	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
    	String content, int timeout, HashMap<String, Header> responseHeaders)
            throws IOException {

        PostMethod httpost = null;
        URI uri = new URI(url, false);
        httpost = new PostMethod(uri.getEscapedURI());
        httpost.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

        if (params != null) {
            httpost.addParameters(params);
        }

        if (content.length() > 0) {
            httpost.setRequestHeader("Content-type", content);
        }

        if (headers != null) {
            for (int i = 0; i < headers.length; i++) {
                httpost.setRequestHeader(headers[i].getName(), headers[i]
                        .getValue());
            }
        }

        HttpState state = client.getState();
        if (user != null && !user.equalsIgnoreCase("")) {
             Credentials defaultcreds = new UsernamePasswordCredentials(user,
                    password);
            state.setCredentials(
                    new AuthScope(uri.getHost(), uri.getPort(),
                            AuthScope.ANY_REALM), defaultcreds);
            client.getParams().setAuthenticationPreemptive(true);
        }

        HostConfiguration hostconfig = client.getHostConfiguration();
        hostconfig.setHost(uri.getHost(),
                uri.getPort());
        
        if (timeout >= 0) {
            httpost.getParams().setSoTimeout(timeout);
        }

        if (requestEntityData != null) {
             httpost.setRequestEntity(requestEntityData);
            //httpost.setRequestContentLength(data.length());
        }

        client.executeMethod(hostconfig, httpost, state);
        
        Header[] respHeaders = httpost.getResponseHeaders();
		for (int i = 0; i < respHeaders.length; i++) {
        	responseHeaders.put(respHeaders[i].getName(), respHeaders[i]);
		}
        
		log.debug("\"" + url + "\" " + httpost.getStatusLine());
		
        return httpost;
    }
    
    public GetMethod invokeGET(String url, String method,
        	NameValuePair[] headers, String user, String password,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (GetMethod) invokeForAjaxProxy (url, method, null, headers, user, password, null, content, timeout, responseHeaders);
    	
	}
    
    public PostMethod invokePOST(String url, String method, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (PostMethod) invokeForAjaxProxy (url, method, params, headers, user, password, requestEntityData, content, timeout, responseHeaders);
    	
	}
    
    public PostMethod invokePUT(String url, String method, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (PostMethod) invokeForAjaxProxy (url, method, params, headers, user, password, requestEntityData, content, timeout, responseHeaders);
    	
	}
    
    public GetMethod invokeDELETE(String url, String method,
        	NameValuePair[] headers, String user, String password,
        	String content, int timeout, HashMap<String, Header> responseHeaders) throws IOException {
    
    	return (GetMethod) invokeForAjaxProxy (url, method, null, headers, user, password, null, content, timeout, responseHeaders);
    	
	}
        
    private HttpMethod invokeForAjaxProxy(String url, String method, NameValuePair[] params,
        	NameValuePair[] headers, String user, String password, RequestEntity requestEntityData,
        	String content, int timeout, HashMap<String, Header> responseHeaders)
                throws IOException {

    		HttpMethod httpRequestMethod = getHttpMethod(url, method, params, requestEntityData);

    		URI uri = new URI(url, false);
            httpRequestMethod.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);

            if (content.length() > 0) {
                httpRequestMethod.setRequestHeader("Content-type", content);
            }

            if (headers != null) {
                for (int i = 0; i < headers.length; i++) {
                    httpRequestMethod.setRequestHeader(headers[i].getName(), headers[i].getValue());
                }
            }

            HttpState state = client.getState();
            if (user != null && !user.equalsIgnoreCase("")) {
            	Credentials defaultcreds = new UsernamePasswordCredentials(user, password);
                state.setCredentials(new AuthScope(uri.getHost(), uri.getPort(),
                                AuthScope.ANY_REALM), defaultcreds);
                client.getParams().setAuthenticationPreemptive(true);
            }

            HostConfiguration hostconfig = client.getHostConfiguration();
            hostconfig.setHost(uri.getHost(),
                    uri.getPort());
            
            if (timeout >= 0) {
                httpRequestMethod.getParams().setSoTimeout(timeout);
            }

            client.executeMethod(hostconfig, httpRequestMethod, state);
            
            Header[] respHeaders = httpRequestMethod.getResponseHeaders();
    		for (int i = 0; i < respHeaders.length; i++) {
            	responseHeaders.put(respHeaders[i].getName(), respHeaders[i]);
    		}
            
    		log.debug("\"" + url + "\" " + httpRequestMethod.getStatusLine());
    		
            return httpRequestMethod;
        }
    
    private HttpMethod getHttpMethod (String url, String method, NameValuePair[] params, RequestEntity requestEntityData) throws URIException, NullPointerException {
    	HttpMethod httpRequestMethod = null;
        URI uri = new URI(url, false);
        if (method.equalsIgnoreCase("GET")) {
           	httpRequestMethod = new GetMethod(uri.getEscapedURI());
        } else if (method.equalsIgnoreCase("POST")) {
           	httpRequestMethod = new PostMethod(uri.getEscapedURI());
        } else if (method.equalsIgnoreCase("PUT")) {
           	httpRequestMethod = new PutMethod(uri.getEscapedURI());
        } else if (method.equalsIgnoreCase("DELETE")) {
           	httpRequestMethod = new DeleteMethod(uri.getEscapedURI());
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