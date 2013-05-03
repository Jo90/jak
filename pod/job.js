/** //pod/job.js
 *
 */
YUI.add('jak-pod-job',function(Y){

    Y.namespace('JAK.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title   :'job',
            width   :1000,
            visible :true,
            xy      :[10,20],
            zIndex  :99999
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
                d.jobId=p.job;
                io.fetch.job();
            }else{
                h.answerFilter.simulate('change');
                if(typeof p.appointment!=='undefined'){f.jobAppointment.set('value',moment.unix(p.appointment).format('DDMMMYY hh:mma'));}
                if(typeof p.visible!=='undefined'){self.set('visible',p.visible);}
            }
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='visible'){h.ol.set('visible',value);}
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
            var propPartTypeCategory={}
            ;
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
            //data
            propPartTypeCategory['All']=1;
            propPartTypeCategory['General']=1;
            Y.each(JAK.data.propPartType,function(propPartType){
                propPartTypeCategory[propPartType.category]=1;
            });
            Y.each(propPartTypeCategory,function(category,id){
                h.propPartCategory.append('<option>'+id+'</option>');
            });
        };

        io={
            fetch:{
                job:function(){
                    Y.JAK.widget.busy.set('message','getting job(s)...');
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            criteria:{jobIds:[d.jobId]},
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
            insert:{
                answer:function(){
                    alert('duplicate - to do - must create immediately to allow notes to be attached....')
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
                    var jobId       =parseInt(f.jobId.get('value'),10),
                        fAppointment=f.jobAppointment.get('value'),
                        fConfirmed  =f.jobConfirmed.get('value'),
                        fReminder   =f.jobReminder.get('value'),
                        post={
                            job:{
                                data:{
                                    id         :jobId,
                                    address    :parseInt(f.jobAddress.get('value'),10),
                                    ref        :f.jobRef.get('value'),
                                    appointment:fAppointment===''
                                                    ?null
                                                    :moment(fAppointment,'DDMMMYY hh:mma').unix(),
                                    confirmed  :fConfirmed===''
                                                    ?null
                                                    :moment(fConfirmed,'DDMMMYY hh:mma').unix(),
                                    reminder   :fReminder===''
                                                    ?null
                                                    :moment(fReminder,'DDMMMYY hh:mma').unix(),
                                    weather    :f.jobWeather.get('value')
                                }
                            },
                            answer        :[],
                            propPartAnswer:[],
                            usr           :JAK.user.usr
                        },
                        answerDetails=[],
                        propPartAnswerData=[],
                        seq=0
                    ;

                    h.answerList.all('> li').each(function(answerRow){
                        answerDetails=[];
                        Y.each(answerRow.getData('propPartAnswer'),function(d){
                            post.propPartAnswer.push({data:d});
                        });
                        answerRow.all('input:checked').each(function(n){
                            answerDetails.push(n.get('value'));
                        });
                        post.answer.push({
                            data:{
                                id      :parseInt(answerRow.one('.jak-data-answer-id').get('value'),10),
                                question:parseInt(answerRow.one('.jak-data-answer-question').get('value'),10),
                                job     :jobId,
                                detail  :answerDetails.join(',')
                            }
                        });
                    });

                    Y.io('/db/job/u.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.job},
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
            f.jobAddressDetail.on('click',pod.display.address);

            h.displayServices.on('click',trigger.displayServices);

            h.bd.delegate('click',trigger.minmax,'.jak-min-max');
            h.bd.delegate('click' ,pod.display.info,'.jak-info');

            h.propPartSection.delegate('click',pod.display.propPart,'.jak-add');
            h.propPartCategory.on('change',trigger.filter.propPart);
            h.propPartList.delegate('click',io.remove.propPart,'.jak-remove');
            h.propPartList.delegate('click',trigger.focus.propPart,'> li');

            h.propPartList.delegate('change',trigger.saveAnswerPropPart,'input.jak-data-propPart-id');

            h.answerFilter.on('change',trigger.filter.serviceQuestions);

            h.answerList.delegate('click',trigger.focus.answer,'> li');
            h.answerList.delegate('click',io.insert.answer,'.jak-dup');
            h.answerList.delegate('click',function(){alert('remove not implemented yet');},'.jak-remove');

            h.save.on('click',io.save.job);

            //custom
                Y.on(JAK.my.podInfo.customEvent.save,pod.result.info);
        };

        pod={
            display:{
                address:function(){
                    h.podInvoke=this;
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({address:f.jobAddress.get('value')});
                },
                info:function(){
                    var config={
                            visible:true
                        },
                        ul=this.ancestor('ul')
                    ;
                    h.podInvoke=this;
                    if(ul.hasClass('jak-list-answer')){
                        config.title     ='Answers';
                        config.categories=['General','Feedback','Clarify','Warning'];
                        config.dbTable   =JAK.data.dbTable['answer'].id;
                        config.pk        =parseInt(this.ancestor('li').one('.jak-data-answer-id').get('value'),10);
                    }else
                    if(ul.hasClass('jak-list-propPart')){
                        config.title     ='Property Parts';
                        config.categories=['General','Unique','Multi'];
                        config.dbTable   =JAK.data.dbTable['propPart'].id;
                        config.pk        =parseInt(this.ancestor('li').one('.jak-data-propPart-id').get('value'),10);
                    }else
                    if(ul.hasClass('jak-list-propPartAnswer')){
                        config.title     ='Property Parts/Answer';
                        config.categories=['Joint focus','Property Part Focus','Answer Focus'];
                        config.dbTable   =JAK.data.dbTable['propPartAnswer'].id;
                        config.pk        =parseInt(this.ancestor('li').one('.jak-data-propPartAnswer-id').get('value'),10);
                    }
                    JAK.my.podInfo.display(config);
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
                        Y.on(self.my.podAddress.customEvent.select,pod.result.address);
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
                    f.jobAddress.set('value',rs.id);
                    f.jobAddressDetail.setContent(
                        render.address({
                            streetRef :rs.streetRef,
                            streetName:rs.streetName,
                            location  :rs.locationName
                        })
                    );
                },
                info:function(rs){
                    var cnt=rs.info.record.length,
                        li=h.podInvoke.ancestor('li'),
                        ul=li.ancestor('ul'),
                        propPartAnswerData,
                        propPartId
                    ;
                    //update note count
                        h.podInvoke.one('span').setContent(cnt===0?'':cnt);
                    //update prop part info count reference
                        if(ul.hasClass('jak-list-propPart')){
                            propPartAnswerData=h.answerRowFocus.getData('propPartAnswer');
                            propPartId=parseInt(li.one('.jak-data-propPart-id').get('value'),10);
                            Y.each(propPartAnswerData,function(i){
                                if(i.propPart===propPartId){
                                    i.infoCount=cnt;
                                }
                            });
                        }
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
                                    indent          :0,
                                    infoCount       :'?',
                                    category        :'General'
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
            answer:function(rs){
                var answers=rs.answer.data
                ;
                Y.each(answers,function(answer){
                    var propPartAnswerData=[]
                    ;
                    q=JAK.data.question[answer.question];

                    Y.each(rs.propPartAnswer.data,function(propPartAnswer){
                        var c=0
                        ;
                        if(propPartAnswer.answer===answer.id){
                            //info count
                                Y.each(rs.propPartAnswerInfo.data,function(i){
                                    if(i.dbTable===JAK.data.dbTable['propPartAnswer'].id && i.pk===propPartAnswer.propPart){c++;}
                                });
                            propPartAnswer.infoCount=c;
                            propPartAnswerData.push(propPartAnswer);
                        }
                    });
                    answerInfoCount=0;
                    Y.each(rs.answerInfo.data,function(i){
                        if(i.dbTable===JAK.data.dbTable['answer'].id && i.pk===answer.id){answerInfoCount++;}
                    });
                    nn=Y.Node.create(
                        render.answer({
                            id       :answer.id,
                            question :answer.question,
                            name     :q.name,
                            code     :(q.codeType==='H'?q.code:''),
                            infoCount:(answerInfoCount===0?'':answerInfoCount)
                        })
                    );
                    h.answerList.append(nn);
                    //save related data
                        nn.setData('propPartAnswer',propPartAnswerData);
                    if(answer.detail!==''&&answer.detail!==null){
                        Y.each(answer.detail.split(','),function(answerValue){
                            nn.one('input[value="'+answerValue+'"]').set('checked',true);
                        });
                        //set detail //>>>>>>>>>>>>FINISH many other options <<<<<<<<<<<<<<<<<<<
                    }
                });
            },
            job:function(id,o){
                var rs             =Y.JSON.parse(o.responseText)[0].result,
                    addresses      =rs.address.data,
                    answers        =rs.answer.data,
                    jobs           =rs.job.data,
                    locations      =rs.location.data,
                    propParts      =rs.propPart.data,
                    usrJobs        =rs.usrJob.data,
                    usrs           =rs.usr.data,
                    answerInfoCount=0,
                    nn,
                    q,
                    row
                ;
                h.bd.all('.jak-data[type=input]').set('value','');
                Y.each(jobs,function(job){
                    f.jobId.set('value',job.id);
                    f.jobRef.set('value',job.ref);
                    if(job.appointment!==null){
                        f.jobAppointment.set('value',moment.unix(job.appointment).format('DDMMMYY hh:mma'));
                    };
                    if(job.confirmed!==null){
                        f.jobConfirmed.set('value',moment.unix(job.confirmed).format('DDMMMYY hh:mma'));
                    }
                    if(job.reminder!==null){
                        f.jobReminder.set('value',moment.unix(job.reminder).format('DDMMMYY hh:mma'));
                    }
                    Y.JAK.matchSelect(f.jobWeather,job.weather);
                    f.jobAddress.set('value',job.address);
                    f.jobAddressDetail.setContent('');
                    f.jobAddressDetail.setContent('click here to specify address');
                    if(job.address&&addresses[job.address]){
                        f.jobAddressDetail.setContent(
                            render.address({
                                streetRef :addresses[job.address].streetRef,
                                streetName:addresses[job.address].streetName,
                                location  :locations[addresses[job.address].location].full
                            })
                        );
                    }
                    trigger.reset.propPart();
                    populate.propPart(propParts);

                    trigger.reset.answer();
                    populate.answer(rs);
                });
                h.answerFilter.simulate('change');
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
                                indent          :0,
                                infoCount       :'?',
                                category        :propPart.category
                            }),
                            'after'
                        );
                    }
                });
                Y.JAK.widget.busy.set('message','');
            },
            propPartAnswer:function(propPartAnswerData,answerId){
                var propPartIds=[],
                    propPartId
                ;
                h.propPartAnswerList.setContent('');
                //get current property parts
                    Y.each(propPartAnswerData,function(d){
                        if(d.answer===answerId && d.current===1){propPartIds.push(d.propPart);}
                    });
                //check/uncheck propPart
                    h.propPartList.all('li').each(function(propPart){
                        var nn=Y.Node.create(render.propPartAnswer({
                            id       :0,
                            infoCount:0
                        }));
                        h.propPartAnswerList.append(nn);

                        propPartId=parseInt(propPart.one('.jak-data-propPart-id').get('value'),10);
                        nn.one('.jak-data-propPartAnswer-id').set('checked',Y.Array.indexOf(propPartIds,propPartId)!==-1);
                        //info
                            nn.one('.jak-info span').setContent('');
                            Y.each(propPartAnswerData,function(d){
                                if(d.answer===answerId && d.propPart===propPartId && d.infoCount>0){
                                    nn.one('.jak-info span').setContent(d.infoCount);
                                }
                            });
                    });
                
            }
        };

        render={
            base:function(){
                var jobServiceArr=[],
                    serviceArr=[]
                ;
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAK">'+self.info.title+'</span> '
                       +'<input type="hidden" class="jak-data jak-data-address" />'
                       +' &nbsp; [<span class="jak-display-address"></span>]'
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        //job
                             'job:<input type="text" class="jak-data jak-data-id" title="job number" disabled="disabled" />'
                            +'&nbsp; ref:<input type="text" class="jak-data jak-data-ref" title="old system reference" placeholder="ref#" />'
                            +'Appointment:<input type="text" class="jak-data jak-date jak-data-appointment" title="appointment date" placeholder="appointment" />'
                            +'&nbsp; Confirmed:<input type="text" class="jak-data jak-date jak-data-confirmed" title="confirmed date" placeholder="confirmed" />'
                            +'&nbsp; Reminder:<input type="text" class="jak-data jak-data-reminder jak-date" title="reminder date" placeholder="reminder" />'
                            +'<select class="jak-data jak-data-weather">'
                            +  '<option>fine</option>'
                            +  '<option>cloudy</option>'
                            +  '<option>wet</option>'
                            +  '<option>dark</option>'
                            +'</select>'
                        //services
                            +'<input type="button" class="jak-display-services" value="hide services" />'
                            +'<fieldset class="jak-list-service">'
                            +  '<legend>services</legend>'
                            +'</fieldset>'
                        +'<div>'
                        //property parts
                            +  '<fieldset class="jak-section jak-section-propPart">'
                            +    '<legend>'
                            +      'property &nbsp; '
                            +      '<select></select>'
                            +      ' &nbsp; (<a class="jak-min-max" href="#">collapse</a>)'
                            +    '</legend>'
                            +    '<ul class="jak-list-propPart">'
                            +    render.propPart({
                                        propPartType    :1,
                                        propPartTypeName:'property',
                                        seq             :1,
                                        indent          :0,
                                        infoCount       :0,
                                        category        :'General'
                                    })
                            +    '</ul>'
                            +  '</fieldset>'
                        //property part answer associations
                            +  '<fieldset class="jak-section jak-section-propPartAnswer">'
                            +    '<legend>link</legend>'
                            +    '<ul class="jak-list-propPartAnswer"></ul>'
                            +  '</fieldset>'
                        //question/answers
                            +  '<fieldset class="jak-section jak-section-answer">'
                            +    '<legend>'
                            +      'questions'
                            +      '<select class="jak-answer-filter"></select>'
                            +      Y.JAK.html('btn',{action:'save',title:'save',label:'save'})
                            +    '</legend>'
                            +    '<ul class="jak-list-answer"></ul>'
                            +  '</fieldset>'
                        +'</div>',
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
                    h.close           =h.hd.one('.jak-close');

                    f.jobAddress      =h.hd.one('.jak-data-address');
                    f.jobAddressDetail=h.hd.one('.jak-display-address');

                    f.jobId           =h.bd.one('.jak-data-id');
                    f.jobRef          =h.bd.one('.jak-data-ref');
                    f.jobAppointment  =h.bd.one('.jak-data-appointment');
                    f.jobConfirmed    =h.bd.one('.jak-data-confirmed');
                    f.jobReminder     =h.bd.one('.jak-data-reminder');
                    f.jobWeather      =h.bd.one('.jak-data-weather');

                    h.displayServices =h.bd.one('.jak-display-services');
                    h.serviceList     =h.bd.one('.jak-list-service');
                    
                    h.propPartSection =h.bd.one('.jak-section-propPart');
                    h.propPartCategory=h.propPartSection.one('> legend select')
                    h.propPartList    =h.propPartSection.one('ul');
                    

                    h.propPartAnswerSection =h.bd.one('.jak-section-propPartAnswer');
                    h.propPartAnswerList    =h.propPartAnswerSection.one('ul');

                    h.answerSection   =h.bd.one('.jak-section-answer');
                    h.answerList      =h.answerSection.one('ul');
                    h.answerFilter    =h.bd.one('.jak-answer-filter');

                    h.save            =h.bd.one('.jak-save');

                //cleanup first property part
                    h.propPartList.one('.jak-remove').remove();

                //services
                    Y.each(JAK.data.service,function(service){
                        h.answerFilter.append('<option value="'+service.id+'">'+service.name+'</option>');
                        if(service.id===1){return;}//exclude general
                        jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="jak-data jak-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                    });
                    h.serviceList.append(jobServiceArr.join(','));
            },
            address:function(p){
                return Y.Lang.sub('{streetRef} {streetName}, {location}',{
                        'streetRef' :p.streetRef,
                        'streetName':p.streetName,
                        'location'  :p.location
                    })
                ;
            },
            answer:function(p){
                var html='<li>'
                      +  '<input type="hidden" class="jak-data jak-data-answer-id" value="{id}" />'
                      +  '<input type="hidden" class="jak-data jak-data-answer-question" value="{question}" />'
                      +  '<em>{name}</em>'
                      +  '{code}'
                      +  Y.JAK.html('btn',{action:'remove',title:'remove'})
                      +  Y.JAK.html('btn',{action:'dup',title:'duplicate'})
                      +  Y.JAK.html('btn',{action:'info',title:'notes',label:p.infoCount})
                      +'</li>'
                ;
                return Y.Lang.sub(html,{
                    'id'      :p.id,
                    'question':p.question,
                    'name'    :p.name,
                    'code'    :p.code
                });
            },
            propPart:function(p){
                var html='<li>'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-id" value="{id}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-propPartType" value="{propPartType}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-seq" value="{seq}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-indent" value="{indent}" />'
                      +  '<input type="hidden"   class="jak-data jak-data-propPart-category" value="{category}" />'
                      +  '<span                  class="jak-data-propPartType-name">{propPartType-name}</span>'
                      +  '<span class="jak-showhide">'
                      +    Y.JAK.html('btn',{action:'info',title:'notes',label:(p.infoCount===0?' ':p.infoCount)})
                      +    '<input type="text"     class="jak-data jak-data-propPart-name" value="{name}" placeholder="detail" />'
                      +    Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                      +    Y.JAK.html('btn',{action:'add',title:'add property parts'})
                      +  '</span>'
                      +'</li>'
                ;
                return Y.Lang.sub(html,{
                        'id'               :(typeof p.id==='undefined'?'':p.id),
                        'propPartType'     :p.propPartType,
                        'propPartType-name':p.propPartTypeName,
                        'seq'              :p.seq,
                        'name'             :'',
                        'indent'           :p.indent,
                        'category'         :JAK.data.propPartType[p.propPartType].category
                    })
                ;
            },
            propPartAnswer:function(p){
                var html='<li>'
                      +  '<input type="checkbox" class="jak-data jak-data-propPartAnswer-id" value="{id}" />'
                      +  Y.JAK.html('btn',{action:'info',title:'notes',label:(p.infoCount===0?' ':p.infoCount)})
                      +'</li>',
                    noParameters=typeof p==='undefined'
                ;
                return noParameters
                    ?html
                    :Y.Lang.sub(html,{
                        'id':(typeof p.id==='undefined'?'':p.id)
                    })
                ;
            }
        };

        trigger={
            displayServices:function(){
                var label=this.get('value')
                ;
                if(label==='show services'){
                    h.serviceList.setStyle('display','');
                    this.set('value','hide services');
                }else{
                    h.serviceList.setStyle('display','none');
                    this.set('value','show services');
                }
            },
            focus:{
                answer:function(){
                    var propPartAnswerData=this.getData('propPartAnswer')
                    ;
                    h.answerRowFocus=this;
                    h.answerList.all('.jak-focus').removeClass('jak-focus');
                    this.addClass('jak-focus');
                    populate.propPartAnswer(propPartAnswerData,parseInt(this.one('.jak-data-answer-id').get('value'),10));
                },
                propPart:function(){
                    h.propPartRowFocus=this;
                    h.propPartList.all('.jak-focus').removeClass('jak-focus');
                    this.addClass('jak-focus');
                }
            },
            saveAnswerPropPart:function(){
                var propPartId         =parseInt(this.get('value'),10),
                    propPartAnswers    =h.answerRowFocus.getData('propPartAnswer'),
                    answerId           =parseInt(h.answerRowFocus.one('.jak-data-answer-id').get('value'),10),
                    checked            =this.get('checked'),
                    foundPropPartAnswer=false
                ;
                //existing
                    Y.some(propPartAnswers,function(propPartAnswer){
                        if(propPartAnswer.propPart===propPartId && propPartAnswer.answer===answerId){
                            propPartAnswer.current=checked?1:0;
                            foundPropPartAnswer=true;
                            return true;
                        }
                    });
                //insert
                    if(!foundPropPartAnswer){
                        propPartAnswers.push({
                            id      :null,
                            propPart:propPartId,
                            answer  :answerId,
                            current :1,
                            job     :parseInt(f.jobId.get('value'),10),
                            seq     :0
                        });
                    }
                h.answerRowFocus.setData('propPartAnswer',propPartAnswers);
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
            filter:{
                propPart:function(){
                    var propPartCategory=this.get('value')
                    ;
                    h.propPartList.all('li').each(function(row){
                        row.setStyle('display','');
                        if(propPartCategory!=='All' && row.one('.jak-data-propPart-category').get('value')!==propPartCategory){
                            row.setStyle('display','none');
                        }
                    });
                },
                serviceQuestions:function(){
                    var serviceId=parseInt(this.get('value'),10),
                        hasService,
                        serviceHasQuestion=function(service,question){
                            var found=false;
                            Y.each(JAK.data.questionMatrix,function(qm){
                                if(qm.service===service&&qm.question===question){found=true;}
                            });
                            return found;
                        },
                        visibleAnswer=false
                    ;
                    h.answerList.all('li').each(function(row){
                        questionId=parseInt(row.one('.jak-data-answer-question').get('value'),10);
                        hasService=serviceHasQuestion(serviceId,questionId);
                        row.setStyle('display',hasService?'':'none');
                        if(!visibleAnswer && hasService){visibleAnswer=row;}
                    });
                    //focus on first displayed
                    if(visibleAnswer!==false){visibleAnswer.simulate('click');}
                }
            },
            minmax:function(){
                var section=this.ancestor('.jak-section')
                ;
                if(section.hasClass('jak-section-propPart')){
                    if(this.get('innerHTML')==='collapse'){
                        h.propPartList.all('.jak-showhide').setStyle('display','none');
                        this.set('innerHTML','expand');
                    }else{
                        h.propPartList.all('.jak-showhide').setStyle('display','');
                        this.set('innerHTML','collapse');
                    }
                }
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
