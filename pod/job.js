/** //pod/job.js
 *
 */
YUI.add('ja-pod-job',function(Y){
    "use strict";
    Y.namespace('JA.pod').job=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title   :'job',
            width   :1250,
            visible :true,
            xy      :[10,20],
            zIndex  :99999
        },cfg);

        this.info={
            id         :'job',
            title      :cfg.title,
            description:'job details',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise,
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            if(typeof cfg.appointment!=='undefined'){delete cfg.appointment;}
            cfg=Y.merge(cfg,p);
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            trigger.reset();
            typeof p.job!=='undefined'
                ?io.fetch.job()
                :io.insert.job();
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            save:self.info.id+(++JA.env.customEventSequence)+':save'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            var qaTopStatements='',
                qaArr=[]
            ;
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
            //top level statements
                Y.each(JA.data.qa,function(qa){
                    if(qa.type==='G'){qaArr.push(qa);}
                });
                qaArr.sort(function(a,b){return a.seq-b.seq;});
                Y.each(qaArr,function(qa){
                    qaTopStatements+='<option value="'+qa.id+'">'+qa.name+'</option>';
                });
                h.qaSelect.append('<option>add...</option>'+qaTopStatements);
                h.qaSelect.set('selectedIndex',0);
        };

        io={
            fetch:{
                job:function(){
                    Y.JA.widget.busy.set('message','getting job...');
                    Y.io('/db/job/s.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.job},
                        data:Y.JSON.stringify([{
                            job:{
                            	criteria:{jobIds:[cfg.job]}
                            },
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            insert:{
                job:function(){
                    Y.JA.widget.busy.set('message','new job...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var rs=Y.JSON.parse(o.responseText)[0].job.record[0]
                            ;
                            cfg.job=rs.data.id;
                            io.fetch.job();
                        }},
                        data:Y.JSON.stringify([{
                            job:{record:[{
                                data:{
                                    appointment:cfg.appointment
                                }
                            }]},
                            usr:JA.user.usr
                        }])
                    });
                }
            },
            save:{
                job:function(){
                    var fAppointment=f.jobAppointment.get('value'),
                        fConfirmed  =f.jobConfirmed.get('value'),
                        fReminder   =f.jobReminder.get('value'),
                        qa={li:{},tag:[]}
                    ;
                    //html/values
                        h.qaList.all('li').each(function(li,idx){
                            //get html and strip yui ids
                            qa.li[idx]=li.get('innerHTML').replace(/( id="yui[^"]*")/g,'');
                            li.all('input,textarea,select').each(function(tag){
                                var nodeName=this.get('nodeName'),
                                    nodeType=this.get('type')
                                ;
                                if(!qa.tag[idx]){qa.tag[idx]=[];}
                                if(nodeType==='checkbox'){




                                    //>>>>>>>>>>FINISH need to save value and if checked
                                    qa.tag[idx].push(tag.get('checked'));






                                }else{
                                    qa.tag[idx].push(tag.get('value'));
                                }
                            });
                        });
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:io.fetch.job},
                        data:Y.JSON.stringify([{
                            job:{
                                record:[{
                                    data:{
                                        id         :parseInt(f.jobId.get('value'),10),
                                        address    :parseInt(f.jobAddress.get('value'),10),
                                        ref        :f.jobRef.get('value'),
                                        appointment:fAppointment===''
                                                        ?null
                                                        :moment(fAppointment,'DDMMMYY hh:mma').unix(),
                                        confirmed  :fConfirmed===''
                                                        ?null
                                                        :moment(fConfirmed,'DDMMMYY hh:mma').unix(),
                                        reminder   :fReminder===''
                                                        ?null
                                                        :moment(fReminder,'DDMMMYY hh:mma').unix(),
                                        weather    :f.jobWeather.get('value'),
                                        detail     :Y.JSON.stringify(qa)
                                    }
                                }]
                            }
                        }])
                    });
                },
                property:function(post,callback){
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:callback},
                        data:Y.JSON.stringify([{
                            property:post,
                            usr:JA.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            //tree
                h.tree.on('nodeclick',trigger.tree.nodeClick);
                //using treeNode to get contentBox fails
                h.tree.get('contentBox').delegate('click',function(){h.tvLabel=this;},'.yui3-treenode-label-content');
                h.propertyAction.on('click',trigger.tree.action);
            //all
                h.bd.delegate('click',pod.display.info,'.ja-info');
                h.hd.delegate('click',trigger.showHide,'.ja-eye');
                h.bd.delegate('click',trigger.showHide,'.ja-eye');
            //qa
                h.qaSelect.on('click',trigger.qa.add);
                h.qaList.delegate('click',trigger.qa.remove,'.ja-remove');
            //save
                h.save.on('click',io.save.job);
            //custom
                Y.on(JA.my.podInfo.customEvent.save,pod.result.info);
        };

        pod={
            display:{
                info:function(){
                    var config={
                            visible:true
                        },
                        section=this.ancestor('.ja-section')
                    ;
                    h.podInvoke=this;
                    if(section.hasClass('ja-section-statement')){
                        config.title     ='Answers';
                        config.categories=['General','Feedback','Clarify','Warning'];
                        config.dbTable   =JA.data.dbTable['answer'].id;
                    }
                    config.pk=parseInt(this.ancestor('li').one('.ja-data-id').get('value'),10);
                    JA.my.podInfo.display(config);
                }
            },
            load:{
            },
            result:{
                info:function(rs){
                    var cnt=rs.info.record.length,
                        li=h.podInvoke.ancestor('li'),
                        section=li.ancestor('.ja-section')
                    ;
                    //update note count
                        h.podInvoke.one('span').set('innerHTML',cnt===0?'':cnt);
                    //update count reference
                }
            }
        };

        populate={
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var addresses=d.rs.address.data,
                    tree=[],
                    qa,
                    buildTree=function(parent){
                        var branch={
                                label:'<!--'+parent.id+','+parent.prop+'-->'
                                    +JA.data.prop[parent.prop].name
                                    +(parent.detail!==null?' '+parent.detail:'')
                                    +'&nbsp; <small><small><span>2</span>,'
                                    +'<span>0</span></small></small>'
                            }
                        ;
                        Y.each(d.rs.property.data,function(p){
                            if(p.parent===parent.id){
                                if(!branch.children){branch.children=[];}
                                branch.children.push(buildTree(p));
                            }
                        });
                        return branch;
                    }
                ;
                trigger.reset();
                //only 1 job anyway
                Y.each(d.rs.job.data,function(job){
                    f.jobId.set('value',job.id);
                    f.jobRef.set('value',job.ref);
                    if(job.appointment!==null){
                        f.jobAppointment.set('value',moment.unix(job.appointment).format('DDMMMYY hh:mma'));
                    };
                    if(job.confirmed!==null){
                        f.jobConfirmed.set('value',moment.unix(job.confirmed).format('DDMMMYY hh:mma'));
                    }
                    if(job.reminder!==null){
                        f.jobReminder.set('value',moment.unix(job.reminder).format('DDMMMYY hh:mma'));
                    }
                    Y.JA.matchSelect(f.jobWeather,job.weather);
                    f.jobAddress.set('value',job.address);
                    f.jobAddressDetail.set('innerHTML',
                        addresses[job.address].streetRef+' '+
                        addresses[job.address].streetName+', '+
                        d.rs.location.data[addresses[job.address].location].full
                    );
                    //property tree
                        h.tree.remove(0);
                        tree=[];
                        Y.each(d.rs.property.data,function(property){
                            if(property.address===job.address && property.parent===null){
                                tree.push(buildTree(property));
                            }
                        });
                        h.tree.add(tree);
                    //qa
                        qa=Y.JSON.parse(job.detail);
                        h.qaList.set('innerHTML','');
                        //create statements and set values
                        Y.each(qa.li,function(li,liIdx){
                            var nn=Y.Node.create('<li>'+li+'</li>')
                            ;
                            h.qaList.append(nn);
                            nn.all('input,textarea,select').each(function(tag,tagIdx){
                                var nodeName=this.get('nodeName'),
                                    nodeType=this.get('type'),
                                    val=qa.tag[liIdx][tagIdx]
                                ;
                                if(nodeName==='INPUT'){
                                    if(nodeType==='checkbox'){tag.set('checked',val);}
                                    else {tag.set('value',val);}
                                }else if(nodeName==='TEXTAREA'){
                                    tag.set('innerHTML',val);
                                }else if(nodeName==='SELECT'){
                                    Y.JA.matchSelect(tag,val);
                                }
                            });
                        });
                });
                //sync display
//                    h.qaSection.one('legend a').simulate('click');
                Y.JA.widget.busy.set('message','');
                Y.fire(self.customEvent.save,'refresh');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                         '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JA">'+self.info.title+'</span> '
                        +' #<input type="text" class="ja-data ja-data-id" title="job number" disabled="disabled" />'
                        +'<input type="hidden" class="ja-data ja-data-address" />'
                        +' &nbsp; <span class="ja-display-address"></span> &nbsp; '
                        //display
                            +'<span class="ja-section ja-section-display">'
                            +    Y.JA.html('btn',{action:'eye',title:'change view',classes:'ja-eye-open ja-display-service',label:'services'})
                            +    ' &nbsp;'
                            +    Y.JA.html('btn',{action:'eye',title:'change view',classes:'ja-eye-open ja-display-details',label:'details'})
                            +  ']'
                            +'</span>'
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:
                        //job
                             'ref:<input type="text" class="ja-data ja-data-ref" title="old system reference" placeholder="ref#" />'
                            +'Appointment:<input type="text" class="ja-data ja-date ja-data-appointment" title="appointment date" placeholder="appointment" />'
                            +'&nbsp; Confirmed:<input type="text" class="ja-data ja-date ja-data-confirmed" title="confirmed date" placeholder="confirmed" />'
                            +'&nbsp; Reminder:<input type="text" class="ja-data ja-data-reminder ja-date" title="reminder date" placeholder="reminder" />'
                            +'<select class="ja-data ja-data-weather">'
                            +  '<option>fine</option>'
                            +  '<option>cloudy</option>'
                            +  '<option>wet</option>'
                            +  '<option>dark</option>'
                            +'</select>'
                            +Y.JA.html('btn',{action:'save',title:'save',label:'save'})
                        //services
                            +'<fieldset class="ja-list-service">'
                            +  '<legend>services</legend>'
                            +'</fieldset>'
                        +'<div class="ja-section-details">'
                        //property
                            +  '<fieldset class="ja-section ja-section-property">'
                            +    '<legend>'
                            +      '<div>select a property component</div>'
                            +      '<div>'
                            +        '<span></span> <select><select>'
                            +      '</div>'
                            +    '</legend>'
                            +  '</fieldset>'
                        //question/answers
                            +  '<fieldset class="ja-section ja-section-qa">'
                            +    '<legend>'
                            +      Y.JA.html('btn',{action:'eye',label:'statement&nbsp;',title:'change view',classes:'ja-eye-open'})
                            +      '<select></select>'
                            +      '<span></span>'
                            +    '</legend>'
                            +    '<ul></ul>'
                            +  '</fieldset>'
                        +'</div>',
                    width  :cfg.width,
                    visible:cfg.visible,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();

                h.hd              =h.ol.headerNode;
                h.bd              =h.ol.bodyNode;
                h.ft              =h.ol.footerNode;
                h.bb              =h.ol.get('boundingBox');

                h.close           =h.hd.one('.ja-close');

                f.jobId           =h.hd.one('.ja-data-id');
                f.jobAddress      =h.hd.one('.ja-data-address');
                f.jobAddressDetail=h.hd.one('.ja-display-address');

                f.jobRef          =h.bd.one('.ja-data-ref');
                f.jobAppointment  =h.bd.one('.ja-data-appointment');
                f.jobConfirmed    =h.bd.one('.ja-data-confirmed');
                f.jobReminder     =h.bd.one('.ja-data-reminder');
                f.jobWeather      =h.bd.one('.ja-data-weather');

                h.displayServices =h.bd.one('.ja-display-services');
                h.serviceList     =h.bd.one('.ja-list-service');

                h.detailsSection  =h.bd.one('.ja-section-details');

                h.propertySection =h.detailsSection.one('.ja-section-property');
                h.propertyFocusNo =h.propertySection.one('>legend>div');
                h.propertyFocusYes=h.propertySection.one('>legend>div:nth-child(2)');
                h.propertyPath    =h.propertyFocusYes.one('>span');
                h.propertyAction  =h.propertyFocusYes.one('>select');

                h.qaSection  =h.bd.one('.ja-section-qa');
                h.qaSelect   =h.qaSection.one('> legend > select');
                h.qaTreeLabel=h.qaSection.one('> legend > span');
                h.qaList     =h.qaSection.one('> ul');

                h.save       =h.bd.one('.ja-save');

                h.tree=new Y.TreeView({
                    startCollapsed:false,
                    render:h.propertySection
                });
            }
        };

        trigger={
            reset:function(){
                f.jobId           .set('value','');
                f.jobAddress      .set('value','');
                f.jobAddressDetail.set('innerHTML','');
                f.jobRef          .set('value','');
                f.jobAppointment  .set('value','');
                f.jobConfirmed    .set('value','');
                f.jobReminder     .set('value','');
                f.jobWeather      .set('value','');
                trigger.tree.nodeFocus(false);
            },
            showHide:function(){
                var section=this.ancestor('.ja-section'),
                    sectionList=section.one('ul')
                ;
                if(section.hasClass('ja-section-display')){
                    if(this.hasClass('ja-display-service')){
                        if(this.hasClass('ja-eye-open')){
                            this.replaceClass('ja-eye-open','ja-eye-closed');
                            h.serviceList.setStyle('display','none');
                        }else{
                            this.replaceClass('ja-eye-closed','ja-eye-open');
                            h.serviceList.setStyle('display','');
                        }
                    }else if(this.hasClass('ja-display-details')){
                        if(this.hasClass('ja-eye-open')){
                            this.replaceClass('ja-eye-open','ja-eye-closed');
                            h.detailsSection.setStyle('display','none');
                        }else{
                            this.replaceClass('ja-eye-closed','ja-eye-open');
                            h.detailsSection.setStyle('display','');
                        }
                    }
                }else if(section.hasClass('ja-section-statement')){
                    if(this.hasClass('ja-eye-open')){
                        this.replaceClass('ja-eye-open','ja-eye-squint');
                        sectionList.all('.ja-actions').setStyle('display','none');
                        section.setStyle('width','30em');
                    }else if(this.hasClass('ja-eye-squint')){
                        this.replaceClass('ja-eye-squint','ja-eye-closed');
                        sectionList.all('.ja-info').setStyle('display','none');
                        section.setStyle('width','26em');
                    }else{
                        this.replaceClass('ja-eye-closed','ja-eye-open');
                        section.setStyle('width','35em');
                        sectionList.all('.ja-actions,.ja-info').setStyle('display','');
                    }
                }
            },
            tree:{
                action:function(e){
                    var selectedIndex=this.get('selectedIndex'),
                        value=this.get('value'),
                        property,
                        propId,
                        newDetail=''
                    ;
                    if(selectedIndex===0){return;}
                    if(value==='remove'){
                        trigger.tree.nodeFocus(false);
                        io.save.property(
                            {remove:[trigger.tree.labelData().id]},
                            function(){h.tvNode.remove();}
                        );
                        return;
                    }
                    property=trigger.tree.labelData();
                    if(selectedIndex===1){
                        if(newDetail=prompt('enter new property part detail')){
                            io.save.property(
                                {record:[{
                                    data:{
                                        id    :property.id,
                                        detail:newDetail
                                    }
                                }]},
                                function(){
                                    h.tvNode.set('label','<!--'+property.id+','+property.prop+'-->'+JA.data.prop[property.prop].name+' '+newDetail);
                                    h.tvLabel.set('innerHTML','<!--'+property.id+','+property.prop+'-->'+JA.data.prop[property.prop].name+' '+newDetail);
                                    h.propertyPath.set('innerHTML',h.tvNode.path().join('/'));
                                }
                            );
                        }
                    }else{
                        propId=parseInt(value,10);
                        io.save.property(
                            {record:[{
                                data:{
                                    address:parseInt(f.jobAddress.get('value'),10),
                                    parent :trigger.tree.labelData().id,
                                    prop   :propId
                                }
                            }]},
                            function(id,o){
                                var rs=Y.JSON.parse(o.responseText)[0].property.record[0].data
                                ;
                                h.tvNode.add({
                                    label:'<!--'+rs.id+','+propId+'-->'+JA.data.prop[propId].name
                                });
                            }
                        );
                    }
                    this.set('selectedIndex',0);
                },
                labelData:function(){
                    var label=h.tvNode.get('label'),
                        data=label.substring(4,label.indexOf('-->')).split(',')
                    ;
                    return {
                        id  :parseInt(data[0],10),
                        prop:parseInt(data[1],10)
                    };
                },
                nodeClick:function(e){
                    h.tvNode=e.treenode;
                    var property=trigger.tree.labelData(),
                        propBranch,
                        propOptions=[],
                        path=h.tvNode.path()
                    ;
                    trigger.tree.nodeFocus(true);
                    h.propertyPath.set('innerHTML',path.join('/'));
                    h.qaTreeLabel.set('innerHTML',path[path.length-1]);
                    //build property action options
                        propBranch=trigger.traverse(JA.propStructure,property.prop);
                        for(var i in propBranch){
                            propOptions.push('<option value="'+i+'">'+JA.data.prop[i].name+'</option>');
                        };
                    h.propertyAction.set('innerHTML',
                        '<option>...</option>'+
                        '<option>set new detail</option>'+
                        (propOptions.length===0?'':'<optgroup label="create">'+propOptions.join('')+'</optgroup>')+
                        (h.tvNode.get('isLeaf')?'<optgroup label="remove"><option value="remove">proceed</option></optgroup>':'')
                        
                    );
                    //display qa
                    h.qaList.all('li').each(function(li){


                        //>>>>>>>>>>>>>>FINISH
                        
                    });
                    console.log(
                        "\nYou clicked "+h.tvNode.get("label")+(h.tvNode.get("isLeaf")?" (leaf)":" (node)")+
                        "\nIndex is: "+h.tvNode.get('index')+
                        "\nState is: "+(h.tvNode.get("collapsed") ? "collapsed" : "expanded")
                    );
                },
                nodeFocus:function(state){
                    if(state){
                        h.propertyFocusNo.setStyle('display','none');
                        h.propertyFocusYes.setStyle('display','');
                        h.qaSelect.setStyle('display','');
                        h.qaTreeLabel.setStyle('display','');
                    }else{
                        h.propertyFocusNo.setStyle('display','');
                        h.propertyFocusYes.setStyle('display','none');
                        h.qaSelect.setStyle('display','none');
                        h.qaTreeLabel.setStyle('display','none');
                    }
                }
            },
            qa:{
                add:function(){
                    var selectedIndex=this.get('selectedIndex'),
                        optionText=this.get('options').item(selectedIndex).get('text'),
                        value=this.get('value')
                    ;
                    if(selectedIndex===0){return;}

                    //add
                    h.qaList.append(
                        '<li>'+
                          '<input type="hidden" value="'+value+'"/>'+
                          JA.data.qa[value].code+' '+
                          Y.JA.html('btn',{action:'remove',title:'remove'})+
                        '</li>'
                    );
                    this.set('selectedIndex',0);
                },
                remove:function(){
                    //>>>>FINISH db
                    this.ancestor('li').remove();
                }
            },
            traverse:function(o,key){
                var obj
                ;
                for(var i in o){
                    if(parseInt(i,10)===key){return o[i];}
                    if(typeof(o[i])=='object'){
                        obj=trigger.traverse(o[i],key);
                        if(obj!==false){return obj;}
                    }
                }
                return false;
            }
        };
        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
            ['prop','id'],
            ['service','id'],
            ['tagOption','id']
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
