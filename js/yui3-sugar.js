/** //js/yui3-sugar.js
 *
 *  https://github.com/imns/yui3-sugar
 *
 *  Brilliant: Extend for common sugar methods. Joe
 */
YUI.add('jak-yui3-sugar',function(Y){
    Y.mix(Y.Node.prototype,{

        toggle:(function(n){
            return function(){
                this._isHidden()
                    ?this.show()
                    :this.hide();
            };
        }())

       ,slideUp:(function(n){
            return function(){
                var duration=arguments[0] || 0.5,
                    callback=arguments[1] || null;
                this.setStyle('overflow','hidden');
                this.transition({
                    easing:'ease-in',
                    duration:duration,
                    height:'0px',
                    on:{
                        end:function(){
                            this.setStyle('display','none');
                            if(callback){callback();}
                        }
                    }
                });
            };
        }())

       ,slideDown:(function(n){
            return function(){
                var duration=arguments[0] || 0.5,
                    callback=arguments[1] || null;
                if(this._isHidden()){
                    this.setStyle('overflow','hidden')
                        .setStyle('height','0px')
                        .setStyle('display','');
                    this.transition({
                        easing:'ease-out',
                        duration:duration,
                        height:this.get('scrollHeight')+'px',
                        on:{
                            end:callback
                        }
                    });
                }
            };
        }())

       ,slideToggle:(function(n){
            return function(){
                var duration=arguments[0] || 0.5,
                    callback=arguments[1] || null;
                this._isHidden()
                    ?this.slideDown(duration, callback)
                    :this.slideUp(duration, callback);
            };
        }())

       ,fadeToggle:(function(n){
            return function(){
                var duration=arguments[0] || 0.5;
                this._isHidden()
                    ?this.show('fadeIn' ,{'duration':duration})
                    :this.hide('fadeOut',{'duration':duration});
            };
        }())

       ,fadeTo:(function(n) {
            return function(){
                var duration=arguments[0] || 0.5,
                    opacity =arguments[1] || 1,
                    callback=arguments[2] || null;
                this.transition({
                    easing:'ease-out',
                    duration:duration,
                    opacity:opacity,
                    on:{
                        end:callback
                    }
                });
            };
        }())

       ,fadeToColor:(function(n){
            return function(){
                var duration=arguments[0] || 0.5,
                    color=arguments[1] || '',
                    callback=arguments[2] || null,
                    bgColor=this.getStyle('backgroundColor'),
                    fromColor=(bgColor=='transparent')?'#fff':bgColor;
                var anim=new Y.Anim({
                    node:this,
                    from:{
                        backgroundColor:fromColor
                    },
                    to:{
                        backgroundColor:color
                    },
                    duration:duration
                });
                anim.on('end',callback);
                anim.run();
            };
        }())

    });

},'0.1',{
    requires:['node','transition','anim']
});