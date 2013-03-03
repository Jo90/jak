/** //widget/themeSelector.js
 *
 */
YUI.add('jak-widget-themeSelector',function(Y){

    Y.namespace('JAK.widget').themeSelector=function(o){
        var nn=Y.Node.create('<select></select>')
           ,body=Y.one('body')
        ;
        o.node.append(nn);

        Y.each(JAK.data.theme,function(theme){
            nn.append(
                '<option value="'+theme.id+'" title="'+theme.note+'"'+(body.hasClass(theme.css)?' selected="selected"':'')+'">'
               +  theme.name
               +'</option>'
            );
        });

        nn.on('change',function(){
            Y.Cookie.set('jak-theme',this.get('value'));
            if(confirm('Your theme has been selected and will be used when you next load this page.\n\nDo you wish to reload page now?\n\nWarning: This will clear any present tabs.')){
                window.location.reload();
            }
        });
    };

},'September 2011',{requires:['base','cookie','node']});
