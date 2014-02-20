
/**
 * @file
 */

/**
 * Print all tickers into the ticker bar.
 *
 * This may be called multiple times due to the async nature of fetching
 * the metrics. Be prepared cache items that don't exist yet.
 */
var showBar = function(variables) {

    if (variables.length) {
        var markup = '<div id="cst-tickerbar" class="cst-bootstrap" ng-app="chromeStockTicker">';
        markup = markup + '<cst-bar variables="variables" orient="\'horizontal\'" ng-init="variables=[\'' + variables.join('\',\'') + '\']"></cst-bar>';
        markup = markup + '</div>';
        $('body').append(markup);
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
        var element = $('#cst-tickerbar');
        angular.bootstrap(element, ['chromeStockTicker']);
    }
};

var findVariables = function(html, patterns) {
    var symbols = [];
    // Iterate through all 'a' elements.
    $(html).find('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
            try {
                href = decodeURIComponent(href);
                for (var i=0; i<patterns.items.length; i++) {
                    var match;
                    var regex = new RegExp(patterns.items[i].regex, patterns.items[i].modifiers);
                    // If the href attribute matches one of our patterns.
                    while ((match = regex.exec(href)) !== null) {
                        symbols.push(match[patterns.items[i].result].toUpperCase());
                    }
                }
            } catch (err) {
                console.log('Can not examine href (' + href + '): ' + err);
            }
        }
    });
    // Remove any duplicates.
    var symbolsCleaned = [];
    $.each(symbols, function(i, el) {
        if($.inArray(el, symbolsCleaned) === -1) symbolsCleaned.push(el);
    });
    return symbolsCleaned;
};

// Only load bootstrap if it is not already present on the content page.
$('document').ready(function() {
    chrome.storage.sync.get(['patterns'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Content script can\'t read from synced storage: ' + chrome.runtime.lastError.message);
        }
        var variables = findVariables($('html').html(), result['patterns']);
        showBar(variables);
    });
});
