// 程序段-01-豆瓣电影网页爬虫

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var Sinalogin = require('sinalogin'); // or var Sinalogin = require('sinalogin');


var account = {
    name: 'pjxjolly@163.com',
    passwd: 'jolly@2578',
    cookiefile: 'pjxjolly@163.com.dat'
}

Sinalogin.weibo_login(account, function(err, loginInfo){
    if(loginInfo.logined){
        var j = loginInfo.j;

        request({url: 'http://weibo.com/youyudehexie?wvr=5&wvr=5&lf=reg', jar: j}, function (err, response, body) {
          console.log(body)
        });
    }
});




var outStream = fs.WriteStream('./weibo/urls_weibo.txt');

/* 精心挑选的种子URL——如何精心是个问题 */
var originalURL = [
       'http://weibo.com/1558449660/follow?rightmod=1&wvr=6'
    ];

/* 去重字典 */
var urlDic  = {};
var urlList = [];

/* 传入一个可能带有参数字符串的链接，返回一个无参数的链接 */
var Tools = {};
Tools.getUrl = function(href){
    var index = href.indexOf('?');
    var url = href;
    if (index > -1) {
        url = href.substring(0, index);
    }

    return url; 
};

Tools.getNumbersOfUrl = function(href){
    var pattern = /\d+/;
    var numbers = pattern.exec(href);
    return numbers;
}

/* 根据传入的url，获取该页面，并提取该页面中的类似URL地址并去重 */
fetchNextURLs = function(url){
    request({url: url}, function (error, response, body) {
        if (error) {
            return console.error(error);
        }
        console.log('成功爬取到页面： ' + url );
        console.log( url,  response.body.toString());


        var $ = cheerio.load(response.body.toString());

        /* 保存当前页面 */
        var numbers = Tools.getNumbersOfUrl(url);
        var htmlStream = fs.WriteStream('./weibo/guanzhu'+numbers + '.html');
        htmlStream.write(body);
        htmlStream.end();

        /* 获取当前页面包含的所有URL，去重后放入hrefs列表 */
        var hrefs = [];
        $('.member_box .member_wrapper .mod_info a').each(function(){
            var $me = $(this);
            var href = Tools.getUrl( $me.attr('href') );
            var numbers = Tools.getNumbersOfUrl(href);
            if(!urlDic[numbers]){
                urlDic[numbers] = true;
                hrefs.push(href);
                outStream.write(href+ '\r\n');
            }
        });

        /* hrefs的长度为0，表明无法继续查找新的链接了，因此停止爬虫程序 */
        if(hrefs.length === 0){
            console.log('本页面未能爬取到新链接。');
        }else{
            urlList.concat(hrefs);
            /* 如果没有超过预定值，则继续进行请求 */
            if(urlList.length< 100){
                for (var i = 0; i < hrefs.length; i++) {
                    fetchNextURLs(hrefs[i]);
                }
            }else{
                outStream.end();
                console.log('超过预订的数目，爬虫程序正常结束。获取到的总链接数为：', urlList.length);
            }
        }       
    });
};

/* 根据种子URL启动爬虫 */
// for (var i = 0; i < originalURL.length; i++) {
//     fetchNextURLs(originalURL[i]);
// }