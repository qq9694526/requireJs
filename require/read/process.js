/**
 *Created by jingfei on 2016/10/8.
 */
define([
    'jquery',
    'eventTarget',
    'hdb',
    'text!components/process/process.tpl',
    'lib/requirejs/css.min!components/process/process.css'
    ],function ($, eventTarget, hdb, tpl) {
    var VERSION = '${{version}}';
    var objClass = function(options){
        //判断el的异常值，最终把一个jquery对象赋值给$el并挂载在this对象
        //实例化构造函数时new出来的就是这个this对象
        if(!options.el||options.el.length==0){//el不存在、为空字符串
            this.$el = $("<div></div>")
            // return false
        }else if (typeof(options.el) == 'string'&&options.el.length>0) {//如果el为非空字符串
            if($(options.el).length>0){//dom存在进行赋值，若不存在赋值为空div  Jquery对象
                this.$el = $(options.el);
            }else{
                this.$el = $("<div></div>")
            }
        }else if(isDOM(options.el)){//如果el是原生dom
            this.$el = $(options.el);
        }else{//排除一切情形只剩 jquery对象
            this.$el = options.el;
        }
		//挂载options到this对象
        this.options = options; 
        //执行eventTarget,this指针指向this。相当于使用this对象调用了eventTarget.
        //同时this对象会继承了eventTarget的所有属性和方法
        //eventTarget有监听事件、触发事件、销毁事件这三个方法
        eventTarget.call(this);
        //挂载组件到$el
        render.call(this);
        //给$el绑定事件
        eventInit.call(this);
        //执行processInit，强制设置processInit的this指针为this,不随调用它的对象改变而改变
        //为什么需要延迟执行？
        setTimeout($.proxy(processInit, this), 200); 
    };
	//合并对象至objClass.prototype
	//第二个参数是否可以不要？因为objClass在call的时候已经继承了eventTarget
	//答疑：objClass中的call只有在执行的时候才会实现继承
    $.extend(objClass.prototype,eventTarget.prototype,{
        version:VERSION
    });
	//初始化进度条，加载formContainer，应用样式
    var processInit = function () {
        var $li = $('.sn-step>.sn-stepbar>li', this.$el);
        var $liFirst = $li.first(),
            $liLast = $li.last(),
            length = $li.length,
            width = this.options.width/length||160,
            height = this.options.height||61,
            form = '';
        for(var i = 0;i<length;i++){
            form+='<div class="formContainer'+(i+1)+'"></div>';
        }
        //挂载form，限定匹配到的dom在当前proceess对象内，解耦，很有必要。
        $('.sn-step>.formContainer',this.$el).append(form);
        if ($liFirst.length) {
            $liFirst.addClass('step-first');
            $liFirst.children().children('.step-name').addClass('step-now');
            //触发自定义的click事件
            $liFirst.children().addClass('step-current').children('.step-num').trigger('click');
        }else{
            console.log('还没有配置进度条内容')
        }

        if ($liLast.length) {
            $liLast.addClass('step-last');
        }else{
            console.log('还没有配置进度条内容')
        }
        $li.css(
            {
                'width':width,
                'height':height
            }
        );     
    };
	//渲染，把模板输入到指定的$el
    var render = function(){
    	//自定义handlebars的helper
        var handleHelper = hdb.registerHelper("addOne",function(index){
            return index+1;
        });
        //预编译模板  ps:是不是少了个var?
        template = hdb.compile(tpl);
        //匹配数据后输入到页面
        this.$el.html(template(this.options));
    };

    //给进度条的顶部绿色样式部分添加了点击事件，会执行itemsClick 
    var eventInit = function(){
    	//$.proxy强制指定了作用域，这里的所有this都是objClass对象，实例化后就是process对象
    	//给已完成的步骤绑定
        this.$el.on('click','.sn-step>.sn-stepbar>li>.step-done>.step-num',$.proxy(function(e,nextIndex,nowIndex,res){
            itemsClick.call(this,e,nextIndex,nowIndex,res);//使用process执行itemsClick
            this.trigger('itemsClick',[e,nextIndex,nowIndex,res]);//
        },this));
        //给当前步骤绑定
        this.$el.on('click','.sn-step>.sn-stepbar>li>.step-current>.step-num',$.proxy(function(e,nextIndex,nowIndex,res){
            itemsClick.call(this,e,nextIndex,nowIndex,res);
            this.trigger('itemsClick',[e,nextIndex,nowIndex,res]);
        },this));
    }

    var beforeLeave = null;

    //执行click回调，控制内容切换
    var itemsClick = function(e,nextIndex,nowIndex,res){
        var target = e.target||e.currentTarget,//触发事件的对象和绑定事件的对象，在该情境下e.currentTarget始终等于$el
            items = this.options.items,//配置项中的没一个步骤
            next = nextIndex||$(target).closest('li').index(),//下一步骤的索引，从0开始
            index = $('.sn-step .step-now',this.$el).closest('li').index();//当前步骤的索引
        var now = (nowIndex==0?0:nowIndex||index);//为什么要多一个是否==0的判断？
        //给beforeLeave函数补充一个没有配置时的提示
        beforeLeave = function(key){ //this.options.beforeLeave的响应
            if(items[key].beforeLeave){
                return items[key].beforeLeave();
            }else{
                console.log('还没有配置beforeLeave');
            }
        }
        if(items[next].click){//如果该步骤配置了click回调
            var $formNow = $('.sn-step>.formContainer form:eq('+now+')',this.$el);//当前步骤对应的内容，jquery对象
            var $formNext = $('.sn-step>.formContainer form:eq('+next+')',this.$el);//下一步骤的内容
            var result;
            if(next!=index){//页面可以切换
                result = res||beforeLeave(now);
                //如果beforeLeave==false,不切换样式，不改变进度内容
                if(result||result===undefined){//beforeLeave !=false
                	//切换步骤样式
                    if($(target).parent().attr('class') == 'step-done'||'step-current'){//切换当前页面标注
                        $('.sn-step .step-now',this.$el).removeClass('step-now');
                        $('.sn-step>.sn-stepbar>li:eq('+next+')>div>.step-name',this.$el).addClass('step-now');
                    }
                    //切换步骤对应的内容              
                    if($formNext.css('display')=='none'){//要进入的表单已经new 过了，只需显示/隐藏
                        fadeOut($formNow, function() {
                            $formNext.show();
                        });
                    }else{ //没有new过，需隐藏当前表单，new下一个表单                
                        fadeOut($formNow,function(){
                            items[next].click(e);//对应的内容会被插入formContainer
                        });                 
                    }
                }
            }else{
                if($formNext.css('display')=='block'){//i==index  点击当前进度
                    console.log('还在这一页')
                }else{//刚打开界面
                    items[next].click(e);
                } 
            }
        }
    };
    //淡隐动画
    function fadeOut(obj,callBack){
    	//jquery的淡出效果，改变匹配到元素的透明度为0，并执行回调
        obj.fadeOut('fast', callBack);
    };
    //扩展process对象
    $.extend(objClass.prototype,{
    	//下一步
        next:function(){
            var $now = $('.sn-step .step-now',this.$el).closest('li');
            var nowIndex = $now.index(),
                nextIndex = nowIndex+1, 
                $current = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-current'),
                $done = $('.sn-step li:eq('+nextIndex+')>.step-done',this.$el);
            if($now.attr('class') != 'step-last'){//不是最后一步
                var result = beforeLeave(nowIndex);
                if(result||result===undefined) {//判断beforeLeave是否为false,如果为flase，不执行任何操作。
                    result = 1;
                }else{
                    result = 0;
                }            
                if($done.length||$current.length){ //将要进去的表单已经new过了，只切换内容不改变样式
                	//触发绑定在.step-num的click事件，即执行itemsClick
                    $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex,result]);
                }else{
                    if(result==1){//beforeLeave !=false 可以切换表单 ，改变进度条样式
                        $('.sn-step .step-current',this.$el).removeClass('step-current').addClass('step-done');
                        $('.sn-step li:eq('+nextIndex+')',this.$el).children().addClass('step-current');
                        $('.sn-step .step-current',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex,result]);
                    }else{  //beforeLeave ==false,不能切换表单，不能改变样式，也不能触发click
                        console.log('不能改变进度')
                    }  
                }
            }else{
                console.log('已经是最后一步了');
            }
        },
        //上一步
        previous:function(){
            var $now = $('.sn-step .step-now',this.$el).closest('li');
            var nowIndex = $now.index();
            var nextIndex = nowIndex-1; 
            if($now.attr('class') != 'step-first'){//这里没有切换样式
                $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex]);
            }else{
                console.log('已经是第一步了');
            }
        },
        //切换到指定步骤
        switchTo:function(stepClassName){
            var nextIndex = stepClassName.replace(/[^0-9]/ig,"")-1;
            var nowIndex = $('.sn-step .step-now',this.$el).closest('li').index();
            var $done = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-done');
            var $current = $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-current');
            if($done.length||$current.length){
                $('.sn-step li:eq('+nextIndex+')',this.$el).find('.step-num').trigger('click',[nextIndex,nowIndex]);
            }else{
                console.log('现在还不能跳转');
            }
        },
        //根据类名获取步骤的基本(配置)信息，title、classNasme和click回调
        get:function(stepClassName){
            var i = stepClassName.replace(/[^0-9]/ig,"")-1;
            var item = this.options.items[i];
            var data = {
                title : item.title,
                className:item.className,
                module:item.click
            }
            return data;
        }
    });
    // 判断是否为原生DOM
    var isDOM = function(obj){
    	//利用原生DOM独有的tagName标签名属性
        return obj.tagName ?true:false
    } 
    //解决ie下console.log()报错问题
    window.console = window.console || (function(){
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
        return c;
    })();
    
    return objClass;
})