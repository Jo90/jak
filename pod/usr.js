/** //pod/usr.js
 *
 */
YUI.add('ja-pod-usr',function(Y){
    "use strict";
    Y.namespace('JA.pod').usr=function(cfg){

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
            version    :'v1.0 August 2013'
        };

        var self=this,
            d={},h={},
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
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});

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
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAPS">'+self.info.title+'</span> '
                       +Y.JA.html('btn',{action:'add',label:'add new group',title:'add information category'})
                       +Y.JA.html('btn',{action:'close',title:'close pod'})
                   ,bodyContent:''
                   ,footerContent:Y.JA.html('btn',{action:'save',title:'save' ,label:'save'})
                   ,visible:cfg.visible
                   ,width  :cfg.width
                   ,xy     :cfg.xy
                   ,zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();

                h.tv=new Y.TabView({
                    children:[
                        {
                            label:'Address',
                            content:
                                'address stuff'
                        },
                        {
                            label:'Info',
                            content:
                                'info stuff'
                        }
                    ]
                }).render(h.ol.bodyNode);
                //shortcuts
                    h.hd     =h.ol.headerNode;
                    h.bd     =h.ol.bodyNode;
                    h.ft     =h.ol.footerNode;
                    h.bb     =h.ol.get('boundingBox');
                    h.close  =h.hd.one('.ja-close');

                    h.tvAddress=h.tv.item(0).get('panelNode');
                    h.tvInfo   =h.tv.item(1).get('panelNode');
            }
        };

        trigger={
            reset:function(){
                f.jobId           .set('value','');
                f.jobAddress      .set('value','');
                f.jobAddressDetail.set('innerHTML','');
                f.jobRef          .set('value','');
                f.jobAppointment  .set('value','');
                f.jobConfirmed    .set('value','');
                f.jobReminder     .set('value','');
                f.jobWeather      .set('value','');
                trigger.tree.nodeFocus(false);
                h.jobUsrList.set('innerHTML','');
                trigger.jobUsr.display();
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
