package org.morfeo.ezweb.benchmark;

import java.io.IOException;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

public class HttpSingleTransaction extends HttpTransaction {

   private HttpUriRequest req;

   public HttpSingleTransaction(HttpUriRequest req) {
      super(null, 1);
      this.req = req;
   }

   public HttpSingleTransaction(HttpUriRequest req, long thinktime) {
      super(new ThinkTime(thinktime), 1);
      this.req = req;
   }

   public HttpSingleTransaction(HttpUriRequest req, int loops) {
      super(null, loops);
      this.req = req;
   }

   public HttpSingleTransaction(HttpUriRequest req, long thinktime, int loops) {
      super(new ThinkTime(thinktime), loops);
      this.req = req;
   }

   public HttpUriRequest getRequest() { return this.req; }

   public void execute(HttpClient cli, Stats st) throws IOException {
      try {
         for (int i = 0; i < this.getLoops(); i++) {
            long tt1 = Calendar.getInstance().getTimeInMillis();
            HttpResponse rep = cli.execute(this.req);
            long tt2 = Calendar.getInstance().getTimeInMillis();
            st.numreq++;
            if (rep.getStatusLine().getStatusCode() == 200 ||
                    rep.getStatusLine().getStatusCode() == 301) {
               st.success++;
            } else {
               st.failed++;
            }
            st.reptime += (tt2 - tt1);
            HttpEntity ent = rep.getEntity();
            if (ent != null) {
               ent.consumeContent();
            }
            ThinkTime tt = this.getThinkTime();
            if (tt != null) {
               Thread.sleep(tt.random(0.25f));
            }
         }
      } catch (InterruptedException ex) {
      }

   }

}
