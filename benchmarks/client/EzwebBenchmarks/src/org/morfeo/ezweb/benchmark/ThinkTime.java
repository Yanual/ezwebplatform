/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;


public class ThinkTime {

   private long time;

   public ThinkTime(long time) {
      this.time = time;
   }

   public long random(float var) {
      double tt = this.time  +
                  this.time * ((Math.random() * var * 2.0f) - var);
      return (long) tt;
      
   }

}
