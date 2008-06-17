package ezmmw.event.initop;

import java.util.HashMap;
import java.util.List;
import java.util.Vector;

import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;

import ezmmw.MyOAs;
import ezmmw.MyPresentations;


/* This file is autogenerate */
public class GadgetsMenuEventHandler {

	public void search_onsubmit(RequestData req, IActionExecutor act) throws Throwable {
		
		act.executeOA(MyOAs.GENERATEIGADGETLIST, req);
		
		Context the_context = req.getContext();
		String text = (String) the_context.getElement("text");
		List iGadgetList = (Vector) the_context.getElement("userIgadgetList");

		for (int i=0;i< iGadgetList.size();i++){
			HashMap element = (HashMap) iGadgetList.get(i);
			if ((!((String) element.get("name")).contains(text)) || !(((String) element.get("description")).contains(text))){
				iGadgetList.remove(i);
			}
		}
		the_context.setElement("userIgadgetList", iGadgetList);
		act.navigate(MyPresentations.INITOP_GADGETSMENU, req);
	 }
	
}