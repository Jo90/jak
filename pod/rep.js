/** //pod/rep.js
 *
 */
YUI.add('jak-pod-rep',function(Y){

    Y.namespace('JAK.pod').rep=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'reports',
            categories :[],
            width      :800,
            visible    :false,
            zIndex     :99999
        },cfg);

        this.info={
            id         :'rep',
            title      :cfg.title,
            description:'reports',
            version    :'v1.0 April 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise,
            io={},
            listeners,
            render={},
            trigger={}
        ;

        this.display=function(p){
            //sentry
                if(typeof p==='undefined'){alert('pod-rep error:parameters');return;}
            //init
                cfg=Y.merge(cfg,p);
            //display
                Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
                h.ol.show();
                self.set('visible',cfg.visible);
                if(typeof p.title!=='undefined'){h.title.setContent(p.title);}
                h.dframeDoc.open();
                h.dframeDoc.write(p.html);
                h.dframeDoc.close();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='cfg'    ){cfg=Y.merge(cfg,value);}
            if(what==='visible'){h.ol.set('visible',value);}
            if(what==='zIndex' ){h.ol.set('zIndex',value);}
        };

        this.customEvent={
        };

        this.my={};

        /**
         * private
         */

        initialise=function(){
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd]});
        };

        io={
            send:{
               email:function(){
                    Y.io('/db/shared/email.php',{
                        method:'POST'
                       ,headers:{'Content-Type':'application/json'}
                       ,on:{complete:trigger.close}
                       ,data:Y.JSON.stringify([{
                           criteria:{
                               email  :'admin@jak.com.au'
                              ,message:h.dframeDoc.body.innerHTML
                              ,subject:'JAK Inspections'
                            }
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JAK.widget.dialogMask.hide();});
            h.email.on('click',io.send.email);
            //>>>>FINISH print xbrowser?
            h.print.on('click',function(){h.dframe.contentWindow.print();return false;});
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAK"><em>'+self.info.title+'</em></span> '
                       +'<input type="text" placeholder="email address" title="email address" >'
                       +'<button class="jak-email">Email</button>'
                       +'<button class="jak-print">Print</button>'
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'<ul></ul>',
                    align   :{points:[Y.WidgetPositionAlign.TC,Y.WidgetPositionAlign.TC]},
                    visible :cfg.visible,
                    width   :cfg.width,
                    zIndex  :cfg.zIndex
                }).render();
                //resize
                    h.ol.plug(Y.Plugin.Resize);
                    h.ol.resize.on('resize:end',function(e){
                        h.dframe.width =h.bd.getStyle('width');
                        h.dframe.height=h.bd.getStyle('height');
                    });
                //shortcuts
                    h.hd    =h.ol.headerNode;
                    h.bd    =h.ol.bodyNode;
                    h.bb    =h.ol.get('boundingBox');
                    h.title =h.hd.one('em');
                    h.close =h.hd.one('.jak-close');
                    h.email =h.hd.one('.jak-email');
                    h.print =h.hd.one('.jak-print');

                    h.dframe       =document.createElement('iframe');
                    h.dframe.id    ='jak-displayFrame';
                    h.dframe.width =800;
                    h.dframe.height=600;
                    h.dframe.src   ='about:blank';
                    h.bd.appendChild(h.dframe);
                    h.dframeDoc=h.dframe.contentDocument||h.dframe.contentWindow.document||h.dframe.document;
                    //seems to require initialisation
                        h.dframeDoc.open();
                        h.dframeDoc.write('content...');
                        h.dframeDoc.close();
            }
        };

        trigger={
        };
        /**
         *  load & initialise
         */
        render.base();
        initialise();
        listeners();
    };

},'1.0 March 2013',{requires:['base','io','node']});
