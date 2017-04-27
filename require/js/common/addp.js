define(['jquery'],function($){
	function success(){
		$("<p>").html("jquery加载成功了").appendTo("body");
	}
	function setHtml(html){
		$("<p>").html(html).appendTo("body");
	}
	return {
		success:success,
		setHtml:setHtml
	}
})