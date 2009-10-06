/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;

import java.io.IOException;
import org.apache.http.client.HttpClient;


public class HttpTransactionSet extends HttpTransaction {

   private HttpSingleTransaction trans[];

   public HttpTransactionSet(HttpSingleTransaction []trans) {
      super(null, 1);
      this.trans = trans;
   }

   public HttpTransactionSet(HttpSingleTransaction []trans, long thinktime) {
      super(new ThinkTime(thinktime), 1);
      this.trans = trans;
   }

   public HttpTransactionSet(HttpSingleTransaction []trans, int loops) {
      super(null, loops);
      this.trans = trans;
   }

   public HttpTransactionSet(HttpSingleTransaction []trans, long thinktime, int loops) {
      super(new ThinkTime(thinktime), loops);
      this.trans = trans;
   }

   @Override
   public void execute(HttpClient cli, Stats st) throws IOException {
      try {
         for (int i = 0; i < this.getLoops(); i++) {
            for (HttpSingleTransaction t : trans) {
               t.execute(cli, st);
            }
         }
         ThinkTime tt = this.getThinkTime();
         if (tt != null) {
            Thread.sleep(tt.random(0.25f));
         }
      } catch (InterruptedException ex) {
      }
   }

}
