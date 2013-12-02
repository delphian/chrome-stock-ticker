
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
GSTTicker = function(symbol, resource, cache) {
    this.symbol = symbol;
    this.resource = new GSTResource(resource, cache);
    this.replacements = [
        { from: 'SYMBOL', to: symbol }
    ];
};
GSTTicker.prototype.fetchAllData = function(callback) {
    this.resource.fetchAllMetrics(this.replacements, function() {
        callback();
    });
};
