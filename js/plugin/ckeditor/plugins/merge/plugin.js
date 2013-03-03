/*
Project: Plugin for CKEditor - dynamically add merge fields to toolbar.
Copyright (c) 2011, Wiseberry Real Estate. All rights reserved.
Developer: JWS
*/

(function(){
    b='merge';
    CKEDITOR.plugins.add(b,{
        init:function(c){
            c.ui.addRichCombo(
            'Merge',
            {
            label: 'Merge Field',
            title: 'Insert Merge Field',
            multiSelect : false,
            panel: { // This is necessary
                        css: [CKEDITOR.getUrl(c.skinPath + 'editor.css')].concat(c.config.contentsCss)
                    },
			
			// Called only on the first drop-down
			init : function () { 
			
			//Start Group
			//this.startGroup( 'Merge Field' );
			
			//JSON of group elements
			//Should be replaced with AJAX call for dynamic elements
			var a = { firstname: "First Name", 
					  lastname: "Last Name", 
					  streetAddress: "Street Address", 
					  suburb: "Suburb",
					  state: "State",
					  postcode: "Postcode" };
			
			// Loop over object, adding all items to the combo as [key] -> [value] pairs
			for (var key in a) {
				  if (a.hasOwnProperty(key)) {
				  // value, html, text
					this.add( key, a[key], a[key] );
				  }
				}
            },
            
            onClick : function(value) {
		                var v = "{{ " + value + " }}";
		                c.fire('saveSnapshot');
		                c.insertHtml(v);
		            }		            
           });
        }
    });    
})();