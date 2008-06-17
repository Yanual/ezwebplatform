package geobookmarks.oa;

import ezWebAPI.EzWebAPI;
import geobookmarks.MyContextVariables;

import java.util.HashMap;
import java.util.Vector;

import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

/* This file is autogenerate */
public class SetLocation extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	
	int idRow = ((Integer) the_context.getElement("idRow")).intValue();
	Vector bookmarks = (Vector) the_context.getElement(MyContextVariables.BOOKMARKS_LIST);
	HashMap bookmarkSelected = (HashMap) bookmarks.get(idRow);
	
	String location = (String) bookmarkSelected.get("bookmarkLocation");
	String type = (String) bookmarkSelected.get("bookmarkType");
	
	EzWebAPI API = (EzWebAPI) the_context.getElement(MyContextVariables.EZWEBAPI);
	
	//update the value in the ezweb backend
	if (type.compareTo("address")==0){
		API.setValue("addressEvent", location);
	}
	else{//utm
		API.setValue("utmCoordEvent", location);
	}
 }

}