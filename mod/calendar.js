/** //mod/calendar.js
 *
 */
YUI.add('ja-mod-calendar',function(Y){

    Y.namespace('JA.mod').calendar=function(cfg){

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
            listeners,
            pod={},
            populate={},
            render={}
        ;

        this.my={}; //children

        /**
         * private
         */

        listeners=function(){
            Y.on(JA.my.podJob.customEvent.save,function(){
                JA.my.fc.fullCalendar('refetchEvents');
            });
        };


        pod={
            display:{
                address:function(){
                    if(!self.my.podAddress){pod.load.address();return false;}
                    self.my.podAddress.display({});
                }
            },
            load:{
                address:function(){
                    Y.use('ja-pod-address',function(Y){
                        self.my.podAddress=new Y.JA.pod.address({});
                        Y.JA.whenAvailable.inDOM(self,'my.podAddress',function(){
                            self.my.podAddress.set('zIndex',cfg.zIndex+10);
                            pod.display.address();
                        });
                        Y.on(self.my.podAddress.customEvent.select,function(address){
                            JA.my.podJob.display({
                                address    :address.data.id,
                                appointment:moment(d.dayClickEvent).unix(),
                                visible    :true
                            });
                        });
                    });
                }
            }
        };
        
        render={
            base:function(){
                JA.my.fc=$(Y.Node.getDOMNode(cfg.node))
                ;
                JA.my.fc.fullCalendar({
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
                                job:{
                                	criteria:{
                                    	appointmentStart:Math.round(start.getTime()/1000),
                                    	appointmentEnd  :Math.round(end.getTime()/1000)
                                    }	
								},
								usr:JA.user.usr
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
                    dayClick:function(e){
                        d.dayClickEvent=e //date
                        ;
                        pod.display.address(e);
                    },
                    eventClick:function(e){
                        JA.my.podJob.display({
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
        Y.JA.dataSet.fetch([
        ],function(){

            render.base();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
