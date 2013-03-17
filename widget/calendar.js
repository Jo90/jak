/** //widget/calendar.js
 *
 */
YUI.add('jak-widget-calendar',function(Y){

    Y.one('body').addClass('yui3-skin-sam');
    Y.one('body').append(
        '<div id="jak-calendar-container"><div id="jak-calendar">'
       +  '<div class="jak-calendar-options">'
       +    '<button class="jak-calendar-today" title="return to today">today</button>'
       +    '<button class="jak-calendar-clear" title="clear date field">clear</button>'
       +  '</div>'
       +  '<div class="jak-calendar-time">'
       +    '<select>'
       +      '<option>12</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option>'
       +    '</select>'
       +    ':<select>'
       +      '<option>00</option><option>05</option><option>10</option><option>15</option><option>20</option><option>25</option><option>30</option><option>35</option><option>40</option><option>45</option><option>50</option><option>55</option>'
       +    '</select>'
       +    '<select>'
       +      '<option>am</option>'
       +      '<option>pm</option>'
       +    '</select>'
       +    Y.JAK.html('btn',{action:'close',title:'close pod',classes:'jak-calendar-close'})
       +  '</div>'
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
        callingNode,
        focusValue
    ;

    Y.one('.jak-calendar-today').on('click',function(){
        cal.set('date',new Date());
        cal.deselectDates();
        cal.selectDates(new Date());
    });
    Y.one('.jak-calendar-clear').on('click',function(){
        callingNode.set('value','');}
    );
    Y.one('.jak-calendar-close').on('click',function(){
        cal.hide();
    });

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
            nodeMonth=new Date(nodeDate)
        ;
        callingNode=this;
        cal.show();
        cal.get('boundingBox').setXY([this.getX()+2,this.getY()+26]);
        cal.deselectDates(); //causes selectionChange to fire
        //if different month
            if(Y.Date.format(nodeMonth,{format:"%b%Y"})!==Y.Date.format(new Date(cal.get('date')),{format:"%b%Y"})){
                cal.set('date',nodeMonth);
            }
        cal.selectDates(nodeDate); //causes selectionChange to fire
    },'.jak-date');

    cal.get('boundingBox').on('clickoutside',function(e){
        if(e.target!==callingNode){cal.hide();}
    });

},'March 2013',{requires:['base','calendar','event-outside','node']});
