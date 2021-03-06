require.config({
	//By default load any module IDs from js/lib
	baseUrl: 'js',
	//except, if the module ID starts with "app",
	//load it from the js/app directory. paths
	//config is relative to the baseUrl, and
	//never includes a ".js" extension since
	//the paths config could be for a directory.
	paths: {
		jquery: 'lib/jquery',
		hdb:'lib/handlebars_v4.0.4',
		text: 'lib/text',
		addp: 'common/addp',
		sendCode:'compts/send_code/send_code',
		hdbStudy:'compts/hdb_study/hdb_study'
	}
});
