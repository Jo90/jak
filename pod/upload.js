/** //pod/upload.js
 *
 */
YUI.add('ja-pod-upload',function(Y){

    Y.namespace('JA.pod').upload=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'upload image',
            width      :800,
            visible    :false,
            zIndex     :99999
        },cfg);

        this.info={
            id         :'upload',
            title      :cfg.title,
            description:'image upload',
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
            d.pod=Y.merge(d.pod,p);
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
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
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd]});
        };

        io={};

        listeners=function(){
            h.close.on('click',function(){
            	h.ol.hide();
            	Y.JA.widget.dialogMask.hide();
            });
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                        +' #<input type="text" class="ja-data ja-data-id" title="job number" disabled="disabled" />'
                        +'<input type="hidden" class="ja-data ja-data-address" />'
                        +' &nbsp; <span class="ja-display-address"></span> &nbsp; '
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:Y.JA.html('btn',{action:'save',title:'save',label:'save'}),
                    width  :cfg.width,
                    visible:cfg.visible,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).render();
            
                h.bb=h.ol.get('boundingBox');
                h.hd=h.ol.headerNode;
	            h.bd=h.ol.bodyNode;
                h.ui=new Y.Uploader({width: "300px", 
                    	             height: "40px"}).render(h.bd);
                h.close=h.hd.one('.ja-close');
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
