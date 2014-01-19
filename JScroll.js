(function (window) {
var JScroll =  function () { 
	this.init.apply(this, arguments); 
}

JScroll.prototype = {

	//容器
	scrollWraper: false,
	
	//内容区域
	scrollBody: false,
	
	//是否显示箭头
	isShowArrow: false,
	
	//是否定制x或Y的滚动条尺寸，不再按照内容区域的大小来自动调整
	YBarHeight: 0,
	XBarWidth: 0,
	
	//工作模式
	//支持三个，auto、X、Y
	mode: "auto",

	init: function(options) {
	
	
		extend(this, options);
		
		this.scrollWarper = document.getElementById(this.scrollWraper);
		
		this.scrollBody = document.createElement("div");
		var content = this.scrollWarper.innerHTML;
		this.scrollBody.innerHTML = content;
		this.scrollWarper.innerHTML = "";
		this.scrollWarper.appendChild(this.scrollBody);
		//this.scrollBody = document.getElementById(this.scrollBody);

		//this.isShowArrow = isShowArrow;

		if (!this.scrollWarper || !this.scrollBody) {
			alert("参数错误");
			return false;
		}
		
		if(this.scrollBody.parentNode != this.scrollWarper) {
			alert("参数错误");
			return false;
		}

		this.isX = false;
		this.isY = false;

		if (this.mode == "auto") {
			this.isX = this.scrollBody.offsetWidth > this.scrollWarper.clientWidth ? true : false;
			this.isY = this.scrollBody.offsetHeight > this.scrollWarper.clientHeight ? true : false;
		} else if (this.mode == "X") {
			this.isX = true;
		} else if (this.mode == "Y") {
			this.isY = true;
		}

		this.scrollWarper.className += " scroll-waper";
		this.scrollBody.className += " scroll-body";
		this.scrollWarper.style.overflow = "hidden";
		this.scrollBody.style.overflow = "visible";
		
		this.oldBodyHeight = this.scrollBody.offsetHeight;
		this.oldWaperHeight = this.scrollWarper.clientHeight;
		this.oldBodyWidth = this.scrollBody.offsetWidth;
		this.oldWaperWidth = this.scrollWarper.clientWidth;

		this.DHeight = this.isX && this.isY ? 20 : 0; //横向 和 纵向 滚动条都存在时，右下角的空缺尺寸
		this.DWidth = this.isX && this.isY ? 20 : 0;

		this.YArrowHeight = 0; //y方向箭头高度
		this.XArrowWidth = 0; //

		this.arrowSize = 16; // 滚动条的宽（Y） 高（X）
		/*初始化滚动目标的参数*/
		this.scrollBody.style.position = 'absolute';
		this.scrollBody.style.left = 0;
		this.scrollBody.style.top = 0;

		this.appendScrollArea();
		if(this.isShowArrow)
			this.appendArrow();
		this.appendScroll();
		//定义滚动条的尺寸
		this.resize();

		this.maxTop = this.YArrowHeight;
		this.maxBottom = 9999;
		this.iTop = 0;

		this.maxLeft = this.XArrowWidth;
		this.maxRight = 9999;
		this.iLeft = 0;

		this.speed = 10; //单步速度
		this.WheelSpeed = 5; //鼠标滚轮速度
		this.addEventFunc();
		
		var _self = this;
		this.checkSizeInterval = setInterval(function(){_self.checkSize.call(_self)}, 500); //每一秒执行一次

	},

	appendScrollArea: function() {
		if (this.isY) {
			this.scroll_area_Y = document.createElement('div');
			this.scroll_area_Y.style.height = this.scrollWarper.clientHeight - this.DHeight + 'px';
			this.scroll_area_Y.setAttribute('class', 'scroll-area-Y');
			this.scroll_area_Y.setAttribute('className', 'scroll-area-Y');
			this.scrollWarper.appendChild(this.scroll_area_Y);
		}

		if (this.isX) {
			this.scroll_area_X = document.createElement('div');
			this.scroll_area_X.style.width = this.scrollWarper.clientWidth - this.DWidth + 'px';
			this.scroll_area_X.setAttribute('class', 'scroll-area-X');
			this.scroll_area_X.setAttribute('className', 'scroll-area-X');
			this.scrollWarper.appendChild(this.scroll_area_X);
		}
	},

	appendScroll: function() {
		//创建Y方向滚动条
		if (this.isY) {
			if(this.isShowArrow) {
				this.YArrowHeight = this.Tarrow.offsetHeight;
			}
			this.img_scroll_Y = document.createElement('div');
			this.img_scroll_Y.style.top = this.YArrowHeight + 'px';

			this.img_scroll_Y.setAttribute('class', 'scroll-Y');
			this.img_scroll_Y.setAttribute('className', 'scroll-Y');

			this.scroll_area_Y.appendChild(this.img_scroll_Y);

			this.img_scroll_Y.innerHTML = "<span class=\"panel_border1\"></span><span class=\"panel_border2\"></span>";
		}

		if (this.isX) {
			//创建x方向滚动条
			if(this.isShowArrow) {
				this.XArrowWidth = this.Larrow.offsetWidth;
			}
			this.img_scroll_X = document.createElement('div');
			this.img_scroll_X.style.left = this.XArrowWidth + 'px';

			this.img_scroll_X.setAttribute('class', 'scroll-X');
			this.img_scroll_X.setAttribute('className', 'scroll-X');

			this.scroll_area_X.appendChild(this.img_scroll_X);
		}
	},

	appendArrow: function() {
		if (this.isY) {
			this.Tarrow = document.createElement('div');
			this.Tarrow.setAttribute('class', 'Tarrow');
			this.Tarrow.setAttribute('className', 'Tarrow');
			this.scroll_area_Y.appendChild(this.Tarrow);

			this.Barrow = document.createElement('div');
			this.Barrow.setAttribute('class', 'Barrow');
			this.Barrow.setAttribute('className', 'Barrow');
			this.scroll_area_Y.appendChild(this.Barrow);
		}

		if (this.isX) {
			this.Larrow = document.createElement('div');
			this.Larrow.setAttribute('class', 'Larrow');
			this.Larrow.setAttribute('className', 'Larrow');
			this.scroll_area_X.appendChild(this.Larrow);

			this.Rarrow = document.createElement('div');
			this.Rarrow.setAttribute('class', 'Rarrow');
			this.Rarrow.setAttribute('className', 'Rarrow');
			this.scroll_area_X.appendChild(this.Rarrow);
		}
	},

	/*
	 *绑定事件
	 */
	addEventFunc: function() {
		var _self = this;
		this._x = this._y = 0;

		this._stop = function() {
			return _self.Stop.call(_self);
		}

		this._move = function(event) {
			return _self.Move.call(_self, (event || window.event));
		}

		this.arrowInterval = false;

		if (this.isY) {
			addEvent(this.img_scroll_Y, "mousedown", function(event) {
				_self.disableX = true;
				_self.disableY = false;
				_self.Start.call(_self, (event || window.event));
			}); 
			if(this.isShowArrow){
				/*向上 箭头*/
				this.arrowUp = function() {
					return _self.arrowMove.call(_self, 'up');
				}
				
				addEvent(this.Tarrow, 'mousedown', function() {
					_self.arrowInterval = setInterval(_self.arrowUp, 70)
				});
				addEvent(this.Tarrow, 'mouseup', function() {
					clearInterval(_self.arrowInterval)
				});

				/*向下 箭头*/
				this.arrowDown = function() {
					return _self.arrowMove.call(_self, 'down');
				}
				
				addEvent(this.Barrow, 'mousedown', function() {
					_self.arrowInterval = setInterval(_self.arrowDown, 70)
				});
				addEvent(this.Barrow, 'mouseup', function() {
					clearInterval(_self.arrowInterval)
				});
			}

			addEvent(this.scroll_area_Y, 'click', function(event) {
				_self.sClick.call(_self, (event || window.event))
			});
			
			var isFirefox = navigator.userAgent.indexOf('Firefox') >= 0 ? true : false;
			
			addEvent(this.scrollWarper, isFirefox ? 'DOMMouseScroll' : 'mousewheel', function(event) {
				_self.WheelCtrl.call(_self, (event || window.event))
			});

			//alert(navigator.appVersion.indexOf("MSIE"));
		}

		if (this.isX) {
			addEvent(this.img_scroll_X, "mousedown", function(event) {
				_self.disableX = false;
				_self.disableY = true;
				_self.Start.call(_self, (event || window.event));
			}); 

			if(this.isShowArrow){
				/*向左 箭头*/
				this.arrowLeft = function() {
					return _self.arrowMove.call(_self, 'left');
				}
				addEvent(this.Larrow, 'mousedown', function() {
					_self.arrowInterval = setInterval(_self.arrowLeft, 70)
				});
				addEvent(this.Larrow, 'mouseup', function() {
					clearInterval(_self.arrowInterval)
				});

				/*向右 箭头*/
				this.arrowRight = function() {
					return _self.arrowMove.call(_self, 'right');
				}
				addEvent(this.Rarrow, 'mousedown', function() {
					_self.arrowInterval = setInterval(_self.arrowRight, 70)
				});
				addEvent(this.Rarrow, 'mouseup', function() {
					clearInterval(_self.arrowInterval)
				});
			}

			addEvent(this.scroll_area_X, 'click', function(event) {
				_self.sClick.call(_self, (event || window.event))
			});
		}
	},

	/*
	 *鼠标滚轮的事件
	 */
	WheelCtrl: function(oEvent) {
		if(this.scrollBody.offsetHeight <= this.scrollWarper.clientHeight){
			this.scrollBody.style.top = 0;
			return;
		}

		var wheelDistance = (oEvent.detail) ? oEvent.detail : oEvent.wheelDelta / (-40);
		var i = this.WheelSpeed * wheelDistance;

		var iTop = this.scrollAreaY.call(this, parseInt(this.img_scroll_Y.style.top) + i);
		this.img_scroll_Y.style.top = iTop + 'px';
		var scrollDistance = -Math.ceil((this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * ((iTop - this.YArrowHeight) / (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.YArrowHeight * 2 - this.DHeight)));
		this.scrollBody.style.top = Math.min(scrollDistance, 0) + 'px';

		//防止触发其他滚动条
		if (oEvent.preventDefault) {
			// Firefox
			oEvent.preventDefault(); //系统默认事件也一同取消
			oEvent.stopPropagation();
		} else {
			// IE
			oEvent.cancelBubble = true;
			oEvent.returnValue = false; //系统默认事件也一同取消
		}
	},

	/*鼠标点击滚动条的动作*/
	sClick: function(oEvent) {
		oTarget = oEvent.srcElement || oEvent.target;
		if (oTarget != this.scroll_area_Y && oTarget != this.scroll_area_X) return false;

		var o = this.scrollWarper;
		oTop = o.offsetTop;
		oLeft = o.offsetLeft;

		while (o.offsetParent) {
			o = o.offsetParent;
			oTop += o.offsetTop;
			oLeft += o.offsetLeft;
		}

		if (this.isY) {
			//var iTop =  oEvent.clientY + document.documentElement.scrollTop - oTop - this.img_scroll_Y.clientHeight /2;
			if (oEvent.clientY + document.documentElement.scrollTop - this.img_scroll_Y.offsetTop > this.img_scroll_Y.clientHeight) {
				var iTop = oEvent.clientY + document.documentElement.scrollTop - oTop - this.img_scroll_Y.clientHeight;
			} else {
				var iTop = oEvent.clientY + document.documentElement.scrollTop - oTop;
			}

			iTop = this.scrollAreaY.call(this, iTop);
		}

		if (this.isX) {
			if (oEvent.clientX + document.documentElement.scrollLeft - this.img_scroll_X.offsetLeft > this.img_scroll_X.clientHeight) {
				var iLeft = oEvent.clientX + document.documentElement.scrollLeft - oLeft - this.img_scroll_X.clientWidth;
			} else {
				var iLeft = oEvent.clientX + document.documentElement.scrollLeft - oLeft;
			}

			iLeft = this.scrollAreaX.call(this, iLeft);
		}


		if (oTarget == this.scroll_area_Y) {
			this.img_scroll_Y.style.top = iTop + 'px';
			this.scrollBody.style.top = -Math.ceil((this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * ((iTop - this.YArrowHeight) / (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.YArrowHeight * 2 - this.DHeight))) + 'px';
		} else if (oTarget == this.scroll_area_X) {
			this.img_scroll_X.style.left = iLeft + 'px';
			this.scrollBody.style.left = -Math.ceil((this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) * ((iLeft - this.XArrowWidth) / (this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.XArrowWidth * 2 - this.DWidth))) + 'px';
		}

	},

	arrowMove: function(direct) {
		if (direct == 'up' && parseInt(this.img_scroll_Y.style.top) > this.Tarrow.offsetHeight) {
			if (Math.abs(parseInt(this.scrollBody.style.top)) < this.speed) this.scrollBody.style.top = 0;
			else this.scrollBody.style.top = parseInt(this.scrollBody.style.top) + this.speed + 'px';

			this.img_scroll_Y.style.top = this.scrollAreaY.call(this, parseInt(this.img_scroll_Y.style.top) - Math.floor(this.speed / (this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.Tarrow.offsetHeight * 2 - this.DHeight))) + 'px';
		} else if (direct == 'down' && (parseInt(this.img_scroll_Y.style.top) < this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.Barrow.offsetHeight)) {

			if (this.scrollBody.offsetHeight - Math.abs(parseInt(this.scrollBody.style.top)) - this.scrollWarper.clientHeight + this.DHeight < this.speed) this.scrollBody.style.top = -(this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) + 'px';
			else this.scrollBody.style.top = parseInt(this.scrollBody.style.top) - this.speed + 'px';

			this.img_scroll_Y.style.top = this.scrollAreaY.call(this, parseInt(this.img_scroll_Y.style.top) + Math.floor(this.speed / (this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.Tarrow.offsetHeight * 2 - this.DHeight))) + 'px';
		} else if (direct == 'left' && parseInt(this.img_scroll_X.style.left) > this.Larrow.offsetWidth) {
			if (Math.abs(parseInt(this.scrollBody.style.left)) < this.speed) this.scrollBody.style.left = 0;
			else this.scrollBody.style.left = parseInt(this.scrollBody.style.left) + this.speed + 'px';

			this.img_scroll_X.style.left = this.scrollAreaX.call(this, parseInt(this.img_scroll_X.style.left) - Math.floor(this.speed / (this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) * (this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.Larrow.offsetWidth * 2 - this.DWidth))) + 'px';
		} else if (direct == 'right' && (parseInt(this.img_scroll_X.style.left) < this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.Rarrow.offsetWidth)) {

			if (this.scrollBody.offsetWidth - Math.abs(parseInt(this.scrollBody.style.left)) - this.scrollWarper.clientWidth + this.DWidth < this.speed) this.scrollBody.style.left = -(this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) + 'px';
			else this.scrollBody.style.left = parseInt(this.scrollBody.style.left) - this.speed + 'px';

			this.img_scroll_X.style.left = this.scrollAreaX.call(this, parseInt(this.img_scroll_X.style.left) + Math.floor(this.speed / (this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) * (this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.Larrow.offsetWidth * 2 - this.DWidth))) + 'px';
		}

	},

	scrollAreaY: function(iTop) {
		maxTop = this.maxTop;
		maxBottom = this.maxBottom;

		maxTop = Math.max(maxTop, 0);
		if (this.isX) maxBottom = Math.min(maxBottom, this.scrollWarper.clientHeight - this.YArrowHeight - this.DHeight);
		else maxBottom = Math.min(maxBottom, this.scrollWarper.clientHeight - this.YArrowHeight);

		iTop = Math.max(Math.min(iTop, maxBottom - this.img_scroll_Y.offsetHeight), maxTop);
		return iTop;
	},

	scrollAreaX: function(iLeft) {
		maxLeft = this.maxLeft;
		maxRight = this.maxRight

		maxLeft = Math.max(maxLeft, 0);
		if (this.isY) maxRight = Math.min(maxRight, this.scrollWarper.clientWidth - this.XArrowWidth - this.DWidth);
		else maxRight = Math.min(maxRight, this.scrollWarper.clientWidth - this.XArrowWidth);

		iLeft = Math.max(Math.min(iLeft, maxRight - this.img_scroll_X.offsetWidth), maxLeft);
		return iLeft;
	},

	Start: function(oEvent) {
		this._y = this.isY ? (oEvent.clientY - this.img_scroll_Y.offsetTop) : 0;
		this._x = this.isX ? (oEvent.clientX - this.img_scroll_X.offsetLeft) : 0;
		addEvent(document, "mousemove", this._move);
		addEvent(document, "mouseup", this._stop);

		if (document.all) {
			if (this.isY) addEvent(this.img_scroll_Y, "losecapture", this._stop);
			if (this.isX) addEvent(this.img_scroll_X, "losecapture", this._stop);
			if (this.disableX && this.isX) this.img_scroll_X.setCapture();
			if (this.disableY && this.isY) this.img_scroll_Y.setCapture();

		} else {
			addEvent(window, "blur", this._stop);
			oEvent.preventDefault();
		}

	},

	Move: function(oEvent) {
		if (!this.disableY) {
			var iTop = oEvent.clientY - this._y;
			iTop = this.scrollAreaY.call(this, iTop);
			this.img_scroll_Y.style.top = iTop + 'px';
			if(this.scrollBody.offsetHeight <= this.scrollWarper.clientHeight){
				this.scrollBody.style.top = 0;
			}else{
				this.scrollBody.style.top = -Math.ceil((this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * ((iTop - this.YArrowHeight) / (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.YArrowHeight * 2 - this.DHeight))) + 'px';
			}
		}
		if (!this.disableX) {
			var iLeft = oEvent.clientX - this._x;
			iLeft = this.scrollAreaX.call(this, iLeft);
			this.img_scroll_X.style.left = iLeft + 'px';

			if(this.scrollBody.offsetWidth <= this.scrollWarper.clientWidth){
				this.scrollBody.style.left = 0;
			}else{
				this.scrollBody.style.left = -Math.ceil((this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) * ((iLeft - this.XArrowWidth) / (this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.XArrowWidth * 2 - this.DWidth))) + 'px';
			}
		}
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); //清除拖动时对文本的选择
	},

	Stop: function() {
		removeEvent(document, "mousemove", this._move);
		removeEvent(document, "mouseup", this._stop);
		if (document.all) {
			if (this.isY) {
				removeEvent(this.img_scroll_Y, "losecapture", this._stop);
				this.img_scroll_Y.releaseCapture();
			}
			if (this.isX) {
				removeEvent(this.img_scroll_X, "losecapture", this._stop);
				this.img_scroll_X.releaseCapture();
			}
		} else {
			removeEvent(window, "blur", this._stop);
		};
	},
	checkSize : function (){
		if(this.isX){
			if(this.oldBodyWidth != this.scrollBody.offsetWidth || this.oldWaperWidth != this.scrollWarper.clientWidth){
				this.oldBodyWidth = this.scrollBody.offsetWidth;
				this.oldWaperWidth = this.scrollWarper.clientWidth;
				this.resize();
			}
		}

		if(this.isY){
			if(this.oldBodyHeight != this.scrollBody.offsetHeight || this.oldWaperHeight != this.scrollWarper.clientHeight){
				this.oldBodyHeight = this.scrollBody.offsetHeight;
				this.oldWaperHeight = this.scrollWarper.clientHeight
				this.resize();
			}
		}
	},
	
	resize : function(){
		
		if(this.isX){
			//判断是否由于滚动区域宽度的变化，造成滚动区域left值过大
			if(parseInt(this.scrollBody.style.left) < this.scrollWarper.clientWidth - this.scrollBody.offsetWidth ){
				this.scrollBody.style.left = this.scrollWarper.clientWidth - this.scrollBody.offsetWidth + "px";
			}
			
			this.scroll_area_X.style.width = this.scrollWarper.clientWidth - this.DWidth + 'px';
			
			//this.scroll_area_X.style.width = Math.min(this.scrollWarper.clientWidth - this.DWidth, 0) + 'px';
			
			
			var img_scroll_width;
			
			if(this.XBarWidth){
				img_scroll_width = this.XBarWidth;
			} else {
				if (this.scrollWarper.clientWidth >= this.scrollBody.offsetWidth) {
					img_scroll_width = parseInt(this.scroll_area_X.style.width) - this.XArrowWidth * 2
				} else {
					img_scroll_width = this.scrollWarper.clientWidth / this.scrollBody.offsetWidth * (parseInt(this.scroll_area_X.style.width) - this.XArrowWidth * 2);
				}
			}
			
			if (img_scroll_width <= 10) {
				this.img_scroll_X.style.width = 10 + 'px';
			} else {
				this.img_scroll_X.style.width = img_scroll_width + 'px';
			}
			
			//X滑块位置
			if(this.scrollBody.offsetWidth <= this.scrollWarper.clientWidth){
				this.img_scroll_X.style.left = 0;
			}else{
				this.img_scroll_X.style.left = -Math.ceil(parseFloat(this.scrollBody.style.left)/(this.scrollBody.offsetWidth - this.scrollWarper.clientWidth + this.DWidth) * (this.scrollWarper.clientWidth - this.img_scroll_X.offsetWidth - this.XArrowWidth * 2 - this.DWidth)) + this.XArrowWidth + "px";
			}
		}

		if(this.isY){
			//判断是否由于滚动区域高度的变化，造成滚动区域top值过大
			if(parseInt(this.scrollBody.style.top) < this.scrollWarper.clientHeight - this.scrollBody.offsetHeight ){
				this.scrollBody.style.top = Math.min(this.scrollWarper.clientHeight - this.scrollBody.offsetHeight, 0) + "px";
			}
			

			this.scroll_area_Y.style.height = this.scrollWarper.clientHeight - this.DHeight + 'px';

			var img_scroll_height;
			
			//定高，否则按比例自动缩放
			if(this.YBarHeight){
				img_scroll_height = this.YBarHeight;
			} else {
			
				if (this.scrollWarper.clientHeight >= this.scrollBody.offsetHeight) {
					img_scroll_height = parseInt(this.scroll_area_Y.style.height) - this.YArrowHeight * 2;
				} else {
					img_scroll_height = this.scrollWarper.clientHeight / this.scrollBody.offsetHeight * parseInt(this.scroll_area_Y.style.height) - this.YArrowHeight * 2;
				}
			}

			if (img_scroll_height <= 15) {
				this.img_scroll_Y.style.height = 15 + 'px';
			} else {
				this.img_scroll_Y.style.height = img_scroll_height + 'px';
			}
			
			//y向滑块位置
			if(this.scrollBody.offsetHeight <= this.scrollWarper.clientHeight){
				this.img_scroll_Y.style.top = 0;
			} else {
				this.img_scroll_Y.style.top = -Math.ceil(parseFloat(this.scrollBody.style.top) / (this.scrollBody.offsetHeight - this.scrollWarper.clientHeight + this.DHeight) * (this.scrollWarper.clientHeight - this.img_scroll_Y.offsetHeight - this.YArrowHeight * 2 - this.DHeight)) + this.YArrowHeight + "px";
			}
		}
	},

	scrollYHTML :function(str){
		this.img_scroll_Y.innerHTML = str;
	},

	scrollXHTML :function(str){
		this.img_scroll_X.innerHTML = str;
	},
	
	destory:function(){
		clearInterval(this.checkSizeInterval);
	}
}
var addEvent = function (obj, evType, fn, useCapture)
{
    if (!useCapture) useCapture = false;

    if (obj.addEventListener)
    {
        obj.addEventListener(evType, fn, useCapture);
    }
    else
    {
        obj.attachEvent('on' + evType, fn);
    }
}

var removeEvent = function (obj, evType, fn, useCapture)
{
    if (!useCapture) useCapture = false;

    if (obj.removeEventListener)
    {
        obj.removeEventListener(evType, fn, useCapture);
    }
    else
    {
        obj.detachEvent('on' + evType, fn);
	}
}

var extend = function (destination, source) {
	for ( var property in source) {
		destination[property] = source[property];
	}
	return destination;
}

window.JScroll = JScroll;

})(window, undefined);
