/** //mod/job.js
 *
 */
YUI.add('ja-mod-job',function(Y){

    Y.namespace('JA.mod').job=function(cfg){

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
            css        :'ja-mod-job'
        };

        var self=this,
            d={
                template:{}
            },
            f={},
            h={
                template:{
                    PPI:new Y.Template()
                }
            },
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
                    Y.JA.widget.busy.set('message','getting job(s)...');
                    if(this.hasClass('ja-search-address')){
                        criteria.streetRef =f.streetRef .get('value');
                        criteria.streetName=f.streetName.get('value');
                        criteria.location  =parseInt(f.location.get('value'),10);
                    }else
                    if(this.hasClass('ja-search-name')){
                        criteria.firstName=f.firstName.get('value');
                        criteria.lastName =f.lastName .get('value');
                    }else
                    if(this.hasClass('ja-search-job')){
                        if(f.job.get('value')===''){alert('requires job number');return false;}
                        criteria.jobIds=[parseInt(f.job.get('value'),10)];
                    }else
                    if(this.hasClass('ja-search-last-jobs')){
                        criteria.lastJob=true;
                    }
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            job:{
                            	criteria:criteria
                            },
                            usr:JA.user.usr
                        }])
                    });
                },
                templates:function(){
                    Y.io('/template/PPI.html',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            h.template.bindPPI=h.template.PPI.compile(o.responseText);
                        }}
                    });
                }
            },
            insert:{
                job:function(rs){
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            h.bd.one('.ja-search-last-jobs').simulate('click');
                        }},
                        data:Y.JSON.stringify([{
                            job:{record:[{
                                data:{
                                    address    :rs.data.id,
                                    appointment:moment().day(7).unix()
                                }
                            }]},
                            usr:JA.user.usr
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
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){row.remove();}},
                        data:Y.JSON.stringify([{
                            job:{
                                remove:[jobId]
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.bd.delegate('click',io.fetch.job,'.ja-search');
            Y.one('.ja-add-job').on('click',JA.my.podAddress.display);
            h.dtc.delegate('click',trigger.selectGridCell,'.yui3-datatable-cell');
            h.dtc.delegate('click',trigger.report,'.ja-rep');
            h.dtc.delegate('click',io.remove.job,'.ja-remove');
            //custom
                Y.on(JA.my.podAddress.customEvent.select,io.insert.job);
                Y.on(JA.my.podJob.customEvent.save,pod.result.job);
        };

        pod={
            display:{
                job:function(p){
                    JA.my.podJob.display(p);
                    JA.my.podJob.set('visible',true);
                }
            },
            result:{
                job:function(rs){
                }
            }
        };

        populate={
            job:function(id,o){
                var jobs=[]
                ;
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                h.dt.set('data',null);
                //reverse sort
                    Y.each(d.rs.job.data,function(job){jobs.push(job);});
                    jobs.sort(function(a,b){return b.id-a.id;});
                Y.each(jobs,function(job){
                    var usrInfo=[]
                    ;
                    //usr
                    Y.each(d.rs.jobUsr.data,function(jobUsr){
                        if(jobUsr.job!==job.id){return;}
                        Y.each(d.rs.usr.data,function(usr){
                            if(usr.id!==jobUsr.usr){return;}
                            usrInfo.push(usr.firstName+'('+jobUsr.purpose+')');
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
                        report     :Y.JA.html('btn',{action:'rep',title:'summary'            ,classes:'ja-rep-summary'})
                                   +Y.JA.html('btn',{action:'rep',title:'details'            ,classes:'ja-rep-detail'})
                                   +Y.JA.html('btn',{action:'rep',title:'inspection report 1',classes:'ja-rep-1'}),
                        actions    :Y.JA.html('btn',{action:'remove',title:'remove'})
                    });
                });
                Y.JA.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                cfg.node.append(
                    '<fieldset>'
                   +  '<legend>search</legend>'
                   +  '<button class="ja-search ja-search-last-jobs">last jobs</button>'
                   +  '&nbsp; Address:'
                   +  '<select class="ja-data-state">'
                   +    '<option>NSW</option>'
                   +    '<option>VIC</option>'
                   +    '<option>QLD</option>'
                   +    '<option>ACT</option>'
                   +    '<option>NT</option>'
                   +    '<option>TAS</option>'
                   +    '<option>WA</option>'
                   +  '</select>'
                   +  '<input type="hidden" class="ja-data-location" />'
                   +  '<input type="text"   class="ja-data-locationName" title="suburb/city" placeholder="suburb" />'
                   +  '<input type="text"   class="ja-data-streetName"   title="street" placeholder="street" />'
                   +  '<input type="text"   class="ja-data-streetRef"    title="unit/street number" placeholder="#" />'
                   +  Y.JA.html('btn',{action:'find',title:'search for address',classes:'ja-search ja-search-address'})
                   +  '&nbsp; Name:'
                   +  '<input type="text"   class="ja-data-firstName" title="first name" placeholder="first" />'
                   +  '<input type="text"   class="ja-data-lastName"  title="last name"  placeholder="last" />'
                   +  Y.JA.html('btn',{action:'find',title:'search for name',classes:'ja-search ja-search-name'})
                   +  '&nbsp; Job:'
                   +  '<input type="text"   class="ja-data-job" title="job number" placeholder="#" />'
                   +  Y.JA.html('btn',{action:'find',title:'search for specific job',classes:'ja-search ja-search-job'})
                   +  '&nbsp; row limit<input type="text" class="ja-data-row-limit"  title="maximum number of records to fetch"  placeholder="rows" value="20" />'
                   +'</fieldset>'
                );
                h.bd          =cfg.node.one('fieldset');
                f.state       =h.bd.one('.ja-data-state'       );
                f.streetRef   =h.bd.one('.ja-data-streetRef'   );
                f.streetName  =h.bd.one('.ja-data-streetName'  );
                f.location    =h.bd.one('.ja-data-location'    );
                f.locationName=h.bd.one('.ja-data-locationName');
                f.firstName   =h.bd.one('.ja-data-firstName'   );
                f.lastName    =h.bd.one('.ja-data-lastName'    );
                f.job         =h.bd.one('.ja-data-job'         );
                f.rowLimit    =h.bd.one('.ja-data-row-limit'   );
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
                    caption :'Job Log '+Y.JA.html('btn',{action:'add',label:'job',title:'new job',classes:'ja-add-job'}),
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
                h.dtc=h.dt.get('contentBox');
            }
        };

        trigger={
            report:function(){
                var rec=this.ancestor('tr'),
                    jobId=parseInt(rec.one('.yui3-datatable-col-job input').get('value'),10),
                    job=d.rs.job.data[jobId],
                    jobDetail=(job.detail!=='' && job.detail!==null?Y.JSON.parse(job.detail):false),
                    address=d.rs.address.data[job.address],
                    statement=[],
                    statementRef={},
                    propertyData=d.rs.property.data,
                    propertyTree=[],
                    html='',
                    width=800,
                    qaRef={},
                    qaTemplate={}
                ;
                d.propertyQaCount={};
                address.full=address.streetRef+' '+address.streetName+' '+d.rs.location.data[address.location].name;
                //answers

                if(this.hasClass('ja-rep-summary')){
                    html='<h2>Job#'+jobId+' '+address.full+'</h2>'
                        +'<ul>'
                        +  '<li>to be completed</li>'
                        +  '<li>Statistics</li>'
                        +  '<li>Count of each of the top level statements</li>'
                        +  '<li>Property part statistics, perhaps a data grid?</li>'
                        +'</ul>';
                }else

                if(this.hasClass('ja-rep-detail')){
                    html='<h1>Details - Job#'+jobId+' '+address.full+'</h1>';
                    if(jobDetail===false){
                        html+='<em>no information entered as yet</em>';
                    }else{

                        html+='<h3>Property/Site definition</h3>';
                        propertyTree=Y.JA.lib.job.tree.build(propertyData,job.address);
                        Y.each(propertyTree,function(branch){
                            html+='<ul>'+Y.JA.lib.job.tree.output(branch)+'<ul>';
                        });

                        html+='<h3>Values</h3>';
                        qaRef=Y.JA.lib.job.detail(jobDetail);
                        Y.each(qaRef,function(ref,refId){
                            Y.each(ref,function(rec){
                                if(Y.Lang.isArray(rec.value)){ //checkbox
                                    if(rec.value[1]){
                                        html+=refId+' is '+rec.value[0]+'<br/>';
                                    }
                                }else{
                                    html+=refId+' is '+rec.value+'<br/>';
                                }
                            });
                        });

                        html+='<h3>Ret*</h3>';
                        Y.each(qaRef,function(ref,refId){
                            //filter
                            if(!/Ret.*/.test(refId)){return;}
                            Y.each(ref,function(rec){
                                if(Y.Lang.isArray(rec.value)){ //checkbox
                                    if(rec.value[1]){
                                        html+=Y.JA.lib.job.ancestry(propertyData,rec.path[0]).propName.join('>')+' - '+refId+': '+rec.value[0]+'<br/>';
                                    }
                                }else{
                                    html+=Y.JA.lib.job.ancestry(propertyData,rec.path[0]).propName.join('>')+' - '+refId+': '+rec.value+'<br/>';
                                }
                            });
                        });
                        html+='<h3>Roof*</h3>';
                        Y.each(qaRef,function(ref,refId){
                            //filter
                            if(!/Roof.*/.test(refId)){return;}
                            Y.each(ref,function(rec){
                                if(Y.Lang.isArray(rec.value)){ //checkbox
                                    if(rec.value[1]){
                                        html+=Y.JA.lib.job.ancestry(propertyData,rec.path[0]).propName.join('>')+' - '+refId+': '+rec.value[0]+'<br/>';
                                    }
                                }else{
                                    html+=Y.JA.lib.job.ancestry(propertyData,rec.path[0]).propName.join('>')+' - '+refId+': '+rec.value+'<br/>';
                                }
                            });
                        });

                        html+='<h3>Templating Examples</h3>';
                        
                        // template for each qa, not statement as these are not consistent
                        
                        // micro=new Y.Template(),


                        html+='<h2>Coming</h2>';


















                    }
                }else

                if(this.hasClass('ja-rep-1')){
                    //substitute final values

                    html=h.template.bindPPI(statementRef);
                    width=1000;
                }
                JA.my.podRep.display({html:html,visible:true,width:width});
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

        io.fetch.templates();
        render.base();
        initialise();
        listeners();
        h.bd.one('.ja-search-last-jobs').simulate('click');

    };

},'1.0 March 2013',{requires:['base','io','node']});
