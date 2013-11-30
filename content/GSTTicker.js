
/**
 * Retrieve data for a specific stock ticker from the internet.
 *
 * @param string symbol
 *   The ticker symbol to fetch information on.
 * @param object resource
 *   (optional) object that maps ticker properties to the urls and css
 *   selectors required to fetch their data.
 *   Example resource:
 *     resource = {
 *         urlNames: {
 *             main: {
 *                 url: 'http://finance.yahoo.com/q?s=SYMBOL'
 *             }
 *         },
 *         property: {
 *             price: {
 *                 selector: 'span.time_rtq_ticker span',
 *                 urlName: 'main'
 *             }
 *         }
 *     };
 * @param object data
 *   (optional) cached data, if any, for this symbol.
 */
GSTTicker = function(symbol, resource, data) {
    // Store everything in a single object for persistance in local storage.
    this.data = {
        symbol: symbol,
        price: null,
        volume: null,
        urls: {
            main: {
                timestamp: null,
                html: null
            }
        }
    };
    this.resource = resource;

    // Any ajax calls will be recorded in this array until they have finished.
    this.fetching = [];

    this.fetchingRemove = function(value, callback) {
        this.fetching.splice(this.fetching.indexOf(value), 1);
        if (!this.fetching.length) {
            callback();
        }
    }
    this.fetchURL = function(url, params, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                  callback(xhr.responseText);
              }
        }
        xhr.open("GET", url, true);
        xhr.send();
    }
    /**
     * Fetch the content from all URLs required to grab all relevent metric.
     *
     * The responses themselves will be stored on the main object in
     * data.response for easy caching and persisting.
     *
     * @param function callback
     *   The callback to execute when all data has been received and parsed.
     */
    this.fetchData = function(callback) {
        var thisTicker = this;
        for (url_name in this.resource.urlNames) {
            var url = this.resource.urlNames[url_name].url.replace('SYMBOL', this.data.symbol);
            var properties = this.getProperties(url_name);
            var params = {};
            // Inform thisTicker that we have being an async call.
            this.fetching.push(url);
            this.fetchURL(url, params, function(html) {
                thisTicker.data.urls[url_name].html = html;
                thisTicker.data.urls[url_name].timestamp = new Date().getTime();
                for (i=0; i<properties.length; i++) {
                    thisTicker.fetchProperty(properties[i]);
                }
                thisTicker.fetchingRemove(url, callback);
            });
        }
    }
    this.fetchProperty = function(property) {
        var html = this.data.urls[this.resource.property[property].urlName].html;
        var selector = this.resource.property[property].selector;
        this.data[property] = $(html).find(selector).text();
    }
    this.getProperties = function(url_name) {
        var properties = [];
        for (var key in this.resource.property) {
            if (this.resource.property[key].urlName == url_name) {
                properties.push(key);
            }
        }
        return properties;
    }
};
/**
 * Detect ticker symbols on current page by matching href urls to patterns.
 *
 * Static method.
 *
 * @param array patterns
 *   Each element containing regex pattern in the form of /pattern/i.
 *   Do not enclose the pattern in a sting.
 *
 * @return array
 *   Each element being a symbol found, or an empty array if none found.
 */
GSTTicker.findTickers = function(html, patterns) {
    // Detect ticker symbols by matching a href urls to these patterns.
    if (typeof(patterns) == 'undefined' || patterns.length < 1) {
        patterns = [{ 
            pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)',
            options: 'g',
            result: 2 
        }];
    }
    // Store ticker symbols found in this array.
    var tickers = [];
    // Iterate through all 'a' elements.
    $(html).find('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
            href = decodeURIComponent(href);
            for (i=0; i<patterns.length; i++) {
                var match;
                var regex = new RegExp(patterns[i].pattern, patterns[i].options);
                // If the href attribute matches one of our patterns.
                while ((match = regex.exec(href)) !== null) {
                    tickers.push(match[patterns[i].result]);
                }
            }
        }
    });
    // Remove any duplicates from tickers array.
    var uniqueTickers = [];
    $.each(tickers, function(i, el){
        if($.inArray(el, uniqueTickers) === -1) uniqueTickers.push(el);
    });
    tickers = uniqueTickers;

    return tickers;
};
