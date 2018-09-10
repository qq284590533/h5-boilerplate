$(function () {
	window.onload = function () {
		$.ajax({
			url: "js/data.js",
			type: "get",
			data: {},
			dataType: "json",
			success: function (data) {
				for (var i = 0; i < data.length; i++) {
					if (data[i].key != 'table') {
						// 不含有表格的时候
						var str = '<li key=' + data[i].key + '><span>' + data[i].value + '</span><b></b><p class="fill-data">' +
							data[i].key + '</p></li>'
						$('.tab_classify').append(str);
					} else {
						for (var j = 0; j < data[i].table.length; j++) {
							$('.table_list').append('<p key=' + data[i].table[j].value + '>' + data[i].table[j].value + '</p>');
						}
					}
				}
				
				// 数据请求成功之后执行点击事件
				// 初始化表格的时候，点击表格的列表项目，将选中的table列表项追加到表格里面选中表格里面需要添加的项目
				$(".table_list p").mousedown(function (event) {
					// 选中table的列表项样式
					console.dir($(this));
					if ($(this)[0].className == '') {
						$(this)[0].className = 'selected';
					} else {
						$(this)[0].className = '';
					}

					// 表格添加数据
					var arrList = $(".table_list")[0]; // 每次移动的时候，$(".table_list")都会加1 
					var str = '';
					var std = '';
					var stdNum = '';
					for (var i = 0; i < arrList.children.length; i++) {
						if (arrList.children[i].className == 'selected') {
							str = str + '<td key=' + $(arrList.children[i]).attr('key') + '>'+arrList.children[i].innerHTML+'</td>';
							std = std + '<td><input disabled="disabled" class="fill-data" type="text" value='+$(arrList.children[i]).attr('key')+'></td>';
							stdNum = stdNum + '<td><input disabled="disabled" class="fill-data" type="text" value='+$(arrList.children[i]).attr('key')+'></td>';
						}
					}
					str = '<tr>' + str + "</tr>";
					std = '<tr>' + std + "</tr>";
					stdNum = '<tr>' + stdNum + "</tr>";
					$('.table-grid')[0].innerHTML = str + std + stdNum;
				});
			}
		})
	}
	$(document).on('click', '.tab_list p.table_list_name', function (e) {
		var table_list_name = $(this).next();

		if (table_list_name.css('display') == 'none') {
			table_list_name.show();
			$(this)[0].className = 'table_list_name';
		} else {
			table_list_name.hide();
			$(this)[0].className = 'table_list_name' + ' table_name_right';
		}
	});

	// 表格的收起与展开
	$(".table_name").mousedown(function (event) {
		var table_list_toggle = $(this).next().next();
		if (table_list_toggle.css('display') == 'none') {
			table_list_toggle.show();
			$(this)[0].className = 'table_name';
		} else {
			table_list_toggle.hide();
			$(this)[0].className = 'table_name' + ' table_name_right';
		}

	});



	// 点击加号,追加填充文本
	$(document).on('click', '.add img', function () {
		var str_content = '<ul class="content"></ul>';
		$('.content_list').append(str_content)
	});

	// 删除拖拽过来的元素
	$(document).on('click', '.content_list li b', function () {
		console.dir($(this).parent());
		// 如果只.content里面只有一个元素,把li元素一起删除
		if ($(this).parent().parent().children('li').length == 1) {
			$(this).parent().parent().remove();
		} else {
			$(this).parent().remove();
		}
		
	});


	// 点击保存按钮

// 	$(document).on('click', '.save-all .save', function () {
// 		// 获取所有的li
// 				var allSaveLiData = $('.content_list ul.content li');
// 				// 获取所有li里面的key属性值
// 				var saveAttrArr = [];  // 获取除了表格和输入框之外的key
// 				var tableSaveArr = []; // 获取表格的key
// 				for (var i = 0; i < allSaveLiData.length; i++) {
// 					var obj = {};
// 					obj.key = $(allSaveLiData[i]).attr("key");
// 					if($(allSaveLiData[i]).children('.fill-data').length>0){
// 						obj.value = $(allSaveLiData[i]).children('.fill-data').text();
// 					}else{
// 						obj.value = $(allSaveLiData[i]).children('input').val();
// 					}
// 					saveAttrArr.push(obj);
// 					// 获取表格里面选择的选项
// 					if ($(allSaveLiData[i]).attr("key") == 'table') {
// 						var tableSelectedData = $(allSaveLiData[i]).children('.table_list').children('p.selected');
// 						for (var j = 0; j < tableSelectedData.length; j++) {
// 							var objTable = {};
// 							objTable.key = $(tableSelectedData[j]).attr('key')
// 							tableSaveArr.push(objTable);
// 						}
// 						obj.table = tableSaveArr;
// 					}
// 					
// 				}
// 				console.dir(saveAttrArr);
// 		// 		console.dir(tableSaveArr);
// 		
// 		
// 				// 判断是不是有输入框,有的话,像数组中添加value,
// 		// 		for (var k = 0; k < allSaveNoRepeatData.length; k++) {
// 		// 			// 如果需要添加多个输入框的时候,只要key值不同,都可以
// 		// 			if ($($('.content li')[k]).attr('key') == allSaveNoRepeatData[k].key) {
// 		// 				allSaveNoRepeatData[k].value = $($('.content li')[k]).children('.fill-data').val();
// 		// 			}
// 		// 
// 		// 		}
// 		
// 		
// 				// 怎么填充数据  将$(allSaveLiData[i]).attr("key")
// 				// 只填充到li里面包含fill-data的数据
// 				for (var i = 0; i < allSaveLiData.length; i++) {
// 					if ($(allSaveLiData[i]).attr("key") == $($('.content li')[i]).attr('key')) {
// 						if ($($('.content li')[i]).children('.fill-data').length>0) {
// 		// 					$($('.content li')[i]).children('.fill-data').val($(allSaveLiData[i]).attr("key")+1)
// 						}
// 						
// 						// 头部和描述
// 		// 				if($($('.content li')[i]).children('.description').length>0) {
// 		// 					$($('.content li')[i]).children('.description').text($(allSaveLiData[i]).attr("key")+1)
// 		// 				}
// 		// 				if($($('.content li')[i]).children('h2').length>0) {
// 		// 					$($('.content li')[i]).children('h2').text($(allSaveLiData[i]).attr("key")+1)
// 		// 				}
// 						
// 					}
// 				}
// 				// 点击保存按钮填充table表格数据的时候
// 				
// 				
// 				//  还没想好怎么保存input数据
// 				
// 				
// 				// 点击保存按钮的时候,显示标题，显示描述 ，隐藏input输入框
// 				for(var i=0; i<$('.content_list ul li.input_box input').length; i++) {
// 					$($('.content_list ul li.input_box input')[i]).css('display','none');
// 				}
// 				$($('.content_list ul li.input_box h2')).css('display','block');
// 				$($('.content_list ul li.input_box label')).css('display','block');
// 	});
	
	$(document).on('click', '.save-all .save', function () {
		// content循环,所以先获取content里面的数据
		var contentList = $('.content_list .content');
		var contentListArr = [];
		// 循环所有的content
		for(var i=0;i<contentList.length;i++) {
			var contentItemsList = $(contentList[i]);
			// 循环content里面的li
			var contentItemList = $(contentList[i]).children('li');
			var contentItemListArr = [];
			for(var j=0;j<contentItemList.length;j++) {
				var obj = {};
				obj.key = $(contentItemList[j]).attr('key');
				// 除了input和table之外的元素添加value值,
				if($(contentItemList[j]).children('p.fill-data').length>0) {
					obj.value = $(contentItemList[j]).children('p.fill-data').text();
				}
				// 添加name数值，
				if($(contentItemList[j]).children('span').length>0) {
					obj.name = $(contentItemList[j]).children('span').text();
				}
				// 判断输入框,如果是可以输入的,输入框value值
				if(obj.key == 'input_text'||obj.key=='input_info'||obj.key=='input_title') {
					obj.value = $(contentItemList[j]).children('input').val();
				}
				// 判断表格，添加表格数组
				if(obj.key == 'table') {
					obj.table = [];
					var tableSaveArr=[];
					var tableSelectedData = $(contentItemList[j]).children('.table_list').children('p.selected');
					for (var k = 0; k < tableSelectedData.length; k++) {
						var objTable = {};
						objTable.key = $(tableSelectedData[k]).attr('key');
						objTable.name = $(tableSelectedData[k]).text();
						objTable.value = $(tableSelectedData[k]).attr('key')+1;
						tableSaveArr.push(objTable);
					}
					obj.table = tableSaveArr;
					
				}
				contentItemListArr.push(obj);
			}
			contentListArr.push(contentItemListArr);
		}
		console.dir(contentListArr);
		console.dir(JSON.stringify(contentListArr));
		localStorage.setItem('contentListArr', JSON.stringify(contentListArr))
	})
	
});
