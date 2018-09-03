var uploader ;
var ossParams = {
	host:"",
	accessid : '',
	accesskey : '',
	policyBase64 : '',
	signature : '',
	key:''
}

var signParams = {
	fileServerUrl:"",
	fileName :"",
	type : "1",
};

var fileJson = {};

function initPlupload(){
	uploader = new plupload.Uploader({
		runtimes : 'html5,flash,silverlight,html4',
		browse_button : 'upload',
		url : 'http://oss.aliyuncs.com',
		container: document.getElementById('container'),
		filters: {
			mime_types : [
				{
					title: "html files",
					extensions: "html"
				}
			],
			max_file_size : '5mb', //最大只能上传10mb的文件
			prevent_duplicates : false //不允许选取重复文件
		},
		init: {
			PostInit: function() {//上传初始化的操作函数
				document.getElementById('ossfile').innerHTML = '';
			},
			FilesAdded: function(up, files) { 			//文件上传前，就是打开文件对话框，选好文件之后触发
				getOssSign(files); 						//上传添加文件后的操作函数
				ossUploadAddedAction(up, files);
			},
			BeforeUpload: function(up, file) {			//上传之前的操作函数
				ossBeforeUploadAction(up, file);
			},
			UploadProgress: function(up, file) {		//上传过程中的操作函数
				ossUploadProgressAction(up, file);
			},
			FileUploaded: function(up, file, info) {	//上传之后的操作函数
				fileSucesse(file)
				uploader.refresh();
			},
			Error: function(up, error) {
				uploader.refresh();
			}
		}
	});
	uploader.init();
}

function fileSucesse(file){
	console.log('文件上传成功访问地址：'+signParams.fileServerUrl);
	// console.log(file)
	var id = file.id;
	var p = document.createElement('p');
	p.innerHTML = "上传成功！访问地址：<a href="+fileJson[id]+" target='_black'>"+fileJson[id]+"</a>"
	document.getElementById(id).appendChild(p);
}

function getOssSign(files){
	$.ajax({ //异步请求返回给后台
		// url: 'https://owneradmintest.tticar.com/oss/getSign',
		url: 'https://owneradmin.tticar.com/oss/getSign',
		type: 'post',
		async : false,
		data: {
			'ossPathDir':'h5-activity/'
		},
		success: function (data) {
			var code = data.code;
			if(code == 0){
				var result = data.data;
				ossParams["host"] =result.host;
				ossParams["key"] =result.dir;
				ossParams["policyBase64"] =result.policy;
				ossParams["accessid"] =result.accessid;
				ossParams["signature"] =result.signature;
			}else{
				console.log("获取oss签名失败");
			}
		},
		complete: function () {
		},
	});
	return true;
}

function ossUploadAddedAction(up, files) {
	plupload.each(files, function(file) {
		document.getElementById('ossfile').innerHTML = '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
			+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
			+'</div>';
		fileJson[file.id]
	});
	uploader.start();
}

function ossBeforeUploadAction(up, file) {
	var objectName = calculate_object_name(file);
	var new_multipart_params = {
		'key' : objectName,
		'policy': ossParams["policyBase64"],
		'OSSAccessKeyId': ossParams["accessid"],
		'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
		'signature': ossParams["signature"],
	};
	up.setOption({
		'url': ossParams["host"],
		'multipart_params': new_multipart_params
	});
	up.start();

}

function calculate_object_name(file){
	var g_object_name = ossParams["key"]+file.name;
	if(ossParams["host"]=="https://tticar-pro.oss-cn-shanghai.aliyuncs.com/"){
		signParams.fileServerUrl = "https://f.tticar.com/"+ g_object_name;
	}else{
		signParams.fileServerUrl = ossParams["host"]+ g_object_name;
	}
	signParams.fileName = g_object_name;
	fileJson[file.id] = signParams.fileServerUrl;
	return g_object_name;
}

// 上传百分比
function ossUploadProgressAction(up, file) {
	var d = document.getElementById(file.id);
	d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
	var prog = d.getElementsByTagName('div')[0];
	var progBar = prog.getElementsByTagName('div')[0];
	progBar.style.width= 2*file.percent+'px';
	progBar.setAttribute('aria-valuenow', file.percent);
}