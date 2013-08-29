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
            select:self.info.id+(++JA.env.customEventSequence)+':select'
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

            //uploader events
            h.uploader.after("fileselect",function(event){
                var fileList  = event.fileList;
                var fileTable = h.bd.one('table tbody');
                if (fileList.length > 0 && Y.one("#nofiles")) {
                    Y.one("#nofiles").remove();
                }
                if(d.uploadDone){
                    d.uploadDone=false;
                    fileTable.set('innerHTML','');
                }

                Y.each(fileList,function(fileInstance){
                    fileTable.append(
                        "<tr id='" + fileInstance.get("id") + "_row" + "'>" +
                           "<td class='filename'>" + fileInstance.get("name") + "</td>" +
                           "<td class='filesize'>" + fileInstance.get("size") + "</td>" +
                           "<td class='percentdone'>Hasn't started yet</td>"
                    );
                });
            });

			h.uploader.on("uploadprogress", function(event){
            	var fileRow = Y.one("#" + event.file.get("id") + "_row");
                fileRow.one(".percentdone").set("text", event.percentLoaded + "%");
       		});

        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
//                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                         '<div class="ja-selectFiles"></div>'
                        +'<button type="button" id="uploadFilesButton" class="yui3-button" style="width:250px; height:35px;">Upload Files</button>'
                        +'<span></span>'
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                         '<table id="filenames">'
                        +  '<thead>'
                        +    '<tr><th>File name</th><th>File size</th><th>Percent uploaded</th></tr>'
                        +    '<tr id="nofiles">'
                        +      '<td colspan="3">No files have been selected.</td>'
                        +    '</tr>'
                        +  '</thead>'
                        +  '<tbody></tbody>'
                        +'</table>',
                    width  :cfg.width,
                    visible:cfg.visible,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).render();
            
                h.bb   =h.ol.get('boundingBox');
                h.hd   =h.ol.headerNode;
                h.bd   =h.ol.bodyNode;
                h.close=h.hd.one('.ja-close');

                h.uploader=new Y.Uploader({
                    width :"250px",
                    height:"35px"
                }).render(h.hd.one('.ja-selectFiles'));
                d.uploadDone = false;

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
