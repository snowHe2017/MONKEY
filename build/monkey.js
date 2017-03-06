/*!
 * monkey JavaScript Library
 * 
 * @author snow.he
 * 
 */

var MONKEY = { REVISION:'6',updataDate:"2017-03-1"};

//amd define
if (typeof define === 'function' && define.amd ) {
	define('monkey', MONKEY);
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module ) {
	module.exports = MONKEY;
}

//Polyfills
if(Number.EPSILON == undefined){
	Number.EPSILON = Math.pow(2,-52);
}

if (!Date.now) {
  Date.now = function now() {
    return new Date().getTime();
  };
}

if ( Object.assign === undefined ) {
	// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	( function () {
		Object.assign = function ( target ) {
			'use strict';
			if ( target === undefined || target === null ) {
				throw new TypeError( 'Cannot convert undefined or null to object' );
			}
			var output = Object( target );
			for ( var index = 1; index < arguments.length; index ++ ) {
				var source = arguments[ index ];
				if ( source !== undefined && source !== null ) {
					for ( var nextKey in source ) {
						if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {
							output[ nextKey ] = source[ nextKey ];
						}
					}
				}
			}
			return output;
		};
	} )();
}

if ( Math.sign === undefined ) {
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign
	Math.sign = function ( x ) {
		return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;
	};
}
//Array
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
//原型捆绑确定
if ( Function.prototype.name === undefined ) {
	// Missing in IE9-11.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
	Object.defineProperty( Function.prototype, 'name', {
		get: function () {
			return this.toString().match( /^\s*function\s*(\S*)\s*\(/ )[ 1 ];
		}
	} );
}
//定义MONKEY属性
Object.assign(MONKEY,{
	pointer:null,
	init:function(_parameters){
		var parameters = _parameters || {};
		//启动OS属性检测
		MONKEY.OSInfo.updataOsInfo(parameters);
		//生成pointer组件
		MONKEY.pointer = new MONKEY.Pointer(parameters.canvas);
		MONKEY.pointer.initPointer();
		//Audio组件
		MONKEY.Audio = new MONKEY.AudioClass();
		//label组件
		MONKEY.Labeler = new MONKEY.LabelerClass();
	}
});
MONKEY.OSInfo = {
	//MONKEY版本
	MONKEY_revision:MONKEY.REVISION,
	//操作系统
	os:null,
	//浏览器
	browser:null,
	fullBrowser:null,
	//语言[符号]
	language:"",
	//是否支持cookie
	cookieEnabled:false,
	//浏览器版本
	browserVersion:null,
	//是否支持mspointer
	msPointerable:null,
	//是否支持手势
	touchable:null,
	html5_localStorage:false,
	//canvas属性
	isAutoScale:false,
	//缩放比例
	scale:1,
	//canavs left & top (缩放之后的left top)
	canvasLeft:0,
	canvasTop:0,
	pWidth:1024,
	pHeight:768,

	updataOsInfo:function(_parameters){

		MONKEY.OSInfo.pWidth = _parameters.width;
		MONKEY.OSInfo.pHeight = _parameters.height;

		windows = (navigator.userAgent.indexOf("Windows",0) != -1)?1:0;
		mac = (navigator.userAgent.indexOf("mac",0) != -1)?1:0;
		linux = (navigator.userAgent.indexOf("Linux",0) != -1)?1:0;
		unix = (navigator.userAgent.indexOf("X11",0) != -1)?1:0;
		
		if (windows) MONKEY.OSInfo.os = "MS Windows";
		else if (mac) MONKEY.OSInfo.os = "Apple mac";
		else if (linux) MONKEY.OSInfo.os = "Lunix";
		else if (unix) MONKEY.OSInfo.os = "Unix";

		try{
			MONKEY.OSInfo.msPointerable=window.navigator.msPointerEnabled?true:false;
		}catch(e){
			MONKEY.OSInfo.msPointerable=false;
		}

		try{
			MONKEY.OSInfo.touchable=("ontouchend" in document&&MONKEY.OSInfo.os!="MS Windows"&&MONKEY.OSInfo.os!="Apple mac") ? true : false;
		}catch(e){
			MONKEY.OSInfo.touchable=false;
		}
		try{ 
          	MONKEY.OSInfo.html5_localStorage =  'localStorage' in window && window['localStorage'] !== null; 
      	}catch(e){ 
         	MONKEY.OSInfo.html5_localStorage =  false; 
      	} 
      	try{
      		MONKEY.OSInfo.language = navigator.language;
      		MONKEY.OSInfo.cookieEnabled = navigator.cookieEnabled;
      		MONKEY.OSInfo.browser = MONKEY.Common.getOs();
      		MONKEY.OSInfo.b_version = navigator.appVersion;
      		MONKEY.OSInfo.browserVersion =  (MONKEY.OSInfo.fullBrowser+"").replace(/[^0-9.]/ig,""); 
      		MONKEY.OSInfo.fullBrowser = MONKEY.Common.getBrowserInfo()[0];
      	}catch(e){

      	}
		MONKEY.Common.trace("OS info test over.")
	}
}
/*
**	预加载
**	@author snow.he
 */

MONKEY.Preload = {
	preArray:[],
	preFileNumber:0,
	preSuccess:[],
	prePercent:0,
	preStartTime:new Date(),
	preWaitTime:18000,
	preListener:null,
	preCallback:null,
	preShowType:-1,
	preShowStatus:false,
	preShowList:[],
	preSoundType:new Array("mp3","ogg","wav","m4a"),
	callbacks:function(){},
	loadingFile:function(_file,_showType,_callbacks,_waitTime){
		var self = MONKEY.Preload;
		if(arguments.length < 1){
			MONKEY.Common.trace("MONKEY.Preload.loadingFile must more than 1 arguments.");
			return;
		}
		self.preStartTime = new Date();
		for(var i in _file){
			var d = _file[i],elm;
			if(!d["type"]){
				var ext = MONKEY.Common.getExtension(d.path);
				if(ext == "txt"){
					d["type"] = "text";
				}else if(ext == "js"){
					d["type"] = "js";
				}else if(MONKEY.Preload.preSoundType.indexOf(ext) >= 0){
					d["type"] = "audio";
				}else{
					d["type"] = "img";
				}
			}
			switch(d["type"]){
				case "text":
					break;
				case "js":
					var addStatus = d["addStatus"] !== undefined ? d["addStatus"] : true;
					elm =  document.createElement("script");
					elm.src = d["path"];
					elm.onload = self.fileOnload;
					if(addStatus)
						document.querySelector("head").appendChild(elm);
					if(d["name"])
						self.preArray[d["name"]] = elm;
					else
						self.preArray.push(elm);
					break;

				case "audio":
					var option = Object.assign({},d);
					option.onLoad = self.fileOnload;
					MONKEY.Audio.createAudio([option]);
					break;

				case "img":
					elm = new Image();
					elm.src = d["path"];
					elm.onload = self.fileOnload;
					if(d["name"])
						self.preArray[d["name"]] = elm;
					else
						self.preArray.push(elm);
					break;
			}
			self.preFileNumber ++;
		}
		self.callbacks = _callbacks !== undefined ? _callbacks : function(){};
		self.preShowType = _showType > self.preShowList.length ? -1 : _showType - 1;
		self.preShowStatus = true;
		self.preWaitTime = _waitTime;
	},
	fileOnload:function(){
		var self = MONKEY.Preload;
		self.preSuccess.push(this);
	},
	updataPercent:function(){
		var self = MONKEY.Preload;
		var maxLen = self.preFileNumber,
			successLen = self.preSuccess.length;
		var useTime = (new Date) - self.preStartTime;
		if(successLen >= maxLen || useTime >= self.preWaitTime){
			self.prePercent = 100;
			self.preShowStatus = false;
			self.callbacks.call(this);
		}else{
			self.prePercent = (successLen/maxLen*100).toFixed(2);
		}	
	},
	staticDraw:function(ctx,_percent){
		var x = MONKEY.OSInfo.pWidth/2,
			y = MONKEY.OSInfo.pHeight/2;
		ctx.beginPath();
		ctx.fillStyle = "#fff";
		ctx.globalAlpha = 0.5;
		ctx.arc(x,y,80,0, 2*Math.PI);
		ctx.fill();
		ctx.beginPath();
		var perc = _percent;
		ctx.globalAlpha = 0.5 + perc*0.5;
		ctx.moveTo(x,y);
		ctx.arc(x,y,80,0,perc*360*Math.PI/180);
		ctx.fillStyle = "#fff";
		ctx.fill();
		ctx.beginPath();
		ctx.globalAlpha = 1;
		ctx.fillStyle = "#000";
		ctx.arc(x,y,60,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#fff";
		ctx.font = "32px Arial";
		ctx.textAlign = "center";
		ctx.fillText(_percent+"%",x,y+10,80,40);
	},
	addShowType:function(_func){
		var self = MONKEY.Preload;
		if(arguments.length > 1){
			var reList = [];
			for(var i = 0; i < arguments.length; i ++){
				var n = self.addShowType(arguments[i]);
				reList.push(n);
			}
			return reList;
		}else{
			self.preShowList.push(_func);
			return self.preShowList.length;
		}
	}
}



/*
*	loader
*功能:加载数据  格式转换
*
 */
MONKEY.Loader = {
	ajax:function(options){
		options = options || {};
	    options.type = (options.type || "GET").toUpperCase();
	    options.dataType = options.dataType || "json";
	    var params = formatParams(options.data);

	    if (window.XMLHttpRequest) {
	        var xhr = new XMLHttpRequest();
	    } else { //IE6及其以下版本浏览器
	        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
	    }
	    xhr.overrideMimeType( 'text/plain' );

	    //接收
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState == 4) {
	            var status = xhr.status;
	            if (status >= 200 && status < 300) {
	                options.success && options.success(xhr.responseText, xhr.responseXML);
	            } else {
	                options.fail && options.fail(status);
	            }
	        }
	    }
	    //连接 和 发送
	    if (options.type == "GET") {
	        xhr.open("GET", options.url + "?" + params, true);
	        xhr.send(null);
	    } else if (options.type == "POST") {
	        xhr.open("POST", options.url, true);
	        //设置表单提交时的内容类型
	        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        xhr.send(params);
	    }	       
	},
	loadImg:function(_target,_strArr,_path,_type){
		var target = _target,
			strArr = _strArr,
			path   = _path,
			type   = _type == undefined? 0 : _type;
		var temp = [];
		for(var i = 1;i <= strArr.length; i ++){
			temp = [];
			if(type == 0){
				var img1 = new Image();
				img1.src = path  + "/" + strArr[i - 1] + ".png";
				target.push(img1);	
			}else
				if(type == 1){
					var img1 = new Image(),img2 = new Image();
					img1.src = path  + "/" +  strArr[i - 1] + ".png";
					img2.src = path  + "/" +  strArr[i - 1] + "_mo.png";
					temp.push(img1);
					temp.push(img2);	
					target.push(temp);
				}else
					if(type == 2){
						var img1 = new Image(),img2 = new Image(), img3 = new Image();
						img1.src = path + "/" + strArr[i - 1] + ".png";
						img2.src = path + "/" + strArr[i - 1] + "_mo.png";
						img3.src = path + "/" + strArr[i - 1] + "_check.png";
						temp.push(img1);
						temp.push(img2);	
						temp.push(img3);
						target.push(temp);	
					}else
						if(type == 3){
							var img1 = new Image(),img2 = new Image(), img3 = new Image();
							img1.src = path + "/" + strArr[i - 1] + ".png";
							img2.src = path + "/" + strArr[i - 1] + "_check.png";
							img3.src = path + "/" + strArr[i - 1] + "_cz.png";
							temp.push(img1);
							temp.push(img2);	
							temp.push(img3);
							target.push(temp);	
					   }
			
		}	
		//console.log("loading Image success!")
	},
	loadAniImg:function(_target,_str,_aniNumber,_firstNumber){
		var fn = _firstNumber == undefined ? 0: _firstNumber;
		for(var i = 0; i < _aniNumber; i ++){
			var n = fn + i,
			img = new Image();
			img.src = _str + n + ".png";
			_target.push(img);
		}
	},
	loadBtnImg:function(_target,_pathStr){
		var img1 = new Image(),
			img2 = new Image();
		img1.src = _pathStr + ".png";
		img2.src = _pathStr + "_mo.png";
		_target.push(img1);
		_target.push(img2);
	},
	loadAniBtnImg:function(_target,_str,_pathStr,_number,_boo){
		var img = new Image();
			img.src = _pathStr + "/" + _str + ".png";
		_target.push(img);
		if(_boo){
			var temp = [];
			for(var i = 0; i < _number; i ++){
				var img = new Image();
					img.src = _pathStr + "/" + _str + "_mo_" + (i + 1) + ".png";
				temp.push(img);	
			}
			_target.push(temp);
		}
		
	},
	loadOtherImg:function(_target,_str,_path){
		for(var i = 0; i < _str.length; i ++){
			var img = new Image();
				img.src = _path + "/" + _str[i] + ".png";
			_target.push(img);	
		}	
	},
}
/*
*正则工具
 */
MONKEY.Regular = {
	
}
/*
*	二维点类
*	创建二维点坐标
*	涉及：position/scale(x,y)/rotatePoint
*	
* 	@author snow.he
*/
MONKEY.Position = function(x,y){
	this.x = x || 0;
	this.y = y || 0;
}
MONKEY.Position.prototype = {
	constructor:MONKEY.Position,
	set:function(x,y){
		this.x = x;
		this.y = y;

		return this;
	},
	setScalar:function(scalar){
		this.x = scalar;
		this.y = scalar;

		return this;
	},
	setX:function(x){
		this.x = x;

		return this;
	},
	setY:function(y){
		this.y = y;

		return this;
	},
	clone:function(){
		return new this.constructor(this.x,this.y);
	},
	copy:function(v){
		this.x = v.x;
		this.y = v.y;

		return this;
	},
	add:function(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	},
	addScalar:function(scalar){
		this.x += scalar;
		this.y += scalar;

		return this;
	},
	min:function(v){
		this.x = Math.min(this.x,v.x);
		this.y = Math.min(this.y,v.y);
	},
	max:function(v){
		this.x = Math.max(this.x,v.x);
		this.y = Math.max(this.y,v.y);

		return this;
	}

}
/**
 * *	2维矩阵
 * *	用于处理坐标的旋转 平移[2维矩阵无法表示] 缩放
 */
MONKEY.Matrix2 = function(){
	this.elements = new Array(
		0,0,1
	);
	//保存小数点位数
	this.fixed = 2;
	if(arguments.length > 0){
		MONKEY.Common.trace("MONKEY.Matrix2:use .set() onstead matrix2");
	}
}
MONKEY.Matrix2.prototype = {
	constructor:MONKEY.Matrix2,
	set:function(n11,n21) {

		var te = this.elements;
		te[0] = n11;
		te[1] = n21;

		return this;

	},
	setFixed:function(n){
		if(!isNaN(n)){
			if(n >= 0){
				this.fixed = n;
			}
		}
	},
	identity: function () {

		this.set(0,0);

		return this;

	},
	fromArray:function(array){
		this.set(array[0],array[1],array[2]);
		return this;
	},
	clone: function () {

		return new this.constructor().fromArray( this.elements );

	},

	copy: function ( m ) {

		var me = m.elements;

		this.set(m[0],m[1]);

		return this;

	},

	//围绕某点旋转a度
	rotate:function(_a,_sx,_sy){
		if(isNaN(_a)) return;
		var a = _a !== undefined ? _a : 0,
			sx = _sx !== undefined ? _sx : 0,
			sy = _sy !== undefined ? _sy : 0;
		var te = this.elements;
		a = MONKEY.Math.degToRad(a);

		//s = [x,y,1]
		var T = [1,0,-sx,
				 0,1,-sy,
				 0,0,1],
			R = [Math.cos(a),Math.sin(a),0,
				-Math.sin(a),Math.cos(a),0,
				0,0,1],
			rT = [1,0,sx,
				  0,1,sy,
				  0,0,1];

		var Tte = [te[0] + T[2],te[1] + T[5],1];
		var Rte = [Tte[0]*R[0] + Tte[1]*R[1],Tte[0]*R[3] + Tte[1]*R[4],1];
		var rTte = [Rte[0] + rT[2],Rte[1] + rT[5],1];

		for(var i = 0; i < rTte.length; i ++){
			rTte[i] = parseFloat(rTte[i].toFixed(this.fixed));
		}
		this.fromArray(rTte);

		return this;
	},
	//针对某点进行缩放
	scale:function(_scalerX,_scalerY,_sx,_sy){
		var scalerX = _scalerX !== undefined ? _scalerX : 1,
			scalerY = _scalerY !== undefined ? _scalerY : 1,
			sx = _sx !== undefined ? _sx : 0,
			sy = _sy !== undefined ? _sy : 0;
		var te = this.elements;

		//s = [x,y,1]
		var T = [1,0,-sx,
				 0,1,-sy,
				 0,0,1],
			S = [scalerX,0,0,
				0,scalerY,0,
				0,0,1],
			rT = [1,0,sx,
				  0,1,sy,
				  0,0,1];

		var Tte = [te[0] + T[2],te[1] + T[5],1];
		var Rte = [Tte[0]*S[0] + Tte[1]*S[1],Tte[0]*S[3] + Tte[1]*S[4],1];
		var rTte = [Rte[0] + rT[2],Rte[1] + rT[5],1];

		for(var i = 0; i < rTte.length; i ++){
			if(MONKEY.Math.getPointLength(rTte[i]) > this.fixed)
				rTte[i] = rTte[i].toFixed(this.fixed);
		}
		this.fromArray(rTte);

		return this.float();
	},
	parseInt:function(){
		var te = this.elements;
		for(var i = 0; i < te.length; i ++){
			te[i] = parseInt(te[i]);
		}
		return this;
	},
	float:function(){
		var te = this.elements;
		for(var i = 0; i < te.length; i ++){
			te[i] = parseFloat(te[i]);
		}
		return this;
	}
}

MONKEY.Matrix3 = function(){
	this.elements = new Float32Array([
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	]);
	if(arguments.length > 0){
		MONKEY.Common.trace("MONKEY.Matrix3 use .set() onstead matrix3.");
	}
}
MONKEY.Matrix3.prototype =  {
	constructor:MONKEY.Matrix3,
	set:function(n11,n12,n13,n21,n22,n23,n31,n32,n33){

		te = this.elements;
		te[0] = n11; te[1] = n12; te[2] = n13;
		te[3] = n21; te[4] = n22; te[5] = n23;
		te[6] = n31; te[7] = n32; te[8] = n33;

		return this;
	},
	clone: function () {

		return new this.constructor().fromArray( this.elements );
	},
	copy: function ( m ) {

		var me = m.elements;

		this.set(me[ 0 ], me[ 3 ], me[ 6 ],
				me[ 1 ], me[ 4 ], me[ 7 ],
				me[ 2 ], me[ 5 ], me[ 8 ]);
		return this;
	},
	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[ 0 ] *= s; te[ 3 ] *= s; te[ 6 ] *= s;
		te[ 1 ] *= s; te[ 4 ] *= s; te[ 7 ] *= s;
		te[ 2 ] *= s; te[ 5 ] *= s; te[ 8 ] *= s;

		return this;

	},
	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		var te = this.elements;

		array[ offset ] = te[ 0 ];
		array[ offset + 1 ] = te[ 1 ];
		array[ offset + 2 ] = te[ 2 ];

		array[ offset + 3 ] = te[ 3 ];
		array[ offset + 4 ] = te[ 4 ];
		array[ offset + 5 ] = te[ 5 ];

		array[ offset + 6 ] = te[ 6 ];
		array[ offset + 7 ] = te[ 7 ];
		array[ offset + 8 ]  = te[ 8 ];

		return array;

	}
}
/*
**common常用函数包
**保存常用的函数
**
**调用方式： 直接调用
**
**@author:snow.he
 */
MONKEY.Common = {
	trace:function(_target,_type){
		var type = _type == undefined ? "log" : _type;
		switch(type){
			case "log":console.log(_target);break;
			case "warn":console.warn(_target);break;
			case "error":console.error(_target);break;
		}
	},
	$get:function(_selector){
		if(_selector.slice(0,1) == "#"){
			if(document.querySelector){
				return document.querySelectorAll(_selector);
			}else
				if(document.getElementById){
					return document.getElementById(_selector.slice(1));
				}
		}else{
			if(document.querySelectorAll){
				return document.querySelectorAll(_selector);
			}else{
				//code
			}
		}
	},
	addOnloadEvent:function(func){
		var oldOnload = window.onload;
		if(typeof window.onload != "function"){
				window.onload = func;
			}else{
					window.onload =function(){
							oldOnload();
							func();
					}
				}
	},
	//将rgb表示中转换为字串标识
	RGBToHex:function(rgb){ 
		var regexp = /[0-9]{0,3}/g; 
		var re = rgb.match(regexp);
		var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];  
		for (var i = 0; i < re.length; i++) {
			var r = null, c = re[i], l = c; 
			var hexAr = [];
			while (c > 16){  
			  r = c % 16;  
			  c = (c / 16) >> 0; 
			  hexAr.push(hex[r]);  
			} 
			hexAr.push(hex[c]);
			if(l < 16&&l != ""){        
				hexAr.push(0)
			}
			hexColor += hexAr.reverse().join(''); 
		}   
		return hexColor;  
	},
	//提取文件名的后缀
	getExtension:function(path) {
		var r, pattern = /([^#?]+\.)([^.#?]+)/;
		r = path.match(pattern);
		if (r.length >= 3) {
			return r[2].toLowerCase();
		}
		return null;
	},
	isEmail:function(str){
		if(/^\w+@\w+.\w+$/.test(str)){
			return true;	
		}else{
			return false;	
		}
	},
	supportCanvas:function(){
		var status = true;
		try{
			var test = document.createElement("canvas");
		}catch(e){
			status = false;
		}
		return status;
	},
	getBrowserInfo:function(){
		var agent = navigator.userAgent.toLowerCase() ;

		var regStr_ie = /msie [\d.]+;/gi ;
		var regStr_ff = /firefox\/[\d.]+/gi
		var regStr_chrome = /chrome\/[\d.]+/gi ;
		var regStr_saf = /safari\/[\d.]+/gi ;
		//IE
		if(agent.indexOf("msie") > 0)
		{
			return agent.match(regStr_ie) ;
		}

		//firefox
		if(agent.indexOf("firefox") > 0)
		{
			return agent.match(regStr_ff) ;
		}

		//Chrome
		if(agent.indexOf("chrome") > 0)
		{
			return agent.match(regStr_chrome) ;
		}

		//Safari
		if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
		{
			return agent.match(regStr_saf) ;
		}
	},
	//获取浏览器类型
	getOs:function(){   
		var OsObject = "";   
		if(navigator.userAgent.indexOf("MSIE")>0 || navigator.userAgent.indexOf("Media")>0 ) {   
			 OsObject = "IE";   
		}else   
		  if(isFirefox=navigator.userAgent.indexOf("Firefox")>0){   
			   OsObject = "Firefox";   
		  }else   
			if(isCamino=navigator.userAgent.indexOf("Chrome")>0){   
				 OsObject = "Chrome";   
			}else 
			  if(isMozilla=navigator.userAgent.indexOf("Oprea")>0){   
				   OsObject = "Oprea";   
			  }else
				if(isSafari=navigator.userAgent.indexOf("Safari")>0) {   
					 OsObject = "Safari";   
				}else{
					OsObject = "some anther";   
					}
		//OsObject = OsObject +  navigator.userAgent.match(/OsObject\/([\d.]+)/)[1] ?  navigator.userAgent.match(/firefox\/([\d.]+)/)[1]:"0.0.0";
		return OsObject;
	},
	//自适应居中
	contralSize:function(obj,fw,fh){
		var scaleX = 1,scaleY = 1,scale = 1;
		var nowLeft = 0,nowTop = 0;
		var winWidth = 1024,winHeight = 768;
		if (window.innerWidth) winWidth = window.innerWidth;else if ((document.body) && (document.body.clientWidth)) winWidth = document.body.clientWidth;	
		if (window.innerHeight) winHeight = window.innerHeight;else if ((document.body) && (document.body.clientHeight)) winHeight = document.body.clientHeight;	
		 //document.getElementById("superContainer").style.left = (winWidth - 1024)/2 + "px";	
		 scaleX = winWidth / fw;
		 scaleY = winHeight / fh;
		 scale  = scaleX < scaleY ? scaleX : scaleY;
		// scale = scale > 1 ? 1:scale;
		 nowLeft =(winWidth - fw)/2;
		 nowTop =0 - (1 - scale) * fh/2;
		 return {scale:scale,left:nowLeft,top:nowTop};
	},
	//点是否在多边形内
	PointInPoly:function(pt,poly){
		for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i][1] <= pt.y && pt.y < poly[j][1]) || (poly[j][1] <= pt.y && pt.y < poly[i][1]))
			&& (pt.x < (poly[j][0] - poly[i][0]) * (pt.y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
			 && (c = !c);
			return c;
	},
	/**<p>检测多边形与多边形的碰撞</p>
	 * @method hitTestPolygon
	 * @param {Array} verticesA 多边形A的顶点数组[[x1,y1],[x2,y2],[x3,y3],......]
	 * @param {Array} verticesB 多边形B的顶点数组[[x1,y1],[x2,y2],[x3,y3],......]
	 * @return {Boolean} Returns true if hit
	 */
	hitTestPolygon:function (p1, p2) {
		var i, j, l, listA, normals, vecs, list = [[p1, [], []], [p2, [], []]];
		for (j = 0; j < list.length; j++) {
			listA = list[j][0], normals = list[j][1];
			for (i = 0, l = listA.length; i < l; i++) {
				list[j][2].push(new LVec2(listA[i][0], listA[i][1]));
				if (i < l - 1) {
					normals.push((new LVec2(listA[i + 1][0] - listA[i][0], listA[i + 1][1] - listA[i][1])).normL());
				}
			}
			normals.push((new LVec2(listA[0][0] - listA[l - 1][0], listA[0][1] - listA[l - 1][1])).normL());
		}
		for (j = 0; j < list.length; j++) {
			normals = list[j][1];
			for (i = 0, l = normals.length; i < l; i++) {
				var r1 = LVec2.getMinMax(list[0][2], normals[i]);
				var r2 = LVec2.getMinMax(list[1][2], normals[i]);
				if (r1.max_o < r2.min_o || r1.min_o > r2.max_o) {
					return false;
				}
			}
		}
		return true;
	},
	/**<p>检测一个多边形和一个圆的碰撞</p>
	 * @method hitTestPolygonArc
	 * @static
	 * @param {Array} vertices 多边形的顶点数组[[x1,y1],[x2,y2],[x3,y3],......]
	 * @param {Array} circle 圆[中心坐标x,中心坐标y,半径,半径*半径]
	 * @return {Boolean} Returns true if hit
	 */
	hitTestPolygonArc:function (vs, arc) {
		if (LGlobal.hitPolygon(vs, arc[0], arc[1])) {
			return true;
		}
		var i, j, l, p1, p2, v1, v2, ext, inn, l2;
		for (i = 0, l = vs.length; i < l; i++) {
			j = i < l - 1 ? i + 1 : 0;
			p1 = vs[i], p2 = vs[j];
			v1 = new LVec2(arc[0] - p1[0], arc[1] - p1[1]), v2 = new LVec2(p2[0] - p1[0], p2[1] - p1[1]);
			l2 = v2.normalize();
			inn = LVec2.dot(v1, l2);
			if (inn <= 0) {
				if (v1.x * v1.x + v1.y * v1.y < arc[3]) {
					return true;
				}
			} else if (inn * inn < v2.x * v2.x + v2.y * v2.y) {
				ext = LVec2.cross(v1, l2);
				if (ext * ext < arc[3]) {
					return true;
				}
			}
		}
		return false;
	},
	//元素根据层数排队
	lineUpWithZIndex:function(_elmArr){
		var elmArr = _elmArr;
		if(Array.isArray(elmArr)){
			var	len = elmArr.length,i,j,tmp;
			//元素根据层数排队
			//相等层数不做排序 依然保持入栈顺序
			for(i = len - 1; i >= 1; i --){
				for(j = 0; j <= i - 1; j ++){
					if(elmArr[j].zIndex > elmArr[j + 1].zIndex){
						tmp = elmArr[j + 1];
						elmArr[j + 1] = elmArr[j];
						elmArr[j] = tmp;
					}
				}
			}
		}
		return elmArr;	
	},
	//数组复制
	arrayCopy:function(source){
		if(Array.isArray(source)){
			var arr = new Array();
			for(var i = 0; i < source.length; i ++){
				if(Array.isArray(source[i])){
					arr[i] = MONKEY.Common.arrayCopy(source[i]);
				}else{
					arr[i] = source[i];
				} 
			}
			return arr;
		}else{
			console.log("arraycopy目标必须为Array");
		}
	},
	//冒泡排序
	sortBubble:function(array){
		var len=array.length,i,j,tmp;  
		for(i=len-1;i>=1;i--){  
		  for(j=0;j<=i-1;j++){  
		    if(array[j]>array[j+1]){  
		       d=array[j+1];  
		       array[j+1]=array[j];  
		       array[j]=d;  
		    }  
		  }  
		}  
		return array; 
	},
	//快速排序
	sortQuick:function(array){
		var low=0,high=array.length-1;  
		var sort=function(low,high){  
		  if(low==high){  
		     return;  
		  }  
		  var key=array[low];  
		  var tmplow=low;  
		  var tmphigh=high;  
		  while(low<high){  
		    while(low<high&&key<=array[high]){  
		      --high;  
		    }  
		    array[low]=array[high];  
		    while(low<high&&array[low]<=key)  
		    {  
		       ++low;  
		    }  
		    array[high]=array[low];  
		    if(low==tmplow){  
		      sort(++low,tmphigh);  
		      return;  
		    }  
		  };  
		  array[low]=key;  
		  sort(tmplow,low-1);  
		  sort(high+1,tmphigh);  
		};  
		sort(low,high);  
		sort();  
		return array;
	},
	//插入排序
	sortInsert:function(array){
		var i=1,j,len=array.length,key;  
		for(;i<len;i++){  
		  j=i;  
		  key=array[j];  
		  while(--j>-1){  
		    if(array[j]>key){  
		      array[j+1]=array[j];  
		    }  
		    else  
		    {  
		       break;  
		    }  
		  }  
		  array[j+1]=key;  
		}  
		return array;  
	},
	//获取当前地理位置的经纬度
	getAddress:function(_callbacks,_options){
		var options = _options !== undefined ? _options :  { timeout: 10000, enableHighAccuracy: true };
		navigator.geolocation.getCurrentPosition(getPositionSuccess,getPositionFail, options);
		var end = {status:false,lng:0,lat:0,error:null};
		function getPositionSuccess(position){
			 end.status = true;
			 end.lng = position.coords.longitude;
			 end.lat = position.coords.latitude;
			 _callbacks(end);
		}
		function getPositionFail(error){
			end.error = error;
			_callbacks(end);
		}
	}
}
/*
*	~three.js => THREE.Clock
*	Clock时钟类 
*	记录时间 定时器等
*	为了提高性能,计时器内部不提供自运行功能
*/
MONKEY.Clock = function(autoStart){

	this.autoStart = (autoStart !== undefined) ? autoStart : true;

	this.startTime = 0;
	this.oldTime = 0;
	this.elapsedTime = 0;

	this.running = false;

};

MONKEY.Clock.prototype = {

	constructor: MONKEY.Clock,

	start: function () {

		try{
			this.startTime = ( performance || Date ).now();
		}catch(e){
			this.startTime = (new Date()).getTime();
		}

		this.oldTime = this.startTime;
		this.running = true;

	},

	stop: function () {

		this.getElapsedTime();
		this.running = false;

	},
	//获取oldTime到stop时间差
	getElapsedTime: function () {

		this.getDelta();
		return this.elapsedTime;

	},
	//获取oldTime到现在的时间差,单位秒
	getDelta: function () {

		var diff = 0;

		if ( this.autoStart && ! this.running ) {

			this.start();

		}

		if ( this.running ) {

			try{
				var newTime = ( performance || Date ).now();
			}catch(e){
				var newTime = (new Date()).getTime();
			}

			diff = ( newTime - this.oldTime ) / 1000;
			this.oldTime = newTime;

			this.elapsedTime += diff;

		}

		return diff;

	},
	resetClock:function(){
		this.startTime = 0;
		this.oldTime = 0;
		this.elapsedTime = 0;

		this.running = false;
	}
};

/*
**	html5 cookie/web存储
**	@author:snow.he
 */
MONKEY.Cookie = {
	cookieSign:"MONKEY.Cookie.sign",
	readmeTxt:"只使用html5 web存储",
	setCookie:function(_name,_str){
		if(MONKEY.OSInfo.html5_localStorage){
			_str = JSON.stringify(_str);
			try{
				localStorage.setItem(MONKEY.Cookie.cookieSign + _name,_str);
			}catch(e){
				
			}
		}
	},
	getCookie:function(_name){
		if(MONKEY.OSInfo.html5_localStorage){
			if(localStorage.getItem(MONKEY.Cookie.cookieSign + _name)){
				return JSON.parse(localStorage.getItem(MONKEY.Cookie.cookieSign + _name));
			}else{
				return null;	
			}	
		}
	},
	clearCookie:function(_name){
		if(MONKEY.OSInfo.html5_localStorage){
			localStorage.removeItem(MONKEY.Cookie.cookieSign + _name);	
		}
	}					
};
/*
*	数据组件
* 	修复js浮点误差等问题
* 	提供数学拓展方法
*
* @author snow.he
 */
MONKEY.Math = {
	DEG2RAD: Math.PI / 180,
	RAD2DEG: 180 / Math.PI,
	usePI:3.1415926535897932384626433832795,
	numberCode:["0","1","2","3","4","5","6","7","8","9"],
	radix16Code:["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"],
	letterCode:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
	//生成UUID(36位)
	generateUUID: function () {
		// http://www.broofa.com/Tools/Math.uuid.htm
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
		var uuid = new Array( 36 );
		var rnd = 0, r;
		return function generateUUID() {
			for ( var i = 0; i < 36; i ++ ) {
				if ( i === 8 || i === 13 || i === 18 || i === 23 ) {

					uuid[ i ] = '-';

				} else if ( i === 14 ) {

					uuid[ i ] = '4';

				} else {

					if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];

				}

			}

			return uuid.join( '' );

		};

	}(),
	//生成验证码
	getNumberCaptchas:function(_len){
		var len = _len || 4;
		var captchas = [],code;
		for(var i = 0; i < len; i ++){
			code = MONKEY.Math.numberCode[parseInt(Math.random()*MONKEY.Math.numberCode.length)];
			captchas.push(code);
		}
		return captchas.join("");
	},
	getRadix16Captchas:function(_len){
		var len = _len || 4;
		var captchas = [],code;
		for(var i = 0; i < len; i ++){
			code = MONKEY.Math.radix16Code[parseInt(Math.random()*MONKEY.Math.radix16Code.length)];
			captchas.push(code);
		}
		return captchas.join("");
	},
	getLetterCaptchas:function(_len){
		var len = _len || 4;
		var captchas = [],code;
		for(var i = 0; i < len; i ++){
			code = MONKEY.Math.letterCode[parseInt(Math.random()*MONKEY.Math.letterCode.length)];
			captchas.push(code);
		}
		return captchas.join("");
	},
	//计算多边形面积
	planarPolygonAreaMeters:function(vertexs) { 
		var points = vertexs || [];
		var earthRadiusMeters = 6371000.0;  
		var metersPerDegree = 2.0 * Math.PI * earthRadiusMeters / 360.0;  
		var radiansPerDegree = Math.PI / 180.0;  
		var degreesPerRadian = 180.0 / Math.PI;  
		var pointArr;   
	    var a = 0;  
	    for (var i = 0; i < points.length; ++i) {  
	        var j = (i + 1) % points.length;  
	        var xi = points[i][0] * metersPerDegree * Math.cos(points[i][1] * radiansPerDegree);  
	        var yi = points[i][1] * metersPerDegree;  
	        var xj = points[j][0] * metersPerDegree * Math.cos(points[j][1] * radiansPerDegree);  
	        var yj = points[j][1] * metersPerDegree;  
	        a += xi * yj - xj * yi;  
	    }  
	    return Math.abs(a / 2);  
	},
	//计算向量夹角
	countVectorRange:function(a,b){
		var vectorMo = MONKEY.Math.add(MONKEY.Math.mul(a[0],b[0]),MONKEY.Math.mul(a[1],b[1]));
		var vectorJ = Math.sqrt(MONKEY.Math.mul(MONKEY.Math.add(Math.pow(a[0],2),Math.pow(b[0],2)),MONKEY.Math.add(Math.pow(a[1],2),Math.pow(b[1],2))));
		return Math.acos(vectorMo / vectorJ)/Math.PI*180;	
	},
	//计算三点所形成的夹角
	getThreePointAngle:function(centreX,centreY,sx,sy,ex,ey){
		var a = MONKEY.Math.getPowDistancePointToPoint(sx,sy,ex,ey),
			b = MONKEY.Math.getPowDistancePointToPoint(centreX,centreY,ex,ey),
			c = MONKEY.Math.getPowDistancePointToPoint(centreX,centreY,sx,sy);
		
		var ang = Math.acos((b + c - a) / (2 * Math.sqrt(b) * Math.sqrt(c))) * 180 /Math.PI;
		return ang;
	},
	//返回俩点距离的平方
	getPowDistancePointToPoint:function(x1,y1,x2,y2){
		return (x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2);	
	},
	//点到线段的距离
	getDistancePointToLine:function(x1,y1,x2,y2,x,y){
		var d = 0;
		var diff = 8,midx = (x1+x2)/2,midy = (y1+y2)/2;
		if( (x >= Math.min(x1,x2) && x <= Math.max(x1,x2) && y >= Math.min(y1,y2) && y <= Math.max(y1,y2)) || (x1 == x2 && y >= Math.min(y1,y2) && y <= Math.max(y1,y2)) || (y1 == y2 && x >= Math.min(x1,x2) && x <= Math.max(x1,x2))){
			var up = (y1-y2)*x + (x2 - x1) * y + x1*y2 - x2 * y1;
			var down = Math.sqrt((y1-y2)*(y1-y2) + (x2 - x1) * (x2 - x1));
			 d = Math.abs(up/down);
		}else
			if((Math.abs(x - midx) < diff &&  y >= Math.min(y1,y2) && y <= Math.max(y1,y2)) || (Math.abs(y - midy) < diff && x >= Math.min(x1,x2) && x <= Math.max(x1,x2))){
					var up = (y1-y2)*x + (x2 - x1) * y + x1*y2 - x2 * y1;
					var down = Math.sqrt((y1-y2)*(y1-y2) + (x2 - x1) * (x2 - x1));
					 d = Math.abs(up/down);
			}
		return d;
	},
	//判定rotate角度变化
	getDirection:function(_x0,_y0,_x1,_y1,_x2,_y2){
		var status = false;
		if(_x0 == _x1){
			if(_y0 > _y1){
				if(_x2 > _x0){
					status = true;	
				}else{
					status = false;	
				}
			}else{
				if(_x2 > _x0){
					status = false;
				}else{
					status = true;
				}
			}	
		}else
			if(_y0 == _y1){
				if(_x0 > _x1){
					if(_y2 > _y0){
						status = false;	
					}else{
						status = true;	
					}
				}else{
					if(_y2 > _y0){
						status = true;	
					}else{
						status = false;	
					}
				}
			}else{
				//俩点直线方程
				var m_y = (_y2 - _y0)/(_y1 - _y0),
					m_x = (_x2 - _x0)/(_x1 - _x0);
				if((_y1 > _y0 && _x1 < _x0) ||(_y1 < _y0 && _x1 > _x0)){
					if(m_y > m_x){
						status = false;	
					}else{
						status = true;	
					}
				}else{
					if(m_y > m_x){
						status = true;	
					}else{
						status = false;	
					}
				}
				//(y-y1)/(y2-y1)=(x-x1)/(x2-x1)	
			}
		return status;
	},
	//获取最终点和初始点角度变化
	getChangeAngle:function(centreX,centreY,sx,sy,ex,ey){
		var ang = MONKEY.Math.getThreePointAngle(centreX,centreY,sx,sy,ex,ey);
		var status = MONKEY.Math.getDirection(centreX,centreY,sx,sy,ex,ey);
		ang = status == true ? ang : -ang;
		return ang;
	},
	//提取position.x(相对上层节点)
	getPositionX:function(ele){
		return ele.parent == null? ele.position.x : parseInt(MONKEY.Math.getPositionX(ele.parent)) + parseInt(ele.position.x);
	},
	getPositionY:function(ele){
		return ele.parent == null? ele.position.y : parseInt(MONKEY.Math.getPositionY(ele.parent)) + parseInt(ele.position.y);
	},
	getPageX:function(ele){
		return ele.parentNode == document? ele.offsetLeft : parseInt(MONKEY.Math.getPageX(ele.parentNode)) + parseInt(ele.offsetLeft);
	},
	getPageY:function(ele){
		return ele.parentNode == document? ele.offsetTop : parseInt(MONKEY.Math.getPageY(ele.parentNode)) + parseInt(ele.offsetTop);
	},
	//提取rotate(相对上层节点)
	getRotate:function(ele){
		return ele.parent == null? ele.rotate : parseInt(MONKEY.Math.getRotate(ele.parent)) + parseInt(ele.rotate);
	},
	getScaleX:function(ele){
		return ele.parent == null ? ele.scale.x : MONKEY.Math.getScaleX(ele.parent) * ele.scale.x;
	},
	getScaleY:function(ele){
		return ele.parent == null ? ele.scale.y : MONKEY.Math.getScaleY(ele.parent) * ele.scale.y;
	},
	getPosition:function(object){
		var position = {x:0,y:0};
			position.x = MONKEY.Math.getPositionX(object);
			position.y = MONKEY.Math.getPositionY(object);
		return position;
	},
	getScale:function(object){
		var scale = {x:1,y:1};
			scale.x = MONKEY.Math.getScaleX(object);
			scale.y = MONKEY.Math.getScaleY(object);
		return scale;
	},
	//限制数值在某范围
	clamp:function(value,min,max){
		return Math.max(min,Math.min(max,value));
	},
	//角度转弧度
	degToRad: function ( degrees ) {
		return degrees * MONKEY.Math.DEG2RAD;
	},
	//弧度转角度
	radToDeg: function ( radians ) {
		return radians * MONKEY.Math.RAD2DEG;
	},
	//随机min到max中的随机浮点数
	randFloat: function ( min, max ) {
		return min + Math.random() * ( max - min );
	},
	//随机min到max中的随机整数
	randInt:function( min , max ){
		return min + Math.floor( Math.random() * ( max - min + 1 ) );
	},
	//获取字串的字节长度
	getTrueLength:function(str){  
        var len = str.length, truelen = 0;  
        for(var x = 0; x < len; x++){  
            if(str.charCodeAt(x) > 128){  
                truelen += 2;  
            }else{  
                truelen += 1;  
            }  
        }  
        return truelen;  
    },
	//加法
	add:function(_num1,_num2){

		var num1 = _num1.toString(),num2 = _num2.toString();
		var fruitData =0;
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//判断数据是否有小数，并提取最长的小数位数
		var pointLen1 = this.getPointLength(num1),
			pointLen2 = this.getPointLength(num2);
			
			
		var maxPointLen = pointLen1 > pointLen2?pointLen1:pointLen2;
			
		//若都为整数则直接计算，若有小数，则特殊计算
		if(pointLen1 > 0 || pointLen2 >0){
			var fruit = parseFloat(num1) + parseFloat(num2);

			//计算结果若为科学计数，则改为数学计数
			if(fruit.toString().indexOf("e") > -1){
				fruit = this.setScientificNotationToDecimal(fruit,true);
			}
			
			//判断结果小数位是否符合逻辑，若不符合，则强行四舍五入
			var fruitPointLength = this.getPointLength(fruit);
			if(fruitPointLength > maxPointLen){
				fruit = this.toFixed(fruit,maxPointLen);
			}
			
			//处理完毕
			fruitData = fruit;
			
		}else{
			fruitData = parseInt(num1) + parseInt(num2);
		}

		fruitData = Number(fruitData);

		return fruitData;
	},

	//减法计算
	sub:function(_num1,_num2){

		var num1 = _num1,num2 = _num2;
		var fruitData = 0;
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//判断数据是否有小数，并提取最长的小数位数
		var pointLen1 = this.getPointLength(num1),
			pointLen2 = this.getPointLength(num2);
			
			
		var maxPointLen = pointLen1 > pointLen2?pointLen1:pointLen2;
			
		//若都为整数则直接计算，若有小数，则特殊计算
		if(pointLen1 > 0 || pointLen2 >0){
			var fruit = parseFloat(num1) - parseFloat(num2);

			//计算结果若为科学计数，则改为数学计数
			if(fruit.toString().indexOf("e") > -1){
				fruit = this.setScientificNotationToDecimal(fruit,true);
			}
			
			//判断结果小数位是否符合逻辑，若不符合，则强行四舍五入
			var fruitPointLength = this.getPointLength(fruit);
			if(fruitPointLength > maxPointLen){
				fruit = this.toFixed(fruit,maxPointLen);
			}
			
			//处理完毕
			fruitData = fruit;
			
		}else{
			fruitData = parseInt(num1) - parseInt(num2);
		}

		fruitData = Number(fruitData);
		
		return fruitData;
		
	},

	//乘法计算
	mul:function(_num1,_num2){
		var num1 = _num1.toString(),num2=_num2.toString();
		var fruitData =0;
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//判断数据是否有小数，并提取最长的小数位数
		var pointLen1 = this.getPointLength(num1),
			pointLen2 = this.getPointLength(num2);
			
			
		var maxPointLen = parseInt(pointLen1) + parseInt(pointLen2);
			
		//若都为整数则直接计算，若有小数，则特殊计算
		if(pointLen1 > 0 || pointLen2 >0){
			var fruit = parseFloat(num1) * parseFloat(num2);

			//计算结果若为科学计数，则改为数学计数
			if(fruit.toString().indexOf("e") > -1){
				fruit = this.setScientificNotationToDecimal(fruit,true);
			}
			
			//判断结果小数位是否符合逻辑，若不符合，则强行四舍五入
			var fruitPointLength = this.getPointLength(fruit);
			if(fruitPointLength > maxPointLen){
				fruit = this.toFixed(fruit,maxPointLen);
			}
			
			//处理完毕
			fruitData = fruit;
			
		}else{
			fruitData = parseInt(num1) * parseInt(num2);
		}
		
		if(fruitData.toString().indexOf("e") > -1){
			fruitData = this.setScientificNotationToDecimal(fruitData,true);
		}
		
		fruitData = Number(fruitData);
		
		return fruitData;

	},

	//除法计算
	/*
	*@将除数和被除数整数与小数分离，分别计算（类似于通分计算）
	*/
	div:function(_num1,_num2){
		var num1 = _num1.toString(),num2 = _num2.toString();
		var de1=0,de2=0,int1,int2;
		var returnData = 0;
		var n1Status = false,n2Status = false;
		
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//判定正负
		if(num1.charAt(0) == "-"){
			n1Status = true;
			num1 = num1.slice(1);
			}
		if(num2.charAt(0) == "-"){
			n2Status = true;
			num2 = num2.slice(1);
			}
		
		//提取小数部分
		de1 = this.getPointLength(num1);
		de2 = this.getPointLength(num2);	
		console.log(de1+","+de2);
		console.log(num1+";"+num2)
		//整理整数部分并进行计算	
		with(Math){   
			int1=Number(num1.toString().replace(".",""))   
			int2=Number(num2.toString().replace(".",""))  
			returnData = int1/int2;
			console.log(returnData)
			if(returnData.toString().indexOf("e") > -1){
				returnData = this.setScientificNotationToDecimal(returnData,true);
			}
			if(Math.abs(de2-de1) >0){
				if(de1 >de2){
					returnData = this.moveDecimalPoint(returnData,Math.abs(de1-de2),"left");  
				}else{
					returnData = this.moveDecimalPoint(returnData,Math.abs(de1-de2),"right");  
					}
			}
		} 
		if(returnData.toString().indexOf("e") > -1){
			returnData = this.setScientificNotationToDecimal(returnData,true);
		}
		
		//调整正负
		if((n1Status && !n2Status) || (!n1Status && n2Status)){
			returnData = "-" + returnData;
			}
		
		returnData = Number(returnData);
		return returnData;
	},

	//取最大值
	max:function(_num1,_num2){
		var num1 = _num1,num2 = _num2;
		var maxNumber = num1;
		
		//判断俩数的相减的差是否大于0
		var subData = this.sub(num1,num2);
		
		if(subData > 0 ){
			maxNumber = num1;
		}else
			if(subData == 0){
				maxNumber = num1;
			}else{
				maxNumber = num2;
			}
			
		return maxNumber;

	},

	//取最小值
	min:function(_num1,_num2){
		var num1 = _num1,num2 = _num2;
		var minNumber = num1;
		
		//判断俩数的差
		var subData = this.sub(num1,num2);
		if(subData >0){
			minNumber = num1;
			
		}else{
			minNumber = num2;
			
		}
		
		return minNumber;

	},
	
	//开方 采用牛顿法进行开方计算，在精度超过15时会非常缓慢
	/*
	sqrt:function(_num,_len){
		var num = _num,len = _len == undefined?15:_len;
		console.log(Math.pow(10,this.sub(0,len)))
		if(num >0){
			var g = this.div(num,2);
			while(this.abs(this.mul(g,g)-num)>Math.pow(10,this.sub(0,len)))
			{
				g = this.div(this.add(g,this.div(num,g)),2);
			}		
		}
		
		return g;
	
	},
	*/
	//绝对值
	abs:function(_num){
		return Math.abs(_num);

	},
	
	//约分 reduction of a fraction
	red:function(_num1,_num2){
		var num1 = _num1.toString(),num2 = _num2.toString();
		var ret = {num1:0,num2:0},
			numStatus = {numStatus1:true,numStatus2:true},
			minNumber = 1;
			
			//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//若不为整数则返回初始返回对象字面量
		if(this.getPointLength(num1) > 0 || this.getPointLength(num2) > 0){
			return ret;			
		}
		
		//判断是否为负数
		if(parseFloat(num1) < 0){
			numStatus.numStatus1 = false;
			num1 = this.abs(num1);
		}
		if(parseFloat(num2) <0){
			numStatus.numStatus2 = false;
			num2 = this.abs(num2);
		}
		
		//确定最大公约数
		minNumber = this.getMaxApp(num1,num2);
		
		//约分
		ret.num1 = this.div(num1,minNumber);
		ret.num2 = this.div(num2,minNumber);
			
		
		//数据整理
		if(numStatus.numStatus1 == false && (numStatus.numStatus1 != numStatus.numStatus2)){
			if(numStatus.numStatus1 == false){
				ret.num1 = "-" + ret.num1;
			}
			if(numStatus.numStatus2 == false){
				ret.num2 = "-" + ret.num2;
			}
			
		}
		
		
		return ret;
		
	},
	
	//四舍五入
	toFixed:function(_data,_len){
		var data = _data.toString(),maxLength=_len;
		//询问数据的小数位数
		var pointLength = this.getPointLength(data);
		
		//数据的小数位数大于目标位数，才进行四舍五入
		if(pointLength > maxLength){
			if(data.indexOf(".") > -1){
				data = Math.round(data*Math.pow(10,maxLength))/Math.pow(10,maxLength).toString();
				}
		}

		return data;
	},

	//提取最大公约数
	getMaxApp:function(_num1,_num2){
		var num1 = _num1.toString(),num2 = _num2.toString();
		var returnData =0;
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		//只提取整数的最大公约数,若参数不符合条件，则返回0
		if( (num1.toString().indexOf(".") == -1 && !isNaN(num1))|| (num2.toString().indexOf(".") == -1 && !isNaN(num2))){
			if(num1%num2==0){
				returnData = num2;
			}else{
				returnData = arguments.callee(num2,num1%num2);
			}
		}
		
		//判断是否为科学计数，若是则转换为数学计数
		if(returnData.toString().indexOf("e") > -1){
			returnData = this.setScientificNotationToDecimal(returnData,true);
		}

		return returnData;

	},

	//提取最小公倍数
	getMinApp:function(_num1,_num2){
		var num1 = _num1, num2 = _num2;
		var returnData = 0,maxApp = 1;
		var x,y;
		
		//判断是否为科学计数，若是则转换为数学计数
		if(num1.toString().indexOf("e") > -1){
			num1 = this.setScientificNotationToDecimal(num1,true);
		}
		if(num2.toString().indexOf("e") > -1){
			num2 = this.setScientificNotationToDecimal(num2,true);
		}
		
		
		//只提取整数的最小公倍数,若不符合条件，则返回0
		if( (num1.toString().indexOf(".") == -1 && !isNaN(num1))|| (num2.toString().indexOf(".") == -1 && !isNaN(num2))){
			//取俩数的最大公约数
			maxApp = this.getMaxApp(num1,num2);
			
			//求最小公倍数
			x = this.div(num1,maxApp);
			y = this.div(num1,maxApp);
			returnData = this.mul(this.mul(x,y),maxApp);

		}

		//判断是否为科学计数，若是则转换为数学计数
		if(returnData.toString().indexOf("e") > -1){
			returnData = this.setScientificNotationToDecimal(returnData,true);
		}
		
		return  returnData;

	},

	//查询数据类型
	getDataType:function(_data){
		var data = _data,type = 3;

		//预处理数据
		data = this.delLastAct(data.toString());
		
		if(!isNaN(data)){
			
			
		}else{
			
		}

		

	},

	//查询小数位数
	getPointLength:function(_data){
		
		var data = _data.toString();
		var len = (data.length - data.indexOf(".")-1) == data.length?0:(data.length - data.indexOf(".")-1);
		return len;
	},
	
	//获取母字串中含有子字串的数量
	getQuantityOfStr:function(_str,_little){
		var str = _str.toString(),little = _little.toString();
		var quantity = 0;
		var len = little.length,num;
		num = str.indexOf(little);
		while(num > -1){
			quantity ++ ;
			num = str.indexOf(little,num+len);	
		}
		
		return quantity;
	},
	//去除数值末位不必要的0
	delLastAct:function(_data){
		var str = _data.toString();
		var midStr ="";
			if(str.indexOf(".") > -1){
				midStr = str.charAt(str.length-1);
				while(midStr == "0"){
					str = str.slice(0,str.length-1);
					midStr = str.charAt(str.length-1);
					}
				if(str.charAt(str.length-1) == "."){
					str = str.slice(0,str.length-1);
					}
				}
		return str;
	},

	/**小数位平移
	 **@pramgram参数：数据(string),位数(number),平移方向(right || left);
	**/
	moveDecimalPoint:function(_data,_num,_boo){

			var data=_data.toString(),number = _num,boo= _boo=="right"?"right":"left";
			var x,y;
			
			//判断移位数
			if(number < 0){
				return data;
				}
			
			x = data.indexOf(".");
			if(x == -1){
				data = data +".0";
				}
			x = data.indexOf(".");
			if(boo == "right"){
				if(parseInt(data.length-x-1) < number){
					for(var i = data.length-x-1;i<=number;i++){
						data = data +"0";
						}
					}
				}
			if(boo == "left"){
				if(x-1 < number){
					for(var i = x;i<=number;i++){
						data = "0"+data;
						}
					}
				}
			x = data.indexOf(".");
			if(boo == "right"){
				if(data.length-x-1 <= number){
					data = data.slice(0,x)+data.slice(x+1);
					}else{
						data = data.slice(0,x)+data.slice(x+1);
						data = data.slice(0,x+number)+"."+data.slice(x+number);
					}
				}
			if(boo == "left"){
				data = data.slice(0,x)+data.slice(x+1);
				data = data.slice(0,x-number)+"."+data.slice(x-number);
				}
			
			//数据整理
			if(data > 1){
				var fir = data.toString().charAt(0);
				while(fir == 0){
					data = data.toString().slice(1);
					fir = data.toString().charAt(0);
					}
				}
			if(data >0 && data<1){
				var sec = data.toString().charAt(1);
				while(sec == 0){
					data =data.toString().charAt(0)+ data.toString().slice(2);
					sec  = data.toString().charAt(1);
					}
				}
				
			return data;
			},

	/**科学计数法转和小数转换
		*@pramgram参数:数据(string||number),类型(true:科学计数法to小数；false:小数to科学计数法)
	*
	***/
	setScientificNotationToDecimal:function(_num,_boo){

			var number = _num.toString(),boo = _boo==false?false:true;
			var isPlus = true;
			
			//确定正负
			if(number.charAt(0) == "-"){
				isPlus = false;
				number = number.slice(1);
			}

			if(boo == true){
				//科学计数法法转换为数学计数
				if(number.indexOf("e") > -1){
					
						//将数据拆解
						var n = number.indexOf("e");
						var num = number.slice(0,n);
						var num2 = number.slice(n+1);

						if(num2 <0){
							number = this.moveDecimalPoint(num,Math.abs(num2),"left");
						}else{
							number = this.moveDecimalPoint(num,Math.abs(num2),"right");
						}
				}
				
			}else{
				//小数转换为科学计数法
				
			}
			
			//调整正负
			if(isPlus){
				number = number.toString();
			}else{
				number = "-" + number;
			}
			
			return number;

			}
}


//缓动
//http://www.robertpenner.com/easing/

/*Linear：直线匀速；
Quadratic：二次方的缓动（t^2）；
Cubic：三次方的缓动（t^3）；
Quartic：四次方的缓动（t^4）；
Quintic：五次方的缓动（t^5）；
Sinusoidal：正弦曲线的缓动（sin(t)）；
Exponential：指数曲线的缓动（2^t）；
Circular：圆形曲线的缓动（sqrt(1-t^2)）；
Elastic：指数衰减的正弦曲线缓动；
Back：超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
Bounce：指数衰减的反弹缓动。
*
*		author:snow.he
 */
MONKEY.Tween = {
	status:true,
	iDuration:10,
	_tween:{
		Linear: function(t,b,c,d){ 
			return c*t/d + b; 
		},
		easeInQuad: function(t,b,c,d){
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function(t,b,c,d){
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function(t,b,c,d){
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function(t,b,c,d){
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function(t,b,c,d){
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function(t,b,c,d){
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function(t,b,c,d){
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function(t,b,c,d){
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function(t,b,c,d){
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function(t,b,c,d){
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function(t,b,c,d){
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function(t,b,c,d){
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function(t,b,c,d){
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function(t,b,c,d){
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function(t,b,c,d){
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function(t,b,c,d){
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function(t,b,c,d){
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function(t,b,c,d){
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function(t,b,c,d){
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function(t,b,c,d){
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function(t,b,c,d){
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function(t,b,c,d,a,p){
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function(t,b,c,d,a,p){
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
		},
		easeInOutElastic: function(t,b,c,d,a,p){
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function(t,b,c,d,s){
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function(t,b,c,d,s){
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function(t,b,c,d,s){
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function(t,b,c,d){
			return c - self._tween.easeOutBounce(d-t, 0, c, d) + b;
		},
		easeOutBounce: function(t,b,c,d){
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function(t,b,c,d){
			if (t < d/2) return  self._tween.easeInBounce(t*2, 0, c, d) * .5 + b;
			else return  self._tween.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	},
	stop:function(){
		if(MONKEY.Tween.status)
			MONKEY.Tween.status = false;	
	},
	/*
	动画 --- 页面元素
	@program:
	_ele:动画对象
	_data:动画参数[left,top,width,height]
	_easeType:缓动类型
	_duration:持续时间
	_
	*/
	animate:function(_ele,_data,_easeType,_duration,_blackFun){
		if(!MONKEY.Tween.status) MONKEY.Tween.status = true;
		var ele = _ele,
			data = _data,
			easeType = _easeType?_easeType:"linear",
			duration = _duration,
			blackFunc = _blackFun ? _blackFun:function(){};
		var fun = MONKEY.Tween._tween[easeType];
		var t = 0,
			d = parseInt(duration/10),
			nowDuration = MONKEY.Tween.iDuration;
		var aniData = {
				left:parseInt(ele.offsetLeft),
				top:parseInt(ele.offsetTop),
				width:parseInt(ele.style.width),
				height:parseInt(ele.style.height)
				};
		var blackData = {
				left:data.left?MONKEY.Tween.getBlackData(aniData.left,data.left):aniData.left,
				top:data.top?MONKEY.Tween.getBlackData(aniData.top,data.top):aniData.top,
				width:data.width?MONKEY.Tween.getBlackData(aniData.width,data.width):aniData.width,
				height:data.height?MONKEY.Tween.getBlackData(aniData.height,data.height):aniData.height
			};
		var changeData = {
				left:parseInt(blackData.left) - parseInt(aniData.left),
				top:parseInt(blackData.top) - parseInt(aniData.top),
				width:parseInt(blackData.width) - parseInt(aniData.width),
				height:parseInt(blackData.height) - parseInt(aniData.height)
			};
		_run();
		function _run(){
			if(t<d){
				t++;
				for(var i in changeData){
					if(changeData[i] != 0){
						ele.style[i] = Math.ceil(fun(t,aniData[i],changeData[i],d))+ "px";	
					}	
				}
				setTimeout(_run, nowDuration);
			}else{
				for(var j in blackData){
					ele.style[j] = parseInt(blackData[j]) + "px";	
				}
				blackFunc();
			}
		}
		
	},
	/*
	*缓动
	*参数:_beginData:初始参数(若未指定，则默认从0开始),无单位。ex:{x:50}
		 _endData:目标参数或者变化数据。ex:{x:150} || {x:"+=100"} || {x:"=150"}
		 _easeType:指定缓动类型。ex:"Linear"
		 _duration:缓动时间，毫秒。ex:2000 
		 _updataFunc:指定更新函数。
		 _blackFunc:回调函数。
	注:所有参与缓动的数据必须在目标参数中出现,否则将被忽略。
	*
	*/
	canvasAni:function(_beginData,_endData,_easeType,_duration,_updataFunc,_blackFunc){
		if(!MONKEY.Tween.status) MONKEY.Tween.status = true;
		var self = MONKEY.Tween;
		var beginData = _beginData,
			endData = _endData,
			easeType = _easeType || "Linear",
			duration = _duration || 1000,
			updataFunc = _updataFunc ? _updataFunc : function(){},
			blackFunc = _blackFunc ? _blackFunc : function(){};
		var fun = MONKEY.Tween._tween[easeType];
		var t = 0,
			nowDuration = MONKEY.Tween.iDuration,
			d = parseInt(duration/nowDuration);
		//提取属性名称
		var list = [];
		for(var i in  endData){
			list.push(i);	
		}
		//整理数据
		var aniData = {},blackData = {},changeData = {};
		for(var j in list){
			var str = list[j];
			aniData[str] = beginData[str] ?  beginData[str] : 0;
			blackData[str] = endData[str] == undefined ?  aniData[str] : MONKEY.Tween.getBlackData(aniData[str],endData[str],false);
			changeData[str] = parseFloat(blackData[str]) - parseFloat(aniData[str]);
		}
		_run();
		function _run(){
			if(t<d){
				t++;
				var data = {};
				for(var i in changeData){
					if(changeData[i] != 0){
						data[i] = Math.ceil(fun(t,aniData[i],changeData[i],d));	
					}
				}
				updataFunc(data);
				if(self.status){
					setTimeout(_run, nowDuration);
				}else{
					self.status = true;	
				}
			}else{
				var data = {};
				for(var j in blackData){
					if(blackData[j] != 0){
						data[j] = blackData[j];	
					}
				}
				updataFunc(data);
				blackFunc();
			}
		}
			
	},
	//提取坐标变化值[当前值，变化数据,是否取整]
	getBlackData:function(_now,_dataStr,_boo){
			var now = _now,
				dataStr = _dataStr.toString(),
				boo = _boo == false ? false : true;
			var returnStr = now;
			var n = dataStr.indexOf("=");
			if(n == 1){
				var mathStr = dataStr.slice(0,1),
					numStr = dataStr.slice(2);
				now = _boo ? parseInt(now) : parseFloat(now);
				numStr = _boo ? parseInt(numStr) : parseFloat(numStr);  
				switch(mathStr){
					case "+":returnStr = now + numStr;break;
					case "-":returnStr = now - numStr;break;
				}
			}else
				if(n == 0){
					returnStr = _boo ?  parseFloat(dataStr) : parseInt(dataStr);	
				}else
					if(n < 0){
						returnStr = _boo ? parseFloat(dataStr) : parseInt(dataStr);
					}
			return returnStr;
	},
	//改变运转速度
	setIDuration:function(_i){
		if(!isNaN(_i)){
			MONKEY.Tween.iDuration = _i;	
		}else{
			throw new Error("iDuration 必须是数值!");	
		}
	},
	getIDuration:function(_i){
		return MONKEY.Tween.iDuration;
	}
}

//渲染器
/*
* 基本组成部分，渲染场景
* author:snow.he
 */
MONKEY.Renderer = function(parameters){
	MONKEY.Common.trace("MONKEY.Renderer : " + MONKEY.REVISION);

	parameters = parameters || {};
	var initStatus = false;
	//导入 || 构造 画布
	var _canvas = parameters.canvas !== undefined ? parameters.canvas :(function(){MONKEY.Common.trace("canvas指定失败","error");initStatus = true;})();
	if(initStatus) return;
	var	_context = parameters.context !== undefined ? parameters.context : _canvas.getContext("2d"),
		_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
		_depth = parameters.depth !== undefined ? parameters.depth : true,
		parentElm = parameters.parent !== undefined ? parameters.parent : document.body ;
	

	this.canvas = _canvas;
	this.ctx = _context;

	//创建缓冲画布
	this.backBuffer = document.createElement("canvas");
	this.backBufferCtx = this.backBuffer.getContext("2d");

	//设置宽高
	var width_default = parseInt(_canvas.width) || parseInt(_canvas.style.width) || 1024,
		height_default =parseInt(_canvas.height) || parseInt(_canvas.style.height) || 768;


	this.backBuffer.width = parameters.width !== undefined ? parameters.width : width_default;
	this.backBuffer.height = parameters.height !== undefined ? parameters.height : height_default;
	this.canvas.width = parameters.width !== undefined ? parameters.width : width_default;
	this.canvas.height = parameters.height !== undefined ? parameters.height : height_default;

	//设置属性
	//频率[每秒刷新次数]
	this.ftp = parameters.ftp !== undefined ? parameters.ftp : 50;
	//锁定频率[锁定之后不能更改刷新频率]
	this.ftpFixed = false;
	//fps属性
	this.fps = 0;
	this.lastFrame;
	this.nowFrame;
	this.pauseStatus = true;
	//clear
	this.autoClear = true;
	//color
	this.color = parameters.color !== undefined ? parameters.color : "#000000";
	this.colorStatus = parameters.color !== undefined ? true : false;
	//场景栈
	this.sceneElm = [];
	//场景中的btn
	this.btnElm = [];
	//自循环对象
	this.sint;
	MONKEY.init({width:width_default,height:height_default,canvas:this.canvas})
}
MONKEY.Renderer.prototype = {
	constructor:MONKEY.Renderer,
	getCanvas:function(){
		return this.canvas;
	},
	getCanvasData:function(){
		return {
			width:this.canvas.width,
			height:this.canvas.height
		}
	},
	getBackBuffer:function(){
		return this.backBuffer;
	},
	getCanvasDataURL:function(_type,_encoderOptions,x,y,w,h){
		var type = _type || "image/jpeg",
			encoderOptions = _encoderOptions || 0.5;
		if(arguments.length < 3){
			return this.canvas.toDataURL(type,encoderOptions);
		}else{
			this.pause();
			try{
				var imageData = this.ctx.getImageData(x,y,w,h);
			}catch(e){
				console.error("若指定區域請在服務器上執行...");
				console.log(e);
				return;
			}
			var tempCanvas = document.createElement("canvas");
				tempCanvas.width = w - x;
				tempCanvas.height = h - y;
			tempCanvas.getContext("2d").putImageData(imageData,0,0);
			var fDatauri = tempCanvas.toDataURL(type.encoderOptions);
			this.pause();
			return fDatauri;
			
			/*this.pause();
			if(this.colorStatus){
				this.ctx.fillRect(0,0,x,this.canvas.height);
				this.ctx.fillRect(x,0,w,y);
				this.ctx.fillRect(x + w,0,this.canvas.width - x - w,this.canvas.height);
				this.ctx.fillRect(x,y + h,w,this.canvas.height,this.canvas.height - y - h);
			}else{
				this.ctx.clearRect(0,0,x,this.canvas.height);
				this.ctx.clearRect(x,0,w,y);
				this.ctx.clearRect(x + w,0,this.canvas.width - x - w,this.canvas.height);
				this.ctx.clearRect(x,y + h,w,this.canvas.height,this.canvas.height - y - h);
			}
			
			var datauri = this.canvas.toDataURL(type,encoderOptions);
			this.pause();
			return datauri;
			*/
		}
		
	},
	//添加场景
	add:function(object){
		if ( arguments.length > 1 ) {
			for ( var i = 0; i < arguments.length; i ++ ) {
				this.add( arguments[ i ] );
			}
		}
		if ( object === this ) {
			console.error( "Render.add: object can't be added as a child of itself.", object );
		}else{
			this.sceneElm.push( object );
			this.sceneElm = MONKEY.Common.lineUpWithZIndex(this.sceneElm);
		}
		//this.sceneElm[_name] = _Elm;
	},
	//删除场景
	remove:function(_name){
		for(var i = 0; i < this.sceneElm.length; i ++){
			if(this.sceneElm[i].name == _name){
				this.sceneElm.splice(i,1);
			}
		}
	},
	updataZindex:function(){
		this.sceneElm = MONKEY.Common.lineUpWithZIndex(this.sceneElm);
	},
	delAllScene:function(){
		for(var i in this.sceneElm){
			this.remove(i);
		}
	},
	getScene:function(_name){
		if(_name === undefined) return null;
		for(var i = 0; i < this.sceneElm.length; i ++){
			if(this.sceneElm[i].name == _name){
				return this.sceneElm[i];
			}
		}
	},
	getSceneIndex:function(_name){
		return this.getScene(_name).zIndex;
	},
	showScene:function(){
		var sceneArr = [];
		for(var i = 0; i < arguments.length; i ++){
			sceneArr.push(arguments[i]);
		}
		for(var j = 0; j < this.sceneElm.length; j ++){
			if(sceneArr.indexOf(this.sceneElm[j].name) > -1){
				this.sceneElm[j].visible = true;
			}
		}
	},
	hideScene:function(){
		var sceneArr = [];
		for(var i = 0; i < arguments.length; i ++){
			sceneArr.push(arguments[i]);
		}
		for(var j = 0; j < this.sceneElm.length; j ++){
			if(sceneArr.indexOf(this.sceneElm[j].name) > -1){
				this.sceneElm[j].visible = true;
			}
		}
	},
	showSceneAndHide:function(){
		var sceneArr = [];
		for(var i = 0; i < arguments.length; i ++){
			sceneArr.push(arguments[i]);
		}
		for(var j = 0; j < this.sceneElm.length; j ++){
			if(sceneArr.indexOf(this.sceneElm[j].name) > -1){
				this.sceneElm[j].visible = true;
			}else{
				this.sceneElm[j].visible = false;
			}
		}
	},
	hideSceneAndShow:function(){
		var sceneArr = [];
		for(var i = 0; i < arguments.length; i ++){
			sceneArr.push(arguments[i]);
		}
		for(var j = 0; j < this.sceneElm.length; j ++){
			if(sceneArr.indexOf(this.sceneElm[j].name) > -1){
				this.sceneElm[j].visible = false;
			}else{
				this.sceneElm[j].visible = true;
			}
		}
	},
	//初始化
	init:function(){
		clearInterval(this.sint);
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.backBufferCtx.clearRect(0,0,this.backBuffer.width,this.backBuffer.height);
	},
	//开始渲染
	begin:function(){
		this.init();
		this.lastFrame = (new Date()).getTime();
		this.sint = setInterval((function(progra){
			return function(){
				if(progra.pauseStatus){
					progra.render();
				}
			}
		})(this),1000/this.ftp);
	},
	pause:function(){
		if(this.pauseStatus){
			this.pauseStatus = false;
		}else{
			this.pauseStatus = true;
		}
	},
	stop:function(){
		clearInterval(this.sint);
	},
	//主渲染方法
	render:function(){
		//清除历史痕迹
		if(this.autoClear){
			this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        	this.backBufferCtx.clearRect(0,0,this.backBuffer.width,this.backBuffer.height);
		}
		if(this.colorStatus){
			this.backBufferCtx.save();
			this.backBufferCtx.fillStyle = this.color ;
			this.backBufferCtx.fillRect(0,0,this.backBuffer.width,this.backBuffer.height);
			this.backBufferCtx.restore();
		}
		
		this.nowFrame = (new Date()).getTime();
		//保存实时输出频率
		this.fps = parseInt(1000/(this.nowFrame-this.lastFrame) > 1000?1000:1000/(this.nowFrame-this.lastFrame));
		this.lastFrame = this.nowFrame;

		//清空btnElm
		this.btnElm = [];
		//loading
		if(MONKEY.Preload.preShowStatus){
			MONKEY.Preload.updataPercent();
			//console.log(MONKEY.Preload.preShowList[MONKEY.Preload.preShowType])
			if(MONKEY.Preload.preShowType >= 0){
				MONKEY.Preload.preShowList[MONKEY.Preload.preShowType].call(this,this.backBufferCtx,MONKEY.Preload.prePercent);
			}else{
				MONKEY.Preload.staticDraw(this.backBufferCtx,MONKEY.Preload.prePercent);
			}
			
		}else{
			//渲染场景
			for(var i in this.sceneElm){
				//绘画
				if(this.sceneElm[i].renderDraw){
					this.renderDraw(this.sceneElm[i]);
				}
			}
		}
		
		this.ctx.drawImage(this.backBuffer,0,0);
		this.pushBtnToPointer();
	},
	pushBtnToPointer:function(){
		MONKEY.pointer.setSceneBtnElm(this.btnElm);
	},
	getFtp:function(){
		return this.ftp;
	},
	setFtp:function(_ftp){
		if(ftpFixed){
			return;
		}
		if(_ftp > 0){
			this.ftp = _ftp;
			this.stop();
			this.begin();
		}
	},
	getFPS:function(){
		return this.fps;
	},
	renderDraw:function(_object){
		if(!_object.visible) return;
		if(_object.renderDraw){
			switch(_object.type){
				case "Scene" :
					this.renderDrawScene(_object);
					break;
				case "Animal":
					this.renderDrawAnimal(_object);
					break;	
				case "Button":
						this.renderDrawButton(_object);
					break;	
				case "IntervalAnimation":
					this.renderDrawAnimation(_object);
					break;
				case "AnyIntervalAnimation":
					this.renderDrawAnyAnimation(_object);
					break;
				case "SameGraphAnimation":
					this.renderDrawSameGrapAnimation(_object);
					break;
				case "Text":
					this.renderDrawText(_object);
					break;
				default:
					this.renderDrawOther(_object);
					break;
			}
		}
		if(_object.type == "Button"){
			this.btnElm.push(_object);
		}else
			if(_object.listenerStatus){
				this.btnElm.push(_object);
			}
		if(_object.isDrawFunc){
			_object.draw(this.backBuffer,this.backBufferCtx,this);
		}
		//运行自函数
		_object.countMotionFuncs();
	},
	renderDrawOther:function(_object){

	},

	renderDrawScene:function(_scene){
		if(_scene.visible){
			var position = _scene.position;
			var sPosition = _scene.sPosition;

			var rotate = _scene.rotate,
				rotatePoint = {x:_scene.rotatePoint.x + MONKEY.Math.getPositionX(_scene) - _scene.position.x,
								y:_scene.rotatePoint.y + MONKEY.Math.getPositionY(_scene) - _scene.position.y};

			if(_scene.background != null && _scene.backgroundStatus){	
				var proto = {
					position:position,
					sPosition:sPosition,
					rotate:rotate,
					rotatePoint:rotatePoint,
					alpha:_scene.alpha
				}
				var width = _scene.special.width == null ? _scene.background.width : _scene.special.width,
					height = _scene.special.height == null ? _scene.background.height : _scene.special.height;
				var scale = _scene.scale;
				proto.special = {width:width,height:height};
				proto.showSpecial = {width:width*scale.x,height:height*scale.y};

				this.renderDrawImage(_scene.background,proto);
			}
			if(_scene.children.length > 0){
				for(var i = 0; i < _scene.children.length; i ++){
					this.renderDraw(_scene.children[i]);
				}
			}
		}
	},
	renderDrawAnimal:function(_animal){
		if(_animal.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_animal);
				position.y = MONKEY.Math.getPositionY(_animal);
			var sPosition = _animal.sPosition;

			var rotate = MONKEY.Math.getRotate(_animal),
				rotatePoint = {x:_animal.rotatePoint.x + position.x - _animal.position.x,
								y:_animal.rotatePoint.y + position.y - _animal.position.y};
			if(_animal.background != null && _animal.backgroundStatus){	
				var proto = {
					position:position,
					sPosition:sPosition,
					rotate:rotate,
					rotatePoint:rotatePoint,
					alpha:_animal.alpha,
				}
				if(_animal.scale){
					var width = _animal.special.width == null ? _animal.background.width : _animal.special.width,
						height = _animal.special.height == null ? _animal.background.height : _animal.special.height;
					var scale = MONKEY.Math.getScale(_animal);
					proto.special = {width:width,height:height};
					proto.showSpecial = {width:width*scale.x,height:height*scale.y};
				}
				this.renderDrawImage(_animal.background,proto);
			}
			if(_animal.children.length > 0){
				for(var i = 0; i < _animal.children.length; i ++){
					this.renderDraw(_animal.children[i]);
				}
			}
		}
	},
	renderDrawButton:function(_btnElm){
		if(_btnElm.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_btnElm);
				position.y = MONKEY.Math.getPositionY(_btnElm);
			var sPosition = _btnElm.sPosition;

			var rotate = MONKEY.Math.getRotate(_btnElm),
				rotatePoint = {x:_btnElm.rotatePoint.x + position.x - _btnElm.position.x,
							   y:_btnElm.rotatePoint.y + position.y - _btnElm.position.y};

			if(_btnElm.choiceSwitch && _btnElm.choiceStatus){
				_btnElm.showImg = _btnElm.choiceImg;
			}else{
				if(_btnElm.status == "up"){
					_btnElm.showImg = _btnElm.upImg;
				}else
					if(_btnElm.status == "down"){
						_btnElm.showImg = _btnElm.downImg;
					}else
						if(_btnElm.status == "move"){
							_btnElm.showImg = _btnElm.moveImg;
						}else
							if(_btnElm.status == "disable"){
								_btnElm.showImg = _btnElm.disableImg;
							}
			}
			
			var proto = {
				position:position,
				sPosition:sPosition,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_btnElm.alpha
			}
			if(_btnElm.scale){
				var width = _btnElm.special.width == null ? _btnElm.showImg.width : _btnElm.special.width,
					height = _btnElm.special.height == null ? _btnElm.showImg.height : _btnElm.special.height;
				var scale = MONKEY.Math.getScale(_btnElm);
				proto.special = {width:width,height:height};
				proto.showSpecial = {width:width*scale.x,height:height*scale.y};
			}
			this.renderDrawImage(_btnElm.showImg,proto);
			if(_btnElm.children.length > 0){
				for(var i = 0; i < _btnElm.children.length; i ++){
					this.renderDraw(_btnElm.children[i]);
				}
			}
		}
	},
	renderDrawAnimation:function(_animation){
		if(_animation.visible){

			if(!_animation.pause){
				_animation.spins.call(_animation);
			}

			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_animation);
				position.y = MONKEY.Math.getPositionY(_animation);
			var sPosition = _animation.sPosition;
			var rotate = MONKEY.Math.getRotate(_animation),
				rotatePoint = {x:_animation.rotatePoint.x + position.x - _animation.position.x,
								y:_animation.rotatePoint.y + position.y - _animation.position.y};

			var showFrame = _animation.frameArray[_animation.currentFrame];

			var width = _animation.special.width == null ? showFrame.width : _animation.special.width,
				height = _animation.special.height == null ? showFrame.height : _animation.special.height;

			var scale = MONKEY.Math.getScale(_animation);
			

			var proto = {
				position:position,
				sPosition:sPosition,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_animation.alpha	
			}
			proto.special = {width:width,height:height};
			proto.showSpecial = {width:width*scale.x,height:height*scale.y};

			this.renderDrawImage(showFrame,proto);

			if(_animation.children.length > 0){
				for(var i = 0; i < _animation.children.length; i ++){
					this.renderDraw(_animation.children[i]);
				}
			}
		}
	},
	renderDrawAnyAnimation:function(_anyAnimation){
		if(_anyAnimation.visible){

			if(!_anyAnimation.pause){
				_anyAnimation.spins.call(_anyAnimation);
			}

			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_anyAnimation);
				position.y = MONKEY.Math.getPositionY(_anyAnimation);

			var sPosition = _anyAnimation.sPosition;

			var rotate = MONKEY.Math.getRotate(_anyAnimation),
				rotatePoint = { x:_anyAnimation.rotatePoint.x + position.x - _anyAnimation.position.x,
								y:_anyAnimation.rotatePoint.y + position.y - _anyAnimation.position.y};

			var showFrame = _anyAnimation.frameArray[_anyAnimation.currentFrameIndex][_anyAnimation.currentFrame];

			var width = _anyAnimation.special.width == null ? showFrame.width : _anyAnimation.special.width,
				height = _anyAnimation.special.height == null ? showFrame.height : _anyAnimation.special.height;

			var scale = MONKEY.Math.getScale(_anyAnimation);

			

			var proto = {
				position:position,
				sPosition:sPosition,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_anyAnimation.alpha
			}
			proto.special = {width:width,height:height};
			proto.showSpecial = {width:width*scale.x,height:height*scale.y};

			this.renderDrawImage(showFrame,proto);

			if(_anyAnimation.children.length > 0){
				for(var i = 0; i < _anyAnimation.children.length; i ++){
					this.renderDraw(_anyAnimation.children[i]);
				}
			}
		}
	},
	renderDrawSameGrapAnimation:function(_animation){
		if(_animation.visible){

			if(!_animation.pause){
				_animation.spins.call(_animation);
			}

			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_animation);
				position.y = MONKEY.Math.getPositionY(_animation);
			var rotate = MONKEY.Math.getRotate(_animation),
				rotatePoint = { x:_animation.rotatePoint.x + position.x - _animation.position.x,
								y:_animation.rotatePoint.y + position.y - _animation.position.y};

			var width = _animation.special.width == null ? showFrame.width : _animation.special.width,
				height = _animation.special.height == null ? showFrame.height : _animation.special.height;

			var imgSpecial = {width:width,height:height};
			var scale = MONKEY.Math.getScale(_animation);
			var drawSpecial = {width:width * scale.x,height:height * scale.y };

			var drawPosition = {x:_animation.positionStatic.x + _animation.currentFrame % _animation.column * _animation.positionInterval.x,
								y:_animation.positionStatic.y + parseInt(_animation.currentFrame / _animation.column) * _animation.positionInterval.y};
			//MONKEY.Math.getSameGrapPosition(_animation.currentFrame,_animation.
			var proto = {
				position:position,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_animation.alpha,
				imgSpecial:imgSpecial,
				drawSpecial:drawSpecial,
				drawPosition:drawPosition
			}

			this.renderDrawPartImage(_animation.frameImg,proto);
		}
	},
	renderDrawText:function(_text){
		if(_text.visible){

			var width = _text.autoLineFeed == false ? _text.special.width : _text.lineWidth,
				height = _text.special.height == null ? 18 : _text.lineHeight;

			var position = {x:0,y:0};
			if(_text.autoLineFeed){
				position.x = _text.textAlign == "left" ? MONKEY.Math.getPositionX(_text) :(_text.textAlign == "center" ? MONKEY.Math.getPositionX(_text) + width/2: MONKEY.Math.getPositionX(_text) + width);
			}else{
				position.x = MONKEY.Math.getPositionX(_text);
			}
			position.y = MONKEY.Math.getPositionY(_text) + height;
			var rotate = MONKEY.Math.getRotate(_text),
				rotatePoint = { x:_text.rotatePoint.x + position.x - _text.position.x,
								y:_text.rotatePoint.y + position.y - _text.position.y};

			
			var special = {width: width,height:height};
			var proto = {
						txt:_text.textStr,
						position:position,
						rotate:rotate,
						special:special,
						rotatePoint:rotatePoint,
						textAlign:_text.textAlign,
						fontSize:_text.fontSize,
						fontFamily:_text.fontFamily,
						fillStyle:_text.fillStyle
					};
			if(_text.textStr != null){
				if(_text.autoLineFeed){
					var count = _text.indent == false ? 0 : 4,
						number = parseInt(_text.lineWidth / _text.fontSize)*2;
					var txtLength = _text.textStr.length,
						txtArray = _text.textStr.split("");
					var text = "",line = 0;
					for(var i = 0; i <= txtLength; i ++){
						if(count >= number){
							if(line == 0 && _text.indent){
								proto.position = {x:position.x + 2*_text.fontSize,y:proto.position.y};
							}else{
								proto.position =  {x:position.x,y:proto.position.y};
							}
							proto.txt = text;
							this.renderDrawTextFunc(proto);
							proto.position.y = proto.position.y + height;
							text = "";
							count = 0;
							line ++;
						}
						if(i == txtLength){
							proto.txt = text;
							this.renderDrawTextFunc(proto);
							return;
						}
						var str = txtArray[0];
						var text = text + str;  
						//count ++;
						count += MONKEY.Math.getTrueLength(str);  
						txtArray.shift();
					}
				}else{
					this.renderDrawTextFunc(proto);
				}
			}
			

		}
	},
	renderDrawImage:function(_img,_parameters){
		this.backBufferCtx.save();
		var parameters = _parameters || {};
		var position = parameters.position !== undefined ? parameters.position : {x : 0, y:0},
			sPosition = parameters.sPosition !== undefined ? parameters.sPosition :{x : 0,y:0},
			alpha = parameters.alpha !== undefined ? parameters.alpha : 1,
			special  = parameters.special !== undefined ? parameters.special : {width:_img.width,height:_img.height},
			showSpecial = parameters.showSpecial !== undefined ? parameters.showSpecial : special;
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position;
		this.backBufferCtx.globalAlpha = alpha;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}

		this.backBufferCtx.drawImage(_img,sPosition.x,sPosition.y,special.width,special.height,position.x,position.y,showSpecial.width,showSpecial.height);
		this.backBufferCtx.restore();
	},
	renderDrawPartImage:function(_img,_parameters){
		this.backBufferCtx.save();
		var parameters = _parameters || {};
		var position = parameters.position !== undefined ? parameters.position : {x : 0, y:0},
			alpha = parameters.alpha !== undefined ? parameters.alpha : 1,
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position,
			imgSpecial = parameters.imgSpecial !== undefined ? parameters.imgSpecial : {width:100,height:100},
			drawSpecial = parameters.drawSpecial !== undefined ? parameters.drawSpecial : imgSpecial,
			drawPosition = parameters.drawPosition !== undefined ? parameters.drawPosition : {x:0,y:0};

		this.backBufferCtx.globalAlpha = alpha;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}
		this.backBufferCtx.drawImage(_img,drawPosition.x,drawPosition.y,imgSpecial.width,imgSpecial.height,position.x,position.y,drawSpecial.width,drawSpecial.height);
		this.backBufferCtx.restore();
	},
	renderDrawTextFunc:function(_parameters){
		this.backBufferCtx.save();
		//console.log(JSON.stringify(_parameters))
		var parameters = _parameters || {};
		var position = parameters.position !== undefined ? parameters.position : {x : 0, y:0},
			alpha = parameters.alpha !== undefined ? parameters.alpha : 1,
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position,
			special = parameters.special !== undefined ? parameters.special : {width:100,height:100},
			textStr = parameters.txt !== undefined ? parameters.txt : null,
			textAlign = parameters.textAlign !== undefined ? parameters.textAlign : "left",
			fontSize = parameters.fontSize !== undefined ? parameters.fontSize : 18,
			fontFamily = parameters.fontFamily !== undefined ? parameters.fontFamily : "Arial",
			fillStyle = parameters.fillStyle !== undefined ? parameters.fillStyle : "#000";

		if(textStr == null) return;

		this.backBufferCtx.globalAlpha = alpha;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}

		this.backBufferCtx.font = fontSize + "px " + fontFamily;
		this.backBufferCtx.fillStyle = fillStyle;
		this.backBufferCtx.textAlign = textAlign;
		this.backBufferCtx.fillText(textStr,position.x,position.y,special.width,special.height);

		this.backBufferCtx.restore();
	},
	drawLines:function(_parameters){
		this.backBufferCtx.save();
		var parameters = _parameters || {};

		var alpha = parameters.alpha !== undefined ? parameters.alpha : 1,
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position,
			strokeStyle = parameters.strokeStyle !== undefined ? parameters.strokeStyle : "#000",
			lineCap = parameters.lineCap !== undefined ? parameters.lineCap : "butt",
			lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 1,
			fillStatus = parameters.fillStatus !== undefined ? parameters.fillStatus : false,
			fillStyle = parameters.fillStyle !== undefined ? parameters.fillStyle : "#000",
			closeStatus = parameters.closeStatus !== undefined ? parameters.closeStatus : true,
			graphVertexs = parameters.graphVertexs !== undefined ? parameters.graphVertexs : [],
			strokeStatus = parameters.strokeStatus !== undefined ? parameters.strokeStatus : true;
			lineDash = parameters.lineDash !== undefined ? parameters.lineDash : [0,0];
		this.backBufferCtx.globalAlpha = alpha;	
		this.backBufferCtx.lineCap = lineCap;
		this.backBufferCtx.lineWidth = lineWidth;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}

		this.backBufferCtx.beginPath();
		this.backBufferCtx.setLineDash(lineDash);
		for(var i = 0; i < graphVertexs.length; i ++){
			if(i > 0){
				this.backBufferCtx.lineTo(graphVertexs[i][0],graphVertexs[i][1]);
			}else{
				this.backBufferCtx.moveTo(graphVertexs[i][0],graphVertexs[i][1]);
			}
		}
		if(closeStatus){
			this.backBufferCtx.closePath();
		}
		if(fillStatus){
			this.backBufferCtx.fillStyle = fillStyle;
			this.backBufferCtx.fill();
		}
		if(strokeStatus){
			this.backBufferCtx.strokeStyle = strokeStyle;
			this.backBufferCtx.stroke();
		}
		
		
		this.backBufferCtx.restore();
	},
	drawPoints:function(_parameters){
		this.backBufferCtx.save();
		var parameters = _parameters || {};

		var alpha = parameters.alpha !== undefined ? parameters.alpha : 1,
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position,
			strokeStyle = parameters.strokeStyle !== undefined ? parameters.strokeStyle : "#000",
			lineCap = parameters.lineCap !== undefined ? parameters.lineCap : "butt",
			lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 1,
			fillStatus = parameters.fillStatus !== undefined ? parameters.fillStatus : false,
			fillStyle = parameters.fillStyle !== undefined ? parameters.fillStyle : "#000",
			closeStatus = parameters.closeStatus !== undefined ? parameters.closeStatus : true,
			graphVertexs = parameters.graphVertexs !== undefined ? parameters.graphVertexs : [],
			strokeStatus = parameters.strokeStatus !== undefined ? parameters.strokeStatus : true;

		this.backBufferCtx.globalAlpha = alpha;	
		this.backBufferCtx.lineCap = lineCap;
		this.backBufferCtx.lineWidth = lineWidth;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}

		this.backBufferCtx.beginPath();
		for(var i = 0; i < graphVertexs.length; i ++){
			if(i > 0){
				this.backBufferCtx.lineTo(graphVertexs[i][0],graphVertexs[i][1]);
			}else{
				this.backBufferCtx.moveTo(graphVertexs[i][0],graphVertexs[i][1]);
			}
		}
		if(closeStatus){
			this.backBufferCtx.closePath();
		}
		if(fillStatus){
			this.fillStyle = fillStyle;
			this.backBufferCtx.fill();
		}
		if(strokeStatus){
			this.backBufferCtx.strokeStyle = strokeStyle;
			this.backBufferCtx.stroke();
		}
		
		
		this.backBufferCtx.restore();
	}
}

/*场景
* Scene
* @author snow.he
*/
MONKEY.Scene = function(_parameters){
	var parameters = _parameters || {};
	var self = this;
	MONKEY.Animal.call(this,parameters);
	this.type = "Scene";
	this.background = null;
	this.backgroundStatus = false;
	if(parameters.background !== undefined && typeof(parameters.background) == "string"){
		this.background = new Image();
		this.background.onload = function(){
			self.backgroundStatus = true;
		}
		this.background.src = parameters.background;
	}
	this.parent = null;
	//子类
	this.children = [];
	this.visible = parameters.visible !== undefined ? parameters.visible : true;
	this.uid = MONKEY.Math.generateUUID();
	this.alpha = parameters.alpha !== undefined ? parameters.alpha : 1;
	this.name = parameters.name !== undefined ? parameters.name : " ";
	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0;
	//位置
	this.position = new MONKEY.Position(x,y);
	//缩放
	this.scale = new MONKEY.Position(1,1);
	//层次
	this.zIndex = parameters.zIndex !== undefined ? parameters.zIndex : 0;
	//旋转
	this.rotate = parameters.rotate !== undefined ? parameters.rotate : 0; 
	//旋转中心[默认为左上角坐标为原点的相对坐标]
	this.rotatePoint = new MONKEY.Position(0,0);	
	//是否运行自绘画函数
	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;
	//动画对象的运动
	this.motionFuncs = [];
}
MONKEY.Scene.prototype = {
	constructor:MONKEY.Scene,
	setAlpha:function(_num){
		//num[0,1]
		if(!isNaN(_num)){
			if(_num >= 0 && _num <= 1){
				this.alpha = _num;
			}
		}
	},
	setPosition:function(x,y){
		this.position.set(x,y);
	},
	setRotate:function(_n){
		if(!isNaN(_n)){
			this.rotate = _n;
		}
	},
	setRotatePoint:function(x,y){
		this.rotatePoint.set(x,y);
	},
	clone:function(){
		return new this.constructor().copy.call(this);
	},
	updataZindex:function(){
		this.children = MONKEY.Common.lineUpWithZIndex(this.children);
	},
	copy: function (source, recursive ) {
		if ( recursive === undefined ) recursive = true;
		this.name = source.name;
		this.position.copy(source.position);
		this.visible = source.visible;
		this.isDrawFunc = this.isDrawFunc;
		this.renderDraw = this.renderDraw;
		this.scale.copy(source.scale);
		this.rotate = source.rotate;
		this.rotatePoint.copy(source.rotatePoint);
		this.zIndex = source.zIndex;
		this.background = source.background;
		this.alpha = source.alpha;
		this.parent = source.parent;
		this.motionFuncs = source.motionFuncs;
		if ( recursive === true ) {
			for ( var i = 0; i < source.children.length; i ++ ) {
				var child = source.children[ i ];
				this.add( child.clone() );
			}
		}
		return this;
	},
	copyMotionFuncs:function(source){
		var motionFuncs = [];
		for(var i in source){
			motionFuncs[i] = source[i];
		}
		return motionFuncs;
	},
	add: function ( object ) {
		if ( arguments.length > 1 ) {
			for ( var i = 0; i < arguments.length; i ++ ) {
				this.add( arguments[ i ] );
			}
			return this;
		}
		if ( object === this ) {
			console.error( "MONKEY.Scene.add: object can't be added as a child of itself.", object );
			return this;
		}
		object.parent = this;
		this.children.push( object );
		this.children = MONKEY.Common.lineUpWithZIndex(this.children);
		return this;
	},
	remove: function ( object ) {
		if ( arguments.length > 1 ) {
			for ( var i = 0; i < arguments.length; i ++ ) {
				this.remove( arguments[ i ] );
			}
		}
		var index = this.children.indexOf( object );
		if ( index !== - 1 ) {
			this.children.splice( index, 1 );
		}
	},
	addMotionFunc:function(name,_func){
		//this.montionFuncs[name] = func
		if ( _func === this ) {
			return this;
		}
		if(typeof(_func) == "function"){
			this.motionFuncs[name] = _func;
		}else{
			console.error("MONKEY.animal.add:object.motionFuncs must be added as a function",_func)
		}
	},
	removeMotionFunc:function(name){
		this.motionFuncs[name] = null;
	},
	countMotionFuncs:function(){
		for(var i in this.motionFuncs){
			if(this.motionFuncs[i] == null)
				continue;
			this.motionFuncs[i].call(this);
		}
	},
	getChildren:function(name){
		if(name === undefined) return;
		for(var i in this.children){
			if(this.children[i].getName() == name){
				return this.children[i];
			}
		}
	}
}
//mouseEvent
/*鼠标绑定事件
*
 */
MONKEY.MouseEvent = {
	addEvent:function(_target,eventType,fnHandler,useCapture){
		useCapture==undefined?useCapture=true:"";
		if(MONKEY.OSInfo.msPointerable){
			//IE10，pc和移動端都支持mspointer事件。
			switch(eventType){
				case "mousedown":
				eventType="MSPointerDown";
				break;
				case "mousemove":
				eventType="MSPointerMove";
				break;
				case "mouseup":
				eventType="MSPointerUp";
				break;
				case "mouseover":
				eventType="MSPointerOver";
				break;
				case "mouseout":
				eventType="MSPointerOut";
				break;
			}
		}else if(MONKEY.OSInfo.touchable){
			//移動端，其他瀏覽器支持touch事件
			switch(eventType){
				case "mousedown":
				eventType="touchstart";
				break;
				case "mousemove":
				eventType="touchmove";
				break;
				case "mouseup":
				eventType="touchend";
				break;
				case "mouseover":
				eventType="";
				break;
				case "mouseout":
				eventType="";
				break;
			}
		}
		//判斷使用何種註冊事件監聽的寫法。
		if(eventType==""){
			return;
		}
		if (_target.addEventListener) {
			_target.addEventListener(eventType, fnHandler,useCapture);
		} else if (_target.attachEvent) {
			_target.attachEvent("on" + eventType, fnHandler);
		} else {
			_target["on" + eventType] = fnHandler;
		}
	},
	removeEvent:function(_target, eventType, fnHandler,useCapture){
		//默認回調函數是在冒泡階段調用
		useCapture==undefined?useCapture=true:"";
		//轉換事件名稱，使之符合平臺的事件類型
		if(MONKEY.OSInfo.msPointerable){
			//IE10，pc和移動端都支持mspointer事件。
			switch(eventType){
				case "mousedown":
				eventType="MSPointerDown";
				break;
				case "mousemove":
				eventType="MSPointerMove";
				break;
				case "mouseup":
				eventType="MSPointerUp";
				break;
				case "mouseover":
				eventType="MSPointerOver";
				break;
				case "mouseout":
				eventType="MSPointerOut";
				break;
			}
		}else if(MONKEY.OSInfo.touchable){
			//移動端，其他瀏覽器支持touch事件
			switch(eventType){
				case "mousedown":
				eventType="touchstart";
				break;
				case "mousemove":
				eventType="touchmove";
				break;
				case "mouseup":
				eventType="touchend";
				break;
				case "mouseover":
				eventType="";
				break;
				case "mouseout":
				eventType="";
				break;
			}
		}
		if (_target.removeEventListener) {
			_target.removeEventListener(eventType, fnHandler,useCapture);
		} else if (_target.detachEvent) {
			_target.detachEvent("on" + eventType, fnHandler);
		} else {
			_target["on" + eventType] = null;
		}
	},
	//提取对象事件
	getEvent:function(_target){
		console.warn("暂时不支持事件查询")
		return;
		if(window.event){
			return _target.formatEvent(window.event);
		}else{
			return _target.getEvent.caller.arguments[0]
		}
	}
}
/*
**	EventListener
**	对象监听
**	@author:snow.he
 */
MONKEY.EventListener = function(){};
Object.assign(MONKEY.EventListener.prototype,{
	addListener:function(type,_func){
		if(typeof _func !== "function"){
			console.error("MONKEY.EventListener.addListener parameter _func must a function.")
			return;
		}
		
		if(this.listener === undefined) 
			this.listener = {};

		if(this.listener[type] === undefined){
			this.listener[type] = [];
		}

		if(this.listener[type].indexOf(_func) === -1){
			this.listener[type].push(_func);
		}
	},
	removeListener:function(type,_func){
		if(this.listener === undefined) return;

		var listenerArray = this.listener[type];
		if(listenerArray !== undefined){
			var index = listenerArray.indexOf(_func);
			if(index !== -1){
				listenerArray.splice(index,1);
			}
		}
	},
	hasListener:function( type, _func){

		if(this.listener === undefined)
			return false;

		if ( this.listener[ type ] !== undefined && this.listener[ type ].indexOf( _func ) !== - 1 ) {
			return true;
		}

		return false;
	}
});

//pointer
/*
**
*
 */
MONKEY.Pointer = function(_target){
	var self 		= this;
	this.target 	= _target || document.body;
	this.medoData 	= "canvas|static";
	this.medo 		= "canvas";
	this.cursor 	= "default";
	this.superCursorStatus = false;//是否开启外部控制
	this.superCursor= "default";//外部控制手型(优先于内部)
	this.trigger 	= [];//热区(内部控制热区)
	this.triStatus	= false;
	this.triNumber  = 0;
	this.pX 		= 0;//鼠标位置
	this.pY 		= 0;
	this.historyMouse = [0,0];
	this.btnArg 	= null;//页面btn
	this.sceneBtnElm= [];//render中的btn
	this.btnRepeat  = false;//热区重叠标志[true:遍历所有（包括重叠）,返回触点为数组  false:获取最优先的一个触点,返回一个触点标志]
	this.mouseListener  = {}; 
	this.autoSizeTarget = null;
	this.autoSize      = false;
	this.saveSizeScale = true;
	this.autoSizeData = {w:1024,h:768};
	this.historySize  = {};//存储自适应容器初始属性|暂未启用
	this.initPointer = function(_btnName){
		//页面按钮
		if(_btnName !== undefined){
			this.btnArg = document.getElementsByName(_btnName);
			for(var i =0,arg;arg = this.btnArg[i++];){
				MONKEY.MouseEvent.addEvent(arg,"mouseover",this.btnMouseOver,true);
				MONKEY.MouseEvent.addEvent(arg,"mouseout",this.btnMouseOut,true);
				MONKEY.MouseEvent.addEvent(arg,"mousedown",this.btnDownFunc,true);	
			}
		}
		//初始化canvas
		MONKEY.MouseEvent.addEvent(this.target,"mousemove",this.canvasMouseMoveFunc,false);
		MONKEY.MouseEvent.addEvent(this.target,"mousedown",this.canvasMouseDownFunc,false);
		MONKEY.MouseEvent.addEvent(this.target,"mouseup",this.canvasMouseUpFunc,false);
	};
	this.addAutoSize = function(_contain,_boo){
		var boo = _boo == undefined ? true : _boo;
		this.autoSize = true;
		this.autoSizeTarget = _contain;
		this.saveSizeScale = boo;
		this.autoSizeData.w = _contain.offsetWidth;
		this.autoSizeData.h = _contain.offsetHeight;
		this.historySize.width = _contain.offsetWidth;
		this.historySize.height = _contain.offsetHeight;
		this.historySize.left = _contain.offsetLeft;
		this.historySize.top = _contain.offsetTop;
		var self = this;
		window.onresize = function(){
			if(self.autoSize)
				self.autoSizeFunc();
		};
		self.autoSizeFunc();
		MONKEY.OSInfo.isAutoScale = true;
		//ipad 属性延迟bug
		setTimeout(function(){
			MONKEY.pointer.autoSizeFunc();
		},110);
	};
	this.removeAutoSize = function(){
		this.autoSize = false;
	};
	this.removeSize = function(){

	}

}
MONKEY.Pointer.prototype = {
	constructor:MONKEY.Pointer,
	autoSizeFunc:function(){
		var data = MONKEY.Common.contralSize(this.autoSizeTarget,this.autoSizeData.w,this.autoSizeData.h);
		MONKEY.Labeler.setTransform(this.autoSizeTarget,"scale("+data.scale+")");
		this.autoSizeTarget.style.left = data.left + "px";
		this.autoSizeTarget.style.top = data.top + "px";
		if(this.saveSizeScale){
			MONKEY.OSInfo.scale = data.scale;
		}
	},
	setSuperCursor:function(_type){
		this.superCursorStatus = true;
		this.superCursor = _type;
	},
	removeSuperCursor:function(){
		this.superCursorStatus = false;
	},
	setCursor:function(_type){
		if(this.superCursorStatus){
			this.cursor = this.superCursor;
		}else{
			this.cursor = _type;
		}
		this.target.style.cursor = this.cursor;
	},
	updateOffset:function(){
		MONKEY.OSInfo.canvasLeft = MONKEY.Math.getPageX(this.target) + MONKEY.OSInfo.pWidth/2*(1 - MONKEY.OSInfo.scale);
		MONKEY.OSInfo.canvasTop  = MONKEY.Math.getPageY(this.target) + MONKEY.OSInfo.pHeight/2*(1 - MONKEY.OSInfo.scale);
	},
	setSceneBtnElm:function(_elm){
		this.sceneBtnElm = _elm;
	},
	//更改热区
	setTrigger:function(_data){
		var data = _data;
		if(data instanceof Array){
			this.trigger = data;
		}else{
			console.error("热区数据类型错误!");
		}
	},
	//更新鼠标坐标
	updataMouse:function(e){
		var e = e || window.event;
		if(e.preventDefault) e.preventDefault();
		this.updateOffset();
		var self = MONKEY.pointer;
		var px,py;
		if(MONKEY.OSInfo.touchable){
			px = e.touches[0].pageX - MONKEY.OSInfo.canvasLeft;
			py = e.touches[0].pageY - MONKEY.OSInfo.canvasTop;
		}else{
			px = e.pageX - MONKEY.OSInfo.canvasLeft;
			py = e.pageY - MONKEY.OSInfo.canvasTop;
		}
		self.historyMouse = [self.pX,self.pY];
		self.pX = parseInt(px/MONKEY.OSInfo.scale);
		self.pY = parseInt(py/MONKEY.OSInfo.scale);
	},
	//判断鼠标是否没有移动 ==> webkit內核bug
	notMove:function(){
		var self = MONKEY.pointer;
		if(self.pX == self.historyMouse[0] && self.pY == self.historyMouse[1]){
			return true;
		}else{
			return false;
		}
	},
	//获取设定热区触发点
	getTriggerList:function(){
		var self = MONKEY.pointer;
		var point = new MONKEY.Position(self.pX,self.pY),
			status = false;
		if(self.btnRepeat){
			self.triNumber = [];
		}else{
			self.triNumber = 0;
		}
		for(var j = 0,target;target = self.trigger[j++];){
			var sta = MONKEY.Common.PointInPoly(point,target);
			if(sta){
				status = true;
				if(self.btnRepeat){
					self.triNumber.push(j - 1);
					continue;
				}else{
					self.triNumber = --j;
					break;
				}
			}
		}
		//改变鼠标
		if(status){
			self.triStatus = true;
			self.setCursor("pointer");
		}else{
			self.triStatus = false;
			self.setCursor("auto");
		}
	},
	resetBtnStatus:function(){
		var self = MONKEY.pointer;
		for(var i = 0; i < self.sceneBtnElm.length; i ++){
			if(self.sceneBtnElm[i].type == "Button"){
				self.sceneBtnElm[i].setStatus("up");
			}else
				if(self.sceneBtnElm[i].listenerStatus){
					self.sceneBtnElm[i].setStatus("up");
				}
		}
							
	},
	//获取scene中触发btn
	getBtnTriggerList:function(){
		var self = MONKEY.pointer,
			point = new MONKEY.Position(self.pX,self.pY),
			status = false,
			list = [];
		for(var i = self.sceneBtnElm.length - 1;i >= 0; i --){
			if(self.sceneBtnElm[i].status == "disable") 
				continue;
			if(self.sceneBtnElm[i].isCountPath){
				var status = self.sceneBtnElm[i].isPointInPath(point.x,point.y);
			}else{
				var poly = self.getBtnTrigger(self.sceneBtnElm[i]);
				var status = MONKEY.Common.PointInPoly(point,poly);
			}
			
			if(status){
				list.push(i);
				if(self.sceneBtnElm[i].mouseEnabled){
					self.setCursor("pointer");
				}
				
				if(self.sceneBtnElm[i].mouseIntIt == false){
					self.sceneBtnElm[i].setListener("over");
					self.sceneBtnElm[i].mouseIntIt = status;
				}
				if(self.btnRepeat){
					continue;
				}else{
					break;
				}		
			}else{
				if(self.sceneBtnElm[i].mouseEnabled){
					self.setCursor("auto");
				}
				if(self.sceneBtnElm[i].mouseIntIt){
					self.sceneBtnElm[i].setListener("out");
					self.sceneBtnElm[i].mouseIntIt = status;
				}
			}
		} 
		return list;
	},
	getBtnTrigger:function(_btnElm){
		var trigger = [];
		var triggerArr = [];
		if(_btnElm.triggerStatus){
			var x = MONKEY.Math.getPositionX(_btnElm),
				y = MONKEY.Math.getPositionY(_btnElm);
			for(var i = 0; i <  _btnElm.trigger.length; i ++){
				triggerArr.push([_btnElm.trigger[i][0] + x, _btnElm.trigger[i][1] + y]);
			}
		}else{
			var x = MONKEY.Math.getPositionX(_btnElm),
				y = MONKEY.Math.getPositionY(_btnElm);

			var scale = MONKEY.Math.getScale(_btnElm);
							
			var p = _btnElm.getTriggerSpecial();
			var w = p.width*scale.x,
				h = p.height*scale.y;
			triggerArr = [[x,y],[x + w,y],[x + w,y + h],[x , y + h]];
		}
		var rotate = MONKEY.Math.getRotate(_btnElm),
			rotatePoint = {x:_btnElm.rotatePoint.x,
						   y:_btnElm.rotatePoint.y};
		 	rotatePoint.x = x - _btnElm.position.x  + rotatePoint.x;
		 	rotatePoint.y = y - _btnElm.position.y  + rotatePoint.y;

		
		var matrix2 = new MONKEY.Matrix2();
		for(var i = 0; i < triggerArr.length; i ++){
			matrix2.set(triggerArr[i][0],triggerArr[i][1]);
			matrix2.rotate(-rotate,rotatePoint.x,rotatePoint.y).parseInt();
			trigger.push([matrix2.elements[0],matrix2.elements[1]]);
		}	
		return trigger; 
	},
	canvasMouseMoveFunc:function(e){
		var e = e || window.event;
		if(e.preventDefault) e.preventDefault();
		var self = MONKEY.pointer;
		self.updataMouse(e);
		if(self.notMove()) return;
		self.resetBtnStatus();
		//遍历热区
		self.getTriggerList();
		//获取btn触发
		var triggerBtnList = self.getBtnTriggerList();
		for(var i = 0; i < triggerBtnList.length; i ++){
			self.sceneBtnElm[triggerBtnList[i]].setStatus("move");
			self.sceneBtnElm[triggerBtnList[i]].setListener("move");
		}
		var data = {
			status:self.triStatus,
			type:self.triNumber,
			x:self.pX,
			y:self.pY,
			btnList:triggerBtnList
		};
		self.mouseListenerUI("mousemove",data);
	},
	canvasMouseDownFunc:function(e){
		var e =  e || window.event;
		if(e.preventDefault) e.preventDefault();
		var self = MONKEY.pointer;
		self.updataMouse(e);
		self.resetBtnStatus();
		self.getTriggerList();
		//btn触发
		var triggerBtnList = self.getBtnTriggerList();
		for(var i = 0; i < triggerBtnList.length; i ++){
			self.sceneBtnElm[triggerBtnList[i]].setStatus("down");
			self.sceneBtnElm[triggerBtnList[i]].setListener("down");
		}
		var data = {
			status:self.triStatus,
			type:self.triNumber,
			x:self.pX,
			y:self.pY,
			btnList:triggerBtnList
		};
		self.mouseListenerUI("mousedown",data);
	},
	canvasMouseUpFunc:function(e){
		var e =  e || window.event;
		if(e.preventDefault) e.preventDefault();
		var self = MONKEY.pointer;
		//self.updataMouse(e);
		self.resetBtnStatus();
		self.getTriggerList();
		//btn触发
		var triggerBtnList = self.getBtnTriggerList();
		for(var i = 0; i < triggerBtnList.length; i ++){
			self.sceneBtnElm[triggerBtnList[i]].setStatus("up");
			self.sceneBtnElm[triggerBtnList[i]].setListener("up");
		}
		var data = {
			status:self.triStatus,
			type:self.triNumber,
			x:self.pX,
			y:self.pY,
			btnList:triggerBtnList
		};
		self.mouseListenerUI("mouseup",data);
	},
	addMouseListener:function(_type,_func){
		if(this.mouseListener === undefined){
			this.mouseListener = {};
		}
		if(this.mouseListener[_type] === undefined){
			this.mouseListener[_type] = [];
		}
		if(this.mouseListener[_type].indexOf(_func) === -1){
			this.mouseListener[_type].push(_func);
		}
	},
	removeMouseListener:function(_type,_func){
		if(this.mouseListener === undefined)
			return;
		var mouseListenerArray = this.mouseListener[type];
		if(mouseListenerArray !== undefined){
			var index = mouseListenerArray.indexOf(_func);
			if(index !== -1){
				mouseListenerArray.splice(index,1);
			}
		}
	},
	mouseListenerUI:function(_type,data){
		var type = _type;
		var  listenerArray = this.mouseListener[type];
		if(listenerArray !== undefined){
			for(var i = 0 ; i < listenerArray.length; i ++){
				listenerArray[i].call(this,data);
			}
		}
	}

}
/*
**	https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
**	音频组件
**	@author:snow.he
 */
MONKEY.AudioClass = function(){

	this.type = "Audio";

	this.name = "Audio";
	this.uuid = MONKEY.Math.generateUUID();

	this.audioList = [];
	this.audios = {};
	this.audioAttr = {};

	this.listenLoadList = [];
	this.Interval = null;
	this.listenStatus = false;

	this.staticFunc = function(){};
	this.endInterval = false;
	this.volume = 0.8;
}
MONKEY.AudioClass.prototype = {
	constructor:MONKEY.AudioClass,
	createAudio:function(_options){
		var self = this;
		if(Array.isArray(_options)){
			for(var i = 0; i < _options.length; i ++){
				self.createAudio(_options[i]);
			}
			return;
		}
		var name , url;
		if(_options.name === undefined || _options.url === undefined){
			console.warn("请指定音频的name & url.");
			return;
		}
		name = _options.name;
		if(self.isCheck(name)) return;
		url = _options.url;
		autoPlay = _options.autoPlay !== undefined ? _options.autoPlay : false;
		loops = _options.loops !== undefined ? _options.loops : 1;
		volume = _options.volume !== undefined ? _options.volume : self.volume;

		var n_Audio = new Audio();
		var onloadFunc = _options.onLoad !== undefined ? _options.onLoad :self.staticFunc,
			endedFunc = _options.ended !==undefined ? _options.ended : self.staticFunc;
		var progressOption = {
			audio:n_Audio,
			name:name
		};

		this.audioList.push(name);
		this.audios[name] = n_Audio;
		this.audioAttr[name] = {
			currentLoop:0,
			playLoop:loops,
			status:"stop",
			autoPlay:autoPlay,
			endFunc:endedFunc,
			onLoad:onloadFunc,
			isOnload:false,
			volume:volume
		};
		n_Audio.loop = false;
		n_Audio.setAttribute("name",name);
		n_Audio.addEventListener("progress", function(){
		  	// console.log(this.buffered.length)//,this.duration)
		  	self.addListenLoad(progressOption);
		  }
		);
		n_Audio.addEventListener("ended",self.audioPlayEnd);

		n_Audio.src = url;
		n_Audio.load();

		n_Audio.volume = volume;
	},
	getFileFormat:function(_name){
		var name = _name,
			format = "";
		var l = 1;
		var begin = name.length - l;
		while(begin > 0 && name.charAt(begin) != "."){
			 l ++;
			 begin = name.length -l;
			}
		
		format = name.slice(begin+1);
		return format;
	},
	audioPlayEnd:function(){
		var name = this.getAttribute("name");
		var self = MONKEY.Audio;
		self.audioAttr[name].currentLoop ++;
		if(self.audioAttr[name].currentLoop >= self.audioAttr[name].playLoop){
			self.audioAttr[name].endFunc.call(self);
		}else{
			self.stop(name);
			this.currentTime = 0;
			this.play();
		}
	},
	addListenLoad:function(_audioData){
		var self =  this;
		if(!this.listenStatus){
			this.interval = setInterval(function(){
				self.listenerLoad();
			},100);
		}
		if(this.endInterval){
			try{
				clearInterval(this.Interval);
			}catch(e){}
		}
		this.listenLoadList.push(_audioData);
	},
	listenerLoad:function(){
		if(this.listenLoadList.length <= 0){
			clearInterval(this.Interval);
			this.Interval = null;
			this.endInterval = true;
			return;
		}
		var loadedList = [];
		for(var i = 0; i < this.listenLoadList.length; i ++){
			var jd = (this.listenLoadList[i].audio.buffered.end(0) - this.listenLoadList[i].audio.buffered.start(0))/this.listenLoadList[i].audio.duration;
			this.listenLoadList[i].jd = jd;
			console.log(this.listenLoadList[i].name + " loading:" + parseInt(jd*100) + "%");
			if(jd >= 1){
				loadedList.push(i);
				if(!this.audioAttr[this.listenLoadList[i].name].isOnload){
					this.audioAttr[this.listenLoadList[i].name].onLoad.call(this);
					this.audioAttr[this.listenLoadList[i].name].isOnload = true;
				}	
			}
		}
		for(var j = loadedList.length - 1; j >= 0; j --){
			this.listenLoadList.splice(loadedList[j],1);
		}
	},
	isCheck:function(_name){
		var index = this.audioList.indexOf(_name);
		if(index >= 0){
			return true;
		}else{
			return false;
		}
	},
	getVolume:function(_name){
		if(arguments.length > 0){
			return this.audioAttr[_name].volume;
		}else{
			return this.volume;
		}
	},
	setVolume:function(_volume,_name){
		if(arguments.length > 0){
			if(isNaN(arguments[0]))
				return;
		}else{
			return;
		}
		if(arguments.length == 2){
			this.audios[_name].volume = _volume;
			return;
		}else
			if(arguments.length == 1){
				for(var i = 0; i < this.audioList.length; i ++){
					this.audios[this.audioList[i]].volume = _volume;
				}
			}else
				if(arguments.length > 2){
					for(var i = 1; i < arguments.length; i ++){
						this.audios[arguments[i]].volume = _volume;
						this.audioAttr[arguments[i]].volume = _volume;
					}
				}
		
	},
	play:function(_name,_options){
		if(!this.isCheck(_name)){
			console.error("not find " + _name);
			return;
		}
		if(_options !== undefined){
			var endedFunc = _options.ended !== undefined ? _options.ended : this.staticFunc;
			this.audioAttr[_name].endFunc = endedFunc;
		}
		this.audioAttr[_name].currentLoop = 0;
		this.audios[_name].play();	
	},
	pause:function(_name){
		if(!this.isCheck(_name)){
			console.error("not find " + _name);
			return;
		}
		this.audios[_name].pause();
	},
	pauseAll:function(){
		for(var i = 0; i < this.audioList.length; i ++){
			this.audios[this.audioList[i]].pause();
		}
	},
	stop:function(_name){
		if(!this.isCheck(_name)){
			console.error("not find " + _name);
			return;
		}
		this.audios[_name].pause();
		this.audios[_name].currentTime = 0;
	},
	stopAll:function(){
		for(var i = 0; i < this.audioList.length; i ++){
			this.audios[_name].pause();
			this.audios[_name].currentTime = 0;
		}
	},
	//重置
	resume:function(_name){
		if(!this.isCheck(_name)){
			console.error("not find " + _name);
			return;
		}
		this.audios[_name].resume();
	},
	hasAudio:function(_name){
		var index = this.audioList.indexOf(_name);
		return index;
	},

}
/*
**		Labeler
**		页面标签处理助手
 */
MONKEY.LabelerClass = function(){
	
	this.type = "Labeler";

	this.name = "Labeler";
	this.uuid = MONKEY.Math.generateUUID();
	//工作区
	this.targetElm = document;
	//页列表
	this.pageList = [],
	//存储
	this.label = {};
	//已创建元素表
	this.createList = [];

}
MONKEY.LabelerClass.prototype = {
	constructor:MONKEY.LabelerClass,
	clone:function(_elm){
		if(_elm.clone){
			return _elm.clone(true);
		}else{
			console.log("not have clone function...");
			return;
			var tagName = _elm.tagName;
			var newElm = document.createElement(tagName);
		}
	},
	copy:function(_elm){
		return this.clone(_elm);
	},
	createElm:function(_options){
		var options = _options || {};
		var type = options.type !== undefined ? options.type : "div";
		var elm = document.createElement(type);

		for(var i in  options){
			if(i == "width" || i == "height" || i == "left" || i == "top"){
				elm.style[i] = parseFloat(options[i]) + "px";
			}else
				if(i == "type"){

				}else
					if(i == "display" || i == "zIndex" || i == "display"){
						elm.style[i] = options[i];
					}else
						if(i == "attr"){
							for(var j in options[i]){
								elm.setAttribute(j,options[i][j]);
							}
						}else
							if(i == "className"){
								elm.className = options[i];
							}else{
								elm.style[i] = options[i];
							}

		}
		this.createList.push(elm);
		return elm;

	},
	createImage:function(){
		var imgArray = [];
		for(var i = 0; i < arguments.length; i ++){
			var img = new Image();
				img.src = arguments[i];
				imgArray.push(img);
		}
		return imgArray;
	},
	getLastCreateElm:function(){
		return this.clone(this.createList[this.createList.length - 1]);
	},
	getCreateElm:function(_index){
		var index = _index || 0;
		return this.clone(this.createList[index]);
	},
	save:function(_name,_elm){
		this.label[_name] = _elm;
	},
	get:function(_name){
		return this.label[_name];
	},
	remove:function(_name){
		this.label[_name] = null;
	},
	addPage:function(_elm){
		this.pageList.push(_elm);
	},
	gotoPage:function(_index){
		var index = _index || 0;
		this.closeAllPage();
		this.pageList[_index].style.display = "block";
	},
	closeAllPage:function(){
		for(var i = 0; i < this.pageList.length; i ++){
			this.pageList[i].style.display = "none";
		}
	},
	setTargetElm:function(_elm){
		this.targetElm = _elm;
	},
	hide:function(_elm,_timer,_callbacks){
		if(Array.isArray(_elm)){
			for(var i = 0; i < _elm.length; i ++){
				if(!_elm.style){
					continue;
				}
				this.hide(_elm[i],_timer,_callbacks);
			}
		}else{
			if(!_elm.style){
				return;
			}
			var callbacks = _callbacks !== undefined ? _callbacks : function(){};
			if(_timer !== undefined){
				MONKEY.Tween.canvasAni({opa:100},{opa:0},"Linear",_timer,updataOpa,callbacks);
			}else{
				_elm.style.display = "none";
			}
			function updataOpa(_data){
				if(_data.opa === undefined) return;
				MONKEY.Labeler.setOpacity(_elm,_data.opa/100);
			}
		}

	},
	hideAnimal:function(_elm,_timer,_callbacks){
		if(Array.isArray(_elm)){
			for(var i = 0; i < _elm.length; i ++){
				if(!_elm.alpha){
					continue;	
				}
				this.showAnimal(_elm[i],_timer,_callbacks);
			}
		}else{
			if(!_elm.alpha){
				return;
			}
			var callbacks = _callbacks !== undefined ? _callbacks : function(){};
			if(_timer !== undefined){
				_elm.alpha = 1;
				MONKEY.Tween.canvasAni({alpha:100},{alpha:0},"Linear",_timer,updataAlpha,callbacks);
			}else{
				_elm.alpha = 0;
			}
			function updataAlpha(_data){
				if(_data.alpha === undefined) 
					return;
				_elm.alpha = _data.alpha/100;
			}

		}
	},
	show:function(_elm,_timer,_callbacks){
		if(Array.isArray(_elm)){
			for(var i = 0; i < _elm.length; i ++){
				if(!_elm.style){
					continue;
				}
				this.show(_elm[i],_timer,_callbacks);
			}
		}else{
			if(!_elm.style){
				return;
			}
			var callbacks = _callbacks !== undefined ? _callbacks : function(){};
			if(_timer !== undefined){
				MONKEY.Labeler.setOpacity(0);
				_elm.style.display = "block";
				MONKEY.Tween.canvasAni({opa:0},{opa:100},"Linear",_timer,updataOpa,callbacks);
			}else{
				_elm.style.display = "block";
			}
			function updataOpa(_data){
				if(_data.opa === undefined) return;
				MONKEY.Labeler.setOpacity(_elm,_data.opa/100);
			}
		}
	},
	showAnimal:function(_elm,_timer,_callbacks){
		if(Array.isArray(_elm)){
			for(var i = 0; i < _elm.length; i ++){
				if(!_elm.alpha){
					continue;	
				}
				this.showAnimal(_elm[i],_timer,_callbacks);
			}
		}else{
			if(!_elm.alpha){
				return;
			}
			var callbacks = _callbacks !== undefined ? _callbacks : function(){};
			if(_timer !== undefined){
				_elm.alpha = 0;
				MONKEY.Tween.canvasAni({alpha:0},{alpha:100},"Linear",_timer,updataAlpha,callbacks);
			}else{
				_elm.alpha = 1;
			}
			function updataAlpha(_data){
				if(_data.alpha === undefined) 
					return;
				_elm.alpha = _data.alpha/100;
			}

		}
	},
	setTransform:function(_obj,_attr){
		if(_obj !== undefined && _attr !== undefined){
			_obj.style.transform = _attr;
		 	_obj.style.mozTransform = _attr;
		 	_obj.style.webkitTransform = _attr;
		 	_obj.style.oTransform = _attr;
		}
		 
	},
	setOpacity:function(_obj,_attr){
		if(_obj !== undefined && _attr !== undefined){
			var attr = MONKEY.Math.clamp(_attr,0,1);
			_obj.filter = "alpha(opacity=" + attr*100 + ")";
			_obj.style.mozOpacity = attr; 
			_obj.style.khtmlOpacity = attr;
			_obj.style.opacity = attr;
		}
		
	},
	gotoHref:function(url,_boo){
		var boo = _boo !== undefined ? _boo : false;
		if(boo){
			window.open(url);			
		}else{
			window.location.href = url;
		}
	}

}

//Animal
/*
* 基本类
 */
MONKEY.Animal = function(_parameters){
	var parameters = _parameters || {};
	var self = this;
	
	this.type = 'Animal';

	this.alpha = parameters.alpha !== undefined ? parameters.alpha : 1;
	this.pause = false;
	this.name = parameters.name !== undefined ? parameters.name : " ";
	this.uuid = MONKEY.Math.generateUUID();
	//背景
	this.background = null;
	this.backgroundStatus = false;
	if(parameters.background !== undefined && typeof(parameters.background) == "string"){
		this.background = new Image();
		this.background.onload = function(){
			self.backgroundStatus = true;
		}
		this.background.src = parameters.background;
	}

	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0,
		w = parameters.width !== undefined ? parameters.width : null,
		h = parameters.height !== undefined ? parameters.height : null,
		sx = parameters.sx !== undefined ? parameters.sx : 0,
		sy = parameters.sy !== undefined ? parameters.sy : 0;

	//位置
	this.position = new MONKEY.Position(x,y);
	//显示position
	this.sPosition = new MONKEY.Position(sx,sy);
	//层次
	this.zIndex = parameters.zIndex !== undefined ? parameters.zIndex : 0;
	//大小规格
	this.special = {
		width:w,
		height:h
	};
	this.parent = null;
	this.children = [];
	//自己的属性
	this.selfAttr = {};
	//监听函数
	this.listener = {};
	this.listenerStatus = parameters.listenerStatus !== undefined ? parameters.listenerStatus : false;
	//热区
	this.trigger = parameters.trigger !== undefined ? parameters.trigger : [];
	this.triggerStatus = parameters.trigger !== undefined ? true : false;
	//是否自计算触发[若为true,则监听组件将会调取对象isPointInPath函数确定热区]
	this.isCountPath = false;
	//动画对象的运动
	this.motionFuncs = [];
	this.motionTime = 0;
	//放大缩小
	this.scale = new MONKEY.Position(1,1);
	//旋转
	this.rotate = parameters.rotate !== undefined ? parameters.rotate : 0; 	
	//旋转中心[默认为左上角坐标]
	this.rotatePoint = new MONKEY.Position(x,y);	
	//热区是否实时跟踪rotate
	this.triggerUpdata = parameters.triggerUpdata !== undefined ? parameters.triggerUpdata : false;
	//鼠标在内部
	this.mouseIntIt = false;
	//方向
	this.direction = parameters !== undefined ? parameters.direction : true;

	
	this.visible = parameters.visible !== undefined ? parameters.visible : true;
	//是否运行自绘画函数
	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;
	//是否开启move效果
	this.mouseEnabled = true;
	//是否允许事件触发(针对用户绑定事件)
	this.buttonMode = true;
}
MONKEY.Animal.prototype = Object.assign(MONKEY.EventListener.prototype,{
	constructor:MONKEY.Animal,
	setTrigger:function(_arr){
		if(Array.isArray(_arr)){
			this.trigger = _arr;
			this.triggerStatus = true;
		}
	},
	removeTrigger:function(){
		this.trigger = [];
		this.triggerStatus = false;
	},
	setStatus:function(_status,_boo){
		var boo = _boo == undefined ? true : _boo;
		if(boo){
			this.setListener(this.status);
		}
	},
	getTriggerSpecial:function(){
		var w = this.special.width == null ? this.background.width : this.special.width,
			h = this.special.height == null ? this.background.height : this.special.height;
		return {width:w,height:h};
	},
	setListener:function(_type){
		if(this.listener === undefined) return; 	
		if(this.buttonMode){
			var type = null;
			switch(_type){
				case "down":
					type = "mousedown";
					break;
				case "move":
					type = "mousemove";
					break;
				case "up":
					type = "mouseup";
					break;
				case "disable":
					type = "disable";
					break;
				case "out":
					type = "mouseout";
					break;
				case "over":
					type = "mouseover";
					break;
				default:
					type = _type;
			}
			if(this.listener === undefined) return; 
			var  listenerArray = this.listener[type];
			if(listenerArray !== undefined){
				for(var i = 0 ; i < listenerArray.length; i ++){
					listenerArray[i].call(this);
				}
			}
		}
	},
	setAttr:function(_name,_attr){
		this.selfAttr[_name] = _attr;
	},
	getAttr:function(_name){
		return this.selfAttr[_name];
	},
	getName:function(){
		return this.name;
	},
	getChildren:function(_name){
		var target = null;
		for(var i = 0; i < this.children.length; i ++){
			if(this.children[i].name == _name){
				target = this.children[i];
				break;
			}
		}
		return target;
	},
	add: function ( object ) {
		if ( arguments.length > 1 ) {
			for ( var i = 0; i < arguments.length; i ++ ) {
				this.add( arguments[ i ] );
			}
			return this;
		}
		if ( object === this ) {
			console.error( "MONKEY.Scene.add: object can't be added as a child of itself.", object );
			return this;
		}
		object.parent = this;
		this.children.push( object );
		this.children = MONKEY.Common.lineUpWithZIndex(this.children);
		return this;
	},
	remove:function(_name){
		for(var i = 0; i < this.children.length; i ++){
			if(this.children[i].name == _name){
				this.children.splice(i,1);
			}
		}
	},
	updataZindex:function(){
		this.children = MONKEY.Common.lineUpWithZIndex(this.children);
	},
	clone: function () {

		return new this.constructor().copy( this );

	},
	copy:function(source){
		this.name = source.name;
		this.position.copy(source.position);
		this.visible = source.visible;
		this.isDrawFunc = this.isDrawFunc;
		this.renderDraw = this.renderDraw;
		this.scale.copy(source.scale);
		this.rotate = source.rotate;
		this.rotatePoint.copy(source.rotatePoint);
		this.zIndex = source.zIndex;
		this.background = source.background;
		this.alpha = source.alpha;
		this.parent = source.parent;
		this.motionFuncs = this.copyMotionFuncs(source.motionFuncs);
		for ( var i = 0; i < source.children.length; i ++ ) {
			var child = source.children[ i ];
			this.add( child.clone() );
		}
		return this;
	},
	copyMotionFuncs:function(source){
		var motionFuncs = [];
		for(var i in source){
			motionFuncs[i] = source[i];
		}
		return motionFuncs;
	},
	changeAlpha:function(_alpha){
		if(!isNaN(_alpha)){
			if(_alpha >= 0 && _alpha <= 1){
				this.alpha = _alpha;
			}
		}
	},
	setRotate:function(_n){
		if(!isNaN(_n)){
			this.rotate = _n;
		}
	},
	setRotatePoint:function(x,y){
		this.rotatePoint.set(x,y);
	},
	stop:function(){
		if(this.pause){
			this.pause = false;
		}else{
			this.pause = true;
		}
	},
	addMotionFunc:function(name,_func){
		//this.montionFuncs[name] = func
		if ( _func === this ) {
			console.error( "MONKEY.animal.add: object can't be added as a child of itself.", _func );
			return this;
		}
		if(typeof(_func) == "function"){
			this.motionFuncs[name] = _func;
		}else{
			console.error("MONKEY.animal.add:object.motionFuncs must be added as a function",_func)
		}
	},
	removeMotionFunc:function(name){
		this.motionFuncs[name] = null;
	},
	countMotionFuncs:function(){
		for(var i in this.motionFuncs){
			if(this.motionFuncs[i] == null)
				continue;
			this.motionFuncs[i].call(this);
		}
	},
	draw:function(canvas,ctx){
		ctx.save();
		ctx.globalAlpha = this.alpha;
		 //实现水平竖直翻转，定义drawImage的两个位置参数dx，dy
        var dx=this.position.x;
        var dy=this.position.y;
        if(this.scale.x!=1||this.scale.y!=1){
            if(this.scale.x<0){
                dx=canvas.width-this.position.x-this.img.width;
                ctx.translate(canvas.width,1);
                ctx.scale(this.scale.x,1);
            }    
            if(this.scale.y<0){
                dy=canvas.height-this.position.y-this.img.height;
                ctx.translate(1,canvas.height);
                ctx.scale(1,this.scale.y);
            }    
        }
        if(this.special.width ==null)
            this.special.width =this.img.width;
        if(this.special.width ==null)
             this.special.width =this.img.height;
        //画出对象
        ctx.drawImage(this.img,dx,dy,this.special.width,this.special.height); 

        ctx.restore();

	}
});


//btn
//
MONKEY.Button = function(_parameters){
	var self = this,
		parameters = _parameters || {};
	MONKEY.Animal.call(this,parameters);

	this.type = "Button";
	this.upImg = parameters.upImg !== undefined ? parameters.upImg : new Image();
	this.moveImg = parameters.moveImg !== undefined ? parameters.moveImg : this.upImg;
	this.downImg = parameters.downImg !== undefined ? parameters.downImg : this.upImg;
	this.disableImg = parameters.disableImg !== undefined ? parameters.disableImg : this.upImg;
	//选中状态
	this.choiceSwitch = parameters.choiceSwitch !== undefined ? parameters.choiceSwitch : false;
	this.choiceStatus = false;
	this.choiceImg = parameters.choiceImg !== undefined ? parameters.choiceImg : this.upImg;

	this.showImg = this.upImg;

	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0;
	this.position = new MONKEY.Position(x,y);

	this.status = "up";	
	//listener
	this.listener = {};
	//鼠标在内部
	this.mouseIntIt = false;
	//热区
	this.trigger = parameters.trigger !== undefined ? parameters.trigger : [];
	this.triggerStatus = parameters.trigger !== undefined ? true : false;

	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;
	//是否开启move效果
	this.mouseEnabled = true;
	//是否允许事件触发(针对用户绑定事件)
	this.buttonMode = true;
}
MONKEY.Button.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	constructor:MONKEY.Button,
	setTrigger:function(_arr){
		if(Array.isArray(_arr)){
			this.trigger = _arr;
			this.triggerStatus = true;
		}
	},
	removeTrigger:function(){
		this.trigger = [];
		this.triggerStatus = false;
	},
	getTriggerSpecial:function(){
		var w = this.special.width == null ? this.showImg.width : this.special.width,
			h = this.special.height == null ? this.showImg.height : this.special.height;
		return {width:w,height:h};
	},
	getStatus:function(){
		return this.status;
	},
	setStatus:function(_status,_boo){
		var boo = _boo == undefined ? false : _boo;
		if(this.mouseEnabled){
			this.status = _status;
			if(boo){
				this.setListener(this.status);
			}
			if(this.status == "down" && this.choiceSwitch){
				if(this.choiceStatus){
					this.choiceStatus  = false;
				}else{
					this.choiceStatus = true;
				}
			}
		}
	},
	getChoiceStatus:function(){
		return this.choiceStatus;
	},
	setListener:function(_type){
		if(this.listener === undefined) return; 	
		if(this.buttonMode){
			var type = null;
			switch(_type){
				case "down":
					type = "mousedown";
					break;
				case "move":
					type = "mousemove";
					break;
				case "up":
					type = "mouseup";
					break;
				case "disable":
					type = "disable";
					break;
				case "out":
					type = "mouseout";
					break;
				case "over":
					type = "mouseover";
					break;
				default:
					type = _type;
			}
			var  listenerArray = this.listener[type];
			if(listenerArray !== undefined){
				for(var i = 0 ; i < listenerArray.length; i ++){
					listenerArray[i].call(this);
				}
			}
		}
	},
	draw:function(canvas,ctx){
		if(!this.visible) return;
		ctx.save();
		ctx.globalAlpha = this.alpha;
		if(this.status == "up"){
			this.showImg = this.upImg;
		}else
			if(this.status == "down"){
				this.showImg = this.downImg;
			}else
				if(this.status == "move"){
					this.showImg = this.moveImg;
				}else
					if(this.status == "disable"){
						this.showImg = this.disableImg;
					}
		ctx.drawImage(this.showImg,0,0,this.showImg.width,this.showImg.height,this.position.x,this.position.y,this.showImg.width,this.showImg.height);
		ctx.restore();
	}
})

/*
**	IntervalAnimation类
**	单层次动画类
**	author:snow.he
*/
MONKEY.IntervalAnimation = function(_parameters){
	var self = this;
	parameters = _parameters || {};
	MONKEY.Animal.call(this,parameters);
	this.type = "IntervalAnimation";

	this.alpha = parameters.alpha !== undefined ? parameters.alpha : 1;
	this.pause = true;
	this.name = parameters.name !== undefined ? parameters.name : " ";
	this.uuid = MONKEY.Math.generateUUID();

	this.frameArray = parameters.frameArray !== undefined ? parameters.frameArray : [];

	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0,
		w = parameters.width !== undefined ? parameters.width : null,
		h = parameters.height !== undefined ? parameters.height : null;

	//位置
	this.position = new MONKEY.Position(x,y);
	//层次
	this.zIndex = parameters.zIndex !== undefined ? parameters.zIndex : 0;
	//大小规格
	this.special = {
		width:w,
		height:h
	};
	this.parent = null;
	this.children = [];
	//播放方向
	this.direction = parameters.direction !== undefined ? parameters.direction : true;
	//是否自循环[自循环时不触发end函数]
	this.intervalStatus = parameters.intervalStatus !== undefined ? parameters.intervalStatus : false;
	//播放次数[此属性自循环时将被忽略]
	this.playTime = parameters.playTime !== undefined ? parameters.playTime : 1;
	this.currentPlayTime = 0;

	this.lastFrame = this.frameArray.length > 0 ? this.frameArray.length - 1 : 0;
	this.firstFrame = parameters.firstFrame !== undefined ? parameters.firstFrame : 0;
	this.currentFrame = this.direction == true ? this.firstFrame : this.lastFrame;

	//跳帧间隔[默认200毫秒]
	this.cycle = parameters.cycle !== undefined ? parameters.cycle : 200;
	//计时
	this.clocker = new MONKEY.Clock();
	this.interval = 0;
	//监听
	this.listener = {};
	//动画对象的运动
	this.motionFuncs = [];
	//放大缩小
	this.scale = new MONKEY.Position(1,1);
	//旋转
	this.rotate = parameters.rotate !== undefined ? parameters.rotate : 0; 
	//旋转中心[默认为左上角坐标]
	this.rotatePoint = new MONKEY.Position(x,y);
	
	this.visible = parameters.visible !== undefined ? parameters.visible : true;
	//是否运行自绘画函数
	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;

}
MONKEY.IntervalAnimation.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	contructor:MONKEY.IntervalAnimation,
	getTriggerSpecial:function(){
		var w = this.frameArray[this.currentFrame].width,
			h = this.frameArray[this.currentFrame].height;
		return {width:w,height:h};
	},
	goto:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
	},
	gotoAndStop:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
		this.pause = true;
	},
	gotoAndPlay:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
		this.play();
	},
	gotoEnd:function(){
		this.currentFrame = this.lastFrame;
	},
	gotoNext:function(_n){
		var nowFrame = this.currentFrame + _n;
		this.currentFrame = MONKEY.Math.clamp(nowFrame,this.firstFrame,this.lastFrame);
	},
	play:function(){
		this.pause = false;
		this.currentPlayTime = 0;
	},
	stop:function(){
		this.pause = true;
	},
	setPlayTime:function(_n){
		if(!isNaN(_n)){
			this.playTime = _n;
		}
	},
	getPlayTime:function(_n){
		return this.playTime;
	},
	gotoNextInterval:function(_n){
		var nowFrame = this.currentFrame + _n;
		if(!this.intervalStatus){
			if((this.direction && nowFrame == this.lastFrame) || (!this.direction && nowFrame == this.firstFrame)){
				this.currentPlayTime ++;
				if(this.currentPlayTime >= this.playTime){
					this.pause = true;
					nowFrame = this.direction == true ? this.lastFrame : this.firstFrame;
					if(this.listener !== undefined){
						var  listenerArray = this.listener["ended"];
						if(listenerArray !== undefined){
							for(var i = 0 ; i < listenerArray.length; i ++){
								listenerArray[i].call(this);
							}
						}	
						
					}
				}
			}
		}
		if(nowFrame >= this.firstFrame && nowFrame <= this.lastFrame){
			this.currentFrame = nowFrame;
		}else
			if(nowFrame < this.firstFrame){
				nowFrame = this.lastFrame + 1 + nowFrame;
				while(nowFrame < 0 ){
					nowFrame = this.lastFrame + 1 + nowFrame;
				}
				this.currentFrame = nowFrame;
			}else
				if(nowFrame > this.lastFrame){
					nowFrame = nowFrame%(this.lastFrame +1);
					this.currentFrame = nowFrame;
				}
	},
	updataClock:function(){
		this.clocker.resetClock();
	},
	spins:function(){
		var runTime = this.clocker.getDelta();
		runTime = runTime * 1000;
		this.interval += runTime;
		if(this.interval >= this.cycle){
			//this.interval = this.interval - this.cycle;
			this.interval = this.interval % this.cycle;
			if(this.direction){
				this.gotoNextInterval(1);
			}else{
				this.gotoNextInterval(-1)
			}
			
		}
	}
});

/*
**	AnyIntervalAnimation
**	多层次动画
**	@author snow.he
 */
MONKEY.AnyIntervalAnimation = function(_parameters){

	var parameters = _parameters || {};

	MONKEY.IntervalAnimation.call(this,parameters);

	this.type = "AnyIntervalAnimation";

	this.frameArray =  parameters.frameArray !== undefined ? parameters.frameArray : [[]];

	//当前所处动画层次
	this.currentFrameIndex = 0;
	this.firstFrameIndex = 0;
	this.lastFrameIndex = parameters.frameArray.length > 0 ? parameters.frameArray.length - 1 : 0;

	this.currentFrame = 0;
	this.firstFrame = 0;
	this.lastFrame = this.frameArray[this.currentFrameIndex].length > 0 ? this.frameArray[this.currentFrameIndex].length - 1 : 0;

}
MONKEY.AnyIntervalAnimation.prototype = Object.assign(Object.create(MONKEY.IntervalAnimation.prototype),{
	contructor:MONKEY.AnyIntervalAnimation,
	gotoIndex:function(_frameIndex,_boo){
		var boo = _boo == undefined ? false : _boo;
		var frameIndex = MONKEY.Math.clamp(_frameIndex,this.firstFrameIndex,this.lastFrameIndex);
		this.currentFrameIndex = frameIndex;
		this.lastFrame = this.frameArray[this.currentFrameIndex].length > 0 ? this.frameArray[this.currentFrameIndex].length - 1 : 0;
		if(boo){
			this.currentFrame = this.firstFrame;
		}else{
			this.currentFrame = this.currentFrame > this.lastFrame ? this.lastFrame : this.currentFrame;
		}
	},
	gotoIndexAndStop:function(_frameIndex,_boo){
		var boo = _boo == undefined ? false : _boo;
		var frameIndex = MONKEY.Math.clamp(_frameIndex,this.firstFrameIndex,this.lastFrameIndex);
		this.currentFrameIndex = frameIndex;
		if(boo){
			this.currentFrame = this.firstFrame;
		}
		this.pause = true;
	},
	gotoIndexAndPlay:function(_frameIndex,_boo){
		var boo = _boo == undefined ? false : _boo;
		var frameIndex = MONKEY.Math.clamp(_frameIndex,this.firstFrameIndex,this.lastFrameIndex);
		this.currentFrameIndex = frameIndex;
		if(boo){
			this.currentFrame = this.firstFrame;
		}
		this.pause = false;
	},
	gotoIndexEnd:function(_frameIndex,_boo){
		var boo = _boo == undefined ? false : _boo;
		this.currentFrame = this.lastFrameIndex;
		if(boo){
			this.currentFrame = this.firstFrame;
		}
	},
	gotoIndexNext:function(_n,_boo){
		var boo = _boo == undefined ? false : _boo;
		var nowFrameIndex = this.currentFrameIndex + _n;
		this.currentFrameIndex = MONKEY.Math.clamp(nowFrameIndex,this.firstFrameIndex,this.lastFrameIndex);
		if(boo){
			this.currentFrame = this.firstFrame;
		}
	},
	gotoIndexInterval:function(_n,_boo){
		var boo = _boo == undefined ? false : _boo;
		var nowFrameIndex = this.currentFrameIndex + _n;

		if(nowFrameIndex >= this.firstFrame && nowFrameIndex <= this.lastFrame){
			this.currentFrameIndex = nowFrameIndex;
		}else
			if(nowFrameIndex < this.firstFrame){
				nowFrameIndex = this.lastFrame + 1 + nowFrameIndex;
				while(nowFrameIndex < 0 ){
					nowFrameIndex = this.lastFrame + 1 + nowFrameIndex;
				}
				this.currentFrameIndex = nowFrameIndex;
			}else
				if(nowFrameIndex > this.lastFrame){
					nowFrameIndex = nowFrameIndex%(this.lastFrame +1);
					this.currentFrameIndex = nowFrameIndex;
				}
	}
});

/*
**	IntervalAnimation
**	单张图动画
**	@jun.zhu/snow.he
*/

MONKEY.SameGraphAnimation  = function(_parameters){

	parameters = _parameters || {};

	this.type = "SameGraphAnimation";

	this.alpha = parameters.alpha !== undefined ? parameters.alpha : 1;
	this.pause = true;
	this.name = parameters.name !== undefined ? parameters.name : " ";
	this.uuid = MONKEY.Math.generateUUID();

	this.frameImg = parameters.frameImg !== undefined ? parameters.frameImg : new Image();

	//动画间隔
	var po_int_x = parameters.posIntervalX !== undefined ? parameters.posIntervalX : 100,
		po_int_y = parameters.posIntervalY !== undefined ? parameters.posIntervalY : 100;
	this.positionInterval = new MONKEY.Position(po_int_x,po_int_y);

	//定位原点
	var po_static_x = parameters.posStaticX !== undefined ? parameters.posStaticX : 0,
		po_static_y = parameters.posStaticY !== undefined ? parameters.posStaticY : 0;
	this.positionStatic = new MONKEY.Position(po_static_x,po_static_y);

	//每行帧数
	this.column = parameters.column !== undefined ? parameters.column : 1;

	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0,
		w = parameters.width !== undefined ? parameters.width : 100,
		h = parameters.height !== undefined ? parameters.height : 100;

	//位置
	this.position = new MONKEY.Position(x,y);
	//层次
	this.zIndex = parameters.zIndex !== undefined ? parameters.zIndex : 0;
	//大小规格
	this.special = {
		width:w,
		height:h
	};
	this.parent = null;
	this.children = [];

	//是否自循环[自循环时不触发end函数]
	this.intervalStatus = parameters.intervalStatus !== undefined ? parameters.intervalStatus : false;
	//播放次数[此属性自循环时将被忽略]
	this.playTime = parameters.playTime !== undefined ? parameters.playTime : 1;
	this.currentPlayTime = 0;

	this.lastFrame = parameters.lastFrame !== undefined ? parameters.lastFrame : 0;
	this.firstFrame = parameters.firstFrame !== undefined ? parameters.firstFrame : 0;
	this.currentFrame = this.direction == true ? this.firstFrame : this.lastFrame;
	//跳帧间隔[默认200毫秒]
	this.cycle = parameters.cycle !== undefined ? parameters.cycle : 200;
	//计时
	this.clocker = new MONKEY.Clock();
	this.interval = 0;
	//监听
	this.listener = {};
	//动画对象的运动
	this.motionFuncs = [];
	//放大缩小
	this.scale = new MONKEY.Position(1,1);
	//播放方向
	this.direction = parameters.direction !== undefined ? parameters.direction : true;
	//旋转
	this.rotate = parameters.rotate !== undefined ? parameters.rotate : 0; 
	//旋转中心[默认为左上角坐标]
	this.rotatePoint = new MONKEY.Position(x,y);

	
	this.visible = parameters.visible !== undefined ? parameters.visible : true;
	//是否运行自绘画函数
	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;
	//是否开启move效果
	this.mouseEnabled = true;
	//是否允许事件触发(针对用户绑定事件)
	this.buttonMode = true;
}

MONKEY.SameGraphAnimation.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	contructor:MONKEY.SameGraphAnimation,
	goto:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
	},
	gotoAndStop:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
		this.pause = true;
	},
	gotoAndPlay:function(_frame){
		var frame = MONKEY.Math.clamp(_frame,this.firstFrame,this.lastFrame);
		this.currentFrame = frame;
		this.pause = false;
	},
	gotoEnd:function(){
		this.currentFrame = this.lastFrame;
	},
	gotoNext:function(_n){
		var nowFrame = this.currentFrame + _n;
		this.currentFrame = MONKEY.Math.clamp(nowFrame,this.firstFrame,this.lastFrame);
	},
	play:function(){
		this.pause = false;
	},
	stop:function(){
		this.pause = true;
	},
	gotoNextInterval:function(_n){
			var nowFrame = this.currentFrame + _n;
			if(!this.intervalStatus){
				if((this.direction && nowFrame == this.lastFrame) || (!this.direction && nowFrame == this.firstFrame)){
					this.currentPlayTime ++;
					if(this.currentPlayTime >= this.playTime){
						this.pause = true;
						nowFrame = this.direction == true ? this.lastFrame : this.firstFrame;
						if(this.listener !== undefined){
							var  listenerArray = this.listener["ended"];
							if(listenerArray !== undefined){
								for(var i = 0 ; i < listenerArray.length; i ++){
									listenerArray[i].call(this);
								}
							}	
							
						}
					}
				}
			}
			if(nowFrame >= this.firstFrame && nowFrame <= this.lastFrame){
				this.currentFrame = nowFrame;
			}else
				if(nowFrame < this.firstFrame){
					nowFrame = this.lastFrame + 1 + nowFrame;
					while(nowFrame < 0 ){
						nowFrame = this.lastFrame + 1 + nowFrame;
					}
					this.currentFrame = nowFrame;
				}else
					if(nowFrame > this.lastFrame){
						nowFrame = nowFrame%(this.lastFrame +1);
						this.currentFrame = nowFrame;
					}
	},
	updataClock:function(){
		this.clocker.resetClock();
	},
	spins:function(){
		var runTime = this.clocker.getDelta();
		runTime = runTime * 1000;
		this.interval += runTime;
		if(this.interval >= this.cycle){
			//this.interval = this.interval - this.cycle;
			this.interval = this.interval % this.cycle;
			if(this.direction){
				this.gotoNextInterval(1);
			}else{
				this.gotoNextInterval(-1);
			}
			
		}
	}
});

/*
**	文本类
**	显示文本
**
 */

MONKEY.Text = function(_parameters){
	parameters = _parameters || {};

	this.type = "Text";

	this.alpha = parameters.alpha !== undefined ? parameters.alpha : 1;

	this.name = parameters.name !== undefined ? parameters.name : " ";
	this.uuid = MONKEY.Math.generateUUID();

	this.textStr = parameters.txt !== undefined ? parameters.txt : null;

	this.textAlign = parameters.textAlign !== undefined ? parameters.textAlign : "left";
	//fontSize  [px]
	this.fontSize = parameters.fontSize !== undefined ? parameters.fontSize : 18;
	this.lineHeight = parameters.lineHeight !== undefined ? parameters.lineHeight : 18;

	this.fillStyle = parameters.fillStyle !== undefined ? parameters.fillStyle : (parameters.color !== undefined ? parameters.color : "#000");
	this.fontFamily = parameters.fontFamily !== undefined ? parameters.fontFamily : "Arial";

	var len = this.textStr == null ? 1 : this.textStr.length;
	var x = parameters.x !== undefined ? parameters.x : 0,
		y = parameters.y !== undefined ? parameters.y : 0,
		w = parameters.width !== undefined ? parameters.width : len*this.fontSize + 20,
		h = parameters.height !== undefined ? parameters.height : this.lineHeight;

	//位置
	this.position = new MONKEY.Position(x,y);
	//层次
	this.zIndex = parameters.zIndex !== undefined ? parameters.zIndex : 0;
	//大小规格
	this.special = {
		width:w,
		height:h
	};

	//自动换行
	this.autoLineFeed = parameters.autoLineFeed !== undefined ? parameters.autoLineFeed : false;
	this.lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : this.special.width;
	//首行缩进
	this.indent = parameters.indent !== undefined ? (this.textAlign != "left" ? false : parameters.indent) : false;

	this.parent = null;
	this.children = [];

	//动画对象的运动
	this.motionFuncs = [];
	//放大缩小
	this.scale = new MONKEY.Position(1,1);
	//旋转
	this.rotate = parameters.rotate !== undefined ? parameters.rotate : 0; 
	//旋转中心[默认为左上角坐标]
	this.rotatePoint = new MONKEY.Position(x,y);
	
	this.visible = parameters.visible !== undefined ? parameters.visible : true;
	//是否运行自绘画函数
	this.isDrawFunc = false;
	//是否render绘画背景
	this.renderDraw = true;
}
MONKEY.Text.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	contructor:MONKEY.Text,
	setText:function(_str){
		this.textStr = _str.toString();
		this.updata();
	},
	getText:function(){
		return this.textStr;
	},
	addText:function(_str){
		this.textStr += _str;
		this.updata();
	},
	removeText:function(){
		this.textStr = null;
		this.updata();
	},
	updata:function(){
		var len = this.textStr == null ? 1 : this.textStr.length;
		this.special.width = len*this.fontSize + 20;
		if(!this.autoLineFeed){
			this.lineWidth = this.special.width;
		}
	}
});

/*
*	计时类
* 
 */
MONKEY.TimeText = function(_parameters){
	var parameters = _parameters || {};
	MONKEY.Text.call(this,parameters);

	this.type = "TimeText";

	//计时方向
	this.timeDirection = parameters.timeDirection !== undefined ? parameters.timeDirection : true;
	//开始计数
	this.startTime = parameters.startTime !== undefined ? parameters.startTime : 0;
	//当前计数
	this.currentTime = this.startTime;
	//结束计数
	this.endTime = parameters.endTime !== undefined ? parameters.endTime : 100;
	this.endTimeStatus = parameters.endTime !== undefined ? true : false;

	//计时
	this.clocker = new MONKEY.Clock();
	this.runTime = 0;
	this.runing = false;
	//计量单位,毫秒
	this.unit = parameters.unit !== undefined ? parameters.unit : 1000;
	//显示方法
	this.staticFunc = function(time){return time;};
	this.showFunc = parameters.showFunc !== undefined ? parameters.showFunc : this.staticFunc;
	this.updataFunc = parameters.updataFunc !== undefined ? parameters.updataFunc : function(){};
	this.callBack = parameters.callBack !== undefined ? parameters.callBack : function(){};

	//是否运行自绘画函数
	this.isDrawFunc = true;
	//是否render绘画背景
	this.renderDraw = false;
}
MONKEY.TimeText.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	constructor:MONKEY.TimeText,
	getTimeDirection:function(){
		return this.timeDirection;
	},
	setTimeDirection:function(_boo){
		var boo = _boo !== undefined ? _boo : true;
		this.timeDirection = boo;
	},
	getCurrentTime:function(){
		return this.currentTime;
	},
	setCurrentTime:function(num){
		if(!isNaN(num)){
			this.currentTime = num;
		}
	},
	changeShowFunc:function(_func){
		if(typeof _func == "function"){
			this.showFunc = _func;
		}
	},
	changeUpdataFunc:function(_func){
		if(typeof _func == "function"){
			this.updataFunc = _func;
		}
	},
	changeCallBack:function(_func){
		if(typeof _func == "function"){
			this.callBack = _func;
		}
	},
	getEndTime:function(){
		return this.endTime;
	},
	setEndTime:function(num){
		if(!isNaN(num)){
			this.endTime = num;
		}	
	},
	play:function(){
		this.clocker.resetClock();
		this.runing = true;
	},
	pause:function(){
		this.runing = false;
	},
	reset:function(){
		this.currentTime = this.startTime;
	},
	updataTime:function(){
		if(this.runing){
			var goTime = this.clocker.getDelta() * 1000;
			this.runTime += goTime;
			if(this.runTime > this.unit){
				if(this.timeDirection){
					this.currentTime ++;
				}else{
					this.currentTime --;
				}
				if(this.endTimeStatus){
					if(this.timeDirection && this.currentTime >= this.endTime){
						this.callBack(this.currentTime);
						this.runing = false;
					}else
						if(!this.timeDirection && this.currentTime <= this.endTime){
							this.callBack(this.currentTime);
							this.runing = false;
						}else{
							this.updataFunc(this.currentTime);
						}
				}else{
					this.updataFunc(this.currentTime);
				}
				this.runTime = this.runTime % this.unit;
			} 
		}
	},
	draw:function(canvas,ctx,renderer){
		this.updataTime();
		if(this.visible){
			var str = this.showFunc(this.currentTime);
				str = str.toString();
			var width = str.length *  this.fontSize,
				height = this.special.height == null ? 18 : this.lineHeight;

			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this);
				position.y = MONKEY.Math.getPositionY(this) + height;

			var rotate = MONKEY.Math.getRotate(this),
				rotatePoint = { x:this.rotatePoint.x + position.x - this.position.x,
								y:this.rotatePoint.y + position.y - this.position.y};

			var special = {width: width,height:height};

			var proto = {
						txt:str.toString(),
						position:position,
						rotate:rotate,
						special:special,
						rotatePoint:rotatePoint,
						textAlign:this.textAlign,
						fontSize:this.fontSize,
						fontFamily:this.fontFamily,
						fillStyle:this.fillStyle
					};

			renderer.renderDrawTextFunc(proto);

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});

/**
 * <p>graphics类
 * 制图类
 * @snow.he
 *
 */
MONKEY.Graphics = function(_parameters){

	var parameters = _parameters || {};

	MONKEY.Animal.call(this,parameters);

	this.type = "Graphics";
	//绘图顶点
	this.graphVertexs = parameters.graphVertexs !== undefined ? parameters.graphVertexs : [];
	//实时顶点
	this.cacheVertexs = parameters.graphVertexs !== undefined ? parameters.graphVertexs : [];
	//是否封闭图形
	this.closeStatus = parameters.closeStatus !== undefined ? parameters.closeStatus : true;
	//是否画线
	this.strokeStatus = parameters.strokeStatus !== undefined ? parameters.strokeStatus : true;
	//strokeStyle
	this.strokeStyle = parameters.strokeStyle !== undefined ? parameters.strokeStyle : "#000";
	//线条宽度
	this.lineWidth = parameters.lineWidth !== undefined ? parameters.lineWidth : 1;
	//末端样式
	this.lineCap = parameters.lineCap !== undefined ? parameters.lineCap : "butt";
	//是否填充
	this.fillStatus = parameters.fillStatus !== undefined ? parameters.fillStatus : false;
	//填充颜色
	this.fillStyle = parameters.fillStyle !== undefined ? parameters.fillStyle : "#000";
	//线段设置
	this.lineDash = parameters.lineDash !== undefined ? parameters.lineDash : [0,0];
	//是否自计算热区触发[若为true,则监听组件将会调取对象isPointInPath函数确定热区]
	this.isCountPath = parameters.isCountPath !== undefined ? parameters.isCountPath : false;
	//isPointInPath函数核
	this.isPointInPathFunc = parameters.isPointInPathFunc !== undefined ? parameters.isPointInPathFunc : function(){return false};
	//是否允许反转
	this.reverseStatus = true;
	this.reverse_X = false;
	this.reverseCenterX = 0;
	this.reverse_Y = false;
	this.reverseCenterY = 0;
	//是否运行自绘画函数
	this.isDrawFunc = true;
	//是否render绘画背景
	this.renderDraw = false;
}
MONKEY.Graphics.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	constructor:MONKEY.Graphics,
	setGraphVertexs:function(graphVertexs){
		if(Array.isArray(graphVertexs)){
			this.graphVertexs = graphVertexs;
		}
	},
	getGraphVertexs:function(){
		return this.graphVertexs;
	},
	isPointInPath:function(x,y){
		var status = false;
		status = this.isPointInPathFunc(x,y);
		return status;
	},
	setIsPointInPathFunc:function(_func){
		if(typeof _func == "function"){
			this.isPointInPathFunc = _func;
		}
	},
	setLineDash:function(_arr){
		if(Array.isArray(_arr)){
			this.lineDash = _arr;
		}
	},
	resetLineDash:function(){
		this.lineDash = [0,0];
	},
	setCloseStatus:function(_boo){
		if(_boo){
			this.closeStatus = true;
		}else{
			this.closeStatus = false;
		}
	},
	getCloseStatus:function(){
		return this.closeStatus;
	},
	setFillStyle:function(_style){
		this.fillStyle = _style !== undefined ? _style : "#000";
	},
	getFillStyle:function(){
		return this.fillStyle;
	},
	setStrokeStyle:function(_style){
		this.strokeStyle = _style !== undefined ? _style : "#000";
	},
	getStrokeStyle:function(){
		return this.strokeStyle;
	},
	getScalePoints:function(points){
		return this.getCenterPoint(points);
	},
	getCenterPoint:function(_points){
		var points = _points || this.graphVertexs;
		var pointX = [0,0],
			pointY = [0,0];

		for(var i = 0; i < points.length; i ++){
			pointX[0] += points[i][0];
			pointY[0] += points[i][1];
			pointX[1] += 1;
			pointY[1] += 1;
		}
		return [parseInt(pointX[0]/pointX[1]),parseInt(pointY[0]/pointY[1])];
	},
	reverseX:function(centerX){
		var centerPointX = centerX !== undefined ? centerX : this.getCenterPoint(this.graphVertexs)[0];
		centerPointX = centerPointX * 2;
		for(var i = 0; i < this.graphVertexs.length; i ++){
			this.graphVertexs[i][0] = centerPointX - this.graphVertexs[i][0];
		}
	},
	reverseY:function(centerY){
		var centerPointY = centerY !== undefined ? centerY : this.getCenterPoint(this.graphVertexs)[1];
		centerPointY = centerPointY * 2;
		for(var i = 0; i < this.graphVertexs.length; i ++){
			this.graphVertexs[i][1] = centerPointY - this.graphVertexs[i][1];
		}
	},
	reverse:function(x,y){
		var centerX = x !== undefined ? x : this.getCenterPoint(this.graphVertexs)[0],
			centerY = y !== undefined ? y : this.getCenterPoint(this.graphVertexs)[1];
		centerX = centerX * 2;
		centerY = centerY * 2;
		for(var i = 0; i < this.graphVertexs.length; i ++){
			this.graphVertexs[i][0] = centerX - this.graphVertexs[i][0];
			this.graphVertexs[i][1] = centerY - this.graphVertexs[i][1];
		}
	},
	isClickMe:function(x,y){

	},
	isInMe:function(x,y){
		var point = new MONKEY.position(x,y);
		return MONKEY.Common.PointInPoly(point,this.graphVertexs);
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			if(this.graphVertexs.length > 0){
				var position = {x:0,y:0};
					position.x = MONKEY.Math.getPositionX(this) - this.position.x;
					position.y = MONKEY.Math.getPositionY(this) - this.position.y;
				var rotate = MONKEY.Math.getRotate(this),
					rotatePoint = {x:this.rotatePoint.x + position.x - this.position.x,
								   y:this.rotatePoint.y + position.y - this.position.y};
				var nowGraphPoints = [];
				if(this.scale){
					var scale = MONKEY.Math.getScale(this);
					if(scale.x != 1 || scale.y != 1){
						var scalePoint = this.getScalePoints(this.graphVertexs);
						var nowMatrix2 = new MONKEY.Matrix2();
						for(var i = 0; i < this.graphVertexs.length; i ++){
							nowMatrix2.set(this.graphVertexs[i][0],this.graphVertexs[i][1]);
							nowMatrix2.scale(scale.x,scale.y,scalePoint[0],scalePoint[1]).parseInt();
							nowGraphPoints.push([nowMatrix2.elements[0] + position.x ,nowMatrix2.elements[1] + position.y]);
						}
					}else{
						nowGraphPoints = this.graphVertexs;
					}
				}
				var proto = {
					graphVertexs:nowGraphPoints,
					rotate:rotate,
					rotatePoint:rotatePoint,
					alpha:this.alpha,
					lineWidth:this.lineWidth,
					lineCap:this.lineCap,
					strokeStatus:this.strokeStatus,
					strokeStyle:this.strokeStyle,
					fillStatus:this.fillStatus,
					fillStyle:this.fillStyle,
					closeStatus:this.closeStatus,
					lineDash:this.lineDash
				};
				renderer.drawLines(proto);

			}
			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}

	}
})

/*
*	circular圆形
* @author:snow.he
 */
MONKEY.CircularGraphics = function(_parameters){
	var parameters = _parameters || {};
	MONKEY.Graphics.call(this,parameters);

	this.type = "CircularGraphics";
	//圆心
	this.centre = parameters.centre !== undefined ? parameters.centre :[0,0];
	//半径
	this.radius = parameters.radius !== undefined ? parameters.radius : 10;

}
MONKEY.CircularGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
	constructor:MONKEY.CircularGraphics,
	setCentre:function(_centre){
		if(Array.isArray(_centre)){
			this.centre = _centre;
		}
	},
	getCentre:function(){
		return this.centre;
	},
	setRadius:function(_radius){
		if(!isNaN(_radius)){
			this.radius = _radius;
		}
	},
	getRadius:function(_radius){
		return this.radius;
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this) - this.position.x;
				position.y = MONKEY.Math.getPositionY(this) - this.position.y;

			ctx.save();
			ctx.globalAlpha = this.alpha;	
			ctx.lineCap = this.lineCap;
			ctx.lineWidth = this.lineWidth;
			ctx.beginPath();
			ctx.strokeStyle = this.strokeStyle;
			ctx.arc(this.centre[0] + position.x, this.centre[1] + position.y, this.radius,0, Math.PI*2, false);
			if(this.fillStatus){
				this.fillStyle = this.fillStyle;
				ctx.fill();
			}
			ctx.stroke();
			ctx.restore();

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});
/**
 *	弧
 * @author:snow.he
 */
MONKEY.ArcGraphics = function(_parameters){
	var parameters = _parameters || {};

	MONKEY.Graphics.call(this.parameters);

	this.type = "ArcGraphics";

	this.startAngle = parameters.startAngle !== undefined ? parameters.startAngle : 0;

	this.endAngle = parameters.endAngle !== undefined ? parameters.endAngle : 360;

	this.centre = parameters.centre !== undefined ? parameters.centre : [0,0];

	this.radius = parameters.radius !== undefined ? parameters.radius : 100;

	this.rotatePoint = new MONKEY.Position(this.centre[0],this.centre[1]);
}
MONKEY.ArcGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
	contructor:MONKEY.ArcGraphics,
	setCentre:function(_centre){
		if(Array.isArray(_centre)){
			this.centre = _centre;
		}
	},
	getCentre:function(){
		return this.centre;
	},
	setRadius:function(_radius){
		if(!isNaN(_radius)){
			this.radius = _radius;
		}
	},
	getRadius:function(_radius){
		return this.radius;
	},
	setStartAngle:function(_startAngle){
		this.startAngle = _startAngle;
	},
	getStartAngle:function(){
		return this.startAngle;
	},
	setEndAngle:function(_endAngle){
		this.endAngle = _endAngle;
	},
	getEndAngle:function(){
		return this.endAngle;
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this) - this.position.x;
				position.y = MONKEY.Math.getPositionY(this) - this.position.y;

			ctx.save();
			ctx.globalAlpha = this.alpha;	
			ctx.lineCap = this.lineCap;
			ctx.lineWidth = this.lineWidth;
			ctx.beginPath();
			ctx.strokeStyle = this.strokeStyle;
			ctx.arc(this.centre[0] + position.x, this.centre[1] + position.y, this.radius,this.startAngle, this.endAngle, false);
			//缩放[x缩放改变this.radius  y缩放改变angle]
			//code
			//
			if(this.fillStatus){
				this.fillStyle = this.fillStyle;
				ctx.fill();
			}
			ctx.stroke();
			ctx.restore();

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});
/*
*	sector扇形
*	@author:snow.he
 */
MONKEY.SectorGraphics = function(_parameters){
	var parameters = _parameters || {};

	MONKEY.CircularGraphics.call(this,parameters);

	this.type = "SectorGraphics";

	this.startAngle = parameters.startAngle !== undefined ? parameters.startAngle : 0;

	this.endAngle = parameters.endAngle !== undefined ? parameters.endAngle : Math.PI;

	this.closeStatus = true;
}
MONKEY.SectorGraphics.prototype = Object.assign(Object.create(MONKEY.CircularGraphics.prototype),{
	constructor:MONKEY.SectorGraphics,
	setStartAngle:function(_startAngle){
		this.startAngle = _startAngle;
	},
	getStartAngle:function(){
		return this.startAngle;
	},
	setEndAngle:function(_endAngle){
		this.endAngle = _endAngle;
	},
	getEndAngle:function(){
		return this.endAngle;
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this) - this.position.x;
				position.y = MONKEY.Math.getPositionY(this) - this.position.y;

			ctx.save();
			ctx.globalAlpha = this.alpha;	
			ctx.lineCap = this.lineCap;
			ctx.lineWidth = this.lineWidth;
			ctx.strokeStyle = this.strokeStyle;
			ctx.beginPath();

			var graphVertexs = [[this.centre[0] + position.x,this.centre[1] + position.y],[this.centre[0] + this.radius + position.x,this.centre[1] + position.y]];
			//将第二点绕原点旋转this.startAngle
			//code
			//画图
			ctx.moveTo(graphVertexs[0][0],graphVertexs[0][1]);
			ctx.lineTo(graphVertexs[1][0],graphVertexs[1][1]);
			ctx.arc(this.centre[0],this.centre[1],this.radius,this.startAngle,this.endAngle,false);
			ctx.closePath();
			ctx.stroke();
			/*var nowMatrix2 = new MONKEY.Matrix2();
				nowMatrix2.set(this.centre[0],this.centre[1]);
				nowMatrix2.scale(scale.x,scale.y,scalePoint[0],scalePoint[1]).parseInt();
				nowGraphPoints.push([nowMatrix2.elements[0] + position.x ,nowMatrix2.elements[1] + position.y]);
			}

			ctx.arc(this.centre[0] + position.x, this.centre[1] + position.y, this.radius,0, Math.PI*2, false)
			if(this.fillStatus){
				this.fillStyle = this.fillStyle;
				ctx.fill();
			}
			ctx.stroke();*/
			ctx.restore();
			
			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
})
/*
*	矩形
* 	@author:snow.he
 */
MONKEY.RectangleGraphics = function(_parameters){
	var parameters = _parameters || {};

	MONKEY.Graphics.call(this,parameters);

	this.type = "RectangleGraphics";

}
MONKEY.RectangleGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
	constructor:MONKEY.RectangleGraphics,
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this);
				position.y = MONKEY.Math.getPositionY(this);

			var width = this.special.width == null ? 100 : this.special.width,
				height = this.special.height == null ? 100 :  this.special.height;

			var rotate = MONKEY.Math.getRotate(this),
				rotatePoint = {x:this.rotatePoint.x + position.x - this.position.x,
							   y:this.rotatePoint.y + position.y - this.position.y};

			var graphVertexs = [[position.x,position.y],[position.x + width , position.y],[position.x + width,position.y + height],[position.x , position.y + height]];		

			var nowGraphPoints = [];
			if(this.scale){
				var scale = MONKEY.Math.getScale(this);
				if(scale.x != 1 || scale.y != 1){
					var scalePoint = this.getScalePoints(graphVertexs);
					var nowMatrix2 = new MONKEY.Matrix2();
					for(var i = 0; i < graphVertexs.length; i ++){
						nowMatrix2.set(graphVertexs[i][0],graphVertexs[i][1]);
						nowMatrix2.scale(scale.x,scale.y,scalePoint[0],scalePoint[1]).parseInt();
						nowGraphPoints.push([nowMatrix2.elements[0] + position.x ,nowMatrix2.elements[1] + position.y]);
					}
				}else{
					nowGraphPoints = graphVertexs;
				}
			}

			var proto = {
				graphVertexs:nowGraphPoints,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:this.alpha,
				lineWidth:this.lineWidth,
				lineCap:this.lineCap,
				strokeStatus:this.strokeStatus,
				strokeStyle:this.strokeStyle,
				fillStatus:this.fillStatus,
				fillStyle:this.fillStyle,
				closeStatus:this.closeStatus,
				lineDash:this.lineDash
			};
			renderer.drawLines(proto);

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});

/*
*	line线段类
*
* 
*/
MONKEY.LineGraphics = function(_parameters){
	var parameters = _parameters || {};

	MONKEY.Graphics.call(this,parameters);

	this.type = "LineGraphics";

	this.startPoint = parameters.startPoint !== undefined ? parameters.startPoint : [0,0];

	this.endPoint = parameters.endPoint !== undefined ? parameters.endPoint : [100,100];

	this.rotatePoint = new MONKEY.Position(this.startPoint[0],this.startPoint[0]);

}
MONKEY.LineGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
	contructor:MONKEY.LineGraphics,
	setStartPoint:function(_startPoint){
		if(Array.isArray(_startPoint)){
			this.startPoint = _startPoint;
		}
	},
	getStartPoint:function(){
		return this.startPoint;
	},
	setEndPoint:function(_endPoint){
		if(Array.isArray(_endPoint)){
			this.endPoint = _endPoint;
		}
	},
	getEndPoint:function(){
		return this.endPoint;
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this) - this.position.x;
				position.y = MONKEY.Math.getPositionY(this) - this.position.y;

			var rotate = MONKEY.Math.getRotate(this),
				rotatePoint = {x:this.rotatePoint.x + position.x - this.position.x,
							   y:this.rotatePoint.y + position.y - this.position.y};

			var graphVertexs = [[this.startPoint[0] + position.x,this.startPoint[1] + position.y],[this.endPoint[0] + position.x,this.endPoint[1] + position.y]];		

			var nowGraphPoints = [];
			if(this.scale){
				var scale = MONKEY.Math.getScale(this);
				if(scale.x != 1 || scale.y != 1){
					//var scalePoint = this.getScalePoints(graphVertexs);
					var scalePoint = [this.startPoint[0],this.startPoint[1]];
					var nowMatrix2 = new MONKEY.Matrix2();
					for(var i = 0; i < graphVertexs.length; i ++){
						nowMatrix2.set(graphVertexs[i][0],graphVertexs[i][1]);
						nowMatrix2.scale(scale.x,scale.y,scalePoint[0],scalePoint[1]).parseInt();
						nowGraphPoints.push([nowMatrix2.elements[0] + position.x ,nowMatrix2.elements[1] + position.y]);
					}
				}else{
					nowGraphPoints = graphVertexs;
				}
			}

			var proto = {
				graphVertexs:nowGraphPoints,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:this.alpha,
				lineWidth:this.lineWidth,
				lineCap:this.lineCap,
				strokeStatus:this.strokeStatus,
				strokeStyle:this.strokeStyle,
				fillStatus:this.fillStatus,
				fillStyle:this.fillStyle,
				closeStatus:this.closeStatus,
				lineDash:this.lineDash
			};
			renderer.drawLines(proto);

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});

/*
*	数学函数曲线
* 
 */
MONKEY.MathFunctionGraphics = function(_parameters){
	var parameters = _parameters || {};

	MONKEY.Graphics.call(this,parameters);

	this.type = "MathFunctionGraphics";

	//函数表达式 
	this.mathFunc = parameters.mathFunc !== undefined ? parameters.mathFunc : function(x){return x};

	this.min = parameters.min !== undefined ? parameters.min : 0;
	this.max = parameters.max !== undefined ? parameters.max : 100;
	if(this.min > this.max){
		var mx = this.min;

	}
	//变量[true->x false->y]
	this.XYStatus = parameters.XYStatus !== undefined ? parameters.XYStatus : true;
	
	this.closeStatus = false;
}
MONKEY.MathFunctionGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
	constructor:MONKEY.MathFunctionGraphics,
	getMathFunc:function(){
		return this.mathFunc;
	},
	setMathFunc:function(_mathFunc){
		if(typeof(_mathFunc) == "function"){
			this.mathfunc = _mathFunc;
		}else{
			MONKEY.Math.trace("MONKEY.MathFunctionGraphics.mathFunc must a function.")
		}
	},
	setMin:function(_min){
		this.min = _min;
	},
	getMin:function(){
		return this.min;
	},
	setMax:function(_max){
		this.max = _max;
	},
	getMax:function(){
		return this.max;
	},
	isClickMe:function(x,y){
		var b,e,status = false;
		if(this.XYStatus){
			b = x;
			e = y;
		}else{
			b = y;
			e = x;
		}
		if(this.min <= b && this.max >= b){
			var ne = this.mathFunc(b);
			if(e == ne){
				status = true;
			}
		}
		return status;
	},
	draw:function(canvas,ctx,renderer){
		if(this.visible){
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(this);
				position.y = MONKEY.Math.getPositionY(this);

			var rotate = MONKEY.Math.getRotate(this),
				rotatePoint = {x:this.rotatePoint.x + position.x - this.position.x,
							   y:this.rotatePoint.y + position.y - this.position.y};

			
			var nowGraphPoints = [];
			for(var b = this.min; b <= this.max ; b +=0.5){
				var e = this.mathFunc(b);
				if(this.XYStatus){
					nowGraphPoints.push([b + position.x,e + position.y]);
				}else{
					nowGraphPoints.push([e + position.x,b + position.y]);
				}
			}
					
			var proto = {
				graphVertexs:nowGraphPoints,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:this.alpha,
				lineWidth:this.lineWidth,
				lineCap:this.lineCap,
				strokeStatus:this.strokeStatus,
				strokeStyle:this.strokeStyle,
				fillStatus:this.fillStatus,
				fillStyle:this.fillStyle,
				closeStatus:this.closeStatus,
				lineDash:this.lineDash
			};
		
			renderer.drawLines(proto);

			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					renderer.renderDraw(this.children[i]);
				}
			}
		}
	}
});
/*
*	RegularPolygon
*	正多边形
*	@author: janue.wang
 */
 MONKEY.RegularPolygonGraphics = function(_parameters){
 	var parameters = _parameters || {};

 	MONKEY.Graphics.call(this,parameters);

 	this.type = "RegularPolygonGraphics";

 	this.visible = parameters.visible !== undefined ? parameters.visible : true;
 	//中心
 	this.centre = parameters.centre !== undefined ? parameters.centre : [0,0];
 	//半径(中心与顶点的距离)
 	this.radius = parameters.radius !== undefined ? parameters.radius : 100;
 	//边数
 	this.edges = parameters.edges !== undefined ? parameters.edges : 3;
 	if(this.edges<3) this.edges = 3;
 	//内角度数
 	this.interiorAngle = (this.edges-2)*180/this.edges;
 }
 MONKEY.RegularPolygonGraphics.prototype = Object.assign(Object.create(MONKEY.Graphics.prototype),{
 	contructor:MONKEY.RegularPolygonGraphics,
 	setCentre:function(_centre){
 		if(Array.isArray(_centre))
 			this.centre = _centre;
 	},
 	getCentre:function(){
 		return this.centre;
 	},
 	setRadius:function(_radius){
 		if(!isNaN(_radius))
 			this.radius = _radius;
 	},
 	getRadius:function(_radius){
 		return this.radius;
 	},
 	setEdges:function(_edges){
 		if(!isNaN(_edges)&&_edges>=3){
 			this.edges = _edges;
 			this.interiorAngle = (this.edges-2)*180/this.edges;
 		}
 	},
 	getEdges:function(_edges){
 		return this.edges;
 	},
 	setApothem:function(_apothem){
 		this.apothem = Math.cos(MONKEY.Math.degToRad(180/this.edges))*this.radius;
 	},
 	draw:function(canvas,ctx,renderer){ //首先确定一个点集，然后连接这个点集
 		if(this.visible){
 			var position = {x:0,y:0};
 				position.x = MONKEY.Math.getPositionX(this) - this.position.x;
 				position.y = MONKEY.Math.getPositionY(this) - this.position.y;

 			var rotate = MONKEY.Math.getRotate(this),
 				rotatePoint = {x:this.rotatePoint.x + position.x - this.position.x,
 							   y:this.rotatePoint.y + position.y - this.position.y};

 			this.setApothem();//确定边心距
 			//先确定第一个点，奇数边则是[this.centre[0],this.centre[1]-this.radius],偶数边则是
 			var firstPoint = [this.centre[0],this.centre[1]-this.radius];
 			if(this.edges%2==0)
 				firstPoint = [this.centre[0]+(Math.sin(MONKEY.Math.degToRad(180/this.edges))*this.radius),this.centre[1]-this.apothem];
 			//根据第一个点确定点集
 			var pointArr = []; pointArr.push(firstPoint);
 			var mat = new MONKEY.Matrix2();
 			for(var i = 0,len = this.edges-1;i < len;i ++){
 				mat.set(pointArr[pointArr.length-1][0],pointArr[pointArr.length-1][1]);
 				mat.rotate(360/this.edges,this.centre[0],this.centre[1]);
 				pointArr.push([mat.elements[0],mat.elements[1]]);
 			}
 			for(var i = 0,len = pointArr.length;i < len;i ++){
 				pointArr[i][0] += position.x;
 				pointArr[i][1] += position.y;
 			}

 			var nowGraphPoints = [];
 			if(this.scale){
 				var scale = MONKEY.Math.getScale(this);
 				if(scale.x != 1 || scale.y != 1){
 					var scalePoint = this.getScalePoints(pointArr);
 					var nowMatrix2 = new MONKEY.Matrix2();
 					for(var i = 0; i < pointArr.length; i ++){
 						nowMatrix2.set(pointArr[i][0],pointArr[i][1]);
 						nowMatrix2.scale(scale.x,scale.y,scalePoint[0],scalePoint[1]).parseInt();
 						nowGraphPoints.push([nowMatrix2.elements[0] + position.x ,nowMatrix2.elements[1] + position.y]);
 					}
 				}else{
 					nowGraphPoints = pointArr;
 				}
 			}
 			//根据点集画出图形
 			var proto = {
 				graphVertexs:nowGraphPoints,
 				rotate:rotate,
 				rotatePoint:rotatePoint,
 				alpha:this.alpha,
 				lineWidth:this.lineWidth,
 				lineCap:this.lineCap,
 				strokeStatus:this.strokeStatus,
 				strokeStyle:this.strokeStyle,
 				fillStatus:this.fillStatus,
 				fillStyle:this.fillStyle,
 				closeStatus:this.closeStatus,
 				lineDash:this.lineDash
 			};
 			renderer.drawLines(proto);
 			
 			if(this.children.length > 0){
 				for(var i = 0; i < this.children.length; i ++){
 					renderer.renderDraw(this.children[i]);
 				}
 			}
 		}
 	}
 });

