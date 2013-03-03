/** //widget/time.js
 *
 */
YUI.add('jak-widget-time',function(Y){

    var DEFAULT_DATE_FORMAT='h:mmtt';

    Y.one('body').append('<div id="jak-time-container"><div id="jak-time"></div></div>');

    Y.namespace('JAK.widget').time=new Y.Overlay({
        bodyContent:
            '<select class="jak-time-hour">'
           +  '<option>1</option>'
           +  '<option>2</option>'
           +  '<option>3</option>'
           +  '<option>4</option>'
           +  '<option>5</option>'
           +  '<option>6</option>'
           +  '<option>7</option>'
           +  '<option>8</option>'
           +  '<option>9</option>'
           +  '<option>10</option>'
           +  '<option>11</option>'
           +  '<option>12</option>'
           +'</select>'
           +'<select class="jak-time-minute">'
           +  '<option>00</option>'
           +  '<option>05</option>'
           +  '<option>10</option>'
           +  '<option>15</option>'
           +  '<option>20</option>'
           +  '<option>25</option>'
           +  '<option>30</option>'
           +  '<option>35</option>'
           +  '<option>40</option>'
           +  '<option>45</option>'
           +  '<option>50</option>'
           +  '<option>55</option>'
           +'</select>'
           +'<select class="jak-time-ampm">'
           +  '<option>am</option>'
           +  '<option>pm</option>'
           +'</select>'
           +Y.JAK.html('btn',{action:'close'})
       ,width:'350px'
       ,visible:false
       ,zIndex:99999
    }).render('#jak-time');
    Y.JAK.widget.time.JAK={
        callingNode:null
    };

    Y.JAK.widget.time.get('boundingBox').delegate('change',function(e){
        var bb=Y.JAK.widget.time.get('boundingBox')
        ;
        Y.JAK.widget.time.JAK.callingNode.set('value',
            bb.one('.jak-time-hour').get('value')+':'
           +bb.one('.jak-time-minute').get('value')
           +bb.one('.jak-time-ampm').get('value')
        );
    },'select');

    Y.JAK.widget.time.get('boundingBox').one('.jak-close').on('click',function(e){
        Y.JAK.widget.time.hide();
    });

    Y.one('body').delegate('focus',function(){
        var time=this.get('value')
           ,timePattern=/^(\d{1,2}):(\d{2})(:(\d{2}))?(\s?(AM|am|PM|pm))?$/
           ,timeArray=time.match(timePattern)
           ,ol=Y.JAK.widget.time
           ,bb=Y.JAK.widget.time.get('boundingBox')
        ;
        ol.JAK.callingNode=this;
        //set hour,minute,ampm
            Y.JAK.pod.fn.dom.matchSelect(bb.one('.jak-time-hour'  ),timeArray[1]);
            Y.JAK.pod.fn.dom.matchSelect(bb.one('.jak-time-minute'),timeArray[2]);
            Y.JAK.pod.fn.dom.matchSelect(bb.one('.jak-time-ampm'  ),timeArray[6].toLowerCase());
        ol.show();
        ol.get('boundingBox').setXY([this.getX()+2,this.getY()+26]);
    },'.jak-time');

    Y.one('body').delegate('blur',function(){
        var time=this.get('value')
        ;
        if(time!=='' && !Y.JAK.isValidTime(time)){
            alert('time format not recognised');
            return false;
        }
    },'.jak-time');

    //hide
        //stop time events from bubbling outside container
        Y.one('#jak-time-container').on('click',function(e){
            e.stopPropagation();
        });
        Y.one('body').on('click',function(e){
            if(!e.target.hasClass('jak-time')){
                Y.JAK.widget.time.hide();
            }
        });

},'January 2012',{requires:['base','node']});
