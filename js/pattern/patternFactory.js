
cstApp.factory('patterns', ['$rootScope', 'appMeta', function($rootScope, appMeta) {
    /**
     * Private data and methods.
     */
    var pvt = {};
    /**
     * Ensure a pattern item object contains only valid properties and values.
     *
     * If any properties contain invalid data it will be removed. If the removal
     * results in an invalid item then the overall result will be considered
     * a failure; the item is unusable and should be discarded by the calling
     * code.
     *
     * @param object item
     *   Describes one specific way (from many) on how to search for a variable.
     *     - regex: (string) Regular expression to search with.
     *     - modifiers: (string) Modifiers option to Regexp()
     *     - result: (int) Result of the regex pattern match to claim as variable.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure to clean otherwise null.
     *     - item: (object) will be set on success. The cleaned item. See
     *       @param object item for details.
     */
    pvt.cleanItem = function(item) {
        var regex = '';
        var modifiers = '';
        var result = 1;
        if (typeof(item) != 'undefined') {
            if (typeof(item.regex) == 'string') regex = item.regex;
            if (typeof(item.modifiers) == 'string') modifiers = item.modifiers;
            if (typeof(item.result) == 'number') result = item.result;
        }
        if (!modifiers.length) modifiers = 'g';
        if (result < 1) result = 1;
        var cleanItem = {
            regex: regex,
            modifiers: modifiers,
            result: result
        };
        // if (!cleanItem.regex.length)
        //     return { success: false, message: 'Invalid item regex: ' + item.regex, item: cleanItem };
        return { success: true, message: null, item: cleanItem };
    };
    /**
     * Clean up a patterns object, or construct a new one.
     *
     * @param object patterns
     *   (optional) An existing patterns object to clean, such as one loaded
     *   from chrome storage, or imported via the gui. Properties:
     *     - loaded: (bool) true if the patterns came from storage or other
     *       code, false if this patterns is new.
     *     - lastSave: (int) last time this patterns was saved.
     *     - lastUpdate: (int) last time updates were checked for.
     *     - version: (string) application version at the time of last save.
     *     - autoUpdate: (bool) true if patterns should automatically add
     *       new data found in default data object or/and poll a remote source
     *       for updates.
     *     - items: (array) Collection of item pattern objects. Each object
     *       defines how to locate a variable. See cleanItem() for object
     *       details.
     *
     * @return object
     *   An object (report) with properties:
     *     - success: (bool) true on if patterns was clean, false if patterns
     *       required cleaning.
     *     - message: (string) will be set to the last issue resolved if
     *       patterns requried cleaning.
     *     - patterns: (object) A patterns object safe for storage and use,
     *       even if properties are empty. See @param patterns for object
     *       details.
     */
    pvt.cleanPatterns = function(patterns) {
        // Default report to return.
        var report = { success: true, message: null, patterns: null };
        // Default empty patterns object.
        var cleanPatterns = {
            loaded: false,
            lastSave: new Date().getTime(),
            lastUpdate: 0,
            version: appMeta.version,
            autoUpdate: true,
            items: []
        };
        if (typeof(patterns) != 'undefined') {
            cleanPatterns.loaded = true;
            if (typeof(patterns.lastSave) != 'undefined') cleanPatterns.lastSave = patterns.lastSave;
            if (typeof(patterns.lastUpdate) == 'number') cleanPatterns.lastUpdate = patterns.lastUpdate;
            if (typeof(patterns.autoUpdate) == 'boolean') cleanPatterns.autoUpdate = patterns.autoUpdate;
            if (typeof(patterns.version) == 'string') cleanPatterns.version = patterns.version;
            // Clean items. If in invalid items is found then disregard it.
            if (Object.prototype.toString.call(patterns.items) === '[object Array]') {
                for (var i in patterns.items) {
                    var result = this.cleanItem(patterns.items[i]);
                    if (result.success) {
                        cleanPatterns.items.push(result.item);
                    } else {
                        report.success = false;
                        report.message = result.message;
                    }
                }
            }
        }
        report.patterns = cleanPatterns;
        return report;
    };
    /**
     * Add a new pattern item to the patterns object.
     *
     * @param object item
     *   See cleanItem() for object details.
     * @param array itemList
     *   An array of item objects. See cleanItem() for object details.
     * @param bool broadcast
     *   Set to true if a broadcast update should be issued.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure.
     */
    pvt.addItem = function(item, itemList, broadcast) {
        var result = this.cleanItem(item);
        if (result.success) {
            itemList.push(result.item);
            if (broadcast) this.broadcastUpdate();
            return { success: true, message: null }
        }
        return result;
    };
    /**
     * Remove a pattern item from the patterns object.
     *
     * @param int index
     *   The array index of the item to remove.
     * @param array itemList
     *   An array of item objects. See cleanItem() for object details.
     * @param bool broadcast
     *   Set to true if a broadcast update should be issued.
     *
     * @return void
     *
     * @todo Add error checking and a normalized return object.
     */
    pvt.removeItem = function(index, itemList, broadcast) {
        itemList.splice(index, 1);
        if (broadcast) this.broadcastUpdate();
    };
    /**
     * Report any conflicting properties of a potential new pattern item to an
     * existing array of pattern items.
     *
     * @param object item
     *   See cleanItem() for object details.
     * @param array itemList
     *   An array of item objects. See cleanItem() for object details.
     *
     * @result object
     *   An object (exists) with a property for each property in the item
     *   object parameter (i.e: regex):
     *   - regex: (array) An array of objects each with the properties:
     *     - index: (int) The items index in the list where the conflict was
     *       found.
     *     - item: (object) The item that a property conflict was found on.
     *
     * Example usage:
     * @code
     *     var result = pvt.compareItem({ regex: '[A-Z]' }, itemList);
     *     // Check if any dulicates on the regex pattern were found.
     *     if (typeof(result['regex']) != 'undefined') {
     *         // Remove the duplicate item from the list.
     *         pvt.removeItem(result['regex'][0]['index'], itemList);
     *     }
     * @endcode
     */
    pvt.compareItem = function(item, itemList) {
        var exists = {};
        for (var key in item) {
            exists[key] = [];
            for (var i in itemList) {
                if (item[key] == itemList[i][key]) {
                    exists[key].push({ index: i, item: itemList[i] });
                }
            }
        }
        return exists;
    };
    /**
     * Get a copy of the patterns object.
     *
     * @return object
     *   See cleanPatterns() for object details.
     */
    pvt.getData = function() {
        return JSON.parse(JSON.stringify(this.data));
    };
    /**
     * Broadcast that the patterns object was updated.
     *
     * Controllers may listen for this with:
     * $scope.$on('patternsUpdate', function(event, data) {});
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
        $rootScope.$broadcast('patternsUpdate', data);
    };
    /**
     * Set patterns object to a new value.
     *
     * This will trigger a resource broadcast update.
     *
     * @param object patterns
     *   see cleanPatterns() for object details.
     * @param object broadcastData
     *   see broadcastUpdate() for object details.
     *
     * @return object
     *   An object (result) with properties:
     *     - success: (bool) true on success, false on failure.
     *     - message: (string) if success is false then this will be set to
     *       the last issue found when validating patterns object.
     */
    pvt.setPatterns = function(patterns, broadcastData) {
        // Make sure the patterns object is constructed properly.
        var result = this.cleanPatterns(patterns);
        if (result.success) {
            this.data = result.patterns;
            this.broadcastUpdate(broadcastData);
        }
        return result;
    };
    /**
     * Save patterns object to chrome storage.
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
        var patterns = JSON.parse(angular.toJson(this.data));
        patterns.lastSave = new Date().getTime();
        chrome.storage.sync.set( { 'patterns': patterns } , function() {
            if (typeof(callback) != 'undefined') {
                if (chrome.runtime.lastError) {
                    callback({ success: 0, message: chrome.runtime.lastError.message });
                } else {
                    callback({ success: 1, message: null });
                }
            }
        });
    };
    /**
     * Check for any remote updates to the patterns object and apply if found.
     *
     * Retrieves the update patterns object and overwrites the current.
     *
     * @return void
     */
    pvt.update = function() {
        var time = new Date().getTime();
        if (time > (this.data.lastUpdate + (24 * 60 * 60 * 1000))) {
            var parent = this;
            $.get(chrome.extension.getURL('data/patterns.json'), {}, function(data) {
                if (typeof(data) != 'undefined') {
                    var currentPatterns = parent.getData();
                    var updatePatterns = JSON.parse(data);
                    updatePatterns.lastUpdate = time;
                    var result = parent.setPatterns(updatePatterns, { apply: true } );
                    if (result.success) {
                        parent.save(function(result) {
                            if (result.success) {
                                console.log('Patterns has been updated.');
                            } else {
                                console.log('Patterns requires update but has failed to to save!');
                            }
                        });
                    } else {
                        console.log('Patterns requires update but could not merge objects.');
                    }
                }
            });
        }
    };
    // Load an empty (but balid) patterns object by default.
    pvt.data = pvt.cleanPatterns();

    /**
     * Public api.
     */
    var api = {};
    api.setPatterns = function(patterns, broadcastData) {
        return pvt.setPatterns(patterns, broadcastData);
    };
    api.cleanPatterns = function() {
        return pvt.cleanPatterns();
    };
    api.getData = function() {
        return pvt.getData();
    };
    api.addItem = function(item) {
        return pvt.addItem(item, pvt.data.items, true);
    };
    api.removeItem = function(item) {
        return pvt.removeItem(index, pvt.data.items, true);
    };
    api.save = function(callback) {
        return pvt.save(callback);
    };

    // When factory is first instantiated pull the patterns object out of
    // chrome storage. This will result in a broadcast update.
    chrome.storage.sync.get(['patterns'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load patterns object from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            // Clean the patterns, ignore any warnings (offenders removed).
            var patterns = pvt.cleanPatterns(result['patterns']).patterns;
            var result = api.setPatterns(patterns, { apply: true } );
            if (!result.success) {
                console.log('Could not apply patterns from chrome storage: ' + result.message);
                console.log(patterns);
            } else {
                if (patterns.autoUpdate) pvt.update();
            }
        }
    });

    // Listen for any updates to the patterns object in chrome storage. This
    // should only happen if multiple browsers are open, or if extension code
    // on the other side of the javascript firewall (popup versus options
    // versus content) has written a change to storage. This will result in a
    // broadcast update.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'patterns') {
                // Clean the resource, ignore any warnings (offenders removed).
                var patterns = pvt.cleanPatterns(object.resource.newValue).patterns;
                var result = api.setPatterns(patterns, { apply: true } );
                if (!result.success) {
                    console.log('Could not apply patterns from chrome storage: ' + result.message);
                    console.log(patterns);
                }
            }
        }
    });

    return api;
}]);
