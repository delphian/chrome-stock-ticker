/**
 * @file
 * Search for any ticker symbols on the current page and display the ticker
 * bar if any are found.
 */

chrome.runtime.sendMessage({method: 'getGSTOptions'}, function(response) {
    if (response.status == 1) {
        jQuery(document).ready(function($) {
            symbols = new GSTSymbols($('html').html(), response.patterns, response.resource);
            symbols.findSymbols();
            symbols.loadTickers(function() {
                symbols.showBar();
            });
        });
    }
});
