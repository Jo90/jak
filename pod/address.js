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
           ,xy    :[10,20]
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
            d.params=Y.merge(d.params,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            trigger.displayOptions();
            h.ol.show();
            trigger.reset();
            if(typeof p.address!=='undefined' && p.address!==''){
                io.fetch.address();
            }
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            newAddress:self.info.id+(++JAK.env.customEventSequence)+':newAddress'
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
                    Y.JAK.widget.busy.set('message','getting address(s)...');
                    Y.io('/db/address/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.address},
                        data:Y.JSON.stringify([{
                            criteria:{addressIds:[d.params.address]},
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            insert:{
                address:function(){
                    Y.JAK.widget.busy.set('message','creating address');
                    Y.io('/db/address/i.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            debugger;
                            populate.address();
                        }},
                        data:Y.JSON.stringify([{
                            criteria:{
                                id        :f.id        .get('value'),
                                location  :f.location  .get('value'),
                                streetName:f.streetName.get('value'),
                                streetRef :f.streetRef .get('value')
                            },
                            member:JAK.user.usr
                        }])
                    });
                }
            },
            remove:{
                address:function(){
                    Y.JAK.widget.busy.set('message','removing');
                    Y.io('/db/address/d.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.address},
                        data:Y.JSON.stringify([{
                            criteria:{id:f.id.get('value')},
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
            f.state       .on('change',trigger.onChange,null,'state');
            f.locationName.on('change',trigger.onChange,null,'locationName');
            f.streetName  .on('change',trigger.onChange,null,'streetName');
            f.streetRef   .on('change',trigger.onChange,null,'streetRef');

            h.addressSelect.on('click',function(){
                alert('select');
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
                    users    =rs.usrJob.data,
                    cnt      =0
                ;
                h.addressSelect.hide();
                h.addressCreate.hide();
                h.addressDelete.hide();
                Y.each(addresses,function(address){
                    var _jobs =Object.keys(jobs).length,
                        _users=Object.keys(users).length
                    ;
					trigger.displayOptions();
	                h.addressSelect.show();
                    cnt++;
                    f.id          .set('value',address.id);
                    f.location    .set('value',address.location);
                    f.locationName.set('value',locations[address.location].name);
                    f.streetName  .set('value',address.streetName);
                    f.streetRef   .set('value',address.streetRef);
                    f.jobs        .setContent(_jobs);
                    f.users       .setContent(_users);
                    if(_jobs===0&&_users===0){
                        h.addressDelete.show();
                    }
                });
                //no address found = create
                if(cnt===0){
                    io.insert.address();
                }
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
                       +'<input type="hidden" class="jak-data-id" />'
                       +'<input type="hidden" class="jak-data-location" />'
                       +'<input type="text"   class="jak-data-locationName" title="suburb/city" placeholder="suburb" />'
                       +'<input type="text"   class="jak-data-streetName"   title="street" placeholder="street" />'
                       +'<input type="text"   class="jak-data-streetRef"    title="unit/street number" placeholder="#" />'
                       +'<button class="jak-action-select">select</button>'
                       +'<button class="jak-action-create">create</button>'
                       +'<button class="jak-action-delete">delete</button>'
                       +'<br/>usage jobs(<span class="jak-data-jobs"></span>) users(<span class="jak-data-users"></span>)',
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd           =h.ol.headerNode;
                    h.bd           =h.ol.bodyNode;
                    h.ft           =h.ol.footerNode;
                    h.bb           =h.ol.get('boundingBox');
                    h.close        =h.hd.one('.jak-close');
                    f.state        =h.bd.one('.jak-data-state');
                    f.id           =h.bd.one('.jak-data-id');
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
                                if(e.data.length===1){this.selectItem();}
                                if(e.data.length===0){f.location.set('value',0);}
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
                                if(e.data.length===1){this.selectItem();}
                            }
                        },
                        on:{
                            query:function(e){
                                this.set('source','/db/address/acStreetName.php?streetRef='+encodeURI(f.streetRef.get('value'))+'&streetName={query}&location='+f.location.get('value'));
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
			            		h.addressCreate.setStyle('display','none');
                                if(e.data.length===0 &&
                                   f.location!=='' &&
				                   f.streetName!=='' &&
				                   f.streetRef!==''){
				                   	trigger.displayOptions();
				                	h.addressCreate.show();
                                }
                                if(e.data.length===1){
                                    d.params.address=e.results[0].raw[0];
                                    io.fetch.address();
                                }
                            }
                        },
                        on:{
                            query:function(e){
                                this.set('source','/db/address/acStreetRef.php?streetRef={query}&streetName='+encodeURI(f.streetName.get('value'))+'&location='+f.location.get('value'));
                            }
                        }
                    });


            }
        };

        trigger={
            displayOptions:function(){
                h.addressSelect.hide();
                h.addressCreate.hide();
                h.addressDelete.hide();
                f.jobs .setContent('');
			    f.users.setContent('');
				//

            },
            onChange:function(e,field){
                if(field==='state'){
					trigger.reset();
                }else
                if(field==='locationName'){
                    f.streetName.set('value','');
                    f.streetRef .set('value','');
                }else
                if(field==='streetName' &&
                   f.streetName.get('value')===''){
	                f.streetRef.set('value','');
	                trigger.displayOptions();
                }
            },
            reset:function(){
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
