/** //mod/calendar.js
 *
 */
YUI.add('jak-mod-calendar',function(Y){

    /**
     *  create reuseable job pods
     */
    WB.my.jobNew=new Y.WB.pod.jobNew({
        title:'new task'
       ,visible:false
    });

    Y.namespace('JAK.mod').calendar=function(cfg){

        if(typeof cfg=='undefined' ||
           typeof cfg.node=='undefined'
        ){alert('error:mod-calendar parameters');return;}

        cfg=Y.merge({
            title      :'calendar',
            width      :'900px',
            zIndex     :9999
        },cfg);

        this.info={
            id         :'calendar',
            title      :cfg.title,
            description:'calendar',
            file       :'/mod/calendar.js',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},
            h={},
            initialise={},
            io={},
            listeners,
            populate={},
            render={}
        ;

        this.customEvent={
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
        };

        io={
            fetch:{
            }
        };

        listeners=function(){
        };

        populate={
        };

        render={
            base:function(){

                            $(Y.Node.getDOMNode(cfg.node)).fullCalendar({
                                allowCalEventOverlap:true,
                                allDayDefault:false,
                                contentHeight:500,
                                daysToShow:7,
                                editable:true,
                                /*
                                events:function(start,end,callback){
                                    Y.io('/taskRange.php',{ //>>>>>>>>>>>>>>>>>FIX
                                        method:'POST',
                                        headers:{'Content-Type':'application/json'},
                                        on:{complete:function(id,o){
                                        }},
                                        data:Y.JSON.stringify({
                                            start:new Date(),
                                            end  :new Date()
                                        })
                                    });
                                },
                                */
                                firstDayOfWeek:1,
                                firstHour:8,
                                header:{
                                    left:'prev,next today',
                                    center:'title',
                                    right:'month,agendaWeek,agendaDay'
                                },
                                id:0,
                                minTime:6,
                                maxTime:21,
                                overlapEventsSeparate:true,
                                timeFormat:{
                                    agenda:'h:mmTT{ - h:mm TT}', // 5:00PM - 6:30PM
                                    '':'(h:mm)TT'
                                },
                                weekMode:'liquid',
                                //events
                                dayClick   :WB.my.jobNew.display,
                                eventClick :function(){alert('click on event');},
                                eventDrop  :function(){alert('event drop');},
                                eventResize:function(){alert('event resize');}
                            });
                
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
