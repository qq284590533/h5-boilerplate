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
							console.dir($('.table_list'));
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
							str = str + '<td key=' + $(arrList.children[i]).attr('key') + '>' + arrList.children[i].innerHTML +
								'</td>';
							std = std + '<td>' + $(arrList.children[i]).attr('key') + '</td>';
							stdNum = stdNum + '<td>' + $(arrList.children[i]).attr('key') + '</td>';
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

	$(document).on('click', '.save-all img', function () {
		// 获取所有的li
		var allSaveLiData = $('.content_list ul.content li');
		// 获取所有li里面的key属性值
		var saveAttrArr = [];
		var tableSaveArr = [];
		for (var i = 0; i < allSaveLiData.length; i++) {
			saveAttrArr.push($(allSaveLiData[i]).attr("key"));
			// 获取表格里面选择的选项
			if ($(allSaveLiData[i]).attr("key") == 'table') {
				var tableSelectedData = $(allSaveLiData[i]).children('.table_list').children('p.selected');
				for (var j = 0; j < tableSelectedData.length; j++) {
					tableSaveArr.push($(tableSelectedData[j]).attr('key'));
				}
			}
		}
		// 查找获取所有的元素li的key,去重
		var allSaveNoRepeatData = selectArrCount(saveAttrArr);

		// 将表格里面选择的选项push到saveAttrArr里面table数组里面
		for (var j = 0; j < allSaveNoRepeatData.length; j++) {
			if (allSaveNoRepeatData[j].key == 'table') {
				allSaveNoRepeatData[j].table = selectArrCount(tableSaveArr);
			}
		}

		// 判断是不是有输入框,有的话,像数组中添加value,
		for (var k = 0; k < allSaveNoRepeatData.length; k++) {
			// console.dir($($('.content li')[k]).attr('key'));
			// 如果需要添加多个输入框的时候,只要key值不同,都可以
			if ($($('.content li')[k]).attr('key') == allSaveNoRepeatData[k].key) {
				allSaveNoRepeatData[k].value = $($('.content li')[k]).children('input').val();
			}

		}

		console.dir(allSaveNoRepeatData);

		// 怎么填充数据  将$(allSaveLiData[i]).attr("key")
		// 只填充到li里面包含fill-data的数据
		for (var i = 0; i < allSaveLiData.length; i++) {
			if ($(allSaveLiData[i]).attr("key") == $($('.content li')[i]).attr('key')) {
				if ($($('.content li')[i]).children('.fill-data').length>0) {
					$($('.content li')[i]).children('.fill-data').text($(allSaveLiData[i]).attr("key")+1)
				}
				if($($('.content li')[i]).children('.description').length>0) {
					$($('.content li')[i]).children('.description').text($(allSaveLiData[i]).attr("key")+1)
				}
				if($($('.content li')[i]).children('h2').length>0) {
					$($('.content li')[i]).children('h2').text($(allSaveLiData[i]).attr("key")+1)
				}
				
			}
		}
		// 点击保存按钮填充table表格数据的时候
		
		
		//  还没想好怎么保存input数据
		
		
		// 点击保存按钮的时候,显示标题，显示描述 ，隐藏input输入框
		for(var i=0; i<$('.content_list ul li.input_box input').length; i++) {
			$($('.content_list ul li.input_box input')[i]).css('display','none');
		}
		$($('.content_list ul li.input_box h2')).css('display','block');
		$($('.content_list ul li.input_box label')).css('display','block');

	});

	// 数组去重
	Array.prototype.unique3 = function () {
		var res = [];
		var json = {};
		for (var i = 0; i < this.length; i++) {
			if (!json[this[i]]) {
				res.push(this[i]);
				json[this[i]] = 1;
			}
		}
		return res;
	}
	// 判断数组中（相同）元素的个数,
	function selectArrCount(result) {
		var arr = [];
		result.sort();
		for (var i = 0; i < result.length;) {
			var count = 0;
			for (var j = i; j < result.length; j++) {
				if (result[i] === result[j]) {
					count++;
				}
			}
			arr.push({
				key: result[i],
				count: count
			})
			i += count;
		}
		return arr;
	}
})
