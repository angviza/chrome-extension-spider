var flag = false;
var currentTabId = 1;
var url = '';
var count = 0;
//点击插件图标事件
chrome.browserAction.onClicked.addListener(function (tab) {　　
    console.log('Turning ' + tab.url);　
    flag = true;
    currentTabId = tab.tabId;　　
    chrome.tabs.getSelected(null, function (tab) {　
        currentTabId = tab.tabId;　　　　
        sendMsg({
            "url": "testmsg"
        });　　
    });
});

chrome.webNavigation.onCompleted.addListener(function (tab) {
    console.log('加载完成***');　
    currentTabId = tab.tabId;
    url = tab.url;
    // url = str.substring(str.indexOf(".") + 1, str.lastIndexOf("."))
    setTimeout(doNext, Math.random() * 20000 + 5000);
});

function doNext() {
    if (flag) {
        console.log("", count, "doNext")
        count++;　
        sendMsg({
            "url": url
        });　　
    }
}
var fileData = [];
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        cmd = request.cmd;
        switch (cmd) {
            case "notif":
                showNotif(request.msg.tit, request.msg.msg);
                break;

            default:
                saveData(request);
                break;
        }

    });

function saveData(request) {
    fileData = fileData.concat(request.msg);
    showBadgeText(fileData.length);
    if ('end' == cmd) {　　
        flag = false;
    } else {
        setTimeout(doNext, Math.random() * 20000 + 5000);
    }
}

function showBadgeText(count) {
    cor = [0, 0, 0, 0], txt = '';
    if (count > 0) {
        txt = ""+count;
        color = [255, 0, 0, 0];
    }
    chrome.browserAction.setBadgeText({text: txt});
    chrome.browserAction.setBadgeBackgroundColor({color: cor});

}

function showNotif(tit, msg) {
    console.log("show notif", chrome.notifications);
    chrome.notifications.create(null, {
        type: 'image',
        iconUrl: 'icon/Spider_48.png',
        title: tit,
        message: msg,
        imageUrl: 'icon/Spider_128.png'
    });
}

function sendMsg(msg) {　　
    chrome.tabs.sendMessage(currentTabId, msg, function (response) {　　});
}