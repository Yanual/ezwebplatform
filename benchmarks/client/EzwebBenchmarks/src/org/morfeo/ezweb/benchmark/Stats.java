/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;

import java.util.Calendar;


public class Stats {
   public int numreq;
   public int success;
   public int failed;
   public float reqflow;
   public long start;
   public float reptime;

   public Stats(long start) {
      this.numreq = 0;
      this.success = 0;
      this.failed = 0;
      this.reqflow = 0.0f;
      this.start = start;
      this.reptime = 0.0f;
   }

   public void close() {
      long now = Calendar.getInstance().getTimeInMillis();
      this.reqflow = ((float) this.numreq) / ((float) (now - this.start)) * 1000.0f;
      if (numreq == 0)
         this.reptime = 0.0f;
      else
         this.reptime /= this.numreq;
   }

   public static Stats merge(Stats []stats) {
      Stats r = new Stats(0);

      for (Stats st : stats) {
         r.numreq += st.numreq;
         r.success += st.success;
         r.failed += st.failed;
         r.reqflow += st.reqflow;
         r.reptime += st.reptime;
      }
      r.reptime /= stats.length;

      return r;
   }
}


