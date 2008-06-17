package ezmmw.oa;

import java.util.HashMap;
import java.util.List;
import java.util.Vector;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.json.JSONArray;
import org.json.JSONObject;
import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezmmw.MyContextVariables;
import ezmmw.Constants;

/* This file is autogenerate */
public class GenerateIgadgetList extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	
	try{
		List userIgadgetList = new Vector();
		JSONArray userGadgets = (JSONArray) the_context.getElement("userGadgets");
		Cookie[] cookies = ((HttpClient) the_context.getElement("HttpClient")).getState().getCookies();
	    Cookie cookie = cookies[0];
		for(int i=0;i<userGadgets.length();i++){
			HashMap userIgadgetElement = new HashMap();
			JSONObject gadget = (JSONObject) ((JSONArray) userGadgets.get(i)).get(1);
			
			//fill the element
			String igadgetId = ((JSONObject) ((JSONArray) userGadgets.get(i)).get(0)).getString("id");
			String gadgetName = (String) gadget.get("name");
			userIgadgetElement.put("id", i);
			userIgadgetElement.put("name", gadgetName + " (Gadget "+igadgetId+")");
			userIgadgetElement.put("description", (String) gadget.get("description"));
			userIgadgetElement.put("image", ((String) gadget.get("name")).replace(' ', '_'));
			userIgadgetElement.put("href", "/"+gadgetName.replace(" ", "")+"?init=1&sessionid="+cookie.getValue()+
												"&domain="+cookie.getDomain()+"&port="+Constants.EZWEB_PORT+"&path="+cookie.getPath()+
												"&user="+(String) the_context.getElement(MyContextVariables.USER)+
												"&igadgetId="+igadgetId);
					
			//fill the list
			userIgadgetList.add(userIgadgetElement);			
		}
		the_context.setElement("userIgadgetList",userIgadgetList);
	}
	catch(Exception e){
		e.printStackTrace();
	}
 }

}