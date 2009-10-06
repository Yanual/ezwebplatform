/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;


public class RandomClient extends Client {

   private double []prob;

   public RandomClient(
           int id,
           HttpTransaction trans[],
           double prob[],
           boolean debug,
           long thinktime) {
      super(id, trans, debug, thinktime);
      this.prob = prob;
   }

   @Override
   public void run() {
      try {
         while (!this.stop_mark) {
            double val = Math.random();
            double acum = 0.0;
            HttpTransaction tran = null;
            for (int i = 0; i < this.trans.length; i++) {
               if (val < (acum + this.prob[i])) {
                  tran = this.trans[i];
                  break;
               }
               acum += this.prob[i];
            }
            tran.execute(this.cli, this.stats);
            
            // Thread.sleep(this.thinktime.random(0.25f));
         }
         cli.getConnectionManager().shutdown();
      } catch (java.lang.ArrayIndexOutOfBoundsException ex) {
         System.err.println("Error: client thread dies; " + ex);
         ex.printStackTrace();
      } catch (Exception ex) {
         System.err.println("Error: client thread dies; " + ex);
         ex.printStackTrace();
      }
   }

}
