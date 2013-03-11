/** //mod/dashboard.js
 *
 */
YUI.add('jak-mod-dashboard',function(Y){

    Y.namespace('JAK.mod').dashboard=function(cfg){

        if(typeof cfg=='undefined' ||
           typeof cfg.node=='undefined'
        ){alert('error:mod-dashboard parameters');return;}

        cfg=Y.merge({
            title      :'dashboard',
            width      :'900px',
            zIndex     :9999
        },cfg);

        this.info={
            id         :'dashboard',
            title      :cfg.title,
            description:'dashboard',
            file       :'/mod/dashboard.js',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},
            h={},
            initialise={},
            io={},
            listeners,
            populate={},
            render={}
        ;

        this.customEvent={
        };

        //this.display=io.fetch.property; //refer after io.fetch.property

        this.get=function(what){
        };
        this.set=function(what,value){
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
        };

        io={
            fetch:{
            }
        };

        listeners=function(){
        };

        populate={
        };

        render={
            base:function(){
                cfg.node.append(
                    '<p>Building &amp; Pest Reports</p>'
                   +'<p>Initial Prototype to investigate possible methods for collecting field data from which to generate customer reports.</p>'
                   +'<center>'
                   +'<h3>Development Roadmap and Milestones</h3>'
                   //inline style move to css
                   +'<div class="jak-topics" style="position:relative;overflow:auto;height:20em;">'
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
                   +                '<li>Check that data matches existing processes - 70%</li>'
                   +                '<li>Determine core concepts - 70%</li>'
                   +                '<li>Determine core technologies i.e. PHP, Javascript, Linux, YUI3, JQuery, Git, etc - 80%</li>'
                   +                '<li>Start documenting use case processes for use in instruction manual - 25%</li>'
                   +                '<li>Present findings and determine essentials of prototype - 30%</li>'
                   +            '</ul>'
                   +        '</li>'
                   +        '<li>'
                   +            '<h1>Phase 2 - Develop Environment</h1>'
                   +            '<ul>'
                   +                '<li>Setup developmental framework.</li>'
                   +                '<li>Setup infrastructure - 20%</li>'
                   +                '<li>Setup internet for customer review of progress - 0%</li>'
                   +                '<li>Design standard user interface - 5%</li>'
                   +                '<li>Mock up basic initial conceptual model for customer review - 5%</li>'
                   +            '</ul>'
                   +        '</li>'
                   +        '<li>'
                   +            '<h1>Phase 3 - Build Prototype</h1>'
                   +            '<ul>'
                   +                '<li>Continuously review progress with customer</li>'
                   +                '<li>Agree on deliverables for production and initial product release - started</li>'
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
                   +        '<li><h2>Constraints</h2></li>'
                   +        '<li></li>'
                   +    '</ul>'
                   +'</div>'
                   +'</center>'
                );
            }
        };

        /**
         *  load & initialise
         */
        Y.JAK.dataSet.fetch([
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
