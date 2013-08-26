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
            visible :true,
            width   :1250,
            xy      :[10,20],
            zIndex  :99999
        },cfg);

        this.info={
            id         :'job',
            title      :cfg.title,
            description:'job details',
            version    :'v1.0 August 2013'
        };

        var self=this,
            d={
                defaultPurpose:'purpose...',
                qa:{
                    existing:'add to existing statement',
                    new:'add as a new statement'
                }
            },
            f={},h={},
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
            trigger.reset();
            h.ol.show();
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
                   +'<optgroup label="images">'
                   +  '<option>upload</option>'
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
                },
                jobUsr:function(usr){
                    Y.JA.widget.busy.set('message','new user job...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            var jobUsr=Y.JSON.parse(o.responseText)[0].jobUsr.record[0].data
                            ;
                            jobUsr.firstName=usr.firstName;
                            jobUsr.lastName =usr.lastName;
                            Y.JA.widget.busy.set('message','');
                            render.jobUsr(jobUsr);
                        }},
                        data:Y.JSON.stringify([{
                            jobUsr:{record:[{data:{
                                usr    :usr.id,
                                job    :parseInt(f.jobId.get('value'),10),
                                purpose:d.defaultPurpose
                            }}]},
                            user:JA.user.usr
                        }])
                    });
                },
                usr:function(){
                    Y.JA.widget.busy.set('message','new user...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            io.insert.jobUsr(Y.JSON.parse(o.responseText)[0].usr.record[0].data);
                        }},
                        data:Y.JSON.stringify([{
                            usr:{record:[{data:{
                                firstName:f.usrFirstName.get('value'),
                                lastName :f.usrLastName.get('value')
                            }}]},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            remove:{
                jobUsr:function(e){
                    var row=this.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','new user job...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(id,o){
                            row.remove();
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            jobUsr:{remove:[parseInt(row.one('.ja-data-jobUsr-id').get('value'),10)]},
                            user:JA.user.usr
                        }])
                    });
                }
            },
            save:{
                job:function(){
                    var fAppointment=f.jobAppointment.get('value'),
                        fConfirmed  =f.jobConfirmed.get('value'),
                        fReminder   =f.jobReminder.get('value'),
                        qa={}
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
                            user    :JA.user.usr
                        }])
                    });
                }
            },
            update:{
                jobUsr:function(){
                    var rec=this.ancestor('li')
                    ;
                    Y.JA.widget.busy.set('message','updating...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:function(){
                            Y.JA.widget.busy.set('message','');
                        }},
                        data:Y.JSON.stringify([{
                            jobUsr:{
                                record:[{
                                    data:{
                                        id     :parseInt(rec.one('.ja-data-jobUsr-id').get('value'),10),
                                        job    :parseInt(f.jobId.get('value'),10),
                                        usr    :parseInt(rec.one('.ja-data-jobUsr-usr').get('value'),10),
                                        purpose:rec.one('.ja-data-jobUsr-purpose').get('value')
                                    }
                                }]
                            },
                            user:JA.user.usr
                        }])
                    });
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){h.ol.hide();Y.JA.widget.dialogMask.hide();});
            //users
                h.usrAdd.on('click',io.insert.usr);
                h.usrFind.on('click',pod.display.usrFind);
                h.tvUsers.delegate('keyup',trigger.jobUsr.display,'.ja-data-usr-firstName,.ja-data-usr-lastName');
                h.tvUsers.delegate('change',io.update.jobUsr,'.ja-data-jobUsr-purpose');
                h.tvUsers.delegate('click',io.remove.jobUsr,'.ja-remove');
                h.jobUsrList.delegate('click',pod.display.usr,'span.ja-data-usr-name');
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

        pod={
            display:{
                usr:function(e){
                    e.halt();
                    h.podInvoke=e.currentTarget;
                    if(!self.my.usr){pod.load.usr({});return false;}
                    self.my.usr.display({
                        usr:parseInt(e.currentTarget.ancestor('li').one('.ja-data-jobUsr-usr').get('value'),10)
                    });
                },
                usrFind:function(e){
                    e.halt();
                    h.podInvoke=e.currentTarget;
                    if(!self.my.podUsrFind){pod.load.usrFind({});return false;}
                    self.my.podUsrFind.display({
                        firstName:f.usrFirstName.get('value'),
                        lastName :f.usrLastName.get('value')
                    });
                }
            },
            load:{
                usr:function(p){
                    Y.use('ja-pod-usr',function(Y){
                        self.my.usr=new Y.JA.pod.usr(p);
                        //listeners
                        Y.JA.whenAvailable.inDOM(self,'my.usr',function(){
                            self.my.usr.set('zIndex',h.ol.get('zIndex')+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.usr.customEvent.close,function(usr){
                            h.podInvoke.set('innerHTML',usr.title+' '+usr.firstName+' '+usr.lastName);
                        });
                    });
                },
                usrFind:function(p){
                    Y.use('ja-pod-usrFind',function(Y){
                        self.my.podUsrFind=new Y.JA.pod.usrFind(p);
                        Y.JA.whenAvailable.inDOM(self,'my.podUsrFind',function(){
                            this.my.podUsrFind.set('zIndex',h.ol.get('zIndex')+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.podUsrFind.customEvent.returnSelection,io.insert.jobUsr);
                    });
                }
            }
        };

        populate={
            job:function(id,o){
                d.rs=Y.JSON.parse(o.responseText)[0].result;
                var job=Y.JA.firstRecord(d.rs.job.data), //only 1 job anyway
                    jobDetail=(job.detail!=='' && job.detail!==null?Y.JSON.parse(job.detail):false)
                ;
                d.propertyQaCount={};
                trigger.reset();
                f.jobId.set('value',job.id);
                f.jobRef.set('value',job.ref);
                if(job.appointment!==null){
                    f.jobAppointment.set('value',moment.unix(job.appointment).format('DDMMMYY hh:mma'));
                }
                if(job.confirmed!==null){
                    f.jobConfirmed.set('value',moment.unix(job.confirmed).format('DDMMMYY hh:mma'));
                }
                if(job.reminder!==null){
                    f.jobReminder.set('value',moment.unix(job.reminder).format('DDMMMYY hh:mma'));
                }
                Y.JA.matchSelect(f.jobWeather,job.weather);
                f.jobAddress.set('value',job.address);
                f.jobAddressDetail.set('innerHTML',
                    d.rs.jobAddress.data[job.address].streetRef+' '+
                    d.rs.jobAddress.data[job.address].streetName+', '+
                    d.rs.jobAddressLocation.data[d.rs.jobAddress.data[job.address].location].full
                );
                //users
                    Y.each(d.rs.jobUsr.data,function(jobUsr,idx){
                        jobUsr.firstName=d.rs.usr.data[jobUsr.usr].firstName;
                        jobUsr.lastName =d.rs.usr.data[jobUsr.usr].lastName;
                        render.jobUsr(jobUsr);
                    });
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
                        +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:Y.JA.html('btn',{action:'save',title:'save',label:'save'}),
                    width  :cfg.width,
                    visible:cfg.visible,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).render();

                h.tv=new Y.TabView({
                    children:[
                        {
                            label:'Job',
                            content:
                                '<span>ref:</span><input type="text" class="ja-data ja-data-ref" title="old system reference" placeholder="ref#" /><br/>'
                                +'<span>Appointment:</span><input type="text" class="ja-data ja-date ja-data-appointment" title="appointment date" placeholder="appointment" /><br/>'
                                +'<span>Confirmed:</span><input type="text" class="ja-data ja-date ja-data-confirmed" title="confirmed date" placeholder="confirmed" /><br/>'
                                +'<span>Reminder:</span><input type="text" class="ja-data ja-data-reminder ja-date" title="reminder date" placeholder="reminder" /><br/>'
                                +'<span>Weather:</span><select class="ja-data ja-data-weather">'
                                +  '<option>fine</option>'
                                +  '<option>cloudy</option>'
                                +  '<option>wet</option>'
                                +  '<option>dark</option>'
                                +'</select>'
                        },
                        {
                            label:'Users',
                            content:
                                '<input type="text" class="ja-data-usr-firstName" placeholder="first name"/>'
                               +'<input type="text" class="ja-data-usr-lastName" placeholder="family name"/>'
                               +Y.JA.html('btn',{action:'find',title:'find user'})
                               +Y.JA.html('btn',{action:'add',title:'create user'})
                               +'<ul class="ja-list ja-list-jobUsr"></ul>'
                        },
                        {
                            label:'Services',
                            content:
                                '<ul>'
                               +'services, price'
                               +'</ul>'
                        },
                        {
                            label:'Property',
                            content:
                                 '<fieldset class="ja-section ja-section-property">'
                                +  '<legend>'
                                +    '<div>select a property component</div>'
                                +    '<div>'
                                +      '<span></span> <select><select>'
                                +    '</div>'
                                +  '</legend>'
                                +'</fieldset>'
                                +'<fieldset class="ja-section ja-section-qa">'
                                +  '<legend>'
                                +    'Statements'
                                +    '<select></select>'
                                +    '<span></span>'
                                +  '</legend>'
                                +  '<ul></ul>'
                                +'</fieldset>'
                        }
                    ]
                }).render(h.ol.bodyNode);
                
                h.hd              =h.ol.headerNode;
                h.bd              =h.ol.bodyNode;
                h.ft              =h.ol.footerNode;
                h.bb              =h.ol.get('boundingBox');

                h.close           =h.hd.one('.ja-close');

                f.jobId           =h.hd.one('.ja-data-id');
                f.jobAddress      =h.hd.one('.ja-data-address');
                f.jobAddressDetail=h.hd.one('.ja-display-address');

                h.tvJob           =h.tv.item(0).get('panelNode');
                h.tvUsers         =h.tv.item(1).get('panelNode');
                h.tvServices      =h.tv.item(2).get('panelNode');
                h.tvProperty      =h.tv.item(3).get('panelNode');
                h.tvJob           .addClass('ja-panel-job');
                h.tvUsers         .addClass('ja-panel-users');
                h.tvServices      .addClass('ja-panel-services');
                h.tvProperty      .addClass('ja-panel-property');

                f.jobRef          =h.tvJob.one('.ja-data-ref');
                f.jobAppointment  =h.tvJob.one('.ja-data-appointment');
                f.jobConfirmed    =h.tvJob.one('.ja-data-confirmed');
                f.jobReminder     =h.tvJob.one('.ja-data-reminder');
                f.jobWeather      =h.tvJob.one('.ja-data-weather');

                f.usrFirstName    =h.tvUsers.one('.ja-data-usr-firstName');
                f.usrLastName     =h.tvUsers.one('.ja-data-usr-lastName');
                h.usrFind         =h.tvUsers.one('.ja-find');
                h.usrAdd          =h.tvUsers.one('.ja-add');
                h.jobUsrList      =h.tvUsers.one('ul');

                h.propertySection =h.tvProperty.one('.ja-section-property');
                h.propertyFocusNo =h.propertySection.one('>legend>div');
                h.propertyFocusYes=h.propertySection.one('>legend>div:nth-child(2)');
                h.propertyPath    =h.propertyFocusYes.one('>span');
                h.propertyAction  =h.propertyFocusYes.one('>select');

                h.qaSection  =h.tvProperty.one('.ja-section-qa');
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
            jobUsr:function(o){
                var nn=Y.Node.create(
                     '<li>'
                    +  '<input type="hidden" class="ja-data ja-data-jobUsr-id" value="'+o.id+'" />'
                    +  '<input type="hidden" class="ja-data ja-data-jobUsr-usr" value="'+o.usr+'" />'
                    +  '<span class="ja-data-usr-name" title="edit user">'+o.firstName+' '+o.lastName+'</span>'
                    +  '<select class="ja-data ja-data-jobUsr-purpose">'
                    +    '<option>'+d.defaultPurpose+'</option>'
                    +    '<option>Owner</option>'
                    +    '<option>Inspector</option>'
                    +    '<option>Tenant/Occupier</option>'
                    +    '<option>Agent</option>'
                    +    '<option>Other</option>'
                    +  '</select>'
                    +  Y.JA.html('btn',{action:'remove',title:'remove user'})
                    +'</li>'
                );
                h.jobUsrList.append(nn);
                Y.JA.matchSelect(nn.one('.ja-data-jobUsr-purpose'),o.purpose);
                f.usrFirstName.set('value','');
                f.usrLastName.set('value','');
                trigger.jobUsr.display();
                return nn;
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
                h.jobUsrList.set('innerHTML','');
                trigger.jobUsr.display();
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
                    }else if(selectedIndex===2){
                        alert('upload file coming...');
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
                        prop=JA.data.prop[property.prop],
                        childReal='',
                        childMeta='',
                        path=e.treenode.path()
                    ;
                    trigger.tree.nodeFocus(true);
                    h.propertyPath.set('innerHTML',path.join('/').replace(/(<span style.*?<\/span>)/g,''));
                    h.qaTreeLabel.set('innerHTML',path[path.length-1].replace(/(<span style.*?<\/span>)/g,''));
                    d.qaCount=0;
                    //build property action options
                        //real
                            Y.each(prop.children.real,function(propId){
                                childReal+='<option value="'+propId+'">'+JA.data.prop[propId].name+'</option>';
                            });
                            if(childReal!==''){childReal='<optgroup label="create">'+childReal+'</optgroup>';}
                        //meta
                            Y.each(prop.types,function(propTypeId){
                                var p=JA.data.prop[propTypeId],
                                    metaStr='',
                                    realStr=''
                                ;
                                //real
                                    Y.each(p.children.real,function(propId){
                                        realStr+='<option value="'+propId+'">'+JA.data.prop[propId].name+'</option>';
                                    });
                                    if(realStr!==''){
                                        childReal+='<optgroup label="'+p.name+'">'+realStr+'</optgroup>';
                                    }
                                //meta
                                    Y.each(p.children.meta,function(metaPropId){
                                        Y.each(JA.data.prop,function(pt){
                                            //props contains types
                                            if(!pt.meta && (Y.Array.indexOf(pt.types,metaPropId)!==-1 || pt.id===metaPropId)){
                                                metaStr+='<option value="'+pt.id+'">'+JA.data.prop[pt.id].name+'</option>';
                                            }
                                        });
                                    });
                                    if(metaStr!==''){
                                        childMeta+='<optgroup label="'+p.name+'">'+metaStr+'</optgroup>';
                                    }
                            });
                    h.propertyAction.set('innerHTML',
                        '<option>...</option>'+
                        '<option>set new detail</option>'+
                        childReal+
                        childMeta+
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
            },
            jobUsr:{
                display:function(){
                    h.usrAdd.setStyle('display',f.usrFirstName.get('value')===''||f.usrLastName.get('value')===''?'none':'');
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
