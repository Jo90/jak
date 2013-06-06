/** //widget/calendar.js
 *
 */
YUI.add('ja-widget-calendar',function(Y){

    Y.one('body').addClass('yui3-skin-sam');
    Y.one('body').append(
        '<div id="ja-calendar-container"><div id="ja-calendar">'
       +  '<button class="ja-calendar-today" title="return to today">today</button>'
       +  '<button class="ja-calendar-clear" title="clear date field">clear</button>'
       +  Y.JA.html('btn',{action:'close',title:'close pod',classes:'ja-calendar-close'})
       +  '<div class="ja-calendar-time">'
       +    '<select class="ja-widget-calendar-hour">'
       +      '<option value="0">midnight</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option selected="selected">9</option><option>10</option><option>11</option>'
       +    '</select>'
       +    ':<select class="ja-widget-calendar-minute">'
       +      '<option>00</option><option>05</option><option>10</option><option>15</option><option>20</option><option>25</option><option>30</option><option>35</option><option>40</option><option>45</option><option>50</option><option>55</option>'
       +    '</select>'
       +    '<select class="ja-widget-calendar-ampm">'
       +      '<option selected="selected">am</option>'
       +      '<option>pm</option>'
       +    '</select>'
       +    '<button class="ja-widget-calendar-setTime">set</button>'
       +  '</div>'
       +'</div></div>'
    );

    var cal=new Y.Calendar({
            contentBox:'#ja-calendar',
            date:new Date(),
            showNextMonth:true,
            showPrevMonth:true,
            width:'350px',
            visible:false
        }).render(),
        callingNode,
        bb         =cal.get('boundingBox'),
        date_format='DDMMMYY h:mma',
        fHr        =bb.one('.ja-widget-calendar-hour'),
        fMin       =bb.one('.ja-widget-calendar-minute'),
        fAm        =bb.one('.ja-widget-calendar-ampm'),
        fHr0       =fHr.one('option'),
        fTimeSet   =bb.one('.ja-widget-calendar-setTime'),
        fmtTime    =function(){
            var hr=fHr.get('value')
            ;
            return (hr==='0'?'12':hr)+':'+fMin.get('value')+fAm.get('value');
        }
    ;

    Y.one('.ja-calendar-today').on('click',function(){
        cal.set('date',new Date());
        cal.deselectDates();
        cal.selectDates(new Date());
    });
    Y.one('.ja-calendar-clear').on('click',function(){
        callingNode.set('value','');}
    );
    Y.one('.ja-calendar-close').on('click',function(){
        cal.hide();
    });
    cal.on('dateClick',function(e){
        var cfg=callingNode.getData('calendar') //use configuration if defined
        ;
        if(cfg && cfg.date_format){date_format=cfg.date_format;}
        callingNode.set('value',moment(e.date).format('DDMMMYY')+' '+fmtTime());
    });
    fAm.on('change',function(){
        fHr0.set('innerHTML',this.get('value')==='am'?'midnight':'noon');
    });
    fTimeSet.on('click',function(){
        callingNode.set('value',callingNode.get('value').substr(0,7)+' '+fmtTime());
    });

    Y.one('body').delegate('focus',function(){
        var focusValue=this.get('value'),
            nodeDate,
            soon=moment().add('hour',1).startOf('hour'),
            soonHr=parseInt(soon.format('H'),10),
            soonAm=soonHr<12?'am':'pm'
        ;
        if(focusValue===''){
            nodeDate=new Date();
        }else if(moment(focusValue).isValid()){
            nodeDate=moment(focusValue).toDate();
        }else if(moment(focusValue,date_format).isValid()){
            nodeDate=moment(focusValue,date_format).toDate();
        }else{
            alert('unknown date "'+focusValue+'"');
            return;
        }
        callingNode=this;
        cal.show();
        bb.setXY([this.getX()+2,this.getY()+26]);
        cal.deselectDates();
        //if different month
            if(moment(nodeDate).format('MMYY')!==moment(cal.get('date')).format('MMYY')){
                cal.set('date',nodeDate);
            }
        //set time
            Y.JA.matchSelect(fHr,soonHr);
            Y.JA.matchSelect(fAm,soonAm);
            fAm.simulate('change');
        cal.selectDates(nodeDate);
    },'.ja-date');

    bb.on('clickoutside',function(e){
        if(e.target!==callingNode){cal.hide();}
    });

},'March 2013',{requires:['base','calendar','event-outside','node']});
