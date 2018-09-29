
function Popup(id){
	this.popupBox = document.getElementById(id);
	this.container = this.popupBox.querySelector('.c-container');
	this.popupCloseCallbackHandle = {};
	this.okClickHandle = {};
	this.okBtn = this.container.querySelector('#popupOkBtn');
	this.cancelBtn = this.container.querySelector('#popupCancelBtn');
	this.popupTitle = this.container.querySelector('.title');
}

Popup.prototype.init = function (){
	var _this = this;
	this.models = this.container.querySelectorAll('.c-content');
	this.shade = this.popupBox.querySelector('.c-shade');
	this.shade.addEventListener('click', function (){
		_this.close();
	})

	this.okBtn.addEventListener('click', function (){
		_this.okBtnCallback();
	})
	this.cancelBtn.addEventListener('click', function (){
		_this.close();
	})
	// this.open('.add-slide');
	return this;
}


Popup.prototype.open = function (obj){
	this.container.style.width = obj.width||'300px';
	this.container.style.height = obj.height||'200px';
	this.popupTitle.innerText = obj.title||'提示';
	this.modelBox = this.container.querySelector(obj.id);
	this.popupBox.classList.add('show');
	this.modelBox.classList.add('show');
	this.caller = obj.name;
	var _this = this;
	setTimeout(function(){
		_this.popupBox.classList.add('in');
	},100);
	obj.callback();
}

//弹窗关闭
Popup.prototype.close = function (){
	this.popupBox.classList.remove('in');
	var _this = this;
	setTimeout(function(){
		_this.popupBox.classList.remove('show');
		_this.modelBox.classList.remove('show');
	},100);

	//执行关闭弹窗的回调队列中的方法。
	this.popupCloseCallback();
}

Popup.prototype.callback = function(callback){
	if(callback instanceof Array){
		for(var i=0; i<callback.length; i++){
			callback[i]();
		}
	}
	if(callback instanceof Function){
		callback();
	}
}

Popup.prototype.okBtnCallback = function(){
	var callback = this.okClickHandle[this.caller];
	this.callback(callback);
	this.close();
}

Popup.prototype.popupCloseCallback = function(){
	var callback = this.popupCloseCallbackHandle[this.caller];
	this.callback(callback);
}




