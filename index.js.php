<?php
/** /index.js.php
 *
 *  JAK
 *
 */
namespace jak;
require_once 'jak-config.php';
?>

//configurations
JAK={
    data:{},            //data stores
    env:{               //environment
        customEventSequence:0, //sequence to help generate unqiue custom events
        fileserver:'<?php echo JAK_FILESERVER; ?>',
        server    :'<?php echo JAK_SERVER; ?>'
    },
    my:{},              //instantiated objects
    rs:{},              //result sets
    std:{               //standards
        format:{
            date    :'d MMM yyyy',
            dateDM  :'d MMM',
            dateDMY :'ddMMyy',
            datetime:'dMMMyy h:mmtt',
            email   :/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            time    :'h:mmtt'
        }
    },
    user:{},            //user info
};
//conditional constants
<?php
if (defined('JAK_ENV_DEVICE')) {echo 'JAK.env.device="' , JAK_ENV_DEVICE , '";' , PHP_EOL;}

if (isset($_SESSION[JAK_MEMBER])) {
    require_once 'db/usr/common.php';
    $criteria = new \stdClass;
    $criteria->usrIds = array($_SESSION[JAK_MEMBER]);
    $r = usr_getUsr($criteria);
    $member = firstElement($r->data);
    echo('JAK.user.usr=' . json_encode($member) . ';' . PHP_EOL);
}
//Challenge Handshake AP >>>>FINISH What about using PHP mcrypt_create_iv Initialization Vector?
$seed      = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
$randomStr = '';
$seedLen   = strlen($seed) - 1;
$i         = 40;
while ($i--) {$randomStr .= substr($seed,rand(0,$seedLen),1);}
$_SESSION[JAK_SALT] = $randomStr;
echo 'JAK.user.SALT="' , $_SESSION[JAK_SALT] , '";' , PHP_EOL;
?>

//debug YUI({filter:'raw',
YUI({<?php require 'jak-modules.inc'; ?>}).use(
    'jak-pod-userLogon',
    function(Y){

        Y.on('error',function(type,msg){
            //>>>>DO popup
            alert(type+': '+msg+'!');
        });

        Y.JAK.dataSet.fetch(
            [
                ['dbTable','name'],
            ]
           ,function(){
                var d={},h={tv:{},tp:{}},my={}
                ;

                Y.JAK.pod.userLogon({
                    node:Y.one('.jak-userLogon'),
                    nodeInfo:Y.one('.jak-userLogon-info')
                });

                //clock
                    !function(el,fmt){
                        var clock=function(){el.setContent(new Date().toString(fmt))};
                        clock();
                        setInterval(clock,1000);
                    }(Y.one('.jak-clock'),'dddd d-MMMM-yyyy h:mmtt');

                //menu
                    JAK.my.tabView=new Y.TabView({
                        children:[
                            {label:'Dashboard',content:''}
                        ]
                    }).render('.jak-tabs');

                //dashboard
                    h.tv.das=JAK.my.tabView.item(0);
                    h.tp.das=h.tv.das.get('panelNode');
                    Y.use('jak-mod-dashboard',function(Y){
                        h.myDashboard=new Y.JAK.mod.dashboard({node:h.tp.das});
                    });

                //panels
                    my.panelBuild=function(){

                        //calendar
                            JAK.my.tabView.add({label:'Calendar',content:'Calendar',index:1},1);
                            h.tv.cal=JAK.my.tabView.item(1);
                            h.tp.cal=h.tv.cal.get('panelNode');
/*
                            Y.use('jak-mod-calendar',function(Y){
                                h.myCalendar=new Y.JAK.mod.calendar({node:h.tp.cal});
                            });
*/

                        //job matrix
                            JAK.my.tabView.add({label:'Jobs',content:'',index:2},2);
                            h.tv.job=JAK.my.tabView.item(2);
                            h.tp.job=h.tv.job.get('panelNode');
                            Y.use('jak-mod-job',function(Y){
                                h.myJob=new Y.JAK.mod.job({node:h.tp.job});
                            });

                        //check sheets
                            JAK.my.tabView.add({label:'Check sheets',content:'',index:3},3);
                            h.tv.chk=JAK.my.tabView.item(3);
                            h.tp.chk=h.tv.chk.get('panelNode');

                        //reports
                            JAK.my.tabView.add({label:'Reports',content:'',index:4},4);
                            h.tv.rep=JAK.my.tabView.item(4);
                            h.tp.rep=h.tv.rep.get('panelNode');

                    };
                    my.panelDestroy=function(){
                        JAK.my.tabView.remove(4);JAK.my.tabView.remove(3);JAK.my.tabView.remove(2);JAK.my.tabView.remove(1);
                        delete h.tv.cal,h.tv.job,h.tv.chk,h.tv.rep,h.tp.cal,h.tp.job,h.tp.chk,h.tp.rep;
                    };

                //listeners
                    Y.on('jak:logon' ,my.panelBuild);
                    Y.on('jak:logout',my.panelDestroy);

                //if logged on
                    if(typeof JAK.user.usr!=='undefined'){my.panelBuild();}

            }
        );
    }
);
