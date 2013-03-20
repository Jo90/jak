/** //pod/job.js
 *
 */
YUI.add('jak-pod-job',function(Y){

    Y.namespace('JAK.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'job',
            width      :1000,
            xy         :[10,20],
            zIndex     :99999
        },cfg);

        this.info={
            id         :'job',
            title      :cfg.title,
            description:'job details',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            d.pod=Y.merge(d.pod,p);
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            if(typeof p.job!='undefined'){
                io.fetch.job(p);
            }else{
                trigger.blankForm();
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
            save:self.info.id+(++JAK.env.customEventSequence)+':save'
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
                job:function(p){
                    Y.JAK.widget.busy.set('message','getting job(s)...');
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            criteria:{jobIds:[p.job]},
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            save:{
                job:function(){
                    alert('save - to be implemented');
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.bd.one('.jak-address').on('click',pod.display.address);
            h.propItemSection.delegate('click',pod.display.propItem,'.jak-add');
            h.propItemSection.one('.jak-remove').on('click',function(){h.propItemList.setContent('');});
            h.propItemList.delegate('click',function(){this.ancestor('li').remove();},'.jak-remove');
            h.propItemList.delegate('focus',function(){this.addClass('jak-focus');},'li');
            h.propItemList.delegate('blur',function(){this.removeClass('jak-focus');},'li');
            h.save.on('click',io.save.job);
        };

        pod={
            display:{
                address:function(){
                    h.podInvoke=this;
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({address:f.jobAddress.get('value')});
                },
                propItem:function(){
                    h.podInvoke=this;
                    if(!self.my.podPropItem){pod.load.propItem();return false;}
                    self.my.podPropItem.display();
                }
            },
            load:{
                address:function(){
                    Y.use('jak-pod-address',function(Y){
                        self.my.podAddress=new Y.JAK.pod.address({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podAddress',function(){
                            self.my.podAddress.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podAddress.customEvent.newAddress,pod.result.address);
                    });
                },
                propItem:function(){
                    Y.use('jak-pod-propItem',function(Y){
                        self.my.podPropItem=new Y.JAK.pod.propItem({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podPropItem',function(){
                            self.my.podPropItem.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podPropItem.customEvent.select,pod.result.propItem);
                    });
                }
            },
            result:{
                address:function(rs){
                    debugger;
                },
                propItem:function(rs){
                    var li=h.podInvoke.ancestor('li'),
                        html=''
                    ;
                    Y.each(rs,function(r){
                        for(var i=0;i<r.qty;i++){
                            html='<li>'
                                +  '<span class="jak-data-propItemType-name">'+JAK.data.propItemType[r.propItemType].name+'</span>'
                                + '<input type="text" placeholder="extra detail" class="jak-data jak-data-name"/>'
                                +  Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                                +  Y.JAK.html('btn',{action:'add',title:'add property item'})
                                +'</li>';
                            if(li===null){h.propItemList.prepend(html);}
                            else{li.insert(html,'after');}
                        };
                    });
                }
            }
        };

        populate={
            job:function(id,o){
                var rs       =Y.JSON.parse(o.responseText)[0].result,
                    addresses=rs.address.data,
                    jobs     =rs.job.data,
                    locations=rs.location.data,
                    usrJobs  =rs.usrJob.data,
                    usrs     =rs.usr.data
                ;
                h.bd.all('.jak-data[type=input]').set('value','');
                Y.each(jobs,function(job){
                    f.jobId.set('value',job.id);
                    f.jobRef.set('value',job.ref);
                    f.jobAppointment.set('value',Y.Date.format(Y.Date.parse(job.appointment*1000),{format:"%d %b %Y"}));
                    if(job.confirmed!==null){
                        f.jobConfirmed.set('value',Y.Date.format(Y.Date.parse(job.confirmed*1000),{format:"%d %b %Y"}));
                    }
                    if(job.reminder!==null){
                        f.jobReminder.set('value',Y.Date.format(Y.Date.parse(job.reminder*1000),{format:"%d %b %Y"}));
                    }
                    Y.JAK.matchSelect(f.jobWeather,job.weather);
                    f.jobAddress.set('value',job.address);
                    f.jobAddressDetail.setContent(
                        addresses[job.address].streetRef
                       +' '+addresses[job.address].streetName
                       +'<br/>'
                       +locations[addresses[job.address].location].full
                    );
                    //>>>>>>>>>>>users



                });
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
                        '<fieldset class="jak-address">'
                       +  '<legend>address</legend>'
                       +  '<input type="hidden" class="jak-data jak-data-address" />'
                       +  '<span></span>'
                       +'</fieldset>'
                       +'job:<input type="text" class="jak-data jak-data-id" title="job number" disabled="disabled" />'
                       +'&nbsp; ref:<input type="text" class="jak-data jak-data-ref" title="old system reference" placeholder="ref#" />'
                       +'<br/>'
                       +'Appointment:<input type="text" class="jak-data jak-date jak-data-appointment" title="appointment date" placeholder="appointment" />'
                       +'&nbsp; Confirmed:<input type="text" class="jak-data jak-date jak-data-confirmed" title="confirmed date" placeholder="confirmed" />'
                       +'&nbsp; Reminder:<input type="text" class="jak-data jak-data-reminder jak-date" title="reminder date" placeholder="reminder" />'
                       +'<br/>'
                       +'<select class="jak-data jak-data-weather">'
                       +  '<option>fine</option>'
                       +  '<option>cloudy</option>'
                       +  '<option>wet</option>'
                       +  '<option>dark</option>'
                       +'</select>'
                       +'<fieldset>'
                       +  '<legend>job</legend>'
                       +  '<fieldset class="jak-section-propItem">'
                       +    '<legend>property items'
                       +      Y.JAK.html('btn',{action:'add',title:'add property item'})
                       +      Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                       +    '</legend>'
                       +    '<ul class="jak-list-propItem"></ul>'
                       +  '</fieldset>'
                       +  '<fieldset>'
                       +    '<legend>lots of questions'
                       +    '<select>'
                       +      '<option>General</option>'
                       +      '<option>AS3660</option>'
                       +      '<option>AS4349.3</option>'
                       +      '<option>AS4349.1</option>'
                       +      '<option>Technical Building Report</option>'
                       +    '</select>'
                       +    '</legend>'
                       +  '</fieldset>'
                       +'</fieldset>',
                    footerContent:Y.JAK.html('btn',{action:'save',title:'save',label:'save'}),
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd              =h.ol.headerNode;
                    h.bd              =h.ol.bodyNode;
                    h.ft              =h.ol.footerNode;
                    h.bb              =h.ol.get('boundingBox');
                    f.jobId           =h.bd.one('.jak-data-id');
                    f.jobAddress      =h.bd.one('.jak-data-address');
                    f.jobAddressDetail=h.bd.one('.jak-address span');
                    f.jobRef          =h.bd.one('.jak-data-ref');
                    f.jobAppointment  =h.bd.one('.jak-data-appointment');
                    f.jobConfirmed    =h.bd.one('.jak-data-confirmed');
                    f.jobReminder     =h.bd.one('.jak-data-reminder');
                    f.jobWeather      =h.bd.one('.jak-data-weather');

                    h.propItemSection =h.bd.one('.jak-section-propItem');
                    h.propItemList    =h.propItemSection.one('ul');

                    h.close           =h.hd.one('.jak-close');
                    h.save            =h.ft.one('.jak-save');
            }
        };

        trigger={
            blankForm:function(){
                f.jobId           .set('value','');
                f.jobAddress      .set('value','');
                f.jobAddressDetail.setContent('address not defined');
                f.jobRef          .set('value','');
                f.jobAppointment  .set('value','');
                f.jobConfirmed    .set('value','');
                f.jobReminder     .set('value','');
                f.jobWeather      .set('value','');
            }
        };

        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
            ['propItemType','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
