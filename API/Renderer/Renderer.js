//渲染器
/*
* 基本组成部分，
* 	1.将我们需要的对象场景等渲染至画布舞台上
*   2.负责对对象自运行函数等方法的遍历调用
*   3.负责对对象自绘函数的调用
*   4.负责画布舞台的整体控制，
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
	getCanvasDataURL:function(_type,_encoderOptions){
		var type = _type || "image/jpeg",
			encoderOptions = _encoderOptions || 0.5;
		return this.canvas.toDataURL(type,encoderOptions);
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
			var position = {x:0,y:0};
				position.x = MONKEY.Math.getPositionX(_scene);
				position.y = MONKEY.Math.getPositionY(_scene);
			var rotate = MONKEY.Math.getRotate(_scene),
				rotatePoint = {x:_scene.rotatePoint.x + position.x - _scene.position.x,
								y:_scene.rotatePoint.y + position.y - _scene.position.y};
			if(_scene.background != null && _scene.backgroundStatus){	
				var proto = {
					position:position,
					rotate:rotate,
					rotatePoint:rotatePoint,
					alpha:_scene.alpha
				}
				if(_scene.scale){
					proto.special = {width:_scene.background.width*_scene.scale.x,height:_scene.background.height*_scene.scale.y};
				}
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
			var sPosition = {x:0,y:0};
				sPosition.x = MONKEY.Math.getPositionX(_animal);
				sPosition.y = MONKEY.Math.getPositionY(_animal);
			var rotate = MONKEY.Math.getRotate(_animal),
				rotatePoint = {x:_animal.rotatePoint.x + position.x - _animal.position.x,
								y:_animal.rotatePoint.y + position.y - _animal.position.y};
			if(_animal.background != null && _animal.backgroundStatus){	
				var proto = {
					position:position,
					sPosition:sPosition,
					rotate:rotate,
					rotatePoint:rotatePoint,
					alpha:_animal.alpha
				}
				if(_animal.scale){
					var width = _animal.special.width == null ? _animal.background.width : _animal.special.width,
						height = _animal.special.height == null ? _animal.background.height : _animal.special.height;
					var scale = MONKEY.Math.getScale(_animal);
					proto.special = {width:width*scale.x,height:height*scale.y};
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
			var sPosition = {x:0,y:0};
				sPosition.x = MONKEY.Math.getPositionX(_btnElm);
				sPosition.y = MONKEY.Math.getPositionY(_btnElm);
			var rotate = MONKEY.Math.getRotate(_btnElm),
				rotatePoint = {x:_btnElm.rotatePoint.x + position.x - _btnElm.position.x,
							   y:_btnElm.rotatePoint.y + position.y - _btnElm.position.y};

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
					proto.special = {width:width*scale.x,height:height*scale.y};
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
			var sPosition = {x:0,y:0};
				sPosition.x = MONKEY.Math.getPositionX(_animation);
				sPosition.y = MONKEY.Math.getPositionY(_animation);
			var rotate = MONKEY.Math.getRotate(_animation),
				rotatePoint = {x:_animation.rotatePoint.x + position.x - _animation.position.x,
								y:_animation.rotatePoint.y + position.y - _animation.position.y};

			var showFrame = _animation.frameArray[_animation.currentFrame];

			var width = _animation.special.width == null ? showFrame.width : _animation.special.width,
				height = _animation.special.height == null ? showFrame.height : _animation.special.height;

			var scale = MONKEY.Math.getScale(_animation);
			var	special = { width:width * scale.x,
							height:height * scale.y};

			var proto = {
				position:position,
				sPosition:sPosition,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_animation.alpha,
				special:special
			}

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

			var sPosition = {x:0,y:0};
				sPosition.x = MONKEY.Math.getPositionX(_anyAnimation);
				sPosition.y = MONKEY.Math.getPositionY(_anyAnimation);

			var rotate = MONKEY.Math.getRotate(_anyAnimation),
				rotatePoint = { x:_anyAnimation.rotatePoint.x + position.x - _anyAnimation.position.x,
								y:_anyAnimation.rotatePoint.y + position.y - _anyAnimation.position.y};

			var showFrame = _anyAnimation.frameArray[_anyAnimation.currentFrameIndex][_anyAnimation.currentFrame];

			var width = _anyAnimation.special.width == null ? showFrame.width : _anyAnimation.special.width,
				height = _anyAnimation.special.height == null ? showFrame.height : _anyAnimation.special.height;

			var scale = MONKEY.Math.getScale(_anyAnimation);

			var	special = { width:width * scale.x,
							height:height * scale.y};

			var proto = {
				position:position,
				sPosition:sPosition,
				rotate:rotate,
				rotatePoint:rotatePoint,
				alpha:_anyAnimation.alpha,
				special:special
			}

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
			rotate   = parameters.rotate !== undefined ? parameters.rotate : 0,
			rotatePoint = parameters.rotatePoint !== undefined ? parameters.rotatePoint : position;
		this.backBufferCtx.globalAlpha = alpha;
		if(rotate != 0){
			this.backBufferCtx.translate(rotatePoint.x,rotatePoint.y);
			this.backBufferCtx.rotate(rotate*Math.PI/180);
			this.backBufferCtx.translate(-rotatePoint.x,-rotatePoint.y);
		}
		this.backBufferCtx.drawImage(_img,0,0,_img.width,_img.height,position.x,position.y,special.width,special.height);
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