
/**
 * Model to manage variable metrics.
 */
cstApp.factory('variable', ['$rootScope', 'resource', function($rootScope, resource) {
    /**
     * Private data and methods.
     */
    var pvt = {
        cache: []
    };

    /**
     * Public api.
     */
    var api = {};

    api.getCache = function(varName, callback) {
        if (typeof(pvt.cache[varName]) != 'undefined') {
            if (callback) callback.call(this, pvt.cache[varName]);
        } else {
            var parent = this;
            var cacheKey = 'cache_' + varName;
            chrome.storage.sync.get([cacheKey], function(result) {
                if (callback) callback.call(parent, result[cacheKey]);
            });
        }
    };

    api.setCache = function(varName, metrics) {
        // Write cache to local object.
        pvt.cache[varName] = {
            timestamp: new Date().getTime(),
            metrics: metrics
        };
        // Write cache to google storage.
        var data = {};
        var cacheKey = 'cache_' + varName;
        data[cacheKey] = pvt.cache[varName];
        chrome.storage.sync.set( data , function() {
            if (chrome.runtime.lastError) {
                console.log('Failed to save: ' + chrome.runtime.lastError.message);
            } else {
                console.log('Saved ' + cacheKey + '.');
            }
        });
    };
    /**
     * @param string varName
     *   The variable name.
     * @param function callback
     *   A callback function to invoke when results are ready.
     *
     * @return void
     *   Invokes callback function with arguments:
     *     metrics (array)
     *       An array of metrics keyed by metric name such as:
     *       ['Price': {timestamp: int, value: mixed}]
     */
    api.getMetrics = function(varName, callback) {
        var replacements = [
            { from: 'SYMBOL', to: varName }
        ];
        this.getCache(varName, function(cache) {
            if ((cache.timestamp + 60 * 60 * 1000) > new Date().getTime()) {
                console.log('Loading from factory cache ' + varName);
                if (callback) callback.call(this, cache.metrics);
            } else {
                console.log('Fetching ' + varName);
                var parent = this;
                var cstResource = new CSTResource(resource.getData());
                cstResource.fetchAllMetrics(replacements, function(metrics) {
                    parent.setCache(varName, metrics);
                    if (callback) callback.call(parent, metrics);
                });
            }
        });
    }; 

    return api;
}]);

/**
 * Model to manage configuration for displaying variables.
 */
cstApp.factory('variableConfig', ['$rootScope', 'resource', function($rootScope, resource) {
    /**
     * Private data and methods.
     */
    var pvt = {
        data: {
            items: []
        }
    };

    /**
     * Public api.
     */
    var api = {};

    api.setConfig = function(config) {
        pvt.data = config;
        this.broadcastUpdate();
    };

    api.getData = function() {
        return pvt.data;
    };

    api.addItem = function(item) {
        pvt.data.items.push(item);
        this.broadcastUpdate();
    };

    api.removeItem = function(index) {
        pvt.data.items.splice(index, 1);
        this.broadcastUpdate();
    };

    api.broadcastUpdate = function() {
        $rootScope.$broadcast('variableConfigUpdate');
    };

    api.save = function(callback) {
        chrome.storage.sync.set( {'tickerbar': this.getData()} , function() {
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
    chrome.storage.sync.get(['tickerbar'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load variable config from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            api.setConfig(result['tickerbar']);
        }
    });

    // Listen for any updates to the resource in chrome storage.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'tickerbar') {
                api.setConfig(object.resource.newValue);
            }
        }
    });

    return api;
}]);
