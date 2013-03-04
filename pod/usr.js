/** //pod/usr.js
 *
 */
YUI.add('jak-pod-usr',function(Y){

    Y.namespace('JAK.pod').usr=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'team',
            visible    :false,
            width      :1000,
            xy         :[10,20],
            zIndex     :999
        },cfg);

        this.info={
            id         :'usrEdit',
            title      :cfg.title,
            description:'edit user/contact/client details',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={}
           ,h={}
            //functions
           ,initialise
           ,io={}
           ,listeners
           ,pod={}
           ,populate={}
           ,render={}
           ,sync={}
           ,trigger={}
        ;

        this.display=function(p){
            d.pod=Y.merge(d.pod,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            JAK.db.usr.fetch();
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
            sync.all();
        };

        io={
            insert:{
                usr:function(){
                    //DO
                }
            }
           ,update:{
                usr:function(){
                    var post=[]
                    ;
                    h.bd.all('>.jak-record-usr').each(function(usrNode){
                        var usrData  =usrNode.getData('data')
                           ,usrHandle=usrNode.getData('handle')
                           ,usr={
                                data:{
                                    name         :usrNode.one('.jak-data-name'         ).get('value')
                                   ,contactDetail:usrNode.one('.jak-data-contactDetail').get('value')
                                }
                               ,remove:usrNode.one('.jak-remove').get('checked')
                               ,children:{
                                    usrInfo:[]
                                   ,tgLink:[{data:{
                                        dbTable   :JAK.data.dbTable.usr.id
                                       ,collection:d.TG_COLLECTION_TEAM_SOCIAL
                                       ,tagIds    :usrHandle.socialTags.get('selected')
                                    }},{data:{
                                        dbTable   :JAK.data.dbTable.usr.id
                                       ,collection:d.TG_COLLECTION_TEAM_BUSINESS
                                       ,tagIds    :usrHandle.businessTags.get('selected')
                                    }}]
                                }
                            }
                        ;
                        if(typeof usrData!=='undefined'){usr.data.id=usrData.id}
                        //group info
                            usrHandle.tvGrp.all('.jak-usrInfo-list > .jak-record').each(function(usrInfoListNode,idx){
                                var originalData      =usrInfoListNode.getData('data')
                                   ,usrInfoContentNode=usrInfoListNode.getData('relatedNode')
                                   ,post={
                                       data:{
                                            displayOrder:idx
                                           ,viewable    :parseInt(usrInfoContentNode.one('.jak-data-viewable').get('value'),10)
                                           ,category    :usrInfoListNode.one('.jak-data-category').get('value')
                                           ,info        :usrInfoContentNode.one('.jak-data-info').get('innerHTML')
                                        }
                                       ,remove:usrInfoContentNode.one('.jak-remove').get('checked')
                                    }
                                ;
                                if(typeof originalData!=='undefined'){post.data.id=originalData.id;}
                                usr.children.usrInfo.push(post);
                            });
                        post.push({criteria:{usr:[usr]}});
                    });
                    JAK.db.usr('u',post);
                }
               ,usrUsr:function(e){
return; //>>>>FINISH
                    var rec=h.grid.usrUsrDataTable.getRecord(e.currentTarget.get('id')).toJSON()
                    ;
                    Y.io('/db/usrUsr/u.php',{
                        method:'POST'
                       ,on:{complete:JAK.db.usr}
                       ,data:Y.JSON.stringify([{data:{
                            usr         :rec.usr
                           ,usr         :rec.usr
                           ,member      :Math.round((new Date()).getTime()/1000)
                           ,admin       :null
                           ,joinRequest :rec.joinRequest
                           ,joinReason  :rec.joinReason
                           ,id          :rec.id
                       }}])
                    });
                }
            }
        };

        listeners=function(){
            h.addGrp.on('click',io.insert.usr);
            h.close.on('click',trigger.close);
            h.bd.delegate('change',function(){
                this.ancestor('.jak-record-usr').all('>div').setStyle('display',this.get('checked')?'none':'');
            },'.jak-record-usr > legend .jak-remove');
            h.bd.delegate('click',function(){this.ancestor('.jak-record').remove();},'a.jak-remove-usr');
            h.ft.one('.jak-save').on('click',function(){io.update.usr();io.update.usrUsr();});
            //custom
                Y.on('jak-db-info:s',populate.usr);
                Y.on('jak-db-usr:s' ,populate.usr);
                Y.on('jak-db-usr:i' ,sync.usr.insert);
        };

        pod={
            display:{
                editor:function(e){
                    h.podInvoke=this;
                    if(!self.my.podEditor){pod.load.editor();return false;}
                    self.my.podEditor.display(e);
                }
               ,usrNew:function(e){
                    h.podInvoke=this;
                    if(!self.my.podGrpNew){pod.load.usrNew();return false;}
                    self.my.podGrpNew.display(e);
                }
               ,info:function(e){
                    h.podInvoke=this;
                    if(!self.my.podInfo){pod.load.info();return false;}
                    if(this.hasClass('jak-no-info')){
                        self.my.podInfo.display({
                            dbTable:JAK.data.dbTable.usr.id
                           ,pk     :this.ancestor('.jak-record-usr').getData('data')
                        });
                    }else{
                        self.my.podInfo.display(
                            this.ancestor('.jak-record-usr').getData('handle').usrInfoDataTable.getRecord(e.currentTarget.get('id')).toJSON()
                        );
                    }
                }
               ,report:function(e){
                    var body='test FINISH'
                    ;
                    //sentry
                        if(e.target.get('tagName')==='BUTTON'){return;}
                    h.podInvoke=e.currentTarget;
                    if(!self.my.podReport){
                        pod.load.report({});
                        return false;
                    }
                    self.my.podReport.display({
                        html   :'<html><head><title>Users name</title></head><body>'+body+'</body></html>'
                       ,subject:'report'
                       ,sendTo :'joe@dargaville.net'
                       ,title  :'test'
                    });
                }
            }
           ,load:{
                editor:function(){
                    Y.use('jak-pod-editor',function(Y){
                        self.my.podEditor=new Y.JAK.pod.editor({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podEditor',function(){
                            self.my.podEditor.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podEditor.customEvent.save,function(rs){h.podInvoke.setContent(rs);});
                    });
                }
               ,usrNew:function(){
                    Y.use('jak-pod-usrNew',function(Y){
                        self.my.podGrpNew=new Y.JAK.pod.info({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podGrpNew',function(){
                            self.my.podGrpNew.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podGrpNew.customEvent.save,function(rs){h.podInvoke.setContent(rs);});
                    });
                }
               ,info:function(){
                    Y.use('jak-pod-info',function(Y){
                        self.my.podInfo=new Y.JAK.pod.info({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podInfo',function(){
                            self.my.podInfo.set('zIndex',cfg.zIndex+10);
                            self.my.podInfo.set('cfg',{
                                addUserDefinedCategory:true
                               ,predefinedCategories  :d.list.usrInfoCategories
                            });
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podInfo.customEvent.save,function(rs){h.podInvoke.setContent(rs);});
                    });
                }
               ,report:function(){
                    Y.use('jak-pod-report',function(Y){
                        self.my.podReport=new Y.JAK.pod.report({'zIndex':99999});
                        Y.JAK.whenAvailable.inDOM(self,'my.podReport',function(){h.podInvoke.simulate('click');});
                    });
                }
            }
        };

        populate={
            usr:function(rs){
                var btnRemove
                   ,usrInfoCategories=[]
                   ,usrInfoExistingCategories=[]
                   ,recs={
                        usrInfo:[]
                       ,usrUsr :[]
                    }
                   ,handle={}
                   ,list={}
                   ,nn={}
                   ,optGroup
                   ,tv={}
                   ,usrInfoNav,usrInfoList
                ;
                JAK.rs=Y.merge(JAK.rs,rs[0].result);
                h.bd.setContent('');
                Y.each(JAK.rs.usr.data,function(usr){ //only 1 usr passed at this time

                    if(Y.Array.indexOf(d.pod.usrIds,usr.id)===-1){return;}

                    nn.usr=render.usr();
                    //local shortcuts
                        tv.base  =nn.usr.getData('tv');
                        tv.info  =tv.base.item(0).get('panelNode');
                        tv.usrUsr=tv.base.item(1).get('panelNode');
                        tv.events=tv.base.item(2).get('panelNode');
                        handle.tvGrp   =tv.info;
                        handle.tvGrpUsr=tv.usrUsr;
                        handle.tvEvents=tv.events;

                    Y.JAK.removeOption(nn.usr.one('legend'));
                    nn.usr.one('.jak-association').remove();

                    //enable/disable if member/admin
                        nn.usr.all('.jak-enable').set('disabled',true);
                        h.addGrp.hide();
                        Y.each(JAK.rs.usrUsr.data,function(usrUsr){
                            if(usrUsr.usr!==JAK.user.usr.id){return;}
                            nn.usr.all('.jak-enable-member').set('disabled',false);
                            if(usrUsr.admin!==null){
                                nn.usr.all('.jak-enable-admin').set('disabled',false);
                                h.addGrp.show();
                            }
                        });
                    //group
                        nn.usr.one('.jak-data-name'         ).set('value',usr.name);
                        nn.usr.one('.jak-data-created'      ).setContent('created:'+Y.DataType.Date.format(new Date(usr.created*1000),{format:'%d %B %G'}));
                        nn.usr.one('.jak-data-contactDetail').set('value',usr.contactDetail);
                    //tags
                        list.social  =[];
                        list.business=[];
                        Y.each(JAK.rs.usrTags.data,function(usrTag){
                            if(usrTag.pk!==usr.id){return;}
                            if(usrTag.collection===d.TG_COLLECTION_TEAM_SOCIAL  ){list.social.push(usrTag.tag);}
                            if(usrTag.collection===d.TG_COLLECTION_TEAM_BUSINESS){list.business.push(usrTag.tag);}
                        });
                        handle.socialTags=new Y.JAK.widget.List({
                            elements:d.list.socialAll
                           ,selected:list.social
                           ,selectorPrompt:'+social tags'
                        }).render(nn.usr.one('.jak-tags-social'));
                        handle.businessTags=new Y.JAK.widget.List({
                            elements:d.list.businessAll
                           ,selected:list.business
                           ,selectorPrompt:'+business tags'
                        }).render(nn.usr.one('.jak-tags-business'));
                    //group info
                        sync.info(nn,tv,usr,handle);
                    //members
                        Y.each(JAK.rs.usrUsr.data,function(usrUsr){
                            usrUsr.usrId=usrUsr.id;
                            usrUsr.adminDate=usrUsr.admin===0
                                ?''
                                :Y.DataType.Date.format(new Date(usrUsr.admin*1000),{format:'%d %b %G'});
                            usrUsr.memberOption=usrUsr.member===null
                                ?'<button class="jak-approve-pending" title="'
                                    +(Y.DataType.Date.format(new Date(usrUsr.joinRequest*1000),{format:'%d %b %G'}))
                                    +': '+usrUsr.joinReason+'">approve</button>'
                                :Y.DataType.Date.format(new Date(usrUsr.member*1000),{format:'%d %b %G'});
                            recs.usrUsr.push(Y.merge(usrUsr,JAK.rs.usr.data[usrUsr.usr]));
                        });
                        //grid
                            handle.usrUsrDataTable=new Y.DataTable({
                                columns:[
                                    {key:'firstName'                     ,sortable:true}
                                   ,{key:'lastName'                      ,sortable:true}
                                   ,{key:'knownAs'                       ,sortable:true}
                                   ,{key:'adminDate'   ,label:'admin'    ,sortable:true ,formatter:function(x){return x.value===1?'admin':'';}}
                                   ,{key:'memberOption',label:'member'   ,sortable:true ,allowHTML:true}
                                   ,{                   label:'interests'}
                                ]
                            ,data:recs.usrUsr
                            }).render(tv.usrUsr);
                            //listeners
                                handle.usrUsrDataTable.get('contentBox').delegate('click',function(e){
                                    //sentry
                                        if(e.target.hasClass('jak-approve-pending')){return;}
                                    var rec=handle.usrUsrDataTable.getRecord(e.currentTarget.get('id')).toJSON()
                                    ;
                                    //>>>>FINISH display user
                                    debugger;
                                },'tr');
                                handle.usrUsrDataTable.get('contentBox').delegate('click',io.update.usrUsr,'.jak-approve-pending');
                                handle.usrUsrDataTable.get('contentBox').delegate('click',pod.display.report,'tr');
                    //store
                        nn.usr.setData('data'  ,usr);
                        nn.usr.setData('handle',handle);
                });
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'add',label:'add new group',title:'add information category'})
                       +Y.JAK.html('btn',{action:'close',title:'close pod'})
                   ,bodyContent:''
                   ,footerContent:Y.JAK.html('btn',{action:'save',title:'save' ,label:'save'})
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
                    h.addGrp =h.hd.one('.jak-add');
                    h.close  =h.hd.one('.jak-close');
            }
           ,usr:function(){
                var nn=Y.Node.create(
                    '<fieldset class="jak-record jak-record-usr">'
                   +  '<legend>'
                   +    '<input type="text" class="jak-data jak-data-name jak-enable jak-enable-admin" placeholder="team/group name" title="team/group name" />'
                   +    '<span class="jak-data jak-data-created"></span> '
                   +    Y.JAK.html('btn',{action:'remove',label:'remove new group',classes:'jak-remove-usr'})
                   +  '</legend>'
                   +  '<fieldset class="jak-association">'
                   +    '<legend>association with parent group</legend>'
                   +    '<textarea></textarea>'
                   +  '</fieldset>'
                   +  'public contact details<br />'
                   +  '<textarea class="jak-data jak-data-contactDetail jak-enable jak-enable-admin" placeholder="contact details (public)"></textarea>'
                   +  '<div class="jak-tags-social"></div>'
                   +  '<div class="jak-tags-business"></div>'
                   +'</fieldset>'
                );
                h.bd.append(nn);
                nn.setData('tv',new Y.TabView({
                    children:[
                        {label:'about'  ,content:''}
                       ,{label:'members',content:''}
                       ,{label:'events' ,content:''}
                    ]
                }).render(nn));
                return nn;
            }
           ,usrUsr:function(p){
                var nn=Y.Node.create(
                        '<li class="record record-usrUsr">'
                       +  '<input type="hidden" class="data data-id" />'
                       +  '<input type="text" class="data data-nameFirst" placeholder="first name" title="first name" />'
                       +  '<input type="text" class="data data-nameLast"  placeholder="last name"  title="last name" />'
                       +  d.usrUsrInterest
                       +  Y.JAK.html('btn',{action:'find'  ,title:'find contact'})
                       +  Y.JAK.html('btn',{action:'remove',title:'remove record'})
                       +'</li>'
                    )
                ;
                p.node.append(nn);
                return nn;
            }
        };

        sync={
            all:function(){
                sync.tags();
            }
           ,usr:{
                insert:function(rs){
                    debugger;
                }
            }
           ,info:function(nn,tv,usr,handle){
                var data=[]
                ;
                if(typeof JAK.rs.usrInfo.data==='undefined' || JAK.rs.usrInfo.data.length===0){
                    nn.info=Y.Node.create(Y.JAK.html('btn',{action:'add',label:'add information category',classes:'jak-no-info'}));
                    tv.info.append(nn.info);
                    nn.info.on('click',pod.display.info);
                }else{
                    Y.each(JAK.rs.usrInfo.data,function(usrInfo){
                        if(usrInfo.pk===usr.id){data.push(usrInfo);}
                    });
                    //grid
                        handle.usrInfoDataTable=new Y.DataTable({
                            columns:[
                                {key:'category'    ,sortable:true}
                               ,{key:'displayOrder',sortable:true,label:'seq'}
                               ,{key:'viewable'    ,sortable:true,label:'view',formatter:function(x){return x.value==='P'?'Public':'Group';}}
                               ,{key:'detail'      ,sortable:true,allowHTML:true}
                            ]
                           ,data:data
                        }).render(tv.info);
                        //listeners
                            handle.usrInfoDataTable.get('contentBox').delegate('click',pod.display.info,'tr');
                }
            }
           ,tags:function(){
                d.list.socialAll=[];
                d.list.businessAll=[];
                Y.each(JAK.data.tgCollectionTag,function(tgCollectionTag){
                    if(tgCollectionTag.collection===d.TG_COLLECTION_TEAM_SOCIAL){
                        d.list.socialAll.push({
                            id  :tgCollectionTag.tag
                           ,name:JAK.data.tgTag[tgCollectionTag.tag].name
                        });
                    }
                    if(tgCollectionTag.collection===d.TG_COLLECTION_TEAM_BUSINESS){
                        d.list.businessAll.push({
                            id  :tgCollectionTag.tag
                           ,name:JAK.data.tgTag[tgCollectionTag.tag].name
                        });
                    }
                });
            }
        };

        trigger={
            close:function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            }
           ,usrInfoRecordFocus:function(e){
                var recNode=this.ancestor('.jak-record')
                   ,contentNode=recNode.getData('relatedNode')
                ;
                recNode.get('parentNode').all('.jak-record-focus').removeClass('jak-record-focus');
                recNode.addClass('jak-record-focus');
                contentNode.get('parentNode').all('>fieldset').setStyle('display','none');
                contentNode.setStyle('display','');
            }
           ,usrInfoSelectOption:function(e,idx){
                var idx=this.get('selectedIndex')
                   ,panel      =this.ancestor('.yui3-tab-panel')
                   ,list       =panel.one('.jak-usrInfo-list')
                   ,content    =panel.one('.jak-usrInfo-content')
                   ,usrNode    =this.ancestor('.jak-record-usr')
                   ,usrData    =usrNode.getData('data')
                   ,usrHandle  =usrNode.getData('handle')
                   ,newCategory=''
                   ,nn
                   ,post
                ;
                if(idx===0){return;}
                if(idx===1){
                    newCategory=prompt('Enter your category');
                    if(newCategory===null){return;}
                }
                if(idx>1){newCategory=this.get('value');}
                //remove from select options if exists
                    if(Y.Array.indexOf(d.list.usrInfoCategories,newCategory)!==-1){
                        this.all('option').item(idx).remove();
                    }
                this.set('selectedIndex',0);
                nn=render.usrInfo({node:panel});
                nn.list.one('.jak-data-category').set('value',newCategory);
                nn.content.one('legend em').setContent(newCategory);
                nn.list.one('input').simulate('click');
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
