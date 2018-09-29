/**
 * 轮播图组件
 */

function MSlide(layout, popup) {
	this.layout = layout;
	this.popup = popup;
	this.pageNum = 2;
	this.name = 'MSlide';
	this.openBtn = document.getElementById('addSlide');
	this.popupModelId = '#addSlideBox';
	this.popupModel = ele('addSlideBox');
	this.scrollTypeInput = document.querySelectorAll('input[name="scrolltype"]');
	this.scrollType = 'slide';
	this.autoplay = this.popupModel.querySelector('.autoplay');
	this.addbtn = ele('addSlidePage');
	this.delayDiv = this.popupModel.querySelector('.delay');
	this.delay = ele('delay');
	this.delayVal = 3000;
	this.isAutoPlay = false;
	this.slidePage = ele('slidePage');
	this.addEventBtn = null;
	this.slideData=[];
	this.imgFilesJson = layout.imgFilesJson;
	this.files = layout.imgUploader.files;
	this.imgbox = null;
	this.slidePageObj = {};
	this.init();
}

MSlide.prototype.init = function () {
	var _this = this;
	this.imgUploader = new plupload.Uploader({
		runtimes: 'html5,flash,silverlight,html4',
		browse_button: _this.addbtn,
		url: 'http://oss.aliyuncs.com',
		container: document.getElementById('addSlideContainer'),
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
				_this.addSlideItem(up,files);
			},
			Error: function (up, error) {
				up.refresh();
			}
		}
	});
	this.imgUploader.init();
	this.openBtn.addEventListener('click',function (){
		_this.popup.open({
			width:'500px',
			height:'400px',
			name: _this.name,
			id: _this.popupModelId,
			title: '添加滚动组件',
			callback: function () {
				console.log('添加轮播弹窗弹出')
			}
		});
	})

	for(var i=0; i<this.scrollTypeInput.length; i++){
		var item = this.scrollTypeInput[i];
		(function(item){
			item.addEventListener('change',function(){
				_this.scrollType = document.querySelector('input[name="scrolltype"]:checked').value;
				if(_this.scrollType=='slide'){
					_this.autoplay.style.display = 'block';
				}else{
					_this.autoplay.style.display = 'none';
				}
			})
		})(item)
	}

	this.autoplay.querySelector('input').addEventListener('change',function(){
		_this.isAutoPlay = this.checked
		console.log(_this.isAutoPlay);
		if(_this.isAutoPlay){
			_this.delayDiv.style.display = 'inline-block';
		}else{
			_this.delayDiv.style.display = 'none';
		}
	})

	//添加轮播取消重置轮播表单；
	this.popup.popupCloseCallbackHandle[this.name] = function(){
		_this.reset()
	}

	//添加轮播确定按钮执行事件
	this.popup.okClickHandle[this.name] = function(){
		console.log(_this.scrollType);
		console.log('添加轮播确定！');
	}
	
}

MSlide.prototype.reset = function () {
	console.log('添加轮播弹窗关闭')
}

MSlide.prototype.addSlideItem = function(up,files){
	var _this = this;
	plupload.each(files, function (file) {
		if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
			var fr = new mOxie.FileReader();
			fr.onload = function () {
				file.imgsrc = fr.result;
				_this.imgChangeHandle(file)
			}
			fr.readAsDataURL(file.getSource());
		} else {
			var preloader = new mOxie.Image();
			preloader.onload = function () {
				var imgsrc = preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
				file.imgsrc = imgsrc;
				_this.imgChangeHandle(file);
				preloader.destroy();
				preloader = null;
			};
			preloader.load(file.getSource());
		}
	});
}

MSlide.prototype.imgChangeHandle = function(file){
	this.files.push(file);
	this.imgUploader.files = [];
	if(this.imgbox){
		var id = this.imgbox.id;
		console.log('修改');
		this.editSlideItme(file);
		for(var i=0; i<this.files.length; i++){
			if(this.files[i].id==id){
				this.files.splice(i, 1);
				break;
			}
		}
		this.imgbox = null;
	}else{
		console.log('新建');
		this.createSlideItme(file);
	}
	// this.addItemToLayoutUploader(file);
	console.log(this.files);
}

MSlide.prototype.createSlideItme = function(file){
	var _this = this;
	var imgbox = createEle('div');
	imgbox.id = file.id;
	imgbox.className = 'imgbox';
	imgbox.innerHTML = '<i class="delete" title="删除">-</i><div class="slide-item"><img class="slideimg" src="'+file.imgsrc+'" data-isnew="true" data-name="'+file.name+'" alt=""><span></span></div><p class="event-name" title="点击修改"></p><button class="btn deleventbtn">删除事件</button><button class="btn addeventbtn">添加事件</button><div class="select"><div id="slideEvent" class="select-box"></div><div class="btn-box"><button class="btn ok">确定</button><button class="btn cancel">取消</button></div></div>'
	imgbox.id = file.id;
	this.slidePage.appendChild(imgbox);

	var eventName = imgbox.querySelector('.event-name');
	var delEventBtn = imgbox.querySelector('.deleventbtn');
	var eventSpan = imgbox.querySelector('span');

	var slideItem = imgbox.querySelector('.slide-item');
	slideItem.addEventListener('click',function(){
		_this.slideItemClick(imgbox);
	})

	var deleteSlideBtn = imgbox.querySelector('.delete');
	deleteSlideBtn.addEventListener('click',function(){
		_this.deleteSlide(imgbox);
	})

	var addEventBtn = imgbox.querySelector('.addeventbtn');
	addEventBtn.addEventListener('click',function(){
		this.style.display = 'none';
		_this.addEventHandle(imgbox);
	})

	var selectBox = imgbox.querySelector('.select');
	var addEventOkBtn = selectBox.querySelector('.ok');
	addEventOkBtn.addEventListener('click',function(){
		selectBox.style.display = 'none';
		_this.addEventOkBtnHandle(imgbox,eventSpan);
		_this.selectGroup.destroy();
		_this.selectGroup = null;
		if(eventSpan.className=='hasevent'){
			var text1 = eventSpan.getAttribute('data-eventname1');
			var text2 = eventSpan.getAttribute('data-eventname2');
			if (text1) {
				eventName.innerHTML = text1
				if (text2) {
					eventName.innerHTML += ' → ' + text2;
				}
			}
			eventName.style.display = 'block';
			delEventBtn.style.display = 'block';
		}else{
			addEventBtn.style.display = 'block';
		}
	})
	eventName.addEventListener('click',function(){
		this.style.display = 'none';
		delEventBtn.style.display = 'none';
		_this.addEventHandle(imgbox);
	})


	var addEventCancelBtn = selectBox.querySelector('.cancel');
	addEventCancelBtn.addEventListener('click',function(){
		selectBox.style.display = 'none';
		if(eventSpan.className=='hasevent'){
			eventName.style.display = 'block';
			delEventBtn.style.display = 'block';
		}else{
			addEventBtn.style.display = 'block';
		}
		_this.selectGroup.destroy();
		_this.selectGroup = null;
	})

	delEventBtn.addEventListener('click',function(){
		eventSpan.removeAttribute('class');
		eventSpan.removeAttribute('data-eventid1');
		eventSpan.removeAttribute('data-eventname1');
		eventSpan.removeAttribute('data-eventid2');
		eventSpan.removeAttribute('data-eventname2');
		eventName.innerHTML = '';
		eventName.style.display = 'none';
		this.style.display = 'none';
		addEventBtn.style.display = 'block';
	})
}

//图片对象添加到layout对象中的uploader上传队列中；
MSlide.prototype.editSlideItme = function(file){
	var img = this.imgbox.querySelector('.slideimg');
	img.src = file.imgsrc;
	setAttr(img, 'data-name', file.name);
	var slideItem = this.imgbox.querySelector('.slide-item');
	this.imgbox.id = file.id;
}

MSlide.prototype.deleteSlide = function (imgbox){
	var id = imgbox.id
	for(var i=0; i<this.files.length; i++){
		if(this.files[i].id==id){
			this.files.splice(i, 1);
			break;
		}
	}
	imgbox.remove();
	if(this.selectGroup){
		this.selectGroup.imgbox = null;
	}
	console.log(this.files);
}

MSlide.prototype.slideItemClick = function(imgbox){
	this.imgbox = imgbox;
	this.addbtn.click();
}

MSlide.prototype.addEventHandle = function(imgbox){
	if(this.selectGroup&&this.selectGroup.imgbox){
		var lastTiemImgBox = this.selectGroup.imgbox;
		var lastTiemImgBoxEventBox = lastTiemImgBox.querySelector('span');
		var lastTiemImgBoxSelectBox = lastTiemImgBox.querySelector('.select');
		var lastTiemImgBoxEventName = lastTiemImgBox.querySelector('.event-name');
		var lastTiemImgBoAddEventBtn = lastTiemImgBox.querySelector('.addeventbtn');
		var lastTiemImgBoDelEventBtn = lastTiemImgBox.querySelector('.deleventbtn');
		if(lastTiemImgBoxEventBox.className=='hasevent'){
			lastTiemImgBoxSelectBox.style.display = 'none';
			lastTiemImgBoxEventName.style.display = 'block';
			lastTiemImgBoDelEventBtn.style.display = 'block';
		}else{
			lastTiemImgBoxSelectBox.style.display = 'none';
			lastTiemImgBoAddEventBtn.style.display = 'block';
		}

		this.selectGroup.destroy();
	}
	console.log('添加事件');
	var val = null;
	var span = imgbox.querySelector('span');
	var select = imgbox.querySelector('.select');
	var selectBox =  imgbox.querySelector('.select-box');
	select.style.display = 'block';
	var eventid1 = span.getAttribute('data-eventid1');
	var eventname1 = span.getAttribute('data-eventname1');
	var eventid2 = span.getAttribute('data-eventid2');
	var eventname2 = span.getAttribute('data-eventname2');
	if (eventid1) {
		val = {
			data1: {
				id: eventid1,
				text: eventname1
			}
		}
		if (eventid2) {
			val['data2'] = {
				id: eventid2,
				name: eventname2
			}
		}
	}
	this.selectGroup = new SelectGroup(selectBox, val);
	this.selectGroup.imgbox = imgbox;
}

MSlide.prototype.addEventOkBtnHandle = function(imgbox,span){
	this.data1 = this.selectGroup.s1.select2('data');
	if (this.selectGroup.h5Path) {
		var h5Path = this.selectGroup.h5Path;
		setAttr(span, 'data-h5', h5Path);
	} else {
		span.removeAttribute('data-h5');
		span.removeAttribute('data-eventname2')
	}
	if (this.selectGroup.s2Id) {
		this.data2 = this.selectGroup.s2.select2('data');
		if (this.data2[0]&&this.data2[0].text != '') {
			this.data2[0].name = this.data2[0].text;
		}
	} else {
		this.data2 = null;
	}
	if (this.data1[0].id != '0') {
		span.className = 'hasevent'
		setAttr(span, 'data-eventid1', this.data1[0].id);
		setAttr(span, 'data-eventname1', this.data1[0].text)
	} else {
		span.className = ''
		span.removeAttribute('data-eventid1')
		span.removeAttribute('data-eventname1')
	}
	if (this.data2 && this.data2[0] && this.data2[0].id) {
		setAttr(span, 'data-eventid2', this.data2[0].id);
		setAttr(span, 'data-eventname2', this.data2[0].name);
	} else {
		span.removeAttribute('data-eventid2')
		span.removeAttribute('data-eventname2')
		if (this.selectGroup.h5Path) {
			setAttr(span, 'data-eventname2', this.selectGroup.h5PageName);
		}
	}
}





