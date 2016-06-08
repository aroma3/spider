// 程序段-01-豆瓣电影网页爬虫

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';





var outStream = fs.WriteStream('urls.txt');
var outStreamNames = fs.WriteStream('names.txt');

/* 精心挑选的种子URL——如何精心是个问题 */
var originalURL = [
        // 'http://movie.douban.com/subject/1292052/', /* 《肖申克的救赎》 */
        // 'http://movie.douban.com/subject/11026735/',  /* 《超能陆战队》 */
        // 'http://movie.douban.com/subject/3993588/'  /* 《狼图腾》 */
        'http://www.meishichina.com/YuanLiao/'
    ];

/* 去重字典 */
var urlDic  = {};
var urlList = [];
var resultList = [];

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
    var pattern = /[^\/]+\/$/;
    var numbers = pattern.exec(href);
    if(!numbers){
        return 'null';
    }
    return numbers[0];
}

/* 根据传入的url，获取该页面，并提取该页面中的类似URL地址并去重 */
fetchNextURLs = function(url){
    request({url: url}, function (error, response, body) {
        if (error) {
            return console.error(error);
        }
        console.log('成功爬取到页面： ' + url );

        var $ = cheerio.load( response.body.toString() );

        /* 保存当前页面 */
        var numbers = Tools.getNumbersOfUrl(url);
        var htmlStream = fs.WriteStream('./menu/menu_'+numbers.replace(/\/$/, '') + '.html');
        htmlStream.write(body);
        htmlStream.end();

        /* 获取当前页面包含的所有URL，去重后放入hrefs列表 */
        var hrefs = [];
        console.log('==', $('.category_box .category_sub a').length );
        $('.category_box .category_sub a').each(function(){
            var $me = $(this);
           

            if( !$(this) ){
                return ;
            }
            
            var href = Tools.getUrl( $me.attr('href') );
            var numbers = Tools.getNumbersOfUrl(href);

            

            if(!urlDic[numbers]){

                urlDic[numbers] = true;
                hrefs.push(href);
                outStream.write(href+ '\r\n');
               
                resultList.push({name: $me.attr('title'), url: href} );
               
            }
        });
      

        /* hrefs的长度为0，表明无法继续查找新的链接了，因此停止爬虫程序 */
        if(hrefs.length === 0){
            console.log('本页面未能爬取到新链接。');
        }else{
            urlList = urlList.concat(hrefs);
            /* 如果没有超过预定值，则继续进行请求 */
            if(urlList.length< 100){
                for (var i = 0; i < hrefs.length; i++) {
                    if( hrefs[i].indexOf('javascript')<0 ){
                        fetchNextURLs(hrefs[i]);    
                    }
                    if( i== (hrefs.length-1) ){
                        writeDB();
                    }
                    
                }
            }else{
                outStream.end();
                
               
                console.log('超过预订的数目，爬虫程序正常结束。获取到的总链接数为：', urlList.length);
            }
        }     
        
    });
};

/* 根据种子URL启动爬虫 */
for (var i = 0; i < originalURL.length; i++) {
    fetchNextURLs(originalURL[i]);
}


var insertDocument = function(db, callback) {
    // console.dir(resultList);

   db.collection('spider').insertMany(resultList).then(function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the restaurants collection.");
        callback();
  });
   
};


function writeDB(){
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log('Connected correctly to server.');
      insertDocument(db, function() {
          db.close();
      })

      

    });
}
