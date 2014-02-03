
cstApp.factory('resource', function($rootScope) {
    /**
     * Private data and methods.
     */
    var pvt = {};
    /**
     * Ensure a resource url object contains only valid properties and values.
     */
    pvt.cleanUrl = function(url) {
        var cleanUrl = url;
        return { success: true, message: null, url: cleanUrl };
    }
    /**
     * Ensure a resource metric object contains only valid properties and values.
     *
     * If any properties contain invalid data it will be removed. If the removal
     * results in an invalid metric then the overall result will be considered
     * a failure; the metric is unusable and should be discarded by the calling
     * code.
     *
     * @param object metric
     *   Describes how to obtain a descrete piece of information (metric) from
     *   the internet:
     *     - name: (string) Name that describes this metric.
     *     - url: (string) Address to retrieve html from.
     *     - selector: (string) CSS selector to use on html.
     *     - regex: (string) (optional) Regular expression to run on result of selector.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure to clean otherwise null.
     *     - metric: (object) will be set on success. The cleaned metric. See
     *       @param object metric for details.
     */
    pvt.cleanMetric = function(metric) {
        var name = '';
        var url = '';
        var selector = '';
        var regex = '';
        if (typeof(metric) != 'undefined') {
            if (typeof(metric.name) == 'string') name = metric.name;
            if (typeof(metric.url) == 'string') url = metric.url;
            if (typeof(metric.selector) == 'string') selector = metric.selector;
            if (typeof(metric.regex) == 'string') regex = metric.regex;
        }
        cleanMetric = {
            name: name,
            url: url,
            selector: selector,
            regex: regex
        };
        cleanMetric.name = cleanMetric.name.replace(/([^A-Za-z0-9 ]+)/g, '');
        if (!cleanMetric.name.length) {
            console.log(metric);
            return { success: false, message: 'Invalid metric name: ' + metric.name, metric: cleanMetric };
        }
        if (!cleanMetric.url.length)
            return { success: false, message: 'Invalid metric url: ' + metric.name, metric: cleanMetric };
        if (!cleanMetric.selector.length)
            return { success: false, message: 'Invalid metric selector: ' + metric.name, metric: cleanMetric };
        return { success: true, message: null, metric: cleanMetric };
    }
    /**
     * Clean up a resource object, or construct a new one.
     *
     * @param object resource
     *   (optional) An existing resource object to clean, such as one loaded
     *   from chrome storage, or imported via the gui. Properties:
     *     - loaded: (bool) true if the resource came from storage or other
     *       code, false if this resource is new.
     *     - timestamp: (int) last time this resource was saved.
     *     - autoUpdate: (bool) true if resource should automatically add
     *       new data found in default data object or/and poll a remote source
     *       for updates.
     *     - urls: (array) For future use. This object will store what
     *       operations may need to be performed before access to a url will
     *       be granted (such as login). See cleanUrls() for object details.
     *     - metrics: (array) An array of objects. Each object stores
     *       information required to access a single piece of information
     *       on a remote website. See cleanMetric() for object details.
     *
     * @return object
     *   An object (report) with properties:
     *     - success: (bool) true on if resource was clean, false if resource
     *       required cleaning.
     *     - message: (string) will be set to the last issue resolved when
     *       resource requried cleaning.
     *     - resource: (object) A resource object safe for storage and use,
     *       even if properties are empty. See @param resource for object
     *       details.
     */
    pvt.cleanResource = function(resource) {
        // Default report to return.
        var report = { success: true, message: null, resource: null };
        // Default empty resource.
        var cleanResource = {
            loaded: false,
            timestamp: new Date().getTime(),
            autoUpdate: true,
            urls: [],
            metrics: []
        };
        if (typeof(resource) != 'undefined') {
            cleanResource.loaded = true;
            if (typeof(resource.timestamp) != 'undefined') cleanResource.timestamp = resource.timestamp;
            if (typeof(resource.autoUpdate) == 'boolean') cleanResource.autoUpdate = resource.autoUpdate;
            // Clean metrics. If in invalid metric is found then disregard it.
            if (Object.prototype.toString.call(resource.metrics) === '[object Array]') {
                for (i in resource.metrics) {
                    var result = this.cleanMetric(resource.metrics[i]);
                    if (result.success) {
                        cleanResource.metrics.push(result.metric);
                    } else {
                        report.success = false;
                        report.message = result.message;
                    }
                }
            }
            // Clean urls. If a invalid url is found then disregard it.
            if (Object.prototype.toString.call(resource.urls) === '[object Array]') {
                for (i in resource.urls) {
                    var result = this.cleanUrl(resource.urls[i]);
                    if (result.success) {
                        cleanResource.urls.push(result.url);
                    } else {
                        report.success = false;
                        report.message = result.message;
                    }
                }
            }
        }
        report.resource = cleanResource;
        return report;
    }
    /**
     * Add a new metric to the resource.
     *
     * @param object metric
     *   See pvt.cleanMetric for object details.
     * @param bool broadcast
     *   Set to true if a broadcast update should be issued.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure.
     *
     * @todo Do not add if a metric with same name already exists.
     */
    pvt.addMetric = function(metric, broadcast) {
        var result = this.cleanMetric(metric);
        if (result.success) {
            this.data.metrics.push(result.metric);
            if (broadcast) this.broadcastUpdate();
            return { success: true, message: null }
        }
        return result;
    };
    /**
     * Remove a metric from the resource.
     *
     * @param int index
     *   The array index of the metric to remove.
     * @param bool broadcast
     *   Set to true if a broadcast update should be issued.
     *
     * @return void
     *
     * @todo Add error checking and a normalized return object.
     */
    pvt.removeMetric = function(index, broadcast) {
        this.data.metrics.splice(index, 1);
        if (broadcast) this.broadcastUpdate();
    };
    /**
     * Add a url to the resource.
     *
     * @todo Add error checking and a normalized return object.
     */
    pvt.addUrl = function(url, broadcast) {
        this.data.urls.push(url);
        if (broadcast) this.broadcastUpdate();
    };
    /**
     * Remove a url from the resource.
     *
     * @todo Add error checking and a normalized return object.
     */
    pvt.removeUrl = function(index, broadcast) {
        this.data.urls.splice(index, 1);
        if (broadcast) this.broadcastUpdate();
    };
    /**
     * Sort array of metric objects in alphabetical order based on metric name.
     *
     * @param array metrics
     *   An array of metric objects. See pvt.cleanMetric() for object details.
     *
     * @return array
     *   The sorted array (sortedMetircs), or empty array on error.
     */
    pvt.sortMetrics = function(metrics) {
        var sortedMetrics = [];
        if (Object.prototype.toString.call(metrics) === '[object Array]') {
            for (i in metrics) {
                sortedMetrics.push(metrics[i]);
                sortedMetrics.sort(function(a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 1;
                });
            }
        }
        return sortedMetrics;
    };
    /**
     * Get a simple array of metric name strings.
     *
     * @return array
     *   An array (names) of strings, each being a full metric name.
     */
    pvt.getMetricNames = function() {
        var names = [];
        if (typeof(this.data.metrics) != 'undefined') {
            for (i in this.data.metrics) {
                names.push(this.data.metrics[i].name);
            }
        }
        return names;
    };
    /**
     * Get a copy of the resource object.
     *
     * @return object
     */
    pvt.getData = function() {
        return JSON.parse(JSON.stringify(this.data));
    };
    /**
     * Broadcast that the resource was updated.
     *
     * Controllers may listen for this with:
     * $scope.$on('resourceUpdate', function(event, data) {});
     *
     * @param object data
     *   An object to broadcast to the rootScope.
     *     - apply: (bool) true to instruct watchers that they should manually
     *       resync with $scope.$apply(). This may need to be done if the
     *       broadcast was originally triggered by chrome.storage methods. This
     *       is probably a hack; a better solution exists somewhere.
     *
     * @return void
     */
    pvt.broadcastUpdate = function(data) {
        if (typeof(data) == 'undefined') {
            data = { apply: false };
        }
        $rootScope.$broadcast('resourceUpdate', data);
    };
    /**
     * Set resource object to a new value.
     *
     * This will trigger a resource broadcast update.
     *
     * @param object resource
     *   see cleanResource() for details.
     * @param object broadcastData
     *   see broadcastUpdate() for object details.
     *
     * @return object
     *   An object (result) with properties:
     *     - success: (bool) true on success, false on failure.
     *     - message: (string) will be set to the last issue found when
     *       validating resource.
     */
    pvt.setResource = function(resource, broadcastData) {
        // Order metrics alphabetically.
        resource.metrics = this.sortMetrics(resource.metrics);
        // Make sure the resource is constructed properly.
        var result = this.cleanResource(resource);
        if (result.success) {
            this.data = result.resource;
            this.broadcastUpdate(broadcastData);
        }
        return result;
    };
    /**
     * Save resource object to chrome storage.
     *
     * @param function callback
     *   Callback will be invoked when saving is finished.
     *
     * @return object
     *   An object (result) with properties:
     *     - success: (bool) true on success, false on failure.
     *     - message: (string) will be set on failure.
     */
    pvt.save = function(callback) {
        // Remove angular hashes but store result as an object.
        var resource = JSON.parse(angular.toJson(this.data));
        chrome.storage.sync.set( { 'resource': resource } , function() {
            if (typeof(callback) != 'undefined') {
                if (chrome.runtime.lastError) {
                    callback({ success: 0, message: chrome.runtime.lastError.message });
                } else {
                    callback({ success: 1, message: null });
                }
            }
        });
    };
    // Load an empty resource by default.
    pvt.data = pvt.cleanResource();

    /**
     * Public api.
     */
    var api = {};
    api.setResource = function(resource, broadcastData) {
        return pvt.setResource(resource, broadcastData);
    };
    api.cleanResource = function() {
        return pvt.cleanResource();
    }
    api.getData = function() {
        return pvt.getData();
    };
    api.getMetricNames = function() {
        return pvt.getMetricNames();
    };
    api.addMetric = function(metric) {
        return pvt.addMetric(metric, true);
    };
    api.removeMetric = function(index) {
        return pvt.removeMetric(index, true);
    };
    api.addUrl = function(url) {
        return pvt.addUrl(url, true);
    };
    api.removeUrl = function(index) {
        return pvt.removeUrl(index, true);
    };
    api.save = function(callback) {
        return pvt.save(callback);
    };

    // When factory is first instantiated pull the resource object out of
    // chrome storage. This will result in a broadcast update.
    chrome.storage.sync.get(['resource'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load resource from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            // Clean the resource, ignore any warnings (offenders removed).
            var result = pvt.cleanResource(result['resource']);
            var resource = result.resource;
            var result = api.setResource(resource, { apply: true } );
            if (!result.success) {
                console.log('Could not apply resource from chrome storage: ' + result.message);
                console.log(resource);
            }
        }
    });

    // Listen for any updates to the resource object in chrome storage. This
    // should only happen if multiple browsers are open, or if extension code
    // on the other side of the javascript firewall (popup versus options
    // versus content) has written a change to storage. This will result in a
    // broadcast update.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                // Clean the resource, ignore any warnings (offenders removed).
                var result = pvt.cleanResource(object.resource.newValue);
                var resource = result.resource;
                var result = api.setResource(resource, { apply: true } );
                if (!result.success) {
                    console.log('Could not apply resource from chrome storage: ' + result.message);
                    console.log(resource);
                }
            }
        }
    });
  
    return api;
});
