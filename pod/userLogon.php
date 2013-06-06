<?php
/** //pod/userLogon.php
 *
 * //>>>>FINISH
 *  attempt counter. 3 fails wait 15mins
 */
namespace ja;
?>

YUI.add('ja-pod-userLogon',function(Y){

    Y.namespace('JA.pod').userLogon=function(cfg){

        if(typeof cfg==='undefined' ||
           typeof cfg.node==='undefined'
        ){alert('pod-userLogon - parameter error');return;}

        cfg=Y.merge({
            title :'user login'
           ,zIndex:9999999
        },cfg);

        var d={
                COOKIE:{
                    REMEMBER:'<?php echo JA_USERLOGON_REMEMBER; ?>'
                   ,USERNAME:'userLogon-username'
                }
            }
           ,h={}
           ,initialise
           ,io={}
           ,listeners
           ,render={}
           ,trigger={}
        ;

        /**
         * private
         */

        initialise=function(){
            cfg.node.addClass('ja-userLogon');
            new Y.DD.Drag({node:h.bb,handles:[h.hd]});
        };

        io={
            forgot:function(){
                h.logon.bb.setStyle('display','none');
                h.ol.show();
                h.ol.align(this,[Y.WidgetPositionAlign.TR,Y.WidgetPositionAlign.BL]);
                h.forgot.bb.show();

                //>>>>FINISH

            }
           ,heartbeat:function(){
                Y.io('/inc/heartbeat.php',{
                    method:'POST'
                   ,on:{complete:function(){
                        //some status i.e. connected users
                    }}
                   ,data:'whats up'
                });
            }
           ,logout:function(){
                Y.io('/inc/userLogon.php',{
                    method:'POST'
                   ,on:{success:function(){
                        delete JA.user.usr;
                        Y.fire('ja:logout');
                    }}
                   ,data:'logout=yes'
                });
            }
        };

        listeners=function(){
            h.close   .on('click',function(){h.ol.hide();});
            h.usLogon .on('click',trigger.choice.logon);
            h.usLogout.on('click',io.logout);
            h.usForgot.on('click',io.forgot);
            //overlay body validations
                //forgot
                    h.forgot.who.on('keyup',function(){
                        h.submit.set('disabled',h.forgot.who.get('value')==='');
                    });
                //logon
                    h.bd.delegate('keyup',function(e){
                        var ok=h.logon.username.get('value')!=='' && h.logon.password.get('value')!==''
                        ;
                        h.submit.set('disabled',!ok);
                        if(ok && e.keyCode===13){h.submit.simulate('click');}
                    },'.ja-logon .ja-data-username,.ja-logon .ja-data-password');
                //username
                    h.bd.delegate('blur',function(){
                        var nextMonth=new Date();
                        nextMonth.setMonth(nextMonth.getMonth()+1);
                        if(h.logon.remember.get('checked')){
                            Y.Cookie.set(d.COOKIE.USERNAME,h.logon.username.get('value'),{path:'/',expires:nextMonth});
                        }else{
                            Y.Cookie.remove(d.COOKIE.USERNAME);
                        }
                    },'.ja-logon .ja-data-username');
                //remember
                    h.bd.delegate('click',function(){
                        var nextMonth=new Date();
                        nextMonth.setMonth(nextMonth.getMonth()+1);
                        if(this.get('checked')){
                            Y.Cookie.set(d.COOKIE.REMEMBER,'y',{path:'/',expires:nextMonth});
                            Y.Cookie.set(d.COOKIE.USERNAME,h.logon.username.get('value'),{path:'/',expires:nextMonth});
                        }else{
                            Y.Cookie.remove(d.COOKIE.REMEMBER);
                            Y.Cookie.remove(d.COOKIE.USERNAME);
                        }
                    },'.ja-logon .ja-data-remember');
            h.submit.on('click',trigger.submit);
            //custom
                Y.on('ja:logout',function(){
                    h.ol.hide();
                    h.usLogon .setStyle('display','');
                    h.usLogout.setStyle('display','none');
                    h.usForgot.setStyle('display','');
                    h.usName.setContent('visitor');
                    if(cfg.nodeInfo){
                        cfg.nodeInfo.setContent('');
                    }
                    clearInterval(h.heartbeat);
                });
                Y.on('ja:logon',function(){
                    h.ol.hide();
                    h.usLogon .setStyle('display','none');
                    h.usLogout.setStyle('display','');
                    h.usForgot.setStyle('display','none');
                    h.usName.setContent(
                        JA.user.usr.knownAs===null||JA.user.usr.knownAs===''
                            ?JA.user.usr.firstName
                            :JA.user.usr.knownAs
                    );
                    h.heartbeat=setInterval(io.heartbeat,300000); //5mins
                });
        };

        render={
            base:function(){
                //options
                    cfg.node.setContent(
                        '<a class="userLogon-name">Visitor</a>'
                       +'<a class="ja-loggedOut userLogon-logon">[logon]</a>'
                       +'<a class="ja-loggedIn  userLogon-logout">[logout]</a>'
                       +'<a class="ja-forgot    userLogon-forgot">[forgot]</a>'
                    );
                //shortcuts
                    h.usOption=cfg.node.all('a');
                    h.usName  =h.usOption.item(0);
                    h.usLogon =h.usOption.item(1);
                    h.usLogout=h.usOption.item(2);
                    h.usForgot=h.usOption.item(3);
                //display
                    h.usLogout.setStyle('display','none');
                //overlay
                    h.ol=new Y.Overlay({
                        headerContent:
                            '<em>logon</em>'
                           +Y.JA.html('btn',{action:'remove'})
                       ,bodyContent:
                            '<div class="ja-logon">'
                           +  'user<br />'
                           +  '<input type="text" class="ja-data ja-data-username" placeholder="user name" />'
                           +  '<input type="checkbox" class="ja-data ja-data-remember" title="remember user name" /><br />'
                           +  'password<br />'
                           +  '<input type="password" class="ja-data ja-data-password" placeholder="password" /><br />'
                           +'</div>'
                           +'<div class="ja-forgot">'
                           +  'forgot? enter user id or email<br />'
                           +  '<input type="text" class="ja-data ja-data-forgot-who" placeholder="user id or email" /><br />'
                           +'</div>'
                       ,footerContent:'<input type="button" value="submit" />'
                       ,visible:false
                       ,zIndex :cfg.zIndex
                    }).render(cfg.node);
                //shortcuts
                    h.hd             =h.ol.headerNode;
                    h.bd             =h.ol.bodyNode;
                    h.ft             =h.ol.footerNode;
                    h.bb             =h.ol.get('boundingBox');
                    h.forgotBtn      =h.hd.one('button');
                    h.close          =h.hd.one('.ja-remove');
                    h.logon          ={};
                    h.logon.bb       =h.bd.one('.ja-logon');
                    h.logon.username =h.logon.bb.one('.ja-data-username');
                    h.logon.password =h.logon.bb.one('.ja-data-password');
                    h.logon.remember =h.logon.bb.one('.ja-data-remember');
                    h.forgot         ={};
                    h.forgot.bb      =h.bd.one('.ja-forgot');
                    h.forgot.who     =h.forgot.bb.one('.ja-data-forgot-who');
                    h.submit         =h.ft.one('input');
            }
        };

        trigger={
            submit:function(){
                var emailNode,emailValue
                   ,logonValue   =h.logon.username.get('value')
                   ,passwordValue=h.logon.password.get('value')
                ;
                if(h.logon.bb.getStyle('display')!=='none'){
                    if(logonValue===''){
                        h.logon.username.focus();
                        alert('please enter logon');
                        return false;
                    }
                    if(passwordValue===''){
                        h.logon.password.focus();
                        alert('please enter password');
                        return false;
                    }
                    h.logon.password.set('value',''); //clear
                    Y.io('/inc/userLogon.php',{
                        method:'POST'
                       ,on:{complete:function(id,o){
                            var rs
                               ,SALT=JA.user.SALT //remember
                            ;
                            //sentry
                                if(o.responseText===''){
                                    alert('logon not successful');
                                    return false;
                                }
                                rs=Y.JSON.parse(o.responseText);
                                if(typeof rs.data==='undefined'){
                                    alert('logon not successful');
                                    return false;
                                }
                            //data
                                JA.user.usr=Y.JA.firstRecord(rs.data);
                                JA.user.SALT=SALT; //restore
                            //
                            Y.fire('ja:logon');
                        }}
                       ,data:'logon='+logonValue
                            +'&hash='+Y.JA.js.SHA1(passwordValue+Y.JA.js.SHA1(JA.user.SALT))
                    });
                }
                if(h.forgot.bb.getStyle('display')!=='none'){
                    email=h.bd.one('input');
                    emailValue=email.get('value');
                    if(emailValue===''){
                        email.focus();
                        alert('please enter for email address');
                        return false;
                    }
                    if(!Y.JA.fn.checkEmail(emailValue)){
                        email.focus();
                        alert('invalid email format');
                        return false;
                    }

                    ////////////////////////////////>>>>>>>>>>>>>>>DO

                    alert('function still to be written');

                    return;
                }
            }
           ,choice:{
                name:function(){
                    //>>>>FINISH
                   alert('this will be implemented as a separate module');
                }
               ,logon:function(){
                    var cookieRemember=Y.Cookie.get(d.COOKIE.REMEMBER)
                       ,cookieUsername=Y.Cookie.get(d.COOKIE.USERNAME)
                       ,nextMonth=new Date();
                    ;
                    h.forgot.bb.setStyle('display','none');
                    h.ol.show();
                    h.ol.align(this,[Y.WidgetPositionAlign.TR,Y.WidgetPositionAlign.BL]);
                    h.logon.bb.show();
                    h.logon.username.focus();
                    //cookies
                    nextMonth.setMonth(nextMonth.getMonth()+1);
                    Y.Cookie.set(d.COOKIE.REMEMBER,'y',{path:'/',expires:nextMonth});
                    Y.Cookie.set(d.COOKIE.USERNAME,h.logon.username.get('value'),{path:'/',expires:nextMonth});

                    h.logon.remember.set('checked',cookieRemember!==null);
                    if(cookieRemember!==null && cookieUsername!==null){
                        h.logon.username.set('value',cookieUsername);
                    }
                    if(h.logon.username.get('value')!==''){
                        h.logon.password.focus();
                    }
                }
            }
        };

        /**
         *  load and initialise
         */

        render.base();
        initialise();
        listeners();

        //if logged on
            if(typeof JA.user.usr!=='undefined'){Y.fire('ja:logon');}

    };

},'1.0 Oct 2010',{requires:['base','dd-constrain','io','node','overlay']});
