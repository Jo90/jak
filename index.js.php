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
                var d={},h={},my={}
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
                            {label:'Dashboard',content:
                                '<p>Building &amp; Pest Reports</p>'
                               +'<p>Initial Prototype to investigate possible methods for collecting field data from which to generate customer reports.</p>'
                               +'<center>'
                               +'<h3>Development Roadmap and Milestones</h3>'
                               +'<div class="jak-topics">'
                               +    '<ul>'
                               +        '<li><h2>Important considerations</h2></li>'
                               +        '<li>The long term requirements indicate this would be best built as an APPLICATION rather than a series of web pages.  see http://www.tonymarston.net/php-mysql/web-site-vs-web-application.html also http://stackoverflow.com/questions/1959910/web-site-vs-web-application</li>'
                               +        '<li>Fundamentally what is required is not just a series of pages.  Currently JAK is running at the application level by utilising software such as Google Drive/Docs.</li>'
                               +    '</ul>'
                               +    '<ul>'
                               +        '<li>'
                               +            '<h1>Phase 1 - Initial Review</h1>'
                               +            '<ul>'
                               +                '<li>Stakeholder vision</li>'
                               +                '<li>Review existing systems - 70%</li>'
                               +                '<li>Look at existing processes and reports - 90%</li>'
                               +                '<li>Determine fundamental information - 80%</li>'
                               +                '<li>Initial database design - 70%</li>'
                               +                '<li>Check that data matches existing processes - %70</li>'
                               +                '<li>Determine core concepts - %70</li>'
                               +                '<li>Determine core technologies i.e. PHP, Javascript, Linux, YUI3, JQuery, Git, etc - 80%</li>'
                               +                '<li>Start documenting use case processes for use in instruction manual - 25%</li>'
                               +                '<li>Present findings and determine essentials of prototype - 30%</li>'
                               +            '</ul>'
                               +        '</li>'
                               +        '<li>'
                               +            '<h1>Phase 2 - Develop Environment</h1>'
                               +            '<ul>'
                               +                '<li>Setup developmental framework.</li>'
                               +                '<li>Setup infrastructure - %20</li>'
                               +                '<li>Setup internet for customer review of progress - %0</li>'
                               +                '<li>Design standard user interface - %5</li>'
                               +                '<li>Mock up basic initial conceptual model for customer review</li>'
                               +            '</ul>'
                               +        '</li>'
                               +        '<li>'
                               +            '<h1>Phase 3 - Build Prototype</h1>'
                               +            '<ul>'
                               +                '<li>Continuously review progress with customer</li>'
                               +                '<li>Agree on deliverables for production and initial product release</li>'
                               +                '<li>Test - Test - Test</li>'
                               +            '</ul>'
                               +        '</li>'
                               +        '<li>'
                               +            '<h1>Phase 4 - </h1>'
                               +            '<ul>'
                               +                '<li>Make live</li>'
                               +                '<li>Determine any requirements for enhancements - Next Phase (if any)</li>'
                               +            '</ul>'
                               +        '</li>'
                               +'        <li><h2>Constraints</h2></li>'
                               +'        <li></li>'
                               +'    </ul>'
                               +'</div>'
                               +'</center>'
                            }
                        ]
                    }).render('.jak-tabs');

                //shortcuts
                    h.tv={dab:JAK.my.tabView.item(0)};
                    h.tvp={dab:h.tv.dab.get('panelNode')};

                //panels
                    my.panelBuild=function(){
                        JAK.my.tabView.add({label:'Calendar'    ,content:'',index:1},1);
                        JAK.my.tabView.add({label:'Property'    ,content:'',index:2},2);
                        JAK.my.tabView.add({label:'Check sheets',content:'',index:3},3);
                        JAK.my.tabView.add({label:'Reports'     ,content:'',index:4},4);
                        h.tv.cal=JAK.my.tabView.item(1);
                        h.tv.prp=JAK.my.tabView.item(2);
                        h.tv.chk=JAK.my.tabView.item(3);
                        h.tv.rep=JAK.my.tabView.item(4);
                        h.tvp.cal=h.tv.cal.get('panelNode');
                        h.tvp.prp=h.tv.prp.get('panelNode');
                        h.tvp.chk=h.tv.chk.get('panelNode');
                        h.tvp.rep=h.tv.rep.get('panelNode');
                    };
                    my.panelDestroy=function(){
                        JAK.my.tabView.remove(4);
                        JAK.my.tabView.remove(3);
                        JAK.my.tabView.remove(2);
                        JAK.my.tabView.remove(1);
                        delete h.tv.cal,h.tv.prp,h.tv.chk,h.tv.rep,h.tvp.cal,h.tvp.prp,h.tvp.chk,h.tvp.rep;
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
