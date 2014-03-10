
/**
 * @file
 * All factories for use with lists of variables. A list is nothing more than
 * a predefined collection of variables.
 */

cstApp.factory('lists', ['$rootScope', 'appMeta', function($rootScope, appMeta) {
    /**
     * Private data and methods.
     */
    var pvt = {};
    /**
     * Ensure an individual list object contains only valid properties and
     * values.
     *
     * If any properties contain invalid data it will be removed. If the removal
     * results in an invalid item then the overall result will be considered
     * a failure; the item is unusable and should be discarded by the calling
     * code.
     *
     * @param object item
     *   Describes a collection of variables and meta data describing the
     *   collection:
     *     - name: (string) Name of the list.
     *     - variables: (array) An array of strings, each being a single
     *       variable.
     *
     * @return object
     *   An object with properties:
     *     - success: (bool) true on success, false otherwise.
     *     - message: (string) will be set on failure to clean otherwise null.
     *     - item: (object) will be set on success. The cleaned item. See
     *       @param object item for details.
     */
    pvt.cleanItem = function(item) {
        var name = '';
        var variables = [];
        if (typeof(item) != 'undefined') {
            if (typeof(item.name) == 'string') name = item.name;
            if (Object.prototype.toString.call(item.variables) === '[object Array]') variables = item.variables;
        }
        var cleanItem = {
            name: name,
            variables: variables,
        };
        if (!cleanItem.name.length)
            return { success: false, message: 'Invalid item name: ' + item.name, item: cleanItem };
        return { success: true, message: null, item: cleanItem };
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
     *     - items: (object) Container for individual collections of lists:
     *       - default: (array) Collection of individual lists. Each object
     *         defines a set of variables, with associated meta data on for
     *         the list itself. See cleanItem() for object details. These
     *         lists are only created and managed by the application.
     *       - custom: (array) Same as default, but created and managed by the
     *         end user.
     *
     * @return object
     *   An object (report) with properties:
     *     - success: (bool) true on if object was valid, false if object
     *       required cleaning.
     *     - message: (string) will be set to the last issue resolved if
     *       object requried cleaning.
     *     - data: (object) A lists object safe for storage and use,
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
            version: appMeta.version,
            autoUpdate: true,
            useDefault: true,
            items: {
                default: [],
                custom: []
            }
        };
        if (typeof(data) != 'undefined') {
            cleanData.loaded = true;
            if (typeof(data.lastSave) != 'undefined') cleanData.lastSave = data.lastSave;
            if (typeof(data.lastUpdate) == 'number') cleanData.lastUpdate = data.lastUpdate;
            if (typeof(data.autoUpdate) == 'boolean') cleanData.autoUpdate = data.autoUpdate;
            if (typeof(data.useDefault) == 'boolean') cleanData.useDefault = data.useDefault;
            if (typeof(data.version) == 'string') cleanData.version = data.version;
            // Clean items. If in invalid item is found then disregard it.
            if (typeof(data.items != 'undefined')) {
                for (var i in data.items) {
                    if (Object.prototype.toString.call(data.items[i]) === '[object Array]') {
                        for (var j in data.items[i]) {
                            var result = this.cleanItem(data.items[i][j]);
                            if (result.success) {
                                cleanData.items[i].push(result.item);
                            } else {
                                report.success = false;
                                report.message = result.message;
                            }
                        }
                    }
                }
            }
        }
        report.data = cleanData;
        return report;
    };
    /**
     * Add a list to an array of lists.
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
     * Remove a list item from an array of list of items.
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
     * Report any conflicting properties of a potential new item to an
     * existing array of items.
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
            for (var i in itemList) {
                if (item[key] == itemList[i][key]) {
                	if (typeof(exists[key]) == 'undefined')
                		exists[key] = [];
                    exists[key].push({ index: i, item: itemList[i] });
                }
            }
        }
        return exists;
    };
    /**
     * Get a copy of the data object.
     *
     * @return object
     *   See cleanData() for object details.
     */
    pvt.getData = function() {
        return JSON.parse(JSON.stringify(this.data));
    };
    /**
     * Broadcast that the data object was updated.
     *
     * Controllers may listen for this with:
     * $scope.$on('linksUpdate', function(event, data) {});
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
        $rootScope.$broadcast('listsUpdate', data);
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
            this.broadcastUpdate(broadcastData);
        }
        return result;
    };
    /**
     * Save data object to chrome storage.
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
        var data = JSON.parse(angular.toJson(this.data));
        data.lastSave = new Date().getTime();
        chrome.storage.sync.set( { 'lists': data } , function() {
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
     * Reset data object to the default json object file, save results to
     * storage.
     *
     * @param function callback
     *   Callback will be invoked when saving is finished.
     * @param object resetData
     *   (optional) If provided then this object will be used to reset against
     *   instead of reading from the default json object file.
     *
     * @return void
     *   Callback is invoked when operation is finished with arguments:
     *   - result: (object) An object with properties:
     *     - success: (bool) true on success, false on failure.
     *     - message: (string) will be set on failure.
     */
    pvt.reset = function(callback, resetData) {
        parent = this;
        $.get(chrome.extension.getURL('data/lists.json'), {}, function(data) {
            if (typeof(resetData) != 'undefined')
                data = resetData;
            resetData = parent.cleanData(JSON.parse(data)).data;
            var result = parent.setData(resetData, { apply: true } );
            if (result.success) {
                parent.save(function(result) {
                    callback(result);
                });
            }
            callback(result);
        });
    }
    /**
     * Check for any remote updates to the data object and apply if found.
     *
     * Retrieves the update data object and updates the current.
     *
     * @return void
     */
    pvt.update = function() {
        var time = new Date().getTime();
        if (time > (this.data.lastUpdate + (24 * 60 * 60 * 1000))) {
            var parent = this;
            $.get(chrome.extension.getURL('data/lists.json'), {}, function(data) {
                if (typeof(data) != 'undefined') {
                    var currentData = parent.getData();
                    var updateData = parent.cleanData(JSON.parse(data)).data;
                    // Preserve custom settings.
                    updateData.useDefault = currentData.useDefault;
                    updateData.items.custom = currentData.items.custom;
                    updateData.lastUpdate = time;
                    var result = parent.setData(updateData, { apply: true } );
                    if (result.success) {
                        parent.save(function(result) {
                            if (result.success) {
                                console.log('Lists have been updated.');
                            } else {
                                console.log('Lists requires update but has failed to to save!');
                            }
                        });
                    } else {
                        console.log('Lists requires update but could not merge objects.');
                    }
                }
            });
        }
    };
    // Load an empty (but valid) data object by default.
    pvt.data = pvt.cleanData().data;

    /**
     * Public api.
     */
    var api = {};
    api.setData = function(data, broadcastData) {
        return pvt.setData(data, broadcastData);
    };
    api.cleanData = function() {
        return pvt.cleanData();
    };
    api.getData = function() {
        return pvt.getData();
    };
    api.addItem = function(item) {
        return pvt.addItem(item, pvt.data.items.custom, true);
    };
    api.removeItem = function(index) {
        return pvt.removeItem(index, pvt.data.items.custom, true);
    };
    api.save = function(callback) {
        return pvt.save(callback);
    };
    api.reset = function(callback, resetData) {
        return pvt.reset(callback, resetData);
    };
    api.compareItem = function(item, itemList) {
    	return pvt.compareItem(item, itemList);
    }

    // When factory is first instantiated pull the data object out of
    // chrome storage. This will result in a broadcast update.
    chrome.storage.sync.get(['lists'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not load lists object from chrome storage: ' + chrome.runetime.lastError.message);
        } else {
            // Clean the data, ignore any warnings (offenders removed).
            var data = pvt.cleanData(result['lists']).data;
            var result = api.setData(data, { apply: true } );
            if (!result.success) {
                console.log('Could not apply lists from chrome storage: ' + result.message);
                console.log(data);
            } else {
                if (data.autoUpdate) pvt.update();
            }
        }
    });

    // Listen for any updates to the data object in chrome storage. This
    // should only happen if multiple browsers are open, or if extension code
    // on the other side of the javascript firewall (popup versus options
    // versus content) has written a change to storage. This will result in a
    // broadcast update.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'lists') {
                // Clean the object, ignore any warnings (offenders removed).
                var data = pvt.cleanData(object.links.newValue).data;
                var result = api.setData(data, { apply: true } );
                if (!result.success) {
                    console.log('Could not apply lists from chrome storage: ' + result.message);
                    console.log(data);
                }
            }
        }
    });

    return api;
}]);
