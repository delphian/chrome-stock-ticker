
/**
 * @file
 * Search for any ticker symbols on the current page and display the ticker
 * bar if any are found.
 */

/**
 * Print all tickers into the ticker bar.
 */
showBar = function(symbols, tickerbar) {
    chrome.storage.local.set({'symbols': symbols, 'tickerbar': tickerbar}, function(result) {

    var text = '<iframe src="' + chrome.extension.getURL('infobar/infobar.html') + '"></iframe>';
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
            text = text + '<div class="dropdown" style="float:left;">' +
                          '<button class="btn dropdown-toggle sr-only" type="button" id="dropdownMenu1" data-toggle="dropdown">' +
                          'Dropdown' +
                          '<span class="caret"></span>' +
                          '</button>' +
                          '<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">' +
                          '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Action</a></li>' +
                          '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Another action</a></li>' +
                          '  <li role="presentation" class="divider"></li>' +
                          '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Separated link</a></li>' +
                          '</ul>' +
                          '</div>';
    if (text.length) {
        $('body').append('<div id="cst-tickerbar">Test</div>');
        $('#cst-tickerbar').html(text);
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }


    });
};

chrome.storage.sync.get(['resource', 'tickerbar', 'patterns'], function(result) {
    jQuery(document).ready(function($) {
        symbols = new GSTSymbols($('html').html(), result.patterns, result.resource);
        symbols.findSymbols();
        symbols.loadTickers(function() {
            // Compile friendly cache here and set to local variable? Then load iframe. <--------
            showBar(symbols, result.tickerbar);
        });
    });
});

