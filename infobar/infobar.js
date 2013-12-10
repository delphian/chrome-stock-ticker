
$('document').ready(function() {
    chrome.storage.local.get(['html', 'resource', 'symbols', 'tickerbar'], function(result) {
        symbols = new GSTSymbols(result.html, result.patterns, result.resource);
        symbols.findSymbols();
        symbols.loadTickers(function() {
            showBar(symbols, result.tickerbar);
        });
    });
});

/**
 * Print all tickers into the ticker bar.
 */
showBar = function(symbols, tickerbar) {
    var text = '';
    // Loop through each variable to be displayed.
    for (symbol in symbols.tickers) {
        text = text + '<div class="cst-tickerbar-variable">';
        var ticker = symbols.tickers[symbol];
        // Loop through each item in the tickerbar for this variable.
        for (var i=0; i<tickerbar.items.length; i++) {
            if (tickerbar.items[i].show == true) {
                var source = tickerbar.items[i].source;
                var new_source = source;
                var match;
                var regex = new RegExp('\\[\\[([a-z_]+)\\]\\]', 'g');
                // Search for metrics on each item and replace them with the
                // values cached for this variable.
                while ((match = regex.exec(source)) !== null) {
                    if (typeof(ticker.resource.cache.metrics[match[1]]) != 'undefined') {
                        new_source = new_source.replace('[['+match[1]+']]', ticker.resource.cache.metrics[match[1]].value);
                    }
                }
                // Replace the 'variable' variable.
                new_source = new_source.replace('[[VARIABLE]]', symbol);
                text = text + '<div class="cst-tickerbar-item">' + new_source + '</div>';
            }
        }
        text = text + '</div>';
    }
            text = text + '<div class="btn-group" style="float:left;">' +
                          '<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">' +
                          'Dropdown' +
                          '<span class="caret"></span>' +
                          '</button>' +
                          '<ul class="dropdown-menu" role="menu">' +
                          '  <li><a role="menuitem" tabindex="-1" href="#">Action</a></li>' +
                          '  <li><a role="menuitem" tabindex="-1" href="#">Another action</a></li>' +
                          '  <li role="presentation" class="divider"></li>' +
                          '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Separated link</a></li>' +
                          '</ul>' +
                          '</div>';
    if (text.length) {
        $('body').append(text);
    }
};
