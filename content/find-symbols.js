
/**
 * @file
 */

/**
 * Print all tickers into the ticker bar.
 *
 * This may be called multiple times due to the async nature of fetching
 * the metrics. Be prepared cache items that don't exist yet.
 */
showBar = function(symbols, tickerbar) {
    var text = '';
    // Loop through each variable to be displayed.
    for (symbol in symbols.tickers) {
        text = text + '<div class="cst-tickerbar-variable">';
        text = text + makeBarButton(symbol);
        var ticker = symbols.tickers[symbol];
        // Loop through each item in the tickerbar for this variable. 
        for (var i=0; i<tickerbar.items.length; i++) {
            if (typeof(ticker.resource.cache.metrics[tickerbar.items[i].name]) != 'undefined' &&
                typeof(ticker.resource.cache.metrics[tickerbar.items[i].name].value) == 'string' &&
                ticker.resource.cache.metrics[tickerbar.items[i].name].value.length > 0) {
                var new_source = tickerbar.items[i].source + '<br />' + ticker.resource.cache.metrics[tickerbar.items[i].name].value;
                text = text + '<div class="cst-tickerbar-item">' + new_source + '</div>';
            }
        }
        text = text + '</div>';
    }
    if (text.length) {
        $('body').append('<div id="cst-tickerbar" class="cst-bootstrap">'+text+'</div>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }
};

/**
 * Create a button for a variable.
 */
makeBarButton = function(variable) {
    text = '<div class="dropdown cst-tickerbar-dropdown" style="float:left;">' +
           '<button class="btn btn-success btn-xs dropdown-toggle" type="button" id="dropdownMenu'+variable+'" data-toggle="dropdown">' +
           variable + '</button>' +
           '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu'+variable+'">' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" target="_blank" href="http://ycharts.com/companies/'+variable+'/free_cash_flow">Free Cash Flow Chart</a></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" target="_blank" href="http://www.buyupside.com/dividendcharts/dividendchartdisplay.php?symbol='+variable+'&interval=allyears">Dividend Chart</a></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" target="_blank" href="http://www.vuru.co/analysis/'+variable+'/valuation">Fair Value Calculator</a></li>' +
           '</ul>' +
           '</div>';
    return text;
};

// Only load bootstrap if it is not already present on the content page.
$('document').ready(function() {
    chrome.storage.sync.get(['resource', 'tickerbar', 'patterns'], function(result) {
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
            showBar(symbols, result.tickerbar);
        });
    });
});
