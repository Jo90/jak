/** //js/common.js
 *
 *
 */
YUI.add('jak-common',function(Y){

    Y.namespace('JAK');

    Y.JAK.checkEmail=function(email){
        var filter=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
        return filter.test(email);
    };

    Y.JAK.dataSet={ //table, pk field, field
        fetch:function(dataSets,callback){
            var i=dataSets.length
               ,missing=[]
               ,missingDatasets=[]
            ;
            while(i--){
                if(!JAK.data[dataSets[i][0]]){
                    missing.push(dataSets[i][0]);
                    missingDatasets.push(dataSets[i]);
                }
            }
            if(missing.length>0){
                Y.io('/inc/getDataSets.php',{
                    method:'POST'
                   ,on:{
                        complete:function(id,o){
                            Y.JAK.dataSet.reformat(Y.JSON.parse(o.responseText),missingDatasets);
                            callback();
                        }
                    }
                   ,data:'d[]='+missing.join('&d[]=')
                });
            }else{
                callback();
            }
        }
        /**
         *  convert resultSets.dataSet.data,meta to JAK.data.dataSet and JAK.meta.dataSet
         *  arg[0] = result.dataSet.data and result.dataSet.meta
         *  args[1] = primary key field name i.e. 'id'
         *  args[2] = return type i.e. 'object'(default), 'array', 'raw'
         *  args[3] = alternative dataSet name
         */
       ,reformat:function(rs,dataSets){
            var c
               ,dsName,dsPK,dsPKvalue,dsRecordType='object'
               ,i=dataSets.length
               ,newRec
               ,rsDS //result data set
            ;
            if(!JAK.data){JAK.data={};};
            if(!JAK.meta){JAK.meta={};};
            //critera
            while(i--){
                dsName=dataSets[i][3] || dataSets[i][0];
                dsPK=dataSets[i][1] || '';
                dsRecordType=dataSets[i][2] || 'object';
                rsDS=rs[dataSets[i][0]];
                if(rsDS){
                    if(rsDS.meta){JAK.meta[dsName]=rsDS.meta;}
                    //if pk then object else array
                    JAK.data[dsName]=dsPK===''?[]:{};
                    //data
                    if(typeof rsDS.meta==='undefined'
                        || dsPK===''
                        || dsRecordType==='raw'){
                        JAK.data[dsName]=rsDS.data;
                    }else{
                        newRec=dsRecordType==='object'?{}:[];
                        Y.each(rsDS.data,function(n){
                            c=0;
                            Y.each(rsDS.meta,function(m){
                                if(dsPK&&dsPK===m.name){dsPKvalue=n[c];}
                                dsRecordType==='object'
                                    ?newRec[m.name]=n[c]
                                    :newRec.push(n[c]);
                                c++;
                            });
                            dsPK===''
                                ?JAK.data[dsName].push(Y.clone(newRec,true))
                                :JAK.data[dsName][dsPKvalue]=Y.clone(newRec,true);
                        });
                    }
                }
            }
        }
    };

    Y.JAK.date={
        toUTC:function(d){
            return d===''
                ?null
                :Y.Date.parse(d).getTime()/1000;
        }
    };

    Y.JAK.firstRecord=function(o){
        for(r in o){if(o.hasOwnProperty(r)){return o[r];}}
    };

    Y.JAK.html=function(template,tags,inc){
        var self=this
           ,tpl=this.html['TEMPLATE'][template]
           ,html=''
           ,obj={}
           ,fnIncludeSnippets=function(n){
                if(self.html['SNIPPET'][n]){
                    obj[n]=self.html['SNIPPET'][n];
                }
            }
           ,tagProperty
           ,fnDefaults=function(n){
                var x;
                for(tagProperty in tags){if(tags.hasOwnProperty(tagProperty)){
                    if(n._id===tagProperty && n[tags[tagProperty]]){
                        html=Y.Lang.sub(html,n[tags[tagProperty]]);
                    }
                }}
            }
        ;
        if(!tpl){return '<em>template not found</em>';}
        //tags
            html=Y.Lang.sub(tpl,tags);
        //includes
            if(inc){
                Y.each(inc,fnIncludeSnippets);
                html=Y.Lang.sub(html,obj);
            }
        //defaults
            Y.each(this.html['DEFAULT'],fnDefaults);
        //clear
            html=Y.Lang.sub(html,this.html['TAG']);
        return html;
    };
    Y.JAK.html['TEMPLATE']={
        'button'            :'{prefix}<a class="button jak-{action} {classes} {showOnFocus}" name="{name}" title="{title}"><span>{label}</span></a>{suffix}'
       ,'jak-icon'           :'{prefix}<span class="jak-icon jak-{action} {classes} {showOnFocus}" title="{title}"><em></em><span>{label}</span></span>{suffix}'
       ,'btn'               :'{prefix}<a class="jak-btn jak-{action} {classes} {showOnFocus}" title="{title}"><em></em><span>{label}</span><span class="jak-flag">{flag}</span></a>{suffix}'
       ,'btn-tag'           :'{prefix}<a class="button {classes} {showOnFocus}" title="{title}"><em></em><span>{label}</span><span class="jak-flag">{flag}</span></a>{suffix}'
       ,'btn-gen'           :'{prefix}<a class="jak-btn-gen jak-{action} {classes} {showOnFocus}" title="{title}"><em></em><span>{label}</span></a>{suffix}'
       ,'btn-toggleShowHide':'<a class="jak-btn-gen jak-toggleShowHide {show}" title="show/hide"><em></em></a>'
       ,'switch'            :'<label class="{classes}" title="{title}">{prefix}<input type="checkbox" checked="{checked}" value="{value}">{label}{suffix}</label>'
       ,'toggleCheckbox'    :'<label><input type="checkbox" class="jak-toggleChecked" checked="{value}" title="check/uncheck" />{label}</label>'
       ,'selectCheckbox'    :'<label><input type="checkbox" class="{classes}"  title="check/uncheck" />{label}</label>'
       ,'radio'             :'<label><input type="radio" name="{name}" class="{classes}"  title="select" />{label}</label>'
       ,'removeCheckbox'    :'<label><input type="checkbox" class="jak-remove" />remove</label>'
       ,'textIcon'          :'<label class="jak-text jak-{icon}"><em></em><span>{text}</span></label>'
    };
    //device dependant
        //phone overrides
        if(JAK.env.device==='phone'){
            //>>>>>>>>>>>>>>>FINISH what html to use for phone alternative to checkbox?
            Y.JAK.html['TEMPLATE']['switch']='<label><input type="text" value="{value}">{label}</label>';
            Y.JAK.html['TEMPLATE']['toggleCheckbox']='<!--sort this out-->';
        }
    Y.JAK.html['SNIPPET']={
        'showOnFocus' :'hide on-record-hover-show on-record-focus-show'
    };
    //i.e. for action==='add' set missing label and title
    Y.JAK.html['DEFAULT']=[
        {
            _id   :'action'
           ,add   :{label:'',title:'add record'}
           ,close :{label:'',title:'close'}
           ,find  :{label:'',title:'find/search'}
           ,remove:{label:'',title:'remove record'}
           ,reset :{label:'reset',title:'reset the form'}
           ,save  :{label:'save',title:'save data'}
        }
    ];
    Y.JAK.html['TAG']={action:'',checked:'',classes:'',flag:'',label:'',prefix:'',show:'',showOnFocus:'',suffix:'',title:'',value:''};

    Y.JAK.matchSelect=function(node,value){
        var isNumber=Y.Lang.isNumber(value),
            val,
            fn=function(n){
                val=isNumber
                    ?parseFloat(n.get('value'))
                    :n.get('value');
                if(val===value){node.set('selectedIndex',n.get('index'));}
            }
        ;
        node.all('option').each(fn);
    };

    //return string position and tag name for determining order for processing html tags
    //remove "<" from search string tag
    Y.JAK.mergeIndicesOf=function(searchArr,str){
        var arr=[]
        ;
        str=str.toLowerCase();
        Y.each(searchArr,function(searchStr){
            var startIndex=0,
                searchStrLen=searchStr.length,
                index,
                tag
            ;
            searchStr=searchStr.toLowerCase();
            tag=searchStr.substr(1);
            while((index=str.indexOf(searchStr,startIndex))>-1){
                arr.push([index,tag]);
                startIndex=index+searchStrLen;
            }
        });
        //ensure indice order
        return arr.sort(function(a,b){return a[0]-b[0];});
    };

    Y.JAK.removeOption=function(node){
        node.one('.jak-remove').remove();
        node.append(Y.JAK.html('removeCheckbox'));
    };

    Y.JAK.whenAvailable={
        timer:null
       ,listener:function(){
            var q=Y.JAK.whenAvailable.queue
               ,i=q.length-1
               ,defined
               ,objStem
               ,now=new Date()
            ;
            for(;i>=0;i--){
                //sentry, timed out?
                    if(q[i].submitted.getTime()<(now.getTime()-10000)){
                        //remove and alert
                            alert('waiting for '+q[i].objBranch+' has timed out (10sec)');
                            q.splice(i,1);
                        continue;
                    }
                //init for record
                    objStem=q[i].objBase;
                    defined=true;
                //each branch defined?
                    Y.each(q[i].objBranch.split('.'),function(n){
                        //stem exists
                            if(typeof objStem[n]!=='undefined'){
                                objStem=objStem[n];
                            }else{
                                defined=false;
                            }
                    });
                if(defined){
                    //callback
                        q[i].callback.apply(q[i].objBase,q[i].args);
                    //remove
                        q.splice(i,1);
                }
            }
            //if empty stop
                if(q.length===0){
                    clearInterval(Y.JAK.whenAvailable.timer);
                    Y.JAK.whenAvailable.timer=null;
                }
        }
       ,queue:[] //{objBranch:'WB.pod.something',callback:function,objBase:objBase}
       ,status:function(){
            alert(Y.JAK.whenAvailable.queue.toString());
        }
       ,inDOM:function(objBase,objBranch,callback,args){ //str,fn,obj,obj
            //push to queue
            Y.JAK.whenAvailable.queue.push({
                objBranch:objBranch
               ,callback:callback
               ,objBase:objBase
               ,submitted:new Date()
               ,args:args
            });
            //kickoff listener
            if(Y.JAK.whenAvailable.timer===null){
                Y.JAK.whenAvailable.timer=setInterval(Y.JAK.whenAvailable.listener,200); //every 0.2 sec
            }
        }
    };

},'1.0 March 2013',{requires:['base','node']});
