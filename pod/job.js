/** //pod/job.js
 *
 */
YUI.add('jak-pod-job',function(Y){

    Y.namespace('JAK.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'job'
           ,width      :1000
           ,xy         :[10,20]
           ,zIndex     :99999
        },cfg);

        this.info={
            id         :'job'
           ,title      :cfg.title
           ,description:'job details'
           ,version    :'v1.0 March 2013'
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
            if(typeof p.job!='undefined'){
                io.fetch.job(p);
            }else{
                //blank form
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
                    debugger;
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JAK.widget.dialogMask.hide();
            });
            h.save.on('click',io.save.job);
        };

        pod={
            display:{
                usr:function(e){
                }
            },
            load:{
                usr:function(){
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
                h.bd.setContent('');
                Y.each(jobs,function(job){
                    var nn=render.job();
                    //bug: nn.one not working if appended, why???
                    nn.one('.jak-data-id'      ).set('value',job.id);
                    nn.one('.jak-data-ref'     ).set('value',job.ref);
                    nn.one('.jak-data-created' ).set('value',Y.Date.format(Y.Date.parse(job.created *1000),{format:"%a %d %b %Y"}));
                    if(job.reminder!==null){
                        nn.one('.jak-data-reminder').set('value',Y.Date.format(Y.Date.parse(job.reminder*1000),{format:"%a %d %b %Y"}));
                    }
                    Y.JAK.matchSelect(nn.one('.jak-data-status' ),job.status);
                    Y.JAK.matchSelect(nn.one('.jak-data-weather'),job.weather);
                    h.bd.append(nn);


                    //>>>>>>>>>>>Address & users


                });
                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAKPS">'+self.info.title+'</span> '
                       +Y.JAK.html('btn',{action:'add',label:'new',title:'add new job',classes:'jak-job-add'})
                       +Y.JAK.html('btn',{action:'add',label:'duplicate',title:'duplicate job',classes:'jak-job-dup'})
                       +Y.JAK.html('btn',{action:'close',title:'close pod'})
                   ,bodyContent:''
                   ,footerContent:Y.JAK.html('btn',{action:'save',title:'save',label:'save'})
                   ,width  :cfg.width
                   ,xy     :cfg.xy
                   ,zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd     =h.ol.headerNode;
                    h.bd     =h.ol.bodyNode;
                    h.ft     =h.ol.footerNode;
                    h.bb     =h.ol.get('boundingBox');
                    h.add    =h.hd.one('.jak-job-add');
                    h.dup    =h.hd.one('.jak-job-dup');
                    h.close  =h.hd.one('.jak-close');
                    h.save   =h.ft.one('.jak-save');
            },
            job:function(){
                var nn=Y.Node.create(
                        '<input type="text" class="jak-data jak-data-id"                title="job number"           disabled="disabled" />'
                       +'<input type="text" class="jak-data jak-data-ref"               title="old system reference" placeholder="ref#" />'
                       +'<input type="text" class="jak-data jak-data-created  jak-date" title="date created"         placeholder="created" />'
                       +'<input type="text" class="jak-data jak-data-reminder jak-date" title="remind date"          placeholder="remind" />'
                       +'<select class="jak-data jak-data-status">'
                       +  '<option>pending</option>'
                       +  '<option>open</option>'
                       +  '<option>closed</option>'
                       +  '<option>cancelled</option>'
                       +'</select>'
                       +'<select class="jak-data jak-data-weather">'
                       +  '<option>fine</option>'
                       +  '<option>cloudy</option>'
                       +  '<option>wet</option>'
                       +  '<option>dark</option>'
                       +'</select>'
                       +'<div class="jak-ds-address"></div>'
                    )
                ;
                //h.bd.append(nn); //bug:nn.one('.jak-data-id') returning null
                return nn;
            }
        };

        trigger={
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
