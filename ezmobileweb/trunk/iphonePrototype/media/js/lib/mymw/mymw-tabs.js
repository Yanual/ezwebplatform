(function() {

	TabView = function(nid, attr)
	{
		this._id = nid;
		this._tabs = [];
		this.attr = attr || {};
		
		this._init(); // pre-load existing tabs
		
		for (var i in this.attr)
		{
			this.set(i, this.attr[i]);
		}
	};
	var p = TabView.prototype;
	
	p.addTab = function(tab) 
	{
		this._tabs[this._tabs.length] = tab;
		if (this._tabs.length > this.get('maxTabs')) 
		{
			this.removeTab(0);
		}		
		
		if (this._tabs.length == 1) 
		{
			this.set('activeIndex', 0); // set includes rendering
		}
		else
		{
			this._render();
		}
	}

	p.removeTab = function(index)
	{
		this._tabs.splice(index, 1);
		
		// If the active tab is removed, active the first tab.
		if (this.get('activeIndex') == index)
		{
			this.set('activeIndex', 0); // set includes rendering
		}
		else
		{
			this._renderHead();
		}
	}
	
	// not in YUI
	p.removeTabById = function(id)
	{
		var index = this.getTabIndexById(id);
		if (index) {		
			this.removeTab( index );
		}
	}
	
	p.getTab = function(index)
	{
		return this._tabs[index];
	}
	
	// not in YUI
	p.getTabIndexById = function(id)
	{
		var index;
		for (var i=0; i<this._tabs.length; i++) 
		{
			if (this._tabs[i].get('id') == id) 
			{
				index = i;
				break;
			}
		}
		return index;
	}
	
	// name in ['activeId', 'activeTab', 'activeIndex']
	p.set = function(name, value)
	{
		this.attr[name] = value;
		switch (name) 
		{
			case 'activeId' :
				this.set('activeIndex', this.getTabIndexById(value));
				break;
			case 'activeTab' :
				for (var i=0; i<this._tabs.length; i++) 
				{
					if (this._tabs[i] == value) 
					{						
						this.set('activeIndex', i);
						break;
					}
				}
				break;
			case 'activeIndex' :
				for (var i=0; i<this._tabs.length; i++)
				{
					this._tabs[i].set('active', i == value ? true : false);
				}
				this._render();
				break;
		}
	}
	
	p.get = function(name) 
	{
		return this.attr[name];
	}
	
	p._render = function() 
	{
		this._renderHead();
		this._renderContent();
	}
	
	p._renderHead = function() 
	{
		var innerHTML = "";
		for (var i=0; i<this._tabs.length; i++) 
		{
			innerHTML += this._tabs[i]._innerHTML;
		}
		update('mymw-nav', innerHTML);
	}
	
	p._renderContent = function() 
	{
		var content = "";
		if (this._tabs.length > 0) 
		{
			// assert activeIndex >= 0;
			var activeIndex = this.get('activeIndex');
			content = this._tabs[activeIndex].get('content');
		}
		update('mymw-content', content);
	}
	
	p._init = function()
	{
		// TODO
	}
	
	MyMWTab = function(attr) 
	{
		this.attr = attr || {};
		this._loaded = false;

		for (var i in this.attr) 
		{
			this.set(i, this.attr[i]);
		}
	};
	var p = MyMWTab.prototype;
	
	// name in ['active', 'label', 'content', 'dataSrc', 'cacheData', 'id']
	p.set = function(name, value)
	{
		this.attr[name] = value;		
		switch (name) 
		{
			case 'active' :			
			case 'label' :
				this._updateHTML();
				break;
			case 'content' :
			case 'dataSrc' :		
			case 'id' :
				break;
		}
	}
			
	p.get = function(name)
	{
		switch (name)
		{
			case 'content':
				var dataSrc = this.get('dataSrc');
				if (dataSrc &&
					this.get('active') &&
					(!this._loaded || !this.get('cacheData')))
				{
					this.set('content', '');
					var handle_ok = function( txt ) 
					{
						this._loaded = true;
						this.set('content', txt);
						update('mymw-content', txt);
					}
					var params = "_mymw_rnd=" + Math.random(); // random param to avoid caching
					ajax.apply(this, [dataSrc, handle_ok, null, params, true]);
				}
				break;
		}
		
		return this.attr[name];
	}
	
	p._updateHTML = function() 
	{
		var template =
			"<li id='{id}' class='{className}'>" +
			"<a href='{href}' onclick='{onclick}'>{label}</a>" +
			"</li>";

		// TODO the name of the variable "tabview" is hardcoded !
		var data = 
		{
			id : this.get('id'),
			className : this.get('active') ? 'mymw-selected' : '',
			href : '#',
			onclick : 'javascript:tabview.set("activeId","' + this.get('id') + '");',
			label : this.get('label')
		}
		
		this._innerHTML = template.supplant(data);
	}
	
    String.prototype.supplant = function (o) 
	{
		return this.replace(/{([^{}]*)}/g,
			function (a, b) 
			{
				var r = o[b];
				return typeof r === 'string' ? r : a;
			}
		);
    };
	
})();