var imgUploader, editor, jsonData;
jsonData = {
    filePath: null,
    imgNumOld: 0,
    imgNumNow: 0
}

function editInit() {
    var E = window.wangEditor;
    editor = new E('#editBox');
    editor.customConfig.zIndex = 100;
    editor.customConfig.uploadImgShowBase64 = true;
    editor.customConfig.onchangeTimeout = 600;
    editor.customConfig.onchange = function () {
        eidtOnChange(editor, upload);
    }
    editor.customConfig.menus = [
        'head', // 标题
        'bold', // 粗体
        'fontSize', // 字号
        'fontName', // 字体
        'italic', // 斜体
        'underline', // 下划线
        'foreColor', // 文字颜色
        'link', // 插入链接
        'list', // 列表
        'justify', // 对齐方式
        'image', // 插入图片
        'table', // 表格
        'undo', // 撤销
        'redo' // 重复
    ]
    editor.create();
    editor.menu = new Menu('eventMenu');
    imgUploader = imgUploadInit(editor);

    return editor;
}


// 初始化七牛上传的方法
function imgUploadInit(editor) {
    // 获取相关 DOM 节点的 ID
    var btnId = editor.imgMenuId;
    // 创建上传对象
    console.log(btnId)
    var imguploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,html4',
        browse_button: btnId,
        url: 'http://oss.aliyuncs.com',
        container: document.getElementById('editBox'),
        multi_selection: false,
        filters: {
            mime_types: [{
                title: "Image files",
                extensions: "jpg,gif,png"
            }],
            max_file_size: '5mb',
            prevent_duplicates: false
        },
        init: {
            PostInit: function () {

            },
            FilesAdded: function (up, files) {
                creatBase64Img(editor, files, up)
                getOssSign(files)
            },
            BeforeUpload: function (up, file) {
                ossBeforeUploadAction(up, file, jsonData);
            },
            UploadProgress: function (up, file) {

            },
            FileUploaded: function (up, file, info) {
                up.refresh();
            },
            Error: function (up, error) {
                up.refresh();
            }
        }
    });
    imguploader.init()
    return imguploader;
}

//上传html文件
var htmlUploader = new plupload.Uploader({
    runtimes: 'html5,flash,silverlight,html4',
    browse_button: 'upload',
    url: 'http://oss.aliyuncs.com',
    container: document.getElementById('container'),
    filters: {
        mime_types: [{
            title: "html files",
            extensions: "html"
        }],
        max_file_size: '5mb',
        prevent_duplicates: false
    },
    init: {
        PostInit: function () {

        },
        FilesAdded: function (up, files) {
            getOssSign(files)
            ossUploadAddedAction(up, files);
        },
        BeforeUpload: function (up, file) {
            ossBeforeUploadAction(up, file);
        },
        UploadProgress: function (up, file) {
            ossUploadProgressAction(up, file);
        },
        FileUploaded: function (up, file, info) {
            fileSucesse(file)
            up.refresh();
        },
        Error: function (up, error) {
            up.refresh();
        }
    }
});
htmlUploader.init();

function creatBase64Img(editor, files, up) {
    plupload.each(files, function (file) {
        if (file.type == 'image/gif') {
            var fr = new mOxie.FileReader();
            fr.onload = function () {
                file.imgsrc = fr.result;
                editor.cmd.do('insertHtml', '<img id=' + file.id + ' src="' + file.imgsrc + '"data-isnew=true data-name=' + file.name + ' style="max-width:100%;"/>');


                jsonData.imgNumOld = jsonData.imgNumNow;
                jsonData.imgNumNow++;
            }
            fr.readAsDataURL(file.getSource());
        } else {
            var preloader = new mOxie.Image();
            preloader.onload = function () {
                var imgsrc = preloader.getAsDataURL();
                file.imgsrc = imgsrc;
                editor.cmd.do('insertHtml', '<img id=' + file.id + ' src="' + file.imgsrc + '"data-isnew=true data-name=' + file.name + ' style="max-width:100%;"/><p><br></p>')
                jsonData.imgNumOld = jsonData.imgNumNow;
                jsonData.imgNumNow++;
                preloader.destroy();
                preloader = null;
            };
            preloader.load(file.getSource());
        }
        console.log(document.getElementById(file.id))
    });
}

function eidtOnChange(editor, up) {
    ele('content').innerHTML = editor.txt.html();
    var imgFile = [];
    //删除图片时修改上传图片列表
    var imgs = ele('content').querySelectorAll('img[data-isnew=true]');
    jsonData.imgNumNow = imgs.length;
    addEventFun();
    if (jsonData.imgNumNow <= jsonData.imgNumOld) {
        jsonData.imgNumOld = jsonData.imgNumNow;
        jsonData.imgNumOld--;
        // console.log(jsonData)



        imgs.forEach(function (item) {
            for (var i = 0; i < imgUploader.files.length; i++) {
                if (imgUploader.files[i].id == item.id) {
                    imgFile.push(imgUploader.files[i]);

                }
            }
        })
        imgUploader.files = imgFile;
        // console.log(imgUploader.files)
    }
}

ele('createHtml').addEventListener('click', function () {
    createHtml(jsonData);
})

ele('importHtml').addEventListener('click', function () {
    ele('selectHtml').click();
})

function addEventFun (){
    var wetextImgs = document.querySelector('.w-e-text').querySelectorAll('img');
    console.log(wetextImgs)
    wetextImgs.forEach(function (item) {
        (function (item) {
            var hasclickhandle = item.getAttribute('data-clickhandle');
            if (hasclickhandle!='true') {
                setAttr(item, 'data-clickhandle', 'true');
                item.addEventListener('contextmenu', function (e) {
                    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
                    e.stopPropagation();
                    editor.menu.open(item);
                })
                item.addEventListener('mouseover', function () {
                    var eventname = document.getElementById('eventName');
                    var text1 = item.getAttribute('data-eventname1');
                    var text2 = item.getAttribute('data-eventname2');
                    if (text1) {
                        eventname.innerHTML = text1
                        if (text2) {
                            eventname.innerHTML += ' → ' + text2;
                        }
                    }
                })
                item.addEventListener('mouseout', function () {
                    var eventname = document.getElementById('eventName');
                    eventname.innerHTML = ''
                })
            }
        })(item)
    })
}

//选择HTML文件
function htmlChange() {
    var iframe = document.createElement('iframe');
    var file = ele('selectHtml').files.item(0),
        url = window.URL.createObjectURL(file);
    iframe.style.display = 'none';
    iframe.src = url;
    if (iframe.attachEvent) {
        iframe.attachEvent("onload", function () {
            var html = iframe.contentWindow.document.getElementById('content').innerHTML;
            editor.txt.html(html)
            editor.change()
            iframe.remove();
        });
    } else {
        iframe.onload = function () {
            var html = iframe.contentWindow.document.getElementById('content').innerHTML;
            editor.txt.html(html)
            editor.change()
            iframe.remove();
        };
    }
    document.body.appendChild(iframe);
    ele('selectHtml').value = null;
}

function createHtml(jsonData) {
    var name = document.getElementById('fileName').value;
    var title = document.getElementById('titleName').value;
    name = trim(name, 'g');
    if (name == '' || title == '') {
        alert('文件名或标题不能为空！')
        return
    }
    var htmlfoot = '<div id="browser"></div><script>function urlJson(){var href=window.location.href;var ksbz=href.indexOf("?");var hrefStr=href.substr(ksbz+1);var splitStr=hrefStr.split("&");var urlObj={};for(var i=0;i<splitStr.length;i++){urlObj[splitStr[i].split("=")[0]]=splitStr[i].split("=")[1]}return urlObj}window.onload=function(){var urlObj=urlJson();var isShare=urlObj.isShare||false;var browser=document.getElementById("browser");browser.addEventListener("click",function(){this.style.display="none"});function is_weixn_qq(){var ua=navigator.userAgent.toLowerCase();if(ua.match(/MicroMessenger/i)=="micromessenger"||ua.match(/QQ/i)=="qq"){return true}return false}var spanList=document.querySelectorAll(".hasevent");for(var i=0;i<spanList.length;i++){var item=spanList[i];(function(item){item.addEventListener("click",function(e){var id1=item.getAttribute("data-eventid1");var id2=item.getAttribute("data-eventid2");id=id1;if(isShare=="true"){if(is_weixn_qq()){browser.style.display="block";return}else{if(id=="2"){window.location.href=this.getAttribute("data-h5");return}}}if(id=="2"){window.location.href="tticarstorecall://"+id+"/"+this.getAttribute("data-h5");return}if(id2){id=id1+"/"+id2}window.location.href="tticarstorecall://"+id})})(item)}};</script></body></html>'

    var htmlhead = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>' + title + '</title><style>*{box-sizing: border-box;padding: 0;margin: 0;}html{height: 100%;}body{height: 100%;padding: 0;margin: 0;}#content {padding: 20px 10px;}#content p,#content h3,#content h4,#content h5,#content h6,#content h2,#content h1{margin: 10px 0;line-height: 1.5;}#content table{border-top: 1px solid #ccc;border-left: 1px solid #ccc;}#content table td, #content table th {border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;padding: 3px 5px;}#browser{position: fixed;z-index: 1;top: 0;left: 0;display: none;width: 100%;height: 100%;background-image: url(https://f.tticar.com/h5-activity/browser/browser.png);background-size: cover}</style></head><body>'

    var filename = name + '.html'
    var htmlbody = document.getElementById('pageView').cloneNode(true);

    var imgs = htmlbody.querySelectorAll('img[data-isnew=true]');

    var imgsHasEvent = htmlbody.querySelectorAll('img[data-clickhandle]');
    imgsHasEvent.forEach(function(item){
        setAttr(item, 'data-clickhandle', false);
    })
    
    imgs.forEach(function (item) {
        item.src = "https://f.tticar.com/h5-activity/" + name + '\/' + item.getAttribute('data-name');
        setAttr(item, 'data-isnew', false);
    })

    htmlbody = htmlbody.innerHTML;
    var html = htmlhead + htmlbody + htmlfoot;
    jsonData.filePath = name;
    imgUploader.start();
    funDownload(html, filename);
    htmlbody = null;
}