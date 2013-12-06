
// Insert some default data into the resource and patterns
$('document').ready(function() {
    chrome.storage.sync.get(['resource', 'patterns'], function(result) {
        // Setup a default resource if none exists (first time running?)
        if (typeof(result.resource) == 'undefined') {
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
                } else {
                    console.log('Created default resource. This should happen only once.');
                }
            });
        }
        // Setup default patterns if none exist (first time running?)
        if (typeof(result.patterns) == 'undefined') {
            var patterns = [
                { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
                { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
            ];
            chrome.storage.sync.set({'patterns': patterns}, function() {
                if (chrome.runtime.lastError) {
                    console.log('Can not setup default patterns: ' + chrome.runtime.lastError.message);
                } else {
                    console.log('Created default patterns. This should happen only once.');
                }
            });
        }
    });
});
