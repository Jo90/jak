<?php
/** //index.php
 *
 */
phpinfo();
namespace jak;
?>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>JAK Inspection Application</title>
<meta name="description" content="JAK" />
<meta name="keywords" content="JAK" />
<meta name="author" content="Amelita, et al" />

<?php echo YUI_CSS; ?>
<link rel="stylesheet" type="text/css" href="css/combine.css.php">
<style type="text/css">
html {height:100%}
body {height:100%;margin:0;padding:0;}
body > em {display:block;color:#800;font-size:1.4em;margin:0.4em 1em;}
.jak-clock {color:rgba(255,255,255,1);float:right;margin:0 200px 0;text-shadow:#80715D 1px 1px 1px;}
</style>
<?php echo YUI_JS; ?>
</head>
<body class="jak-main yui3-skin-sam">
    <section>
        <div class="jak-userLogon"></div>
        <span class="jak-clock"></span>
    </section>
    <em>JAK</em>
    <article>
        <div class="jak-tabs"></div>
    </article>
<script src="index.js.php" type="text/javascript"></script>
</body>
</html>
