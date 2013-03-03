/** //widget/message.js
 *
 */
YUI().add('jak-widget-message',function(Y){

    var Message=function(config){
        Message.superclass.constructor.apply(this,arguments);
    };

    Message.NAME='message';

    Message.ATTRS={
        message:{
            setter:function(msg){
                var ol=this.get('ol')
                ;
                ol.set('centered',true);
                ol.set('visible',msg!=='');
                ol.bodyNode.setContent(msg);
            }
           ,value:'loading'
        }
       ,ol:{
            value:new Y.Overlay({
                bodyContent:'loading....'
               ,visible:false
               ,zIndex :999999
            }).render()
        }
    };

    Y.extend(Message,Y.Widget,{
        initializer:function(config){
            this.get('ol').get('contentBox').addClass('jak-message');
        }
    });

    Y.namespace('JAK.widget').Message=Message;

    Y.JAK.widget.busy=new Y.JAK.widget.Message();

},"1.0",{ requires:['overlay','widget']});
