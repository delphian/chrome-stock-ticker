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
    for (symbol in symbols.tickers) {
        var ticker = symbols.tickers[symbol];
        text = text + symbol + ': ';
        for (var i=0; i<tickerbar.metrics.length; i++) {
            tbmetric = tickerbar.metrics[i];
            if ((tbmetric.show == true) && (typeof(ticker.resource.cache.metrics[tbmetric.name]) != 'undefined')) {
                text = text + tbmetric.name + ':' + ticker.resource.cache.metrics[tbmetric.name].value + ' ';
            }
        }
        text = text + ' &nbsp; ';
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

