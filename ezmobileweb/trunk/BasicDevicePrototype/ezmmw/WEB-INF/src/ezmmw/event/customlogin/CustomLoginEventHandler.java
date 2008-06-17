package ezmmw.event.customlogin;

import ezmmw.MyPresentations;

import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;


/* This file is autogenerate */
public class CustomLoginEventHandler {


	public void onInitOP(RequestData req, IActionExecutor act) throws Throwable {

		act.navigate(MyPresentations.CUSTOMLOGIN_LOGIN, req);

	}


}