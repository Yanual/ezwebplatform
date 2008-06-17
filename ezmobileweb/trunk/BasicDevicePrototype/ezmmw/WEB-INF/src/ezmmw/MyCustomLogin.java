package ezmmw;

import java.util.HashMap;

import org.morfeo.tidmobile.context.ApplicationContextNode;
import org.morfeo.tidmobile.context.ContextManager;
import org.morfeo.tidmobile.server.login.CustomLogin;


public class MyCustomLogin extends CustomLogin{

	@Override
	public boolean login(String user, String pass) throws Throwable {
        
		boolean dev = super.login(user, pass);
		if (dev) {
			ApplicationContextNode context = ContextManager.getInstance().getApplicationContext();
			HashMap userData = (HashMap) context.getElement("sessionData");
			if (userData == null){
				userData = new HashMap();
			}
			
			
			
		}
		return dev;
    }
}