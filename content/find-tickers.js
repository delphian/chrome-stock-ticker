
jQuery(document).ready(function($) {

    // Detect ticker symbols by matching a href urls to these patterns.
    var patterns = [
        /.*(ticker|symb).*?([A-Z]+)/,
    ];

    // Store ticker symbols found in this array.
    var tickers = [];

    // Iterate through all 'a' elements.
    $('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
        	href = decodeURIComponent(href);
            var match = href.match(patterns[0]);
            // If the href attribute matches one of our patterns.
            if (match) {
                tickers.push(match[2]);
            }
        }
    });

    // Remove any duplicates from tickers array.
    var uniqueTickers = [];
    $.each(tickers, function(i, el){
        if($.inArray(el, uniqueTickers) === -1) uniqueTickers.push(el);
    });
    tickers = uniqueTickers;

    // Create our box.
    if (tickers.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+tickers.join()+'</p>');
        $('body').css('position', 'relative');
        $('body').css({'margin-top':'30px'});
        chrome.runtime.sendMessage('showbar');
    }
});
