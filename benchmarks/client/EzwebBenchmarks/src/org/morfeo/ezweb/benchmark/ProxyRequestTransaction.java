package org.morfeo.ezweb.benchmark;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;


public class ProxyRequestTransaction extends HttpSingleTransaction {

   private static final String PROXY_URL =
           "http://ezweb-test.hi.inet/proxy";

   public ProxyRequestTransaction(String url, long thinktime) {
      super(new HttpPost(PROXY_URL), thinktime);
      try {
         HttpPost req = (HttpPost) this.getRequest();
         List<NameValuePair> nvps = new ArrayList<NameValuePair>();
         nvps.add(new BasicNameValuePair("method", "GET"));
         nvps.add(new BasicNameValuePair("url", url));
         req.setEntity(new UrlEncodedFormEntity(nvps, HTTP.UTF_8));
      } catch (UnsupportedEncodingException ex) {
      }
   }

}
