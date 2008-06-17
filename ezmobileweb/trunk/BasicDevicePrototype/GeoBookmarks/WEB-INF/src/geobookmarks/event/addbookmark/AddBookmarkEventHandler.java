package geobookmarks.event.addbookmark;

import geobookmarks.MyPresentations;
import geobookmarks.MyOPs;
import geobookmarks.MyOAs;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

/* This file is autogenerate */
public class AddBookmarkEventHandler {


	public void onInitOP(RequestData req, IActionExecutor act) throws Throwable {
		act.executeOA(MyOAs.GETADDGADGETDATA, req);
		act.navigate(MyPresentations.ADDBOOKMARK_ADD, req);
	}

	public void lback_onclick(RequestData req, IActionExecutor act) throws Throwable {
		
		act.callOP(MyOPs.LISTBOOKMARKS, null, req);
	}

}