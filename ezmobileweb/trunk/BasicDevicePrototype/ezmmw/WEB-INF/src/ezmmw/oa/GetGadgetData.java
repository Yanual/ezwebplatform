package ezmmw.oa;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.json.JSONArray;
import org.json.JSONObject;
import org.morfeo.tidmobile.server.oa.BasicApplicationOperation;
import org.morfeo.tidmobile.server.oa.OAException;
import org.morfeo.tidmobile.context.Context;

import ezmmw.Constants;


public class GetGadgetData extends BasicApplicationOperation {


public void execute(Context the_context) throws OAException {
	
	GetMethod igadgetsGet =  null;
	GetMethod gadgetGet =  null;
	GetMethod wsGet =  null;
	int status = 0;
	
	try{
		
		HttpClient client = (HttpClient) the_context.getElement("HttpClient");

	    //Retrieve Igadgets data (WorkspaceID and TabID are temporary)
	    //igadgetsGet = new GetMethod("/user/"+ the_context.getElement("user").toString() +"/igadgets");
		wsGet = new GetMethod(Constants.EZWEB_WORKSPACE_URL);
		status = client.executeMethod(wsGet);
		JSONObject ws = new JSONObject(wsGet.getResponseBodyAsString());
		
        igadgetsGet = new GetMethod(Constants.EZWEB_IGADGETS_URL.replaceFirst("#WORKSPACE#", ws.getJSONArray("workspaces").getJSONObject(0).getString("id")));
	    status = client.executeMethod(igadgetsGet);
	    JSONObject wsObj = new JSONObject(igadgetsGet.getResponseBodyAsString());
	    // Get the igadgets from the first tab of the first workspace
	    JSONArray iGadgets = wsObj.getJSONObject("workspace").getJSONArray("tabList").getJSONObject(0).getJSONArray("igadgetList");
	    
	    //create the contextData. It is an Array of gadget data, which is an array with
	    //the iGadget in the first position and the Gadget in the second.
	    JSONArray contextData = new JSONArray();
	    //Retrieve Gadget data and fill contextData
	    for (int i=0;i<iGadgets.length();i++){
	    	JSONArray contextElement = new JSONArray();
	    	
	    	gadgetGet = new GetMethod(new URI(iGadgets.getJSONObject(i).getString("gadget"), false).getEscapedURI());
	    	status = client.executeMethod(gadgetGet);
	    	
	    	contextElement.put(iGadgets.getJSONObject(i)); 	
	    	contextElement.put(new JSONObject(gadgetGet.getResponseBodyAsString()));
	    	contextData.put(contextElement);
	    }
	    the_context.setElement("workspaceName", ws.getJSONArray("workspaces").getJSONObject(0).getString("name"));
	    the_context.setElement("tabName", wsObj.getJSONObject("workspace").getJSONArray("tabList").getJSONObject(0).getString("name"));
	    the_context.setSessionElement("userGadgets", contextData);
	    the_context.setSessionElement("HttpClient", client);
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		if (igadgetsGet  != null)
			igadgetsGet.releaseConnection();
		if (gadgetGet  != null)
			gadgetGet.releaseConnection();
	}
}

}