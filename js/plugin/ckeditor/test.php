<!-- /assets/js/plugin/ckeditor/test.php -->
	<!-- This <div> holds alert messages to be display in the sample page. -->
	<div id="alerts">
		<noscript>
			<p>
				<strong>CKEditor requires JavaScript to run</strong>. In a browser with no JavaScript
				support, like yours, you should still see the contents (HTML data) and you should
				be able to edit it normally, without the rich editor interface.
			</p>
		</noscript>
	</div>
	<form action="sample_posteddata.php" method="post">
			<textarea cols="80" class="ckeditor" name="editor1" rows="10">&lt;p&gt;This is a {{sample merge}}. &lt;/p&gt;</textarea>
		<p>
			<input type="submit" value="Submit" />
		</p>
	</form>