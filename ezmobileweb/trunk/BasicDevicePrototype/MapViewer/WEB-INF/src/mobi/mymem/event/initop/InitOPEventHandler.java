package mobi.mymem.event.initop;

import ezWebAPI.EzWebAPI;
import mobi.mymem.MyContextVariables;
import mobi.mymem.MyOPs;
import mobi.mymem.MyPresentations;
import mobi.mymem.MyUtils;

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
	//clean previous maps data (latitude, longitude, zoom)
	MyUtils.removeContextImage(req.getContext());
	//call to the main OP
	act.callOP(MyOPs.CONTACTS, null, req);
 }

}