/** //mod/job.js
 *
 */
YUI.add('jak-mod-job',function(Y){

    Y.namespace('JAK.mod').job=function(cfg){

        if(typeof cfg=='undefined' ||
           typeof cfg.node=='undefined'
        ){alert('error:mod-job parameters');return;}

        cfg=Y.merge({
            title :'job search',
            width :'900px',
            zIndex:9999
        },cfg);

        this.info={
            id         :'job',
            title      :cfg.title,
            description:'job search',
            file       :'/mod/job.js',
            version    :'v1.0 March 2013',
            css        :'jak-mod-job'
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

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            cfg.node.addClass(self.info.css);
        };

        io={
            fetch:{
                job:function(e){
                    var criteria={rowLimit:parseInt(f.rowLimit.get('value'),10)}
                    ;
                    Y.JAK.widget.busy.set('message','getting job(s)...');
                    if(this.hasClass('jak-search-address')){
                        criteria.streetRef =f.streetRef .get('value');
                        criteria.streetName=f.streetName.get('value');
                        criteria.location  =parseInt(f.location.get('value'),10);
                    }else
                    if(this.hasClass('jak-search-name')){
                        criteria.firstName=f.firstName.get('value');
                        criteria.lastName =f.lastName .get('value');
                    }else
                    if(this.hasClass('jak-search-job')){
                        if(f.job.get('value')===''){alert('requires job number');return false;}
                        criteria.jobIds=[parseInt(f.job.get('value'),10)];
                    }else
                    if(this.hasClass('jak-search-last-jobs')){
                        criteria.lastJob=true;
                    }
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            criteria:criteria,
                            member  :JAK.user.usr
                        }])
                    });
                }
            },
            insert:{
                job:function(e,action){
                    var post={}
                    ;
                    action==='duplicate'
                        ?post.duplicate=parseInt(this.ancestor('tr').one('.yui3-datatable-col-job input').get('value'),10)
                        :post.create=true;

                    Y.io('/db/job/id.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].data.job[action].result
                            ;
                            if(!rs.successInsert){alert('insert failed');}
                            else{pod.display.job({job:rs.data.id});}
                        }},
                        data:Y.JSON.stringify([{
                            data:{job:post},
                            usr :JAK.user.usr
                        }])
                    });
                }
            },
            remove:{
                job:function(e){
                    var row=this.ancestor('tr'),
                        jobId=parseInt(row.one('.yui3-datatable-col-job input').get('value'),10),
                        address=row.one('.yui3-datatable-col-streetRef').get('innerHTML')+' '
                            +row.one('.yui3-datatable-col-streetName').get('innerHTML')+' '
                            +row.one('.yui3-datatable-col-location').get('innerHTML')
                    ;
                    if(!confirm('remove job #'+jobId+' for \n'+address+'?')){return;}
                    Y.io('/db/job/id.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){row.remove();}},
                        data:Y.JSON.stringify([{
                            data:{job:{
                                remove:[jobId]
                            }},
                            usr:JAK.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.bd.delegate('click',io.fetch.job,'.jak-search');
            h.addJob.on('click',io.insert.job,null,'create');
            h.dt.get('contentBox').delegate('click',trigger.selectGridCell,'.yui3-datatable-cell');
            h.dt.get('contentBox').delegate('click',trigger.report,'.jak-rep');
            h.dt.get('contentBox').delegate('click',io.insert.job,'.jak-dup',null,'duplicate');
            h.dt.get('contentBox').delegate('click',io.remove.job,'.jak-remove');
            //custom
               Y.on(JAK.my.podJob.customEvent.update,pod.result.job);
        };

        pod={
            display:{
                job:function(p){
                    JAK.my.podJob.display(p);
                    JAK.my.podJob.set('visible',true);
                }
            },
            result:{
                job:function(rs){

                }
            }
        };

        populate={
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                h.dt.set('data',null);
                Y.each(d.rs.job.data,function(job){
                    var usrInfo=[]
                    ;
                    //usr
                    Y.each(d.rs.usrJob.data,function(usrJob){
                        if(usrJob.job!==job.id){return;}
                        Y.each(d.rs.usr.data,function(usr){
                            if(usr.id!==usrJob.usr){return;}
                            usrInfo.push(usr.firstName+'('+usrJob.purpose+')');
                        });
                    });
                    h.dt.addRow({
                        job        :'<input type="button" title="Job #'+job.id+' created '+moment.unix(job.created).format('DD MMM YYYY hh:mm a')+'" value="'+job.id+'" />',
                        ref        :job.ref,
                        streetRef  :job.address===null?'':d.rs.address.data[job.address].streetRef,
                        streetName :job.address===null?'':d.rs.address.data[job.address].streetName,
                        location   :job.address===null?'':d.rs.location.data[d.rs.address.data[job.address].location].full,
                        appointment:job.appointment===null
                                       ?''
                                       :'<span>'+moment.unix(job.appointment).format('DDMMMYY hh:mma')+'</span>',
                        confirmed  :job.confirmed===null
                                       ?''
                                       :'<span>'+moment.unix(job.confirmed).format('DDMMMYY hh:mma')+'</span>',
                        reminder   :job.reminder===null
                                       ?''
                                       :'<span>'+moment.unix(job.reminder).format('DDMMMYY hh:mma')+'</span>',
                        usr        :usrInfo.join(','),
                        address    :job.address,
                        report     :Y.JAK.html('btn',{action:'rep',title:'summary',classes:'jak-rep-summary'})
                                   +Y.JAK.html('btn',{action:'rep',title:'details',classes:'jak-rep-detail'}),
                        actions    :Y.JAK.html('btn',{action:'dup',title:'duplicate'})
                                   +Y.JAK.html('btn',{action:'remove',title:'remove'})
                    });
                });
                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                cfg.node.append(
                    '<fieldset>'
                   +  '<legend>search &nbsp; '
                   +  Y.JAK.html('btn',{action:'add',label:'add job',title:'new job',classes:'jak-add-job'})
                   +  '</legend>'
                   +  '<button class="jak-search jak-search-last-jobs">last jobs</button>'
                   +  '&nbsp; Address:'
                   +  '<select class="jak-data-state">'
                   +    '<option>NSW</option>'
                   +    '<option>VIC</option>'
                   +    '<option>QLD</option>'
                   +    '<option>ACT</option>'
                   +    '<option>NT</option>'
                   +    '<option>TAS</option>'
                   +    '<option>WA</option>'
                   +  '</select>'
                   +  '<input type="hidden" class="jak-data-location" />'
                   +  '<input type="text"   class="jak-data-locationName" title="suburb/city" placeholder="suburb" />'
                   +  '<input type="text"   class="jak-data-streetName"   title="street" placeholder="street" />'
                   +  '<input type="text"   class="jak-data-streetRef"    title="unit/street number" placeholder="#" />'
                   +  Y.JAK.html('btn',{action:'find',title:'search for address',classes:'jak-search jak-search-address'})
                   +  '&nbsp; Name:'
                   +  '<input type="text"   class="jak-data-firstName" title="first name" placeholder="first" />'
                   +  '<input type="text"   class="jak-data-lastName"  title="last name"  placeholder="last" />'
                   +  Y.JAK.html('btn',{action:'find',title:'search for name',classes:'jak-search jak-search-name'})
                   +  '&nbsp; Job:'
                   +  '<input type="text"   class="jak-data-job" title="job number" placeholder="#" />'
                   +  Y.JAK.html('btn',{action:'find',title:'search for specific job',classes:'jak-search jak-search-job'})
                   +  '&nbsp; row limit<input type="text" class="jak-data-row-limit"  title="maximum number of records to fetch"  placeholder="rows" value="20" />'
                   +'</fieldset>'
                );
                h.bd          =cfg.node.one('fieldset');
                f.state       =h.bd.one('.jak-data-state'       );
                f.streetRef   =h.bd.one('.jak-data-streetRef'   );
                f.streetName  =h.bd.one('.jak-data-streetName'  );
                f.location    =h.bd.one('.jak-data-location'    );
                f.locationName=h.bd.one('.jak-data-locationName');
                f.firstName   =h.bd.one('.jak-data-firstName'   );
                f.lastName    =h.bd.one('.jak-data-lastName'    );
                f.job         =h.bd.one('.jak-data-job'         );
                f.rowLimit    =h.bd.one('.jak-data-row-limit'   );
                h.addJob      =h.bd.one('.jak-add-job'          );
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
                            if(e.data.length===1){this.selectItem();}
                            if(e.data.length===0){f.location.set('value',0);}
                        }
                    },
                    on:{
                        query:function(e){
                            this.set('source','/db/address/acState.php?location={query}&state='+f.state.get('value'));
                        },
                        select:function(e){
                            f.location.set('value',e.result.raw[0]);
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
                            if(e.data.length===1){this.selectItem();}
                        }
                    },
                    on:{
                        query:function(e){
                            this.set('source','/db/address/acStreetName.php?streetRef='+encodeURI(f.streetRef.get('value'))+'&streetName={query}&location='+f.location.get('value'));
                        }
                    }
                });
                f.streetRef.plug(Y.Plugin.AutoComplete,{
                    activateFirstItem:true,
                    queryDelay:300,
                    resultFilters:'startsWith',
                    resultHighlighter:'wordMatch',
                    resultTextLocator:function(result){return result[1];},
                    after:{
                        results:function(e){
                            if(e.data.length===1){this.selectItem();}
                        }
                    },
                    on:{
                        query:function(e){
                            this.set('source','/db/address/acStreetRef.php?streetRef={query}&streetName='+encodeURI(f.streetName.get('value'))+'&location='+f.location.get('value'));
                        }
                    }
                });
                f.firstName.plug(Y.Plugin.AutoComplete,{
                    activateFirstItem:true,
                    minQueryLength:2,
                    queryDelay:300,
                    resultFilters:'startsWith',
                    resultHighlighter:'wordMatch',
                    resultTextLocator:function(result){return result[0];},
                    after:{
                        results:function(e){
                            if(e.data.length===1){this.selectItem();}
                        }
                    },
                    on:{
                        query:function(e){
                            this.set('source','/db/usr/ac.php?firstName='+f.firstName.get('value')+'&lastName='+f.lastName.get('value'));
                        }
                    }
                });
                f.lastName.plug(Y.Plugin.AutoComplete,{
                    activateFirstItem:true,
                    minQueryLength:2,
                    queryDelay:300,
                    resultFilters:'startsWith',
                    resultHighlighter:'wordMatch',
                    resultTextLocator:function(result){return result[1];},
                    after:{
                        results:function(e){
                            if(e.data.length===1){this.selectItem();}
                        }
                    },
                    on:{
                        query:function(e){
                            this.set('source','/db/usr/ac.php?firstName='+f.firstName.get('value')+'&lastName='+f.lastName.get('value'));
                        }
                    }
                });

                h.dt=new Y.DataTable({
                    caption :'JAK Inspections Job Log',
                    columns:[
                        {key:'job'        ,label:'Job'        ,allowHTML:true},
                        {key:'ref'        ,label:'Ref'        },
                        {key:'streetRef'  ,label:'#'          },
                        {key:'streetName' ,label:'Street'     },
                        {key:'location'   ,label:'Location'   },
                        {key:'appointment',label:'Appointment',allowHTML:true},
                        {key:'confirmed'  ,label:'Confirmed'  ,allowHTML:true},
                        {key:'reminder'   ,label:'Reminder'   ,allowHTML:true},
                        {key:'usr'        ,label:'Clients'    },
                        {key:'report'     ,label:'Reports'    ,allowHTML:true},
                        {key:'actions'    ,label:''           ,allowHTML:true}
                    ],
                    data    :[],
                    sortable:true,
                    summary :'jobs'
                }).render(cfg.node);
            }
        };

        trigger={
            report:function(){
                var rec=this.ancestor('tr'),
                    jobId=parseInt(rec.one('.yui3-datatable-col-job input').get('value'),10),
                    job=d.rs.job.data[jobId],
                    address,
                    addressMessage='address not entered',
                    statement=[],
                    indices=[],
                    code
                ;
                if(job.address!==null){
                    address=d.rs.address.data[job.address];
                    addressMessage=address.streetRef+' '+address.streetName+' '+d.rs.location.data[address.location].name;
                }
                //answers
                    Y.each(d.rs.answer.data,function(answer){
                        var tagAnswers,
                            tagAnswer,
                            tagSnippet
                        ;
                        if(answer.job!==jobId || answer.detail===null || answer.detail===''){return;}
                        tagAnswers=answer.detail.split(';');
                        //
                        code=JAK.data.question[answer.question].code;
                        //replace tags in reverse order
                        Y.each(Y.JAK.mergeIndicesOf(['<button','<input','<select','<textarea'],code).sort(function(a,b){return b[0]-a[0];}),function(tag){
                            tagAnswer=tagAnswers.pop();
                            //replace tag with value
                                if(tag[1]==='select'||tag[1]==='textarea'||tag[1]==='button'){
                                    code=code.substring(0,tag[0])+tagAnswer+code.substring(code.indexOf('</'+tag[1])+tag[1].length+3);
                                }else if(tag[1]==='input'){
                                    code=code.substring(0,tag[0])+tagAnswer+code.substring(code.indexOf('/>')+2);
                                }
                        });
                        statement.push(JAK.data.question[answer.question].name+': '+code);
                    });
                if(this.hasClass('jak-rep-summary')){
                    JAK.my.podRep.display({
                        html   :'<h2>Job#'+jobId+' '+addressMessage+'</h2>'
                               +'<ul>'
                               +  '<li>'+statement.join('</li><li>')+'</li>'
                               +'</ul>',
                        visible:true
                    });
                }
                if(this.hasClass('jak-rep-detail')){
                    JAK.my.podRep.display({
                        html   :'<h1>details</h1>',
                        visible:true
                    });
                }
            },
            selectGridCell:function(e){
                if(this.hasClass('yui3-datatable-col-job')||
                   this.hasClass('yui3-datatable-col-appointment')||
                   this.hasClass('yui3-datatable-col-confirmed')||
                   this.hasClass('yui3-datatable-col-reminder')
                ){
                    pod.display.job({job:parseInt(this.ancestor('tr').one('.yui3-datatable-col-job input').get('value'),10)});
                }
            }
        };
        /**
         *  load & initialise
         */

        render.base();
        initialise();
        listeners();
        h.bd.one('.jak-search-last-jobs').simulate('click');

    };

},'1.0 March 2013',{requires:['base','io','node']});
