(function ($, jQuery, undefined) {
  var methods = {
		init : function (options) {
			var jQuerythis = jQuery(this),
			settings = jQuery.extend( {
				"dataListFields" : "",
				"ignoreFields" : "",				
				"dataFieldConfig" : [],
				"showMove" : true,		
				"objects": [],	
				"showDialogId" : true,
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
			
			jQuerythis.data("settings", settings);
			jQuerythis.jcruddy("initArray",settings.objects);
			//jQuerythis.jcruddy("setArrayObjects",settings.objects);
			jQuerythis.jcruddy("renderDataTable"); 
			jQuerythis.jcruddy("renderDialog");
		},	

		initArray: function (objects) {	
			var i = 0,
				len = 0,
				newItem = [],
				jQuerythis = jQuery(this),
				settings = jQuerythis.data("settings"),
				newObjects = [];
				
			// find the item in the array and place it after
			for ( i = 0, len = objects.length; i < len; i++) {			
				newItem = [];	
				//newItem.id = objects[i][settings.idField];				
				//newItem = objects[i];
				
				for (var key in objects[i]){
					if (objects[i].hasOwnProperty(key)){  
						if(jQuery.inArray(key,settings.ignoreFields) <= -1 ){											
							newItem[key] = objects[i][key];
						}	
					}					
				}			
				
				newObjects.push(newItem);
				//console.log(newItem);
			}	
			
			
			jQuerythis.jcruddy("setArrayObjects",newObjects);
			return jQuerythis;
		},



		
		getArrayObjects: function () {
			return jQuery(this).data("objects");
		},

		setArrayObjects: function (objects) {	
			jQuery(this).data("objects", objects);				
			return this;
		},

		getArrayObject: function (id) {	
			var i=0,
				len=0,
				jQuerythis = jQuery(this),		
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"); 

			for ( i = 0, len = tmpObjects.length; i < len; i++) {
				if (tmpObjects[i].id === id) {					
					return tmpObjects[i];			
				}
			}
			return false;
		},

		moveArrayItem: function (id,dir) {	
			var i = 0,
				len = 0,
				movingItem = {},
				movingItemIndex = 0,
				jQuerythis = jQuery(this),
				settings = jQuerythis.data("settings"),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"),
				newObjects = [];
			
			// if we are moving an item up, flip the array around and perform same operation below
			// then flip is back
			if( dir === 1){				
				tmpObjects = tmpObjects.reverse();
			}
			
			// find the item in the array and place it after
			for ( i = 0, len = tmpObjects.length; i < len; i++) {
				if (tmpObjects[i].id === id) {
					movingItem = tmpObjects[i];					
					movingItemIndex = i;
				} else {						
					if(!jQuery.isEmptyObject( movingItem )){	
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
			
			jQuerythis.jcruddy("setArrayObjects",newObjects);
			return jQuerythis;
		},
		
		setArrayObject: function (obj,id) {
			var i=0,
				len=0,
				jQuerythis = jQuery(this),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects");

			for ( i = 0, len = tmpObjects.length; i < len; i++) {
				if (tmpObjects[i].id === id) {
					tmpObjects[i] = obj;
					break;					
				}
			}	

			jQuerythis.jcruddy("setArrayObjects",tmpObjects);
			return jQuerythis;
		},

		addArrayObject: function (obj) {
			var jQuerythis = jQuery(this),		
				tmpObjects = jQuerythis.jcruddy("getArrayObjects");
			tmpObjects.push(obj);	
			jQuerythis.jcruddy("setArrayObjects",tmpObjects);
			return jQuerythis;
		},

		removeArrayObject: function (id) {
			var i=0,
				len=0,
				jQuerythis = jQuery(this),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects");

			for ( i = 0, len = tmpObjects.length; i < len; i++) {
				if (tmpObjects[i].id === id) {
					tmpObjects.splice(i,1);	
					break;					
				}
			}			

			jQuerythis.jcruddy("setArrayObjects",tmpObjects); 
			return jQuerythis;
		},

		renderDataTable: function () {
			var jQuerythis = jQuery(this),
				dataTableHtml = jQuerythis.jcruddy("getDataTableHtml"),
				dialogId = jQuery(this).attr("id")+"Dialog",
				settings = jQuerythis.data("settings");	

			jQuerythis.append(dataTableHtml);	

			jQuery(".jcruddyTable").on("click.jcruddy", "a.removeButton", function (event) {
				var obj = jQuerythis.jcruddy("getArrayObject",jQuery(this).attr("data-id"));
			
				if (typeof settings.beforeObjectRemove === "function") { // make sure the callback is a function
					if (!settings.beforeObjectRemove.call(this,obj)) { 
						return false;
					}				
				}	

				
				jQuerythis.jcruddy("removeArrayObject",obj); 
				jQuery(this).closest("tr").remove();

				if (typeof settings.afterObjectRemove === "function") { // make sure the callback is a function
					settings.afterObjectRemove.call(this,obj); // brings the scope to the callback
				}
			});	

			jQuery(".jcruddyTable", this).on("click", ".editButton", function (event) {
				//console.log(event);			
				jQuery( "#" + dialogId + " h2" ).html("Edit item" );					
				jQuerythis.jcruddy("setDialogHtml",jQuerythis.jcruddy("getArrayObject",jQuery(this).attr("data-id")));
				//console.log("#"+dialogId)
				jQuery("#"+dialogId).fadeIn();	
			});	

			jQuery(".jcruddyTable", this).on("click", ".upButton", function (event) {	
				jQuerythis.jcruddy("moveItem",jQuery(this).attr("data-id"),1);				
			});
			
			jQuery(".jcruddyTable", this).on("click", ".downButton", function (event) {	
				jQuerythis.jcruddy("moveItem",jQuery(this).attr("data-id"),0);				
			});	
			
			jQuery(".jcruddyTable", this).on("click", ".jcruddyAddItem", function (event) {				
				jQuery( "#"+dialogId +" h2" ).html("Add item" );
				jQuerythis.jcruddy("setDialogHtml",[]);
				jQuery("#"+dialogId).fadeIn();
			});				

			return jQuerythis;
		},		

		getDataTableHtml: function () {	
			var jQuerythis = jQuery(this),	
				settings = jQuerythis.data("settings"),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"),		
				sReturn = "<table cellpadding='0' cellspacing='0' class='jcruddyTable' border='0' >" + jQuerythis.jcruddy("getDataTableHeaderHtml");	

			jQuery.each(tmpObjects, function (index, item) {					
				sReturn += jQuerythis.jcruddy("getDataTableRowHtml",item);	
			});
			sReturn += "</table>";
			return sReturn;
		},

		getDataTableHeaderHtml: function () {
			var jQuerythis = jQuery(this),	
				settings = jQuerythis.data("settings"),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"),	
				key="",
				sReturn = "<tr class='jcruddyTableHeader'>";

			if(settings.dataListFields.length !== 0){
				if (settings.dataFieldConfig.length !== 0) {
					jQuery.each(settings.dataFieldConfig, function (index, item) {	
						if(jQuery.inArray(item.field,settings.dataListFields) > -1 ){											
							sReturn += "<th >"+item.title+"</th>";
						}				
					});
				} else {
					for (key in tmpObjects[0]) {
						if (tmpObjects[0].hasOwnProperty(key)){  
							if(jQuery.inArray(key,settings.dataListFields) > -1 ){											
								sReturn += "<th >"+key+"</th>";
							}
						}
					}
				}
			} else {
				if (settings.dataFieldConfig.length !== 0) {
					jQuery.each(settings.dataFieldConfig, function (index, item) {	
							sReturn += "<th >"+item.title+"</th>";
					});
				} else {
					for (key in tmpObjects[0]) {
						if (tmpObjects[0].hasOwnProperty(key)){  
							sReturn += "<th >"+key+"</th>";
						}
					}
				}		
			
			}
				
			sReturn += "<th >&nbsp;</th><th >&nbsp;</th><th >&nbsp;</th><th ><a href='javascript:;' title='Add Item' class='jcruddyAddItem icon-plus icon'><span>Add Item</span></a></th></tr>";			
			return sReturn;
		},		

		getDataTableRowHtml: function (item) {
			var key="",
				jQuerythis = jQuery(this),
				settings = jQuerythis.data("settings"),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"),
				dialogId = jQuery(this).attr("id")+"Tr",
				sReturn = "<tr id='"+dialogId+"_"+item.id+"' class='jcruddyDataRow'>";

			if (settings.dataListFields.length !== 0) {				
				jQuery.each(settings.dataListFields, function (idx, fielditem) {					
					sReturn += "<td>"+item[fielditem]+"</td>";
				});			
			} else {
				for (key in item) {
					if (item.hasOwnProperty(key)){  
						sReturn += "<td>"+item[key]+"</td>";
					}
				}				
			}	
			if(settings.showMove){
				sReturn += "<td><a href='javascript:;' class='downButton icon icon-chevron-down' title='Down' data-id='"+item.id+"'><span>Down</span></a></td>";
				sReturn += "<td><a href='javascript:;' class='upButton icon icon-chevron-up' title='Up' data-id='"+item.id+"'><span>Up</span></a></td>";
			} else {
				sReturn += "<td>&nbsp;</td><td>&nbsp;</td>";
			}
			sReturn += "<td><a href='javascript:;' class='editButton icon icon-pencil' title='Edit' data-id='"+item.id+"'><span>Edit</span></a></td>";
			sReturn += "<td><a href='javascript:;' class='removeButton icon icon-remove' title='Remove' data-id='"+item.id+"'><span>Remove</span></a></td>";
			sReturn += "</tr>";			
			return sReturn;
		},		

		renderDialog: function () {
			var jQuerythis = jQuery(this),	
				dialogId = jQuery(this).attr("id")+"Dialog",
				dialogHtml = "<div class='jcruddyDialog' title='Item' id='"+dialogId+"'>";
				
			dialogHtml += "<div class='jcruddyDialogHeader'><h2>New Item</h2><a class='icon icon-remove icon-red' href='javascript:;'><span>Close</span></a></div>";
			dialogHtml += "<div class='jcruddyDialogItems'></div>";
			
			dialogHtml += "<div class='jcruddyDialogButtons'><a class='jcruddyDialogCancel icon icon-arrow-left icon-red' href='javascript:;'><span>Cancel</span></a><a class='jcruddyDialogSubmit icon icon-ok icon-green' href='javascript:;'><span>Submit</span></a></div>";
			dialogHtml += "</div>";

			jQuerythis.prepend(dialogHtml);	
			jQuery("#"+dialogId).hide();
			jQuery(".jcruddyDialogSubmit", this).click(function (index, item) {			
				var tmpObj = [],
					origId = jQuery("#"+dialogId+" input[name='jcruddyDialogItemId']").val();					

				jQuery.each(jQuery("#"+dialogId+" input"), function (index,item) {											
					var field=item.name;
					if (field !== "jcruddyDialogItemId") {
						tmpObj[field]=item.value;
					}						
				});

				if (origId==="") {
					if (jQuerythis.jcruddy("createItem",tmpObj) ) {
						jQuery("#"+dialogId).fadeOut('fast');
					} 
				} else {
					if (jQuerythis.jcruddy("updateItem",tmpObj,origId)) {							
						jQuery("#"+dialogId).fadeOut('fast');
					}
				}
			});	

			jQuery(".jcruddyDialogCancel, .jcruddyDialogHeader a.icon",this).click(function (index, item) {	
				jQuery("#"+dialogId).fadeOut('fast');
			});	

			return jQuerythis;
		},

		setDialogHtml: function (obj) {
			var jQuerythis = jQuery(this),
				sHtml = "",
				key = "",				
				settings = jQuerythis.data("settings"),
				tmpObjects = jQuerythis.jcruddy("getArrayObjects"),					
				value="",
				isNew = (obj.id) ? false : true;
			
			jQuery("#"+jQuerythis.attr("id") +"Dialog .jcruddyDialogItems").empty();

			if (isNew) {
				sHtml += "<input name='jcruddyDialogItemId' type='hidden' value='' />";				
			} else {
				sHtml += "<input name='jcruddyDialogItemId' type='hidden' value='"+obj.id+"' />";
			}

			if (settings.dataFieldConfig.length !== 0) {			
				jQuery.each(settings.dataFieldConfig, function (index, item) {
					var val = (isNew) ? "" : obj[item.field];						
					sHtml += "<div><input name='"+item.field+"' value='"+val+"' type='"+item.type+"' "+item.options+"  /><label>"+item.title+"</label></div>";
				});				
			} else {
				if (isNew) {						
					for (key in tmpObjects[0]) {
						if (tmpObjects[0].hasOwnProperty(key)){  
							sHtml += "<div><input name='"+key+"' value='' /><label>"+key+"</label></div>";
						}
					}
				}else{					
					for (key in obj) {
						if (obj.hasOwnProperty(key)){  
							value = obj[key];		
							sHtml += "<div><input name='"+key+"' value='"+value+"' /><label>"+key+"</label></div>";
						}
					}
				}				
			}
			//console.log(sHtml)

			
			jQuery("#"+jQuerythis.attr("id") +"Dialog .jcruddyDialogItems").append(sHtml);

			if(jQuery("#"+jQuerythis.attr("id") +"Dialog input[name='id']").val() === "" ){
				jQuery("#"+jQuerythis.attr("id") +"Dialog input[name='id']").val(Math.round((new Date()).getTime()));
			}
			
			if(!settings.showDialogId){
				//console.log('hide')
				jQuery("#"+jQuerythis.attr("id") +"Dialog input[name='id']").parent().hide();
			}			
			
			return jQuerythis;
		},		

		isIdUnique: function (id) {					
			var tmpObjects = jQuery(this).jcruddy("getArrayObjects"),
				i = 0,
				len = 0;

			for ( i = 0, len = tmpObjects.length; i < len; i++) {
				if (tmpObjects[i].id === id) {					
					return false;					
				}
			}	
			return true;
		},

		
		
		
		createItem: function (obj) {
			var jQuerythis = jQuery(this),		
				settings = jQuerythis.data("settings"),
				trId = jQuery(this).attr("id")+"Tr",					
				alert = "",
				sHtml = "";

			if (typeof settings.beforeObjectAdd === "function") { 
				if (!settings.beforeObjectAdd.call(this,obj)) { 
					return false;
				}
			}					

			sHtml = jQuerythis.jcruddy("getDataTableRowHtml",obj);
			
			if (jQuerythis.jcruddy("isIdUnique",obj.id)) {
				jQuery("table",this).append(sHtml);
				jQuery("#"+trId+"_"+obj.id).hide();
				jQuery("#"+trId+"_"+obj.id).fadeIn('slow');
				jQuerythis.jcruddy("addArrayObject",obj); 
				
				if (typeof settings.afterObjectAdd === "function") {
					//console.log('rture1')
					var x = settings.afterObjectAdd.call(this,obj);
					//console.log('rture2')
				}	
			} else {
				alert("Non unique Id");
				return false;
			}
			//console.log('rture');
			return true;
		},	

		updateItem: function (obj,origid) {
			var newHtml="",
				jQuerythis = jQuery(this),
				settings = jQuerythis.data("settings"),				
				sHtml = jQuerythis.jcruddy("getDataTableRowHtml",obj),					
				trId = jQuery(this).attr("id")+"Tr";				

			if (typeof settings.beforeObjectUpdate === "function") { 
				if (!settings.beforeObjectUpdate.call(this,obj)) {
					return false;
				}
			}	

			newHtml = sHtml.replace("</tr>", "").replace(/<tr(?:.|\n)*?>/gm, "");
			jQuery("#"+trId+"_"+origid).hide().empty(); 
			jQuery("#"+trId+"_"+origid).append(newHtml);
			jQuery("#"+trId+"_"+origid).fadeIn('slow');
			
			jQuery("#"+trId+"_"+origid).attr("id",trId+"_"+obj.id);
			

			jQuerythis.jcruddy("setArrayObject",obj,origid);

			if (typeof settings.afterObjectUpdate === "function") {
				settings.afterObjectUpdate.call(this,obj);
			}	
			return true;
		},		

		moveItem: function (id,dir) {	
			var jQuerythis = jQuery(this),
				trId = jQuery(this).attr("id")+"Tr_"+id,
				currentTr = jQuery("#"+trId),				
				settings = jQuerythis.data("settings"),
				tmpObjects = [],
				obj = jQuerythis.jcruddy("getArrayObject",id);

			if (typeof settings.beforeObjectMove === "function") { 
				if (!settings.beforeObjectMove.call(this,obj)) { 
					return false;
				}
			}
				
			jQuerythis.jcruddy("moveArrayItem",id,dir);
			
			if(dir === 1){
				currentTr.hide();
				currentTr.prev().before(currentTr);	
				currentTr.fadeIn('slow');
			} else {
				currentTr.hide();
				currentTr.next().after(currentTr);
				currentTr.fadeIn('slow');
			}	

			if (typeof settings.afterObjectMove === "function") {
				settings.afterObjectMove.call(this,obj);
			}				
						
			return jQuerythis;
		},
	
		nothing :	function () {			
			//This function does... nothing!
		}
	};

	jQuery.fn.jcruddy = function (method) {

		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === "object" || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			jQuery.error( "Method " +  method + " does not exist in jcruddy" );
		} 
				
		return this;		
	};  
})(jQuery,jQuery);