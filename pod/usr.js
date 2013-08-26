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
                defaultGrpType          :'Family',
                defaultUsrAddressPurpose:'Home',
                defaultUsrGrpInterest   :'Interest...',
                defaultUsrInfoCategory  :'specify...'
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

        this.customEvent={
            close:self.info.id+(++JA.env.customEventSequence)+':close'
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
                grp:function(){
                    Y.JA.widget.busy.set('message','new group...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            //insert default record for current user (usr,grpNode)
                            io.insert.usrGrp(
                                {
                                    id       :parseInt(f.usrId.get('value'),10),
                                    title    :f.usrTitle    .get('value'),
                                    firstName:f.usrFirstName.get('value'),
                                    lastName :f.usrLastName .get('value')
                                },
                                render.grp(Y.JSON.parse(o.responseText)[0].grp.record[0].data)
                            );
                        }},
                        data:Y.JSON.stringify([{
                            grp :{record:[{data:{type:d.defaultGrpType,name:''}}]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrAddress:function(rsAddress){
                    Y.JA.widget.busy.set('message','new user address...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            render.usrAddress(
                                Y.JSON.parse(o.responseText)[0].usrAddress.record[0].data,
                                rsAddress.data
                            );
                        }},
                        data:Y.JSON.stringify([{
                            usrAddress:{record:[{
                                data:{
                                    usr    :parseInt(f.usrId.get('value'),10),
                                    address:rsAddress.data.id,
                                    purpose:d.defaultUsrAddressPurpose
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                },
                usrGrp:function(usr,grpNode){
                    Y.JA.widget.busy.set('message','new user group...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            render.usrGrp(Y.JSON.parse(o.responseText)[0].usrGrp.record[0].data,grpNode,usr);
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            usrGrp:{record:[{data:{
                                usr     :usr.id,
                                grp     :parseInt(grpNode.one('.ja-data-grp-id').get('value'),10),
                                interest:d.defaultUsrGrpInterest
                            }}]},
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
                                    category:d.defaultUsrInfoCategory,
                                    detail  :''
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            remove:{
                grp:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            li.remove();
                        }},
                        data:Y.JSON.stringify([{
                            grp:{remove:[parseInt(li.one('.ja-data-grp-id').get('value'),10)]},
                            user:JA.user.usr
                        }])
                    });
                },
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
                usrGrp:function(e){
                    var li=e.currentTarget.ancestor('li')
                    ;
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){li.remove();}},
                        data:Y.JSON.stringify([{
                            usrGrp:{remove:[parseInt(li.one('.ja-data-usrGrp-id').get('value'),10)]},
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
                grp:function(e){
                    var li=this.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','updating group...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            grp:{record:[{
                                data:{
                                    id  :parseInt(li.one('.ja-data-grp-id').get('value'),10),
                                    type:li.one('.ja-data-grp-type').get('value'),
                                    name:li.one('.ja-data-grp-name').get('value')
                                }
                            }]},
                            user:JA.user.usr
                        }])
                    });
                },
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
                                data:trigger.getUsr()
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
                usrGrp:function(e){
                    var li=this.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','updating user group...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            usrGrp:{record:[{
                                data:{
                                    id      :parseInt(li.one('.ja-data-usrGrp-id' ).get('value'),10),
                                    usr     :parseInt(li.one('.ja-data-usrGrp-usr').get('value'),10),
                                    grp     :parseInt(li.one('.ja-data-usrGrp-grp').get('value'),10),
                                    interest:li.one('.ja-data-usrGrp-interest').get('value')
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
            h.close.on('click',function(){
                h.ol.hide();
                Y.JA.widget.dialogMask.hide();
                Y.fire(self.customEvent.close,trigger.getUsr());
            });
            //global
                //add
                    h.tvBox.delegate('click',function(e){
                        if(this.hasClass('ja-tv-usrAddress')){pod.display.address();}else
                        if(this.hasClass('ja-tv-usrInfo'   )){io.insert.usrInfo();}else
                        if(this.hasClass('ja-tv-grp'       )){io.insert.grp();}
                    },'.ja-add');
                //remove
                    h.tvBox.delegate('click',function(e){
                        var list=this.ancestor('.ja-list');
                        if(list.hasClass('ja-list-grp'       )){if(confirm('this will remove the entire group')){io.remove.grp(e);}}else
                        if(list.hasClass('ja-list-usrAddress')){io.remove.usrAddress(e);}else
                        if(list.hasClass('ja-list-usrGrp'    )){io.remove.usrGrp(e);    }else
                        if(list.hasClass('ja-list-usrInfo'   )){io.remove.usrInfo(e);   }
                    },'.ja-remove');
            //usr
                h.hd.delegate('change',io.update.usr,'.ja-data');
            //usrAddress
                h.tvUsrAddressList.delegate('change',io.update.usrAddress,'.ja-data-usrAddress-purpose');
            //usrInfo
                h.tvUsrInfoList.delegate('change',io.update.usrInfo,'.ja-data-usrInfo-category,.ja-data-usrInfo-detail');
            //grp
                h.tvGrpList.delegate('change',io.update.grp,'.ja-data-grp-type,.ja-data-grp-name');
                h.tvGrpList.delegate('change',io.update.usrGrp,'.ja-data-usrGrp-interest');
                h.tvGrpList.delegate('click',pod.display.usrFind,'.ja-add');
        };

        pod={
            display:{
                address:function(e){
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({});
                },
                usrFind:function(e){
                    e.halt();
                    h.podInvoke=e.currentTarget;
                    if(!self.my.podUsrFind){pod.load.usrFind({});return false;}
                    self.my.podUsrFind.display({});
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
                },
                usrFind:function(p){
                    Y.use('ja-pod-usrFind',function(Y){
                        self.my.podUsrFind=new Y.JA.pod.usrFind(p);
                        Y.JA.whenAvailable.inDOM(self,'my.podUsrFind',function(){
                            this.my.podUsrFind.set('zIndex',h.ol.get('zIndex')+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podUsrFind.customEvent.returnSelection,function(usr){
                            io.insert.usrGrp(usr,h.podInvoke.ancestor('li'));
                        });
                    });
                }
            }
        };

        populate={
            usr:function(id,o){
                var rs =Y.JSON.parse(o.responseText)[0].result,
                    usr=rs.usr.data[cfg.usr]
                ;
                f.usrId       .set('value',usr.id);
                f.usrTitle    .set('value',usr.title);
                f.usrFirstName.set('value',usr.firstName);
                f.usrLastName .set('value',usr.lastName);
                //address
                    if(rs.usrAddress && rs.usrAddress.data){
                        Y.each(rs.usrAddress.data,function(usrAddress){if(usrAddress.usr===usr.id){
                            var address=rs.address.data[usrAddress.address]
                            ;
                            address.locationName=rs.location.data[address.location].name;
                            render.usrAddress(usrAddress,address);
                        }});
                    }
                //info
                    if(rs.usrInfo && rs.usrInfo.data){
                        Y.each(rs.usrInfo.data,function(usrInfo){if(usrInfo.usr===usr.id){
                            render.usrInfo(usrInfo);
                        }});
                    }
                //grp
                    if(rs.grp && rs.grp.data){
                        Y.each(rs.grp.data,function(grp){
                            var grpNode=render.grp(grp)
                            ;
                            Y.each(rs.usrGrp.data,function(usrGrp){if(usrGrp.grp===grp.id){
                                render.usrGrp(usrGrp,grpNode,rs.usr.data[usrGrp.usr]);
                            }});
                        });
                    }
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
                        {label:'Info '   +Y.JA.html('btn',{action:'add',title:'add',classes:'ja-tv-usrInfo'   }),content:'<ul class="ja-list ja-list-usrInfo"></ul>'   },
                        {label:'Groups ' +Y.JA.html('btn',{action:'add',title:'add',classes:'ja-tv-grp'       }),content:'<ul class="ja-list ja-list-grp"></ul>'       }
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

                    h.tvGrp           =h.tv.item(2).get('panelNode');
                    h.tvGrpList       =h.tvGrp.one('ul');
            },
            grp:function(grp){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<fieldset>'
                    +    '<legend>'
                    +      '<input type="hidden" class="ja-data ja-data-grp-id" value="'+grp.id+'" />'
                    +      '<select class="ja-data ja-data-grp-type">'
                    +        '<option>'+d.defaultGrpType+'</option>'
                    +        '<option>Family</option>'
                    +        '<option>Business</option>'
                    +        '<option>Group</option>'
                    +        '<option>Other</option>'
                    +      '</select>'
                    +      '<input type="text" class="ja-data ja-data-grp-name" value="'+grp.name+'" placeholder="group name/description" />'
                    +      Y.JA.html('btn',{action:'remove',title:'remove'})
                    +      Y.JA.html('btn',{action:'add'   ,title:'add member'})
                    +    '</legend>'
                    +    '<ul class="ja-list ja-list-usrGrp"></ul>'
                    +  '</fieldset>'
                    +'</li>'
                );
                h.tvGrpList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-grp-type'),grp.type);
                return nn;
            },
            usrAddress:function(usrAddress,address){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrAddress-id" value="'+usrAddress.id+'" />'
                    +  '<input type="hidden" class="ja-data ja-data-usrAddress-address" value="'+usrAddress.address+'" />'
                    +  '<select class="ja-data ja-data-usrAddress-purpose">'
                    +    '<option>'+d.defaultUsrAddressPurpose+'</option>'
                    +    '<option>Work</option>'
                    +    '<option>Postal</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<span>'+address.streetRef+' '+address.streetName+' '+address.locationName+'</span>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                h.tvUsrAddressList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrAddress-purpose'),usrAddress.purpose);
                return nn;
            },
            usrGrp:function(usrGrp,grpNode,usr){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrGrp-id"  value="'+usrGrp.id+'" />'
                    +  '<input type="hidden" class="ja-data ja-data-usrGrp-usr" value="'+usr.id+'" />'
                    +  '<input type="hidden" class="ja-data ja-data-usrGrp-grp" value="'+usrGrp.grp+'" />'
                    +  '<select class="ja-data ja-data-usrGrp-interest">'
                    +    '<option>'+d.defaultUsrGrpInterest+'</option>'
                    +    '<option>Husband</option>'
                    +    '<option>Wife</option>'
                    +    '<option>Spouse</option>'
                    +    '<option>Partner</option>'
                    +    '<option>Member</option>'
                    +    '<option>Child</option>'
                    +    '<option>Friend</option>'
                    +    '<option>Associate</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<span>'+usr.title+' '+usr.firstName+' '+usr.lastName+'</span>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                grpNode.one('ul').append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrGrp-interest'),usrGrp.interest);
                return nn;
            },
            usrInfo:function(usrInfo){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-usrInfo-id" value="'+usrInfo.id+'" />'
                    +  '<select class="ja-data ja-data-usrInfo-category">'
                    +    '<option>'+d.defaultUsrInfoCategory+'</option>'
                    +    '<option>Phone</option>'
                    +    '<option>EMail</option>'
                    +    '<option>Skype</option>'
                    +    '<option>Facebook</option>'
                    +    '<option>Fax</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  '<textarea class="ja-data ja-data-usrInfo-detail" placeholder="details">'+usrInfo.detail+'</textarea>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove'})
                    +'</li>'
                );
                h.tvUsrInfoList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-usrInfo-category'),usrInfo.category);
                return nn;
            }
        };

        trigger={
            getUsr:function(){
                return {
                    id       :parseInt(f.usrId.get('value'),10),
                    title    :f.usrTitle    .get('value'),
                    firstName:f.usrFirstName.get('value'),
                    lastName :f.usrLastName .get('value')
                };
            },
            reset:function(){
                h.hd.all('.ja-data').set('value','');
                h.tvUsrAddressList.set('innerHTML','');
                h.tvUsrInfoList.set('innerHTML','');
                h.tvGrpList.set('innerHTML','');
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
