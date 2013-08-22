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
                defaultInfoCategory  :'specify...'
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
            insert:{
                usr:function(){
                    Y.JA.widget.busy.set('message','new user...');

                    debugger;

                },
                usrAddress:function(rsAddress){
                    Y.JA.widget.busy.set('message','new user address...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var obj=Y.JSON.parse(o.responseText)[0].usrAddress.record[0].data
                            ;
                            obj.streetRef   =rsAddress.data.streetRef;
                            obj.streetName  =rsAddress.data.streetName;
                            obj.locationName=rsAddress.data.locationName;
                            render.usrAddress(obj);
                        }},
                        data:Y.JSON.stringify([{
                            usrAddress:{record:[{
                                data:{
                                    usr    :parseInt(f.usrId.get('value'),10),
                                    address:rsAddress.data.id,
                                    purpose:d.defaultAddressPurpose
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrInfo:function(){
                    Y.JA.widget.busy.set('message','new user information ...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].usrInfo.record[0].data
                            ;
                            Y.JA.widget.busy.set('message','');
                            render.usrInfo(rs);
                        }},
                        data:Y.JSON.stringify([{
                            usrInfo:{record:[{
                                data:{
                                    usr     :parseInt(f.usrId.get('value'),10),
                                    category:d.defaultInfoCategory,
                                    detail  :''
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            remove:{
                usrAddress:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            li.remove();
                        }},
                        data:Y.JSON.stringify([{
                            usrAddress:{remove:[parseInt(li.one('.ja-data-usrAddress-id').get('value'),10)]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrInfo:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            li.remove();
                        }},
                        data:Y.JSON.stringify([{
                            usrInfo:{remove:[parseInt(li.one('.ja-data-usrInfo-id').get('value'),10)]},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            update:{
                usr:function(){
                    Y.JA.widget.busy.set('message','updating user...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            usr:{record:[{
                                data:{
                                    id       :parseInt(f.usrId.get('value'),10),
                                    title    :f.usrTitle    .get('value'),
                                    firstName:f.usrFirstName.get('value'),
                                    lastName :f.usrLastName .get('value')
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrAddress:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','updating user address...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            usrAddress:{record:[{
                                data:{
                                    id     :parseInt(li.one('.ja-data-usrAddress-id').get('value'),10),
                                    usr    :parseInt(f.usrId.get('value'),10),
                                    address:parseInt(li.one('.ja-data-usrAddress-address').get('value'),10),
                                    purpose:li.one('.ja-data-usrAddress-purpose').get('value')
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrInfo:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','updating user information ...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            usrInfo:{record:[{
                                data:{
                                    id      :parseInt(li.one('.ja-data-usrInfo-id').get('value'),10),
                                    usr     :parseInt(f.usrId.get('value'),10),
                                    category:li.one('.ja-data-usrInfo-category').get('value'),
                                    detail  :li.one('.ja-data-usrInfo-detail'  ).get('value')
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            //global
                h.tvBox.delegate('click',trigger.record.add   ,'.ja-add');
                h.tvBox.delegate('click',trigger.record.remove,'.ja-remove');
            //usr
                h.hd.delegate('change',io.update.usr,'.ja-data');
            //usrAddress
                h.tvUsrAddressList.delegate('change',io.update.usrAddress,'.ja-data-usrAddress-purpose');
            //usrInfo
                h.tvUsrInfoList.delegate('change',io.update.usrInfo,'.ja-data-usrInfo-category,.ja-data-usrInfo-detail');
        };

        pod={
            display:{
                address:function(e){
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({});
                }
            },
            load:{
                address:function(){
                    Y.use('ja-pod-address',function(Y){
                        self.my.podAddress=new Y.JA.pod.address({});
                        Y.JA.whenAvailable.inDOM(self,'my.podAddress',function(){
                            self.my.podAddress.set('zIndex',cfg.zIndex+10);
                            pod.display.address();
                        });
                        Y.on(self.my.podAddress.customEvent.select,io.insert.usrAddress);
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
                            var a=rs.address.data[usrAddress.address],
                                l=rs.location.data[a.location]
                            ;
                            usrAddress.streetRef   =a.streetRef;
                            usrAddress.streetName  =a.streetName;
                            usrAddress.locationName=l.name;
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
                       +'<input type="text" disabled="disabled"      class="ja-data ja-data-usr-id">'
                       +'<input type="text" placeholder="title"      class="ja-data ja-data-usr-title">'
                       +'<input type="text" placeholder="first name" class="ja-data ja-data-usr-firstName">'
                       +'<input type="text" placeholder="last name"  class="ja-data ja-data-usr-lastName">'
                       +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'',
                    visible:cfg.visible,
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).render();

                h.tv=new Y.TabView({
                    children:[
                        {label:'Address '+Y.JA.html('btn',{action:'add',title:'add',classes:'ja-tv-usrAddress'}),content:'<ul class="ja-list ja-list-usrAddress"></ul>'},
                        {label:'Info '   +Y.JA.html('btn',{action:'add',title:'add',classes:'ja-tv-usrInfo'   }),content:'<ul class="ja-list ja-list-usrInfo"></ul>'}
                    ]
                }).render(h.ol.bodyNode);
                //shortcuts
                    h.hd    =h.ol.headerNode;
                    h.bd    =h.ol.bodyNode;
                    h.ft    =h.ol.footerNode;
                    h.bb    =h.ol.get('boundingBox');
                    h.close =h.hd.one('.ja-close');

                    f.usrId       =h.hd.one('.ja-data-usr-id');
                    f.usrTitle    =h.hd.one('.ja-data-usr-title');
                    f.usrFirstName=h.hd.one('.ja-data-usr-firstName');
                    f.usrLastName =h.hd.one('.ja-data-usr-lastName');

                    h.tvBox           =h.tv.get('boundingBox');
                    h.tvUsrAddress    =h.tv.item(0).get('panelNode');
                    h.tvUsrAddressList=h.tvUsrAddress.one('ul');
                    h.tvUsrInfo       =h.tv.item(1).get('panelNode');
                    h.tvUsrInfoList   =h.tvUsrInfo.one('ul');
            },
            usrAddress:function(obj){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrAddress-id" value="'+obj.id+'" />'
                    +  '<input type="hidden" class="ja-data ja-data-usrAddress-address" value="'+obj.address+'" />'
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
                    +    '<option>EMail</option>'
                    +    '<option>Skype</option>'
                    +    '<option>Facebook</option>'
                    +    '<option>Fax</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<textarea class="ja-data ja-data-usrInfo-detail" placeholder="details">'+obj.detail+'</textarea>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                h.tvUsrInfoList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrInfo-category'),obj.category);
                return nn;
            }
        };

        trigger={
            record:{
                add:function(e){
                    if(this.hasClass('ja-tv-usrAddress')){
                        pod.display.address();
                    }else if(this.hasClass('ja-tv-usrInfo')){
                        io.insert.usrInfo();
                    }
                },
                remove:function(e){
                    var list=this.ancestor('.ja-list')
                    ;
                    if(list.hasClass('ja-list-usrAddress')){
                        io.remove.usrAddress(e);
                    }else if(list.hasClass('ja-list-usrInfo')){
                        io.remove.usrInfo(e);
                    }
                }
            },
            reset:function(){
                h.hd.all('.ja-data').set('value','');
                h.tvUsrAddressList.set('innerHTML','');
                h.tvUsrInfoList.set('innerHTML','');
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
