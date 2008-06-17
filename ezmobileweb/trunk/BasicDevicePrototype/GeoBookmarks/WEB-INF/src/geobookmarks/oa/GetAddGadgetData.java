package geobookmarks.oa;

import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezWebAPI.EzWebAPI;
import geobookmarks.MyContextVariables;

/* This file is autogenerate */
public class GetAddGadgetData extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	
	EzWebAPI API = (EzWebAPI) the_context.getElement(MyContextVariables.EZWEBAPI);
	
	the_context.setElement("bookmarkLocation", API.getValue("addressSlot"));
	the_context.setElement("bookmarkName", API.getValue("bookmarkName"));
 }

}