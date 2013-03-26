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
            trigger.blankForm();
            if(typeof p.job!='undefined'){
                io.fetch.job(p);
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
            h.propPartSection.delegate('click',pod.display.propPart,'.jak-add');
            h.propPartSection.one('> legend > .jak-remove').on('click',function(){
                h.propPartList.all('> li').slice(1).remove();
            });
            h.propPartList.delegate('click',function(){this.ancestor('li').remove();},'.jak-remove');
            h.propPartList.delegate('focus',function(){this.addClass('jak-focus');},'li');
            h.propPartList.delegate('blur',function(){this.removeClass('jak-focus');},'li');

            h.serviceSelect.on('change',trigger.questions);

            h.questionList.delegate('click',function(){
                h.questionList.all('.jak-focus').removeClass('jak-focus');
                this.addClass('jak-focus');
            },'> li');

            h.save.on('click',io.save.job);
        };

        pod={
            display:{
                address:function(){
                    h.podInvoke=this;
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({address:f.jobAddress.get('value')});
                },
                propPart:function(){
                    h.podInvoke=this;
                    if(!self.my.podPropPart){pod.load.propPart();return false;}
                    self.my.podPropPart.display();
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
                propPart:function(){
                    Y.use('jak-pod-propPart',function(Y){
                        self.my.podPropPart=new Y.JAK.pod.propPart({});
                        Y.JAK.whenAvailable.inDOM(self,'my.podPropPart',function(){
                            self.my.podPropPart.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podPropPart.customEvent.select,pod.result.propPart);
                    });
                }
            },
            result:{
                address:function(rs){
                    debugger;
                },
                propPart:function(rs){
                    Y.each(rs,function(r){
                        for(var i=0;i<r.qty;i++){
                            h.podInvoke.ancestor('li').insert(
                                '<li>'
                               +  '<input type="checkbox" class="jak-propPartType-check" />'
                               +  '<span class="jak-data-propPartType-name">'+JAK.data.propPartType[r.propPartType].name+'</span>'
                               +  '<input type="text" placeholder="detail" class="jak-data jak-data-name"/>'
                               +  Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                               +  Y.JAK.html('btn',{action:'add',title:'add property parts'})
                               +'</li>',
                               'after'
                            );
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
                var jobServiceArr=[],
                    serviceArr=[]
                ;
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
                       +'<fieldset class="jak-list-service">'
                       +  '<legend>services</legend>'
                       +'</fieldset>'
                       +'<fieldset>'
                       +  '<legend>job</legend>'
                       +  '<fieldset class="jak-section-propPart">'
                       +    '<legend>property'
                       +      Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                       +    '</legend>'
                       +    '<ul class="jak-list-propPart">'
                       +      '<li>'
                       +        '<input type="checkbox" class="jak-propPartType-check" />'
                       +        '<span class="jak-data-propPartType-name">Property</span>'
                       +        Y.JAK.html('btn',{action:'add',title:'add property parts'})
                       +      '</li>'
                       +    '</ul>'
                       +  '</fieldset>'
                       +  '<fieldset class="jak-section-question">'
                       +    '<legend>'
                       +      '<select class="jak-select-service"></select>'
                       +      Y.JAK.html('btn',{action:'find',label:'generate/reset'})
                       +    '</legend>'
                       +    '<ul></ul>'
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

                    h.serviceList     =h.bd.one('.jak-list-service');
                    h.serviceSelect   =h.bd.one('.jak-select-service');
                    h.questionSection =h.bd.one('.jak-section-question');
                    h.questionList    =h.questionSection.one('ul');

                    h.propPartSection =h.bd.one('.jak-section-propPart');
                    h.propPartList    =h.propPartSection.one('ul');

                    h.close           =h.hd.one('.jak-close');
                    h.save            =h.ft.one('.jak-save');

                    Y.each(JAK.data.service,function(service){
                        h.serviceSelect.append('<option value="'+service.id+'">'+service.name+'</option>');
                        if(service.id===1){return;}//exclude general
                        jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="jak-data jak-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                    });
                    h.serviceList.append(jobServiceArr.join(','));
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
                h.propPartList.all('> li').slice(1).remove();
            },
            questions:function(){
                var serviceId=parseInt(this.get('value'),10),
                    q
                ;
                h.questionList.setContent('');
                Y.each(JAK.data.questionMatrix,function(questionMatrix){
                    if(questionMatrix.service!==serviceId){return;}
                    q=JAK.data.question[questionMatrix.question];
                    h.questionList.append(
                        '<li>'
                       +  '<em>'+q.name+'</em>'
                       +  (q.codeType==='H'?q.code:'')
                       +  Y.JAK.html('btn',{action:'remove',title:'remove'})
                       +  Y.JAK.html('btn',{action:'dup',title:'duplicate'})
                       +'</li>'
                    );
                });
            }
        };

        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
            ['propPartType','id'],
            ['question','id'],
            ['questionMatrix','id'],
            ['service','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
