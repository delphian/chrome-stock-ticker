
cstApp.controller('resourceConfig', ['$scope', 'resource', function($scope, resource) {
    $scope.resource = resource.cleanResource();
    $scope.addMetric = { name: '', url: '', selector: '', regex: '' };
    $scope.export = { pretty: false };

    $scope.$on('resourceUpdate', function(event, data) {
        $scope.resource = resource.getData();
        if (data.apply) $scope.$apply();
    });

    $scope.urlAdd = function() {
        resource.addUrl({ url: '' });
    };
    $scope.export = function() {
        var resourceObject = JSON.stringify(resource.getData(), null, ($scope.export.pretty * 4));
        $('.cst-import-export textarea').val(resourceObject);
    }
    $scope.urlRemove = function(index) {
        resource.removeUrl(index);
    };

    $scope.metricAdd = function() {
        var result = resource.addMetric({ 
            name: $scope.addMetric.name,
            url: $scope.addMetric.url,
            selector: $scope.addMetric.selector, 
            regex: $scope.addMetric.regex
        });
        if (!result.success) {
            $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to add metric: '+result.message+'</div>');
        }
    };

    $scope.metricRemove = function(index) {
        resource.removeMetric(index);
    };

    $scope.saveResource = function() {
        var result = resource.setResource($scope.resource);
        if (result.success) {
            resource.save(function(result) {
                if (result.success) {
                    $('#saveConfirmResource').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
                } else {
                    $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
                }
            });
        } else {
            $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    };

}]);
