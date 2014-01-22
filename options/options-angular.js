
function PatternCtrl($scope) {
    // Provide some default patterns.
    $scope.patterns = [];
    // Update the pattern from local storage on first load.
    chrome.storage.sync.get('patterns', function(result) {
        if (typeof(result['patterns']) != 'undefined') {
            $scope.patternUpdate(result.patterns);
        }
    });
    // Update the patterns and force resync between model and html anytime
    // the stored object is updated from anywhere.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'patterns') {
                $scope.patternUpdate(object.patterns.newValue);
            }
        }
    });
    // Update the model and force resync between model and html.
    $scope.patternUpdate = function(patterns) {
        $scope.patterns = patterns;
        $scope.$apply();
    };
    $scope.patternAdd = function() {
        $scope.patterns.push({ pattern: '', options: 'g', result: 1 });
    };
    $scope.patternRemove = function(index) {
        $scope.patterns.splice(index, 1);
    };
    $scope.save = function() {
        // Remove angular hashes but store result as an object.
        var patterns = JSON.parse(angular.toJson($scope.patterns));
        chrome.storage.sync.set( {'patterns': patterns} , function() {
            if (chrome.runtime.lastError) {
                // Notify that we failed.
                $('#saveConfirmPatterns').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+chrome.runtime.lastError.message+'</div>');
            } else {
                // Notify that we saved.
                $('#saveConfirmPatterns').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            }
        });
    };
}

/**
 *
 */
function ImportExportCtrl($scope) {
    $scope.box = '';
    $scope.pretty = false;
    //$scope.stringify = false;
    $scope.export = function() {
        chrome.storage.sync.get(['tickerbar', 'resource', 'patterns'], function(result) {
            var blob = {
                tickerbar: result.tickerbar,
                resource: result.resource,
                patterns: result.patterns
            };
            //if ($scope.stringify == true) blob = JSON.stringify(blob);
            $scope.box = JSON.stringify(blob, undefined, ($scope.pretty * 4));
            $scope.$apply();
        });
    };
    $scope.import = function() {
        var blob = $('textarea#ImportExport').val();
        blob = JSON.parse(blob);
        chrome.storage.sync.set({ tickerbar: blob.tickerbar, resource: blob.resource, patterns: blob.patterns }, function() {
            if (chrome.runtime.lastError) {
                // Notify that we failed.
                $('#importConfirm').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to import: '+chrome.runtime.lastError.message+'</div>');
            } else {
                // Notify that we saved.
                $('#importConfirm').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Import ok!</div>');
            }
        });
    }
    $scope.reset = function() {
        $.get(chrome.extension.getURL('data/reset.json'), {}, function(data) {
            blob = JSON.parse(data);
            chrome.storage.sync.set({ resource: blob.resource, tickerbar: blob.tickerbar, patterns: blob.patterns }, function() {
                if (chrome.runtime.lastError) {
                    // Notify that we failed.
                    $('#importConfirm').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to reset: '+chrome.runtime.lastError.message+'</div>');
                } else {
                    // Notify that we saved.
                    $('#importConfirm').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Reset ok!</div>');
                }
            });
        });
    }
}

function ResourceCtrl($scope) {
    $scope.resource = { urls: [], metrics: [] };
    // Update the resource from local storage on first load.
    chrome.storage.sync.get('resource', function(result) {
        if (typeof(result['resource']) != 'undefined') {
            $scope.resourceUpdate(result.resource);
        }
    });
    // Update the resource and force resync between model and html anytime
    // the stored object is updated from anywhere.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                $scope.resourceUpdate(object.resource.newValue);
            }
        }
    });
    // Update the model and force resync between model and html.
    $scope.resourceUpdate = function(resource) {
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
        $scope.resource = resource;
        $scope.resource.metrics = newMetrics;
        $scope.$apply();
    };
    $scope.urlAdd = function() {
        $scope.resource.urls.push({ url: ''});
    };
    $scope.urlRemove = function(index) {
        $scope.resource.urls.splice(index, 1);
    };
    $scope.metricAdd = function() {
        $scope.resource.metrics.push({ name: '', url: '', selector: '' });
    };
    $scope.metricRemove = function(index) {
        $scope.resource.metrics.splice(index, 1);
    };
    $scope.load = function() {
        if (localStorage['resource'] != 'undefined') {
            $scope.resource = localStorage['resource'];
        }
    };
    $scope.save = function() {
        // Remove angular hashes but store result as an object.
        var resource = JSON.parse(angular.toJson($scope.resource));
        chrome.storage.sync.set( {'resource': resource} , function() {
            if (chrome.runtime.lastError) {
                // Notify that we failed.
                $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+chrome.runtime.lastError.message+'</div>');
            } else {
                // Notify that we saved.
                $('#saveConfirmResource').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            }
        });
    };
}
