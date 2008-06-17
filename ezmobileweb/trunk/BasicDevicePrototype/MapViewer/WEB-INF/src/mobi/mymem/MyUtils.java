package mobi.mymem;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


import org.morfeo.tidmobile.context.ApplicationContextNode;
import org.morfeo.tidmobile.context.Context;
import org.morfeo.tidmobile.context.ContextManager;
import org.morfeo.tidmobile.devmgt.bean.Device;
import org.morfeo.tidmobile.devmgt.exception.DeviceCapabilityException;
import org.morfeo.tidmobile.devmgt.exception.DeviceManagerException;
import org.morfeo.tidmobile.devmgt.exception.DeviceNotFoundException;
import org.morfeo.tidmobile.DDRCoreVocabulary;
import org.morfeo.tidmobile.ImageFormatSupportValues;

import mobi.mymem.MyContextVariables;
public class MyUtils {
	
	
	//Esta clave es solo para 127.0.0.1:8080
	//public static String Googlekey = "ABQIAAAAfIL6FxpwPlt5zMMOhtHboxTwM0brOpm-All5BF6PoaKBxRWWERT3MChHorqH_jFB38HSdRIL3E0dKA";
	public static String Googlekey = "ABQIAAAAfIL6FxpwPlt5zMMOhtHboxRhg8PN3O9bHyAbnnC_ko2n4MIltxSw_Q7R7UbCC4deYT8BUGnPSlXH2w";
	public static String UrlLocalize = "http://maps.google.com/staticmap";
	
	public static int MAXZOOM = 17;
	
	public static int MINZOOM = 0;
	
	public static int NORMALZOOM = 15;
	
	//public static int WIDTHNORMAL = 95;//longitude
	
	//public static int HEIGHTNORMAL = 117;//latitude
	
	public static double WIDTHPERCENT = 0.9;
	
	public static double HEIGHTPERCENT = 0.8;
	
	public static int WIDTHREFERENCE = 500;
	
	public static int HEIGHTREFERENCE = 300;
	
	public static double[] INCREASELATITUDE = {
		 74.134467548755637, 
		 60.196676976720205, 
		 28.690017755802749,
		 11.866373826807077,
		 6.1142707325579622, 
		 3.2540376252880279,
		 1.589437446044208,
		 0.78972836671373159,
		 0.39438660597222253,
		 0.19649138527497456,
		 0.098264280492458056,
		 0.049098204979564741,
		 0.024561160208172339,
		 0.012276985471196156,
		 0.072816414036878996,
		 0.0030695840894807702,
		 0.0015348391417049356,
		 0.00076743134489731801
	 };

	public static double[] INCREASELONGITUDE = 
	 {
	  149.58984375,
	  105.46875,
	  52.564258575439453,
	  26.3671875,
	  13.18359375,
	  6.591796875,
	  3.2958984375,
	  1.64794921875,
	  1.33154296875,
	  0.4119873046875,
	  0.20599365234375,
	  0.102996826171875,
	  0.0514984130859375,
	  0.02574920654296875,
	  0.012874603271498586,
	  0.0064373016357421875,
	  0.0032186508178710938,
	  0.0016093254089355469
	  };
	
	public static double getIncreaseLatitude(int zoom,int height)
	{
		
		
		return (((double)height)/HEIGHTREFERENCE)*INCREASELATITUDE[zoom];
	}
	
	public static double getIncreaseLatitude(int zoom,Context the_context)
	{
		return getIncreaseLatitude(zoom, getHEIGHTNORMAL(the_context));
	}
	
	public static double getIncreaseLongitude(int zoom,Context the_context)
	{
		return getIncreaseLatitude(zoom,getWIDTHNORMAL(the_context));
	}
	
	public static double getIncreaseLongitude(int zoom,int width)
	{


		return (((double)width)/WIDTHREFERENCE)*INCREASELONGITUDE[zoom];
	}
	
	public static double getNextLatitudeLeft(int zoom, double latitude)
	{
		return latitude + INCREASELATITUDE[zoom]/2;
		
	}
	public static double getNextLatitudeRigth(int zoom, double latitude)
	{
		return latitude - INCREASELATITUDE[zoom]/2;
		
	}
	
	public static double getNextLongitudeRigth(int zoom, double longitude)
	{
		return longitude + INCREASELONGITUDE[zoom]/2;
		
	}
	
	public static double getNextLongitudeLeft(int zoom, double longitude)
	{
		return longitude + INCREASELONGITUDE[zoom]/2;
		
	}
	public static Map convertToMap(Object obj,Map extra) throws IllegalArgumentException, IllegalAccessException, InvocationTargetException
	{
		Method [] methods= obj.getClass().getMethods();
		Method method;
		Type [] parameters;
		Object objReturn=null;
		Map objMap = new HashMap();
		for (int i =0; i< methods.length; i++)
		{
			method = methods[i];
			parameters = method.getGenericParameterTypes();

			
			if (parameters == null || parameters.length == 0 )
			{
				if(!method.getReturnType().getName().equals("void"))
					try{
						objReturn = method.invoke(obj);
					}
					catch(InvocationTargetException e)
					{
						objReturn="";
					}

						
					objMap.put(method.getName(), objReturn);
					
				
			}
		}
		objMap.putAll(extra);
		
		return objMap;
	}
	
	public static List convertToListOfMap(List objs, Map extra) throws IllegalArgumentException, IllegalAccessException, InvocationTargetException
	{
		Iterator it = objs.iterator();
		List objs_Map = new ArrayList();
		Object obj;
		Map m;
		while(it.hasNext())
		{
			obj = it.next();
			m=convertToMap(obj,extra);
			objs_Map.add(m);
		}
		return objs_Map;
	}
	
	public static List convertToListOfMapWithListExtra(List objs, List extra) throws IllegalArgumentException, IllegalAccessException, InvocationTargetException
	{
		Iterator it = objs.iterator();
		Iterator it2 = extra.iterator();
		List objs_Map = new ArrayList();
		Object obj;
		Map extra_map;
		Map m;
		while(it.hasNext())
		{
			obj = it.next();
			extra_map =(Map)it2.next();
			m=convertToMap(obj,extra_map);
			objs_Map.add(m);
		}
		return objs_Map;
	}
	
	
	
	public static void removeContextImage(Context the_context)
	{
		the_context.removeElement(MyContextVariables.ZOOM);
		the_context.removeElement(MyContextVariables.LATITUDE);
		the_context.removeElement(MyContextVariables.LONGITUDE);
		the_context.removeElement(MyContextVariables.LATITUDEMARK);
		the_context.removeElement(MyContextVariables.LONGITUDEMARK);
		
	}

	public static int getWIDTHNORMAL(Context the_context) 
	{
		int wn = getWIDTHNORMAL_without512(the_context);
		if(wn>512)
			wn=512;
		return wn;
	}
	
	public static int getWIDTHNORMAL_without512(Context the_context) 
	{
		Device c = (Device) the_context.getElement("_MYMW_DEVICE");
		int wn= -1;
		try {
			wn = (int) (c.getCapabilityValueAsInt(DDRCoreVocabulary.DISPLAY_WIDTH) * WIDTHPERCENT) ;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return wn;
	}
	
	public static int getHEIGHTNORMAL(Context the_context)
	{
		Device c = (Device) the_context.getElement("_MYMW_DEVICE");
		int hn=-1;
		try {
			int wn = getWIDTHNORMAL_without512(the_context);
			double incrementWn =1.0;
			if (wn > 512)
				incrementWn = 512.0/wn;
			hn = (int) (c.getCapabilityValueAsInt(DDRCoreVocabulary.DISPLAY_HEIGHT) * HEIGHTPERCENT*incrementWn);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		if(hn>512)
			hn=512;
		return hn;
	}
	
	public static String getImageFormat(Context the_context) 
	{
		Device c = (Device) the_context.getElement("_MYMW_DEVICE");
		try {
			Map images = c.getCapabilityGroupValues(DDRCoreVocabulary.IMAGE_FORMAT_SUPPORT);
			if (images.containsKey(ImageFormatSupportValues.GIF_87) || images.containsKey(ImageFormatSupportValues.GIF_89A))
				return "gif";
			else if (images.containsKey(ImageFormatSupportValues.JPEG))
				return "jpg";
			else //png
				return "png32";
			
		} catch (Exception e) {
			e.printStackTrace();
			return "gif";
		}
	}
	
}
