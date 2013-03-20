/** //pod/propItem.js
 *
 */
YUI.add('jak-pod-propItem',function(Y){

    Y.namespace('JAK.pod').propItem=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title :'Property Items',
            width :400,
            xy    :[150,40],
            zIndex:99999
        },cfg);

        this.info={
            id         :'propItem',
            title      :cfg.title,
            description:'propItem details',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            render={},
            trigger={}
        ;

        this.display=function(p){
            d.params=Y.merge(d.params,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            select:self.info.id+(++JAK.env.customEventSequence)+':select'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
        };

        io={
            fetch:{
                propItem:function(){
                    Y.JAK.widget.busy.set('message','getting property item(s)...');
                    Y.io('/db/propItem/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.propItem},
                        data:Y.JSON.stringify([{
                            criteria:{propItemIds:[d.params.propItem]},
                            member  :JAK.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.checkAll.on('click',function(){
                h.list.all('input[type="checkbox"]').set('checked',this.get('checked'));
            });
            h.selectLists.on('change',function(){
                var propTemplateId   =parseInt(this.get('value'),10),
                    propItemTypes    =JAK.data.propItemType,
                    propTemplateItems=JAK.data.propTemplateItem
                ;
                h.list.setContent('');
                h.checkAll.set('checked',true);
                if(propTemplateId===0){
                    Y.each(propItemTypes,function(propItemType){
                        h.list.append('<li><input type="checkbox" checked="checked" value="'+propItemType.id+'" /><input type="text" value="1" />'+propItemType.name+'</li>');
                    });
                }else{
                    Y.each(propTemplateItems,function(propTemplateItem){
                        if(propTemplateItem.propTemplate!==propTemplateId){return;}
                        h.list.append('<li><input type="checkbox" value="'+propTemplateItem.propItemType+'" checked="checked" /><input type="text" value="'+propTemplateItem.defaultRecs+'" />'+propItemTypes[propTemplateItem.propItemType].name+'</li>');
                    });
                }
            });
            h.save.on('click',function(){
                var recs=[]
                ;
                h.list.all('li > input:checked').each(function(n){
                    recs.push({
                        propItemType:parseInt(n.get('value'),10),
                        qty         :parseInt(n.next().get('value'),10)
                    });
                });
                Y.fire(self.customEvent.select,recs);
                h.close.simulate('click');
            });
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        '<input type="checkbox" class="jak-checkall" checked="checked" />'
                       +'<select class="jak-select-lists">'
                       +  '<option value="0">Specific Property Items</option>'
                       +  '<optgroup label="Templates"></optgroup>'
                       +'</select>'
                       +'<ul></ul>',
                    footerContent:
                        Y.JAK.html('btn',{action:'save',title:'return property items',label:'return selection'}),
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd         =h.ol.headerNode;
                    h.bd         =h.ol.bodyNode;
                    h.ft         =h.ol.footerNode;
                    h.bb         =h.ol.get('boundingBox');
                    h.close      =h.hd.one('.jak-close');
                    h.checkAll   =h.bd.one('.jak-checkall');
                    h.selectLists=h.bd.one('.jak-select-lists');
                    h.list       =h.bd.one('ul');
                    h.save       =h.ft.one('.jak-save');
                Y.each(JAK.data.propTemplate,function(propTemplate){
                    h.selectLists.one('optgroup').append('<option value="'+propTemplate.id+'">'+propTemplate.name+'</option>');
                });
            }
        };

        trigger={
            reset:function(){
                
            }
        };

        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
            ['propTemplate','id'],
            ['propTemplateItem','id'],
            ['propItemType','id']
        ],function(){

            render.base();
            initialise();
            listeners();
            h.selectLists.simulate('change');

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
