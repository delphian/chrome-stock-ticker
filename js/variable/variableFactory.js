
/**
 * Model to manage variable metrics.
 */
cstApp.factory('variable', ['$rootScope', 'resource', 'appMeta', function($rootScope, resource, appMeta) {
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

    /**
     * Get variable metrics from cache if they exist.
     *
     * @param string varName
     *   Cache key name to query storage against.
     * @param function callback
     *   Callback will be invoked with cache results.
     *
     * @return void
     *   Callback will be invoked with arguments:
     *     - result[cacheKey]: (object|undefined) with properties:
     *       - timestamp: (int) Time that the cache was set.
     *       - metrics: (object) An object with metric names as each property.
     *         If price is a metric property then:
     *         - price: (object) An object with properties:
     *           - timestamp: (int) The time that the value was set.
     *           - value: (mixed) The value of this metric.
     */
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
            // Cache for 2 hours.
            if ((typeof(cache) != 'undefined') && (cache.timestamp + 2 * 60 * 60 * 1000) > new Date().getTime()) {
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
cstApp.factory('variableConfig', ['$rootScope', 'resource', 'appMeta', function($rootScope, resource, appMeta) {
    /**
     * Private data and methods. These are not directly accesible to
     * controllers or other factory services.
     */
    var pvt = {
        data: {
            // An array of objects, each defining a metric that should be
            // displayed when a variable is rendered. See addItem() for object
            // details.
            items: []
        }
    };
    /**
     * Ensure a metric display item contains only valid properties and values.
     *
     * @param object item
     *   Metric to be displayed when a variable is rendered. Valid properties:
     *     - name: (string) A full name of a resource metric.
     *     - source: (string) The text to display above the metric.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure to clean otherwise null.
     *     - item: (object) will be set on success. The cleaned item with
     *       properties:
     *       - name: (string) A full name of a resource metric.
     *       - source: (string) The text to display above the metric.
     */
    pvt.cleanItem = function(item) {
        cleanItem = {
            name: item.name,
            source: item.source
        };
        if (resource.getMetricNames().indexOf(cleanItem.name) == -1)
            return { success: false, message: 'Invalid resource metric name: ' + cleanItem.name };
        if (!item.source.length)
            return { success: false, message: 'Invalid abbreviation text: ' + cleanItem.name };
        return { success: true, item: cleanItem };
    };
    /**
     * Add a metric to be displayed when a variable is rendered.
     *
     * @param object item
     *   See pvt.cleanItem() for object details.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure.
     */
    pvt.addItem = function(item) {
        var result = this.cleanItem(item);
        if (result.success) {
            this.data.items.push(result.item);
            return { success: true, message: null };
        }
        return result;
    };
    /**
     * Clean up the data object, or construct a new one.
     *
     * @param object data
     *   (optional) An existing data object to clean, such as one loaded
     *   from chrome storage, or imported via the gui. Properties:
     *     - loaded: (bool) true if the data object came from storage or other
     *       code, false if this data object is new.
     *     - lastSave: (int) last time this object was saved.
     *     - lastUpdate: (int) last time updates were checked for.
     *     - version: (string) application version at the time of last save.
     *     - autoUpdate: (bool) true if object should automatically add
     *       new data found in default data object or/and poll a remote source
     *       for updates.
     *     - alwaysDisplay: (bool) true if variable bar should always been
     *       displayed even if no variables detected on page.
     *     - items: (array) Collection of metric objects to show when
     *       displaying a variable. See cleanItem() for object details.
     *
     * @return object
     *   An object (report) with properties:
     *     - success: (bool) true on if object was valid, false if object
     *       required cleaning.
     *     - message: (string) will be set to the last issue resolved if
     *       object requried cleaning.
     *     - data: (object) A links object safe for storage and use,
     *       even if properties are empty. See @param data for object
     *       details.
     */
    pvt.cleanData = function(data) {
        // Default report to return.
        var report = { success: true, message: null, data: null };
        // Default empty object.
        var cleanData = {
            loaded: false,
            lastSave: new Date().getTime(),
            lastUpdate: 0,
            // version: appMeta.version,
            autoUpdate: true,
            alwaysDisplay: true,
            items: []
        };
        if (typeof(data) != 'undefined') {
            cleanData.loaded = true;
            if (typeof(data.lastSave) != 'undefined') cleanData.lastSave = data.lastSave;
            if (typeof(data.lastUpdate) == 'number') cleanData.lastUpdate = data.lastUpdate;
            if (typeof(data.autoUpdate) == 'boolean') cleanData.autoUpdate = data.autoUpdate;
            if (typeof(data.alwaysDisplay) == 'boolean') cleanData.alwaysDisplay = data.alwaysDisplay;
            if (typeof(data.version) == 'string') cleanData.version = data.version;
            if (typeof(data.items) != 'undefined') {
                for (var i in data.items) {
                    var result = this.cleanItem(data.items[i]);
                    if (result.success) {
                        cleanData.items.push(result.item);
                    } else {
                        report.success = false;
                        report.message = result.message;
                    }
                }
            }
        }
        report.data = cleanData;
        return report;
    };
    /**
     * Set data object to a new value.
     *
     * This will trigger a broadcast update.
     *
     * @param object data
     *   see cleanData() for object details.
     * @param object broadcastData
     *   see broadcastUpdate() for object details.
     *
     * @return object
     *   An object (result) with properties:
     *     - success: (bool) true on success, false on failure.
     *     - message: (string) if success is false then this will be set to
     *       the last issue found when validating data object.
     */
    pvt.setData = function(data, broadcastData) {
        // Make sure the data object is constructed properly.
        var result = this.cleanData(data);
        if (result.success) {
            this.data = result.data;
            api.broadcastUpdate(broadcastData);
        }
        return result;
    };

    /**
     * Public api.
     */
    var api = {};
    api.setData = function(data, broadcastData) {
        return pvt.setData(data, broadcastData);
    };
    /**
     * Get a copy of the variable display configuration object.
     *
     * @return object
     */
    api.getData = function() {
        return JSON.parse(JSON.stringify(pvt.data));
    };
    /**
     * Add a metric to be displayed when a variable is rendedred.
     *
     * This will trigger a variable configuration broadcast udpate.
     *
     * @param object item
     *   See pvt.cleanItem() for object details.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure.
     */
    api.addItem = function(item) {
        var result = pvt.addItem(item);
        if (!result.success) return result;
        this.broadcastUpdate();
        return { success: true, message: null }
    };
    /**
     * Remove a metric from being displayed when a variable is rendered.
     *
     * This will trigger a variable configuration broadcast udpate.
     *
     * @param int index
     *   The array index of the metric to remove.
     *
     * @return void
     */
    api.removeItem = function(index) {
        pvt.data.items.splice(index, 1);
        this.broadcastUpdate();
    };
    /**
     * Broadcast that the variable display configuration was updated.
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
        $rootScope.$broadcast('variableConfigUpdate', data);
    };
    /**
     * Save the current variable display configuration to chrome storage.
     *
     * @param function callback
     *   A function callback to be invoked when save is done with arguments:
     *     result (object)
     *       - success: (bool) true if save was sucessful, false otherwise.
     *       - message: (string) will be set if success is false.
     */
    api.save = function(callback) {
        var parent = this;
        chrome.storage.sync.set( {'tickerbar': this.getData()} , function() {
            if (typeof(callback) != 'undefined') {
                if (chrome.runtime.lastError) {
                    callback({ success: 0, message: chrome.runtime.lastError.message });
                } else {
                    parent.broadcastUpdate();
                    callback({ success: 1, message: null });
                }
            }
        });
    };

    // When factory is first instantiated pull the variable display
    // configuration object out of chrome storage. This will result
    // in a broadcast update.
    chrome.storage.sync.get(['tickerbar'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load variable config from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            var config = pvt.cleanData(result['tickerbar']).data;
            var result = api.setData(config, { apply: true } );
            if (!result.success) {
                console.log('Could not apply variable config from chrome storage: ' + result.message);
                console.log(config);
            }
        }
    });

    // Listen for any updates to the variable display configuration object
    // in chrome storage. This should only happen if multiple browsers are
    // open, or if extension code on the other side of the javascript
    // firewall (popup versus options versus content) has written a change
    // to storage.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'tickerbar') {
                var config = pvt.cleanData(object.tickerbar.newValue).data;
                var result = api.setData(config, { apply: true } );
                if (!result.success) {
                    console.log('Could not apply variable config from chrome storage: ' + result.message);
                    console.log(config);
                }
            }
        }
    });

    return api;
}]);
