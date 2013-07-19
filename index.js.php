<?php
/** //index.js.php
 *
 */
namespace ja;
require_once 'config.php';
?>

//configurations
JA={
    data:{},
    env:{
        customEventSequence:0, //sequence to help generate unqiue custom events
        fileserver:'<?php echo JA_FILESERVER; ?>',
        server    :'<?php echo JA_SERVER; ?>'
    },
    my:{},     //instantiated objects
    propStructure:<?php require 'db/propTree.json'; ?>,
    rs:{},     //result sets
    std:{      //standards
        format:{
            email   :/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
        }
    },
    user:{}
};
//conditional constants
<?php
if (defined('JA_ENV_DEVICE')) {echo 'JA.env.device="' , JA_ENV_DEVICE , '";' , PHP_EOL;}

if (isset($_SESSION[JA_MEMBER])) {
    require_once 'db/usr/common.php';
    $criteria = new \stdClass;
    $criteria->usrIds = array($_SESSION[JA_MEMBER]);
    $r = usr_getUsr($criteria);
    $member = firstElement($r->data);
    echo('JA.user.usr=' . json_encode($member) . ';' . PHP_EOL);
}
//Challenge Handshake AP >>>>FINISH What about using PHP mcrypt_create_iv Initialization Vector?
$seed      = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
$randomStr = '';
$seedLen   = strlen($seed) - 1;
$i         = 40;
while ($i--) {$randomStr .= substr($seed,rand(0,$seedLen),1);}
$_SESSION[JA_SALT] = $randomStr;
echo 'JA.user.SALT="' , $_SESSION[JA_SALT] , '";' , PHP_EOL;

?>

//debug YUI({filter:'raw',
YUI({<?php require 'modules.inc'; ?>}).use(
    'ja-pod-userLogon',
    'ja-pod-address',
    'ja-pod-info',
    'ja-pod-job',
    'ja-pod-rep',
    'ja-widget',
    function(Y){

        Y.on('error',function(type,msg){
            //>>>>DO popup
            alert(type+': '+msg+'!');
        });

        Y.JA.dataSet.fetch(
            [
                ['dbTable','name'],
                ['prop','id'],
                ['propChild','id'],
                ['propType','id'],
                ['qa','id'],
                ['service','id'],
                ['tagOption','id']
            ]
           ,function(){
                var d={},h={tv:{},tp:{}},my={}
                ;

                //extend prop with propChild and propType to ease lookup
                Y.each(JA.data.propChild,function(propChild){
                    if(typeof JA.data.prop[propChild.prop].child){JA.data.prop[propChild.prop].child=[];}
                    JA.data.prop[propChild.prop].child.push(propChild.child);
                });
                Y.each(JA.data.propType,function(propType){
                    if(typeof JA.data.prop[propType.type].child){JA.data.prop[propType.prop].type=[];}
                    JA.data.prop[propType.prop].type.push(propType.type);
                });

                Y.JA.pod.userLogon({
                    node:Y.one('.ja-userLogon'),
                    nodeInfo:Y.one('.ja-userLogon-info')
                });

                //clock
                    !function(el,fmt){
                        var clock=function(){el.setContent(new Date().toString(fmt))};
                        clock();
                        setInterval(clock,1000);
                    }(Y.one('.ja-clock'),'dddd d-MMMM-yyyy h:mmtt');

                //menu
                    JA.my.tabView=new Y.TabView({
                        children:[
                            {label:'Dashboard',content:''}
                        ]
                    }).render('.ja-tabs');

                    //on select calendar tab
                    JA.my.tabView.after('selectionChange',function(e){
                        if(e.newVal.get('label')==='Calendar'){
                            //can render only when visible - slight delay
                            setTimeout(function(){
                                JA.my.fc.fullCalendar('render');
                            },300);
                        }
                    });

                //dashboard
                    h.tv.das=JA.my.tabView.item(0);
                    h.tp.das=h.tv.das.get('panelNode');
                    Y.use('ja-mod-dashboard',function(Y){
                        h.myDashboard=new Y.JA.mod.dashboard({node:h.tp.das});
                    });

                //reusable
                    JA.my.podAddress=new Y.JA.pod.address({visible:false});
                    JA.my.podInfo   =new Y.JA.pod.info({visible:false});
                    JA.my.podJob    =new Y.JA.pod.job({visible:false});
                    JA.my.podRep    =new Y.JA.pod.rep({visible:false});

                //panels
                    my.panelBuild=function(){

                        //calendar
                            JA.my.tabView.add({label:'Calendar',content:'',index:1},1);
                            h.tv.cal=JA.my.tabView.item(1);
                            h.tp.cal=h.tv.cal.get('panelNode');

                            Y.use('ja-mod-calendar',function(Y){
                                h.myCalendar=new Y.JA.mod.calendar({node:h.tp.cal});
                            });

                        //job matrix
                            JA.my.tabView.add({label:'Jobs',content:'',index:2},2);
                            h.tv.job=JA.my.tabView.item(2);
                            h.tp.job=h.tv.job.get('panelNode');
                            Y.use('ja-mod-job',function(Y){
                                h.myJob=new Y.JA.mod.job({node:h.tp.job});
                            });

                        //reports
                            JA.my.tabView.add({label:'Reports',content:'Consolidated reports...',index:3},3);
                            h.tv.rep=JA.my.tabView.item(3);
                            h.tp.rep=h.tv.rep.get('panelNode');

                    };

                    my.panelDestroy=function(){
                        JA.my.tabView.remove(3);JA.my.tabView.remove(2);JA.my.tabView.remove(1);
                        delete h.tv.cal,h.tv.job,h.tv.chk,h.tv.rep,h.tp.cal,h.tp.job,h.tp.rep;
                    };

                //listeners
                    Y.on('ja:logon' ,my.panelBuild);
                    Y.on('ja:logout',my.panelDestroy);

                //if logged on
                    if(typeof JA.user.usr!=='undefined'){my.panelBuild();}

            }
        );
    }
);
