/**
 * 组件-发送验证码
 */
define(['jquery', 'text!compts/send_code/send_code.tpl', 'lib/css.min!compts/send_code/send_code.css'], function($, tpl) {
	var classObj = function(config) {
		var $parent = $(config.el),
			$tpl = $(tpl),
			$btn = $tpl.find(".btn"),
			$tel = $tpl.find(".input");
		$btn.on("click", function() {
			var tel = $tel.val();
			if(!tel || tel.length <= 0) {
				alert("请输入手机号码");
			} else {
				alert("已向号码为：" + tel + "的手机发送验证码，请注意查收");
			}
		})
		$parent.html($tpl);
	}
	return classObj
})