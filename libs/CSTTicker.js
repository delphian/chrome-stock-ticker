
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
	var thisCSTTicker = this;
	this.resource.fetchAllUrls(this.replacements, function() {
        thisCSTTicker.resource.fetchAllMetrics(thisCSTTicker.replacements, function() {
           callback.call(thisCSTTicker);
        });
	});
};
