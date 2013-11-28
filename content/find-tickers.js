
GSTContent = function() {};
/**
 * Detect ticker symbols on current page by matching href urls to patterns.
 *
 * Static method.
 *
 * @param array patterns
 *   Each element containing regex pattern in the form of /pattern/i.
 *   Do not enclose the pattern in a sting.
 *
 * @return array
 *   Each element being a symbol found, or an empty array if none found.
 */
GSTContent.findTickers = function(patterns) {
    // Detect ticker symbols by matching a href urls to these patterns.
    if (typeof(patterns) == 'undefined' || patterns.length < 1) {
        patterns = [
            '.*(ticker|symb).*?([A-Z]+)',
        ];
    }

    // Store ticker symbols found in this array.
    var tickers = [];
    // Iterate through all 'a' elements.
    $('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
            href = decodeURIComponent(href);
            for (i=0; i<patterns.length; i++) {
                var match;
                var regex = new RegExp(patterns[i], 'g');
                // If the href attribute matches one of our patterns.
                while ((match = regex.exec(href)) !== null) {
                    tickers.push(match[2]);
                }
            }
        }
    });
    // Remove any duplicates from tickers array.
    var uniqueTickers = [];
    $.each(tickers, function(i, el){
        if($.inArray(el, uniqueTickers) === -1) uniqueTickers.push(el);
    });
    tickers = uniqueTickers;

    return tickers;
};

// Expose local javascript as an API to other tabs, popup, and background pages.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == 'findTickers') {
        var tickers = GSTContent.findTickers(request.patterns);
        sendResponse({status: 1, tickers: tickers});
    } else {
        sendResponse({status: 0});
    }
});

jQuery(document).ready(function($) {

    var tickers = GSTContent.findTickers([
        '.*(ticker|symb).*?([A-Z]+)',
    ]);
    // Create our box.
    if (tickers.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+tickers.join()+'</p>');
        $('body').css('position', 'relative');
        $('body').css({'margin-top':'30px'});
        chrome.runtime.sendMessage('showbar');
    }
});
