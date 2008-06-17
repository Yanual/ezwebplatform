package geobookmarks.event.initop;

import ezWebAPI.EzWebAPI;
import geobookmarks.MyContextVariables;
import geobookmarks.MyPresentations;
import geobookmarks.MyOPs;

import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

/* This file is autogenerate */
public class InitOPEventHandler {


public void onInitOP(RequestData req, IActionExecutor act) throws Throwable {
	EzWebAPI API = new EzWebAPI(req);
	Context the_context = req.getContext();
	if ((Boolean) the_context.getElement(EzWebAPI.ERROR) == false){	
		the_context.setElement(MyContextVariables.EZWEBAPI, API, Context.SESSION_SCOPE);
	}
	act.callOP(MyOPs.LISTBOOKMARKS, null, req);
 }

}