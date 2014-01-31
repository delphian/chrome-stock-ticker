
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
