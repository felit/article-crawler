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
                        return "http://www.hroot.com/channels/5.html"
                    } else {
                        return "http://www.hroot.com/channels/5_" + current_page_num + ".html"
                    }
                }
            }, "has_next": function () {
                return current_page_num < page_num;
            }
        }
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
     * 得到文档列表
     * @param url
     * @param nav
     */
    var list_links = function () {
        var nav = null;
        $.ajax({
            "url": "http://www.hroot.com/channels/5.html",
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
                    console.log(d.href);
                })
            });
        }

    };
    list_links();
})();