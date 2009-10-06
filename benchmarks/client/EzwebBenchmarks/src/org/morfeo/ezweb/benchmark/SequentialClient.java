package org.morfeo.ezweb.benchmark;

import java.util.Calendar;

public class SequentialClient extends Client {

   public SequentialClient(int id, HttpTransaction trans[], boolean debug, long thinktime) {
      super(id, trans, debug, thinktime);
   }

   @Override
   public void run() {
      try {
         while (!this.stop_mark) {
            for (HttpTransaction tran : this.trans) {
               tran.execute(this.cli, this.stats);
            }
            Thread.sleep(this.thinktime.random(0.25f));
         }

         cli.getConnectionManager().shutdown();
      } catch (Exception ex) {
         System.err.println("Error: client thread dies; " + ex);
         ex.printStackTrace();
      }
   }

}
