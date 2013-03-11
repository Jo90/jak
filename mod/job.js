/** //mod/job.js
 *
 */
YUI.add('jak-mod-job',function(Y){

    Y.namespace('JAK.mod').job=function(cfg){

        if(typeof cfg=='undefined' ||
           typeof cfg.node=='undefined'
        ){alert('error:mod-job parameters');return;}

        cfg=Y.merge({
            title      :'job search',
            width      :'900px',
            zIndex     :9999
        },cfg);

        this.info={
            id         :'job',
            title      :cfg.title,
            description:'job search',
            file       :'/mod/job.js',
            version    :'v1.0 March 2013'
        };

        var self=this,
            css='jak-mod-job',
            d={},f={},h={},
            initialise={},
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.customEvent={
            selected:self.info.id+(++JAK.env.customEventSequence)+':selected'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            cfg.node.addClass(css);
        };

        io={
            fetch:{
                job:function(e){
                    var criteria={rowLimit:f.rowLimit.get('value')}
                    ;
                    Y.JAK.widget.busy.set('message','getting job(s)...');
                    if(this.hasClass('jak-search-address')){
                        criteria.streetRef =f.streetRef .get('value');
                        criteria.streetName=f.streetName.get('value');
                        criteria.location  =f.location  .get('value');
                    }else
                    if(this.hasClass('jak-search-name')){
                        criteria.firstName=f.firstName.get('value');
                        criteria.lastName =f.lastName .get('value');
                    }else
                    if(this.hasClass('jak-search-job')){
                        if(f.job.get('value')===''){alert('requires job number');return false;}
                        criteria.job=f.job.get('value');
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
            }
        };

        listeners=function(){
            h.bd.delegate('click',io.fetch.job,'.jak-search');
            h.dt.get('contentBox').delegate('click',trigger.selectGridCell,'.yui3-datatable-cell');
        };

        pod={
            display:{
            },
            load:{
            },
            result:{
            }
        };

        populate={
            job:function(id,o){
                var rs       =Y.JSON.parse(o.responseText)[0].result,
                    addresses=rs.address.data,
                    jobs     =rs.job.data,
                    locations=rs.location.data
                ;
                h.dt.set('data',null);
                Y.each(jobs,function(job){
                    h.dt.addRow({
                        jobId     :job.id,
                        streetRef :addresses[job.address].streetRef,
                        streetName:addresses[job.address].streetName,
                        location  :locations[addresses[job.address].location].full,
                        usr       :'coming...'
                    });
                });

                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                cfg.node.append(
                    '<fieldset>'
                   +  '<legend>search</legend>'
                   +  'Address:'
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
                   +  '#<input type="text"   class="jak-data-job" title="job number" placeholder="job" />'
                   +  Y.JAK.html('btn',{action:'find',title:'search for specific job',classes:'jak-search jak-search-job'})
                   +  '&nbsp; last'
                   +  Y.JAK.html('btn',{action:'find',title:'search for last jobs',classes:'jak-search jak-search-last-jobs'})
                   +  '&nbsp; row limit<input type="text" class="jak-data-row-limit"  title="maximum number of records to fetch"  placeholder="rows" value="20" />'
                   +'</fieldset>'
                );
                h.bd            =cfg.node.one('fieldset');
                f.state         =h.bd.one('.jak-data-state'       );
                f.streetRef     =h.bd.one('.jak-data-streetRef'   );
                f.streetName    =h.bd.one('.jak-data-streetName'  );
                f.location      =h.bd.one('.jak-data-location'    );
                f.locationName  =h.bd.one('.jak-data-locationName');
                f.firstName     =h.bd.one('.jak-data-firstName'   );
                f.lastName      =h.bd.one('.jak-data-lastName'    );
                f.job           =h.bd.one('.jak-data-job'         );
                f.rowLimit      =h.bd.one('.jak-data-row-limit'   );

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
                    minQueryLength:1,
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
                        {key:'jobId'     ,label:'job'       ,abbr:'id'},
                        {key:'streetRef' ,label:'#'         ,abbr:'ref'},
                        {key:'streetName',label:'street'    ,abbr:'st'},
                        {key:'location'  ,label:'location'  ,abbr:'suburb/city'},
                        {key:'usr'       ,label:'clients'   ,abbr:'usr'},
                    ],
                    data    :[],
                    sortable:true,
                    summary :'jobs'
                }).render(cfg.node);
            }
        };

        trigger={
            selectGridCell:function(e){
                if(this.hasClass('yui3-datatable-col-jobId')){
                    alert('job');
                }
                if(this.hasClass('yui3-datatable-col-streetRef')||this.hasClass('yui3-datatable-col-streetName')||this.hasClass('yui3-datatable-col-location')){
                    alert('address');
                }
            }
        };
        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
