/**
 * 浮动组件
 */

function MFloat(layout){
    this.elements = {
        el:ele('addFloat'),
    }
    this.layout = layout
    this.files = layout.imgUploader.files;
	this.init();
}

MFloat.prototype.init = function(){
    var _this = this;
	//上传图片文件
	this.imgUploader = new plupload.Uploader({
		runtimes: 'html5,flash,silverlight,html4',
		browse_button: _this.elements.el,
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
				_this.imgToView(up, files);
				getOssSign(files);
			},
			Error: function (up, error) {
				up.refresh();
			}
		}
	});
	this.imgUploader.init();
}


MFloat.prototype.imgToView = function (up, files) {
	var _this = this;
	plupload.each(files, function (file) {
		if (file.type == 'image/gif') { //gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
			var fr = new mOxie.FileReader();
			fr.onload = function () {
				file.imgsrc = fr.result;
                var div = _this.layout.createBlock(file, up)
				_this.layout.addImgHandle( div, file, up)
			}
			fr.readAsDataURL(file.getSource());
		} else {
			var preloader = new mOxie.Image();
			preloader.onload = function () {
				var imgsrc = preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
				file.imgsrc = imgsrc;
				preloader.destroy();
				preloader = null;
                var div = _this.layout.createBlock(file, up)
                div = _this.setFloatDiv(div)
				_this.layout.addImgHandle( div, file, up)
			};
			preloader.load(file.getSource());
        }
        _this.files.push(file);
    });
    console.log(this.layout.imgUploader.files)
}

MFloat.prototype.setFloatDiv = function (div){
    var floatResize = createEle('span');
    var floatMove = createEle('span');
    floatResize.className = 'float-resize';
    floatMove.className = 'float-move';
    setAttr(floatResize, 'data-hasEvent', true);
    setAttr(floatResize, 'data-handleName', 'resizeFloatBox');
    setAttr(floatMove, 'data-hasEvent', true);
    setAttr(floatMove, 'data-handleName', 'moveFloatBox');
    div.appendChild(floatResize);
    div.appendChild(floatMove);
    this.layout.bindEvent(div, 'mousedown', this.layout.onMouseDown);
    setAttr(div, 'data-isfloat', true)
    div.classList.add('float-block');
    div.style.position = 'absolute';
    div.style.width = '50%';
    div.style.left = '0';
    div.style.top = '0';
    div.style.zIndex = 99999;
    return div
}
