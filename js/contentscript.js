var totalPage;
var page = 0;
//注册前台页面监听事件
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("页面加载完毕", request);
    isPage = request.url.search(/page=\d/) > -1;
    if (request.url.indexOf('https://www.qixin.com/search?') == 0 && isPage) {
        if (!!!getValidate()) {
            getQiXinInfo(sendResponse);
        } else {
            sendMsg({
                "tit": "验证码",
                "msg": "骚年，赶紧输入验证码"
            }, "notif");　　
        }
    } else {
        sendMsg({
            "tit": "提示",
            "msg": "暂不支持该页面数据抓取!"
        }, "notif");
    }
});



function getQiXinInfo(sendResponse) {　　　
    comp = [];　　
    $("div[class='col-xs-24 padding-v-1x margin-0-0x border-b-b4 company-item']").each(function (index) {　　
        this_ = $(this);　　　　
        title = this_.find("div[class=company-title] a").text();　　　　
        qiyeCard = this_.find("div[class='legal-person']");
        ziben = this_.find("div[class='col-3-1 text-center content-text']").text();
        time = this_.find("div[class='col-3-2 text-center content-text']").text();
        faren = $(qiyeCard[0]).text().split("：")[1] || '-';
        lianxi = $(qiyeCard[1]).children();
        phone = $(lianxi[0]).text().split("：")[1] || '-';
        email = $(lianxi[1]).text().split("：")[1] || '-'; //.innerText;
        addr = $(qiyeCard[2]).text().substring(3);
        comp[index] = [title, faren, phone, email, addr, ziben, time];
    });


    page = parseInt(getQueryParam('page')) + 1;
    next = $("ul[class=pagination] li a[href*='page=" + page + "']")[0]
    if (next) {
        sendMsg(comp, "next");　　
        next.click();
        console.log("get page:", page)
    } else {
        sendMsg(comp, "end");
    }

    //

}

function getValidate() {
    return $("div[class='geetest_panel geetest_wind']").is(":hidden");
}

function getQueryParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

//将获取内容传递给后台文件进行处理
function sendMsg(msg, cmd) {　　
    chrome.runtime.sendMessage({
        "msg": msg,
        "cmd": cmd
    }, function (response) {});
}