function getEvents() {
    var eventsList;
    $.get('http://139.196.228.153:8081/dict/dictvals/ad_new_event', function (res) {
        eventsList = res.result;
        var select = document.getElementById('eventList');
        createSelect(eventsList,select)
    })
}

function getParam(id,q,value){
    var subParam;
    var url = 'http://139.196.228.153:8081/ad/new/for/select/'+id;
    if(q){
        url+='?q='+q;
    }
    $.get(url,function (res) {
        subParam = res.items;
        var select = document.getElementById('subList');
        var searchBox = document.getElementById('searchBox');
        if(res.items) {
            select.innerHTML = "<option value = ''>请选择</option>";
            searchBox.style.display = 'block'
            select.style.display = 'inline-block';
            createSubSelect(subParam, select, value)
        }else{
            select.style.display = 'none';
            searchBox.style.display = 'none'
            searchBox.querySelector('input').value = ''
            select.value = null;
            select.innerHTML = '';
        }
    })

}
