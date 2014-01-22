
/**
 * Retrieve data for a specific stock ticker from the internet.
 *
 * @param string symbol
 *   The ticker symbol to fetch information on.
 * @param object resource
 *   object that maps ticker properties to the urls and css
 *   selectors required to fetch their data.
 * @param object data
 *   (optional) cached data, if any, for this symbol.
 */
CSTTicker = function(symbol, resource, cache) {
    this.symbol = symbol;
    this.resource = new CSTResource(resource, cache);
    this.replacements = [
        { from: 'SYMBOL', to: symbol }
    ];
};
/**
 * Fetch all metrics from the resource.
 *
 * @param function callback
 *   Callback will be invoked when all metrics have been fetched.
 *
 * @return void
 */
CSTTicker.prototype.fetchAllData = function(callback) {
	var self = this;
    var cacheKey = 'cache_' + self.symbol;
    chrome.storage.sync.get(cacheKey, function(result) {
        if (typeof(result[cacheKey]) != 'undefined') {
            self.resource.cache.metrics = result[cacheKey];
        } else {
            console.log('No cache found for ' + cacheKey + '.');
        }
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
            callback.call(self);
        });
    });
};
