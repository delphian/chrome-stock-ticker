
cstApp.controller('resourceConfig', ['$scope', 'resource', function($scope, resource) {
    $scope.resource = { urls: [], metrics: [] };

    $scope.$on('resourceUpdate', function(event) {
        $scope.resource = resource.data;
    });

    $scope.urlAdd = function() {
        $scope.resource.urls.push({ url: ''});
    };

    $scope.urlRemove = function(index) {
        $scope.resource.urls.splice(index, 1);
    };

    $scope.metricAdd = function() {
        resource.addMetric({ name: '', url: '', selector: '' });
    };

    $scope.metricRemove = function(index) {
        resource.removeMetric(index);
    };

    $scope.saveResource = function() {
        resource.save(function(result) {
            if (result.success) {
                $('#saveConfirmResource').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            } else {
                $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
            }
        });
    };

}]);
