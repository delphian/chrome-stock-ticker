
/**
 * @file
 * Retrieve individual and discrete pieces of information from the internet.
 * A mapping between the name of a discrete piece of information (metric)
 * and the URL and css selector to obtain the metric is maintained inside
 * a single JSON object. Multiple metrics are mapped inside the single JSON
 * object.
 *
 * Long term storage of this mapping and the caching if the results are
 * left to the calling class.
 *
 * URLs may contain variables, for which the calling class is responsible
 * for passing in replacement values when required.
 *
 * Example fetching of price and volume for a stock ticker:
 * @code
 * // Setup a resource object to retrieve 'price' and 'volume' data from
 * // the yahoo finance page.
 * var resource_obj = {
 *     urls: [
 *         { url: 'http://finance.yahoo.com/q?s=SYMBOL' }
 *     ],
 *     metrics: [
 *         {
 *             name: 'price', 
 *             url: 'http://finance.yahoo.com/q?s=SYMBOL',
 *             selector: 'span.time_rtq_ticker span',
 *             regex: '([0-9\.]+)'
 *         },
 *         {
 *             name: 'volume',
 *             url: 'http://finance.yahoo.com/q?s=SYMBOL',
 *             selector: 'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span'
 *         },
 *     ]
 * };
 * // Replace all 'SYMBOLS' in the above resource_obj urls to 'WMT' (walmart
 * // stock ticker).
 * var replacements = [
 *     { from: 'SYMBOL', to: 'WMT' }
 * ];
 * var resource = new CSTResource(resource_obj, null);
 * resource.fetchAllMetrics(replacements, function() {
 *     // Fetcing metrics is an asyncronous process. Inside this callback we
 *     // know all metrics have been fetched and are available.
 *     var price = resource.cache.metrics['price'].value;
 * });
 * @endcode
 */

/**
 * @param object resource
 *   A JSON object mapping metrics (a piece of information) to resources on
 *   the internet (resources are specified with a url and a css selector).
 * @param object cache
 *   (optional) Preloaded cache object that contains the results of the
 *   previous fetching of all metrics.
 */
CSTResource = function(resource, cache) {
    if (typeof(resource) == 'undefined') resource = CSTResource.getDefaultResource();
    if (!this.validResource(resource)) throw 'Provided resource JSON is not valid.';
    this.resource = resource;

    // Store results of metric fetching.
    this.cache = {
        urls: {},
        metrics: {}
    };
    if (typeof(cache) != 'undefined') this.cache.metrics = cache;
};
/**
 * Fetch a URL from the internet.
 *
 * This is an async method call. The results will be stored in cache.
 *
 * @param string url
 *   The url to access.
 * @param object params
 *   An object containing parameters, like:
 *     { name: 'name', password: 'password' }
 * @param object callback
 *   A callback function. Function will be invoked when the ajax request
 *   has been completed.
 *
 * @return void
 *   No return value is provided, use callback function to receive the html
 *   returned by the ajax request.
 */
CSTResource.prototype.fetchUrl = function(url, params, callback) {
    // Return the cached copy if it exists.
    if (typeof(this.cache.urls[url]) != 'undefined') {
        callback.call(this, this.cache.urls[url].html);
    } else {
        var thisCSTResource = this;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
              if (xhr.readyState == 4) {
                  // Record a cached copy of the url's contents.
                  thisCSTResource.cache.urls[url] = {};
                  thisCSTResource.cache.urls[url].html = xhr.responseText;
                  thisCSTResource.cache.urls[url].timestamp = new Date().getTime();
                  callback.call(thisCSTResource, xhr.responseText);
              }
        }
        xhr.open("GET", url, true);
        xhr.send();
    }
}
CSTResource.prototype.fetchAllUrls = function (replacements, callback, flush) {
    var urls = this.getMetricUrls();
    var fetching = urls;
    for (var i=0; i<urls.length; i++) {
        var url = urls[i];
        var actual_url = this.replaceUrlVars(url, replacements);
        this.fetchUrl(actual_url, {}, function() {
            // Record the end of async call to fetch url. When the last url
            // has been retrieved, and the array empty, then the callback will be
            // invoked.
            fetching.splice(fetching.indexOf(url), 1);
            if (!fetching.length) callback.call(this, this.cache.urls);
        });
    }
}
/**
 * Report all URLs required by all metrics in the resource.
 *
 * @return array
 *   An array of URLs.
 */
CSTResource.prototype.getMetricUrls = function() {
    var urls = [];
    for (var i=0; i<this.resource.metrics.length; i++) {
        var metric = this.resource.metrics[i];
        if ($.inArray(metric.url, urls) === -1) urls.push(metric.url);
    }
    return urls;
};
/**
 * Report any metrics in the resource that depend on a specific url.
 *
 * @return array
 *   An array of metric objects.
 */
CSTResource.prototype.getMetricsByUrl = function(url) {
    var metrics = [];
    for (var i=0; i<this.resource.metrics; i++) {
        var metric = this.resource.metrics[i];
        if (metric.url == url) metrics.push(metric);
    }
    return metrics;
};
/**
 * Report a metric object by specified name.
 *
 * @param string name
 *   The name of the metric.
 *
 * @return object|null
 *   The metric object which is using the name or null on not found.
 */
CSTResource.prototype.getMetricByName = function(name) {
    var response = null;
    for (var i=0; i<this.resource.metrics; i++) {
        var metric = this.resource.metrics[i];
        if (metric.name == name) {
            response = metric;
            break;
        }
    }
    return response;
};
/**
 * Determine if a resource JSON object is valid or not.
 *
 * @param object resource
 *   The resource JSON object to check.
 *
 * @return bool
 *   true of the object is formatted well, false othwerwise.
 */
CSTResource.prototype.validResource = function (resource) {
    return true;
};
/**
 * Determine if a cache JSON object is valid or not.
 *
 * @param object cache
 *   The cache JSON object to check.
 *
 * @return bool
 *   true of the object is formatted well, false othwerwise.
 */
CSTResource.prototype.validCache = function (cache) {
    return true;
};
/**
 * Retrieve all metric values.
 *
 * @param array replacements
 *   An array of replacement values for variables in the metric.url
 * @param object callback
 *   A callback function to invoke when the metric has been parsed and a
 *   value is available.
 * @param bool flush
 *   (optional) Flush the cache.
 *
 * @return void
 *   No return value is provided, use callback function to receive an array
 *   of objects conaining the metric name and retrieved value, like:
 *     { name: 'price', value: '92.22' }
 */
CSTResource.prototype.fetchAllMetrics = function (replacements, callback, flush) {
    var thisCSTResource = this;
    var fetching = this.resource.metrics.length;
    for (var i=0; i<this.resource.metrics.length; i++) {
        var metric = this.resource.metrics[i];
        this.fetchMetric(metric, replacements, function() {
            // Record the end of async call to fetch metric. When the last metric
            // has been retrieved, and the array empty, then the callback will be
            // invoked.
            fetching = fetching - 1;
            if (!fetching) callback.call(this, this.cache.metrics);
        }, flush);
    }
}
/**
 * Retrieve metric value by accessing the metric url and using the selector.
 * A cached copy of the URL and metric value will be maintained. All url
 * fetches are made asyncronously.
 *
 * @param object metric
 *   The metric object to parse.
 * @param array replacements
 *   An array of replacement values for variables in the metric.url
 * @param object callback
 *   A callback function to invoke when the metric has been parsed and a
 *   value is available.
 * @param bool flush
 *   (optional) Flush the cache.
 *
 * @return string
 *   Value found in the html document.
 */
CSTResource.prototype.fetchMetric = function (metric, replacements, callback, flush) {
    if (typeof(flush) == 'undefined') flush = false;
    // Get the value by fetching the url and parsing the response if it has not
    // already been cached, or flush is specified, or the cache is older than
    // 60 minutes.
    if ((typeof(this.cache.metrics[metric.name]) == 'undefined') || flush 
        || (this.cache.metrics[metric.name].timestamp + 4 * 60 * 60 * 1000) < new Date().getTime()) {
        var url = this.replaceUrlVars(metric.url, replacements);
        this.fetchUrl(url, {}, function(html) {
            html = html.replace(/<img.*\>/g, '');
            html = html.replace(/<script.*>.*<\/script>/g, '');
            html = html.replace(/<script.*\/>/g, '');
            var value = $(html).find(metric.selector).text();
            if ((typeof(metric.regex) != 'undefined') && metric.regex.length) {
                var regex = new RegExp(metric.regex, 'g');
                if ((match = regex.exec(value)) !== null) {
                    value = match[1];
                }
            }
            this.cache.metrics[metric.name] = {};
            this.cache.metrics[metric.name].value = value;
            this.cache.metrics[metric.name].timestamp = new Date().getTime();
            callback.call(this, value);
        }, flush);
    // Get the value from cache.
    } else {
        var value = this.cache.metrics[metric.name].value;
        callback.call(this, value);
    }
 };
/**
 * Replace varibles in URL string.
 *
 * Static method.
 *
 * @param string url
 *   The url to replace variables in.
 * @param array replacements
 *   Objects containing variable names and their replacement value, like:
 *     { from: 'varName', to: 7 }
 *
 * return string
 *   The url with variables replaced.
 */
CSTResource.prototype.replaceUrlVars = function (url, replacements) {
    for (var i=0; i<replacements.length; i++) {
        var replacement = replacements[i];
        url = url.replace(replacement.from, replacement.to);
    }
    return url;
};
/**
 * Generate a default resource object.
 *
 * Static method.
 */
CSTResource.getDefaultResource = function () {
    var resource = {
        urls: [
            { url: 'http://finance.yahoo.com/q?s=SYMBOL' }
        ],
        metrics: [
            { name: 'price', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'span.time_rtq_ticker span' },
            { name: 'volume', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span' },
        ]
    };
    return resource;
};
