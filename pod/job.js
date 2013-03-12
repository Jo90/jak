/** //pod/job.js
 *
 */
YUI.add('jak-pod-job',function(Y){

    Y.namespace('JAK.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'job'
           ,width      :1000
           ,xy         :[10,20]
           ,zIndex     :99999
        },cfg);

        this.info={
            id         :'job'
           ,title      :cfg.title
           ,description:'job details'
           ,version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            d.pod=Y.merge(d.pod,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            if(typeof p.job!='undefined'){
                io.fetch.job(p);
            }else{
                //blank form
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
                job:function(p){

                    

                }
            },
            save:{
                job:function(){
                    alert('save'); //>>>>>>>>>>>>DO
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.save.on('click',io.save.job);
        };

        pod={
            display:{
                usr:function(e){
                }
            },
            load:{
                usr:function(){
                }
            }
        };

        populate={
            job:function(rs){
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'add',label:'new',title:'add new job',classes:'jak-job-add'})
                       +Y.JAK.html('btn',{action:'add',label:'duplicate',title:'duplicate job',classes:'jak-job-dup'})
                       +Y.JAK.html('btn',{action:'close',title:'close pod'})
                   ,bodyContent:''
                   ,footerContent:Y.JAK.html('btn',{action:'save',title:'save',label:'save'})
                   ,visible:cfg.visible
                   ,width  :cfg.width
                   ,xy     :cfg.xy
                   ,zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd     =h.ol.headerNode;
                    h.bd     =h.ol.bodyNode;
                    h.ft     =h.ol.footerNode;
                    h.bb     =h.ol.get('boundingBox');
                    h.add    =h.hd.one('.jak-job-add');
                    h.dup    =h.hd.one('.jak-job-dup');
                    h.close  =h.hd.one('.jak-close');
                    h.save   =h.ft.one('.jak-save');
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
