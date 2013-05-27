<?php
/** //index.js.php
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
            email   :/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        }
    },
    user:{}
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
    'jak-pod-info',
    'jak-pod-job',
    'jak-pod-rep',
    'jak-widget',
    function(Y){

        Y.on('error',function(type,msg){
            //>>>>DO popup
            alert(type+': '+msg+'!');
        });

        Y.JAK.dataSet.fetch(
            [
                ['dbTable','name'],
                ['propPartTag','id'],
                ['propPartType','id'],
                ['propPartTypeTag','id'],
                ['question','id'],
                ['questionMatrix','id'],
                ['service','id']
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

                    //on select calendar tab
                    JAK.my.tabView.after('selectionChange',function(e){
                        if(e.newVal.get('label')==='Calendar'){
                            //can render only when visible - slight delay
                            setTimeout(function(){
                                JAK.my.fc.fullCalendar('render');
                            },300);
                        }
                    });

                //dashboard
                    h.tv.das=JAK.my.tabView.item(0);
                    h.tp.das=h.tv.das.get('panelNode');
                    Y.use('jak-mod-dashboard',function(Y){
                        h.myDashboard=new Y.JAK.mod.dashboard({node:h.tp.das});
                    });

                //reusable
                    JAK.my.podInfo=new Y.JAK.pod.info({visible:false});
                    JAK.my.podJob =new Y.JAK.pod.job({visible:false});
                    JAK.my.podRep =new Y.JAK.pod.rep({visible:false});

                //panels
                    my.panelBuild=function(){

                        //calendar
                            JAK.my.tabView.add({label:'Calendar',content:'',index:1},1);
                            h.tv.cal=JAK.my.tabView.item(1);
                            h.tp.cal=h.tv.cal.get('panelNode');

                            Y.use('jak-mod-calendar',function(Y){
                                h.myCalendar=new Y.JAK.mod.calendar({node:h.tp.cal});
                            });

                        //job matrix
                            JAK.my.tabView.add({label:'Jobs',content:'',index:2},2);
                            h.tv.job=JAK.my.tabView.item(2);
                            h.tp.job=h.tv.job.get('panelNode');
                            Y.use('jak-mod-job',function(Y){
                                h.myJob=new Y.JAK.mod.job({node:h.tp.job});
                            });

                        //reports
                            JAK.my.tabView.add({label:'Reports',content:'Consolidated reports...',index:3},3);
                            h.tv.rep=JAK.my.tabView.item(3);
                            h.tp.rep=h.tv.rep.get('panelNode');

                    };

                    my.panelDestroy=function(){
                        JAK.my.tabView.remove(3);JAK.my.tabView.remove(2);JAK.my.tabView.remove(1);
                        delete h.tv.cal,h.tv.job,h.tv.chk,h.tv.rep,h.tp.cal,h.tp.job,h.tp.rep;
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
