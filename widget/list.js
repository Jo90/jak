/** //widget/list.js
 *
 */
YUI().add('jak-widget-list',function(Y){

    var List=function(config){
        List.superclass.constructor.apply(this,arguments);
    };

    List.NAME='jak-list';

    List.ATTRS={
        current:{
            value:[],
            getter:function(){
                var arr=[],
                    cnt=0,
                    els=this.get('elements')
                ;
                this.get('nodeElements').all('input').each(function(node){
                    if(node.getStyle('display')!=='none'){
                        arr.push(els[cnt].id);
                    }
                    cnt++;
                });
                return arr;
            }
        },
        elements:{value:[]},
        hide:{value:[]},
        noDelete:{value:[]},
        nodeElements:{value:null},
        nodeSelect:{value:null},
        nodeSelectBeforeElements:{value:true},
        displayDirection:{value:'beside' /*or 'below'*/},
        selected:{value:[]},
        selectorPrompt:{value:'+tag...'},
        title:{value:'Select tags from the dropdown - x removes tag'}
    };

    Y.extend(List,Y.Widget,{
        initializer:function(config){
            this.get('boundingBox').setStyle('display','inline-block');
            this.get('contentBox').setStyle('display','inline-block');
        },
        renderUI:function(){
            var cb         =this.get('contentBox'),
                elementsArr=[],
                nodeElements,
                nodeSelect,
                nodeSelectBeforeElements=this.get('nodeSelectBeforeElements'),
                selectArr       =[],
                selected        =this.get('selected'),
                displayDirection=this.get('displayDirection'),
                noDelete        =this.get('noDelete'),
                title           =this.get('title')
            ;
            Y.each(this.get('elements'),function(el){
                elementsArr.push(
                    '<button '
                    +(Y.Array.indexOf(selected,el.id)===-1?'style="display:none;"':'')
                    +' value="'+el.id+'">'
                    +  el.name
                    +(Y.Array.indexOf(noDelete,el.id)===-1?' x':'')
                    +'</button>'
                );
                selectArr.push(
                    '<option '
                   +(Y.Array.indexOf(selected,el.id)!==-1?'style="display:none;"':'')
                   +' value="'+el.id+'"'
                   +'>'+el.name+'</option>'
                );
            });
            nodeElements=Y.Node.create('<span>'+elementsArr.join('')+'</span>');
            nodeSelect=Y.Node.create(
                '<select title="'+title+'">'
               +  '<option>'+this.get('selectorPrompt')+'</option>'
               +  selectArr.join('')
               +'</select>'
            );
            if(nodeSelectBeforeElements){
                cb.append(nodeSelect);
                if(displayDirection==='below'){cb.append('<br/>');}
                cb.append(nodeElements);
            }else{
                cb.append(nodeElements);
                cb.append(nodeSelect);
            }
            this.set('nodeElements',nodeElements);
            this.set('nodeSelect',nodeSelect);
        },
        bindUI:function(){
            this.after('selectedChange',this._el.selectedHasChanged);
            this.get('nodeElements').on('click',Y.bind(this._el.remove,this));
            this.get('nodeSelect').on('change',Y.bind(this._el.add,this));
        },
        _el:{
            add:function(){
                var nodeSelect=this.get('nodeSelect')
                   ,selected  =this.get('selected')
                ;
                if(nodeSelect.get('selectedIndex')===0){return;}
                selected.push(parseInt(nodeSelect.get('value'),10));
                this.set('selected',selected);
            },
            remove:function(e){
                var id      =parseInt(e.target.get('value'),10)
                   ,selected=this.get('selected')
                   ,noDelete=this.get('noDelete')
                ;
                if(Y.Array.indexOf(noDelete,id)!==-1){return;}
                selected.splice(Y.Array.indexOf(selected,id),1);
                this.set('selected',selected);
            },
            selectedHasChanged:function(e){
                var nodeElements    =this.get('nodeElements'),
                    nodeSelect      =this.get('nodeSelect'),
                    selected        =this.get('selected'),
                    displayedOptions=false
                ;
                nodeSelect.all('option').each(function(option,idx){
                    //sentry - exclude prompt
                        if(idx===0){return;}
                    //option in selected array then hide option and display element node
                    if(Y.Array.indexOf(selected,parseInt(option.get('value'),10))!==-1){
                        option.setStyle('display','none');
                        nodeElements.all('button').item(idx-1).setStyle('display','');
                    }else{
                        option.setStyle('display','block');
                        nodeElements.all('button').item(idx-1).setStyle('display','none');
                        displayedOptions=true;
                    }
                });
                nodeSelect.set('selectedIndex',0);
                displayedOptions
                    ?nodeSelect.show()
                    :nodeSelect.hide();
            }
        }
    });

    Y.namespace('JAK.widget').List=List;

},"1.0",{ requires:['widget','simulate']});
