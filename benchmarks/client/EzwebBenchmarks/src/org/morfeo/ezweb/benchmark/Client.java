/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.*;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.*;
import org.apache.http.impl.client.*;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.protocol.HTTP;

public class Client extends Thread {

   protected HttpClient cli;
   protected boolean stop_mark;
   protected Stats stats;
   protected boolean debug;
   protected ThinkTime thinktime;
   protected int id;
   protected HttpTransaction trans[];

   protected static String LOGIN_PAGE =
           "http://ezweb-test.hi.inet/";
   protected static String LOGIN_FORM =
           "http://ezweb-test.hi.inet/accounts/login/?next=/";

   public Client(int id, HttpTransaction trans[], boolean debug, long thinktime) {
      try {
         this.stop_mark = false;
         this.cli = open();
         this.debug = debug;
         this.thinktime = new ThinkTime(thinktime);
         this.stats = new Stats(Calendar.getInstance().getTimeInMillis());
         this.id = id;
         this.trans = trans;
      } catch (IOException ex) {
         System.err.println("Error: cannot login thread; " + ex.toString());
         ex.printStackTrace();
      }
   }

   public HttpClient open() throws IOException {
        BasicHttpParams par = new BasicHttpParams();
        par.setBooleanParameter(CoreProtocolPNames.USE_EXPECT_CONTINUE, false);
        DefaultHttpClient httpclient = new DefaultHttpClient(par);

        HttpGet httpget = new HttpGet(LOGIN_PAGE);

        HttpResponse response = httpclient.execute(httpget);
        HttpEntity entity = response.getEntity();

        if (entity != null) {
            entity.consumeContent();
        }

        HttpPost httpost = new HttpPost(LOGIN_FORM);

        List <NameValuePair> nvps = new ArrayList <NameValuePair>();
        nvps.add(new BasicNameValuePair("username", "benchmark"));
        nvps.add(new BasicNameValuePair("password", "pwd"));
        nvps.add(new BasicNameValuePair("this_is_the_login_form", "1"));
        nvps.add(new BasicNameValuePair("post_data", ""));

        httpost.setEntity(new UrlEncodedFormEntity(nvps, HTTP.UTF_8));

        response = httpclient.execute(httpost);
        entity = response.getEntity();

        if (entity != null) {
            entity.consumeContent();
        }

        return httpclient;
   }

   public void finish() {
      stop_mark = true;
   }

   public Stats getStats() {
      return this.stats;
   }

   public void resetStats() {
      this.stats = new Stats(Calendar.getInstance().getTimeInMillis());
   }

}
