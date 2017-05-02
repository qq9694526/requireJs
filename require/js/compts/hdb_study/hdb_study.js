define(['jquery','hdb', 'text!compts/hdb_study/hdb_study.tpl'], function($,hdb, tpl) {
	var classObj = function(config) {
		var $parent = $(config.el);
		//预编译模板
		var template = hdb.compile(tpl);
		//模拟json数据
		var context = {
			name: "赵海鹏",
			content: "Handlebars 是 JavaScript 一个语义模板库，通过对view和data的分离来快速构建Web模板。",
			list:["#each列表渲染","#if条件渲染","#with选择数据范围","../访问父级属性","@index/key获取当前索引"]
		};
		//匹配json内容
		var html = template(context);
		//输入模板
		$parent.html(html);
	}
	return classObj
})