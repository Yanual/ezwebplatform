package org.morfeo.ezweb.benchmark;

import org.apache.http.client.methods.HttpGet;


public class HttpGetTransaction extends HttpSingleTransaction {

   public HttpGetTransaction(String url) {
      super(new HttpGet(url));
   }

   public HttpGetTransaction(String url, long thinktime) {
      super(new HttpGet(url), thinktime);
   }

   public HttpGetTransaction(String url, int loops) {
      super(new HttpGet(url), loops);
   }

   public HttpGetTransaction(String url, long thinktime, int loops) {
      super(new HttpGet(url), thinktime, loops);
   }


}
