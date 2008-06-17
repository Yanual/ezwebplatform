package geobookmarks.event.listbookmarks;

import geobookmarks.MyOAs;
import geobookmarks.MyOPs;
import geobookmarks.MyPresentations;

import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;


/* This file is autogenerate */
public class ListEventHandler {

	public void add_bookmark_onclick(RequestData req, IActionExecutor act) throws Throwable {
		act.callOP(MyOPs.ADDBOOKMARK, null, req);
	}
	
	public void bookmarks_list_onclick(RequestData req, IActionExecutor act) throws Throwable {
			
		act.executeOA(MyOAs.SETLOCATION, req);
		act.navigate(MyPresentations.LISTBOOKMARKS_LIST, req);
		
	}

}