package geobookmarks.oa;

import org.json.JSONArray;
import org.json.JSONObject;
import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezWebAPI.EzWebAPI;
import geobookmarks.MyContextVariables;

/* This file is autogenerate */
public class AddBookmark extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	EzWebAPI API = (EzWebAPI) the_context.getElement(MyContextVariables.EZWEBAPI);
	String bookmarksPlain = API.getValue("geobookmarks");
	JSONArray bookmarks =  null;
	try{
		if (bookmarksPlain != null && bookmarksPlain.length()>0)
			bookmarks= new JSONArray(bookmarksPlain);
		else
			bookmarks= new JSONArray();
		JSONObject newBookmark = new JSONObject();
		newBookmark.put("elementName", the_context.getElement("bookmarkName").toString());
		newBookmark.put("location", the_context.getElement("bookmarkLocation").toString());
		newBookmark.put("type", the_context.getElement("bookmarkType").toString());
		bookmarks.put(newBookmark);
		API.setValue("geobookmarks", bookmarks.toString());
	}
	catch(Exception e){
		e.printStackTrace();
	}
	
	
 }

}