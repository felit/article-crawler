/**
 * 分析hroot网站
 * root_url
 * next_url(num)
 * get_links(url)
 */
(function () {
    /**
     * 导航计算
     * @returns {{init: 'init', next_url: 'next_url'}}
     */
    var next_page_url = function () {
        var page_num = 0;
        var current_page_num = 0;
        var self = {
            'init': function (_num) {
                page_num = _num;
                return self;
            },
            'next_url': function () {
                if (current_page_num > page_num) {
                    return null;
                } else {
                    current_page_num = current_page_num + 1;
                    if (current_page_num == 1) {
                        return "http://www.hroot.com/channels/4.html"
                    } else {
                        return "http://www.hroot.com/channels/4_" + current_page_num + ".html"
                    }
                }
            }, "has_next": function () {
                return current_page_num < page_num;
            }
        };
        return self;
    };
    /**
     * 得到页数
     * @param data
     * @returns {Number}
     */
    var get_page_num = function (data) {
        var r = /当前页：\d+\s+\/\s+(\d+)/ig;
        var re = r.exec(data);
        var page_num = parseInt(re[1], 10);
        return page_num;
    };
    /**
     * 保存文章
     * @param url
     * @param save_func
     */
    var get_content_and_save = function (url, save_func) {
        $.get(url, function (data) {
            var jq_data = $(data);
            var title = jq_data.find('table.right-tit td:first').text();
            var body = jq_data.find('#OutInfo').html();
            save_func({"title": title, "body": body});
        });
    };
    var queue = (function () {
        var arr = [];
        var self = {
            'push': function (ele) {
                arr.push(ele);
            }, 'pop': function () {
                return arr.pop();
            }, 'has_el': function () {
                return arr.length > 0;
            }
        };
        return self;

    })();
    /**
     * 得到文档列表
     * @param url
     * @param nav
     */
    var list_links = function (save_func) {
        var nav = null;
        $.ajax({
            "url": "http://www.hroot.com/channels/4.html",
            "method": "GET",
            "async": false,
            "success": function (data) {
                var num = get_page_num(data);
                nav = next_page_url().init(num);
            }
        });
        while (nav.has_next()) {
            $.get(nav.next_url(), function (data) {
                var result = $(data);
                var links = result.find('table a');
                var content_links = _.filter(links, function (item) {
                    return s(item.href).contains('contents');
                });
                var data = _.map(content_links, function (link) {
                    return {"href": link.href}
                });
                _.each(data, function (d) {
                    queue.push(d.href);
                })
            });
        }
    };
    setTimeout(function () {
        setInterval(function () {
            if (queue.has_el()) {
                var url = queue.pop();
                console.log(url);
                get_content_and_save(url, save_article);
            }
        }, 500);

    }, 10 * 1000);


    /**
     * save_article({'title':'title','body':'body'})
     * @param opts
     */
    var save_article = function (opts) {
        var data = {
            "channelid": 1,
            "dopost": "save",
            "title": opts.title,
            "shorttitle": "",
            "redirecturl": "",
            "tags": "",
            "weight": "9",
            "picname": "",
            "source": "Hroot",
            "writer": "",
            "typeid": "12",
            "typeid2": "",
            "keywords": "",
            "autokey": "1",
            "description": "",
            "remote": "1",
            "autolitpic": "1",
            "needwatermark": "1",
            "sptype": "hand",
            "spsize": "5",
            'body': opts.body,
            'voteid': '',
            'notpost': '0',
            'click': '123',//TODO 随机
            'sortup': '0',
            'color': '',
            'arcrank': '0',
            'money': '0',
            'pubdate': '2016-04-23 17:51:32',//TODO 时间
            'ishtml': '0',
            'filename': '',
            'templet': '',
            'imageField.x': '42',
            'imageField.y': '9',
            'flags': ['c', 'a']
        };
        $.ajax({
            'url': config.save_url(),
            'data': data,
            'method': "POST",
            'success': function (data) {

            }
        });
    };
    list_links();
})();