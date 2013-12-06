
/**
 * Reset the resource to its default value and write to storage sync.
 *
 * @return void
 *   This function does not return a value, use the callback to determine
 *   when the reset is complete and the success or failure.
 */
function resetResource(callback) {
    var resource = {
        urls: [
            { url: 'http://finance.yahoo.com/q?s=SYMBOL' }
        ],
        metrics: [
            { name: 'yahoo_price', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'span.time_rtq_ticker span' },
            { name: 'yahoo_volume', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span' },
        ]
    };
    chrome.storage.sync.set({'resource': resource}, function() {
        if (chrome.runtime.lastError) {
            console.log('Can not setup default resource: ' + chrome.runtime.lastError.message);
            if (typeof(callback) != 'undefined') callback(false);
        } else {
            if (typeof(callback) != 'undefined') callback(true);
        }
    });    
}

/**
 * Reset the patterns to their default values and write to storage sync.
 *
 * @return void
 *   This function does not return a value, use the callback to determine
 *   when the reset is complete and the success or failure.
 */
function resetPatterns(callback) {
    var patterns = [
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
    ];
    chrome.storage.sync.set({'patterns': patterns}, function() {
        if (chrome.runtime.lastError) {
            if (typeof(callback) != 'undefined') callback(false);
            console.log('Can not setup default patterns: ' + chrome.runtime.lastError.message);
        } else {
            if (typeof(callback) != 'undefined') callback(true);
        }
    });
}

/**
 * Reset the tickerbar to its default values and write to storage sync.
 *
 * @return void
 *   This function does not return a value, use the callback to determine
 *   when the reset is complete and the success or failure.
 */
function resetTickerbar(callback) {
    var tickerbar = { 
        metrics: [
            { name: 'yahoo_price', show: true },
            { name: 'yahoo_volume', show: false }
        ]
    };
    chrome.storage.sync.set({'tickerbar': tickerbar}, function() {
        if (chrome.runtime.lastError) {
            if (typeof(callback) != 'undefined') callback(false);
            console.log('Can not setup default tickerbar: ' + chrome.runtime.lastError.message);
        } else {
            if (typeof(callback) != 'undefined') callback(true);
        }
    });
}

// Insert some default data into the resource and patterns
$('document').ready(function() {
    chrome.storage.sync.get(['resource', 'patterns', 'tickerbar'], function(result) {
        if (typeof(result.resource) == 'undefined') resetResource();
        if (typeof(result.patterns) == 'undefined') resetPatterns();
        if (typeof(result.tickerbar) == 'undefined') resetTickerbar();
    });
});
