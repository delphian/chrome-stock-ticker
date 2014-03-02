
$(document).ready(function() {
    $.get('http://www.automatonsofmisery.com/money/feed/', function (data) {
        var output = '';
        $(data).find("item").each(function () { // or "item" or whatever suits your feed
            var el = $(this);
            output = output + "<h4 class=\"title\">" + el.find("title").text() + "</h4>\n";
            output = output + "<div class=\"date\">" + el.find("pubDate").text() + "</div>\n";
            output = output + "<div class=\"description\">" + el.find("description").text() + "</div>\n";
        });
        $('div#dashboard .news .items').html(output);
    });
});