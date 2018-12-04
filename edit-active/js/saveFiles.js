function saveFile(file){
	var filesJson = window.localStorage.getItem('filesJson');
	var fileItem = JSON.stringify(file);
	if(filesJson){
		filesJson[file.id] = fileItem
	}else{
		filesJson = new Object();
	}
	window.localStorage.setItem('filesJson',filesJson)
}