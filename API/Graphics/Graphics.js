/**
 * Graphics 绘制矢量形状的基本类 
 * Graphics类为制图组类的基本类，所包含的属性及方法将被所有制图组类所继承
 * @extends {MONKEY.Animal}
 * 
 * @snow.he
 * @janue.wang
 */
MONKEY.Graphics = function(_parameters){

	var parameters = _parameters || {};

	MONKEY.Animal.call(this,parameters);

	this.type = "Graphics";
	//绘图顶点
	this.graphVertexs = parameters.graphVertexs !== undefined ? parameters.graphVertexs : [];
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
	//是否允许反转
	this.reverseStatus = true;
	//是否运行自绘画函数
	this.isDrawFunc = true;
	//是否render绘画背景
	this.renderDraw = false;
}
MONKEY.Graphics.prototype = Object.assign(Object.create(MONKEY.Animal.prototype),MONKEY.EventListener.prototype,{
	constructor:MONKEY.Graphics,
	/*
	* <p>设置绘图顶点graphVertexs
	* @method setGraphVertexs
	* @param {Array} 顶点组 [[x1,y1],[x2,y2],[x3,y3],[x4,y4]....];
	 */
	setGraphVertexs:function(graphVertexs){
		if(Array.isArray(graphVertexs)){
			this.graphVertexs = graphVertexs;
		}
	},
	/*
	* <p>获取当前绘图顶点graphVertexs
	* @method getGraphVertexs
	 */
	getGraphVertexs:function(){
		return this.graphVertexs;
	},
	/*
	* <p>设置绘图是否封闭路径
	* @method setCloseStatus
	* @param {boolean} true || false
	*                   true --> 连线完毕之后，绘图路径将回到起始点
	 */
	setCloseStatus:function(_boo){
		if(_boo){
			this.closeStatus = true;
		}else{
			this.closeStatus = false;
		}
	},
	/*
	* <p> 获取当前绘图封闭状态
	* @method getCloseStatus
	 */
	getCloseStatus:function(){
		return this.closeStatus;
	},
	/*
	* <p>设置绘图填充样式
	* @method setFillStyle
	* @param {fillStyle} 填充样式 "#009" 
	* @notes 只有当填充状态为true时才能有填充效果
	 */
	setFillStyle:function(_style){
		this.fillStyle = _style !== undefined ? _style : "#000";
	},
	/*
	* <p>获取当前绘图填充样式
	* @method getFillStyle
	 */
	getFillStyle:function(){
		return this.fillStyle;
	},
	/*
	* <p>设置绘图样式
	* @method setStrokeStyle
	* @param {strokeStyle} 绘图样式 "#009" 
	* @notes 只有当绘制状态为true时才能有填充效果
	 */
	setStrokeStyle:function(_style){
		this.strokeStyle = _style !== undefined ? _style : "#000";
	},
	/*
	* <p>获取当前绘图样式
	* @method getFillStyle
	 */
	getStrokeStyle:function(){
		return this.strokeStyle;
	},
	/*
	* <p>获取缩放中心
	* @method getScalePoints
	* @param {Array} 顶点组 [[x1,y1],[x2,y2],[x3,y3],[x4,y4]....];
	* @notes 默认缩放中心即为坐标中心
	 */
	getScalePoints:function(points){
		return this.getCenterPoint(points);
	},
	/*
	* <p>获取坐标中心
	* @method getCenterPoint
	* @param {Array} 顶点组 [[x1,y1],[x2,y2],[x3,y3],[x4,y4]....];
	 */
	getCenterPoint:function(points){
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
	/*
	* <p>水平反转
	* @method reverseX
	* @param {number} 水平反转中心x坐标 100
	*                  若不设置反转x坐标，则默认中心反转
	* 
	 */
	reverseX:function(centerX){
		var centerPointX = centerX !== undefined ? centerX : this.getCenterPoint(this.graphVertexs)[0];
		centerPointX = centerPointX * 2;
		for(var i = 0; i < this.graphVertexs.length; i ++){
			this.graphVertexs[i][0] = centerPointX - this.graphVertexs[i][0];
		}
	},
	/*
	* <p>垂直反转
	* @method reverseY
	* @param {number} 垂直反转中心y坐标 100
	*                  若不设置反转y坐标，则默认中心反转
	* 
	 */
	reverseY:function(centerY){
		var centerPointY = centerY !== undefined ? centerY : this.getCenterPoint(this.graphVertexs)[1];
		centerPointY = centerPointY * 2;
		for(var i = 0; i < this.graphVertexs.length; i ++){
			this.graphVertexs[i][1] = centerPointY - this.graphVertexs[i][1];
		}
	},
	/*
	* <p>反转
	* @method reverse
	* @param {number} 水平反转中心x坐标 100
	*                  若不设置反转x坐标，则默认中心水平反转
	* @param {number} 垂直反转中心y坐标 100
	*                  若不设置反转y坐标，则默认中心垂直反转
	* 
	 */
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
	/*
	* <p>某点是否在绘制图形内
	* @method isInMe
	* @param {number} 点的x坐标
	* @param {number} 点的y坐标
	* 
	 */
	isInMe:function(x,y){
		var point = new MONKEY.position(x,y);
		return MONKEY.Common.PointInPoly(point,this.graphVertexs);
	},
	/*
	* <p>制图类自带绘制方法
	* 	将会由渲染器调用此方法，用以自我渲染
	* @method draw
	* @param {canvas} 渲染目标canvas
	* @param {ctx} 渲染目标canvas的2D对象
	* @param {renderer} 渲染器对象
	* 
	 */
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
					closeStatus:this.closeStatus
				};
				renderer.drawLines(proto);
			}
			if(this.children.length > 0){
				for(var i = 0; i < this.children.length; i ++){
					this.renderDraw(this.children[i]);
				}
			}
		}

	}
})