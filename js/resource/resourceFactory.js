
cstApp.factory('resource', function($rootScope) {
    /**
     * Private data and methods.
     */
    var pvt = {};
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
        if (!cleanMetric.name.length)
            return { success: false, message: 'Invalid metric name: ' + metric.name, metric: cleanMetric }
        if (!cleanMetric.url.length)
            return { success: false, message: 'Invalid metric url: ' + metric.name, metric: cleanMetric }
        if (!cleanMetric.selector.length)
            return { success: false, message: 'Invalid metric selector: ' + metric.name, metric: cleanMetric }
        return { success: true, message: null, metric: cleanMetric }
    }
    /**
     * Clean up a resource object, or construct a new one.
     *
     * @param object resource
     *   (optional) An existing resource object to clean,
     *   such as one loaded from chrome storage, or imported via the gui.
     *
     * @return object
     *   Will always return a valid resource object, even if its properties
     *   are empty.
     */
    pvt.cleanResource = function(resource) {
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
            cleanResource.timestamp = resource.timestamp;
            if (typeof(resource.autoUpdate) == 'boolean') cleanResource.autoUpdate = resource.autoUpdate;
            // Clean metrics. If in invalid metric is found then disregard it.
            if (Object.prototype.toString.call(resource.metrics) === '[object Array]') {
                for (i in resource.metrics) {
                    var result = this.cleanMetric(resource.metrics[i]);
                    if (result.success) cleanResource.metrics.push(result.metric);
                }
            }
            // Clean urls. If a invalid url is found then disregard it.
            if (Object.prototype.toString.call(resource.urls) === '[object Array]') {
                for (i in resource.urls) {
                    var result = this.cleanUrls(resource.urls[i]);
                    if (result.success) cleanResource.urls.push(result.url);
                }
            }
        }
        return cleanResource;
    }
    // Load an empty resource by default.
    pvt.data = pvt.cleanResource();

    /**
     * Public api.
     */
    var api = {};

    /**
     * @param object broadcastData
     *   see broadcastUpdate() for object details.
     */
    api.setResource = function(resource, broadcastData) {
        // Order metrics alphabetically.
        var newMetrics = [];
        for (i in resource.metrics) {
            newMetrics.push(resource.metrics[i]);
            newMetrics.sort(function(a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                return 1;
            });
        }
        resource.metrics = newMetrics;
        pvt.data = resource;
        this.broadcastUpdate(broadcastData);
    };

    api.getData = function() {
        return pvt.data;
    };

    /**
     * Get a simple array of metric name strings.
     *
     * @return array
     *   An array of strings, each being a full metric name.
     */
    api.getMetricNames = function() {
        var names = [];
        if (typeof(pvt.data.metrics) != 'undefined') {
            for (i in pvt.data.metrics) {
                names.push(pvt.data.metrics[i].name);
            }
        }
        return names;
    }

    api.addMetric = function(metric) {
        pvt.data.metrics.push(metric);
        this.broadcastUpdate();
    };

    api.removeMetric = function(index) {
        pvt.data.metrics.splice(index, 1);
        this.broadcastUpdate();
    };

    api.addUrl = function(url) {
        pvt.data.urls.push(url);
        this.broadcastUpdate();
    };

    api.removeUrl = function(index) {
        pvt.data.urls.splice(index, 1);
        this.broadcastUpdate();
    };

    /**
     * Broadcast that the resource was updated.
     *
     * Controllers may listen for this with:
     * $scope.$on('variableConfigUpdate', function(event, data) {});
     *
     * @param object data
     *   An object to broadcast to the rootScope.
     *     - apply: (bool) true to instruct watchers that they should manually
     *       resync with $scope.$apply(). This may need to be done if the
     *       broadcast was originally triggered by chrome.storage methods. This
     *       is probably a hack; a better solution exists somewhere.
     */
    api.broadcastUpdate = function(data) {
        if (typeof(data) == 'undefined') {
            data = { apply: false };
        }
        $rootScope.$broadcast('resourceUpdate', data);
    };

    api.save = function(callback) {
        // Remove angular hashes but store result as an object.
        var resource = JSON.parse(angular.toJson(pvt.data));
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

    // Pull the resource out of chrome storage.
    chrome.storage.sync.get(['resource'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load resource from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            api.setResource(result['resource'], { apply: true } );
        }
    });

    // Listen for any updates to the resource in chrome storage.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                api.setResource(object.resource.newValue, { apply: true } );
            }
        }
    });
  
    return api;
});
