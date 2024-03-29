/** //pod/info.js
 *
 */
YUI.add('ja-pod-info',function(Y){

    Y.namespace('JA.pod').info=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'notes/comments/information',
            categories :[],
            width      :500,
            visible    :false,
            zIndex     :99999
        },cfg);

        this.info={
            id         :'info',
            title      :cfg.title,
            description:'notes/comments/info',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={
                remove:[]
            },
            initialise,
            io={},
            listeners,
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            //sentry
                if(typeof p.dbTable==='undefined'){alert('pod-info error:parameters');return;}
                else if(typeof p.pk!=='undefined'){d.action='fetch';}
                else if(typeof p.info!=='undefined' && typeof p.info.data!=='undefined'){d.action='data';}
                else {alert('pod-info error:parameters');return;}
            //init
                cfg=Y.merge(cfg,p);
                h.infoList.setContent('');
                h.remove=[];
            //display
                Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
                h.ol.show();
                self.set('title',cfg.title);
                self.set('visible',cfg.visible);
            d.action==='fetch'
                ?io.fetch.info(p)
                :populate.info(p);
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='cfg'    ){cfg=Y.merge(cfg,value);}
            if(what==='title'  ){h.hd.one('span').set('innerHTML',value);}
            if(what==='visible'){h.ol.set('visible',value);}
            if(what==='zIndex' ){h.ol.set('zIndex',value);}
        };

        this.customEvent={
            save:self.info.id+(++JA.env.customEventSequence)+':save'
        };

        this.my={};

        /**
         * private
         */

        initialise=function(){
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
        };

        io={
            fetch:{
                info:function(p){
                    Y.JA.widget.busy.set('message','getting information...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.info},
                        data:Y.JSON.stringify([{
                            info:{
                            	criteria:{
	                                dbTable:p.dbTable,
    	                            pks    :[p.pk]
    	                        }
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            save:{
                info:function(){
                    var seq=0
                    ;
                    d.saveData={
                        info:{
                            record:[],
                            remove:h.remove
                        }
                    };
                    h.infoList.all('li').each(function(row){
                        var info={
                                data:{
                                    id      :row.one('.ja-data-info-id').get('value'),
                                    dbTable :cfg.dbTable,
                                    pk      :(d.action==='fetch'?cfg.pk:null),
                                    category:row.one('.ja-data-info-category').get('value'),
                                    detail  :row.one('.ja-data-info-detail'  ).get('value'),
                                    seq     :++seq
                                }
                            }
                        ;
                        //don't save new blank records
                            if(info.data.id==='' && info.data.detail===''){return;}
                        //
                        if(info.data.id!==''){info.data.id=parseInt(info.data.id,10);}
                        d.saveData.info.record.push(info);
                    });
                    if(d.action==='data'){
                        Y.fire(self.customEvent.save,d.saveData);
                        h.close.simulate('click');
                    }else{
                        Y.io('/db/siud.php',{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            on:{complete:function(id,o){
                                Y.fire(self.customEvent.save,Y.JSON.parse(o.responseText)[0].data);
                                h.close.simulate('click');
                            }},
                            data:Y.JSON.stringify([{
                                info:d.saveData.info,
                                usr :JA.user.usr
                            }])
                        });
                    }
                }
            }
        };

        listeners=function(){
            h.add.on('click',function(){h.infoList.prepend(render.info());});
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            h.infoList.delegate('click',trigger.record.add,'.ja-add');
            h.infoList.delegate('click',trigger.record.remove,'.ja-remove');
            h.save.on('click',io.save.info);
        };

        populate={
            info:function(){
                var nn,rs,infoExists=false
                ;
                //passed data
                    if(arguments.length===1 && Y.Lang.isObject(arguments[0])){
                        rs=arguments[0];
                    }else
                //fetched data
                    if(arguments.length===2){
                        rs=Y.JSON.parse(arguments[1].responseText)[0].info.result;
                    }
                
                Y.each(rs.info.data,function(info){
                    nn=Y.Node.create(
                        render.info({
                            id      :info.id,
                            detail  :info.detail
                        })
                    );
                    h.infoList.append(nn);
                    Y.JA.matchSelect(nn.one('.ja-data-info-category'),info.category);
                    infoExists=true;
                });
                if(!infoExists){
                    h.infoList.append(render.info());
                }
                Y.JA.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                       +Y.JA.html('btn',{action:'add',title:'add'})
                       +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'<ul></ul>',
                    footerContent:
                        Y.JA.html('btn',{action:'save'}),
                    centered:true,
                    visible :cfg.visible,
                    width   :cfg.width,
                    zIndex  :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd      =h.ol.headerNode;
                    h.bd      =h.ol.bodyNode;
                    h.ft      =h.ol.footerNode;
                    h.bb      =h.ol.get('boundingBox');
                    h.add     =h.hd.one('.ja-add');
                    h.close   =h.hd.one('.ja-close');
                    h.infoList=h.bd.one('> ul');
                    h.save    =h.ft.one('.ja-save');
            },
            info:function(p){
                var html='<li>'
                        +  '<input type="hidden" class="ja-data ja-data-info-id" value="{id}" />'
                        +  '{category}'
                        +  '<textarea class="ja-data ja-data-info-detail">{detail}</textarea>'
                        +  Y.JA.html('btn',{action:'remove',title:'remove'})
                        +  Y.JA.html('btn',{action:'add',title:'add'})
                        +'</li>',
                    categoryStr='',
                    params=typeof p!=='undefined'
                ;
                //categories
                if(cfg.categories.length>0){
                    Y.each(cfg.categories,function(category){
                        categoryStr+='<option>'+category+'</option>';
                    });
                    categoryStr='<select class="ja-data ja-data-info-category">'+categoryStr+'</select><br/>';
                }
                return Y.Lang.sub(html,{
                        'id'      :(params?(typeof p.id==='undefined'?'':p.id):''),
                        'category':categoryStr,
                        'detail'  :(params?(typeof p.detail==='undefined'?'':p.detail):'')
                    })
                ;
            }
        };

        trigger={
            record:{
                add:function(){
                    this.ancestor('li').insert(render.info(),'after');
                },
                remove:function(){
                    var row=this.ancestor('li'),
                        infoId=row.one('.ja-data-info-id').get('value')
                    ;
                    if(infoId!==''){h.remove.push(parseInt(infoId,10));}
                    row.remove();
                }
            }
        };
        /**
         *  load & initialise
         */
        render.base();
        initialise();
        listeners();
    };

},'1.0 March 2013',{requires:['base','io','node']});
