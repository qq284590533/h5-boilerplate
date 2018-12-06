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

function fileSucesse(file){
	console.log('文件上传成功访问地址：'+signParams.fileServerUrl);
	var id = file.id;
	var p = document.createElement('p');
	p.innerHTML = "上传成功！访问地址：<a href="+fileJson[id]+" target='_black'>"+fileJson[id]+"</a>"
	document.getElementById(id).appendChild(p);
}

function imgfileSucesse(file){
	console.log('文件上传成功访问地址：'+signParams.fileServerUrl);
}

function getOssSign(layout){
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

function ossUploadAddedAction(up, files, curindex) {
	plupload.each(files, function(file) {
		document.getElementById('ossfile').innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
			+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
			+'</div>';
	});
	up.start();
}

function ossBeforeUploadAction(up, file, layout) {
	var objectName = calculate_object_name(file,layout);
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

function calculate_object_name(file,layout){
	var filePath;
	if(file.type=="text/html"){
		filePath = file.name.slice(0,-5)+'\/';
	}else{
		filePath = layout.filePath+'\/';
	}
	var g_object_name = ossParams["key"]+filePath+file.name;
	if(ossParams["host"]=="https://tticar-pro.oss-cn-shanghai.aliyuncs.com/"){
		signParams.fileServerUrl = "https://f.tticar.com/"+ g_object_name;
	}else{
		signParams.fileServerUrl = ossParams["host"]+ g_object_name;
	}
	signParams.fileName = g_object_name;
	fileJson[file.id] = signParams.fileServerUrl;
	console.log(signParams.fileServerUrl)
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