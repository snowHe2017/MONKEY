/*
*<p> 外部拓展keyboard
*
 */

MONKEY.KeyBoard = function(_img){
	this.type = "KeyBoard";
	this.img = _img !== undefined ? _img : function(){console.error("no have image");}();
	var parameters = {};
	MONKEY.Animal.call(this,parameters);
	this.position = new MONKEY.Position(0,0);
}
/*
var win_snowKeyCodeArg;
function (_parent){
	var parentArg = _parent ||  document.body;
	var self = this;
	win_snowKeyCodeArg = this;
	this.parentArg = parentArg;
	this.parentData = {
		x:this.parentArg.offsetLeft,
		y:this.parentArg.offsetTop,
		w:this.parentArg.offsetWidth,
		h:this.parentArg.offsetHeight	
	}
	var cssSrc = "KeyBoard/keyboard.css";
	 var cssObj = document.createElement("link"); 
        cssObj.setAttribute("rel", "stylesheet"); 
        cssObj.setAttribute("type", "text/css");  
        cssObj.setAttribute("href", cssSrc);
	 document.getElementsByTagName("head")[0].appendChild(cssObj);	 
	 this.staticCallBack = function(){}
	 //当前操作对象
	 this.targetArg = null;
	 //操作对象的标签类型
	 this.targetType = "INPUT";
	 //回调函数
	 this.callback = this.staticCallBack;
	 this.keyCodeArg;
	 this.closeKeyCode = function(){
		  self.keyCodeArg.style.display = "none";
		  }
	  var keyArg = document.createElement("div");
		  keyArg.style.left = x;
		  keyArg.style.top = y;
		  keyArg.className="keyBack";
		  keyArg.style.display = "none";
		  keyArg.setAttribute("mx",0);
		  keyArg.setAttribute("my",0);
		  keyArg.setAttribute("tl",this.parentData.x);
		  keyArg.setAttribute("ty",this.parentData.y);
		  keyArg.setAttribute("tr",this.parentData.x + this.parentData.w);
		  keyArg.setAttribute("tb",this.parentData.y + this.parentData.h);
	  MD_addEventHandler(keyArg,"mousedown",this.dragKeyCode,true);
	  var closeArg = document.createElement("div");
	  	  closeArg.className = "keyCloseBtn";
		  MD_addEventHandler(closeArg,"mousedown",this.closeKeyCode,true);		  
	  keyArg.appendChild(closeArg);	  
	  var keyarr = ["1","2","3","clear","4","5","6",".","7","8","9","0"];
	  var keyclass = ["1","2","3","clear","4","5","6","point","7","8","9","0"];	  
	  for(var i = 0 ; i < keyarr.length ; i ++){
		  var arg = document.createElement("div");
		  var x = parseInt(i%4)*68+10,
			  y = parseInt(i/4)*70+45;
		  var classNameStr = "keyBtn";
		  arg.style.position = "absolute";
		  arg.style.left = x + "px";
		  arg.style.top = y + "px";
		  arg.className = classNameStr;
		  arg.setAttribute("mean",keyarr[i]);  
		  MD_addEventHandler(arg,"mousedown",this.keyCodeDown,true); 
		  var childArg = document.createElement("div"); 
		  childArg.className = "keyNum_"+keyclass[i]; 
		  arg.appendChild(childArg);
		  keyArg.appendChild(arg);	
	  }
	  parentArg.appendChild(keyArg); 
	  this.keyCodeArg = keyArg;	  
	  
}

keyCode.prototype={
		initKey:function(_arg,_x,_y,_callback){
			var arg = _arg;
			var x = _x,y = _y;
			this.targetArg = arg;
			this.targetType = arg.tagName;
			this.keyCodeArg.style.display = "block";
			this.keyCodeArg.style.left = x + "px";
			this.keyCodeArg.style.top = y + "px";
			this.callback  = _callback;
		},
		keyCodeDown:function(e){
			if(this.setCapture) this.setCapture();
			var self = win_snowKeyCodeArg;
			var valueStr = 0,maxLen = 1;
			if(self.targetType == "DIV"){
				valueStr = self.targetArg.innerHTML;
				maxLen = self.targetArg.getAttribute("maxLength");	
			}else
				if(self.targetType == "INPUT"){
					valueStr = self.targetArg.value;
					maxLen = self.targetArg.getAttribute("maxLength");	
				}
			var inputStr = this.getAttribute("mean");
			if(valueStr.length >= parseInt(maxLen) && inputStr != "clear"){
				return;	
			}
			if(inputStr == "clear"){	
				if(valueStr.length > 0){
					valueStr = valueStr.slice(0,valueStr.length-1);
				}
			}else
				if(inputStr == "."){
					 if(getStrInfor(valueStr,".") == 0 ){
						if(valueStr.length < 1){
							valueStr = "0."
						}else{
							valueStr = valueStr + ".";	
						}
					 }	
				}else{
					if(valueStr.slice(0,1) == "0"){
						valueStr = valueStr.slice(1);	
					}
					valueStr = valueStr + inputStr;
				}
			
			self.callback(valueStr,self.targetArg);
			function getStrInfor(str,_str){
				var num = 0;
				for(var i = 0; i < str.length; i ++){
					if(str.slice(i) == "."){
						num ++;	
					}	
				}	
				return num;
			}
			},
		dragKeyCode:function(e){
			var nl = parseInt(this.offsetLeft),
				nt = parseInt(this.offsetTop);
			var pX,pY;
			 if(window.touchable){
			 	 pX =  e.touches[0].pageX - nl;
			 	 pY =  e.touches[0].pageY - nt;
		 	 }else{
			 	 pX = e.pageX - nl;
			 	 pY = e.pageY - nt;
		  	}
			this.setAttribute("mx",pX);
			this.setAttribute("my",pY);
			MD_addEventHandler(win_snowKeyCodeArg.parentArg,"mousemove",win_snowKeyCodeArg.dragMove,false);
			MD_addEventHandler(document.body,"mouseup",win_snowKeyCodeArg.dragEnd,false);
		},
		dragMove:function(e){
			var self = win_snowKeyCodeArg.keyCodeArg;
			var pX,pY;
			 if(window.touchable){
			 	 pX =  e.touches[0].pageX;
			 	 pY =  e.touches[0].pageY;
		 	 }else{
			 	 pX = e.pageX;
			 	 pY = e.pageY;
		  	}
			var x = pX - parseInt(self.getAttribute("mx")),
				y = pY - parseInt(self.getAttribute("my"));
			
			self.style.left = x + "px";
			self.style.top = y + "px";
		},
		dragEnd:function(e){
			MD_removeEventHandler(win_snowKeyCodeArg.parentArg,"mousemove",win_snowKeyCodeArg.dragMove,false);
			MD_removeEventHandler(document.body,"mouseup",win_snowKeyCodeArg.dragEnd,false);
		},
		close:function(){
			this.keyCodeArg.style.display ="none";
			}
			
		
	}*/