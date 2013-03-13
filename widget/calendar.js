/** //widget/calendar.js
 *
 */
YUI.add('jak-widget-calendar',function(Y){

    Y.one('body').addClass('yui3-skin-sam');
    Y.one('body').append(
        '<div id="jak-calendar-container"><div id="jak-calendar">'
       +'<button class="jak-calendar-today">today</button>'
       +'<button class="jak-calendar-clear">clear</button>'
       +'</div></div>'
    );

    var DEFAULT_DATE_FORMAT="%a %d %b %Y",
        cal=new Y.Calendar({
            contentBox:'#jak-calendar',
            date:new Date(),
            showNextMonth:true,
            showPrevMonth:true,
            width:'350px',
            visible:false
        }).render(),
        bb=cal.get('boundingBox'),
        callingNode,
        focusValue
    ;
    bb.setStyle('zIndex',99999999);

    Y.one('.jak-calendar-today').on('click',function(){
        //>>>>>DO set month if different
        cal.deselectDates();cal.selectDates(new Date());
        
    });
    Y.one('.jak-calendar-clear').on('click',function(){
        callingNode.set('value','');}
    );
    
    cal.on('dateClick',function(e){
        var date_format=DEFAULT_DATE_FORMAT,
            cfg=callingNode.getData('calendar') //use configuration if defined
        ;
        if(cfg && cfg.date_format){date_format=cfg.date_format;}
        callingNode.set('value',Y.Date.format(Y.Date.parse(e.date),{format:date_format}));
    });

    Y.one('body').delegate('focus',function(){
        focusValue=this.get('value');
        var nodeDate=focusValue===''
                ?new Date()
                :Y.Date.parse(focusValue),
            nodeMonth=new Date(nodeDate),
            calMonth=new Date(cal.get('date'))
        ;
        callingNode=this;
        cal.show();
        cal.get('boundingBox').setXY([this.getX()+2,this.getY()+26]);
        cal.deselectDates(); //causes selectionChange to fire
        //if different month
            if(Y.Date.format(nodeMonth,{format:"%b%Y"})!==Y.Date.format(calMonth,{format:"%b%Y"})){
                cal.set('date',nodeMonth);
            }
        cal.selectDates(nodeDate); //causes selectionChange to fire
    },'.jak-date');

    bb.on('clickoutside',function(e){
        if(e.target!==callingNode){cal.hide();}
    });

},'March 2013',{requires:['base','calendar','event-outside','node']});
