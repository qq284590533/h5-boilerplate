//禁止网页文本选中事件
document.body.onselectstart = document.body.ondrag = function () {
	return false;
}

//添加关闭按钮
function addCloseBtn(layout, span) {
	var i = createEle('i');
	i.innerHTML = '×';
	i.className = 'close close_event';
	i.addEventListener('click', function () {
		span.remove();
	})
	span.appendChild(i);
}

//添加调整大小按钮
function addresizeBtn(layout, span) {
	var resizeBtn = createEle('i');
	resizeBtn.className = 'resize';
	layout.setRespondEventElement(resizeBtn);
	setAttr(resizeBtn, 'data-handleName', 'resizeEventBox');
	span.appendChild(resizeBtn);
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

function imgToView(layout, up, files) {
	plupload.each(files, function (file) {
		if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
			var fr = new mOxie.FileReader();
			fr.onload = function () {
				file.imgsrc = fr.result;
				addImgHandle(layout, file, up)
			}
			fr.readAsDataURL(file.getSource());
		} else {
			var preloader = new mOxie.Image();
			preloader.onload = function () {
				var imgsrc = preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
				file.imgsrc = imgsrc;
				preloader.destroy();
				preloader = null;
				addImgHandle(layout, file, up)
			};
			preloader.load(file.getSource());
		}
	});
}


function addImgHandle(layout, file, up) {
	if (!layout.imgFilesJson[layout.blockId] && !ele(layout.blockId)) {
		createBlock(layout, file, up)
	} else {
		var img = ele(layout.blockId).querySelector('img')
		img.src = file.imgsrc;
		setAttr(img, 'data-isnew', true);
		setAttr(img, 'data-name', file.name);
		ele(layout.blockId).id = file.id;
		layout.imgFilesJson[file.id] = file;
		delete layout.imgFilesJson[layout.blockId];
		for (var i = 0; i < up.files.length; i++) {
			if (up.files[i].id == layout.blockId) {
				up.files.splice(i, 1);
			}
		}
	}
}

var ossParams = {
	host: "",
	accessid: '',
	accesskey: '',
	policyBase64: '',
	signature: '',
	key: ''
}

var signParams = {
	fileServerUrl: "",
	fileName: "",
	type: "1",
};

var fileJson = {};


function Layout() {
	this.elements = {
		layout: ele('layout'),
		addImg: ele('addImg'),
		selectHtml: ele('selectHtml'),
		importHtml: ele('importHtml')
	};
	this.steps = {};
	this.boxStyle = {
		w: null,
		h: null
	}
	this.spanBoxStyle = {
		w: null,
		h: null
	}
	this.pos = {
		start: null,
		end: null
	};
	this.img = null;
	this.imgFilesJson = {};
	this.blockId = null;
	this.eventBox = null;
	this.handleName = null;
	this.mouseHasDown = false;
	this.spanBox = null; //当前操作的spanBox
	this.spanBoxPos = null;
	this.imgFiles = [];
	this.menu = new Menu('eventMenu');
	this.init();
}

//初始化
Layout.prototype.init = function () {
	var _this = this;
	//上传图片文件
	this.imgUploader = new plupload.Uploader({
		runtimes: 'html5,flash,silverlight,html4',
		browse_button: _this.elements.addImg,
		url: 'http://oss.aliyuncs.com',
		container: document.getElementById('container'),
		filters: {
			mime_types: [{
				title: "Image files",
				extensions: "jpg,gif,png"
			}],
			max_file_size: '5mb', //最大只能上传5mb的文件
			prevent_duplicates: false //不允许选取重复文件
		},
		init: {
			PostInit: function () { //上传初始化的操作函数
			},
			FilesAdded: function (up, files) {
				imgToView(_this, up, files);
				getOssSign(files);
			},
			BeforeUpload: function (up, file) {
				ele('uploadImgTips').innerHTML = '开始上传图片'
				ossBeforeUploadAction(up, file, _this);
				return;
			},
			UploadProgress: function (up, file) {
				ele('uploadImgTips').innerHTML = '上传图片中……'
			},
			FileUploaded: function (up, file, info) {
				imgfileSucesse(file)
				ele('uploadImgTips').innerHTML = '图片上传完成！'
				up.refresh();
			},
			Error: function (up, error) {
				up.refresh();
			}
		}
	});
	this.imgUploader.init();

	//上传html文件
	this.htmlUploader = new plupload.Uploader({
		runtimes: 'html5,flash,silverlight,html4',
		browse_button: 'upload',
		url: 'http://oss.aliyuncs.com',
		container: document.getElementById('container'),
		filters: {
			mime_types: [{
				title: "html files",
				extensions: "html"
			}],
			max_file_size: '5mb',
			prevent_duplicates: false
		},
		init: {
			PostInit: function () {

			},
			FilesAdded: function (up, files) {
				getOssSign(files)
				ossUploadAddedAction(up, files);
			},
			BeforeUpload: function (up, file) {
				ossBeforeUploadAction(up, file);
			},
			UploadProgress: function (up, file) {
				ossUploadProgressAction(up, file);
			},
			FileUploaded: function (up, file, info) {
				fileSucesse(file)
				up.refresh();
			},
			Error: function (up, error) {
				up.refresh();
			}
		}
	});
	this.htmlUploader.init();

	this.bindEvent(ele('createHtml'), 'click', createHtml)

	this.elements.importHtml.addEventListener('click', function () {
		_this.elements.selectHtml.click();
	})

	this.bindEvent(this.elements.selectHtml, 'change', htmlChange);
	this.bindEvent(document.body, 'mouseup', this.onMouseUp);
}

//绑定事件
Layout.prototype.bindEvent = function (element, eventType, handle) {
	var _this = this;
	element.addEventListener(eventType, function (e) {
		handle(_this, e);
	})
}


//选择图片
function createBlock(layout, file, up) {
	var div = createEle('div'),
		eventbox = createEle('div'),
		closebtn = createEle('i'),
		editbtn = createEle('i'),
		img = createEle('img'),
		id = file.id;
	div.id = id;
	div.className = 'block';
	layout.elements.layout.appendChild(div);

	div.appendChild(img);
	div.appendChild(eventbox);
	div.appendChild(closebtn);
	div.appendChild(editbtn);

	img.src = file.imgsrc;
	setAttr(img, 'data-isnew', true);
	setAttr(img, 'data-name', file.name);

	eventbox.className = 'eventbox';
	setAttr(eventbox, 'data-handleName', 'addEventBox');
	layout.setRespondEventElement(eventbox);
	layout.bindEvent(eventbox, 'mousedown', layout.onMouseDown);

	closebtn.innerHTML = '×';
	closebtn.className = 'close close_block';
	closebtn.addEventListener('click', function () {
		this.parentNode.remove();
		delete layout.imgFilesJson[this.parentNode.id];
		for (var i = 0; i < up.files.length; i++) {
			if (up.files[i].id == this.parentNode.id) {
				up.files.splice(i, 1);
			}
		}
	})

	editbtn.innerHTML = '／';
	editbtn.className = 'edit';
	editbtn.addEventListener('click', function () {
		layout.blockId = this.parentNode.id;
		layout.elements.addImg.click();
	})
	layout.imgFilesJson[file.id] = file;
}

function createImg(url) {
	var imgBox = ele('imgBox');
	var img = createEle('img');
	img.src = url;
	imgBox.appendChild(img);
	return img;
}

//选择HTML文件
function htmlChange(layout) {
	var iframe = document.createElement('iframe');
	var file = layout.elements.selectHtml.files.item(0),
		url = window.URL.createObjectURL(file);
	iframe.style.display = 'none';
	iframe.src = url;
	if (iframe.attachEvent) {
		iframe.attachEvent("onload", function () {
			layout.elements.layout.innerHTML = iframe.contentWindow.document.getElementById('layout').innerHTML;
			iframe.remove();
			amendLayout(layout)
		});
	} else {
		iframe.onload = function () {
			layout.elements.layout.innerHTML = iframe.contentWindow.document.getElementById('layout').innerHTML;
			iframe.remove();
			amendLayout(layout)
		};
	}
	document.body.appendChild(iframe);
	layout.elements.selectHtml.value = null;
}

//导入修改，初始化
function amendLayout(layout) {
	var eventboxs = layout.elements.layout.querySelectorAll('.eventbox');
	eventboxs.forEach(function (eventbox) {
		return (function (eventbox) {
			layout.bindEvent(eventbox, 'mousedown', layout.onMouseDown);
		})(eventbox)
	});

	var blocks = layout.elements.layout.querySelectorAll('.block');
	blocks.forEach(function (block) {
		var close = block.querySelector('.close_block');
		var edit = block.querySelector('.edit');
		close.addEventListener('click', function () {
			this.parentNode.remove();
			delete layout.imgFilesJson[this.parentNode.id];
			for (var i = 0; i < layout.imgUploader.files.length; i++) {
				if (layout.imgUploader.files[i].id == this.parentNode.id) {
					layout.imgUploader.files.splice(i, 1);
				}
			}
		})
		edit.addEventListener('click', function () {
			layout.blockId = this.parentNode.id;
			layout.elements.addImg.click();
		})
	})

	var eventBoxList = layout.elements.layout.querySelectorAll('.eventbox .hasevent');
	eventBoxList.forEach(function (eventBox) {
		layout.bindEvent(eventBox, 'mousemove', layout.onMouseMove);
		layout.bindEvent(eventBox, 'mouseup', layout.onMouseUp);
		layout.bindEvent(eventBox, 'contextmenu', contextmenu);
		layout.bindEvent(eventBox, 'mouseover', mouseover);
		layout.bindEvent(eventBox, 'mouseout', mouseout);
		var close = eventBox.querySelector('.close');
		close.addEventListener('click', function () {
			eventBox.remove();
		})
	})

	//初始化轮播组件
	window.mslide.importInit();
}

//设置data-hasEvent属性，有这个属性的元素才能够响应定义的事件。
Layout.prototype.setRespondEventElement = function (element) {
	setAttr(element, 'data-hasEvent', true)
}


// e.button==0鼠标左键
// e.button==1鼠标滚轮键
// e.button==2鼠标右键
Layout.prototype.onMouseDown = function (layout, e) {
	var hasEvent = e.target.getAttribute('data-hasEvent');
	if (!hasEvent || e.button != 0) return;
	// console.log('按下')
	layout.mouseHasDown = true;
	layout.handleName = e.target.getAttribute('data-handleName');
	if (e.target.nodeName == 'DIV') {
		layout.eventBox = e.target
	} else if (e.target.nodeName == 'SPAN') {
		layout.eventBox = e.target.parentNode
	} else {
		layout.eventBox = e.target.parentNode.parentNode;
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
		case 'resizeEventBox':
			resizeEventBox_mousedown(layout, e);
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
		case 'resizeEventBox':
			resizeEventBox_mousemove(layout, e);
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
		case 'resizeEventBox':
			resizeEventBox_mouseup(layout, e);
			break;
		default:
			break;
	}
}

function getEleStyle(layout, element) {
	var boxStyle = element.currentStyle ? element.currentStyle : window.getComputedStyle(element, null);
	layout.boxStyle.w = parseInt(boxStyle.width);
	layout.boxStyle.h = parseInt(boxStyle.height);
}

//添加事件span时鼠标点下事件处理函数
function addEventBox_mousedown(layout, e) {
	getPos(layout, e);
	getEleStyle(layout, e.target)
	var span = createEle('span');
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

	layout.bindEvent(layout.spanBox, 'mousemove', layout.onMouseMove);
	layout.bindEvent(layout.spanBox, 'mouseup', layout.onMouseUp);
	layout.bindEvent(layout.spanBox, 'contextmenu', contextmenu);

	layout.bindEvent(layout.spanBox, 'mouseover', mouseover);
	layout.bindEvent(layout.spanBox, 'mouseout', mouseout);
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
	//如果spanbox宽高小于设定值就删除这个spanbox，防止点击误操作。
	var spanBoxStyle = layout.spanBox.currentStyle ? layout.spanBox.currentStyle : window.getComputedStyle(layout.spanBox, null);

	addCloseBtn(layout, layout.spanBox);
	addresizeBtn(layout, layout.spanBox)

	if (parseFloat(spanBoxStyle.width) < 10 || parseFloat(spanBoxStyle.height) < 10) {
		layout.spanBox.remove();
	}
	resetDatas(layout)
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
	resetDatas(layout);
	layout.spanBoxPos = null;
}

function resetDatas(layout) {
	layout.pos = {
		start: null,
		end: null
	};
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

function resizeEventBox_mousedown(layout, e) {
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	e.stopPropagation();
	getPos(layout, e);
	getEleStyle(layout, layout.eventBox);
	layout.spanBox = e.target.parentNode;
	var spanboxstyle = layout.spanBox.currentStyle ? layout.spanBox.currentStyle : window.getComputedStyle(layout.spanBox, null);
	layout.spanBoxStyle.w = parseFloat(spanboxstyle.width);
	layout.spanBoxStyle.h = parseFloat(spanboxstyle.height);
}

function resizeEventBox_mousemove(layout, e) {
	getPos(layout, e);
	var w = layout.spanBoxStyle.w + (layout.pos.end.x - layout.pos.start.x);
	var h = layout.spanBoxStyle.h + (layout.pos.end.y - layout.pos.start.y);
	w = w / layout.boxStyle.w;
	h = h / layout.boxStyle.h;
	layout.spanBox.style.width = w * 100 + '%';
	layout.spanBox.style.height = h * 100 + '%';
}

function resizeEventBox_mouseup(layout, e) {
	layout.pos = {
		start: null,
		end: null
	};
	layout.boxStyle = {
		w: null,
		h: null
	}
	layout.spanBoxStyle = {
		w: null,
		h: null
	}
	layout.spanBox = null;
	layout.mouseHasDown = false;
	layout.handleName = null;
	layout.eventHandleBox.remove();
	layout.eventHandleBox = null;
}


//鼠标移动到span事件
function mouseover(layout, e) {
	var eventname = document.getElementById('eventName');
	var text1 = e.target.getAttribute('data-eventname1');
	var text2 = e.target.getAttribute('data-eventname2');
	if (text1) {
		eventname.innerHTML = text1
		if (text2) {
			eventname.innerHTML += ' → ' + text2;
		}
	}
}

//鼠标移出span事件
function mouseout(layout, e) {
	var eventname = document.getElementById('eventName');
	eventname.innerHTML = ''
}

function contextmenu(layout, e) {
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	e.stopPropagation();
	layout.menu.open(e.target);
}

function createHtml(layout) {
	var name = document.getElementById('fileName').value;
	var title = document.getElementById('titleName').value;
	name = trim(name, 'g');
	title = trim(title, 'g');
	if (name == ''||title=='') {
		alert('文件名和标题不能为空！')
		return
	}

	var htmlfoot = '<div id="browser"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.4.1/js/swiper.min.js"></script><script>function urlJson(){var href=window.location.href;var ksbz=href.indexOf("?");var hrefStr=href.substr(ksbz+1);var splitStr=hrefStr.split("&");var urlObj={};for(var i=0;i<splitStr.length;i++){urlObj[splitStr[i].split("=")[0]]=splitStr[i].split("=")[1]}return urlObj}window.onload=function(){var urlObj=urlJson();var isShare=urlObj.isShare||false;var browser=document.getElementById("browser");browser.addEventListener("click",function(){this.style.display="none"});function is_weixn_qq(){var ua=navigator.userAgent.toLowerCase();if(ua.match(/MicroMessenger/i)=="micromessenger"||ua.match(/QQ/i)=="qq"){return true}return false}var spanList=document.querySelectorAll(".hasevent");for(var i=0;i<spanList.length;i++){var item=spanList[i];(function(item){item.addEventListener("click",function(e){var id1=item.getAttribute("data-eventid1");var id2=item.getAttribute("data-eventid2");id=id1;if(isShare=="true"){if(is_weixn_qq()){browser.style.display="block";return}else{if(id=="2"){window.location.href=this.getAttribute("data-h5");return}}}if(id=="2"){window.location.href="tticarstorecall://"+id+"/"+this.getAttribute("data-h5");return}if(id2){id=id1+"/"+id2}window.location.href="tticarstorecall://"+id})})(item)}var swiperBoxList=document.querySelectorAll(".swiper-box");for(var i=0;i<swiperBoxList.length;i++){var item=swiperBoxList[i];(function(item){var id=item.querySelector(" .swiper-container").id;var selector="#"+id;var optionsJsonStr=item.getAttribute("data-slideOption");var options=JSON.parse(optionsJsonStr);if(options.scrollType=="slide"){new Swiper(selector,{autoHeight:true,loop:true,autoplay:options.autoplay?{delay:options.delay,disableOnInteraction:false,}:false,pagination:{el:".swiper-pagination",},})}else{new Swiper(selector,{freeMode:true,freeModeMinimumVelocity:0.2,slidesPerView:"3.2"})}})(item)}};</script></body></html>';


	var htmlhead = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>' + title + '</title><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.4.1/css/swiper.min.css"><style>*{box-sizing: border-box;padding: 0;margin: 0;}html{height: 100%;}body{height: 100%;padding: 0;margin: 0;}#layout{position: relative;width: 100%;overflow: hidden;z-index:1;}#layout img{width: 100%;float: left;}#layout .block{position: relative;width: 100%;overflow: hidden;} #layout i{display: none;}#layout .eventbox{position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: 9999;}#layout .eventbox span{position: absolute;display: block;}#browser{position: fixed;z-index: 1;top: 0;left: 0;display: none;width: 100%;height: 100%;background-image: url(https://f.tticar.com/h5-activity/browser/browser.png);background-size: cover}</style></head><body>';

	var filename = name + '.html'
	var htmlbody = document.getElementById('pageView').cloneNode(true);

	var imgs = htmlbody.querySelectorAll('img[data-isnew=true]');

	imgs.forEach(function (item) {
		item.src = "https://f.tticar.com/h5-activity/" + name + '\/' + item.getAttribute('data-name');
		setAttr(item, 'data-isnew', false);
	})

	htmlbody = htmlbody.innerHTML;
	var html = htmlhead + htmlbody + htmlfoot;
	layout.filePath = name;
	layout.imgUploader.start();
	funDownload(html, filename);
	htmlbody = null;
}



