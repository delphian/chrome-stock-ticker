/**
 * @file
 * Search for any ticker symbols on the current page and display the ticker
 * bar if any are found.
 */

/**
 * Print all tickers into the ticker bar.
 */
showBar = function(symbols, tickerbar) {
console.log(tickerbar);
    var text = '';
    for (symbol in symbols.tickers) {
        var ticker = symbols.tickers[symbol];
console.log(ticker.resource.cache);
        text = text + symbol + ': ';
        for (var i=0; i<tickerbar.metrics.length; i++) {
            tbmetric = tickerbar.metrics[i];
            if ((tbmetric.show == true) && (typeof(ticker.resource.cache.metrics[tbmetric.name]) != 'undefined')) {
                text = text + ticker.resource.cache.metrics[tbmetric.name].value + ' ';
            }
        }
    }
    if (text.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+text+'</p>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }
}

chrome.runtime.sendMessage({method: 'getGSTOptions'}, function(response) {
    if (response.status == 1) {
        jQuery(document).ready(function($) {
            symbols = new GSTSymbols($('html').html(), response.patterns, response.resource);
            symbols.findSymbols();
            symbols.loadTickers(function() {
                showBar(symbols, response.tickerbar);
            });
        });
    }
});
