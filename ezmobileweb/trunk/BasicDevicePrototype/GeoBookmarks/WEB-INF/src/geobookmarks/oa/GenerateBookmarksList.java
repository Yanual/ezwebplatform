package geobookmarks.oa;

import java.util.HashMap;
import java.util.Vector;

import geobookmarks.MyContextVariables;

import org.json.JSONArray;
import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezWebAPI.EzWebAPI;

/* This file is autogenerate */
public class GenerateBookmarksList extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	
	EzWebAPI API = (EzWebAPI) the_context.getElement(MyContextVariables.EZWEBAPI);
	String bookmarksPlain = API.getValue("geobookmarks");
	Vector res = null;
	try{
		if (bookmarksPlain.length()>0){
			JSONArray bookmarks= new JSONArray(bookmarksPlain);
			res = new Vector();
			for (int i=0;i<bookmarks.length();i++){
				HashMap row = new HashMap();
				row.put("bookmarkName",bookmarks.getJSONObject(i).getString("elementName"));
				row.put("bookmarkLocation",bookmarks.getJSONObject(i).getString("location"));
				row.put("bookmarkType",bookmarks.getJSONObject(i).getString("type"));
				row.put("idRow",i);
				res.add(row);
			}
			the_context.setElement(MyContextVariables.BOOKMARKS_LIST, res);
		}
		else{
			the_context.setElement(MyContextVariables.BOOKMARKS_LIST, null);
		}
	}catch(Exception e){
		e.printStackTrace();
	}
 }

}