// popup主动发消息给content-script
$('#send_message_to_content_script').click(() => {
    sendMessageToContentScript('你好，我是popup！', (response) => {
        if (response) alert('收到来自content-script的回复：' + response);
    });
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request));
});

// popup与content-script建立长连接
$('#connect_to_content_script').click(() => {
    getCurrentTabId((tabId) => {
        var port = chrome.tabs.connect(tabId, {
            name: 'test-connect'
        });
        port.postMessage({
            question: '你是谁啊？'
        });
        port.onMessage.addListener(function (msg) {
            alert('收到长连接消息：' + msg.answer);
            if (msg.answer && msg.answer.startsWith('我是')) {
                port.postMessage({
                    question: '哦，原来是你啊！'
                });
            }
        });
    });
});

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback) {
    getCurrentTabId((tabId) => {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}
// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

//=================save as file

var stockData = [{
    Symbol: "AAPL",
    Company: "Apple Inc.",
    Price: 132.54
}, {
    Symbol: "INTC",
    Company: "Intel Corporation",
    Price: 33.45
}, {
    Symbol: "GOOG",
    Company: "Google Inc",
    Price: 554.52
}];

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    data = args.data || null;
    if (data == null || !data.length) {
        console.log("没有数据");
        return null;
    }
    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0]);
    result = '';
    result += "公司,法人,电话,邮箱,地址,资本,时间", //keys.join(columnDelimiter);
        result += lineDelimiter;
    data.forEach(function (item) {
        ctr = 0;
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;
            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });
    return result;
}

function downloadCSV(args) {
    bg = chrome.extension.getBackgroundPage();
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: bg.fileData
    });
    bg.fileData = [];
    bg.count = 0;
    if (csv == null) return;
    filename = args.filename || 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download',
        filename);
    link.click();
}
var bg;
$(function () {
    $('#download').click(function () {
        downloadCSV({
            filename: "com-data.csv"
        });
    });
    bg = chrome.extension.getBackgroundPage();

    if (bg.flag) {
        $("#checkboxTwoInput").attr("checked", 'checked'); //全选
    } else {
        $("#checkboxTwoInput").removeAttr("checked"); //取消全选
    }
    $("#checkboxTwoInput").change(function () {
        bg.flag = $("#checkboxTwoInput").is(':checked');
        console.log(bg.flag)
        if (bg.flag) {
            bg.doNext();
        }
        $('#state').text(bg.flag ? "抓取中.." : "已停止");
    });
    bg.showBadgeText(bg.fileData.length);
    setInterval("updateCount(bg)", 1000)

});

function updateCount() {
    $("#count").text(bg.fileData.length);
}