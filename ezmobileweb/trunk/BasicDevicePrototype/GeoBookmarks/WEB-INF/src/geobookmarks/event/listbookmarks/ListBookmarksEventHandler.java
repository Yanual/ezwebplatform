package geobookmarks.event.listbookmarks;

import ezWebAPI.EzWebAPI;
import geobookmarks.MyContextVariables;
import geobookmarks.MyPresentations;
import geobookmarks.MyOAs;

import geobookmarks.Constants;

import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.context.ContextScopes;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

/* This file is autogenerate */
public class ListBookmarksEventHandler {


public void onInitOP(RequestData req, IActionExecutor act) throws Throwable {
	Context the_context = req.getContext(); 
	EzWebAPI API = null;

	try{
		API = (EzWebAPI) the_context.getElement("EzWebAPI");
		
		act.executeOA(MyOAs.GENERATEBOOKMARKSLIST, req);		
		// set the back link href
		the_context.setElement(MyContextVariables.PLATFORM, Constants.PLATFORM, ContextScopes.APPLICATION_SCOPE);		
		act.navigate(MyPresentations.LISTBOOKMARKS_LIST, req);
	}
	catch (Exception e){
		//API not found
		//show error message
		System.out.println("Authentication error");
	}
 }

}