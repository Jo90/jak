/** //pod/usr.js
 *
 */
YUI.add('ja-pod-usr',function(Y){
    "use strict";
    Y.namespace('JA.pod').usr=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'user',
            visible    :true,
            width      :700,
            xy         :[10,20],
            zIndex     :999999
        },cfg);

        this.info={
            id         :'usr',
            title      :cfg.title,
            description:'edit user/contact/client details',
            version    :'v1.0 August 2013'
        };

        var self=this,
            d={
                defaultAddressPurpose:'Home',
                defaultInfoCategory  :'Phone'
            },
            f={},h={},
            initialise,
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            cfg=Y.merge(cfg,p);
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            trigger.reset();
            h.ol.show();
            io.fetch.usr();
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
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
        };

        io={
            fetch:{
                usr:function(){
                    Y.JA.widget.busy.set('message','getting user...');
                    Y.io('/db/usr/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.usr},
                        data:Y.JSON.stringify([{
                            usr:{criteria:{usrIds:[cfg.usr]}},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            save:{
                usr:function(){
                    debugger;
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            h.save.on('click',io.save.usr);
        };

        pod={
            display:{
                editor:function(e){
                    h.podInvoke=this;
                    if(!self.my.podEditor){pod.load.editor();return false;}
                    self.my.podEditor.display(e);
                },
                info:function(e){
                    h.podInvoke=this;
                    if(!self.my.podInfo){pod.load.info();return false;}
                    if(this.hasClass('ja-no-info')){
                        self.my.podInfo.display({
                            dbTable:JA.data.dbTable.usr.id
                           ,pk     :this.ancestor('.ja-record-usr').getData('data')
                        });
                    }else{
                        self.my.podInfo.display(
                            this.ancestor('.ja-record-usr').getData('handle').usrInfoDataTable.getRecord(e.currentTarget.get('id')).toJSON()
                        );
                    }
                }
            },
            load:{
                editor:function(){
                    Y.use('ja-pod-editor',function(Y){
                        self.my.podEditor=new Y.JA.pod.editor({});
                        Y.JA.whenAvailable.inDOM(self,'my.podEditor',function(){
                            self.my.podEditor.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
//                        Y.on(self.my.podEditor.customEvent.save,function(rs){h.podInvoke.setContent(rs);});
                    });
                },
                info:function(){
                    Y.use('ja-pod-info',function(Y){
                        self.my.podInfo=new Y.JA.pod.info({});
                        Y.JA.whenAvailable.inDOM(self,'my.podInfo',function(){
                            self.my.podInfo.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
//                        Y.on(self.my.podInfo.customEvent.save,function(rs){h.podInvoke.setContent(rs);});
                    });
                }
            }
        };

        populate={
            usr:function(id,o){
                var rs=Y.JSON.parse(o.responseText)[0].result
                ;
                Y.each(rs.usr.data,function(usr){
                    f.usrId       .set('value',usr.id);
                    f.usrTitle    .set('value',usr.title);
                    f.usrFirstName.set('value',usr.firstName);
                    f.usrLastName .set('value',usr.lastName);
                    //address
                        Y.each(rs.usrAddress.data,function(usrAddress){
                            render.usrAddress(usrAddress);
                        });
                    //info
                        Y.each(rs.usrInfo.data,function(usrInfo){
                            render.usrInfo(usrInfo);
                        });
                });
                Y.JA.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAK">'+self.info.title+'</span> '
                       +'<input type="text" disabled="diusabled" class="ja-data ja-data-usr-id">'
                       +'<input type="text" placeholder="title" class="ja-data ja-data-usr-title">'
                       +'<input type="text" placeholder="first name" class="ja-data ja-data-usr-firstName">'
                       +'<input type="text" placeholder="last name" class="ja-data ja-data-usr-lastName">'
                       +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'',
                    footerContent:Y.JA.html('btn',{action:'save',title:'save' ,label:'save'}),
                    visible:cfg.visible,
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).render();

                h.tv=new Y.TabView({
                    children:[
                        {label:'Address',content:'<ul></ul>'},
                        {label:'Info'   ,content:'<ul></ul>'}
                    ]
                }).render(h.ol.bodyNode);
                //shortcuts
                    h.hd   =h.ol.headerNode;
                    h.bd   =h.ol.bodyNode;
                    h.ft   =h.ol.footerNode;
                    h.bb   =h.ol.get('boundingBox');
                    h.close=h.hd.one('.ja-close');
                    h.save =h.ft.one('.ja-save');

                    f.usrId       =h.hd.one('.ja-data-usr-id');
                    f.usrTitle    =h.hd.one('.ja-data-usr-title');
                    f.usrFirstName=h.hd.one('.ja-data-usr-firstName');
                    f.usrLastName =h.hd.one('.ja-data-usr-lastName');

                    h.tvUsrAddress    =h.tv.item(0).get('panelNode');
                    h.tvUsrAddressList=h.tvUsrAddress.one('ul');
                    h.tvUsrInfo       =h.tv.item(1).get('panelNode');
                    h.tvUsrInfoList   =h.tvUsrInfo.one('ul');
            },
            usrAddress:function(obj){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrAddress-id" value="'+obj.id+'" />'
                    +  '<select class="ja-data ja-data-usrAddress-purpose">'
                    +    '<option>'+d.defaultAddressPurpose+'</option>'
                    +    '<option>Work</option>'
                    +    '<option>Postal</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<span>'+obj.streetRef+' '+obj.streetName+' '+obj.locationName+'</span>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                h.tvUsrAddressList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrAddress-purpose'),obj.purpose);
                return nn;
            },
            usrInfo:function(obj){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrInfo-id" value="'+obj.id+'" />'
                    +  '<select class="ja-data ja-data-usrInfo-category">'
                    +    '<option>'+d.defaultInfoCategory+'</option>'
                    +    '<option>Phone</option>'
                    +    '<option>Fax</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<span>'+obj.detail+'</span>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                h.tvUsrInfoList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrInfo-category'),obj.category);
                return nn;
            }
        };

        trigger={
            reset:function(){
            }
        };

        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
