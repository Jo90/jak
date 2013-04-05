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
            initialise,
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
            if(typeof p.job!=='undefined'){
                io.fetch.job(p);
            }else{
                h.serviceSelect.simulate('change');
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
            update:self.info.id+(++JAK.env.customEventSequence)+':update'
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
                },
                propPart:function(id,o){
                    var rs=Y.JSON.parse(o.responseText),
                        propPartIds=[]
                    ;
                    Y.each(rs,function(rec){
                        propPartIds.push(parseInt(rec.criteria.data.id,10));
                    });
                    Y.JAK.widget.busy.set('message','getting property parts...');
                    Y.io('/db/prop/sPropPart.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].result.propPart.data
                            ;
                            trigger.reset.propPart();
                            populate.propPart(rs);
                        }},
                        data:Y.JSON.stringify([{
                            criteria:{propPartIds:propPartIds},
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            remove:{
                propPart:function(){
                    var row=this.ancestor('li'),
                        propPartId=parseInt(row.one('.jak-data-propPart-id').get('value'),10)
                    ;
                    Y.io('/db/prop/iud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                            row.remove();
                        }},
                        data:Y.JSON.stringify([{
                            remove:[propPartId],
                            member:JAK.user.usr
                        }])
                    });
                }
            },
            save:{
                job:function(){
                    var post={
                            job:{
                                id         :parseInt(f.jobId     .get('value'),10),
                                address    :parseInt(f.jobAddress.get('value'),10),
                                ref        :f.jobRef        .get('value'),
                                appointment:f.jobAppointment.get('value'),
                                confirmed  :f.jobConfirmed  .get('value'),
                                reminder   :f.jobReminder   .get('value'),
                                weather    :f.jobWeather    .get('value')
                            },
                            answer      :[],
                            answerMatrix:[],
                            propPart    :[],
                            usr         :JAK.user.usr
                        },
                        values=[]
                    ;

                    h.propPartList.all('> li').each(function(row,idx){
                        post.propPart.push({
                            id          :parseInt(row.one('.jak-data-propPart-id').get('value'),10),
                            job         :parseInt(f.jobId.get('value'),10),
                            propPartType:parseInt(row.one('.jak-data-propPart-propPartType').get('value'),10),
                            seq         :idx,
                            indent      :0, //>>>>>>>>FINISH LATER
                            name        :row.one('.jak-data-propPart-name').get('value')
                        });
                    });

                    h.answerList.all('> li').each(function(row){
                        values=[];
                        row.all('input:checked').each(function(n){
                            values.push(n.get('value'));
                        });
                        post.answer.push({
                            id      :row.one('.jak-data-answer-id').get('value'),
                            question:row.one('.jak-data-answer-question').get('value'),
                            detail  :values.join(','),
                            propPart:row.getData('propPart')
                        });
                    });
                    Y.io('/db/job/u.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                            debugger;
                        }},
                        data:Y.JSON.stringify([post])
                    });
                }
            },
            update:{
                propPart:function(){
                    var post=[],
                        rec={},
                        propPartId
                    ;
                    h.propPartList.all('li').each(function(row,idx){
                        propPartId=row.one('.jak-data-propPart-id').get('value');
                        rec={
                            criteria:{
                                data:{
                                    job         :parseInt(f.jobId.get('value'),10),
                                    propPartType:parseInt(row.one('.jak-data-propPart-propPartType').get('value'),10),
                                    seq         :idx,
                                    indent      :0, //>>>>>>>>FINISH LATER
                                    name        :row.one('.jak-data-propPart-name').get('value')
                                }
                            }
                        };
                        if(propPartId!==''){rec.criteria.data.id=parseInt(propPartId,10);}
                        post.push(rec);
                    });
                    Y.io('/db/prop/iud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.propPart},
                        data:Y.JSON.stringify(post)
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){


                Y.fire(self.customEvent.update,{}); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<FINISH


                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.bd.one('.jak-address').on('click',pod.display.address);

            h.propPartSection.delegate('click',pod.display.propPart,'.jak-add');
            h.propPartList.delegate('click',io.remove.propPart,'.jak-remove');
            h.propPartList.delegate('focus',function(){this.addClass('jak-focus');},'li');
            h.propPartList.delegate('blur',function(){this.removeClass('jak-focus');},'li');

            h.propPartList.delegate('change',trigger.answerSetPropPart,'input.jak-data-propPart-id');

            h.serviceSelect.on('change',trigger.filterServiceQuestions);

            h.answerList.delegate('click',trigger.answerFocus,'> li');

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
                    var i=0
                    ;
                    Y.each(rs,function(r){
                        for(i=0;i<r.qty;i++){
                            h.podInvoke.ancestor('li').insert(
                                render.propPart({
                                    propPartType    :r.propPartType,
                                    propPartTypeName:JAK.data.propPartType[r.propPartType].name,
                                    seq             :1,
                                    indent          :0
                                }),
                               'after'
                            );
                        }
                    });
                    io.update.propPart();
                }
            }
        };

        populate={
            job:function(id,o){
                var rs            =Y.JSON.parse(o.responseText)[0].result,
                    addresses     =rs.address.data,
                    answers       =rs.answer.data,
                    answerMatrices=rs.answerMatrix.data,
                    jobs          =rs.job.data,
                    locations     =rs.location.data,
                    propParts     =rs.propPart.data,
                    usrJobs       =rs.usrJob.data,
                    usrs          =rs.usr.data,
                    nn,
                    q,
                    propPartIds   =[],
                    serviceIds    =[],
                    row
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
                        job.address&&addresses[job.address]
                            ?addresses[job.address].streetRef
                            +' '+addresses[job.address].streetName
                            +'<br/>'
                            +locations[addresses[job.address].location].full
                            :''
                    );

                    trigger.reset.propPart();
                    populate.propPart(propParts);

                    trigger.reset.answer();
                    Y.each(answers,function(answer){
                        q=JAK.data.question[answer.question];
                        //services
                        serviceIds=[];
                        propPartIds=[];
                        Y.each(answerMatrices,function(answerMatrix){
                            if(answerMatrix.answer!==answer.id){return;}
                            serviceIds.push('jak-service-'+answerMatrix.service);
                            propPartIds.push(answerMatrix.propPart);
                        });
                        nn=Y.Node.create(
                            render.answer({
                                serviceIds:serviceIds.join(' '),
                                id        :answer.id,
                                question  :answer.question,
                                name      :q.name,
                                code      :(q.codeType==='H'?q.code:'')
                            })
                        );
                        h.answerList.append(nn);
                        nn.setData('propPart',propPartIds);
                    });

                });
                h.serviceSelect.simulate('change');
                Y.JAK.widget.busy.set('message','');
            },
            propPart:function(propParts){
                Y.each(propParts,function(propPart){
                    if(propPart.propPartType===1){
                        row=h.propPartList.one('li');
                        row.one('.jak-data-propPart-id').set('value',propPart.id);
                    }else{
                        h.propPartList.append(
                            render.propPart({
                                id              :propPart.id,
                                propPartType    :propPart.propPartType,
                                propPartTypeName:JAK.data.propPartType[propPart.propPartType].name,
                                name            :(propPart.name===null?'':propPart.name),
                                seq             :1,
                                indent          :0
                            }),
                            'after'
                        );
                    }
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
                       +    '<legend>property</legend>'
                       +    '<ul class="jak-list-propPart">'
                       +    render.propPart({
                                propPartType    :1,
                                propPartTypeName:'property',
                                seq             :1,
                                indent          :0
                            })
                       +    '</ul>'
                       +  '</fieldset>'
                       +  '<fieldset class="jak-section-answer">'
                       +    '<legend>'
                       +      '<select class="jak-select-service"></select>'
                       +      Y.JAK.html('btn',{action:'save',title:'save',label:'save'})
                       +    '</legend>'
                       +    '<ul></ul>'
                       +  '</fieldset>'
                       +'</fieldset>',
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd              =h.ol.headerNode;
                    h.bd              =h.ol.bodyNode;
                    h.ft              =h.ol.footerNode;
                    h.bb              =h.ol.get('boundingBox');
                    h.close           =h.hd.one('.jak-close');

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
                    h.answerSection   =h.bd.one('.jak-section-answer');
                    h.answerList      =h.answerSection.one('ul');

                    h.propPartSection =h.bd.one('.jak-section-propPart');
                    h.propPartList    =h.propPartSection.one('ul');
                    h.save            =h.bd.one('.jak-save');

                    //cleanup first property part
                    h.propPartList.one('.jak-remove').remove();

                    //services
                    Y.each(JAK.data.service,function(service){
                        h.serviceSelect.append('<option value="'+service.id+'">'+service.name+'</option>');
                        if(service.id===1){return;}//exclude general
                        jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="jak-data jak-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                    });
                    h.serviceList.append(jobServiceArr.join(','));

            },
            answer:function(p){
                var html='<li class="{serviceIds}">'
                      +  '<input type="hidden" class="jak-data jak-data-answer-id" value="{id}" />'
                      +  '<input type="hidden" class="jak-data jak-data-answer-question" value="{question}" />'
                      +  '<em>{name}</em>'
                      +  '{code}'
                      +  Y.JAK.html('btn',{action:'remove',title:'remove'})
                      +  Y.JAK.html('btn',{action:'dup',title:'duplicate'})
                      +'</li>',
                    noParameters=typeof p==='undefined'
                ;
                return noParameters
                    ?html
                    :Y.Lang.sub(html,{
                        'serviceIds':p.serviceIds,
                        'id'        :p.id,
                        'question'  :p.question,
                        'name'      :p.name,
                        'code'      :p.code
                    })
                ;
            },
            propPart:function(p){
                var html='<li>'
                      +  '<input type="checkbox" class="jak-data jak-data-propPart-id" value="{propPart-id}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-propPartType" value="{propPart-propPartType}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-seq" value="{propPart-seq}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-indent" value="{propPart-indent}" />'
                      +  '<span                  class="jak-data-propPartType-name">{propPartType-name}</span>'
                      +  '<input type="text"     class="jak-data jak-data-propPart-name" value="{propPart-name}" placeholder="detail" />'
                      +  Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                      +  Y.JAK.html('btn',{action:'add',title:'add property parts'})
                      +'</li>',
                    noParameters=typeof p==='undefined'
                ;
                return noParameters
                    ?html
                    :Y.Lang.sub(html,{
                        'propPart-id'          :(typeof p.id==='undefined'?'':p.id),
                        'propPart-propPartType':p.propPartType,
                        'propPartType-name'    :p.propPartTypeName,
                        'propPart-seq'         :p.seq,
                        'propPart-name'        :'',
                        'propPart-indent'      :p.indent
                    })
                ;
            }
        };

        trigger={
            answerFocus:function(){
                var propPartsArr=this.getData('propPart'),
                    propPartIdNode
                ;
                h.answerRowFocus=this;
                h.answerList.all('.jak-focus').removeClass('jak-focus');
                this.addClass('jak-focus');
                //check/uncheck propPart
                h.propPartList.all('li').each(function(propPart){
                    propPartIdNode=propPart.one('.jak-data-propPart-id');
                    propPartIdNode.set('checked',Y.Array.indexOf(propPartsArr,parseInt(propPartIdNode.get('value'),10))!==-1);
                });
            },
            answerSetPropPart:function(){
                var propPartId     =parseInt(this.get('value'),10),
                    answerPropParts=h.answerRowFocus.getData('propPart'),
                    index          =answerPropParts.indexOf(propPartId);
                ;
                this.get('checked')
                    ?answerPropParts.push(propPartId)
                    :answerPropParts.splice(index,1);
            },
            blankForm:function(){
                f.jobId           .set('value','');
                f.jobAddress      .set('value','');
                f.jobAddressDetail.setContent('address not defined');
                f.jobRef          .set('value','');
                f.jobAppointment  .set('value','');
                f.jobConfirmed    .set('value','');
                f.jobReminder     .set('value','');
                f.jobWeather      .set('value','');
                trigger.reset.propPart();
            },
            filterServiceQuestions:function(){
                var serviceId=parseInt(this.get('value'),10),
                    hasService,
                    visibleAnswer=false
                ;
                h.answerList.all('li').each(function(row){
                    hasService=row.hasClass('jak-service-'+serviceId);
                    row.setStyle('display',hasService?'':'none');
                    if(!visibleAnswer && hasService){visibleAnswer=row;}
                });
                //focus on first displayed
                if(visibleAnswer!==false){visibleAnswer.simulate('click');}
            },
            reset:{
                answer:function(){
                    h.answerList.setContent('');
                },
                propPart:function(){
                    h.propPartList.all('> li').slice(1).remove();
                    h.propPartList.one('> li .jak-data-propPart-id').set('value','');
                }
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
