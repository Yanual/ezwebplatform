package org.morfeo.ezweb.benchmark;

import java.io.UnsupportedEncodingException;
import org.apache.http.client.methods.HttpEntityEnclosingRequestBase;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.protocol.HTTP;

public class HttpPostTransaction extends HttpSingleTransaction {

   protected void setBody(String body) {
      try {
         HttpEntityEnclosingRequestBase req =
                 (HttpEntityEnclosingRequestBase) this.getRequest();
         req.setEntity(new StringEntity(body, HTTP.UTF_8));
      } catch (UnsupportedEncodingException ex) {

      }
   }

   public HttpPostTransaction(String url, String body) {
      super(new HttpPut(url));
      this.setBody(body);
   }

   public HttpPostTransaction(String url, String body, long thinktime) {
      super(new HttpPut(url), thinktime);
      this.setBody(body);
   }

   public HttpPostTransaction(String url, String body, int loops) {
      super(new HttpPut(url), loops);
      this.setBody(body);
   }

   public HttpPostTransaction(String url, String body, long thinktime, int loops) {
      super(new HttpPut(url), thinktime, loops);
      this.setBody(body);
   }

}
