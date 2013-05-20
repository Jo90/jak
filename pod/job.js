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
            var answerArr=[],
                jobServiceArr=[],
                propPartTypeCategory={}
            ;
            h.bb.addClass('jak-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
            //prop part filter
                //ensure display order
                    propPartTypeCategory['All']=1;
                    propPartTypeCategory['General']=1;
                Y.each(JAK.data.propPartType,function(propPartType){
                    propPartTypeCategory[propPartType.category]=1;
                });
                Y.each(propPartTypeCategory,function(category,id){
                    h.propPartFilter.append('<option>'+id+'</option>');
                });
            //answer filter and non general services
                h.answerFilter.append('<option value="0">All</option>');
                Y.each(JAK.data.service,function(service){
                    answerArr.push('<option value="'+service.id+'">'+service.name+'</option>');
                    //exclude general from job services
                        if(service.name!=='General'){
                            jobServiceArr.push('<label><input type="checkbox" value="'+service.id+'"><em>'+service.name+'</em></label> $<input type="text" class="jak-data jak-data-jobService-fee" value="'+service.fee+'" placeholder="service fee" title="service fee" />');
                        }
                });
                h.answerFilter.append('<optgroup label="Services">'+answerArr.join(',')+'</optgroup>');
                answerArr=[];
                Y.each(JAK.data.questionMatrix,function(qm){
                    answerArr.push('<option>'+qm.category+'</option>');
                });
                h.answerFilter.append('<optgroup label="Categories">'+Y.Array.dedupe(answerArr).join(',')+'</optgroup>');
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
                answer:function(){
                    var row=this.ancestor('li'),
                        answerId=parseInt(row.one('.jak-data-id').get('value'),10)
                    ;
                    if(!confirm('delete answer/statement')){return;}
                    Y.io('/db/shared/d.php',{
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
                            data:{
                                answer:{
                                    remove:[answerId]
                                }
                            },
                            dataSet:'answer',
                            usr:JAK.user.usr
                        }])
                    });
                },
                propPart:function(){
                    var row=this.ancestor('li'),
                        propPartId=parseInt(row.one('.jak-data-id').get('value'),10)
                    ;
                    Y.io('/db/shared/d.php',{
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
                            data:{
                                propPart:{
                                    remove:[propPartId]
                                }
                            },
                            dataSet:'propPart',
                            usr:JAK.user.usr
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
                            }
                        },
                        answerSeq=1
                    ;
                    h.answerList.all('> li').each(function(a){
                        var answerValues=[],
                            cnt={button:0,input:0,select:0,textarea:0},
                            indices=[],
                            nodes={
                                button  :a.all('span button'),
                                input   :a.all('span input'),
                                select  :a.all('span select'),
                                textarea:a.all('span textarea')
                            },
                            questionId=parseInt(a.one('.jak-data-question').get('value'),10),
                            q=JAK.data.question[questionId]
                        ;
                        indices=Y.JAK.mergeIndicesOf(['<button','<input','<select','<textarea'],q.code);
                        Y.each(indices,function(arr){
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
                                id      :parseInt(a.one('.jak-data-id').get('value'),10),
                                question:parseInt(a.one('.jak-data-question').get('value'),10),
                                job     :jobId,
                                detail  :answerValues.join(';'),
                                seq     :answerSeq++
                            }
                        });
                    });
                    h.propPartList.all('> li').each(function(pp){
                        //merge
                        post.propPartAnswer.record.push.apply(post.propPartAnswer.record,pp.getData('propPartAnswer'));
                    });
                    Y.io('/db/job/u.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.job},
                        data:Y.JSON.stringify([{
                            data:post,
                            usr :JAK.user.usr
                        }])
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
            //all
                h.bd.delegate('click',pod.display.info,'.jak-info');
                h.bd.delegate('click',trigger.showHide,'.jak-eye');
            //property parts
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
                h.answerList.delegate('click',io.remove.answer,'.jak-remove');
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
                    var cnt={button:0,input:0,select:0,textarea:0},
                        indices=[],
                        nodes
                    ;
                    q=JAK.data.question[answer.question];
                    indices=Y.JAK.mergeIndicesOf(['<button','<input','<select','<textarea'],q.code);
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
                    nodes={
                        button  :nn.all('span button'),
                        input   :nn.all('span input'),
                        select  :nn.all('span select'),
                        textarea:nn.all('span textarea')
                    };
                    //>>>EXCLUDE FOR NOW
                    if(true===false && answer.detail!=='' && answer.detail!==null){
                        Y.each(indices,function(arr,idx){
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
                                            Y.JAK.matchSelect(node,answerValue);
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
                var answerId=parseInt(h.answerRowFocus.one('.jak-data-id').get('value'),10),
                    eyeOpen=h.propPartAnswerSection.one('> legend > .jak-eye').hasClass('jak-eye-open')
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
                    //remember propPart record node reference
                        nn.setData('propPartRecNode',pp);
                    //display
                        if(!eyeOpen){
                            nn.one('.jak-info').setStyle('display','none');
                        }




                        
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
                        //display
                            +'<span class="jak-section jak-section-display">'
                            +  ' &nbsp; ['
                            +    Y.JAK.html('btn',{action:'eye',title:'change view',classes:'jak-eye-open jak-display-service',label:'services'})
                            +    ' &nbsp;'
                            +    Y.JAK.html('btn',{action:'eye',title:'change view',classes:'jak-eye-open jak-display-details',label:'details'})
                            +  ']'
                            +'</span>'
                        //services
                            +'<fieldset class="jak-list-service">'
                            +  '<legend>services</legend>'
                            +'</fieldset>'
                        +'<div class="jak-section-details">'
                        //property parts
                            +  '<fieldset class="jak-section jak-section-propPart">'
                            +    '<legend>'
                            +      Y.JAK.html('btn',{action:'eye',label:'property&nbsp;',title:'change view',classes:'jak-eye-open'})
                            +      '<select></select>'
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //property part answer associations
                            +  '<fieldset class="jak-section jak-section-propPartAnswer">'
                            +    '<legend>'
                            +      Y.JAK.html('btn',{action:'eye',label:'link&nbsp;',title:'change view',classes:'jak-eye-open'})
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        //question/answers
                            +  '<fieldset class="jak-section jak-section-answer">'
                            +    '<legend>'
                            +      Y.JAK.html('btn',{action:'eye',label:'statement&nbsp;',title:'change view',classes:'jak-eye-open'})
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
                    
                    h.detailsSection  =h.bd.one('> .jak-section-details');

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
                   +  '<span>{code}</span>'
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
                    var answerFilterValue=parseInt(this.get('value'),10),
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
                    if(this.get('selectedIndex')===0){
                        h.answerList.all('li').each(function(row){
                            if(!visibleAnswer){visibleAnswer=row;}
                            row.setStyle('display','');
                        });
                    }else{
                        h.answerList.all('li').each(function(row){
                            hasService=serviceHasQuestion(answerFilterValue,parseInt(row.one('.jak-data-question').get('value'),10));
                            row.setStyle('display',hasService?'':'none');
                            if(!visibleAnswer && hasService){visibleAnswer=row;}
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
                    var ppaRec        =this.ancestor('li'),
                        propPartId =parseInt(ppaRec.one('.jak-data-propPart').get('value'),10),
                        answerId   =parseInt(ppaRec.one('.jak-data-answer'  ).get('value'),10),
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
                var section=this.ancestor('.jak-section')
                ;
                if(section.hasClass('jak-section-display')){
                    if(this.hasClass('jak-display-service')){
                        if(this.hasClass('jak-eye-open')){
                            this.replaceClass('jak-eye-open','jak-eye-closed');
                            h.serviceList.setStyle('display','none');
                        }else{
                            this.replaceClass('jak-eye-closed','jak-eye-open');
                            h.serviceList.setStyle('display','');
                        }
                    }else if(this.hasClass('jak-display-details')){
                        if(this.hasClass('jak-eye-open')){
                            this.replaceClass('jak-eye-open','jak-eye-closed');
                            h.detailsSection.setStyle('display','none');
                        }else{
                            this.replaceClass('jak-eye-closed','jak-eye-open');
                            h.detailsSection.setStyle('display','');
                        }
                    }
                }else if(section.hasClass('jak-section-propPart')){
                    if(this.hasClass('jak-eye-open')){
                        this.replaceClass('jak-eye-open','jak-eye-squint');
                        h.propPartList.all('.jak-btn').setStyle('display','none');
                    }else if(this.hasClass('jak-eye-squint')){
                        this.replaceClass('jak-eye-squint','jak-eye-closed');
                        h.propPartList.all('.jak-showhide').setStyle('display','none');
                    }else{
                        this.replaceClass('jak-eye-closed','jak-eye-open');
                        h.propPartList.all('.jak-showhide,.jak-btn').setStyle('display','');
                    }
                }else if(section.hasClass('jak-section-answer')){
                    if(this.hasClass('jak-eye-open')){
                        this.replaceClass('jak-eye-open','jak-eye-closed');
                        section.all('>ul .jak-btn').setStyle('display','none');
                    }else{
                        this.replaceClass('jak-eye-closed','jak-eye-open');
                        section.all('>ul .jak-btn').setStyle('display','');
                    }
                }else if(section.hasClass('jak-section-propPartAnswer')){
                    if(this.hasClass('jak-eye-open')){
                        this.replaceClass('jak-eye-open','jak-eye-closed');
                        section.all('>ul .jak-btn').setStyle('display','none');
                    }else{
                        this.replaceClass('jak-eye-closed','jak-eye-open');
                        section.all('>ul .jak-btn').setStyle('display','');
                    }
                }
            }
        };
        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
            ['propPartTag','id'],
            ['propPartType','id'],
            ['propPartTypeTag','id'],
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
