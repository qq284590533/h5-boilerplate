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

function trim(str, is_global) {
	var result;
	result = str.replace(/(^\s+)|(\s+$)/g, "");
	if (is_global.toLowerCase() == "g") {
		result = result.replace(/\s/g, "");
	}
	return result;
}

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
