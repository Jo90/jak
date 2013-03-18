/** //pod/propItem.js
 *
 */
YUI.add('jak-pod-propItem',function(Y){

    Y.namespace('JAK.pod').propItem=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title :'propItem',
            width :720,
            xy    :[10,20],
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
            populate={},
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
            h.save.on('click',function(){
                var rs={}
                ;
                //compile selection



                
                Y.fire(self.customEvent.select,rs);
            });
        };

        populate={
            propItem:function(id,o){
                var rs       =Y.JSON.parse(o.responseText)[0].result
                ;






                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        '<select class="jak-select-lists">'
                       +  '<option>Specific Property Items</option>'
                       +'</select>',
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
                    h.selectLists=h.bd.one('.jak-select-lists');
                    h.save       =h.ft.one('.jak-save');


                Y.each(JAK.data.propTemplate,function(propTemplate){
                    h.selectLists.append('<option value="'+propTemplate.id+'">'+propTemplate.name+'</option>');
                });

                    
            }
        };

        trigger={
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

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
