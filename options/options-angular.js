
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
    $scope.tickerbar = { items: [] };
    // Update the tickerbar from local storage on first load.
    chrome.storage.sync.get('tickerbar', function(result) {
        if (typeof(result['tickerbar']) != 'undefined') {
            $scope.tickerbarUpdate(result['tickerbar']);
        }
    });
    // Update the patterns and force resync between model and html anytime
    // the stored resource or tickerbar is updated from elsewhere.
    chrome.storage.onChanged.addListener(function(object, namespace) {
        for (key in object) {
            if (key == 'tickerbar') {
                $scope.tickerbarUpdate(object.tickerbar.newValue);
            }
        }
    });
    $scope.tickerbarUpdate = function(tickerbar) {
        $scope.tickerbar = tickerbar;
        $scope.$apply();
    };
    $scope.itemAdd = function() {
        $scope.tickerbar.items.push({ source: '', show: false, order: 0 });
    }
    $scope.itemRemove = function(index) {
        $scope.tickerbar.items.splice(index, 1);
    }
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
