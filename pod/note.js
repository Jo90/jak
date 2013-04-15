/** //pod/note.js
 *
 */
YUI.add('jak-pod-note',function(Y){

    Y.namespace('JAK.pod').note=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'note',
            width      :1000,
            xy         :[10,20],
            zIndex     :99999
        },cfg);

        this.info={
            id         :'note',
            title      :cfg.title,
            description:'notes',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise,
            io={},
            listeners,
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            d.pod=Y.merge(d.pod,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            trigger.blankForm();
            if(typeof p.note!=='undefined'){
                d.noteId=p.note;
                io.fetch.note();
            }
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            save:self.info.id+(++JAK.env.customEventSequence)+':save'
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
                note:function(){
                    Y.JAK.widget.busy.set('message','getting note(s)...');
                    Y.io('/db/note/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.note},
                        data:Y.JSON.stringify([{
                            criteria:{noteIds:[d.noteId]},
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            remove:{
                note:function(){
                }
            },
            save:{
                note:function(){
                }
            },
            update:{
                note:function(){
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.save.on('click',io.save.note);
        };

        populate={
            note:function(id,o){
                var rs=Y.JSON.parse(o.responseText)[0].result
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
                        '<fieldset class="jak-note">'
                       +  '<legend>address</legend>'
                       +  '<input type="hidden" class="jak-data jak-data-address" />'
                       +  '<span></span>'
                       +'</fieldset>',
                    footerContent:
                        Y.JAK.html('btn',{action:'save'}),
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd   =h.ol.headerNode;
                    h.bd   =h.ol.bodyNode;
                    h.ft   =h.ol.footerNode;
                    h.bb   =h.ol.get('boundingBox');
                    h.close=h.hd.one('.jak-close');
                    h.save =h.ft.one('.jak-save');

            }
        };

        trigger={
            reset:{
            }
        };

        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
