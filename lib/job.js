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

        qaRef:function(jobDetail){
            var ref={}
            ;
            Y.each(jobDetail,function(property,propertyId){
                Y.each(property,function(statement,statementIdx){
                    Y.each(statement,function(snippet,snippetIdx){
                        Y.each(snippet.values,function(value,valueIdx){
                            if(value[0]!==''){
                                if(!ref[value[0]]){ref[value[0]]=[];}
                                ref[value[0]].push({
                                    value       :value[1],
                                    qa          :snippet.qa,
                                    property    :parseInt(propertyId,10),
                                    statementIdx:statementIdx,
                                    snippetIdx  :snippetIdx,
                                    valueIdx    :valueIdx
                                });
                            }
                        });
                    });
                });
            });
            return ref;
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
            ancestory:function(node){
                var ancestors={}
                ;
                ancestors[node.data.id]=typeof node.data.ancestry!=='undefined'?node.data.ancestry:null;
                Y.each(node.children,function(child){
                    ancestors=Y.merge(ancestors,Y.JA.lib.job.tree.ancestory(child));
                });
                return ancestors;
            },
            build:function(propertyData,jobAddressId){
                var tree=[],
                    build=function(parent){
                        var branch={data:parent}
                        ;
                        Y.each(propertyData,function(property){
                            if(property.parent===parent.id){

                                if(!branch.children){branch.children=[];}
                                if(!property.ancestry){property.ancestry=[];}

                                property.ancestry.push([parent.id,parent.prop]);
                                if(typeof parent.ancestry!=='undefined'){
                                    property.ancestry=property.ancestry.concat(parent.ancestry);
                                }

                                branch.children.push(build(property));
                            }
                        });
                        return branch;
                    }
                ;
                Y.each(propertyData,function(property){
                    if(property.address===jobAddressId && property.parent===null){
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
            },
            path:function(ancestry){
                var str=''
                ;
                Y.each(ancestry,function(ancestor){
                    str=JA.data.prop[ancestor[1]].name+(str===''?'':'>')+str;
                });
                return str;
            }
        }
    };

});
