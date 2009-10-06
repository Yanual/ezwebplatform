package org.morfeo.ezweb.benchmark;

import java.util.Calendar;

public class Main {

   private static final boolean DEBUG = false;
   private static final long THINK_TIME = 5000;
   private static int NCLIENTS = 4;
   private static long NSAMPLES = 0;
   private static long SAMPLE_TIME = 5000;
   private static int CLI_INC = 5;
   private static long START_TIME_STEP = 400;

   public static void usage(String error) {
      if (error != null)
         System.err.println("Error: " + error);
      System.err.println("Usage: EzwebBenchmarks <nthreads> <stime> <nsamples>");
      System.err.println("");
      System.err.println("  <nthreads>   : number of client threads");
      System.err.println("  <stime>      : sampling time (milliseconds)");
      System.err.println("  <nsamples>   : number of samples (0 means forever)");
      System.err.println("");
      System.exit(-1);
   }

   public static void parseArgs(String[] args) {
      try {
         if (args.length != 3)
            usage("invalid argument count");
         else {
            NCLIENTS = Integer.parseInt(args[0]);
            SAMPLE_TIME = Integer.parseInt(args[1]);
            NSAMPLES = Integer.parseInt(args[2]);
         }
      } catch (NumberFormatException ex) {
         usage("non-numeric argument found");
      }
   }

   public static Client clientD01(int id) {
      HttpTransaction trans[] = {
         // Update variables for 20s
         new UpdateVariableTransaction(id, 5000, 4),
         // Load workspace and wait 4s
         new HttpTransactionSet(new HttpSingleTransaction[] {
            new HttpGetTransaction("http://ezweb-test.hi.inet/jsi18n/?language=es"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/user/benchmark/gadgets?stamp=1254391751847"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/workspaces?stamp=1254391752069"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/workspaces/5/last_user/?stamp=1254391752122"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Bandeja%20de%20Averias/1.01/xhtml?id=19"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Visor%20Datos%20de%20Usuario/1.01/xhtml?id=20"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Configuracion%20de%20Red/1.01/xhtml?id=21"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Visor%20Datos%20de%20Equipo/1.0/xhtml?id=22"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Map%20Viewer/1.6/xhtml?id=23"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Notepad/1.31/xhtml?id=25"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Todo%20list/2.66/xhtml?id=26"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Bandeja%20de%20Averias/1.01/xhtml?id=19"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Configuracion%20de%20Red/1.01/xhtml?id=21"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Visor%20Datos%20de%20Usuario/1.01/xhtml?id=20"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Visor%20Datos%20de%20Equipo/1.0/xhtml?id=22"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Notepad/1.31/xhtml?id=25"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Todo%20list/2.66/xhtml?id=26"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/gadgets/Morfeo/Map%20Viewer/1.6/xhtml?id=23"), }, 4000, 1),
         // Load 3 pages of catalog each 3s and wait 4s
         new HttpTransactionSet(new HttpSingleTransaction[] {
            new HttpGetTransaction("http://ezweb-test.hi.inet/user/benchmark/catalogue/resource/1/10?stamp=1254397060791&orderby=-popularity&search_boolean=AND", 4000, 1),
            new HttpGetTransaction("http://ezweb-test.hi.inet/ezweb/themes/default/images/button.gif"),
            new HttpGetTransaction("http://ezweb-test.hi.inet/ezweb/themes/default/images/catalogue/resource-left-fill.gif", 3000, 1), }, 4000, 3),
      };
      double probs[] = { 0.8, 0.1, 0.1 };
      return new RandomClient(id, trans, probs, DEBUG, THINK_TIME);
   }

   public static Client clientE01(int id) {
      HttpTransaction trans[] = {
         new ProxyRequestTransaction("http://www.adslzone.net/rss-noticias2.0.php", 2000),
         new ProxyRequestTransaction("http://www.elotrolado.net/feed.php?t=1", 2000),
         new ProxyRequestTransaction("http://blogs.elpais.com/espoiler/rss.xml", 2000),
         new ProxyRequestTransaction("http://fogonazos.blogspot.com/feeds/posts/default", 2000),
         new ProxyRequestTransaction("http://www.elpais.com/rss/feed.html?feedId=17056", 2000),
         new ProxyRequestTransaction("http://www.microsiervos.com/index.xml", 2000),
         new ProxyRequestTransaction("http://www.xataka.com/index.xml", 2000),
         new ProxyRequestTransaction("http://rss.elmundo.es/rss/descarga.htm?data2=4", 2000),
         new ProxyRequestTransaction("http://www.elpais.com/rss.html", 2000),
         new ProxyRequestTransaction("http://barrapunto.com/index.rss ", 2000),
         new ProxyRequestTransaction("http://gdata.youtube.com/feeds/api/videos?alt=rss&vq=ezweb", 2000),
         new ProxyRequestTransaction("http://api.flickr.com/services/feeds/photos_public.gne?tags=funny&lang=en-us&format=rss_200", 2000),
         new ProxyRequestTransaction("http://xoap.weather.com/weather/local/SPXX0050?cc=*&dayf=5&link=xoap&prod=xoap&par=1066087041&key=386454829f52bb7f&unit=m", 2000),
         new ProxyRequestTransaction("http://mini.wordreference.com/mini/index.aspx?dict=enes&w=house", 2000),
         new ProxyRequestTransaction("http://buscon.rae.es/draeI/SrvltGUIBusUsual?TIPO_BUS=3&LEMA=casa", 2000),};
      double probs[] = { 0.05, 0.05, 0.10, 0.05, 0.10, 0.05, 0.10, 0.05, 0.10, 0.05, 0.05, 0.05, 0.05, 0.10, 0.05 };
      return new RandomClient(id, trans, probs, DEBUG, THINK_TIME);
   }

   public static void main(String[] args) {
      try {
         int tindex = 0;
         parseArgs(args);

         System.err.print("Launching and login threads... ");
         Client []threads = new Client[NCLIENTS];
         for (int i = 0; i < NCLIENTS; i++) {
            threads[i] = clientE01(i);
         }
         System.err.println("Done");
         long t0 = Calendar.getInstance().getTimeInMillis();

         System.err.println("Time\tCli\tReq\tSucc.\tFailed\tReq/s\tResp. T(ms)");
         int sample = 0;
         while (true) {
            long st0 = Calendar.getInstance().getTimeInMillis();
            if (tindex < NCLIENTS) {
               for (int i = tindex; i < tindex + CLI_INC; i++) {
                  threads[i].start();
                  Thread.sleep(START_TIME_STEP);
               }
               tindex += CLI_INC;
            }
            long st1 = Calendar.getInstance().getTimeInMillis();

            Thread.sleep(SAMPLE_TIME - (st1 - st0));

            long now = Calendar.getInstance().getTimeInMillis();
            Stats []stats = new Stats[tindex];

            for (int i = 0; i < tindex; i++) {
               stats[i] = threads[i].getStats();
               stats[i].close();
               threads[i].resetStats();
            }

            Stats mstats = Stats.merge(stats);

            System.out.println("" +
                    ((now - t0) / 1000.0f) + "\t" +
                    tindex + "\t" +
                    mstats.numreq + "\t" +
                    mstats.success + "\t" +
                    mstats.failed + "\t" +
                    mstats.reqflow + "\t" +
                    mstats.reptime);
            sample++;
            if (NSAMPLES > 0 && sample >= NSAMPLES)
               break;
         }

         for (Client thr : threads)
            thr.finish();
         for (Client thr : threads)
            thr.join();
      } catch (Exception ex) {
         System.err.println(ex);
         ex.printStackTrace();
      }
   }

}
