<html>
<head>
<link id="yuibasecss" rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/combo?3.1.1/build/cssfonts/fonts-min.css&3.1.0/build/cssreset/reset-min.css&3.1.1/build/cssbase/base-min.css"> 
<script type="text/javascript" src="http://yui.yahooapis.com/combo?3.3.0/build/yui/yui-min.js"></script></head>
<!--
    Calls //js/combine.js.php
    Add parameters path/libraries.js&...&file=../temp/combineTemporaryFileName.js
    as shown below for rentals
!-->
<style>
    #results input{width:800px;}
</style>
<script src="/js/combine.js.php?assets/js/core.js&pod/userLogin/sha1.js&assets/js/pod.js&assets/widget/dialogMask.js&assets/widget/iconChoice.js&pod/address/address.js&&pod/contactFind/contactFind.js&pod/library/library.js&pod/propertyAddress/propertyAddress.js&pod/propertyComponents/propertyComponents.js&pod/propertyRental/propertyRental.js&pod/propertyState/propertyState.js&pod/userLogin/userLogin.js&file=../temp/combineRentalFull.js" type="text/javascript"></script>
</head>
<body>
<h1>Javascript combined libraries generated</h1>
<p>Can minify output now (http://www.crockford.com/javascript/jsmin.html)</p>
<p>From command line (Windows cmd)</p>
<ul id="results">
    <li>
        <h3>temp\combineRentalFull.js</h3>
        <input value="c:\www\xtra\jsmin.exe &lt;c:\www\temp\combineRentalFull.js &gt;c:\www\wol\module\rental\rental.js" />
    </li>
</ul>
<p>Now upload to server</p>
<script>
YUI().use('node',function(Y){
    //highlight text
    Y.one('#results').delegate('click',function(){this.select();},'input');
});
</script>
</body>
</html>
