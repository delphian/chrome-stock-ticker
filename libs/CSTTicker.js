
/**
 * @file
 * Retrieve all associated data from internet resource for a specified
 * stock ticker symbol.
 *
 * Implements caching of metrics via chrome storage. Will retrieve the
 * resource from chrome storage and set the replacement patterns for
 * the resource urls.
 *
 * Example usage:
 * @code
 *   var ticker = new CSTTicker('WMT');
 *   ticker.fetchAllData(function() {
 *     console.log('Walmart price is: ' + this.resource.cache.metrics.Price.value);
 *   });
 * @endcode
 */

/**
 * Retrieve data for a specific stock ticker from the internet.
 *
 * @param string symbol
 *   The ticker symbol to fetch information on.
 */
CSTTicker = function(symbol) {
    this.symbol = symbol;
    this.resource = null;
    this.replacements = null;
};
/**
 * Initialize the ticker.
 *
 * Load the resource and cached response from chrome storage.
 */
CSTTicker.prototype.init = function (callback) {
    var self = this;
    var cacheKey = 'cache_' + this.symbol;
    this.replacements = [
        { from: 'SYMBOL', to: this.symbol }
    ];
    chrome.storage.sync.get(['resource', cacheKey], function(result) {
        if (typeof(result['resource']) == 'undefined') {
            console.log('No resource found.');
        }
        self.resource = new CSTResource(result['resource'], result[cacheKey]);
        if (callback) callback.call(self);
    });    
}
/**
 * Fetch all metrics from the resource.
 *
 * Cache the results in chrome's synced storage.
 *
 * @param function callback
 *   Callback will be invoked when all metrics have been fetched.
 *
 * @return void
 */
CSTTicker.prototype.fetchAllData = function(callback) {
	var self = this;
    var cacheKey = 'cache_' + this.symbol;
    this.init(function() {
        self.resource.fetchAllMetrics(self.replacements, function() {
            var data = {};
            data[cacheKey] = self.resource.cache.metrics;
            chrome.storage.sync.set( data , function() {
                if (chrome.runtime.lastError) {
                    console.log('Failed to save: ' + chrome.runtime.lastError.message);
                } else {
                    console.log('Saved ' + cacheKey + '.');
                }
            });
            if (callback) callback.call(self);
        });
    })
};
