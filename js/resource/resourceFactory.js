
cstApp.factory('resource', function($rootScope) {
    var container = {};
    container.data = {};

    container.setResource = function(resource) {
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
        container.data = resource;
        container.broadcastResource();
    };

    container.getData = function() {
        return this.data;
    };

    container.addMetric = function(metric) {
        this.data.metrics.push(metric);
        this.broadcastResource();
    };

    container.removeMetric = function(index) {
        this.data.metrics.splice(index, 1);
        this.broadcastResource();
    };

    container.broadcastResource = function() {
        $rootScope.$broadcast('resourceUpdate');
    };

    container.save = function(callback) {
        // Remove angular hashes but store result as an object.
        var resource = JSON.parse(angular.toJson(container.data));
        chrome.storage.sync.set( {'resource': resource} , function() {
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
            container.setResource(result['resource']);
        }
    });

    // Listen for any updates to the resource in chrome storage.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                container.setResource(object.resource.newValue);
            }
        }
    });
  
    return container;
});
