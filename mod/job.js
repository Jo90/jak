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
            d={},
            h={},
            initialise={},
            io={},
            listeners,
            pod={},
            populate={},
            render={}
        ;

        this.customEvent={
            selected:self.info.id+(++JAK.env.customEventSequence)+':selected'
        };

        this.get=function(what){
        };
        this.set=function(what,value){
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
                job:function(){
                    Y.JAK.widget.busy.set('message','getting job(s)...');
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            criteria:{
                                streetRef :h.bd.one('.jak-data-streetRef' ).get('value'),
                                streetName:h.bd.one('.jak-data-streetName').get('value'),
                                location  :h.bd.one('.jak-data-location'  ).get('value'),
                                firstName :h.bd.one('.jak-data-firstName' ).get('value'),
                                lastName  :h.bd.one('.jak-data-lastName'  ).get('value'),
                                job       :h.bd.one('.jak-data-job'       ).get('value')
                            },
                            member:JAK.user.usr
                        }])
                    });
                }
            }
           ,insert:{
            }
        };

        listeners=function(){
            h.search.on('click',io.fetch.job);
        };

        pod={
            display:{
            }
           ,load:{
            }
           ,result:{
            }
        };

        populate={
            job:function(id,o){
                var rs=Y.JSON.parse(o.responseText)[0].result;
                debugger;
                Y.JAK.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                cfg.node.append(
                    '<fieldset>'
                   +  '<legend>search</legend>'
                   +  'Address:'
                   +  '<input type="hidden" class="jak-data-location" />'
                   +  '<input type="text"   class="jak-data-locationName" title="suburb/city" placeholder="suburb" />'
                   +  '<input type="text"   class="jak-data-streetName"   title="street" placeholder="street" />'
                   +  '<input type="text"   class="jak-data-streetRef"    title="unit/street number" placeholder="#" />'
                   +  '&nbsp; Name:'
                   +  '<input type="text"   class="jak-data-firstName" title="first name" placeholder="first name" />'
                   +  '<input type="text"   class="jak-data-lastName"  title="last name"  placeholder="last name" />'
                   +  '&nbsp; Job:'
                   +  '<input type="text"   class="jak-data-job" title="job number" placeholder="job" />'
                   +  '<button>search</button>'
                   +'</fieldset>'
                );
                h.bd    =cfg.node.one('fieldset');
                h.search=cfg.node.one('button');
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
