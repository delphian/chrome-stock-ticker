
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
 */

/**
 * @param object resource
 *   A JSON object mapping metrics (a piece of information) to resources on
 *   the internet (resources are specified with a url and a css selector).
 * @param object cache
 *   (optional) Preloaded cache object that contains the results of the
 *   previous fetching of all metrics.
 */
GSTResource = function(resource, cache) {
    if (!this.validResource(resource)) {
        throw 'Provided resource JSON is not valid.';
    }
    this.resource = resource;

    // Store results of metric fetching.
    this.cache = {
        urls: {},
        metrics: {}
    };
    if (typeof(cache) != 'undefined') this.cache = cache;
    // Any ajax calls will be recorded in this array until finished.
    this.fetching = [];
    // Any metric fetch calls are recorded in this array until finished.
    this.fetchingMetric = [];
};
/**
 * Remove a url from the fetching array. When the fetching array is empty
 * then the callback function will be invoked.
 *
 * @param string url
 *   The url to remove from the fetching array, generally because the fetch
 *   has completed.
 * @param object callback
 *   Invoke callback when fetching array is empty. In a loop to fetch all urls
 *   firing this callback indicates all urls have been fetched.
 */
GSTResource.prototype.fetchingRemove = function(url, callback) {
    this.fetching.splice(this.fetching.indexOf(url), 1);
    if (!this.fetching.length) {
        callback();
    }
}
/**
 * Remove a metric name from the fetchingMetric array. When the array is empty
 * then the callback function will be invoked, indicating that all metrics
 * have been retrieved.
 *
 * @param string name
 *   The name to remove from the array, generally because the fetch has
 *   completed.
 * @param object callback
 *   Invoke callback when array is empty. In a loop to fetch all metrics
 *   firing this callback indicates all metrics have been fetched.
 */
GSTResource.prototype.fetchingMetricRemove = function(name, callback) {
    this.fetchingMetric.splice(this.fetchingMetric.indexOf(name), 1);
    if (!this.fetchingMetric.length) {
        callback(this.cache.metrics);
    }
}
/**
 * Fetch a URL from the internet.
 *
 * This is an async method call.
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
GSTResource.prototype.fetchUrl = function(url, params, callback) {
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
 * Report all URLs required by all metrics in the resource.
 *
 * @return array
 *   An array of URLs.
 */
GSTResource.prototype.getMetricUrls = function() {
    var urls = [];
    for (var i=0; i<this.resource.metrics; i++) {
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
GSTResource.prototype.getMetricsByUrl = function(url) {
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
GSTResource.prototype.getMetricByName = function(name) {
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
GSTResource.prototype.validResource = function (resource) {
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
GSTResource.prototype.validCache = function (cache) {
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
GSTResource.prototype.fetchAllMetrics = function (replacements, callback, flush) {
    var thisGSTResource = this;
    for (var i=0; i<this.resource.metrics.length; i++) {
        var metric = this.resource.metrics[i];
        // Record the begining of an async call to fetch metric value.
        this.fetchingMetric.push(metric.name);
        this.fetchMetric(metric, replacements, function() {
            // Record the end of async call to fetch metric. When the last metric
            // has been retrieved, and the array empty, then the callback will be
            // invoked by the remove method.
            thisGSTResource.fetchingMetricRemove(metric.name, callback);
        }, flush);
    }
}
/**
 * Retrieve metric value by accessing the metric url and using the selector.
 * A cached copy of the URL and metric value will be maintained.
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
GSTResource.prototype.fetchMetric = function (metric, replacements, callback, flush) {
    if (typeof(flush) == 'undefined') flush = false;
    var thisGSTResource = this;
    var url = this.replaceUrlVars(metric.url, replacements);
    if (typeof(this.cache.urls[url]) == 'undefined' || flush) {
        this.fetchUrl(url, {}, function(html) {
            var value = $(html).find(metric.selector).text();
            thisGSTResource.cache.urls[url] = {};
            thisGSTResource.cache.urls[url].html = html;
            thisGSTResource.cache.urls[url].timestamp = new Date().getTime();
            thisGSTResource.cache.metrics[metric.name] = {};
            thisGSTResource.cache.metrics[metric.name].value = value;
            thisGSTResource.cache.metrics[metric.name].timestamp = new Date().getTime();
            callback(value);
        });
    } else {
        var value = null;
        if (this.cache.metrics[metric.name] == 'undefined' || flush) {
            var html = this.cache.urls[url].html;
            value = $(html).find(metric.selector).text();
            this.cache.metrics[metric.name].value = value;
            this.cache.metrics[metric.name].timestamp = new Date().getTime();
        } else {
            value = this.cache.metrics[metric.name].value;
        }
        callback(value);
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
GSTResource.prototype.replaceUrlVars = function (url, replacements) {
    for (var i=0; i<replacements.length; i++) {
        var replacement = replacements[i];
        url = url.replace(replacement.from, replacement.to);
    }
    return url;
};
