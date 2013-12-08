/**
 * @file
 * Search for any ticker symbols on the current page and display the ticker
 * bar if any are found.
 */

/**
 * Print all tickers into the ticker bar.
 */
showBar = function(symbols, tickerbar) {
    var text = '';
    // Loop through each variable to be displayed.
    for (symbol in symbols.tickers) {
        text = text + symbol + ': ';
        var ticker = symbols.tickers[symbol];
        // Loop through each item in the tickerbar for this variable.
        for (var i=0; i<tickerbar.items.length; i++) {
            if (tickerbar.items[i].show == true) {
                var source = tickerbar.items[i].source;
                var match;
                var regex = new RegExp('\\[\\[([a-z_]+)\\]\\]', 'g');
                // Search for metrics on each item and replace them with the
                // values cached for this variable.
                while ((match = regex.exec(source)) !== null) {
                    if (typeof(ticker.resource.cache.metrics[match[1]]) != 'undefined') {
                        source = source.replace('[['+match[1]+']]', ticker.resource.cache.metrics[match[1]].value);
                    }
                }
                text = text + source + ' ';
            }
        }
        // Replace the 'variable' variable.
        text = text.replace('[[VARIABLE]]', symbol);
        text = text + ' &nbsp; &nbsp; ';
    }
    if (text.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+text+'</p>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }
};

chrome.storage.sync.get(['resource', 'tickerbar', 'patterns'], function(result) {
    jQuery(document).ready(function($) {
        symbols = new GSTSymbols($('html').html(), result.patterns, result.resource);
        symbols.findSymbols();
        symbols.loadTickers(function() {
            showBar(symbols, result.tickerbar);
        });
    });
});

