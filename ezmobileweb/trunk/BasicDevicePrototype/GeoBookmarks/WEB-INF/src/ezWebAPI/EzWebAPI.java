package ezWebAPI;

import java.util.Vector;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.cookie.CookiePolicy;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.json.JSONArray;
import org.json.JSONObject;
import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.server.RequestData;


public class EzWebAPI {
	
	private HttpClient client = null;   // http client authenticated in EzWeb
	private String iGadgetId =  null;   //igadget id
	private JSONArray variables = null; //igadget variable data -> without the current value of each variable.
	private String workspaceId =  null; // workspace id
	private String tabId =  null;   	//tab id
	
	//Constants
	
	public static final String WORKSPACE_URL = "/workspace";
	//Replace #DATA# with the correct value before use it
	public static final String WORKSPACE_DATA_URL = "/workspace/#WORKSPACE#";
	public static final String IGADGET_URL = "/workspace/#WORKSPACE#/tab/#TAB#/igadget/";
	public static final String CHANNELS_URL = "/workspace/#WORKSPACE#/channels";
	public static final String VARIABLES_URL = "/workspace/#WORKSPACE#/variables";
	
	public static final String SESSIONID = "sessionid";	
	public static final String DOMAIN = "domain";
	public static final String PORT = "port";
	public static final String PATH = "path";	
	public static final String USER = "user";
	public static final String IGADGETID = "igadgetId";
	public static final String ERROR = "error";
	
	
	public EzWebAPI(RequestData req){
		String sessionId =  null;
		String domain =  null;
		String path =  null;
		int port = 80;
		GetMethod getVariables = null;		
		GetMethod wsGet = null;
		
		//Retrieve URL parameters and establish the session with EzWeb
		Context the_context = req.getContext();
		if (req.getRequest().getParameter(EzWebAPI.SESSIONID)!=null)
			sessionId = req.getRequest().getParameter(EzWebAPI.SESSIONID);
		if (req.getRequest().getParameter(EzWebAPI.DOMAIN)!=null)
			domain = req.getRequest().getParameter(EzWebAPI.DOMAIN);
		if (req.getRequest().getParameter(EzWebAPI.PORT)!=null)
			port = new Integer(req.getRequest().getParameter(EzWebAPI.PORT)).intValue();
		if (req.getRequest().getParameter(EzWebAPI.PATH)!=null)
			path = req.getRequest().getParameter(EzWebAPI.PATH);
		if (req.getRequest().getParameter(EzWebAPI.IGADGETID)!=null)
			this.iGadgetId = req.getRequest().getParameter(EzWebAPI.IGADGETID);
		
		//Authenticate the user
		try{
			this.client = new HttpClient();
			this.client.getHostConfiguration().setHost(domain, port, "http");
			this.client.getParams().setCookiePolicy(CookiePolicy.BROWSER_COMPATIBILITY);
			
			Cookie cookie = new Cookie(domain, "sessionid", sessionId, path, null, false);
			this.client.getState().addCookie(cookie);
			
			//get the first workspace id
			wsGet = new GetMethod(EzWebAPI.WORKSPACE_URL);
			int status = client.executeMethod(wsGet);
			JSONObject ws = new JSONObject(wsGet.getResponseBodyAsString());			
	        this.workspaceId = ws.getJSONArray("workspaces").getJSONObject(0).getString("id");
			
			//get the workspace data
			getVariables = new GetMethod (EzWebAPI.WORKSPACE_DATA_URL.replaceFirst("#WORKSPACE#",this.workspaceId));
			status = this.client.executeMethod(getVariables);
			JSONObject response = new JSONObject(getVariables.getResponseBodyAsString());
			
			//extract the igadget variable data
			JSONArray igadgetList = response.getJSONObject("workspace").getJSONArray("tabList").getJSONObject(0).getJSONArray("igadgetList");
			for (int i=0;i<igadgetList.length();i++){
				if (igadgetList.getJSONObject(i).getString("id").compareTo(this.iGadgetId)==0)
					this.variables = igadgetList.getJSONObject(i).getJSONArray("variables");
			}
			//set the tabId datum
			this.tabId = response.getJSONObject("workspace").getJSONArray("tabList").getJSONObject(0).getString("id");
			//return ok
			the_context.setElement(EzWebAPI.ERROR, false);
		}catch(Exception e){
			//return error
			the_context.setElement(EzWebAPI.ERROR, true);
			System.out.println("Error during the authentication process.");
			e.printStackTrace();
		}
		finally{
			if (getVariables!=null)
				getVariables.releaseConnection();
			if (wsGet!=null)
				wsGet.releaseConnection();
		}
	}
	
	//TODO: make this method parser independant by returning a JSON String 
	public JSONArray getActiveSlots(){
		GetMethod getLocation =  null;
		GetMethod getChannels =  null;
		JSONArray res = new JSONArray();

		//Retrieve the variable values from the IGadget Variables
		try{
			//get the igadget variables
			getLocation = new GetMethod (EzWebAPI.IGADGET_URL.replaceFirst("#WORKSPACE#",this.workspaceId).replaceFirst("#TAB#",this.tabId) + this.iGadgetId);
			int status = this.client.executeMethod(getLocation);
			JSONObject response = new JSONObject(getLocation.getResponseBodyAsString());
			JSONArray variables = response.getJSONArray("variables");
			
			//get the workspace channels
			getChannels = new GetMethod (EzWebAPI.CHANNELS_URL.replaceFirst("#WORKSPACE#",this.workspaceId));
			status = this.client.executeMethod(getChannels);
			JSONArray channels = new JSONArray(getChannels.getResponseBodyAsString());

			//extract the connectable ids which participate in any channel
			Vector candidates = new Vector();
			for (int j=0;j<channels.length();j++){
				JSONArray outs = channels.getJSONObject(j).getJSONObject("connectable").getJSONArray("outs");
				for (int k=0;k<outs.length();k++){
					//it is a variable linked in a channel -> add this to the result
					//TODO: This selection do not solve the problem of receiving data from more than one variable. To solve this it is necessary 
					//a timestamp to know which variable value is younger
					candidates.add(outs.getJSONObject(k).getInt("id"));
				}
			}

			//create the JSONArray with 
			for (int i=0;i<variables.length();i++){
				JSONObject variable = variables.getJSONObject(i);
				if (variable.getString("aspect").compareTo("SLOT")==0){
					//check if its connectable is linked in any channel
					int idConnectable = variable.getJSONObject("connectable").getInt("id");
					if (candidates.contains(idConnectable)){
						res.put(variable);						
					}
				}
			}
			return res;
		}catch(Exception e){
			//HttpClient not found or server unreachable
			e.printStackTrace();
			return null;
		}
		finally{
			if (getLocation!=null)
				getLocation.releaseConnection();
			if (getChannels!=null)
				getChannels.releaseConnection();
		}
		
	}
	
	// get the value of the varName variable
	public String getValue(String varName){
		GetMethod getVariable =  null;

		//Retrieve the variable values from the IGadget Variables
		try{
			//get the igadget variables		
			if (this.variables!=null){
				for (int i=0;i<this.variables.length();i++){
					JSONObject variable = this.variables.getJSONObject(i);
					if (variable.getString("name").compareTo(varName)==0){
						//get the current value
						getVariable = new GetMethod (EzWebAPI.IGADGET_URL.replaceFirst("#WORKSPACE#",this.workspaceId).replaceFirst("#TAB#",this.tabId) + this.iGadgetId + "/variables/" + variable.getString("vardefId"));
						int status = this.client.executeMethod(getVariable);
						JSONObject response = new JSONObject(getVariable.getResponseBodyAsString());
						return response.getString("value");
					}
				}
			}
			return null;
		}catch(Exception e){
			//HttpClient not found or server unreachable
			e.printStackTrace();
			return null;
		}
		finally{
			if (getVariable!=null)
				getVariable.releaseConnection();
		}
		
	}
	
	// set the value of the varName variable
	//TODO: set the value in TAB variables
	//WARNING: a new value in a variable implies that a handler is executed and that behaviour CANNOT be done here
	public void setValue(String varName, String value){
		GetMethod getVariables =  null;
		GetMethod getChannels =  null;
		PutMethod putVariable =  null;
		JSONObject igadgetVar = null;
		JSONObject workspaceVar = null;
		int status = 0;
		

		//Retrieve the variable values from the IGadget Variables
		try{
			//get the igadget variables
			if (this.variables!=null){			
				for (int i=0;i<variables.length();i++){
					JSONObject variable = variables.getJSONObject(i);
					if (variable.getString("name").compareTo(varName)==0){
						JSONArray igadgetVars = new JSONArray();
						JSONArray workspaceVars = new JSONArray(); 
						
						if (variable.getString("aspect").compareTo("PROP")!=0){
							//calculate the affected variables
							//First step: get the workspace channels
							getChannels = new GetMethod (EzWebAPI.CHANNELS_URL.replaceFirst("#WORKSPACE#",this.workspaceId));
							status = this.client.executeMethod(getChannels);
							JSONArray channels = new JSONArray(getChannels.getResponseBodyAsString());
							
							//Second step: for each channel in which the variable is involved -> generate the JSON to be sent
							int ig_var_id = variable.getJSONObject("connectable").getInt("ig_var_id");
							for (int j=0;j<channels.length();j++){
								JSONArray ins = channels.getJSONObject(j).getJSONObject("connectable").getJSONArray("ins");
								for (int k=0;k<ins.length();k++){
									//check if any connectable is the variable connectable and add both the variable and the channel
									//to the JSON to be sent to the server
									if (ins.getJSONObject(k).getInt("ig_var_id")==ig_var_id){
										//add the variable
										igadgetVar = new JSONObject();
										igadgetVar.put("id", ig_var_id);
										igadgetVar.put("value", value);
										igadgetVars.put(igadgetVar);
										// and add the channel
										workspaceVar = new JSONObject();
										workspaceVar.put("id", channels.getJSONObject(j).getInt("id"));
										workspaceVar.put("value", value);
										workspaceVars.put(workspaceVar);
										//add the out variables linked to this channel
										JSONArray outs = channels.getJSONObject(j).getJSONObject("connectable").getJSONArray("outs");
										for (int l=0;l<outs.length();l++){
											igadgetVar = new JSONObject();
											igadgetVar.put("id", outs.getJSONObject(l).getInt("ig_var_id"));
											igadgetVar.put("value", value);
											igadgetVars.put(igadgetVar);
										}
									}
								}
							}
						}
						else{
							//It is a property
							igadgetVar = new JSONObject();
							igadgetVar.put("id", variable.getInt("id"));
							igadgetVar.put("value", value);
							igadgetVars.put(igadgetVar);
						}
						
						//set the request data
						JSONObject data = new JSONObject();
						data.put("igadgetVars", igadgetVars);
						data.put("workspaceVars", workspaceVars);
						//set the new value of these variables
						putVariable = new PutMethod(EzWebAPI.VARIABLES_URL.replaceFirst("#WORKSPACE#",this.workspaceId));
						putVariable.setRequestEntity(new StringRequestEntity("variables="+data.toString(), null, null));
					    status = this.client.executeMethod(putVariable);
					    return;
					}
				}
			}
		}catch(Exception e){
			//HttpClient not found or server unreachable
			e.printStackTrace();
		}
		finally{
			if (getVariables!=null)
				getVariables.releaseConnection();
			if (putVariable!=null)
				putVariable.releaseConnection();
			if (getChannels!=null)
				getChannels.releaseConnection();
		}
		
	}
	
	

}
