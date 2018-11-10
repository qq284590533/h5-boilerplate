/**
 * 轮播图组件
 */

function MSlide(layout, popup) {
	this.layout = layout;
	this.popup = popup;
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
	this.isAutoPlay = false;
	this.slidePage = ele('slidePage');
	this.addEventBtn = null;
	this.slideData = [];
	this.imgFilesJson = layout.imgFilesJson;
	this.files = layout.imgUploader.files;
	this.imgbox = null;
	this.imgIdList = [];
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
				_this.addSlideItem(up, files);
				getOssSign(files);
			},
			Error: function (up, error) {
				up.refresh();
			}
		}
	});
	this.imgUploader.init();
	this.openBtn.addEventListener('click', function () {
		_this.popup.open({
			width: '500px',
			height: '400px',
			name: _this.name,
			id: _this.popupModelId,
			title: '添加滚动组件',
			callback: function () {
				console.log('添加轮播弹窗弹出')
			}
		});
	})

	for (var i = 0; i < this.scrollTypeInput.length; i++) {
		var item = this.scrollTypeInput[i];
		(function (item) {
			item.addEventListener('change', function () {
				_this.scrollType = document.querySelector('input[name="scrolltype"]:checked').value;
				if (_this.scrollType == 'slide') {
					_this.autoplay.style.display = 'block';
				} else {
					_this.autoplay.style.display = 'none';
				}
			})
		})(item)
	}

	this.autoplay.querySelector('input').addEventListener('change', function () {
		_this.isAutoPlay = this.checked
		if (_this.isAutoPlay) {
			_this.delayDiv.style.display = 'inline-block';
		} else {
			_this.delayDiv.style.display = 'none';
		}
	})

	//添加轮播取消重置轮播表单；
	this.popup.popupCloseCallbackHandle[this.name] = function () {
		if (_this.isOkBtnClick) {
			//如果点击的是确定按钮
			// console.log('确定')
		} else {
			// console.log('取消')
			//如果点击的是取消按钮，删除上传队列中的对应图片
			_this.delUpLoaderImgList(_this.imgIdList)
		}
		_this.reset();
	}

	//添加轮播确定按钮执行事件
	this.popup.okClickHandle[this.name] = function () {
		_this.createSlideBox()
	}

}


//重置弹窗内表单内容；
MSlide.prototype.reset = function () {
	// console.log('添加轮播弹窗关闭')
	this.scrollType = 'slide';
	for (var i = 0; i < this.scrollTypeInput.length; i++) {
		if (this.scrollTypeInput[i].value == 'slide') {
			this.scrollTypeInput[i].checked = true;
		}
	}
	this.autoplay.style.display = 'block';
	ele('autoplay').checked = false;
	this.isAutoPlay = false;
	this.delayDiv.style.display = 'none';
	this.delay.value = 3000;
	if (this.selectGroup) {
		this.selectGroup.destroy();
		this.selectGroup = null;
	}
	this.slidePage.innerHTML = '';
	this.addEventBtn = null;
	this.slideData = [];
	this.imgIdList = [];
	this.imgbox = null;
	this.isOkBtnClick = false;
	this.swiperid = null;
}

MSlide.prototype.addSlideItem = function (up, files) {
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

MSlide.prototype.imgChangeHandle = function (file) {
	if (!file.creation) {
		this.files.push(file);
		this.imgIdList.push(file.id);
	}
	this.imgUploader.files = [];
	if (this.imgbox) {
		var id = this.imgbox.id;
		this.editSlideItme(file);
		this.delImgList(id);
		this.imgbox = null;
	} else {
		this.createSlideItme(file);
	}
}
MSlide.prototype.delImgList = function (id) {
	for (var i = 0; i < this.files.length; i++) {
		if (this.files[i].id == id) {
			this.files.splice(i, 1);
			break;
		}
	}

	for (var i = 0; i < this.imgIdList.length; i++) {
		if (this.imgIdList[i] == id) {
			this.imgIdList.splice(i, 1);
			break;
		}
	}
}

MSlide.prototype.delUpLoaderImgList = function (imgIdList) {
	for (var i = 0; i < imgIdList.length; i++) {
		var id = imgIdList[i];
		for (var x = 0; x < this.files.length; x++) {
			if (this.files[x].id == id) {
				this.files.splice(x, 1);
			}
		}
	};
}


MSlide.prototype.createSlideItme = function (file) {
	var _this = this;
	var imgbox = createEle('div');
	imgbox.id = file.id;
	imgbox.className = 'imgbox';
	imgbox.innerHTML = '<i class="delete" title="删除">-</i><div class="slide-item" data-imgid="' + file.id + '"><img class="slideimg" src="' + file.imgsrc + '" data-isnew="true" data-name="' + file.name + '" alt=""></div><p class="event-name" title="点击修改"></p><button class="btn deleventbtn">删除事件</button><button class="btn addeventbtn">添加事件</button><div class="select"><div id="slideEvent" class="select-box"></div><div class="btn-box"><button class="btn ok">确定</button><button class="btn cancel">取消</button></div></div>'
	imgbox.id = file.id;
	this.slidePage.appendChild(imgbox);

	var eventName = imgbox.querySelector('.event-name');
	var delEventBtn = imgbox.querySelector('.deleventbtn');
	var eventBox = imgbox.querySelector('.slide-item');

	var slideItem = imgbox.querySelector('.slide-item');
	slideItem.addEventListener('click', function () {
		_this.slideItemClick(imgbox);
	})

	var deleteSlideBtn = imgbox.querySelector('.delete');
	deleteSlideBtn.addEventListener('click', function () {
		_this.deleteSlide(imgbox);
	})

	var addEventBtn = imgbox.querySelector('.addeventbtn');
	addEventBtn.addEventListener('click', function () {
		this.style.display = 'none';
		_this.addEventHandle(imgbox);
	})

	if (file.hasevent) {
		slideItem.classList.add('hasevent');
		setAttr(slideItem, 'data-eventid1', file['eventid1']);
		setAttr(slideItem, 'data-eventname1', file['eventname1']);
		eventName.innerHTML = file['eventname1'];
		if (file['eventid2']) {
			setAttr(slideItem, 'data-eventid2', file['eventid2']);
			setAttr(slideItem, 'data-eventname2', file['eventname2']);
			eventName.innerHTML += ' → ' + file['eventname2'];
		}
		addEventBtn.style.display = 'none';
		eventName.style.display = 'block';
		delEventBtn.style.display = 'block';
	}


	var selectBox = imgbox.querySelector('.select');
	var addEventOkBtn = selectBox.querySelector('.ok');
	addEventOkBtn.addEventListener('click', function () {
		selectBox.style.display = 'none';
		_this.addEventOkBtnHandle(eventBox);
		_this.selectGroup.destroy();
		_this.selectGroup = null;
		if (eventBox.classList.contains('hasevent')) {
			var text1 = eventBox.getAttribute('data-eventname1');
			var text2 = eventBox.getAttribute('data-eventname2');
			if (text1) {
				eventName.innerHTML = text1
				if (text2) {
					eventName.innerHTML += ' → ' + text2;
				}
			}
			eventName.style.display = 'block';
			delEventBtn.style.display = 'block';
		} else {
			addEventBtn.style.display = 'block';
		}
	})
	eventName.addEventListener('click', function () {
		this.style.display = 'none';
		delEventBtn.style.display = 'none';
		_this.addEventHandle(imgbox);
	})


	var addEventCancelBtn = selectBox.querySelector('.cancel');
	addEventCancelBtn.addEventListener('click', function () {
		selectBox.style.display = 'none';
		if (eventBox.classList.contains('hasevent')) {
			eventName.style.display = 'block';
			delEventBtn.style.display = 'block';
		} else {
			addEventBtn.style.display = 'block';
		}
		_this.selectGroup.destroy();
		_this.selectGroup = null;
	})

	delEventBtn.addEventListener('click', function () {
		eventBox.classList.remove('hasevent');
		eventBox.removeAttribute('data-eventid1');
		eventBox.removeAttribute('data-eventname1');
		eventBox.removeAttribute('data-eventid2');
		eventBox.removeAttribute('data-eventname2');
		eventName.innerHTML = '';
		eventName.style.display = 'none';
		this.style.display = 'none';
		addEventBtn.style.display = 'block';
	})
}

//图片对象添加到layout对象中的uploader上传队列中；
MSlide.prototype.editSlideItme = function (file) {
	var img = this.imgbox.querySelector('.slideimg');
	img.src = file.imgsrc;
	setAttr(img, 'data-name', file.name);
	var slideItem = this.imgbox.querySelector('.slide-item');
	this.imgbox.id = file.id;
	setAttr(slideItem, 'data-imgid', file.id);
}

MSlide.prototype.deleteSlide = function (imgbox) {
	var id = imgbox.id;
	this.delImgList(id);
	imgbox.remove();
	if (this.selectGroup) {
		this.selectGroup.imgbox = null;
	}
}

MSlide.prototype.slideItemClick = function (imgbox) {
	this.imgbox = imgbox;
	this.addbtn.click();
}

MSlide.prototype.addEventHandle = function (imgbox) {
	if (this.selectGroup && this.selectGroup.imgbox) {
		var lastTimeImgBox = this.selectGroup.imgbox;
		var lastTimeImgBoxEventBox = lastTimeImgBox.querySelector('.slide-item');
		var lastTimeImgBoxSelectBox = lastTimeImgBox.querySelector('.select');
		var lastTimeImgBoxEventName = lastTimeImgBox.querySelector('.event-name');
		var lastTimeImgBoAddEventBtn = lastTimeImgBox.querySelector('.addeventbtn');
		var lastTimeImgBoDelEventBtn = lastTimeImgBox.querySelector('.deleventbtn');
		if (lastTimeImgBoxEventBox.classList.contains('hasevent')) {
			lastTimeImgBoxSelectBox.style.display = 'none';
			lastTimeImgBoxEventName.style.display = 'block';
			lastTimeImgBoDelEventBtn.style.display = 'block';
		} else {
			lastTimeImgBoxSelectBox.style.display = 'none';
			lastTimeImgBoAddEventBtn.style.display = 'block';
		}

		this.selectGroup.destroy();
	}
	var val = null;
	var eventBox = imgbox.querySelector('.slide-item');
	var select = imgbox.querySelector('.select');
	var selectBox = imgbox.querySelector('.select-box');
	select.style.display = 'block';
	var eventid1 = eventBox.getAttribute('data-eventid1');
	var eventname1 = eventBox.getAttribute('data-eventname1');
	var eventid2 = eventBox.getAttribute('data-eventid2');
	var eventname2 = eventBox.getAttribute('data-eventname2');
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

MSlide.prototype.addEventOkBtnHandle = function (eventBox) {
	this.data1 = this.selectGroup.s1.select2('data');
	if (this.selectGroup.h5Path) {
		var h5Path = this.selectGroup.h5Path;
		setAttr(eventBox, 'data-h5', h5Path);
	} else {
		eventBox.removeAttribute('data-h5');
		eventBox.removeAttribute('data-eventname2')
	}
	if (this.selectGroup.s2Id) {
		this.data2 = this.selectGroup.s2.select2('data');
		if (this.data2[0] && this.data2[0].text != '') {
			this.data2[0].name = this.data2[0].text;
		}
	} else {
		this.data2 = null;
	}
	if (this.data1[0].id != '0') {
		eventBox.classList.add('hasevent');
		setAttr(eventBox, 'data-eventid1', this.data1[0].id);
		setAttr(eventBox, 'data-eventname1', this.data1[0].text)
	} else {
		eventBox.classList.remove('hasevent');
		eventBox.removeAttribute('data-eventid1');
		eventBox.removeAttribute('data-eventname1');
	}
	if (this.data2 && this.data2[0] && this.data2[0].id) {
		setAttr(eventBox, 'data-eventid2', this.data2[0].id);
		setAttr(eventBox, 'data-eventname2', this.data2[0].name);
	} else {
		eventBox.removeAttribute('data-eventid2')
		eventBox.removeAttribute('data-eventname2')
		if (this.selectGroup.h5Path) {
			setAttr(eventBox, 'data-eventname2', this.selectGroup.h5PageName);
		}
	}
}


MSlide.prototype.createSlideBox = function () {
	var _this = this;
	var slideItem = this.slidePage.querySelectorAll('.slide-item');
	this.isOkBtnClick = true;
	if (!slideItem.length) return;
	var slideContent = createEle('div');
	var id = new Date().getTime();
	slideContent.id = id;
	slideContent.className = 'swiper-box'
	var swiperContainer = createEle('div');
	swiperContainer.className = 'swiper-container';
	swiperContainer.id = 'swiper_' + id;
	var swiperWrapper = createEle('div');
	swiperWrapper.className = 'swiper-wrapper';

	for (var i = 0; i < slideItem.length; i++) {
		slideItem[i].classList.add('swiper-slide');
		swiperWrapper.appendChild(slideItem[i].cloneNode(true));
	}

	var swiperPagination = createEle('div');
	swiperPagination.className = 'swiper-pagination';

	var close = createEle('i');
	close.className = 'close close_slide';
	setAttr(close, 'data-for', id);
	close.innerHTML = '×';
	close.addEventListener('click', function () {
		var id = this.getAttribute('data-for');
		_this.delSlideBox(id);
	})


	var edit = createEle('i');
	edit.className = 'edit';
	setAttr(edit, 'data-for', id);
	edit.innerHTML = '／';
	edit.addEventListener('click', function () {
		var id = this.getAttribute('data-for');
		_this.editSlideBox(id);
	})

	swiperContainer.appendChild(swiperWrapper);
	swiperContainer.appendChild(swiperPagination);
	slideContent.appendChild(swiperContainer);
	slideContent.appendChild(close);
	slideContent.appendChild(edit);

	var layout = ele('layout')
	//删除之前的轮播组件
	if (this.swiperid) {
		delete window[this.swiperid];
		layout.insertBefore(slideContent,ele(this.swiperid))
		ele(this.swiperid).remove();
		this.swiperid = null;
	}else{
		layout.appendChild(slideContent);
	}

	var options = {};
	options['scrollType'] = this.scrollType;
	if (this.scrollType == 'slide') {
		options['autoplay'] = this.isAutoPlay;
		options['delay'] = this.delay.value;
	}
	setAttr(slideContent, 'data-slideOption', JSON.stringify(options));
	this.newSwipers(id, options);
}

MSlide.prototype.newSwipers = function (id, options) {
	var selector = "#" + ele(id).querySelector('.swiper-container').id;
	if (options.scrollType == 'slide') {
		window[id] = new Swiper(selector, {
			autoHeight: true,
			loop: true,
			autoplay: options.autoplay ? {
				delay: options.delay,
				disableOnInteraction: false,
			} : false,
			pagination: {
				el: '.swiper-pagination',
			},
		})
	} else {
		window[id] = new Swiper(selector, {
			// freeMode: true,
			loop: true,
			loopAdditionalSlides : 2,
			freeModeMinimumVelocity: 0.2,
			slidesPerView: '1.6',
			effect : 'coverflow',
			centeredSlides: true,
			coverflowEffect: {
			  rotate: 50,
			  stretch: 3,
			  depth: 200,
			  modifier: 1,
			  slideShadows : true
			},
		})
	}
}

MSlide.prototype.delSlideBox = function (id) {
	var slideBox = ele(id);
	var slideItemList = slideBox.querySelectorAll('.slide-item');
	var imgIdList = [];
	for (var i = 0; i < slideItemList.length; i++) {
		var imgid = slideItemList[i].getAttribute('data-imgid');
		if (imgIdList.indexOf(imgid) > -1) continue;
		imgIdList.push(imgid);
	}
	this.delUpLoaderImgList(imgIdList);
	slideBox.remove();
	delete window[id];
}

MSlide.prototype.editSlideBox = function (id) {
	this.swiperid = id;
	var slideBox = ele(id);
	var slideOptions = JSON.parse(slideBox.getAttribute('data-slideoption'));
	var slideItemList = slideBox.querySelectorAll('.slide-item');
	for (var i = 0; i < slideItemList.length; i++) {
		var slideItem = slideItemList[i]
		var imgid = slideItem.getAttribute('data-imgid');
		if (this.imgIdList.indexOf(imgid) > -1) continue;
		var file = {};
		var img = slideItem.querySelector('img');
		file['creation'] = true;
		file['imgsrc'] = img.src;
		file['name'] = img.getAttribute('data-name');
		file['id'] = slideItemList[i].getAttribute('data-imgid');

		if (slideItem.classList.contains('hasevent')) {
			file['hasevent'] = true;
			file['eventid1'] = slideItem.getAttribute('data-eventid1');
			file['eventname1'] = slideItem.getAttribute('data-eventname1');
			if (slideItem.getAttribute('data-eventid2')) {
				file['eventid2'] = slideItem.getAttribute('data-eventid2');
				file['eventname2'] = slideItem.getAttribute('data-eventname2');
			}
		}
		this.imgChangeHandle(file);
		this.imgIdList.push(imgid);
	}

	this.scrollType = slideOptions.scrollType;
	for (var i = 0; i < this.scrollTypeInput.length; i++) {
		if (this.scrollTypeInput[i].value == this.scrollType) {
			this.scrollTypeInput[i].checked = true;
		}
	}

	if (slideOptions.scrollType == 'slide') {
		this.autoplay.style.display = 'block';
		this.isAutoPlay = slideOptions.autoplay;
		if (slideOptions.autoplay) {
			ele('autoplay').checked = true;
			this.delayDiv.style.display = 'inline-block';
			this.delay.value = slideOptions.delay;
		}
	} else {
		this.autoplay.style.display = 'none';
	}
	this.openBtn.click();
}

//导入后初始化轮播组件
MSlide.prototype.importInit = function () {
	var _this = this;
	var swiperBoxList = document.querySelectorAll('.swiper-box');
	for (var i = 0; i < swiperBoxList.length; i++) {
		var swiperBoxItem = swiperBoxList[i];
		var id = swiperBoxItem.id;
		var options = JSON.parse(swiperBoxItem.getAttribute('data-slideoption'));
		this.newSwipers(id, options);
		var close = swiperBoxItem.querySelector('.close_slide');
		var edit = swiperBoxItem.querySelector('.edit');
		(function (id) {
			close.addEventListener('click', function () {
				_this.delSlideBox(id);
			})
			edit.addEventListener('click', function () {
				_this.editSlideBox(id);
			})
		})(id)
	}
}