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
            d={
                qa:{
                    existing:'add to existing statement',
                    new:'add as a new statement'
                }
            },
            f={},h={},
            initialise,
            io={},
            listeners,
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
                    if(qa.prop===null){qaArr.push(qa);}
                });
                qaArr.sort(function(a,b){return a.seq-b.seq;});
                Y.each(qaArr,function(qa){
                    qaTopStatements+='<option value="'+qa.id+'">'+qa.name+'</option>';
                });
                h.qaSelect.set('innerHTML',
                    '<option>'+d.qa.new+'</option>'
                   +'<option>'+d.qa.existing+'</option>'
                   +'<optgroup label="top level issues">'
                   +  qaTopStatements
                   +'</optgroup>'
                ).set('selectedIndex',0);
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
                            job:{criteria:{jobIds:[cfg.job]}},
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
                            cfg.job=Y.JSON.parse(o.responseText)[0].job.record[0].data.id;
                            io.fetch.job();
                        }},
                        data:Y.JSON.stringify([{
                            job:{record:[{data:{appointment:cfg.appointment}}]},
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
                        qa={
                            tree:d.tree
                        }
                    ;
                    //html/values
                        h.qaList.all('li').each(function(li){
                            var statements=[],
                                propertyId=parseInt(li.getAttribute('data-qa-propertyId'),10)
                            ;
                            //get html and strip yui ids
                            li.all('span.ja-qa-snippet').each(function(snippetNode){
                                var snippet={
                                        qa    :parseInt(snippetNode.getAttribute('data-qa-id'),10),
                                        values:[]
                                    }
                                ;
                                snippetNode.all('input,textarea,select').each(function(n){
                                    if(n.get('type')==='checkbox'){
                                        //>>>>>>>>>>FINISH need to save value and if checked
                                        snippet.values.push([n.getAttribute('data-ref'),[n.get('value'),n.get('checked')]]);
                                    }else{
                                        snippet.values.push([n.getAttribute('data-ref'),n.get('value')]);
                                    }
                                });
                                statements.push(snippet);
                            });
                            if(!qa[propertyId]){qa[propertyId]=[];}
                            qa[propertyId].push(statements);
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
                h.ol.get('contentBox').delegate('click',trigger.showHide,'.ja-eye');
            //qa
                h.qaSelect.on('change',trigger.qa.add);
                h.qaList.delegate('click',trigger.qa.remove,'.ja-remove');
                h.qaList.delegate('click',function(){h.qaListRec=this;},'>li');
            //save
                h.save.on('click',io.save.job);
        };

        populate={
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var addresses=d.rs.address.data,
                    job=Y.JA.firstRecord(d.rs.job.data), //only 1 job anyway
                    jobDetail=(job.detail!=='' && job.detail!==null?Y.JSON.parse(job.detail):false)
                ;
                d.propertyQaCount={};
                trigger.reset();
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
                //qa stats
                    if(Y.Lang.isObject(jobDetail)){
                        Y.each(jobDetail,function(property,idx){
                            var propertyId=parseInt(idx,10)
                            ;
                            d.propertyQaCount[propertyId]=0;
                            Y.each(property,function(statement){
                                d.propertyQaCount[propertyId]++;
                            });
                        });
                    }
                //property tree
                    h.tree.remove(0);
                    d.tree=[];
                    Y.each(d.rs.property.data,function(property){
                        if(property.address===job.address && property.parent===null){
                            d.tree.push(Y.JA.lib.job.buildTree(property,d));
                        }
                    });
                    h.tree.add(d.tree);
                //statements
                    h.qaList.set('innerHTML','');
                //create statements and set values
                    if(Y.Lang.isObject(jobDetail)){
                        Y.each(jobDetail,function(property,idx){
                            //filter tree definition
                                if(idx==='tree'){return;}
                            var propertyId=parseInt(idx,10)
                            ;
                            Y.each(property,function(statement){
                                var li=render.qaStatement(propertyId)
                                ;
                                h.qaList.append(li);
                                li.setStyle('display','none');
                                Y.each(statement,function(snippet){
                                    var html=render.qaSnippet(JA.data.qa[snippet.qa].code,snippet.qa)
                                    ;
                                    li.append(html);
                                    html.all('input,textarea,select').each(function(tag,tagIdx){
                                        var nodeName=this.get('nodeName'),
                                            nodeType=this.get('type'),
                                            val=snippet.values[tagIdx][1]
                                        ;
                                        if(nodeName==='INPUT'){
                                            if(nodeType==='checkbox'){tag.set('checked',val[1]);}
                                            else {tag.set('value',val);}
                                        }else if(nodeName==='TEXTAREA'){
                                            tag.set('innerHTML',val);
                                        }else if(nodeName==='SELECT'){
                                            Y.JA.matchSelect(tag,val);
                                        }
                                    });
                                });
                            });
                        });
                    }
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
                            +      'Statements'
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
                }).render();

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
                    toggleOnLabelClick:false,
                    render:h.propertySection
                });
            },
            qaStatement:function(propertyId){
                return Y.Node.create('<li data-qa-propertyId="'+propertyId+'"></li>');
            },
            qaSnippet:function(html,qa){
                var nn=Y.Node.create(
                    '<span class="ja-qa-snippet" data-qa-id="'+qa+'">'
                   +  html
                   +  Y.JA.html('btn',{action:'remove',title:'remove'})
                   +'</span>'
                );
                return nn;
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
            qa:{
                add:function(){
                    var selectedIndex=this.get('selectedIndex'),
                        property=Y.JSON.parse(h.tvNode.get('nodeId')),
                        value=parseInt(this.get('value'),10),
                        opts=this.get('options'),
                        opt0=opts.item(0),
                        opt1=opts.item(1),
                        opt0Text=opt0.get('text'),
                        newStatement=opt0Text===d.qa.new,
                        nnStatement,
                        nnSnippet,
                        ruleType,
                        tvPathPropArr=[]
                    ;
                    if(selectedIndex===1){
                        if(newStatement){
                            opt0.set('text',d.qa.existing);
                            opt1.set('text',d.qa.new);
                        }else{
                            opt0.set('text',d.qa.new);
                            opt1.set('text',d.qa.existing);
                        }
                    }else{
                        if(newStatement || d.qaCount===0){
                            nnStatement=render.qaStatement(property.id);
                            d.qaCount++;
                            //create statement and top level qa snippet
                                h.qaList.append(nnStatement);
                                nnStatement.simulate('click');
                                nnSnippet=render.qaSnippet(JA.data.qa[value].code,value);
                                h.qaListRec.append(nnSnippet);
                            //prop hierarchy parent to root
                                Y.each(h.tvNode.path(),function(label){
                                    label=label.substring(label.indexOf(',')+1);
                                    tvPathPropArr.push(parseInt(label.substr(0,label.indexOf('-')),10));
                                });
                                tvPathPropArr.pop();
                            //additional rules
                                Y.each(JA.data.qa,function(qa){
                                    var rules={P:[],Q:[]},
                                        componentCode=false,
                                        ruleCode=false,
                                        ok=true
                                    ;
                                    if(qa.prop===property.prop){
                                        if(qa.rule===null){
                                            componentCode=render.qaSnippet(qa.code,qa.id);
                                        }else{
                                            //rules
                                            Y.each(qa.rule.split(','),function(rule){
                                                rules[rule.substr(0,1)].push(parseInt(rule.substr(1),10));
                                            });
                                            //prop ancestor
                                                if(rules['P'].length>0){
                                                    Y.each(rules['P'],function(propId){
                                                        if(Y.Array.indexOf(tvPathPropArr,propId)===-1){ok=false;}
                                                    });
                                                }
                                            //qa ancestor
                                                if(rules['Q'].length>0 && ok){
                                                    Y.each(rules['Q'],function(qaId){
                                                        if(qaId!==value){ok=false;}
                                                    });
                                                }
                                            if(ok){ruleCode=render.qaSnippet(qa.code,qa.id);}
                                        }
                                    }
                                    if(componentCode!==false){h.qaListRec.append(componentCode);}
                                    if(ruleCode     !==false){h.qaListRec.append(ruleCode);}
                                });
                        }else{
                            //add to existing statement
                                nnSnippet=render.qaSnippet(JA.data.qa[value].code,value);
                                h.qaListRec.append(nnSnippet);
                        }
                    }
                    this.set('selectedIndex',0);
                },
                remove:function(){
                    var snippet =this.ancestor('span.ja-qa-snippet'),
                        li      =this.ancestor('li')
                    ;
                    if(li.all('span.ja-qa-snippet').size()>1){
                        snippet.remove();
                    }else{
                        li.remove();
                        d.qaCount--;
                    }
                }
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
                }
            },
            tree:{
                action:function(e){
                    var selectedIndex=this.get('selectedIndex'),
                        value=this.get('value'),
                        property=Y.JSON.parse(h.tvNode.get('nodeId')),
                        propId,
                        newDetail=''
                    ;
                    if(selectedIndex===0){return;}
                    if(value==='remove'){
                        trigger.tree.nodeFocus(false);
                        io.save.property(
                            {remove:[Y.JSON.parse(h.tvNode.get('nodeId')).id]},
                            function(){
                                h.tvNode.remove();
                            }
                        );
                        return;
                    }else
                    if(selectedIndex===1){
                        if(newDetail=prompt('enter new property part detail')){
                            property.detail=newDetail;
                            io.save.property(
                                {record:[{data:property}]},
                                function(){
                                    h.tvNode.set('label',JA.data.prop[property.prop].name+' '+newDetail);
                                    h.tvNode.set('nodeId',Y.JSON.stringify(property));
                                    h.tvLabel.set('innerHTML',JA.data.prop[property.prop].name+' '+newDetail);
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
                                    parent :Y.JSON.parse(h.tvNode.get('nodeId')).id,
                                    prop   :propId
                                }
                            }]},
                            function(id,o){
                                h.tvNode.add({
                                    label :JA.data.prop[propId].name,
                                    nodeId:Y.JSON.stringify(Y.JSON.parse(o.responseText)[0].property.record[0].data)
                                });
                            }
                        );
                    }
                    this.set('selectedIndex',0);
                },
                nodeClick:function(e){
                    h.tvNode=e.treenode;
                    var property=Y.JSON.parse(h.tvNode.get('nodeId')),
                        propBranch,
                        propOptions=[],
                        path=e.treenode.path()
                    ;
                    trigger.tree.nodeFocus(true);
                    h.propertyPath.set('innerHTML',path.join('/').replace(/(<span style.*?<\/span>)/g,''));
                    h.qaTreeLabel.set('innerHTML',path[path.length-1].replace(/(<span style.*?<\/span>)/g,''));
                    d.qaCount=0;
                    //build property action options
                        propBranch=Y.JA.lib.job.traverse(JA.propStructure,property.prop);
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
                            if(parseInt(li.getAttribute('data-qa-propertyId'),10)===property.id){
                                li.setStyle('display','');
                                d.qaCount++;
                            }else{
                                li.setStyle('display','none');
                            }
                        });
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
