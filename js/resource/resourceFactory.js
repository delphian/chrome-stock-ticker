
cstApp.factory('resource', function($rootScope) {
    /**
     * Private data and methods.
     */
    var data = {};

    /**
     * Public api.
     */
    var api = {};

    api.setResource = function(resource) {
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
        data = resource;
        api.broadcastResource();
    };

    api.getData = function() {
        return data;
    };

    /**
     * Get a simple array of metric name strings.
     *
     * @return array
     *   An array of strings, each being a full metric name.
     */
    api.getMetricNames = function() {
        var names = [];
        if (typeof(data.metrics) != 'undefined') {
            for (i in data.metrics) {
                names.push(data.metrics[i].name);
            }
        }
        return names;
    }

    api.addMetric = function(metric) {
        data.metrics.push(metric);
        this.broadcastResource();
    };

    api.removeMetric = function(index) {
        data.metrics.splice(index, 1);
        this.broadcastResource();
    };

    api.addUrl = function(url) {
        data.urls.push(url);
        this.broadcastResource();
    };

    api.removeUrl = function(index) {
        data.urls.splice(index, 1);
        this.broadcastResource();
    };

    api.broadcastResource = function() {
        $rootScope.$broadcast('resourceUpdate');
    };

    api.save = function(callback) {
        // Remove angular hashes but store result as an object.
        var resource = JSON.parse(angular.toJson(data));
        chrome.storage.sync.set( {'resource': data} , function() {
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
            api.setResource(result['resource']);
        }
    });

    // Listen for any updates to the resource in chrome storage.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                api.setResource(object.resource.newValue);
            }
        }
    });
  
    return api;
});
