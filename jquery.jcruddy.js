;(function ($) {
	"use strict";

	
  var methods = {
		init : function (options) {
			var $this = $(this),
			settings = $.extend( {
				"dataListFields" : "",
				"ignoreFields" : "",				
				"dataFieldConfig" : [],
				"showMove" : true,		
				"showEdit" : true,	
				"showDelete" : true,					
				"objects": [],	
				"showDialogId" : false,
				"onClickAdd": function () {return true; },
				"onClickEdit": function () {return true; },
				"onClickRemove": function () {return true; },
				"onClickMoveUp": function () {return true; },
				"onClickMoveDown": function () {return true; },
				"afterArrayChange": function () {return true; },
				"afterInit": function () {return true; },
				"afterDialogShow": function () {return true; },
				"afterObjectAdd": function () {return true; },
				"afterObjectRemove": function () {return true; },
				"afterObjectUpdate": function () {return true; },
				"afterObjectMove": function () {return true; },
				"beforeObjectAdd": function () {return true; },	
				"beforeObjectUpdate": function () {return true; },
				"beforeObjectMove": function () {return true; },	
				"beforeObjectRemove": function () {return true; }	
			}, options);				

			if (settings.dataListFields.length){
				settings.dataListFields = settings.dataListFields.split(",");
			}

			if (settings.ignoreFields.length){
				settings.ignoreFields = settings.ignoreFields.split(",");
			}
			
			$this.data("settings", settings);
			
			initArray($this,settings.objects);
			renderDataTable($this); 
			renderDialog($this);
			
			if (typeof settings.afterInit === "function") { 
				if (!settings.afterInit.call(this,$this)) { 
					return false;
				}				
			}	
			
			
		},	

		getArrayObjects: function () {
			return $(this).data("objects");
		},

		getArrayJSON: function () {
			return JSON.stringify($(this).data("objects"));
		},		
		
		createItem: function (obj) {
			var $this = $(this),		
				settings = $this.data("settings"),
				trId = $this.attr("id")+"Tr",					
				alert = "",
				sHtml = "";

			if (typeof settings.beforeObjectAdd === "function") { 
				if (!settings.beforeObjectAdd.call(this,obj)) { 
					return false;
				}
			}					

			sHtml = getDataTableRowHtml($this,obj);
			
			if (isIdUnique($this,obj.id)) {
				$("table",this).append(sHtml);
				$("#"+trId+"_"+obj.id).hide();				
				$("#"+trId+"_"+obj.id).fadeIn('slow');
				
				$("#"+trId+"_"+obj.id).show();
				
				if (typeof jQuery.ui != 'undefined') {
					$("#"+trId +"_"+obj.id + " td").effect("highlight", {}, 1000);
				}
				
				addArrayObject($this,obj); 
				
				if (typeof settings.afterObjectAdd === "function") {					
					settings.afterObjectAdd.call(this,obj);					
				}
				
				if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
					settings.afterArrayChange.call(this,obj); // brings the scope to the callback
				}
				
			} else {
				alert("Non unique Id");
				return false;
			}			
			
			return true;
		},	

		updateItem: function (obj,origid) {
			var newHtml="",
				$this = $(this),
				settings = $this.data("settings"),				
				sHtml = getDataTableRowHtml($this,obj),					
				trId = $this.attr("id")+"Tr";				

			if (typeof settings.beforeObjectUpdate === "function") { 
				if (!settings.beforeObjectUpdate.call(this,obj)) {
					return false;
				}
			}	

			newHtml = sHtml.replace("</tr>", "").replace(/<tr(?:.|\n)*?>/gm, "");
			$("#"+trId+"_"+origid).hide().empty(); 
			$("#"+trId+"_"+origid).append(newHtml);
			$("#"+trId+"_"+origid).show();
			
			if (typeof jQuery.ui != 'undefined') {
				$("#"+trId +"_"+origid + " td").effect("highlight", {}, 1000);
			}
			
			$("#"+trId+"_"+origid).attr("id",trId+"_"+obj.id);			

			setArrayObject($this,obj,origid);

			if (typeof settings.afterObjectUpdate === "function") {
				settings.afterObjectUpdate.call(this,obj);
			}	
		
			if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
				settings.afterArrayChange.call(this,obj); // brings the scope to the callback
			}				
			
			
			return true;
		},		

		moveItem: function (id,dir) {	
			var $this = $(this),
				trId = $this.attr("id")+"Tr_"+id,
				currentTr = $("#"+trId),				
				settings = $this.data("settings"),				
				obj = getArrayObject($this,id);

			if (typeof settings.beforeObjectMove === "function") { 
				if (!settings.beforeObjectMove.call(this,obj)) { 
					return false;
				}
			}
				
			moveArrayItem($this,id,dir);
			
			if(dir === 1){
				currentTr.hide();
				currentTr.prev().before(currentTr);	
				currentTr.show();
				if (typeof jQuery.ui != 'undefined') {
					$("#"+trId + " td").effect("highlight", {}, 1000);
				}
			} else {
				currentTr.hide();
				currentTr.next().after(currentTr);
				currentTr.show();
				if (typeof jQuery.ui != 'undefined') {
					$("#"+trId + " td").effect("highlight", {}, 1000);
				}
			}	

			if (typeof settings.afterObjectMove === "function") {
				settings.afterObjectMove.call(this,obj);
			}	
			
			if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
				settings.afterArrayChange.call(this,obj); // brings the scope to the callback
			}				
						
			return $this;
		},
		
		editItem: function (id, dialogId) {
			var $this = $(this),				
				settings = $this.data("settings");	
				
				
			$( "#" + dialogId + " .jcDialogHeader span" ).html("Edit item" );								
			setDialogHtml($this,getArrayObject($this,id));
			
			$("#"+dialogId).fadeIn();
			
			$('html, body').animate({
				scrollTop: $("#"+dialogId).offset().top -20
			}, 500);
			
			if (typeof settings.afterDialogShow === "function") { 
				if (!settings.afterDialogShow.call(this,event)) { 
					return false;
				}				
			}				
			
		},	
		
		deleteItem: function (id) {
			var $this = $(this),
				trId = $this.attr("id")+"Tr_"+id,
				settings = $this.data("settings"),
				obj = getArrayObject($this,id);
			
			if (typeof settings.beforeObjectRemove === "function") { // make sure the callback is a function
				if (!settings.beforeObjectRemove.call(this,obj)) { 
					return false;
				}				
			}	
			
			removeArrayObject($this,obj); 
			$("#"+trId).remove();

			if (typeof settings.afterObjectRemove === "function") { // make sure the callback is a function
				settings.afterObjectRemove.call(this,obj); // brings the scope to the callback
			}
			
			if (typeof settings.afterArrayChange === "function") { // make sure the callback is a function
				settings.afterArrayChange.call(this,obj); // brings the scope to the callback
			}				
			
		},			
				
		

		addItem: function (dialogId) {				
			var $this = $(this),				
				settings = $this.data("settings");	
				
			$( "#"+dialogId +" .jcDialogHeader span" ).html("Add item" );
			setDialogHtml($this,[]);			
			
			$("#"+dialogId).fadeIn();
			
			$('html, body').animate({
				scrollTop: $("#"+dialogId).offset().top -20
			}, 500);
			
			if (typeof settings.afterDialogShow === "function") { 
				if (!settings.afterDialogShow.call(this,event)) { 
					return false;
				}				
			}				
		}		
		


	};

	$.fn.jcruddy = function (method) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === "object" || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( "Method " +  method + " does not exist in jcruddy" );
		} 
				
		return this;		
	} ; 
	
	/* Private functions */
	
	function initArray ($this, objects) {	
		var i = 0,
			len = 0,
			newItem = {},				
			settings = $this.data("settings"),
			newObjects = [];
			
		// find the item in the array and place it after
		for ( i = 0, len = objects.length; i < len; i++) {			
			newItem = {};	
			
			for (var key in objects[i]){
				if (objects[i].hasOwnProperty(key)){  
					if($.inArray(key,settings.ignoreFields) <= -1 ){											
						newItem[key] = objects[i][key];
					}	
				}					
			}				
			newObjects.push(newItem);			
		}		
		
		setArrayObjects($this,newObjects);
		return $this;
	}	
	
	function setArrayObjects ($this, objects) {	
		$this.data("objects", objects);				
		return $this;
	}
	
	function getArrayObject ($this,id) {	
		var i=0,
			len=0,						
			tmpObjects = $this.jcruddy("getArrayObjects"); 

		for ( i = 0, len = tmpObjects.length; i < len; i++) {
			if (tmpObjects[i].id == id) {					
				return tmpObjects[i];			
			}
		}
		return false;
	}

	function isIdUnique  ($this,id) {					
		var tmpObjects = $this.jcruddy("getArrayObjects"),
			i = 0,
			len = 0;

		for ( i = 0, len = tmpObjects.length; i < len; i++) {
			if (tmpObjects[i].id == id) {					
				return false;					
			}
		}	
		return true;
	}
	

	function moveArrayItem($this,id,dir) {	
		var i = 0,
			len = 0,
			movingItem = {},
			movingItemIndex = 0,
			tmpObjects = $this.jcruddy("getArrayObjects"),
			newObjects = [];		
			
		// if we are moving an item up, flip the array around and perform same operation below
		// then flip is back
		if( dir === 1){				
			tmpObjects = tmpObjects.reverse();
		}
		
		// find the item in the array and place it after
		for ( i = 0, len = tmpObjects.length; i < len; i++) {
			if (tmpObjects[i].id == id) {
				movingItem = tmpObjects[i];					
				movingItemIndex = i;
			} else {						
				if(!$.isEmptyObject( movingItem )){	
					newObjects[movingItemIndex] = tmpObjects[i];
					newObjects[i] = movingItem;
					movingItem = {};
				} else {
					newObjects[i] = tmpObjects[i];
				}
			}					
		}		
		
		// if moving up, flip array back
		if( dir === 1){
			newObjects = newObjects.reverse();
		}
		
		setArrayObjects($this,newObjects);
		return $this;
	}
	
	function setArrayObject($this,obj,id) {
		var i=0,
			len=0,
			tmpObjects = $this.jcruddy("getArrayObjects");

		for ( i = 0, len = tmpObjects.length; i < len; i++) {
			if (tmpObjects[i].id == id) {
				tmpObjects[i] = obj;
				break;					
			}
		}	

		setArrayObjects($this,tmpObjects);
		return $this;
	}

	function addArrayObject($this,obj) {
		var tmpObjects = $this.jcruddy("getArrayObjects");
		tmpObjects.push(obj);	
		setArrayObjects($this,tmpObjects);
		return $this;
	}

	function removeArrayObject($this,obj) {
		var i=0,
			len=0,
			tmpObjects = $this.jcruddy("getArrayObjects");			
			
		for ( i = 0, len = tmpObjects.length; i < len; i++) {				
			if (tmpObjects[i].id == obj.id) {
				tmpObjects.splice(i,1);	
				//console.log('found');
				break;					
			}
		}			
			
		setArrayObjects($this,tmpObjects); 
		return $this;
	}	


	function renderDataTable($this) {
		var dataTableHtml = getDataTableHtml($this),
			dialogId = $this.attr("id")+"Dialog",
			settings = $this.data("settings");	

		$this.append(dataTableHtml);	

		$(".jcTable").on("click.jcruddy", "a.removeButton", function (event) {				
			if (typeof settings.onClickRemove === "function") { 
				if (!settings.onClickRemove.call(this,event)) { 
					return false;
				}				
			}	
			
			$this.jcruddy("deleteItem",$(this).attr("data-id"));
		});	

		$(".jcTable", $this).on("click", ".editButton", function (event) {
			
			if (typeof settings.onClickEdit === "function") { 
				if (!settings.onClickEdit.call(this,event)) { 
					return false;
				}				
			}				
							
			$this.jcruddy("editItem",$(this).attr("data-id"),dialogId);						
			
		});	

		$(".jcTable", $this).on("click", ".upButton", function (event) {	
			if (typeof settings.onClickMoveUp === "function") { 
				if (!settings.onClickMoveUp.call(this,event)) { 
					return false;
				}				
			}	
			$this.jcruddy("moveItem",$(this).attr("data-id"),1);				
		});
		
		$(".jcTable", $this).on("click", ".downButton", function (event) {	
			if (typeof settings.onClickMoveDown === "function") { 
				if (!settings.onClickMoveDown.call(this,event)) { 
					return false;
				}				
			}	
			$this.jcruddy("moveItem",$(this).attr("data-id"),0);				
		});	
		
		$(".jcTable", $this).on("click", ".jcruddyAddItemLink", function (event) {				
			if (typeof settings.onClickAdd === "function") { 
				if (!settings.onClickAdd.call(this,event)) { 
					return false;
				}				
			}	
			
			$this.jcruddy("addItem",dialogId);	
			
		});	
		return $this;
	}	
	
	
	function getDataTableHtml($this) {	
		var tmpObjects = $this.jcruddy("getArrayObjects"),		
			sReturn = "<table cellpadding='0' cellspacing='0' class='jcTable' border='0' >" + getDataTableHeaderHtml($this);	

		sReturn += "<tbody>";
		$.each(tmpObjects, function (index, item) {					
			sReturn += getDataTableRowHtml($this,item);	
		});
		sReturn += "</tbody></table>";
		return sReturn;
	}

	function getDataTableHeaderHtml  ($this) {
		var settings = $this.data("settings"),
			tmpObjects = $this.jcruddy("getArrayObjects"),	
			key="",
			colspan = 1,
			sReturnHead = "<thead><tr>",
			sReturnFoot = "<tfoot><tr>";

		if(settings.dataListFields.length !== 0){
			if (settings.dataFieldConfig.length !== 0) {
				$.each(settings.dataFieldConfig, function (index, item) {	
					if($.inArray(item.field,settings.dataListFields) > -1 ){											
						sReturnHead += "<th >"+item.title+"</th>";
						colspan++;
					}				
				});
			} else {
				for (key in tmpObjects[0]) {
					if (tmpObjects[0].hasOwnProperty(key)){  
						if($.inArray(key,settings.dataListFields) > -1 ){											
							sReturnHead += "<th >"+key+"</th>";
							colspan++;
						}
					}
				}
			}
		} else {
			if (settings.dataFieldConfig.length !== 0) {
				$.each(settings.dataFieldConfig, function (index, item) {	
						sReturnHead += "<th >"+item.title+"</th>";
						colspan++;
				});
			} else {
				for (key in tmpObjects[0]) {
					if (tmpObjects[0].hasOwnProperty(key)){  
						sReturnHead += "<th >"+key+"</th>";
						colspan++;
					}
				}
			}		
		
		}
			
		sReturnHead += "<th></th></tr></thead>";			
		sReturnFoot += "<td colspan='"+colspan+"' ><a href='javascript:;' class='jcruddyAddItemLink' title='Add Item' ><span>Add Item</span><i class='icon-plus' ></i></a></td></tfoot>";			

		return sReturnHead + sReturnFoot;
	}			
	

	function getDataTableRowHtml($this, item) {
		var key="",
			settings = $this.data("settings"),
			dialogId = $this.attr("id")+"Tr",
			sReturn = "<tr id='"+dialogId+"_"+item.id+"' >";

		if (settings.dataListFields.length !== 0) {				
			$.each(settings.dataListFields, function (idx, fielditem) {					
				sReturn += "<td>"+item[fielditem]+"</td>";
			});			
		} else {
			for (key in item) {
				if (item.hasOwnProperty(key)){  
					sReturn += "<td>"+item[key]+"</td>";
				}
			}				
		}	
		sReturn += "<td>";
		
		if(settings.showMove){
			sReturn += "<a href='javascript:;' class='downButton icon-chevron-down' title='Down' data-id='"+item.id+"'><span>Down</span></a>";
			sReturn += "<a href='javascript:;' class='upButton icon-chevron-up' title='Up' data-id='"+item.id+"'><span>Up</span></a>";
		} else {
			sReturn += "<i class='icon-blank'></i><i class='icon-blank'></i>";
		}
		
		if(settings.showEdit){
			sReturn += "<a href='javascript:;' class='editButton icon-pencil' title='Edit' data-id='"+item.id+"'><span>Edit</span></a>";
		}else {
			sReturn += "<i class='icon-blank'></i>";
		}
		
		if(settings.showDelete){
			sReturn += "<a href='javascript:;' class='removeButton icon-remove' title='Remove' data-id='"+item.id+"'><span>Remove</span></a>";
		}else {
			sReturn += "<i class='icon-blank'></i>";
		}			
	
		sReturn += "</td></tr>";			
		return sReturn;
	}		

	function renderDialog($this) {
		var dialogId = $this.attr("id")+"Dialog",
			dialogHtml = "<div class='jcDialog' title='Item' id='"+dialogId+"'>";
			
		dialogHtml += "<div class='jcDialogHeader'><span>New Item</span></div>";
		dialogHtml += "<div class='jcDialogItems'></div>";
		
		dialogHtml += "<div class='jcDialogButtons'><a class='jcDialogCancel' href='javascript:;'><i class='icon-undo'></i><span>Cancel</span></a>";
		dialogHtml += "<a class='jcDialogSubmit' href='javascript:;'><i class='icon-ok'></i><span>OK</span></a></div>";
		dialogHtml += "</div>";

		$this.prepend(dialogHtml);	
		
		if (typeof jQuery.ui != 'undefined') {
			$("#"+dialogId).draggable();   
		}			
		
				
		$("#"+dialogId).hide();			
		
		$(".jcDialogSubmit", $this).click(function (index, item) {			
			var tmpObj = {},
				isValid = true,
				origId = $("#"+dialogId+" input[name='jcDialogItemId']").val();					

			$.each($("#"+dialogId+" input:not(:checkbox):not(:radio),#"+dialogId+" textarea"), function (index,item) {											
				var field=item.name,
					value = item.value,
					isRequired = ($(item).data('required') == '1') ? true : false;								
				
				if(isRequired && !value.length){
					isValid = false;
					//console.log('not valid');
				}					
								
				if (field !== "jcDialogItemId") {
					tmpObj[field]=item.value;
				}	
				
			});

			$.each($("#"+dialogId+" select"), function (index,item) {											
				var field =item.name,
					value = $(item).val(),
					isRequired = ($(item).data('required') == '1') ? true : false;	
				
				if(isRequired && !value.length){
					isValid = false;
					//console.log('not valid');
				}	
				
				tmpObj[field]=value;										
			});				
			
			$.each($("#"+dialogId+" .checkboxGroup"), function (index,item) {											
				var field = $(item).data("name"),
					isRequired = ($(item).data('required') == '1') ? true : false,
					values = "";
				$.each($("input[name='"+field+"[]']:checked"), function() {
					if(values.length !== 0){
						values += ',';
					}
					values += $(this).val();
					
				});

				if(isRequired && !values.length){
					isValid = false;
					//console.log('not valid');
				}						
				
				tmpObj[field]=values;	
				//console.log(values)					
			});				
			
			$.each($("#"+dialogId+" input:radio:checked"), function(index,item) {
				var field =item.name,
					value = $(item).val(),
					isRequired = ($(item).data('required') == '1') ? true : false;		
				
				if(isRequired && !value.length){
					isValid = false;						
				}	
				
				tmpObj[field]=value;		
			});
			
			if(isValid){
				if (origId==="") {
					if ($this.jcruddy("createItem",tmpObj) ) {
						$("#"+dialogId).fadeOut('fast');
					} 
				} else {
					if ($this.jcruddy("updateItem",tmpObj,origId)) {							
						$("#"+dialogId).fadeOut('fast');
					}
				}
			} else {
				alert('Please enter all required fields');
			}
			
			
		});	

		$(".jcDialogCancel, .jcDialogHeader a.icon",$this).click(function (index, item) {	
			$("#"+dialogId).fadeOut('fast');
		});	

		return $this;
	}


	
	function setDialogHtml($this, obj) {
		var sHtml = "",
			sOptions = "",									
			key = "",	
			i = 0,		
			settings = $this.data("settings"),
			tmpObjects = $this.jcruddy("getArrayObjects"),					
			value="",
			isNew = (obj.id) ? false : true;
			//console.log(obj);
		$("#"+$this.attr("id") +"Dialog .jcDialogItems").empty();

		if (isNew) {
			sHtml += "<input name='jcDialogItemId' type='hidden' value='' />";				
		} else {
			sHtml += "<input name='jcDialogItemId' type='hidden' value='"+obj.id+"' />";
		}

		if (settings.dataFieldConfig.length !== 0) {			
			$.each(settings.dataFieldConfig, function (index, item) {
						
				var val = (isNew) ? "" : obj[item.field],
					isRequired = 0,
					inputID = '',
					sFieldClass = "";					
				
				if(item.required==='1'){
					isRequired = 1;
					sFieldClass = "required ";		
				}
				
				switch(item.type){
				
				case 'select':
					
					sOptions = "<option value='' ";
					if(isNew){
						sOptions += " selected "; 
					}
					sOptions += " >Please select</option>";

					
					for (i = 0; i < item.options.length; i++) {								
						sOptions += "<option value='"+item.options[i].value+"' ";
						if(!isNew && item.options[i].value === obj[item.field]){
							sOptions += " selected "; 
						}
						sOptions += " >"+item.options[i].label+"</option>";
					}
					
					sHtml += "<div class='"+sFieldClass+"' data-name='"+item.field+"'><span>"+item.title+"</span><select data-required='"+isRequired+"' name='"+item.field+"' "+item.attributes+" >";
					sHtml += sOptions;
					sHtml += "</select></div>";
					break;
				
				case 'checkbox':			

					sOptions = "";
					
					for (i = 0; i < item.options.length; i++) {	
						inputID = 'check_' + item.field + '_' + i;
						sOptions += "<input id='"+inputID+"'  type='checkbox' name='"+item.field+"[]' value='"+item.options[i].value+"' ";								
						if(!isNew && obj[item.field].indexOf(item.options[i].value) !== -1){
							sOptions += " checked='checked' "; 
						} else if( isNew && item.options[i].def === '1'){
							sOptions += " checked='checked' "; 
						}
						sOptions += " /><label for='"+inputID+"'>"+item.options[i].label+"</label><br />";
					}
					
					sHtml += "<div data-name='"+item.field+"' class='checkboxGroup"+sFieldClass+"'  data-required='"+isRequired+"' >";
					sHtml += "<span>"+item.title+"</span>";
					sHtml += sOptions;
					sHtml += "</div>";
					break;

				case 'radio':			

					sOptions = "";
					
					for (i = 0; i < item.options.length; i++) {	
						inputID = 'radio_' + item.field + '_' + i;
						sOptions += "<input id='"+inputID+"' type='radio' name='"+item.field+"' value='"+item.options[i].value+"' ";							
						
						
						if(!isNew && obj[item.field] == item.options[i].value){
							sOptions += " checked='checked' "; 
						} else if( isNew && item.options[i].def === '1'){
							sOptions += " checked='checked' "; 
						}
						sOptions += " /><label for='"+inputID+"'>"+item.options[i].label+"</label><br />";
					}
					
					sHtml += "<div data-name='"+item.field+"' class='radioGroup"+sFieldClass+"'  data-required='"+isRequired+"' >";
					sHtml += "<span>"+item.title+"</span>";
					sHtml += sOptions;
					sHtml += "</div>";
					break;						
					
				
				case 'textarea':
					sHtml += "<div class='"+sFieldClass+"' data-name='"+item.field+"'><span>"+item.title+"</span>";
					sHtml += "<textarea name='"+item.field+"' "+item.attributes+"  data-required='"+isRequired+"' >"+val+"</textarea></div>";
					break;
				default:
					sHtml += "<div class='"+sFieldClass+"' data-name='"+item.field+"'><span>"+item.title+"</span>";
					sHtml += "<input name='"+item.field+"' value='"+val+"' type='"+item.type+"'  data-required='"+isRequired+"'  "+item.attributes+"  /></div>";
				}
									
			});	
			
		} else {
			if (isNew) {						
				for (key in tmpObjects[0]) {
					if (tmpObjects[0].hasOwnProperty(key)){  
						sHtml += "<div class='fieldcontainer' data-name='"+key+"'><label>"+key+"</label><input name='"+key+"' value='' /></div>";
					}
				}
			}else{					
				for (key in obj) {
					if (obj.hasOwnProperty(key)){  
						value = obj[key];		
						sHtml += "<div class='fieldcontainer' data-name='"+key+"'><label>"+key+"</label><input name='"+key+"' value='"+value+"' /></div>";
					}
				}
			}				
		}
		

		
		$("#"+$this.attr("id") +"Dialog .jcDialogItems").append(sHtml);
		$("#"+$this.attr("id") +"Dialog .required label").append("<i>*</i>");

		if($("#"+$this.attr("id") +"Dialog input[name='id']").val() === "" ){
			$("#"+$this.attr("id") +"Dialog input[name='id']").val(Math.round((new Date()).getTime()));
		}
		
		if(!settings.showDialogId){				
			$("#"+$this.attr("id") +"Dialog input[name='id']").parent().hide();
		}			
		
		return $this;
	}
	
})(jQuery);