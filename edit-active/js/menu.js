function Menu(id) {
	this.name = 'Menu';
	this.contBox = ele(id);
	this.ok = ele('ok');
	this.cancel = ele('cancel');
	this.eventName = document.getElementById('eventName');

	var _this = this;

	//关闭弹窗回调
	popup.popupCloseCallbackHandle[this.name] = function(){
		_this.close();
	}

	//确定按钮回调
	popup.okClickHandle[this.name] = function(){
		_this.okBtnFun();
	}
}

Menu.prototype.close = function () {
	this.selectGroup.destroy();
	console.log('添加事件弹窗关闭')
}

Menu.prototype.okBtnFun = function(){
	this.data1 = this.selectGroup.s1.select2('data');
	if (this.selectGroup.h5Path) {
		var h5Path = this.selectGroup.h5Path;
		setAttr(this.span, 'data-h5', h5Path);
	} else {
		this.span.removeAttribute('data-h5');
		this.span.removeAttribute('data-eventname2')
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
		this.span.className = 'hasevent'
		setAttr(this.span, 'data-eventid1', this.data1[0].id);
		setAttr(this.span, 'data-eventname1', this.data1[0].text)
	} else {
		this.span.className = ''
		this.span.removeAttribute('data-eventid1')
		this.span.removeAttribute('data-eventname1')
	}
	if (this.data2 && this.data2[0] && this.data2[0].id) {
		setAttr(this.span, 'data-eventid2', this.data2[0].id);
		setAttr(this.span, 'data-eventname2', this.data2[0].name);
	} else {
		this.span.removeAttribute('data-eventid2')
		this.span.removeAttribute('data-eventname2')
		if (this.selectGroup.h5Path) {
			setAttr(this.span, 'data-eventname2', this.selectGroup.h5PageName);
		}
	}
}

Menu.prototype.open = function (span) {
	var _this = this;
	var val = null;
	this.eventid1 = span.getAttribute('data-eventid1');
	this.eventname1 = span.getAttribute('data-eventname1');
	this.eventid2 = span.getAttribute('data-eventid2');
	this.eventname2 = span.getAttribute('data-eventname2');
	if (this.eventid1) {
		val = {
			data1: {
				id: _this.eventid1,
				text: _this.eventname1
			}
		}
		if (_this.eventid2) {
			val['data2'] = {
				id: _this.eventid2,
				name: _this.eventname2
			}
		}
	}
	this.selectGroup = new SelectGroup(this.contBox, val);
	this.span = span;

	if (this.selectGroup.input && this.span.getAttribute('data-h5')) {
		this.selectGroup.input.value = this.selectGroup.h5Path = this.span.getAttribute('data-h5');
		this.selectGroup.h5PageName = this.span.getAttribute('data-eventname2');
	};

	window.popup.open({
		name: _this.name,
		id: '#eventMenu',
		title:'添加事件',
		callback: function () {
			console.log('添加事件弹窗弹出')
		}
	});

	// this.contBox.style.display = 'flex';
	// this.contBox.style.display = '-webkit-flex';
}