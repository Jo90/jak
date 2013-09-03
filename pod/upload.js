/** //pod/upload.js
 *
 */
YUI.add('ja-pod-upload',function(Y){

    Y.namespace('JA.pod').upload=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'upload image',
            width      :700,
            visible    :true,
            zIndex     :99999
        },cfg);

        this.info={
            id         :'upload',
            title      :cfg.title,
            description:'image upload',
            version    :'v1.0 April 2013'
        };

        var self=this,
            d={},
            f={},h={},
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
            uploaded:self.info.id+(++JA.env.customEventSequence)+':uploaded'
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
            h.uploader.after('fileselect',function(event){
                var fileList   =event.fileList,
                    fileTable  =h.bd.one('table tbody'),
                    perFileVars={}
                ;
                if(fileList.length>0 && Y.one('#nofiles')){
                    Y.one('#nofiles').remove();
                }
                if(d.uploadDone){
                    d.uploadDone=false;
                    fileTable.set('innerHTML','');
                }

                Y.each(fileList,function(fileInstance){
                    fileTable.append(
                        '<tr id="'+fileInstance.get('id')+'_row'+'">'
                       +  '<td class="filename">'+fileInstance.get('name')+'</td>'
                       +  '<td class="filesize">'+fileInstance.get('size')+'</td>'
                       +  '<td class="percentdone">Hasn\'t started yet</td>'
                       +'</tr>'
                    );
                    perFileVars[fileInstance.get('id')]={
                        filename:fileInstance.get('name'),
                        data    :Y.JSON.stringify(d.pod.data)
                    };
                });
                h.uploader.set('postVarsPerFile',Y.merge(h.uploader.get('postVarsPerFile'),perFileVars));
            });

            h.uploader.on('uploadprogress',function(event){
                var fileRow=Y.one('#'+event.file.get('id')+'_row')
                ;
                fileRow.one('.percentdone').set('text',event.percentLoaded+'%');
            });

            h.uploader.on('uploadstart',function(event){
                h.uploader.set('enabled',false);
                h.uploadFilesButton.addClass('yui3-button-disabled');
                h.uploadFilesButton.detach('click');
            });

            h.uploader.on('uploadcomplete',function(event){
                var fileRow=Y.one('#'+event.file.get('id')+'_row')
                ;
                fileRow.one('.percentdone').set('text','Finished!');
                Y.fire(self.customEvent.uploaded,Y.JSON.parse(event.data));
            });

            h.uploader.on('totaluploadprogress',function(event){
                h.overallProgress.setHTML('Total uploaded: <strong>'+event.percentLoaded+'%'+'</strong>');
            });

            h.uploader.on('alluploadscomplete',function(event){
                h.uploader.set('enabled', true);
                h.uploader.set('fileList',[]);
                h.uploadFilesButton.removeClass('yui3-button-disabled');
                h.uploadFilesButton.on('click',function(){
                    if(!d.uploadDone && h.uploader.get('fileList').length>0){
                        h.uploader.uploadAll();
                    }
                });
                h.overallProgress.set('text', 'Uploads complete!');
                d.uploadDone = true;
            });

            h.uploadFilesButton.on('click',function(){
                if(!d.uploadDone && h.uploader.get('fileList').length>0) {
                    h.uploader.uploadAll();
                }
            });
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA"></span> '
                        +'<div class="ja-selectFiles"></div>'
                        +'<button type="button" class="yui3-button" style="width:200px; height:35px;">Upload Files</button>'
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
            
                h.bb             =h.ol.get('boundingBox');
                h.hd             =h.ol.headerNode;
                h.bd             =h.ol.bodyNode;

                h.uploadFilesButton=h.hd.one('> button');
                h.overallProgress  =h.hd.one('> span');
                h.close            =h.hd.one('.ja-close');

                h.uploader=new Y.Uploader({
                    width          :'200px',
                    height         :'35px',
                    multipleFiles  :true,
                    uploadURL      :'http://jak/file/upload.php',
                    simLimit       :2,
                    withCredentials:false
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
