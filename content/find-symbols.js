
/**
 * @file
 */

/**
 * Print all tickers into the ticker bar.
 */
showBar = function(symbols, tickerbar) {
    var text = makeBarButton('test');
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
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Action</a></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Another action</a></li>' +
           '  <li role="presentation" class="divider"></li>' +
           '  <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Separated link</a></li>' +
           '</ul>' +
           '</div>';
    return text;
};

/**
 * Detect if bootstrap has been loaded by content page.
 */
bootstrapLoaded = function() {
    var loaded = false;
    $('link').each(function() {
        var href = $(this).attr('href');
        if (href.search(/bootstrap\./i) != -1) {
            loaded = true;
        }
    });
    return loaded;
};

/**
 * Load jquery and bootstrap into the content html. This means the scripts
 * will not be accessible to us, but we don't care. The bootstrap will
 * still operate on any markup we insert into the page.
 */
bootstrapLoad = function() {
    // Load jquery.
    console.log('Loading jQuery...');
    var script = document.createElement('script');
    script.src = chrome.extension.getURL('libs/external/jquery/jquery.min.js');
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    // Load bootstrap css.
    console.log('Loading Bootstrap CSS...');
    var link = document.createElement('link');
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.extension.getURL('libs/cst-bootstrap.css');
    document.getElementsByTagName('head')[0].appendChild(link);
    // Load bootstrap javascript.
    console.log('Loading Bootstrap JS...');
    var script = document.createElement('script');
    script.src = chrome.extension.getURL('libs/external/bootstrap/bootstrap-3.0.3/dist/js/bootstrap.min.js');
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
};

// Only load bootstrap if it is not already present on the content page.
$('document').ready(function() {
    if (!bootstrapLoaded()) bootstrapLoad();
    chrome.storage.sync.get(['resource', 'tickerbar', 'patterns'], function(result) {
        var resource = result.resource;
        var tickerbar = result.tickerbar;
        var patterns = result.patterns;
        jQuery(document).ready(function($) {
            var html = $('html').html();
            symbols = new CSTSymbols(html, result.patterns, result.resource);
            symbols.findSymbols();
            symbols.loadTickers(function() {
                showBar(symbols, result.tickerbar);
            });
        });
    });
});
