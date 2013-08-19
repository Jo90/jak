/** //pod/usrFind.js
 *
 */
YUI.add('ja-pod-usrFind',function(Y){

    Y.namespace('JA.pod').usrFind=function(cfg){

        if(typeof cfg==='undefined'
        ){cfg={};}

        cfg=Y.merge({
            title      :'find user',
            width      :1000,
            xy         :[10,20],
            zIndex     :99999
        },cfg);

        this.info={
            id         :'usrFind',
            title      :cfg.title,
            description:'find user/contact/client',
            version    :'v1.0 March 2013'
        };

        var self=this,
            d={},f={},h={},
            initialise,
            io={},
            listeners,
            pod={},
            populate={},
            render={},
            trigger={}
        ;

        this.display=function(p){
            d.pod=Y.merge(d.pod,p);
            Y.JA.widget.dialogMask.mask(h.ol.get('zIndex'));
            h.ol.show();
            if(typeof p.firstName!=='undefined' && p.firstName!==''){f.usrFirstName.set('value',p.firstName);}
            if(typeof p.lastName !=='undefined' && p.lastName !==''){f.usrLastName.set('value',p.lastName);}
            h.userFind.simulate('click');
        };

        this.get=function(what){
            if(what==='zIndex'){return h.ol.get('zIndex');}
        };
        this.set=function(what,value){
            if(what==='zIndex'){h.ol.set('zIndex',value);}
            if(what==='cfg'   ){cfg=Y.merge(cfg,value);}
        };

        this.customEvent={
            returnSelection:self.info.id+(++JA.env.customEventSequence)+':returnSelection'
        };

        this.my={}; //children

        /**
         * private
         */

        initialise=function(){
            h.bb.addClass('ja-pod-'+self.info.id);
            new Y.DD.Drag({node:h.bb,handles:[h.hd,h.ft]});
        };

        io={
            fetch:{
                usr:function(){
                    Y.JA.widget.busy.set('message','getting users...');
                    Y.io('/db/siud.php',{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        on:{complete:populate.usr},
                        data:Y.JSON.stringify([{
                            usr:{
                                criteria:{
                                    firstName:f.usrFirstName.get('value'),
                                    lastName :f.usrLastName.get('value')
                                }
                            },
                            user:JA.user.usr
                        }])
                    });
                }
            },
            insert:{
                usrFind:function(){
                    //DO
                }
            }
        };

        listeners=function(){
            h.close.on('click',function(){
                h.ol.hide();
                Y.JA.widget.dialogMask.hide();
            });
            h.dtc.delegate('click',trigger.selectUsr,'tr');
            //Y.one('.ja-add-user').on('click',pod.display.usr);
            h.userFind.on('click',io.fetch.usr);
            //custom
                Y.on('ja-db-usrFind:s',populate.usr);
        };

        pod={
            display:{
                usr:function(e){
                    e.halt();
                    h.podInvoke=e.currentTarget;
                    if(!self.my.usrFind){pod.load.usr({});return false;}
                    self.my.usrFind.display({});
                }
            },
            load:{
                usr:function(p){
                    Y.use('ja-pod-usr',function(Y){
                        self.my.usrFind=new Y.JA.pod.usr(p);
                        //listeners
                        Y.JA.whenAvailable.inDOM(self,'my.usrFind',function(){
                            this.my.usrFind.set('zIndex',h.ol.get('zIndex')+10);
                            h.podInvoke.simulate('click');
                        });
                        Y.on(self.my.usrFind.customEvent.returnSelection,pod.result.usr);
                    });
                }
            },
            result:{
                usr:function(rs){
                    debugger;
                }
            }
        };

        populate={
            usr:function(id,o){
                var rs=Y.JSON.parse(o.responseText)[0].usr.result;
                h.dt.set('data',null);
                Y.each(rs.usr.data,function(usr){
                    h.dt.addRow({
                        id       :usr.id,
                        title    :usr.title,
                        firstName:usr.firstName,
                        lastName :usr.lastName
                    });
                });
                Y.JA.widget.busy.set('message','');
            }
        };

        render={
            base:function(){
                h.ol=new Y.Overlay({
                    headerContent:
                        '<span title="pod:'+self.info.id+' '+self.info.version+' '+self.info.description+' &copy;JAPS">'+self.info.title+'</span> '
                       +'<input type="text" class="ja-data-usr-firstName" placeholder="first name"/>'
                       +'<input type="text" class="ja-data-usr-lastName" placeholder="family name"/>'
                       +Y.JA.html('btn',{action:'find',title:'find user'})
                       +Y.JA.html('btn',{action:'close',title:'close pod'}),
                    bodyContent:'',
                    width  :cfg.width,
                    xy     :cfg.xy,
                    zIndex :cfg.zIndex
                }).plug(Y.Plugin.Resize).render();
                //shortcuts
                    h.hd           =h.ol.headerNode;
                    h.bd           =h.ol.bodyNode;
                    h.bb           =h.ol.get('boundingBox');
                    f.usrFirstName =h.hd.one('.ja-data-usr-firstName');
                    f.usrLastName  =h.hd.one('.ja-data-usr-lastName');
                    h.userFind     =h.hd.one('.ja-find');
                    h.close        =h.hd.one('.ja-close');
                //grid
                h.dt=new Y.DataTable({
                    columns:[
                        {key:'id'         ,label:'id'    },
                        {key:'title'      ,label:'title' },
                        {key:'firstName'  ,label:'name'  },
                        {key:'lastName'   ,label:'family'}
                    ],
                    data    :[],
                    sortable:true,
                    summary :'users'
                }).render(h.bd);
                h.dtc=h.dt.get('contentBox');
            }
        };

        trigger={
            selectUsr:function(e){
                var cells=this.all('td')
                ;
                Y.fire(self.customEvent.returnSelection,{
                    id       :parseInt(cells.item(0).get('innerHTML'),10),
                    title    :cells.item(1).get('innerHTML'),
                    firstName:cells.item(2).get('innerHTML'),
                    lastName :cells.item(3).get('innerHTML')
                });
                h.close.simulate('click');
            }
        };

        /**
         *  load & initialise
         */
        Y.JA.dataSet.fetch([
        ],function(){

            render.base();
            initialise();
            listeners();

        });
    };

},'1.0 March 2013',{requires:['base','io','node']});
