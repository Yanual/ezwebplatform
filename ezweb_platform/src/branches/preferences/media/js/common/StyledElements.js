//Static class
function StyledElements() {}

StyledElements.createStyledSelect = function(name_, selectedValue_, options_) {
	var element = document.createElement("div");
	element.className = "styled_select";
	var div =  document.createElement("div");
	div.className = "select_div";
	var select =  document.createElement("select");
	select.setAttribute("name", name_);
	var textDiv = document.createElement("div");
        textDiv.className = "select_text";
	var imageDiv =  document.createElement("div");
	imageDiv.className = "select_image";

	if (options_.length > 0) textDiv.innerHTML = gettext(options_[0][1]);
	
	for (var i = 0; i < options_.length; i++) {
                var option = document.createElement("option");
                option.setAttribute("value", options_[i][0]);

                if (selectedValue_ == options_[i][0]) {
                        option.setAttribute("selected", "selected");
			textDiv.innerHTML = gettext(options_[i][1]);
		}
                option.appendChild(document.createTextNode(gettext(options_[i][1])));
                select.appendChild(option);
        }

        select.observe("change", function(event_) {
                var options = this.getElementsByTagName("option");
                for (var i = 0; i < options.length; i++) {
                        if (options[i].selected == true) {
                                textDiv.innerHTML = options[i].firstChild.nodeValue;
                        }
                }
        });
	element.appendChild(textDiv);
	element.appendChild(imageDiv);
	element.appendChild(select);
	element.appendChild(div);
	
	return element;
}

StyledElements.createStyledTextField = function(name_, selectedValue_) {
	var element = document.createElement("div");
        element.className = "styled_text_field";
	var text = document.createElement("input");
        text.setAttribute("type", "text");
	text.setAttribute("name", name_);
        text.setAttribute("value", selectedValue_);
	text.className = "text_field";
	element.appendChild(text);
	
	return element;
}

StyledElements.createStyledPasswordField = function(name_, selectedValue_) {
        var element = document.createElement("div");
        element.className = "styled_text_field";
        var text = document.createElement("input");
        text.setAttribute("type", "password");
        text.setAttribute("name", name_);
        text.setAttribute("value", selectedValue_);
        text.className = "text_field";
        element.appendChild(text);

        return element;
}

StyledElements.createStyledNumericField = function(name_, selectedValue_) {
        var element = document.createElement("div");
        element.className = "styled_numeric_field";
        var text = document.createElement("input");
        text.setAttribute("type", "text");
	text.setAttribute("name", name_);
        text.setAttribute("value", selectedValue_);
        text.className = "numeric_field";
	var topButton = document.createElement("button");
	topButton.className = "numeric_top_button";
	var bottomButton = document.createElement("button");
        bottomButton.className = "numeric_bottom_button";
	
	var inc = function(element_, inc_) {
		var value = element_.value;
		if (!isNaN(Number(value))) {
			value =  parseInt(value) + inc_;
		}
		element_.value = value;
	};

	topButton.observe("click", function(event_) {
                inc(text, 1);
        });

	bottomButton.observe("click", function(event_) {
		inc(text, -1);
        });

	element.appendChild(topButton);
	element.appendChild(bottomButton);
        element.appendChild(text);

        return element;
}

