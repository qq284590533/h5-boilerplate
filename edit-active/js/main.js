//禁止网页文本选中事件
document.body.onselectstart = document.body.ondrag = function () {
	return false;
}

function ele(id) {
	return document.getElementById(id);
}

function createEle(eleType) {
	return document.createElement(eleType);
}

function setAttr(element, attrname, value) {
	element.setAttribute(attrname, value);
}

function deleteData(key, json) {
	delete json[key];
}

//添加关闭按钮
function addCloseBtn(layout, span) {
	var i = document.createElement('i');
	i.innerHTML = '×';
	i.className = 'close';
	i.addEventListener('click', function () {
		span.remove();
		// console.log(layout.layoutData)
	})
	span.appendChild(i);
}

//获取鼠标相对于eventBox的定位
function getPos(layout, e) {
	var eventBoxPos = layout.eventBox.getBoundingClientRect(),
		eX = e.clientX,
		eY = e.clientY,
		pos = {};
	pos.x = eX - eventBoxPos.left;
	pos.y = eY - eventBoxPos.top;
	if (layout.pos.start) {
		layout.pos.end = pos
	} else {
		layout.pos.start = pos
	}
}

function Layout(layoutData) {
	this.elements = {
		layout: ele('layout'),
		selectImage: ele('selectImage'),
		addImg: ele('addImg')
	};
	this.layoutData = {};
	this.steps = {};
	this.boxStyle = {
		w: null,
		h: null
	}
	this.pos = {
		start: null,
		end: null
	};
	this.eventBox = null;
	this.handleName = null;
	this.mouseHasDown = false;
	this.spanBox = null;	//当前操作的spanBox
	this.spanBoxPos = null;

	this.init()
}

Layout.prototype.init = function () {
	var _this = this;
	this.elements.addImg.addEventListener('click', function () {
		_this.elements.selectImage.click();
	})
	this.bindEvent(this.elements.selectImage, 'change', imgChange)
	this.bindEvent(document.body, 'mouseup', this.onMouseUp)
}

//绑定事件
Layout.prototype.bindEvent = function (element, eventType, handle) {
	var _this = this;
	element.addEventListener(eventType, function (e) {
		handle(_this, e);
	})
}

function imgChange(layout) {
	var file = layout.elements.selectImage.files.item(0),
		url = window.URL.createObjectURL(file),
		type = file.type,
		id = new Date().getTime(),
		div = createEle('div'),
		img = createEle('img'),
		eventbox = createEle('div'),
		closebtn = createEle('i');
	div.id = id;
	div.className = 'block';
	div.appendChild(img);
	div.appendChild(closebtn);
	div.appendChild(eventbox);

	img.src = url;
	img.onload = function () {
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0, img.width, img.height);
		var dataURL = canvas.toDataURL(type);
		img.src = dataURL;
		layout.layoutData[id] = div;
		// console.log(layout.layoutData);
		img.onload = null;
		layout.elements.selectImage.value = null;
	}

	eventbox.className = 'eventbox';
	setAttr(eventbox, 'data-handleName', 'addEventBox');
	layout.setRespondEventElement(eventbox);
	layout.bindEvent(eventbox, 'mousedown', onMouseDown);

	closebtn.innerHTML = '×';
	closebtn.className = 'close';

	closebtn.addEventListener('click', function () {
		ele(id).remove();
		deleteData(id, layout.layoutData);
	})
	layout.elements.layout.appendChild(div);
}

//设置data-hasEvent属性，有这个属性的元素才能够响应定义的事件。
Layout.prototype.setRespondEventElement = function (element) {
	setAttr(element, 'data-hasEvent', true)
}

function onMouseDown(layout, e) {
	var hasEvent = e.target.getAttribute('data-hasEvent');
	if (!hasEvent) return;
	// console.log('按下')
	layout.mouseHasDown = true;
	layout.handleName = e.target.getAttribute('data-handleName');
	if(e.target.id){
		layout.eventBox = e.target.parentNode;
	}else{
		layout.eventBox = e.target
	}
	var eventHandleBox = createEle('div');
	eventHandleBox.className = 'handle-box';
	eventHandleBox.style.width = '100%';
	eventHandleBox.style.height = '100%';
	eventHandleBox.style.left = '0';
	eventHandleBox.style.top = '0';
	eventHandleBox.style.zIndex = 9999;
	layout.eventHandleBox = eventHandleBox;
	layout.eventBox.appendChild(eventHandleBox);
	layout.bindEvent(eventHandleBox, 'mousemove', layout.onMouseMove);
	layout.bindEvent(eventHandleBox, 'mouseup', layout.onMouseUp);
	switch (layout.handleName) {
		case 'addEventBox':
			addEventBox_mousedown(layout, e);
			break;
		case 'moveEventBox':
			moveEventBox_mousedown(layout, e);
			break;
		default:
			break;
	}
}

//鼠标移动事件
Layout.prototype.onMouseMove = function (layout, e) {
	if (!layout.mouseHasDown) return;
	// console.log('移动')
	switch (layout.handleName) {
		case 'addEventBox':
			addEventBox_mousemove(layout, e);
			break;
		case 'moveEventBox':
			moveEventBox_mousemove(layout, e);
			break;
		default:
			break;
	}
}

//鼠标放开事件
Layout.prototype.onMouseUp = function (layout, e) {
	if (!layout.mouseHasDown) return;
	// console.log('放开')
	switch (layout.handleName) {
		case 'addEventBox':
			addEventBox_mouseup(layout, e);
			break;
		case 'moveEventBox':
			moveEventBox_mouseup(layout, e);
			break;
		default:
			break;
	}
}

function getEleStyle(layout, element){
	var boxStyle = element.currentStyle ? element.currentStyle : window.getComputedStyle(element, null);
	layout.boxStyle.w = parseInt(boxStyle.width);
	layout.boxStyle.h = parseInt(boxStyle.height);
}

//添加事件span时鼠标点下事件处理函数
function addEventBox_mousedown(layout, e) {
	getPos(layout, e);
	getEleStyle(layout, e.target)
	var span = document.createElement('span');
	var left = layout.pos.start.x / layout.boxStyle.w * 100 + '%'
	var top = layout.pos.start.y / layout.boxStyle.h * 100 + '%'
	span.style.left = left;
	span.style.top = top;
	var id = new Date().getTime();
	span.id = id;
	layout.setRespondEventElement(span);
	setAttr(span, 'data-handleName', 'moveEventBox');
	layout.eventBox.appendChild(span);
	layout.spanBox = span;
	addCloseBtn(layout, span);
	layout.bindEvent(layout.spanBox, 'mousemove', layout.onMouseMove);
	layout.bindEvent(layout.spanBox, 'mouseup', layout.onMouseUp);
}

//添加事件span时鼠标移动事件处理函数
function addEventBox_mousemove(layout, e) {
	getPos(layout, e);
	var w = Math.abs(layout.pos.end.x - layout.pos.start.x);
	var h = Math.abs(layout.pos.end.y - layout.pos.start.y);
	w = w / layout.boxStyle.w;
	h = h / layout.boxStyle.h;
	layout.spanBox.style.width = w * 100 + '%';
	layout.spanBox.style.height = h * 100 + '%';
}

//添加事件span时鼠标放开事件处理函数
function addEventBox_mouseup(layout, e) {
	layout.pos = {
		start: null,
		end: null
	};
	//如果spanbox宽高小于设定值就删除这个spanbox，防止点击误操作。
	var spanBoxStyle = layout.spanBox.currentStyle ? layout.spanBox.currentStyle : window.getComputedStyle(layout.spanBox, null);
	if (parseFloat(spanBoxStyle.width) < 10 || parseFloat(spanBoxStyle.height) < 10) {
		layout.spanBox.remove();
		// console.log(layout.layoutData)
	}
	layout.bindEvent(layout.spanBox, 'contextmenu', contextmenu);
	layout.boxStyle = {
		w: null,
		h: null	
	}
	layout.spanBox = null;
	layout.mouseHasDown = false;
	layout.handleName = null;
	layout.eventHandleBox.remove();
	layout.eventHandleBox = null;
}

//移动事件span时鼠标点下事件处理函数
function moveEventBox_mousedown(layout, e) {
	layout.eventBox = e.target.parentNode;
	layout.spanBox = e.target;
	getEleStyle(layout, layout.eventBox)
	getPos(layout, e);
	var left = parseFloat(layout.spanBox.style.left).toFixed(5) / 100 * layout.boxStyle.w;
	var top = parseFloat(layout.spanBox.style.top).toFixed(5) / 100 * layout.boxStyle.h;
	layout.spanBoxPos = {
		x: left,
		y: top
	}
	layout.bindEvent(layout.spanBox, 'mousemove', layout.onMouseMove);
	layout.bindEvent(layout.spanBox, 'mouseup', layout.onMouseUp);
}

//移动事件span时鼠标移动事件处理函数
function moveEventBox_mousemove(layout, e) {
	getPos(layout, e);
	var x = layout.spanBoxPos.x + (layout.pos.end.x - layout.pos.start.x),
		y = layout.spanBoxPos.y + (layout.pos.end.y - layout.pos.start.y);
	var left = x / layout.boxStyle.w * 100 + '%',
		top = y / layout.boxStyle.h * 100 + '%';
	layout.spanBox.style.left = left;
	layout.spanBox.style.top = top;
}

//移动事件span时鼠标放开事件处理函数
function moveEventBox_mouseup(layout, e) {
	addEventBox_mouseup(layout, e)
	layout.spanBoxPos = null;
}

function contextmenu(layout, e){
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	e.stopPropagation();
	menu.init(e.target);
}
var menu = new Menu('eventMenu');
function Menu (id){
	this.contBox = ele(id);
	this.searchBox = document.getElementById('searchBox');
	this.ipt = document.getElementById('keyword');
	this.ok =  document.getElementById('ok');
	this.cancel = document.getElementById('cancel');
	this.eventList = document.querySelector('#eventList')
	this.subList = document.querySelector('#subList')
	this.param1 = null;
	this.param2 = null;
	this.eventName = document.getElementById('eventName');
	this.param1Text = '';
	this.param2Text = '';
}

Menu.prototype.init = function (span) {
	this.span = span;
	var _this = this;
	this.param1 = this.span.getAttribute('data-param1');
	this.param2 = this.span.getAttribute('data-param2');
	if(this.param1){
		this.eventList.value = this.param1;
		getParam(this.param1,'',this.param2);
	}
	if(this.param2){
		this.subList.value = this.param2;
	}
	this.eventName.innerHTML = this.span.getAttribute('data-eventName');
	this.cancel.addEventListener('click',function (){
		_this.close();
	})
	this.ok.addEventListener('click',function (){
		_this.setEvent(_this.span);
		_this.close();
	})
	this.eventList.addEventListener('change', function (){
		_this.param1 = _this.eventList.value;
		_this.searchBox.querySelector('input').value = '';
		_this.param1Text = _this.eventList.querySelector('option[value=\''+_this.param1+'\']').innerHTML;
		_this.eventName.innerHTML = _this.param1Text;
		getParam(_this.param1)
	})
	this.subList.addEventListener('change', function (){
		_this.param2 = _this.subList.value;
		_this.param1Text = _this.eventList.querySelector('option[value=\''+_this.param1+'\']').innerHTML;
		_this.param2Text = _this.subList.querySelector('option[value=\''+_this.param2+'\']').innerHTML;
		_this.eventName.innerHTML = _this.param1Text+' → '+_this.param2Text;
	})
	this.contBox.style.display = 'flex';
	this.contBox.style.display = '-webkit-flex';
}

Menu.prototype.setEvent = function () {
	if(this.param1){
		setAttr(this.span, 'data-param1', this.param1)
	}else{
		this.span.removeAttribute('data-param1')
	}
	if(this.param2){
		setAttr(this.span, 'data-param2', this.param2)
	}else{
		this.span.removeAttribute('data-param2')
	}
	setAttr(this.span, 'data-eventName', this.eventName.innerHTML)
	setAttr(this.span, 'title', this.eventName.innerHTML)
}
Menu.prototype.close = function () {
	this.contBox.style.display = 'none';
	this.clearValue();
}

Menu.prototype.clearValue = function () {
	this.ipt.value = '';
	this.searchBox.style.display = 'none';
	this.eventList.value = '000'
	this.subList.innerHTML = '';
	this.subList.style.display = 'none';
}


function createSelect(list, select) {
	for (var i in list) {
		var option = document.createElement('option');
		option.value = list[i].id;
		option.innerHTML = list[i].text;
		select.appendChild(option);
	}
}

function selectChange(_this) {
	document.getElementById('searchBox').querySelector('input').value = '';
	// document.getElementById('eventName').innerHTML;
	// console.log(_this.text)
	getParam(_this.value)
}

function createSubSelect(list, select, value) {
	for (var i in list) {
		var option = document.createElement('option');
		option.value = list[i].id;
		option.innerHTML = list[i].name;
		select.appendChild(option);
	}
	if(value){
		select.value = value;
	}
}

function search() {
	var id = document.getElementById('eventList').value;
	var q = document.getElementById('keyword').value;
	getParam(id, q);
}


function createHtml() {
	var name = document.getElementById('fileName').value;
	name = trim(name,'g');
	if(name==''){
		alert('文件名不能为空！')
		return
	}
	var filename = name+'.html'
	var htmlbody = document.getElementById('pageView').innerHTML;
	var html = htmlhead + htmlbody + htmlfoot;
	funDownload(html, filename);
}

function trim(str,is_global)
{
	var result;
	result = str.replace(/(^\s+)|(\s+$)/g,"");
	if(is_global.toLowerCase()=="g")
	{
		result = result.replace(/\s/g,"");
	 }
	return result;
}

var htmlhead = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>*{box-sizing: border-box;padding: 0;margin: 0;}html{height: 100%;}body{height: 100%;padding: 0;margin: 0;}#layout{position: relative;width: 100%;overflow: hidden;}#layout img{width: 100%;float: left;}#layout .block{position: relative;width: 100%;overflow: hidden;}#layout i.close{position: absolute;display: none;cursor: pointer;font-style: normal;text-align: center;width: 20px;height: 20px;left: 0;top: 0;line-height: 20px;font-size: 18px;color: #fff;background: rgb(255, 125, 125);z-index: 10000;}#layout .eventbox{position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: 9999;}#layout .eventbox span{position: absolute;display: block;}#layout .eventbox span i.close{display: none;font-style: normal;width: 20px;height: 20px;position: absolute;left: -10px;top: -10px;line-height: 20px;border-radius: 50%;text-align: center;font-size: 12px;color: #fff;background:rgb(255, 125, 125);}#layout .eventbox span i.close:hover{cursor: pointer;}</style></head><body>';

var htmlfoot = '<script>window.onload = function (){var spanList = document.querySelectorAll("span[data-hasevent]");spanList.forEach(function (item) {item.addEventListener("click", function(e){return (function(item){var param1 = item.getAttribute("data-param1");var param2 = item.getAttribute("data-param2");id = parseInt(param1);if(param2){id = parseInt(param1)+"/"+ parseInt(param2)}window.location.href = "tticarstorecall://" + id;})(item)})})}</script></body></html>'

// 下载文件方法
function funDownload(content, filename) {
	var eleLink = document.createElement('a');
	eleLink.download = filename;
	eleLink.style.display = 'none';
	// 字符内容转变成blob地址
	var blob = new Blob([content]);
	eleLink.href = URL.createObjectURL(blob);
	// 触发点击
	document.body.appendChild(eleLink);
	eleLink.click();
	// 然后移除
	document.body.removeChild(eleLink);
};