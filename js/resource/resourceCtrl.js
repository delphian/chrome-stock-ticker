
cstApp.controller('resourceConfig', ['$scope', 'resource', function($scope, resource) {
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
}]);
