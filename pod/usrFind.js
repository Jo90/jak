/** //pod/usrFind.js
 *
 */
YUI.add('jak-pod-usrFind',function(Y){

    Y.namespace('JAK.pod').usrFind=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'find user',
            width      :1000,
            xy         :[10,20],
            zIndex     :99999
        },cfg);

        this.info={
            id         :'usrFind',
            title      :cfg.title,
            description:'find user/contact/client',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},
            h={},
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
            JAK.db.usrFind.fetch();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
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
            insert:{
                usrFind:function(){
                    //DO
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            //custom
                Y.on('jak-db-usrFind:s',populate.usr);
        };

        populate={
            usr:function(rs){
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'',
                    footerContent:Y.JAK.html('btn',{action:'save',title:'return',label:'return'}),
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd     =h.ol.headerNode;
                    h.bd     =h.ol.bodyNode;
                    h.ft     =h.ol.footerNode;
                    h.bb     =h.ol.get('boundingBox');
                    h.close  =h.hd.one('.jak-close');
            }
        };

        trigger={
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