/** //pod/job.js
 *
 *  client/server sync DOM: propPart, answer; d.rs:propPartAnswer
 *
 */
YUI.add('ja-pod-job',function(Y){

    Y.namespace('JA.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title   :'job',
            width   :1250,
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
            if(typeof cfg.appointment!=='undefined'){delete cfg.appointment;}
            cfg=Y.merge(cfg,p);
            trigger.reset.form();
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            typeof p.job!=='undefined'
                ?io.fetch.job()
                :io.insert.job();
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
            var answerArr=[],
                jobServiceArr=[],
                propPartTypeCategory={}
            ;
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
            //prop part filter
                //ensure display order
                    propPartTypeCategory.All=1;
                    propPartTypeCategory.General=1;
                Y.each(JA.data.propPartType,function(propPartType){
                    propPartTypeCategory[propPartType.category]=1;
                });
                Y.each(propPartTypeCategory,function(category,id){
                    h.propPartFilter.append('<option>'+id+'</option>');
                });
            //answer filter and non general services
                h.answerFilterService.append('<option value="0">Any service...</option>');
                Y.each(JA.data.service,function(service){
                    h.answerFilterService.append('<option value="'+service.id+'">'+service.name+'</option>');
                    //exclude general from job services
                        if(service.name!=='General'){
                            jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="ja-data ja-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                        }
                });
//                h.answerFilter.append('<optgroup label="Services">'+answerArr.join(',')+'</optgroup>');
//                answerArr=[];
//                Y.each(JA.data.questionMatrix,function(qm){
//                    answerArr.push('<option>'+qm.category+'</option>');
//                });
//                h.answerFilter.append('<optgroup label="Categories">'+Y.Array.dedupe(answerArr).join(',')+'</optgroup>');
                h.serviceList.append(jobServiceArr.join(','));
        };

        io={
            fetch:{
                job:function(){
                    Y.JA.widget.busy.set('message','getting job(s)...');
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            job:{
                                criteria:{jobIds:[cfg.job]}
                            },
                            usr:JA.user.usr
                        }])
                    });
                },
                propPart:function(id,o){
                    var rs=Y.JSON.parse(o.responseText)[0],
                        propPartIds=[]
                    ;
                    Y.each(rs.propPart.record,function(rec){
                        propPartIds.push(parseInt(rec.data.id,10));
                    });
                    Y.JA.widget.busy.set('message','getting property parts...');
                    Y.io('/db/shared/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].propPart.result
                            ;
                            h.propPartList.set('innerHTML','');
                            populate.propPart(rs);
                        }},
                        data:Y.JSON.stringify([{
                            propPart:{
                                criteria:{propPartIds:propPartIds}
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            insert:{
                answer:function(){
                    alert('duplicate - to do - must create immediately to allow notes to be attached....');
                },
                job:function(){
                    Y.JA.widget.busy.set('message','new job...');
                    Y.io('/db/shared/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].job.record[0]
                            ;
                            cfg.job=rs.data.id;
                            io.fetch.job();
                        }},
                        data:Y.JSON.stringify([{
                            job:{record:[{
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
                answer:function(){
                    var row=this.ancestor('li'),
                        answerId=parseInt(row.one('.ja-data-id').get('value'),10)
                    ;
                    if(!confirm('delete answer/statement')){return;}
                    Y.io('/db/shared/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                            Y.each(d.rs.answer.data,function(answer){
                                if(answer.id===answerId){
                                    delete d.rs.answer.data[answer.id];
                                }
                            });
                            row.remove();
                        }},
                        data:Y.JSON.stringify([{
                            answer:{
                                remove:[answerId]
                            },
                            usr:JA.user.usr
                        }])
                    });
                },
                propPart:function(){
                    var row=this.ancestor('li'),
                        propPartId=parseInt(row.one('.ja-data-id').get('value'),10)
                    ;
                    Y.io('/db/shared/siud.php',{
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
                            propPart:{
                                remove:[propPartId]
                            },
                            usr:JA.user.usr
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
                                record:[{
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
                                }]
                            },
                            answer:{
                                record:[]
                            },
                            propPartAnswer:{
                                record:[]
                            },
                            usr:JA.user.usr
                        },
                        answerSeq=1
                    ;
                    h.answerList.all('> li').each(function(a){
                        var answerValues=[],
                            cnt={button:0,input:0,select:0,textarea:0},
                            nodes={
                                button  :a.all('span button'),
                                input   :a.all('span input'),
                                select  :a.all('span select'),
                                textarea:a.all('span textarea')
                            },
                            questionId=parseInt(a.one('.ja-data-question').get('value'),10),
                            q=JA.data.question[questionId]
                        ;
                        Y.each(Y.JA.mergeIndicesOf(['<button','<input','<select','<textarea'],q.code),function(arr){
                            var tag=arr[1],
                                node=nodes[tag].item(cnt[tag]),
                                nodeType=node.get('type'),
                                selectMultiArr=[]
                            ;
                            //tag action
                                switch(tag){
                                    case 'button':

                                        //>>>>>>>>>>>>>>>>>>>>FINISH

                                        break;
                                    case 'input':
                                        if(nodeType==='text'){

                                        //>>>>>>>>>>>>>>>>>>>>FINISH remove commas

                                            answerValues.push(node.get('value'));
                                        }else if(nodeType==='checkbox'){
                                            answerValues.push(node.get('checked')?node.get('value'):'');
                                        }
                                        break;
                                    case 'select':
                                        if(nodeType==='select-one'){
                                            answerValues.push(node.get('value'));
                                        }else{
                                            selectMultiArr=[];
                                            node.all('option').each(function(){
                                                if(this.get('selected')){selectMultiArr.push(this.get('value'));}
                                            });
                                            answerValues.push(selectMultiArr.join(','));
                                        }
                                        break;
                                    case 'textarea':

                                        //>>>>>>>>>>>>>>>>>>>>FINISH remove commas

                                        answerValues.push(node.get('value'));
                                        break;
                                }
                            //tag occurance
                                cnt[tag]++;
                        });
                        post.answer.record.push({
                            data:{
                                id      :parseInt(a.one('.ja-data-id').get('value'),10),
                                question:parseInt(a.one('.ja-data-question').get('value'),10),
                                job     :jobId,
                                detail  :answerValues.join(';'),
                                seq     :answerSeq++
                            }
                        });
                    });
                    h.propPartList.all('> li').each(function(pp){
                        Y.each(pp.getData('propPartAnswer'),function(data){
                            post.propPartAnswer.record.push({data:data});
                        });
                    });
                    Y.io('/db/shared/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.job},
                        data:Y.JSON.stringify([post])
                    });
                }
            },
            update:{
                propPart:function(){
                    var rec=[],
                        propPartId
                    ;
                    h.propPartList.all('li').each(function(row,idx){
                        propPartId=row.one('.ja-data-id').get('value');
                        rec.push({
                            data:{
                                job         :parseInt(f.jobId.get('value'),10),
                                propPartType:parseInt(row.one('.ja-data-propPartType').get('value'),10),
                                seq         :idx,
                                indent      :0, //>>>>>>>>FINISH LATER
                                name        :row.one('.ja-data-name').get('value')
                                }
                        });
                        if(propPartId!==''){rec[rec.length-1].data.id=parseInt(propPartId,10);}
                    });
                    Y.io('/db/shared/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.propPart},
                        data:Y.JSON.stringify([{
                            propPart:{
                                                                record:rec
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JA.widget.dialogMask.hide();
            });
            //job
                f.jobAddressDetail.on('click',pod.display.address);
            //all
                h.bd.delegate('click',pod.display.info,'.ja-info');
                h.hd.delegate('click',trigger.showHide,'.ja-eye');
                h.bd.delegate('click',trigger.showHide,'.ja-eye');
            //property parts
                h.propPartSection.delegate('click',pod.display.propPart,'.ja-add');
                h.propPartFilter.on('change',trigger.filter.propPart);
                h.propPartList.delegate('click',io.remove.propPart,'.ja-remove');
                h.propPartList.delegate('click',trigger.focus.propPart,'> li');
            //property part answers
                h.propPartAnswerList.delegate('click',trigger.set.propPartAnswer,'input.ja-data-id');
            //answers
                h.answerFilterService.on('change',trigger.filter.answerService);
                h.answerList.delegate('click',trigger.focus.answer,'> li');
                h.answerList.delegate('click',io.insert.answer,'.ja-dup');
                h.answerList.delegate('click',io.remove.answer,'.ja-remove');
            //save
                h.save.on('click',io.save.job);
            //custom
                Y.on(JA.my.podAddress.customEvent.select,pod.result.address);
                Y.on(JA.my.podInfo.customEvent.save,pod.result.info);
        };

        pod={
            display:{
                address:function(){
                    JA.my.podAddress.display({address:f.jobAddress.get('value')});
                },
                info:function(){
                    var config={
                            visible:true
                        },
                        section=this.ancestor('.ja-section')
                    ;
                    h.podInvoke=this;
                    if(section.hasClass('ja-section-answer')){
                        config.title     ='Answers';
                        config.categories=['General','Feedback','Clarify','Warning'];
                        config.dbTable   =JA.data.dbTable['answer'].id;
                    }else
                    if(section.hasClass('ja-section-propPart')){
                        config.title     ='Property Parts';
                        config.categories=['General','Unique','Multi'];
                        config.dbTable   =JA.data.dbTable['propPart'].id;
                    }else
                    if(section.hasClass('ja-section-propPartAnswer')){
                        config.title     ='Property Parts/Answer';
                        config.categories=['Joint focus','Property Part Focus','Answer Focus'];
                        config.dbTable   =JA.data.dbTable['propPartAnswer'].id;
                    }
                    config.pk=parseInt(this.ancestor('li').one('.ja-data-id').get('value'),10);
                    JA.my.podInfo.display(config);
                },
                propPart:function(){
                    h.podInvoke=this;
                    if(!self.my.podPropPart){pod.load.propPart();return false;}
                    self.my.podPropPart.display();
                }
            },
            load:{
                propPart:function(){
                    Y.use('ja-pod-propPart',function(Y){
                        self.my.podPropPart=new Y.JA.pod.propPart({});
                        Y.JA.whenAvailable.inDOM(self,'my.podPropPart',function(){
                            self.my.podPropPart.set('zIndex',cfg.zIndex+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podPropPart.customEvent.select,pod.result.propPart);
                    });
                }
            },
            result:{
                address:function(rs){
                    f.jobAddress.set('value',rs.data.id);
                    f.jobAddressDetail.set('innerHTML',
                        render.address({
                            streetRef :rs.data.streetRef,
                            streetName:rs.data.streetName,
                            location  :rs.data.locationName
                        })
                    );
                },
                info:function(rs){
                    var cnt=rs.info.record.length,
                        li=h.podInvoke.ancestor('li'),
                        section=li.ancestor('.ja-section')
                    ;
                    //update note count
                        h.podInvoke.one('span').set('innerHTML',cnt===0?'':cnt);
                    //update count reference
                        if(section.hasClass('ja-section-propPartAnswer')){
                            d.rs.propPartAnswer.data[parseInt(li.one('.ja-data-id').get('value'),10)].countInfo=cnt;
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
                                    propPartTypeName:JA.data.propPartType[r.propPartType].name,
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
                d.rs.answerRef={};
                Y.each(d.rs.answer.data,function(answer){
                    var cnt={button:0,input:0,select:0,textarea:0},
                        q=JA.data.question[answer.question],
                        nodes
                    ;
                    //+question ref to answer
                        d.rs.answerRef[q.ref]=answer;
                    answerInfoCount=0;
                    Y.each(d.rs.answerInfo.data,function(i){
                        if(i.dbTable===JA.data.dbTable['answer'].id && i.pk===answer.id){answerInfoCount++;}
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
                    nodes={
                        button  :nn.all('span button'),
                        input   :nn.all('span input'),
                        select  :nn.all('span select'),
                        textarea:nn.all('span textarea')
                    };
                    //>>>EXCLUDE FOR NOW
                    if(answer.detail!=='' && answer.detail!==null){
                        Y.each(Y.JA.mergeIndicesOf(['<button','<input','<select','<textarea'],q.code),function(arr,idx){
                            var tag=arr[1],
                                answerValue=answer.detail.split(';')[idx],
                                node=nodes[tag].item(cnt[tag]),
                                nodeType=node.get('type')
                            ;
                            //tag action
                            switch(tag){
                                    case 'button':
                                        break;
                                    case 'input':
                                        if(nodeType==='text'){

                                        }else
                                        if(nodeType==='checkbox'){
                                            nodes[tag].item(cnt[tag]).set('checked',true);
                                        }
                                        break;
                                    case 'select':
                                        if(nodeType==='select-one'){
                                            Y.JA.matchSelect(node,answerValue);
                                        }else{
                                            //select-multiple


                                            //>>>>>>>>FINISH



                                        }
                                        break;
                                    case 'textarea':
                                        break;
                                }
                            //tag occurance
                                cnt[tag]++;
                        });
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
                    Y.JA.matchSelect(f.jobWeather,job.weather);
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
                //sync display
                    h.answerFilterService.simulate('change');
                    h.answerSection.one('legend a').simulate('click');
                    h.propPartSection.one('legend a').simulate('click');
                Y.JA.widget.busy.set('message','');
                Y.fire(self.customEvent.save,'refresh');
            },
            propPart:function(){
                Y.each(d.rs.propPart.data,function(propPart){
                    var data=[],
                        nn=Y.Node.create(
                            render.propPart({
                                id              :propPart.id,
                                propPartType    :propPart.propPartType,
                                propPartTypeName:JA.data.propPartType[propPart.propPartType].name,
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
                Y.JA.widget.busy.set('message','');
            },
            propPartAnswer:function(){
                var answerId=parseInt(h.answerRowFocus.one('.ja-data-id').get('value'),10),
                    eyeOpen=h.propPartAnswerSection.one('> legend > .ja-eye').hasClass('ja-eye-open')
                ;
                h.propPartAnswerList.set('innerHTML','');
                h.propPartList.all('li').each(function(pp){
                    var propPartId=parseInt(pp.one('.ja-data-id').get('value'),10),
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
                    //remember propPart record node reference
                        nn.setData('propPartRecNode',pp);
                    //display
                        if(!eyeOpen){
                            nn.one('.ja-info').setStyle('display','none');
                        }





                    Y.each(ppaData,function(ppa){
                        ppa.infoCount=0;
                        if(ppa.propPart===propPartId && ppa.answer===answerId){
                            nn.one('.ja-data-id').setAttrs({
                                'value':ppa.id,
                                'title':'Property Part Answer id#'+ppa.id
                            });
                            if(ppa.current===1){nn.one('.ja-data-id').set('checked',true);}
                            //info
                                Y.each(d.rs.propPartAnswerInfo,function(d){
                                    if(d.pk===ppa.id){ppa.infoCount++;}
                                });
                                nn.one('.ja-info span').set('innerHTML',ppa.infoCount===0?'':ppa.infoCount);
                        }
                    });
                });
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                        +' #<input type="text" class="ja-data ja-data-id" title="job number" disabled="disabled" />'
                        +'<input type="hidden" class="ja-data ja-data-address" />'
                        +' &nbsp; [<span class="ja-display-address"></span>]'
                        //display
                            +'<span class="ja-section ja-section-display">'
                            +  ' &nbsp; ['
                            +    Y.JA.html('btn',{action:'eye',title:'change view',classes:'ja-eye-open ja-display-service',label:'services'})
                            +    ' &nbsp;'
                            +    Y.JA.html('btn',{action:'eye',title:'change view',classes:'ja-eye-open ja-display-details',label:'details'})
                            +  ']'
                            +'</span>'
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        //job
                             'ref:<input type="text" class="ja-data ja-data-ref" title="old system reference" placeholder="ref#" />'
                            +'Appointment:<input type="text" class="ja-data ja-date ja-data-appointment" title="appointment date" placeholder="appointment" />'
                            +'&nbsp; Confirmed:<input type="text" class="ja-data ja-date ja-data-confirmed" title="confirmed date" placeholder="confirmed" />'
                            +'&nbsp; Reminder:<input type="text" class="ja-data ja-data-reminder ja-date" title="reminder date" placeholder="reminder" />'
                            +'<select class="ja-data ja-data-weather">'
                            +  '<option>fine</option>'
                            +  '<option>cloudy</option>'
                            +  '<option>wet</option>'
                            +  '<option>dark</option>'
                            +'</select>'
                            +Y.JA.html('btn',{action:'save',title:'save',label:'save'})
                        //services
                            +'<fieldset class="ja-list-service">'
                            +  '<legend>services</legend>'
                            +'</fieldset>'
                        +'<div class="ja-section-details">'
                        //question/answers
                            +  '<fieldset class="ja-section ja-section-answer">'
                            +    '<legend>'
                            +      Y.JA.html('btn',{action:'eye',label:'statement&nbsp;',title:'change view',classes:'ja-eye-open'})
                            +      '<select></select>'
                            +      '<select></select>'
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //property part answer associations
                            +  '<fieldset class="ja-section ja-section-propPartAnswer">'
                            +    '<legend>'
                            +      Y.JA.html('btn',{action:'eye',label:'link&nbsp;',title:'change view',classes:'ja-eye-open'})
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //property parts
                            +  '<fieldset class="ja-section ja-section-propPart">'
                            +    '<legend>'
                            +      Y.JA.html('btn',{action:'eye',label:'property&nbsp;',title:'change view',classes:'ja-eye-open'})
                            +      '<select></select>'
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

                    h.close           =h.hd.one('.ja-close');

                    f.jobId           =h.hd.one('.ja-data-id');
                    f.jobAddress      =h.hd.one('.ja-data-address');
                    f.jobAddressDetail=h.hd.one('.ja-display-address');

                    f.jobRef          =h.bd.one('.ja-data-ref');
                    f.jobAppointment  =h.bd.one('.ja-data-appointment');
                    f.jobConfirmed    =h.bd.one('.ja-data-confirmed');
                    f.jobReminder     =h.bd.one('.ja-data-reminder');
                    f.jobWeather      =h.bd.one('.ja-data-weather');

                    h.displayServices =h.bd.one('.ja-display-services');
                    h.serviceList     =h.bd.one('.ja-list-service');

                    h.detailsSection  =h.bd.one('> .ja-section-details');

                    h.propPartSection =h.bd.one('.ja-section-propPart');
                    h.propPartFilter  =h.propPartSection.one('> legend > select');
                    h.propPartList    =h.propPartSection.one('> ul');

                    h.propPartAnswerSection =h.bd.one('.ja-section-propPartAnswer');
                    h.propPartAnswerList    =h.propPartAnswerSection.one('> ul');

                    h.answerSection       =h.bd.one('.ja-section-answer');
                    h.answerFilterService =h.answerSection.all('> legend > select').item(0);
                    h.answerFilterCategory=h.answerSection.all('> legend > select').item(1);
                    h.answerList          =h.answerSection.one('> ul');

                    h.save            =h.bd.one('.ja-save');
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
                   +  '<input type="hidden" class="ja-data ja-data-id" value="{id}" />'
                   +  '<input type="hidden" class="ja-data ja-data-question" value="{question}" />'
                   +  '<div title="#{id}">'
                   +    '{name}'
                   +    Y.JA.html('btn',{action:'info',title:'notes',label:p.infoCount})
                   +    '<span class="ja-actions">'
                   +      Y.JA.html('btn',{action:'dup',title:'duplicate'})
                   +      Y.JA.html('btn',{action:'remove',title:'remove'})
                   +    '</span>'
                   +  '</div>'
                   +  '<span>{code}</span>'
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
                   +  '<input type="hidden"   class="ja-data ja-data-id" value="{id}" />'
                   +  '<input type="hidden"   class="ja-data ja-data-propPartType" value="{propPartType}" />'
                   +  '<input type="hidden"   class="ja-data ja-data-seq" value="{seq}" />'
                   +  '<input type="hidden"   class="ja-data ja-data-indent" value="{indent}" />'
                   +  '<input type="hidden"   class="ja-data ja-data-category" value="{category}" />'
                   +  '<div class="ja-data-propPartTypeName" title="{propPartTypeName} part#{id}">{propPartTypeName}</div>'
                   +  '<input type="text" class="ja-data ja-data-name" value="{name}" placeholder="detail" />'
                   +  '<select class="ja-data ja-data-component">'
                   +    '<option>Component..</option>'
                   +    '<option>Wall</option>'
                   +    '<option>Floor</option>'
                   +    '<option>Ceiling</option>'
                   +    '<option>Window</option>'
                   +    '<option>Door</option>'
                   +  '</select>'
                   +  Y.JA.html('btn',{action:'info'  ,title:'notes',label:(p.infoCount===0?' ':p.infoCount)})
                   +  '<div class="ja-actions">'
                   +    Y.JA.html('btn',{action:'add'   ,title:'add property part'})
                   +    Y.JA.html('btn',{action:'dup'   ,title:'duplicate property part'})
                   +    Y.JA.html('btn',{action:'remove',title:'remove property part'})
                   +  '</div>'
                   +'</li>',
                {
                    'id'              :p.id,
                    'propPartType'    :p.propPartType,
                    'propPartTypeName':p.propPartTypeName,
                    'seq'             :p.seq,
                    'name'            :'',
                    'indent'          :p.indent,
                    'category'        :p.propPartType===''?'':JA.data.propPartType[p.propPartType].category
                });
            },
            propPartAnswer:function(p){
                return Y.Lang.sub(
                    '<li>'
                   +  '<input type="hidden" class="ja-data ja-data-propPart" value="{propPart}" />'
                   +  '<input type="hidden" class="ja-data ja-data-answer" value="{answer}" />'
                   +  '<input type="checkbox" class="ja-data ja-data-id" title="propPartAnswer#{id}" value="{id}" />'
                   +  Y.JA.html('btn',{action:'info',title:'notes',label:''})
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
                answerService:function(){
                    var answerFilterValue=this.get('value'),
                        foundValue,
                        questionHas=function(question,answerValue){
                            var found=false,
                                isCategory=isNaN(parseInt(answerValue,10))//services are numeric , categories are strings
                            ;
                            Y.each(JA.data.questionMatrix,function(qm){
                                if(!isCategory){answerValue=parseInt(answerValue,10);}
                                if(qm.question===question && answerValue===(isCategory?qm.category:qm.service)){found=true;}
                            });
                            return found;
                        },
                        visibleAnswer=false
                    ;
                    //reset category filter
                        h.answerFilterCategory.set('selectedIndex',0);



                    if(this.get('selectedIndex')===0){
                        h.answerList.all('li').each(function(row){
                            if(!visibleAnswer){visibleAnswer=row;}
                            row.setStyle('display','');
                        });
                    }else{
                        h.answerList.all('li').each(function(row){
                            foundValue=questionHas(parseInt(row.one('.ja-data-question').get('value'),10),answerFilterValue);
                            row.setStyle('display',foundValue?'':'none');
                            if(!visibleAnswer && foundValue){visibleAnswer=row;}
                        });
                    }
                    //focus on first displayed
                        if(visibleAnswer!==false){visibleAnswer.simulate('click');}
                },
                propPart:function(){
                    var category=this.get('value')
                    ;
                    h.propPartList.all('li').each(function(row){
                        row.setStyle('display','');
                        if(category!=='All' && row.one('.ja-data-category').get('value')!==category){
                            row.setStyle('display','none');
                        }
                    });
                    populate.propPartAnswer();
                }
            },
            focus:{
                answer:function(){
                    h.answerRowFocus=this;
                    h.answerList.all('.ja-focus').removeClass('ja-focus');
                    this.addClass('ja-focus');
                    populate.propPartAnswer();
                },
                propPart:function(){
                    h.propPartRowFocus=this;
                    h.propPartList.all('.ja-focus').removeClass('ja-focus');
                    this.addClass('ja-focus');
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
                    var ppaRec        =this.ancestor('li'),
                        propPartId =parseInt(ppaRec.one('.ja-data-propPart').get('value'),10),
                        answerId   =parseInt(ppaRec.one('.ja-data-answer'  ).get('value'),10),
                        checked    =this.get('checked')?1:0,
                        ppaData    =ppaRec.getData('propPartRecNode').getData('propPartAnswer'),
                        newRecord  =true
                    ;
                    Y.each(ppaData,function(ppa){
                        if(ppa.propPart===propPartId && ppa.answer===answerId){
                            newRecord=false;
                            ppa.current=checked;
                        }
                    });
                    //insert
                        if(newRecord){
                            ppaData.push({
                                id      :null,
                                propPart:propPartId,
                                answer  :answerId,
                                current :checked,
                                job     :parseInt(f.jobId.get('value'),10),
                                seq     :0
                            });
                        }
                }
            },
            showHide:function(){
                var section=this.ancestor('.ja-section'),
                    sectionList=section.one('ul')
                ;
                if(section.hasClass('ja-section-display')){
                    if(this.hasClass('ja-display-service')){
                        if(this.hasClass('ja-eye-open')){
                            this.replaceClass('ja-eye-open','ja-eye-closed');
                            h.serviceList.setStyle('display','none');
                        }else{
                            this.replaceClass('ja-eye-closed','ja-eye-open');
                            h.serviceList.setStyle('display','');
                        }
                    }else if(this.hasClass('ja-display-details')){
                        if(this.hasClass('ja-eye-open')){
                            this.replaceClass('ja-eye-open','ja-eye-closed');
                            h.detailsSection.setStyle('display','none');
                        }else{
                            this.replaceClass('ja-eye-closed','ja-eye-open');
                            h.detailsSection.setStyle('display','');
                        }
                    }
                }else if(section.hasClass('ja-section-propPart')){
                    if(this.hasClass('ja-eye-open')){
                        this.replaceClass('ja-eye-open','ja-eye-squint');
                        sectionList.all('.ja-actions').setStyle('display','none');
                    }else if(this.hasClass('ja-eye-squint')){
                        this.replaceClass('ja-eye-squint','ja-eye-closed');
                        sectionList.all('.ja-data-component,.ja-info').setStyle('display','none');
                    }else if(this.hasClass('ja-eye-closed')){
                        this.replaceClass('ja-eye-closed','ja-eye-open');
                        sectionList.all('.ja-actions,.ja-data-component,.ja-info').setStyle('display','');
                    }
                }else if(section.hasClass('ja-section-answer')){
                    if(this.hasClass('ja-eye-open')){
                        this.replaceClass('ja-eye-open','ja-eye-squint');
                        sectionList.all('.ja-actions').setStyle('display','none');
                        section.setStyle('width','30em');
                    }else if(this.hasClass('ja-eye-squint')){
                        this.replaceClass('ja-eye-squint','ja-eye-closed');
                        sectionList.all('.ja-info').setStyle('display','none');
                        section.setStyle('width','26em');
                    }else{
                        this.replaceClass('ja-eye-closed','ja-eye-open');
                        section.setStyle('width','35em');
                        sectionList.all('.ja-actions,.ja-info').setStyle('display','');
                    }
                }else if(section.hasClass('ja-section-propPartAnswer')){
                    if(this.hasClass('ja-eye-open')){
                        this.replaceClass('ja-eye-open','ja-eye-closed');
                        sectionList.all('.ja-info').setStyle('display','none');
                    }else{
                        this.replaceClass('ja-eye-closed','ja-eye-open');
                        sectionList.all('.ja-info').setStyle('display','');
                    }
                }
            }
        };
        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
            ['propPartTag','id'],
            ['propPartType','id'],
            ['question','id'],
            ['questionMatrix','id'],
            ['service','id'],
            ['tagOption','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
