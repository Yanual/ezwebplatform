/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.morfeo.ezweb.benchmark;


public class UpdateVariableTransaction extends HttpPutTransaction {


   private int id;

   private static final String URL =
           "http://ezweb-test.hi.inet/workspace/3/variables";

   protected void setBody() {
      this.setBody("variables={" +
                   "\"igadgetVars\": [], " +
                    "\"workspaceVars\": [{\"" +
                    "id\": " + (22000 + (this.id * 10) + 0) + ", \"value\": \"INTERNET\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 1) + ", \"value\": \"917294723\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 2) + ", \"value\": \"Francisco Silvela, 105, 5 B, Madrid\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 3) + ", \"value\": \"INTERNET\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 4) + ", \"value\": \"917294723\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 5) + ", \"value\": \"Francisco Silvela, 105, 5 B, Madrid\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 6) + ", \"value\": \"INTERNET\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 7) + ", \"value\": \"917294723\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 8) + ", \"value\": \"Francisco Silvela, 105, 5 B, Madrid\"}, {\"" +
                    "id\": " + (22000 + (this.id * 10) + 9) + ", \"value\": \"device4\"}]}");

   }

   public UpdateVariableTransaction(int id) {
         super(URL, "");
         this.id = id;
         this.setBody();
   }

   public UpdateVariableTransaction(int id, long thinktime) {
         super(URL, "", thinktime);
         this.id = id;
         this.setBody();
   }

   public UpdateVariableTransaction(int id, int loops) {
         super(URL, "", loops);
         this.id = id;
         this.setBody();
   }

   public UpdateVariableTransaction(int id, long thinktime, int loops) {
         super(URL, "", thinktime, loops);
         this.id = id;
         this.setBody();
   }

}
