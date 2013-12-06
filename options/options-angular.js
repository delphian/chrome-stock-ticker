
function OptionsCtrl($scope) {
  $scope.tickers = '';
  
  $scope.save = function() {
    localStorage['tickers'] = $scope.tickers;
  };
}

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

function TickerBarCtrl($scope) {
    $scope.tickerbar = { metrics: [] };
    var resource = { metrics: [] };
    // Update the tickerbar from local storage on first load.
    chrome.storage.sync.get(['resource', 'tickerbar'], function(result) {
        if (typeof(result['resource']) != 'undefined') resource = result.resource;
        var change = $scope.tickerbarUpdate(result['tickerbar']);
        console.log(change);
    });
    // Update the patterns and force resync between model and html anytime
    // the stored resource or tickerbar is updated from elsewhere.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'resource') {
                resource = object.resource.newValue;
                // Because the tickerbar has not changed, just send a cloned copy
                // of the current scope tickerbar.
                $scope.tickerbarUpdate($scope.tickerbar);
            }
            if (key == 'tickerbar') {
                $scope.tickerbarUpdate(object.tickerbar.newValue);
            }
        }
    });
    $scope.tickerbarUpdate = function(tickerbar) {
        var report = false;
        var metrics = [];
        var oldTickerbar = {};
        var newTickerbar = {};
        if (typeof(tickerbar) != 'undefined') {
            oldTickerbar = JSON.parse(angular.toJson(tickerbar));
        } else {
            oldTickerbar = JSON.parse(angular.toJson($scope.tickerbar));
        }
        // Make a copy of the original tickerbar.
        newTickerbar = JSON.parse(JSON.stringify(oldTickerbar));
        // Compile a list of new metrics from scratch. The metric must exist
        // in the resource to exist in the tickerbar.
        for (var i=0; i<resource.metrics.length; i++) {
            // Construct default metric if one does not exist in the tickerbar.
            var newMetric = { name: resource.metrics[i].name, show: false };
            for (var j=0; j<oldTickerbar.metrics.length; j++) {
                // If metric does already exist in the tickerbar use it instead
                // of the default.
                if (resource.metrics[i].name == oldTickerbar.metrics[j].name) {
                    // Manually assign all key values to cleanse object of junk.
                    newMetric.name = oldTickerbar.metrics[j].name.toString();
                    newMetric.show = (oldTickerbar.metrics[j].show === true);
                }
            }
            metrics.push(newMetric);
        }
        newTickerbar.metrics = metrics;
        // Update model with tickerbar containing reconstructed metrics.
        $scope.tickerbar = JSON.parse(JSON.stringify(newTickerbar));
        $scope.$apply();
        // Report to caller if the metrics changed from their old state.
        if (JSON.stringify(oldTickerbar) != JSON.stringify(newTickerbar)) {
            chrome.storage.sync.set( {'tickerbar': newTickerbar}, function() {
                if (chrome.runtime.lastError) {
                    console.log('Could not save tickerbar: ' + chrome.runtime.lastError.message);
                }
            });
            report = true;
        }
        return report;
    };
    $scope.save = function() {
        // Remove angular hashes but store result as an object.
        var tickerbar = {};
        tickerbar = JSON.parse(angular.toJson($scope.tickerbar));
        chrome.storage.sync.set( {'tickerbar': tickerbar} , function() {
            if (chrome.runtime.lastError) {
                // Notify that we failed.
                $('#saveConfirmTickerBar').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save:'+chrome.runtime.lastError.message+'</div>');
            } else {
                // Notify that we saved.
                $('#saveConfirmTickerBar').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            }
        });
    };
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
        $scope.resource = resource;
        $scope.$apply();
    };
    $scope.urlAdd = function() {
        $scope.resource.urls.push({ url: ''});
    }
    $scope.urlRemove = function(index) {
        $scope.resource.urls.splice(index, 1);
    }
    $scope.metricAdd = function() {
        $scope.resource.metrics.push({ name: '', url: '', selector: '' });
    }
    $scope.metricRemove = function(index) {
        $scope.resource.metrics.splice(index, 1);
    }
    $scope.load = function() {
        if (localStorage['resource'] != 'undefined') {
            $scope.resource = localStorage['resource'];
        }
    }
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
