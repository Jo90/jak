/** //pod/address.js
 *
 */
YUI.add('jak-pod-address',function(Y){

    Y.namespace('JAK.pod').address=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title :'address'
           ,width :720
           ,zIndex:99999
        },cfg);

        this.info={
            id         :'address'
           ,title      :cfg.title
           ,description:'address details'
           ,version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            cfg=Y.merge(cfg,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            trigger.reset();
            io.fetch.address();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            select:self.info.id+(++JAK.env.customEventSequence)+':select'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
        };

        io={
            fetch:{
                address:function(){
                    //sentry
                        if(typeof cfg.address==='undefined' ||
                            cfg.address==='' ||
                            cfg.address===null ||
                            isNaN(cfg.address)
                        ){return;}
                    Y.JAK.widget.busy.set('message','getting address(s)...');
                    Y.io('/db/address/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.address},
                        data:Y.JSON.stringify([{
                            criteria:{addressIds:[cfg.address]},
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            insert:{
                address:function(){
                    Y.JAK.widget.busy.set('message','creating address');
                    Y.io('/db/address/u.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JAK.widget.busy.set('message','');
                            alert('new address inserted');
                            trigger.displayOptions();
                            h.addressSelect.show();
                        }},
                        data:Y.JSON.stringify([{
                            criteria:trigger.addressData(),
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            remove:{
                address:function(){
                    Y.JAK.widget.busy.set('message','removing');
                    Y.io('/db/address/u.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            Y.JAK.widget.busy.set('message','');
                            alert('address removed, closing pod...');
                            h.close.simulate('click');
                        }},
                        data:Y.JSON.stringify([{
                            criteria:{
                                remove:[cfg.address]
                            },
                            member:JAK.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            //field changes
                f.state.on('change',trigger.reset);
                f.locationName.on('change',function(){
                    delete cfg.address;
                    f.streetName.set('value','');
                    f.streetRef .set('value','');
                    trigger.displayOptions();
                });
                f.streetName.on('change',function(){
                    delete cfg.address;
                    f.streetRef.set('value','');
                    trigger.displayOptions();
                });
            //button/options
                h.addressSelect.on('click',function(){
                    Y.fire(self.customEvent.select,trigger.addressData());
                    h.close.simulate('click');
                });
                h.addressCreate.on('click',io.insert.address);
                h.addressDelete.on('click',io.remove.address);
        };

        populate={
            address:function(id,o){
                var rs       =Y.JSON.parse(o.responseText)[0].result,
                    addresses=rs.address.data,
                    locations=rs.location.data,
                    jobs     =rs.job.data,
                    users    =rs.usrJob.data
                ;
                trigger.reset();
                Y.each(addresses,function(address){
                    var _jobs =Object.keys(jobs).length,
                        _users=Object.keys(users).length
                    ;
                    f.location    .set('value',address.location);
                    f.locationName.set('value',locations[address.location].name);
                    f.streetName  .set('value',address.streetName);
                    f.streetRef   .set('value',address.streetRef);
                    f.jobs        .setContent(_jobs);
                    f.users       .setContent(_users);
                });
                trigger.displayOptions();
                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        '<select class="jak-data-state"><option>NSW</option><option>VIC</option><option>QLD</option><option>ACT</option><option>NT</option><option>TAS</option><option>WA</option></select>'
                       +'<input type="hidden" class="jak-data-location" />'
                       +'<input type="text"   class="jak-data-locationName" title="suburb/city" placeholder="suburb" />'
                       +'<input type="text"   class="jak-data-streetName"   title="street" placeholder="street" />'
                       +'<input type="text"   class="jak-data-streetRef"    title="unit/street number" placeholder="#" />'
                       +'<button class="jak-action-select">select</button>'
                       +'<button class="jak-action-create">create</button>'
                       +'<button class="jak-action-delete">delete</button>'
                       +'<br/>usage jobs(<span class="jak-data-jobs"></span>) users(<span class="jak-data-users"></span>)',
                    centered:true,
                    width   :cfg.width,
                    zIndex  :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd           =h.ol.headerNode;
                    h.bd           =h.ol.bodyNode;
                    h.ft           =h.ol.footerNode;
                    h.bb           =h.ol.get('boundingBox');
                    h.close        =h.hd.one('.jak-close');
                    f.state        =h.bd.one('.jak-data-state');
                    f.location     =h.bd.one('.jak-data-location');
                    f.locationName =h.bd.one('.jak-data-locationName');
                    f.streetName   =h.bd.one('.jak-data-streetName');
                    f.streetRef    =h.bd.one('.jak-data-streetRef');
                    f.jobs         =h.bd.one('.jak-data-jobs');
                    f.users        =h.bd.one('.jak-data-users');
                    h.addressSelect=h.bd.one('button.jak-action-select');
                    h.addressCreate=h.bd.one('button.jak-action-create');
                    h.addressDelete=h.bd.one('button.jak-action-delete');

                //auto complete
                    f.locationName.plug(Y.Plugin.AutoComplete,{
                        activateFirstItem:true,
                        minQueryLength:2,
                        queryDelay:300,
                        resultFilters:'startsWith',
                        resultHighlighter:'wordMatch',
                        resultTextLocator:function(result){return result[4];},
                        after:{
                            results:function(e){
                                delete cfg.address;
                                f.location.set('value','');
                                if(e.data.length===1){this.selectItem();}
                            }
                        },
                        on:{
                            query:function(e){
                                this.set('source','/db/address/acState.php?location={query}&state='+f.state.get('value'));
                            },
                            select:function(e){
                                f.locationName.simulate('change');
                                f.location.set('value',e.result.raw[0]);
                            }
                        }
                    });
                    f.streetName.plug(Y.Plugin.AutoComplete,{
                        activateFirstItem:true,
                        minQueryLength:2,
                        queryDelay:300,
                        resultFilters:'startsWith',
                        resultHighlighter:'wordMatch',
                        resultTextLocator:function(result){return result[0];},
                        after:{
                            results:function(e){
                                delete cfg.address;
                                if(e.data.length===1){this.selectItem();}
                            }
                        },
                        on:{
                            query:function(e){
                                this.set('source','/db/address/acStreetName.php?streetName={query}&location='+f.location.get('value'));
                            }
                        }
                    });
                    f.streetRef.plug(Y.Plugin.AutoComplete,{
                        activateFirstItem:true,
                        queryDelay:300,
                        resultFilters:'startsWith',
                        resultHighlighter:'wordMatch',
                        resultTextLocator:function(result){return result[1];},
                        after:{
                            results:function(e){
                                if(e.data.length===1){
                                    cfg.address=e.results[0].raw[0];
                                    io.fetch.address();
                                }else{
                                    trigger.displayOptions();
                                }
                            }
                        },
                        on:{
                            query:function(e){
                                this.set('source','/db/address/acStreetRef.php?streetRef={query}&streetName='+encodeURI(f.streetName.get('value'))+'&location='+f.location.get('value'));
                            },
                            select:function(e){
                                cfg.address=e.result.raw[0];
                                io.fetch.address();
                            }
                        }
                    });


            }
        };

        trigger={
            addressData:function(){
                return {
                    id          :cfg.address,
                    streetName  :f.streetName  .get('value'),
                    streetRef   :f.streetRef   .get('value'),
                    location    :f.location    .get('value'),
                    locationName:f.locationName.get('value')
                };
            },
            displayOptions:function(){
                var address=trigger.addressData(),
                    jobs   =f.jobs.get('innerHTML'),
                    users  =f.users.get('innerHTML')
                ;
                h.addressSelect.hide();
                h.addressCreate.hide();
                h.addressDelete.hide();
                if(!isNaN(cfg.address)){
                    h.addressSelect.show();
                    if(jobs==='' && users===''){
                        h.addressDelete.show();
                    }
                }else{
                    if(address.location  !=='' &&
                       address.streetName!=='' &&
                       address.streetRef !==''
                    ){
                        h.addressCreate.show();
                    }
                }
            },
            reset:function(){
                h.addressSelect.hide();
                h.addressCreate.hide();
                h.addressDelete.hide();
                f.location    .set('value','');
                f.locationName.set('value','');
                f.streetName  .set('value','');
                f.streetRef   .set('value','');
                f.jobs .setContent('');
                f.users.setContent('');
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
