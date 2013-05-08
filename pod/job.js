/** //pod/job.js
 *
 *  client/server sync DOM: propPart, answer; d.rs:propPartAnswer
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
            trigger.reset.form();
            Y.JAK.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            if(typeof p.job!=='undefined'){
                d.jobId=p.job;
                io.fetch.job();
            }else{
                h.answerFilter.simulate('change');
                if(typeof p.appointment!=='undefined'){f.jobAppointment.set('value',moment.unix(p.appointment).format('DDMMMYY hh:mma'));}
            }
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex' ){h.ol.set('zIndex',value);}
            if(what==='cfg'    ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            update:self.info.id+(++JAK.env.customEventSequence)+':update'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            var jobServiceArr=[],
                propPartTypeCategory={}
            ;
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
            //prop part filter
                propPartTypeCategory['All']=1;
                propPartTypeCategory['General']=1;
                Y.each(JAK.data.propPartType,function(propPartType){
                    propPartTypeCategory[propPartType.category]=1;
                });
                Y.each(propPartTypeCategory,function(category,id){
                    h.propPartFilter.append('<option>'+id+'</option>');
                });
            //answer filter and non general services
                h.answerFilter.append('<option>Property part specific</option>');
                Y.each(JAK.data.service,function(service){
                    h.answerFilter.append('<option value="'+service.id+'">'+service.name+'</option>');
                    //exclude general from job services
                        if(service.name!=='General'){
                            jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="jak-data jak-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                        }
                });
                h.serviceList.append(jobServiceArr.join(','));
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
                            h.propPartList.set('innerHTML','');
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
                        propPartId=parseInt(row.one('.jak-data-id').get('value'),10)
                    ;
                    Y.io('/db/job/dPropPart.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                            Y.each(d.rs.propPartAnswer.data,function(propPartAnswer){
                                if(propPartAnswer.propPart===propPartId){
                                    delete d.rs.propPartAnswer.data[propPartAnswer.id];
                                }
                            });
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
                        seq=0
                    ;
                    h.answerList.all('> li').each(function(a){
                        answerDetails=[];
                        a.all('input:checked').each(function(n){
                            answerDetails.push(n.get('value'));
                        });
                        post.answer.push({
                            data:{
                                id      :parseInt(a.one('.jak-data-id').get('value'),10),
                                question:parseInt(a.one('.jak-data-question').get('value'),10),
                                job     :jobId,
                                detail  :answerDetails.join(',')
                            }
                        });
                    });
                    h.propPartList.all('> li').each(function(pp){
                        //merge
                        post.propPartAnswer.push.apply(post.propPartAnswer,pp.getData('propPartAnswer'));
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
                        propPartId=row.one('.jak-data-id').get('value');
                        rec={
                            criteria:{
                                data:{
                                    job         :parseInt(f.jobId.get('value'),10),
                                    propPartType:parseInt(row.one('.jak-data-propPartType').get('value'),10),
                                    seq         :idx,
                                    indent      :0, //>>>>>>>>FINISH LATER
                                    name        :row.one('.jak-data-name').get('value')
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
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            //job
                f.jobAddressDetail.on('click',pod.display.address);
                h.displayServices.on('click',trigger.showHide.services);
            //notes
                h.bd.delegate('click' ,pod.display.info,'.jak-info');
            //property parts
                h.propPartSection.one('> legend > a').on('click',trigger.showHide.propPartExtension);
                h.propPartSection.delegate('click',pod.display.propPart,'.jak-add');
                h.propPartFilter.on('change',trigger.filter.propPart);
                h.propPartList.delegate('click',io.remove.propPart,'.jak-remove');
                h.propPartList.delegate('click',trigger.focus.propPart,'> li');
            //property part answers
                h.propPartAnswerList.delegate('click',trigger.set.propPartAnswer,'input.jak-data-id');
            //answers
                h.answerFilter.on('change',trigger.filter.answer);
                h.answerList.delegate('click',trigger.focus.answer,'> li');
                h.answerList.delegate('click',io.insert.answer,'.jak-dup');
                h.answerList.delegate('click',function(){alert('remove not implemented yet');},'.jak-remove');
            //save
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
                        section=this.ancestor('.jak-section')
                    ;
                    h.podInvoke=this;
                    if(section.hasClass('jak-section-answer')){
                        config.title     ='Answers';
                        config.categories=['General','Feedback','Clarify','Warning'];
                        config.dbTable   =JAK.data.dbTable['answer'].id;
                    }else
                    if(section.hasClass('jak-section-propPart')){
                        config.title     ='Property Parts';
                        config.categories=['General','Unique','Multi'];
                        config.dbTable   =JAK.data.dbTable['propPart'].id;
                    }else
                    if(section.hasClass('jak-section-propPartAnswer')){
                        config.title     ='Property Parts/Answer';
                        config.categories=['Joint focus','Property Part Focus','Answer Focus'];
                        config.dbTable   =JAK.data.dbTable['propPartAnswer'].id;
                    }
                    config.pk=parseInt(this.ancestor('li').one('.jak-data-id').get('value'),10);
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
                    f.jobAddressDetail.set('innerHTML',
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
                        section=li.ancestor('.jak-section')
                    ;
                    //update note count
                        h.podInvoke.one('span').set('innerHTML',cnt===0?'':cnt);
                    //update count reference
                        if(section.hasClass('jak-section-propPartAnswer')){
                            d.rs.propPartAnswer.data[parseInt(li.one('.jak-data-id').get('value'),10)].countInfo=cnt;
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
            answer:function(){
                Y.each(d.rs.answer.data,function(answer){
                    q=JAK.data.question[answer.question];

                    answerInfoCount=0;
                    Y.each(d.rs.answerInfo.data,function(i){
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
                    if(answer.detail!==''&&answer.detail!==null){
                        Y.each(answer.detail.split(','),function(answerValue){
                            nn.one('input[value="'+answerValue+'"]').set('checked',true);
                        });
                        //set detail //>>>>>>>>>>>>FINISH many other options <<<<<<<<<<<<<<<<<<<
                    }
                });
            },
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var addresses=d.rs.address.data
                ;
                trigger.reset.form();
                //only 1 job anyway
                Y.each(d.rs.job.data,function(job){
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
                    f.jobAddressDetail.set('innerHTML','');
                    f.jobAddressDetail.set('innerHTML','click here to specify address');
                    if(job.address&&addresses[job.address]){
                        f.jobAddressDetail.set('innerHTML',
                            render.address({
                                streetRef :addresses[job.address].streetRef,
                                streetName:addresses[job.address].streetName,
                                location  :d.rs.location.data[addresses[job.address].location].full
                            })
                        );
                    }
                    populate.propPart();
                    populate.answer();
                });
                h.answerFilter.simulate('change');
                Y.JAK.widget.busy.set('message','');
            },
            propPart:function(){
                Y.each(d.rs.propPart.data,function(propPart){
                    var data=[],
                        nn=Y.Node.create(
                            render.propPart({
                                id              :propPart.id,
                                propPartType    :propPart.propPartType,
                                propPartTypeName:JAK.data.propPartType[propPart.propPartType].name,
                                name            :(propPart.name===null?'':propPart.name),
                                seq             :1,
                                indent          :0,
                                infoCount       :'?',
                                category        :propPart.category
                            })
                        )
                    ;
                    h.propPartList.append(nn,'after');
                    //propPartAnswers
                        Y.each(d.rs.propPartAnswer.data,function(ppa){
                            if(ppa.propPart===propPart.id){data.push(ppa);}
                        });
                        nn.setData('propPartAnswer',data);
                });
                Y.JAK.widget.busy.set('message','');
            },
            propPartAnswer:function(){
                var answerId=parseInt(h.answerRowFocus.one('.jak-data-id').get('value'),10)
                ;
                h.propPartAnswerList.set('innerHTML','');
                h.propPartList.all('li').each(function(pp){
                    var propPartId=parseInt(pp.one('.jak-data-id').get('value'),10),
                        ppaData=pp.getData('propPartAnswer')
                    ;
                    //for visible propPart
                        if(pp.getStyle('display')==='none'){return;}
                    var nn=Y.Node.create(render.propPartAnswer({
                        id      :'',
                        propPart:propPartId,
                        answer  :answerId
                    }));
                    h.propPartAnswerList.append(nn);
                    Y.each(ppaData,function(ppa){
                        ppa.infoCount=0;
                        if(ppa.propPart===propPartId && ppa.answer===answerId){
                            nn.one('.jak-data-id').setAttrs({
                                'value':ppa.id,
                                'title':'Property Part Answer id#'+ppa.id
                            });
                            if(ppa.current===1){nn.one('.jak-data-id').set('checked',true);}
                            //info
                                Y.each(d.rs.propPartAnswerInfo,function(d){
                                    if(d.pk===ppa.id){ppa.infoCount++;}
                                });
                                nn.one('.jak-info span').set('innerHTML',ppa.infoCount===0?'':ppa.infoCount);
                        }
                    });
                });
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAK">'+self.info.title+'</span> '
                       +' #<input type="text" class="jak-data jak-data-id" title="job number" disabled="disabled" />'
                       +'<input type="hidden" class="jak-data jak-data-address" />'
                       +' &nbsp; [<span class="jak-display-address"></span>]'
                       +Y.JAK.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        //job
                             'ref:<input type="text" class="jak-data jak-data-ref" title="old system reference" placeholder="ref#" />'
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
                            +    '<legend>property &nbsp;'
                            +      '<select></select>'
                            +      ' &nbsp; (<a class="jak-min-max" href="#">collapse</a>)'
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //property part answer associations
                            +  '<fieldset class="jak-section jak-section-propPartAnswer">'
                            +    '<legend>link</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //question/answers
                            +  '<fieldset class="jak-section jak-section-answer">'
                            +    '<legend>'
                            +      'statement'
                            +      '<select></select>'
                            +      Y.JAK.html('btn',{action:'save',title:'save',label:'save'})
                            +    '</legend>'
                            +    '<ul></ul>'
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

                    f.jobId           =h.hd.one('.jak-data-id');
                    f.jobAddress      =h.hd.one('.jak-data-address');
                    f.jobAddressDetail=h.hd.one('.jak-display-address');

                    f.jobRef          =h.bd.one('.jak-data-ref');
                    f.jobAppointment  =h.bd.one('.jak-data-appointment');
                    f.jobConfirmed    =h.bd.one('.jak-data-confirmed');
                    f.jobReminder     =h.bd.one('.jak-data-reminder');
                    f.jobWeather      =h.bd.one('.jak-data-weather');

                    h.displayServices =h.bd.one('.jak-display-services');
                    h.serviceList     =h.bd.one('.jak-list-service');
                    
                    h.propPartSection =h.bd.one('.jak-section-propPart');
                    h.propPartFilter  =h.propPartSection.one('> legend > select');
                    h.propPartList    =h.propPartSection.one('> ul');

                    h.propPartAnswerSection =h.bd.one('.jak-section-propPartAnswer');
                    h.propPartAnswerList    =h.propPartAnswerSection.one('> ul');

                    h.answerSection   =h.bd.one('.jak-section-answer');
                    h.answerFilter    =h.answerSection.one('> legend > select');
                    h.answerList      =h.answerSection.one('> ul');

                    h.save            =h.bd.one('.jak-save');
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
                return Y.Lang.sub(
                    '<li>'
                   +  '<input type="hidden" class="jak-data jak-data-id" value="{id}" />'
                   +  '<input type="hidden" class="jak-data jak-data-question" value="{question}" />'
                   +  '<em title="answer#{id}">{name}</em>'
                   +  '{code}'
                   +  Y.JAK.html('btn',{action:'remove',title:'remove'})
                   +  Y.JAK.html('btn',{action:'dup',title:'duplicate'})
                   +  Y.JAK.html('btn',{action:'info',title:'notes',label:p.infoCount})
                   +'</li>',
                {
                    'id'      :p.id,
                    'question':p.question,
                    'name'    :p.name,
                    'code'    :p.code
                });
            },
            propPart:function(p){
                return Y.Lang.sub(
                    '<li>'
                   +  '<input type="hidden"   class="jak-data jak-data-id" value="{id}" />'
                   +  '<input type="hidden"   class="jak-data jak-data-propPartType" value="{propPartType}" />'
                   +  '<input type="hidden"   class="jak-data jak-data-seq" value="{seq}" />'
                   +  '<input type="hidden"   class="jak-data jak-data-indent" value="{indent}" />'
                   +  '<input type="hidden"   class="jak-data jak-data-category" value="{category}" />'
                   +  '<span                  class="jak-data-propPartTypeName" title="propPart#{id}">{propPartTypeName}</span>'
                   +  '<span class="jak-showhide">'
                   +    Y.JAK.html('btn',{action:'info',title:'notes',label:(p.infoCount===0?' ':p.infoCount)})
                   +    '<input type="text"     class="jak-data jak-data-name" value="{name}" placeholder="detail" />'
                   +    Y.JAK.html('btn',{action:'remove',title:'remove all property parts'})
                   +    Y.JAK.html('btn',{action:'add',title:'add property parts'})
                   +  '</span>'
                   +'</li>',
                {
                    'id'              :p.id,
                    'propPartType'    :p.propPartType,
                    'propPartTypeName':p.propPartTypeName,
                    'seq'             :p.seq,
                    'name'            :'',
                    'indent'          :p.indent,
                    'category'        :p.propPartType===''?'':JAK.data.propPartType[p.propPartType].category
                });
            },
            propPartAnswer:function(p){
                return Y.Lang.sub(
                    '<li>'
                   +  '<input type="hidden" class="jak-data jak-data-propPart" value="{propPart}" />'
                   +  '<input type="hidden" class="jak-data jak-data-answer" value="{answer}" />'
                   +  '<input type="checkbox" class="jak-data jak-data-id" title="propPartAnswer#{id}" value="{id}" />'
                   +  Y.JAK.html('btn',{action:'info',title:'notes',label:''})
                   +'</li>',
                {
                    'id'      :p.id,
                    'propPart':p.propPart,
                    'answer'  :p.answer
                });
            }
        };

        trigger={
            filter:{
                answer:function(){
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
                        questionId=parseInt(row.one('.jak-data-question').get('value'),10);
                        hasService=serviceHasQuestion(serviceId,questionId);
                        row.setStyle('display',hasService?'':'none');
                        if(!visibleAnswer && hasService){visibleAnswer=row;}
                    });
                    //focus on first displayed
                    if(visibleAnswer!==false){visibleAnswer.simulate('click');}
                },
                propPart:function(){
                    var category=this.get('value')
                    ;
                    h.propPartList.all('li').each(function(row){
                        row.setStyle('display','');
                        if(category!=='All' && row.one('.jak-data-category').get('value')!==category){
                            row.setStyle('display','none');
                        }
                    });
                    populate.propPartAnswer();
                }
            },
            focus:{
                answer:function(){
                    h.answerRowFocus=this;
                    h.answerList.all('.jak-focus').removeClass('jak-focus');
                    this.addClass('jak-focus');
                    populate.propPartAnswer();
                },
                propPart:function(){
                    h.propPartRowFocus=this;
                    h.propPartList.all('.jak-focus').removeClass('jak-focus');
                    this.addClass('jak-focus');
                }
            },
            reset:{
                form:function(){
                    f.jobId             .set('value','');
                    f.jobAddress        .set('value','');
                    f.jobAddressDetail  .set('innerHTML','address not defined');
                    f.jobRef            .set('value','');
                    f.jobAppointment    .set('value','');
                    f.jobConfirmed      .set('value','');
                    f.jobReminder       .set('value','');
                    f.jobWeather        .set('value','');
                    h.answerList        .set('innerHTML','');
                    h.propPartList      .set('innerHTML','');
                    h.propPartAnswerList.set('innerHTML','');
                }
            },
            set:{
                propPartAnswer:function(){
                    var ppa       =this.ancestor('li'),
                        id        =parseInt(ppa.one('.jak-data-id'      ).get('value'),10),
                        propPartId=parseInt(ppa.one('.jak-data-propPart').get('value'),10),
                        answerId  =parseInt(ppa.one('.jak-data-answer'  ).get('value'),10),
                        checked   =this.get('checked'),
                        ppaData
                    ;
                    //find propPart
                    h.propPartList.all('li').each(function(pp){
                        if(parseInt(pp.one('.jak-data-id').get('value'),10)===propPartId){
                            ppaData=pp.getData('propPartAnswer');
                        }
                    });
debugger;
                    if(isNaN(id)){
                        //insert




                        
                    }else{
                        //update





                        
                    }
                }
            },
            showHide:{
                propPartExtension:function(){
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
                services:function(){
                    if(this.get('value')==='show services'){
                        h.serviceList.setStyle('display','');
                        this.set('value','hide services');
                    }else{
                        h.serviceList.setStyle('display','none');
                        this.set('value','show services');
                    }
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
