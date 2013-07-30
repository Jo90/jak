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
        }

    };

});
