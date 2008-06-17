package geobookmarks.event.addbookmark;

import geobookmarks.MyOAs;
import geobookmarks.MyOPs;
import geobookmarks.MyPresentations;

import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;


/* This file is autogenerate */
public class AddEventHandler {

	public void add_onsubmit(RequestData req, IActionExecutor act) throws Throwable {
		
		act.executeOA(MyOAs.ADDBOOKMARK, req);
		act.callOP(MyOPs.LISTBOOKMARKS, null, req);
		
	}

}