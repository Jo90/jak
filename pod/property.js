/** //pod/property.js
 *
 */
YUI.add('ja-pod-property',function(Y){

    Y.namespace('JA.pod').property=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title   :'property',
            width   :850,
            visible :true,
            xy      :[10,20],
            zIndex  :99999
        },cfg);

        this.info={
            id         :'property',
            title      :cfg.title,
            description:'property details',
            version    :'v1.0 June 2013'
        };

        var self=this,
            d={},f={},h={},
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
            trigger.reset.form();
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            io.fetch.property();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            save:self.info.id+(++JA.env.customEventSequence)+':save'
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
                property:function(){
                    Y.JA.widget.busy.set('message','getting property(s)...');
                    Y.io('/db/suid.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.property},
                        data:Y.JSON.stringify([{
                            property:{
                                criteria:{propertyIds:[cfg.property]}
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            insert:{
                property:function(){
                    Y.JA.widget.busy.set('message','new property...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].property.record[0]
                            ;
                            cfg.property=rs.data.id;
                            io.fetch.property();
                        }},
                        data:Y.JSON.stringify([{
                            property:{record:[{
                                data:{
                                    appointment:cfg.appointment
                                }
                            }]},
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            remove:{
                property:function(){
                }
            },
            update:{
                property:function(){
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JA.widget.dialogMask.hide();
            });
        };

        pod={
            display:{
            },
            load:{
            },
            result:{
            }
        };

        populate={
            property:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var addresses=d.rs.address.data
                ;
                trigger.reset.form();
                //only 1 property anyway
                Y.each(d.rs.property.data,function(property){
                    f.propertyId.set('value',property.id);
                    f.propertyRef.set('value',property.ref);
                    if(property.appointment!==null){
                        f.propertyAppointment.set('value',moment.unix(property.appointment).format('DDMMMYY hh:mma'));
                    };
                    if(property.confirmed!==null){
                        f.propertyConfirmed.set('value',moment.unix(property.confirmed).format('DDMMMYY hh:mma'));
                    }
                    if(property.reminder!==null){
                        f.propertyReminder.set('value',moment.unix(property.reminder).format('DDMMMYY hh:mma'));
                    }
                    Y.JA.matchSelect(f.propertyWeather,property.weather);
                    f.propertyAddress.set('value',property.address);
                    f.propertyAddressDetail.set('innerHTML','');
                    f.propertyAddressDetail.set('innerHTML','click here to specify address');
                    if(property.address&&addresses[property.address]){
                        f.propertyAddressDetail.set('innerHTML',
                            render.address({
                                streetRef :addresses[property.address].streetRef,
                                streetName:addresses[property.address].streetName,
                                location  :d.rs.location.data[addresses[property.address].location].full
                            })
                        );
                    }
                    populate.propPart();
                    populate.answer();
                });
                //sync display
                    h.answerFilterService.simulate('change');
                    h.answerSection.one('legend a').simulate('click');
                    h.propPartSection.one('legend a').simulate('click');
                Y.JA.widget.busy.set('message','');
                Y.fire(self.customEvent.save,'refresh');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                        +'<input type="hidden" class="ja-data ja-data-id" />'
                        +'<input type="hidden" class="ja-data ja-data-address"  />'
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        //property
                        'ref:<input type="text" class="ja-data ja-data-ref" title="old system reference" placeholder="ref#" />'
                       +Y.JA.html('btn',{action:'save',title:'save',label:'save'})
                        +'<div></div>',
                    width  :cfg.width,
                    visible:cfg.visible,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd              =h.ol.headerNode;
                    h.bd              =h.ol.bodyNode;
                    h.ft              =h.ol.footerNode;
                    h.bb              =h.ol.get('boundingBox');

                    h.close           =h.hd.one('.ja-close');

                    f.propertyId      =h.hd.one('.ja-data-id');
                    f.propertyAddress =h.hd.one('.ja-data-address');
            }
        };

        trigger={
            reset:{
                form:function(){
                    f.propertyId             .set('value','');
                    f.propertyAddress        .set('value','');
                }
            }
        };
        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
            ['prop','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 June 2013',{requires:['base','io','node']});
