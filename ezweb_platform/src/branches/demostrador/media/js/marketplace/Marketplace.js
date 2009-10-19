/*
 *     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
 *     S.A.Unipersonal (Telefonica I+D)
 *
 *     This file is part of Morfeo EzWeb Platform.
 *
 *     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the MORFEO project
 *     is available at
 *
 *     http://morfeo-project.org
 */

var MarketplaceFactory  = function () {

    var instance = null;
    
	function WalletManager() {

        // *********************************
        //  PRIVATE VARIABLES AND FUNCTIONS
        // *********************************

        /**
         * Gets the current balance in the user wallet
         */
        this.getBalance = function() {
            var onSuccess = function (transport) {
                var responseJSON = eval ('(' + transport.responseText + ')');
                $('wallet_current_balance').innerHTML = responseJSON.current_balance;
                }

            var onError = function (transport) {
                var msg = interpolate(gettext("Error getting the wallet balance: %(errorMsg)s."), {errorMsg: transport.status}, true);
                LogManagerFactory.getInstance().log(msg);
                }

            var persistenceEngine = PersistenceEngineFactory.getInstance();

            persistenceEngine.send_get(URIs.GET_WALLET_BALANCE.template, this, onSuccess, onError);
            }

        /**
         * Shows a window to recharge the wallet. It shows a list of payment items of several payment accounts
         */
        this.recharge = function() {
            LayoutManagerFactory.getInstance().showWindowMenu('walletRecharge');
            var purchaseWindow = LayoutManagerFactory.getInstance().currentMenu;
            PersistenceEngineFactory.getInstance().send_get(URIs.GET_PAYMENT_ACCOUNTS.template, this, function(transport) {

                var accounts = eval(transport.responseText);
                var accountsDiv = $('wallet_recharge_content');
                accountsDiv.innerHTML = "";
                if (accounts) {
                    accounts.each(function(account) {
                        var element = UIUtils.createHTMLElement("div", $H({class_name: 'payment_account_div'}));
                        accountsDiv.appendChild(element);
                        element.innerHTML = account.form_html;
                        });
                    }
                },
            function(transport) {
                var valor = transport;
                });
            }

        }


    function PurchaseManager() {
		this.purchasedGadgets = [];

        /**
         * Gets a list of purchased gadgets
         */
        this.initPurchaseManager = function () {
			var onSuccess = function (transport) {
				var responseJSON = transport.responseText;
				this.purchasedGadgets = eval ('(' + responseJSON + ')');
    			}

			var onError = function (transport) {
			    this.purchasedGadgets = []
                var msg = interpolate(gettext("Error getting the purchased gadgets: %(errorMsg)s."), {errorMsg: transport.status}, true);
                LogManagerFactory.getInstance().log(msg);
    			}

			var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.send_get(URIs.GET_PURCHASED_RESOURCES.template, this, onSuccess, onError);
    		}

        /**
         * Determines if a gadget has been purchased
         */
        this.isGadgetPurchased = function(shortName, vendor, version) {
            if(this.purchasedGadgets[shortName+":"+vendor+":"+version]==true)
                return true;
            return false;
            };

        /**
         * Purchase a gadget using a selected gadget pricing id
         */
        this.purchaseGadget = function(pricing_id) {
            var onError = function(transport) {
                LayoutManagerFactory.getInstance().hideCover();
                var msg = interpolate(gettext("Error purchasing the Gadget: %(errorMsg)s."), {errorMsg: transport.status}, true);
                LogManagerFactory.getInstance().log(msg);
                }

            var onSuccess = function(transport) {
                LayoutManagerFactory.getInstance().hideCover();
                CatalogueFactory.getInstance().reloadCompleteCatalogue();
                }

            var params = {'pricing_id': pricing_id};
            PersistenceEngineFactory.getInstance().send_post(URIs.POST_PURCHASE_GADGET.template, params, this, onSuccess, onError);
            }

        /**
         * Show the purchased gadgets table
         */
        this.showPurchasedGadgets = function() {
            var onSuccess = function (transport) {
                var responseJSON = transport.responseText;
                var expirations = eval ('(' + responseJSON + ')');

                for (var purchasedGadget in expirations) {
                    var tr = document.createElement("tr");
                    var tdName = document.createElement("td");
                    tdName.innerHTML = purchasedGadget;
                    tr.appendChild(tdName);
                    var tdExpiration = document.createElement("td");
                    tdExpiration.innerHTML = expirations[purchasedGadget];
                    tr.appendChild(tdExpiration);
                    $('purchased_gadgets').appendChild(tr);
                }
            }

            var onError = function (transport) {
                this.purchasedGadgets = []
                var msg = interpolate(gettext("Error getting the purchased gadgets: %(errorMsg)s."), {errorMsg: transport.status}, true);
                LogManagerFactory.getInstance().log(msg);
            }

            $('purchased_gadgets').innerHTML = '';
            var persistenceEngine = PersistenceEngineFactory.getInstance();
            persistenceEngine.send_get(URIs.GET_EXPIRATIONS.template, this, onSuccess, onError);
            }
        }


    function Marketplace() {
    
		// *********************************
		//  PRIVATE VARIABLES AND FUNCTIONS
		// *********************************
        this.walletManager = new WalletManager();
        this.purchaseManager = new PurchaseManager();

        /**
         * Gets a list of purchased gadgets
         */
        this.initMarketplace = function () {
            this.purchaseManager.initPurchaseManager();
            this.walletManager.getBalance();
            this.purchaseManager.showPurchasedGadgets();
        }

        /**
         * Shows a window to purchase a gadget. It shows a list of gadget pricings and wait a user response 
         */
        this.purchaseResource = function(short_name, vendor, version) {
            LayoutManagerFactory.getInstance().showWindowMenu('purchaseResource');
            var purchaseWindow = LayoutManagerFactory.getInstance().currentMenu;
            var cloneURL = URIs.GET_GADGET_PRICING.evaluate({'vendor': vendor, "name": short_name, "version": version});
            PersistenceEngineFactory.getInstance().send_get(cloneURL, this, function(transport) {

                var pricings = eval(transport.responseText);
                var pricingsTable = $('purchase_window_pricing');
                pricingsTable.tBodies[0].innerHTML = "";
            	if (pricings) {
                    pricings.each(function(pricing) {
            			var element = UIUtils.createHTMLElement("tr", null);
                        pricingsTable.tBodies[0].appendChild(element);
                        element.insertCell(0);
                        element.insertCell(1);
                        element.insertCell(2);
                        switch(pricing.periodicity) {
                        case 'P':
                            element.cells[0].innerHTML = gettext('Permanentemente');//gettext('periodicity_'+pricing.periodicity);
                            break;
                        case 'D':
                            if(pricing.duration==1)
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('D&iacute;a');
                            else
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('D&iacute;as');
                            break;
                        case 'W':
                            if(pricing.duration==1)
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('Semana');
                            else
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('Semanas');
                            break;
                        case 'M':
                            if(pricing.duration==1)
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('Mes');
                            else
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('Meses');
                            break;
                        case 'Y':
                            if(pricing.duration==1)
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('A&ntilde;o');
                            else
                                element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('A&ntilde;os');
                            break;
                        }
                        /*if(pricing.periodicity=='P')
                            element.cells[0].innerHTML = gettext('periodicity_'+pricing.periodicity);
                        else {
                            element.cells[0].innerHTML = ""+pricing.duration + " " + gettext('periodicity_'+pricing.periodicity);
                        }*/
                        element.cells[1].innerHTML = pricing.price;
                        element.cells[2].innerHTML = '<button id="purchase_btn1" onclick="MarketplaceFactory.getInstance().purchaseManager.purchaseGadget('+pricing.id+')">'+gettext('Purchase')+'</button>';
                        });
                    }
                var valor = transport;
                },
            function(transport) {
                var valor = transport;
                });
			}


        }


    // ************************
	//  SINGLETON GET INSTANCE
	// ************************
	return new function() {
    	this.getInstance = function() {
    		if (instance == null)
        		instance = new Marketplace();
         	return instance;
            }
        }

    }();




