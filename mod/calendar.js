/** //mod/calendar.js
 *
 */
YUI.add('jak-mod-calendar',function(Y){

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

        /**
         * private
         */

        function listeners(){
            Y.on(JAK.my.podJob.customEvent.save,function(){
                JAK.my.fc.fullCalendar('refetchEvents');
            });
        };

        render={
            base:function(){
                JAK.my.fc=$(Y.Node.getDOMNode(cfg.node))
                ;
                JAK.my.fc.fullCalendar({
                    allowCalEventOverlap:true,
                    allDayDefault:false,
                    contentHeight:500,
                    daysToShow:7,
                    editable:true,
                    events:function(start,end,callback){
                        Y.io('/db/job/s.php',{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            on:{complete:function(id,o){
                                var rs=Y.JSON.parse(o.responseText)[0].result,
                                    events=[]
                                ;
                                Y.each(rs.job.data,function(job){
                                    events.push({
                                        id   :job.id,
                                        title:'job#'+job.id,
                                        start:moment.unix(job.appointment).toDate()
                                    });
                                });
                                callback(events);
                            }},
                            data:Y.JSON.stringify([{
                                 criteria:{
                                    appointmentStart:Math.round(start.getTime()/1000),
                                    appointmentEnd  :Math.round(end.getTime()/1000)
                                 }
                             }])
                         });
                    },
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
                    dayClick:function(day){
                        JAK.my.podJob.display({
                            appointment:moment(day).unix(),
                            visible    :true
                        });
                    },
                    eventClick:function(e){
                        JAK.my.podJob.display({
                            job    :e.id,
                            visible:true
                        });
                    },
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
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
