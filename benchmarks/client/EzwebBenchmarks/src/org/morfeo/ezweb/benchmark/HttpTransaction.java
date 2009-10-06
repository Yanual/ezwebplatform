package org.morfeo.ezweb.benchmark;

import java.io.IOException;
import org.apache.http.client.HttpClient;


public abstract class HttpTransaction {

   private ThinkTime thinktime;
   private int loops;

   public HttpTransaction(ThinkTime thinktime, int loops) {
      this.thinktime = thinktime;
      this.loops = loops;
   }

   public ThinkTime getThinkTime() { return this.thinktime; }

   public int getLoops() { return this.loops; }

   public abstract void execute(HttpClient cli, Stats st) throws IOException;

}
