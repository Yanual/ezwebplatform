var msg=new Message();function getMessage(id){return msg.getMsg(id)}function getMs(id){return eval("this."+id)}function Message(){this.MyMobileWeb_E_No_User="Please enter user name";this.MyMobileWeb_E_No_Pass="Please enter password";this.MyMobileWeb_E_Invalid_Login="User and/or Pass not valid. Please retry";this.MyMobileWeb_E_Required="{0} is mandatory";this.MyMobileWeb_E_Int="{0} must be integer";this.MyMobileWeb_E_Int_Range="{0} must be an integer between {1} and {2}";this.MyMobileWeb_E_Int_Range_2="{0} must be an integer greater than {1}";this.MyMobileWeb_E_Int_Range_3="{0} must be an integer lower than {1}";this.MyMobileWeb_E_Float="{0} must be a number";this.MyMobileWeb_E_Float_Range="{0} must be a number between {1} and {2}";this.MyMobileWeb_E_Float_Range_2="{0} must be a number greater than {1}";this.MyMobileWeb_E_Float_Range_3="{0} must be a number lower than {1}";this.MyMobileWeb_E_Date="{0} must be a date with format {1}";this.MyMobileWeb_E_Date_Range="{0} must be a date between {1} and {2}";this.MyMobileWeb_E_Date_Range_2="{0} must be a date after than {1}";this.MyMobileWeb_E_Date_Range_3="{0} must be a date before {1}";this.MyMobileWeb_E_Time="{0} must be an hour with format {1}";this.MyMobileWeb_E_Time_Range="{0} must be an hour between {1} and {2}";this.MyMobileWeb_E_Time_Range_2="{0} must be an hour after {1}";this.MyMobileWeb_E_Time_Range_3="{0} must be an hour before {1}";this.MyMobileWeb_E_Format="{0} has incorrect format";this.MyMobileWeb_E_Length="{0} length must be {1}";this.MyMobileWeb_E_Min_Length="The minumum length of {0} is {1}";this.MyMobileWeb_E_Max_Length="The maximum length of {0} is {1}";this.MyMobileWeb_E_Min_Max_Length="The minumum length of {0} is {1} and the maximum is {2}";this.MyMobileWeb_E_Inv_Profile="User {0} has an invalid profile to use the application";this.MyMobileWeb_E_UnExp_Error="Unexpected exception: {0}";this.MyMobileWeb_E_File_Size="The maximum size of {0} is {1}";this.MyMobileWeb_E_File_ContentType="The content type of {0} must be {1}";this.MyMobileWeb_Choose_One="Choose One";this.getMsg=getMs}function isInteger(s){var i;for(i=0;i<s.length;i++){var c=s.charAt(i);if(((c<"0")||(c>"9"))){return false}}return true}function isFloat(s){var i;for(i=0;i<s.length;i++){var c=s.charAt(i);if(((c<"0")||(c>"9"))){if(c!="."){return false}}}return true}function change(template,x,y){var first=template.substring(0,template.indexOf(x));var second=template.substring(template.indexOf(x)+x.length,template.length);return first+y+second}function messageFormat(template,parameters){var out=template;for(i=0;i<parameters.length;i++){var temp="{"+i+"}";out=change(out,temp,parameters[i])}return out}function trim(s){while(s.substring(0,1)==" "){s=s.substring(1,s.length)}while(s.substring(s.length-1,s.length)==" "){s=s.substring(0,s.length-1)}return s};