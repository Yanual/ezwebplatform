/* 
 * MORFEO Project 
 * http://morfeo-project.org 
 * 
 * Component: EzWeb
 * 
 * (C) Copyright 2008 Telefónica Investigación y Desarrollo 
 *     S.A.Unipersonal (Telefónica I+D) 
 * 
 * Info about members and contributors of the MORFEO project 
 * is available at: 
 * 
 *   http://morfeo-project.org/
 * 
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version. 
 * 
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details. 
 * 
 * You should have received a copy of the GNU General Public License 
 * along with this program; if not, write to the Free Software 
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 * 
 * If you want to use this software an plan to distribute a 
 * proprietary application in any way, and you are not licensing and 
 * distributing your source code under GPL, you probably need to 
 * purchase a commercial license of the product.  More info about 
 * licensing options is available at: 
 * 
 *   http://morfeo-project.org/
 */

/**
 * @author jmostazo-upm
 */
var PreferencesManagerFactory = function () {

	// *********************************
	// SINGLETON INSTANCE
	// *********************************
	var instance = null;
	
	function PreferencesManager () {
		
		/**** PRIVATE VARIABLES ****/
		this.preferences = new Hash();
		this.preferenceContainer = $("preferences_content");
		this.languageModified = false; // Language preference has a special behavior

		/**** PRIVATE METHODS ****/
		
		PreferencesManager.prototype._onSuccessInitPreferences = function(transport_) {
			var response = eval('(' + transport_.responseText + ')');
			var preferences = response.preferences;

			for (var i=0; i<preferences.length; i++) {
				var preference_data = preferences[i];
				var name = preference_data.name;
				var concept = preference_data.concept;
				var label = preference_data.label;
				var description = preference_data.description;
				var defaultValue = preference_data.defaultValue;
				var selectedValue = preference_data.selectedValue;
				var preference = null;

				switch (preference_data.type) {
                                        case PlatformPref.prototype.INTEGER:
						preference = new IntPlatformPref(name, concept, label, description, defaultValue, selectedValue);
						break;
                                        case PlatformPref.prototype.DATE:
						preference = new DatePlatformPref(name, concept, label, description, defaultValue, selectedValue);
						break;
                                        case PlatformPref.prototype.LIST:
						var options = [];
                                        	for (var j=0; j<preference_data.options.length; j++) {
							var option_data = preference_data.options[j];
                                                	options.push([option_data.value, option_data.label]);
                                        	}
                                        	preference = new ListPlatformPref(name, concept, label, description, defaultValue, selectedValue, options);
						break;
                                        case PlatformPref.prototype.BOOLEAN:
						preference = new BoolPlatformPref(name, concept, label, description, defaultValue, selectedValue);
						break;
                                        case PlatformPref.prototype.PASSWORD:
						preference = new PasswordPlatformPref(name, concept, label, description, defaultValue, selectedValue);
						break;
					default:
						preference = new TextPlatformPref(name, concept, label, description, defaultValue, selectedValue);
						break;
				}
				this.preferences[name] = new Object({"preference": preference, "handlers": []});
			}
			OpManagerFactory.getInstance().continueLoadingGlobalModules(Modules.prototype.PLATFORM_PREFERENCES);
		}

		PreferencesManager.prototype._onSuccessSavePreferences = function(transport_) {
			if (this.languageModified) { // Language preference has a special behavior
				if (this.preferences["language"]) {
                                	var handlers = this.preferences["language"].handlers;
                                	for(var i=0; i<handlers.length; i++) {
                                        	handlers[i]();
                                	}
                        	}	
			}
		}

		PreferencesManager.prototype._onErrorInitPreferences = function(transport, e) {
                        var msg;
                        if (e) {
                                msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
                                                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
                                                  true);
                        } else if (transport.responseXML) {
                                msg = transport.responseXML.documentElement.textContent;
                        } else {
                                msg = "HTTP Error " + transport.status + " - " + transport.statusText;
                        }
                        msg = interpolate(gettext("Error retrieving platform preferences data: %(errorMsg)s"),
                                                  {errorMsg: msg}, true);
                        LogManagerFactory.getInstance().log(msg);
		}

		PreferencesManager.prototype._onErrorSavePreferences = function(transport, e) {
                        var msg;
                        if (e) {
                                msg = interpolate(gettext("JavaScript exception on file %(errorFile)s (line: %(errorLine)s): %(errorDesc)s"),
                                                  {errorFile: e.fileName, errorLine: e.lineNumber, errorDesc: e},
                                                  true);
                        } else if (transport.responseXML) {
                                msg = transport.responseXML.documentElement.textContent;
                        } else {
                                msg = "HTTP Error " + transport.status + " - " + transport.statusText;
                        }
                        msg = interpolate(gettext("Error saving platform preferences data: %(errorMsg)s"),
                                                  {errorMsg: msg}, true);
                        LogManagerFactory.getInstance().log(msg);
		}

		PreferencesManager.prototype._notifyAllHandlers = function(modifiedPreferences_) {
			var self = this;
			this.languageModified = false;
			modifiedPreferences_.each( function(modifiedPreference_) {
				if (modifiedPreference_.key != "language") { // Language preference has a special behavior
					var handlers = self.preferences[modifiedPreference_.key].handlers;
					for(var i=0; i<handlers.length; i++) {
						handlers[i]();
					}
				}
				else {
					self.languageModified = true;
				}
			});
		}

		PreferencesManager.prototype._notifyAllContextVariables = function(modifiedPreferences_) {
                        var self = this;
			modifiedPreferences_.each( function(modifiedPreference_) {
                                self.preferences[modifiedPreference_.key].preference.notifyContextVariable();
                        });
                }

		PreferencesManager.prototype._propagateModifiedValues = function(modifiedPreferences_){
                        this._notifyAllHandlers(modifiedPreferences_);
                        this._notifyAllContextVariables(modifiedPreferences_);
                }
                
                PreferencesManager.prototype._initPreferences = function(){
			this.preferences = new Hash();
			PersistenceEngineFactory.getInstance().send_get(URIs.PLATFORM_PREFERENCES, this, 
				this._onSuccessInitPreferences, this._onErrorInitPreferences);
		}

		/**** PUBLIC METHODS ****/

		PreferencesManager.prototype.show = function(){
			LayoutManagerFactory.getInstance().showPlatformPreferences();
		}

		PreferencesManager.prototype.save = function(){
			var valid = true;
			this.preferences.each( function(preference_) {
                                var preference = preference_.value.preference;
                                if (!preference.validate()) {
					valid = false;
				}
                        });
			if (valid) {
				var modifiedPreferences = new Hash();
				this.preferences.each( function(preference_) {
					var preference = preference_.value.preference;
					var newValue = preference.getValueFromInterface();
					if (preference.getValue() != newValue) {
						preference.setValue(newValue);
						modifiedPreferences[preference.getName()] = newValue;
					}
				});
				LayoutManagerFactory.getInstance().hideCover();
				this._propagateModifiedValues(modifiedPreferences);
				PersistenceEngineFactory.getInstance().send_update(URIs.PLATFORM_PREFERENCES, {"preferences": modifiedPreferences.toJSON()}, 
					this, this._onSuccessSavePreferences, this._onErrorSavePreferences);
			}
		}

		PreferencesManager.prototype.getPreferenceValue = function(name_) {
			return this.preferences[name_].preference.getValue();
		}
		
		PreferencesManager.prototype.addPreferenceHandler = function(preferenceName_, handler_) {
                        if (this.preferences[preferenceName_])
				this.preferences[preferenceName_].handlers.push(handler_);
                }

		PreferencesManager.prototype.makeInterface = function(){
			var table = document.createElement("table");
			this.preferences.each( function(preference_) {
				var row = document.createElement("tr");
				var preference = preference_.value.preference;
				var columnLabel = document.createElement("td");
				columnLabel.className = "label";
				var columnValue = document.createElement("td");
				columnLabel.appendChild(preference.getLabelInterface());
				columnValue.appendChild(preference.makeInterface());
				row.appendChild(columnLabel);
				row.appendChild(columnValue);
				table.appendChild(row);
			});
			return table;
		}

		PreferencesManager.prototype.propagateAllValues = function(){
			var preferences = new Hash();
                        this.preferences.each( function(preference_) {
                        	var preference = preference_.value.preference;
                                preferences[preference.getName()] = preference.getValue();
                        });
                        this._propagateModifiedValues(preferences);
                }
	}

	// *********************************
	// SINGLETON GET INSTANCE
	// *********************************
	return new function() {
    		this.getInstance = function() {
    			if (instance == null) {
        			instance = new PreferencesManager();
				instance._initPreferences();
         		}
         		return instance;
       		}
	}
}();
