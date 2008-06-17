package ezmmw.event.customlogin;

import ezmmw.MyOPs;
import ezmmw.MyOAs;
import ezmmw.MyContextVariables;
import ezmmw.MyPresentations;

import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

public class LoginEventHandler {
	
	public void _MYMW_LG_BT_onsubmit(RequestData req, IActionExecutor act) throws Throwable {
		Context the_context = req.getContext();
		
		act.executeOA(MyOAs.AUTHENTICATE, req);
		try{
			//check if the HttpClient exists -> the user has been authenticated
			if (the_context.getElement(MyContextVariables.HTTP_CLIENT)!=null)
				act.callOP(MyOPs.INITOP, null, req);
			else
				act.showMessage("Authentication Error: Incorrect user or password",  req);
		}catch(Exception e){
			act.showMessage("Error connecting to EzWeb",req);
		}

	}

}
