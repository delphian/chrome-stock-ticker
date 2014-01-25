
var cstApp = angular.module('chromeStockTicker', []);

cstApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'chrome-extension://**'
  ]);
});

cstApp.controller('tickerBar', function($scope) {
    $scope.tickerbar = { items: [] };
    $scope.optionsMetricNames = [];
    // Update the tickerbar from local storage on first load.
    chrome.storage.sync.get('tickerbar', function(result) {
        if (typeof(result['tickerbar']) != 'undefined') {
            $scope.tickerbarUpdate(result['tickerbar']);
        }
    });
    chrome.storage.sync.get('resource', function(result) {
        if (typeof(result['resource']) != 'undefined') {
            $.each(result['resource'].metrics, function(index, value) {
                $scope.optionsMetricNames.push({ metricIndex: value.name, metricValue: value.name });
            });
        $scope.$apply();           
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
        $scope.tickerbar.items.push({ name: '', source: '', show: false, order: 0 });
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
});
