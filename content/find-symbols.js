
/**
 * @file
 */

/**
 * Print all tickers into the ticker bar.
 *
 * This may be called multiple times due to the async nature of fetching
 * the metrics. Be prepared cache items that don't exist yet.
 */
showBar = function(symbols) {
    var text = '';
    // Loop through each variable to be displayed.
    for (symbol in symbols.tickers) {
        text = text + '<cst-variable variable="'+symbol+'"></cst-variable>';
    }
    if (text.length) {
        $('body').append('<div id="cst-tickerbar" class="cst-bootstrap" ng-app="chromeStockTicker">'+text+'</div>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
        var element = $('#cst-tickerbar');
        angular.bootstrap(element, ['chromeStockTicker']);
    }
};

// Only load bootstrap if it is not already present on the content page.
$('document').ready(function() {
    chrome.storage.sync.get(['resource', 'patterns'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Content script can\'t read from synced storage: ' + chrome.runtime.lastError.message);
        }
        var resource = result.resource;
        var tickerbar = result.tickerbar;
        var patterns = result.patterns;
        var html = $('html').html();
        symbols = new CSTSymbols(html, result.patterns, result.resource);
        symbols.findSymbols();
        symbols.loadTickers(function() {
            showBar(symbols);
        });
    });
});
