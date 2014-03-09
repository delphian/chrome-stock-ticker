
var evil_global_var_comments = [];

function ajaxComments(query, callback) {
    url = 'http://www.automatonsofmisery.com/chrome-stock-ticker/server/comments/index.php';
    query = JSON.stringify(query);
    $.post(url, { json: query }, function(response, textStatus, jqXHR) {
        callback(response);
    }).fail(function() {
        console.log('FAIL');
    });
}

function getComments(callback) {
    var json = {
        namespace: 'comments',
        command: 'get_comments'
    };
    ajaxComments(json, callback);
}

function printComments() {
    getComments(function(response) {
        var json = JSON.parse(response);
        var output = '';
        for (var i in json['comments']['comments']) {
            output += '<div class="comment">' + json['comments']['comments'][i]['comment'] + '</div>';
        }
        $('div.comment-wrapper div.comments').html(output);
    });
}

function addComment(comment, callback) {
    var json = {
        namespace: 'comments',
        command: 'add_comment',
        comment: comment
    };
    ajaxComments(json, callback);
}

$(document).ready(function() {
    $.get('http://www.automatonsofmisery.com/money/feed/', function (data) {
        var output = '';
        var count = 0;
        $(data).find("item").each(function () {
            var el = $(this);
            output = output + "<h4 class=\"title\">" + el.find("title").text() + "</h4>\n";
            output = output + "<div class=\"date\">" + el.find("pubDate").text() + "</div>\n";
            output = output + "<div class=\"description\">" + el.find("description").text() + "</div>\n";
            count++;
            if (count >= 3)
                return false;
        });
        $('div#dashboard .news .items').html(output);
    });
    printComments();
    setInterval(function() {
        printComments();
    }, 30000);
    $('div.comment-wrapper button').click(function() {
        var comment = $('div.comment-wrapper div.comment textarea').val();
        addComment(comment);
        $('div.comment-wrapper div.comment textarea').val('');
        setTimeout(function() {
            printComments();
        }, 1000);
    });
});
