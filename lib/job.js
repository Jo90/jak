/** //lib/job.js
 *
 */
YUI.add('ja-lib-job',function(Y){

    Y.namespace('JA.lib').job={

        buildTree:function(parent,data){
            var branch={
                    label:JA.data.prop[parent.prop].name
                       +(parent.detail!==null?' '+parent.detail:'')
                       +'&nbsp; <span style="font-size:0.7em">'
                       +  (typeof data.propertyQaCount[parent.id]!=='undefined' && data.propertyQaCount[parent.id]>0?data.propertyQaCount[parent.id]:'')
                       +'</span>',
                    nodeId:Y.JSON.stringify(parent)
                 }
             ;
             Y.each(data.rs.property.data,function(property){
                 if(property.parent===parent.id){
                     if(!branch.children){branch.children=[];}
                     branch.children.push(Y.JA.lib.job.buildTree(property,data));
                 }
             });
             return branch;
        },

        detail:function(jobDetail){
            var ref={}
            ;
            Y.each(jobDetail,function(property,propertyId){
                Y.each(property,function(statement,statementIdx){
                    Y.each(statement,function(snippet,snippetIdx){
                        Y.each(snippet.values,function(value,valueIdx){
                            if(value[0]!==''){
                                if(!ref[value[0]]){ref[value[0]]=[];}
                                ref[value[0]].push({
                                    value:value[1],
                                    qa   :snippet.qa,
                                    path :[parseInt(propertyId,10),statementIdx,snippetIdx,valueIdx]
                                });
                            }
                        });
                    });
                });
            });
            return ref;
        },

        ancestry:function(propertyData,propertyId){
            var info={
                    property      :[],
                    propertyDetail:[],
                    prop          :[],
                    propName      :[]
                }
            ;
            Y.each(propertyData,function(property){
                if(property.id===propertyId){
                    if(typeof property.ancestry!=='undefined'){
                        Y.each(property.ancestry,function(ancestor){
                            info.property.unshift(ancestor[0]);
                            info.propertyDetail.unshift(propertyData[ancestor[0]].detail);
                            info.prop.unshift(propertyData[ancestor[1]]);
                            info.propName.unshift(JA.data.prop[ancestor[1]].name);
                        });
                    }
                }
            });
            return info;
        },

        traverse:function(o,key){
            var obj
            ;
            for(var i in o){
                if(parseInt(i,10)===key){return o[i];}
                if(typeof(o[i])=='object'){
                    obj=Y.JA.lib.job.traverse(o[i],key);
                    if(obj!==false){return obj;}
                }
            }
            return false;
        },

        tree:{
            build:function(propertyData,address){
                var tree=[],
                    build=function(parent){
                        var branch={data:parent}
                        ;
                        Y.each(propertyData,function(property){
                            if(property.parent===parent.id){
                                if(!branch.children){branch.children=[];}
                                if(!property.ancestry){property.ancestry=[];}
                                if(parent.id!==null){
                                    property.ancestry.push([parent.id,parent.prop]);
                                    if(typeof parent.ancestry!=='undefined'){
                                        property.ancestry=property.ancestry.concat(parent.ancestry);
                                    }
                                }
                                branch.children.push(build(property));
                            }
                        });
                        return branch;
                    }
                ;
                Y.each(propertyData,function(property){
                    if(property.address===address && property.parent===null){
                        tree.push(build(property));
                    }
                });
                return tree;
            },
            output:function(node){
                var html='<li>'+JA.data.prop[node.data.prop].name+' '+(node.data.detail===null?'':node.data.detail)+'</li>'
                ;
                Y.each(node.children,function(child){
                    html+='<li><ul>'+Y.JA.lib.job.tree.output(child)+'</ul></li>';
                });
                return html;
            }
        }
    };

});
