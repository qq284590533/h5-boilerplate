function SelectGroup(content, vals) {
	this.id = null;
	this.size = 30;
	this.url_1 = 'http://tt1128.tticar.com/dict/dictvals/ad_new_event';
	this.url_2 = 'http://tt1128.tticar.com/ad/new/for/select/';
	this.s1Id = null;
	this.s2Id = null;
	this.vals = vals;
	this.h5Path = '';
	this.h5PageName = '';
	this.init(content);
}

SelectGroup.prototype.init = function (content) {
	var _this = this;
	var select = document.createElement('select');
	this.s1Id = new Date().getTime();
	select.id = this.s1Id;
	// select.innerHTML = '<option value="" selected = "selected">请选择…</option>';
	this.s1 = $(select);
	this.getData(this.url_1, {})
	content.appendChild(select);
	this.s1.select2({
		theme: "classic",
		width: '100%',
		data: _this.data,
		templateSelection: function (item) {
			// debugger
			console.log(item)
			if (!item.id) return item.text;

			if (item.id == '2') {
				console.log('h5')
				// var reg = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;
				_this.input = document.createElement('input');
				_this.input.type = 'text';
				_this.input.id = 'h5Path';
				_this.input.placeholder = '请输入h5页面网址';
				content.appendChild(_this.input);
				_this.input.addEventListener('blur', function () {
					// console.log(reg.test(this.value));
					var pathArr = this.value.split('/');
					_this.h5PageName = decodeURI(pathArr[pathArr.length-1].split('.')[0]);
					_this.h5Path = this.value;
				})
			} else {
				_this.h5Path = '';
				if(_this.input){
					_this.input.remove();
				}
			}

			_this.getData(_this.url_2 + item.id, {})
			if (_this.data && _this.data.length > 0) {
				if (_this.s2Id) {
					_this.s2.select2('destroy');
					document.getElementById(_this.s2Id).remove();
				}
				var select = document.createElement('select');
				if (_this.vals && _this.vals.data2 && _this.vals.data2.id) {
					select.innerHTML = '<option title="initValue" value="' + _this.vals.data2.id + '" selected = "selected">' + _this.vals.data2.name + '</option>';
				} else {
					select.innerHTML = '<option value="" selected = "selected">请选择…</option>';
				}
				content.appendChild(select);
				_this.s2Id = new Date().getTime();
				select.id = _this.s2Id;
				_this.s2 = $(select);
				_this.s2.select2({
					placeholder: "",
					allowClear: true,
					theme: "classic",
					width: '100%',
					ajax: {
						url: _this.url_2 + item.id,
						data: function (params) {
							if (params.term == '') {
								return {};
							}
							return {
								q: params.term,
								page: params.page,
								length: _this.size
							}
						},
						processResults: function (data, params) {
							params.page = params.page || 1;
							return {
								results: data.items,
								pagination: {
									//加载更多
									// more: (params.page * 30) < data.total_count
								}
							}
						}
					},
					templateResult: function (_item) {
						if (_item.mainPic && _item.mainPic != '') {
							var $state = $('<span><img src="https://f.tticar.com/' + _item.mainPic + '" class="img-flag" /> ' + _item.name + '</span>');
							return $state;
						}
						return _item.name;
					},
					templateSelection: function (_item) {
						if (_this.vals && _this.vals.data2 && _this.vals.data2.id) {
							var name = _this.vals.data2.name;
							_this.vals.data2 = null;
							return name;
						}
						if (_item.id === '') {
							return '请选择…'
						}
						if (_item.title == 'initValue') {
							select.innerHTML = '<option value="" selected = "selected">请选择…</option>';
							return '请选择…'
						}
						return _item.name;
					},
				})
				if (_this.vals && _this.vals.data2) {
					var option = new Option(_this.vals.data2.name, _this.vals.data2.id, true, true);
					_this.s2.append(option)
					_this.s2.val(_this.vals.data2.id).trigger("change");
				}
			} else {
				if (_this.s2) {
					_this.s2.select2();
					_this.s2.select2('destroy');
					document.getElementById(_this.s2Id).remove();
					_this.s2Id = null;
				}
			}
			return item.text
		}
	})
	if (!this.vals) return;
	this.s1.val(this.vals.data1.id).trigger("change");
}
SelectGroup.prototype.destroy = function () {
	this.s1.select2('destroy');
	document.getElementById(this.s1Id).remove();
	if (this.input) {
		this.input.remove();
		this.h5Path = '';
		this.h5PageName = '';
	}
	if (this.s2Id) {
		this.s2.select2('destroy');
		document.getElementById(this.s2Id).remove();
	}
}

SelectGroup.prototype.getData = function (url, data) {
	var _this = this;
	$.ajax({
		async: false,
		type: 'get',
		url: url,
		data: data,
		success: function (res) {
			if (res.success && !res.success) {
				_this.data = null;
				return;
			}
			if (res.result) {
				_this.data = res.result
			} else {
				_this.data = res.items;
			}
		}
	})
}