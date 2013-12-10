
/**
 * @file
 * Load an iframe onto the top of the current content page. Pass some
 * variables into the iframe via chrome.storage.local
 */
/**
 * Print all tickers into the ticker bar.
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
    if (text.length) {
            $('body').append('<div id="cst-tickerbar">'+text+'</div>');
            $('html').css('position', 'relative');
            $('html').css({'margin-top':'30px'});
    }
};

makeBarButton = function(variable) {
    text = '<div class="dropdown cst-tickerbar-dropdown" style="float:left;">' +
           '<button class="btn btn-success btn-xs dropdown-toggle" type="button" id="dropdownMenu'+variable+'" data-toggle="dropdown">' +
           variable + '</button>' +
           '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu'+variable+'">' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Action</a></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Another action</a></li>' +
           '  <li role="presentation" class="divider"></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Separated link</a></li>' +
           '</ul>' +
           '</div>';
    return text;
}

chrome.storage.sync.get(['resource', 'tickerbar', 'patterns'], function(result) {
    var resource = result.resource;
    var tickerbar = result.tickerbar;
    var patterns = result.patterns;
    jQuery(document).ready(function($) {
        var html = $('html').html();

        symbols = new GSTSymbols(html, result.patterns, result.resource);
        symbols.findSymbols();
        symbols.loadTickers(function() {
            showBar(symbols, result.tickerbar);
        });

        // chrome.storage.local.set({ 'html': html, 'resource': resource, 'tickerbar': tickerbar, 'patterns': patterns }, function() {
        //     var iframe = '<iframe src="' + chrome.extension.getURL('infobar/infobar.html') + '"></iframe>';
        //     $('body').append('<div id="cst-tickerbar"></div>');
        //     $('html').css('position', 'relative');
        //     $('html').css({'margin-top':'30px'});
        // });
    });
});
