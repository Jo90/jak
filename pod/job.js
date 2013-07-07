/** //pod/job.js
 *
 */
YUI.add('ja-pod-job',function(Y){
    "use strict";
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
            trigger.reset();
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
                }
            },
            insert:{
                answer:function(){
                    alert('duplicate - to do - must create immediately to allow notes to be attached....');
                },
                job:function(){
                    Y.JA.widget.busy.set('message','new job...');
                    Y.io('/db/siud.php',{
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
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                        }},
                        data:Y.JSON.stringify([{
                            answer:{
                                remove:[answerId]
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
                            usr:JA.user.usr
                        },
                        answerSeq=1
                    ;
                    h.statementList.all('> li').each(function(a){
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
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.job},
                        data:Y.JSON.stringify([post])
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


            h.tree.on('nodeclick',function(e){
                h.tvNode=e.treenode;
                h.propertyPath.set('innerHTML',h.tvNode.path().join('/'));

                //
                console.log(
                    "\nYou clicked " +  h.tvNode.get("label")+(h.tvNode.get("isLeaf")?" (leaf)":" (node)")
                    +"\nIndex is: " + h.tvNode.get('index')
                    +"\nState is: " + (h.tvNode.get("collapsed") ? "collapsed" : "expanded")
                );
            });
            h.propertyAction.on('click',function(e){
                var selectedIndex=this.get('selectedIndex'),
                    activeDescendant=h.tree.get('activeDescendant'),
                    selection=h.tree.get('selection'),
                    focused=h.tree.get('focused'),
                    index=h.tvNode.get('index'),
                    selected=h.tree.get('selected')
                ;
                if(selectedIndex===0){
                    h.tvNode.add({
                        label:"foster-child"
                    });
                }else{
                    h.tvNode.remove();
                }
            });

                
            //all
                h.bd.delegate('click',pod.display.info,'.ja-info');
                h.hd.delegate('click',trigger.showHide,'.ja-eye');
                h.bd.delegate('click',trigger.showHide,'.ja-eye');
            //answers
                h.statementList.delegate('click',io.remove.answer,'.ja-remove');
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
                    if(section.hasClass('ja-section-statement')){
                        config.title     ='Answers';
                        config.categories=['General','Feedback','Clarify','Warning'];
                        config.dbTable   =JA.data.dbTable['answer'].id;
                    }
                    config.pk=parseInt(this.ancestor('li').one('.ja-data-id').get('value'),10);
                    JA.my.podInfo.display(config);
                }
            },
            load:{
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
                }
            }
        };

        populate={
            answer:function(){
            },
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var addresses=d.rs.address.data
                ;
                trigger.reset();
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
                    populate.answer();
                });
                //sync display
                    h.statementSection.one('legend a').simulate('click');
                Y.JA.widget.busy.set('message','');
                Y.fire(self.customEvent.save,'refresh');
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
                        //property
                            +  '<fieldset class="ja-section ja-section-property">'
                            +    '<legend>'
                            +      '<span></span> <select><select>'
                            +    '</legend>'
                            +  '</fieldset>'
                        //question/answers
                            +  '<fieldset class="ja-section ja-section-statement">'
                            +    '<legend>'
                            +      Y.JA.html('btn',{action:'eye',label:'statement&nbsp;',title:'change view',classes:'ja-eye-open'})
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

                    h.propertySection =h.bd.one('.ja-section-property');
                    h.propertyPath    =h.propertySection.one('>legend>span');
                    h.propertyAction  =h.propertySection.one('>legend>select');

                    h.statementSection=h.bd.one('.ja-section-statement');
                    h.statementList   =h.statementSection.one('> ul');

                    h.save            =h.bd.one('.ja-save');

                    /*
                        FINISH
                        if focused on node then display options, if not a leaf then allow add
                        generating valid options????
                        saving data
                    */
                    h.tree=new Y.TreeView({
                        startCollapsed:false,
                        render:h.propertySection
                    });
                    trigger.reset();

                    
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

                    
                    if(this.get('selectedIndex')===0){
                        h.statementList.all('li').each(function(row){
                            if(!visibleAnswer){visibleAnswer=row;}
                            row.setStyle('display','');
                        });
                    }else{
                        h.statementList.all('li').each(function(row){
                            foundValue=questionHas(parseInt(row.one('.ja-data-question').get('value'),10),answerFilterValue);
                            row.setStyle('display',foundValue?'':'none');
                            if(!visibleAnswer && foundValue){visibleAnswer=row;}
                        });
                    }
                    //focus on first displayed
                        if(visibleAnswer!==false){visibleAnswer.simulate('click');}
                }
            },
            reset:function(){
                f.jobId             .set('value','');
                f.jobAddress        .set('value','');
                f.jobAddressDetail  .set('innerHTML','address not defined');
                f.jobRef            .set('value','');
                f.jobAppointment    .set('value','');
                f.jobConfirmed      .set('value','');
                f.jobReminder       .set('value','');
                f.jobWeather        .set('value','');
                h.tree.remove(0);
                h.tree.add({
                    label:"site",
                    children:[
                        {
                            label : 'building <span class="ja-data-property-detail">home</span>',
                            children : [
                                { label: 'lounge'},
                                { label: 'bedroom <span class="ja-data-property-detail">master</span>',
                                    children: [
                                        { label: 'ceiling' },
                                        { label: 'wall <span class="ja-data-property-detail">south</span>'},
                                        { label: 'floor' }
                                    ]
                                },
                                    { label: 'bedroom'},
                                    { label: 'bedroom'}
                            ]
                        },
                        {
                            label : 'land',
                            children : [
                                { label: 'pool'},
                                { label: 'driveway'}
                            ]
                        }
                    ]
                });
                h.statementList.set('innerHTML','');
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
                }else if(section.hasClass('ja-section-statement')){
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
                }
            }
        };
        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
            ['service','id'],
            ['tagOption','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
