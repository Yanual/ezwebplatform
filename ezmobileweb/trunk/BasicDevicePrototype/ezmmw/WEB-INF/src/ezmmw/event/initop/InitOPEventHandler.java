package ezmmw.event.initop;

import java.util.Iterator;
import java.util.ListIterator;
import java.util.Map;

import ezmmw.MyPresentations;
import ezmmw.MyOAs;

import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.context.ContextManager;
import org.morfeo.tidmobile.server.RequestData;
import org.morfeo.tidmobile.server.flow.IActionExecutor;


/* This file is autogenerate */
public class InitOPEventHandler {


public void onInitOP(RequestData req, IActionExecutor act) throws Throwable {

	act.executeOA(MyOAs.GETGADGETDATA, req);
	act.executeOA(MyOAs.GENERATEIGADGETLIST, req);
	act.navigate(MyPresentations.INITOP_GADGETSMENU, req);

}


}