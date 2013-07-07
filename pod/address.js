/** //pod/address.js
 *
 */
 YUI.add('ja-pod-address',function(Y){
    "use strict";

    Y.namespace('JA.pod').address=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title :'address',
            width :720,
            visible:false,
            zIndex:99999
        },cfg);

        this.info={
            id         :'address',
            title      :cfg.title,
            description:'address details',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            render={},
            trigger={}
        ;

        this.display=function(p){
            cfg=Y.merge(cfg,p);
            h.ol.set('visible',cfg.visible);
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            trigger.resetForm();
            if(typeof p.address!=='undefined' && p.address!=='' && p.address!==null && !isNaN(p.address)){
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
            select:self.info.id+(++JA.env.customEventSequence)+':select'
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
                address:function(){
                    Y.JA.widget.busy.set('message','getting address(s)...');
                    Y.io('/db/address/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].address.result
                            ;
                            Y.each(rs.address.data,function(address){
                                f.location    .set('value',address.location);
                                f.locationName.set('value',rs.location.data[address.location].name);
                                f.streetName  .set('value',address.streetName);
                                f.streetRef   .set('value',address.streetRef);
                            });
                            trigger.options.display();
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            address:{
                                criteria:{addressIds:[cfg.address]}
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            select:function(){
                Y.JA.widget.busy.set('message','returning address');
                delete cfg.address;
                Y.io('/db/siud.php',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    on:{complete:function(id,o){
                        Y.fire(self.customEvent.select,Y.JSON.parse(o.responseText)[0].address.record[0]);
                        Y.JA.widget.busy.set('message','');
                        h.close.simulate('click');
                    }},
                    data:Y.JSON.stringify([{
                        address:{
                            record:[{
                                data:trigger.addressData()
                            }]
                        },
                        usr:JA.user.usr
                    }])
                });
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            h.bd.delegate('change',trigger.addressChanged,'.ja-data-state,.ja-data-locationName,.ja-data-streetName');
            f.streetRef.on('keyup',trigger.options.display);
            h.addressSelect.on('click',io.select);
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAPS">'+self.info.title+'</span> '
                       +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        '<select class="ja-data-state"><option>NSW</option><option>VIC</option><option>QLD</option><option>ACT</option><option>NT</option><option>TAS</option><option>WA</option></select>'
                       +'<input type="hidden" class="ja-data-location" />'
                       +'<input type="text"   class="ja-data-locationName" title="suburb/city" placeholder="suburb" />'
                       +'<input type="text"   class="ja-data-streetName"   title="street" placeholder="street" />'
                       +'<input type="text"   class="ja-data-streetRef"    title="unit/street number" placeholder="#" />'
                       +'<button class="ja-action-select">select</button>',
                    centered:true,
                    visible :cfg.visible,
                    width   :cfg.width,
                    zIndex  :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd           =h.ol.headerNode;
                    h.bd           =h.ol.bodyNode;
                    h.ft           =h.ol.footerNode;
                    h.bb           =h.ol.get('boundingBox');
                    h.close        =h.hd.one('.ja-close');
                    f.state        =h.bd.one('.ja-data-state');
                    f.location     =h.bd.one('.ja-data-location');
                    f.locationName =h.bd.one('.ja-data-locationName');
                    f.streetName   =h.bd.one('.ja-data-streetName');
                    f.streetRef    =h.bd.one('.ja-data-streetRef');
                    h.addressSelect=h.bd.one('.ja-action-select');

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
                            f.location.set('value',e.result.raw[0]);
                            f.locationName.simulate('change');
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
                        },
                        select:function(e){
                            f.streetName.simulate('change');
                        }
                    }
                });
            }
        };

        trigger={
            addressChanged:function(){
                delete cfg.address;
                if(this.hasClass('ja-data-state')){
                    trigger.resetForm();
                }else if(this.hasClass('ja-data-locationName')){
                    f.streetName.set('value','');
                    f.streetRef .set('value','');
                }
                trigger.options.display();
            },
            addressData:function(){
                return {
                    id          :cfg.address,
                    state       :f.state       .get('value'),
                    streetName  :f.streetName  .get('value'),
                    streetRef   :f.streetRef   .get('value'),
                    location    :f.location    .get('value'),
                    locationName:f.locationName.get('value')
                };
            },
            options:{
                display:function(){
                    var address=trigger.addressData()
                    ;
                    address.location!=='' && address.streetName!=='' && address.streetRef!==''
                        ?h.addressSelect.show()
                        :h.addressSelect.hide();
                }
            },
            resetForm:function(){
                h.addressSelect.hide();
                f.location    .set('value','');
                f.locationName.set('value','');
                f.streetName  .set('value','');
                f.streetRef   .set('value','');
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
