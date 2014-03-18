
cstApp.controller('resourceConfig', ['$scope', 'resource', function($scope, resource) {
    $scope.resource = resource.getData();
    $scope.addMetric = { name: '', url: '', selector: '', regex: '' };
    $scope.export = { pretty: false, data: null };

    $scope.$on('resourceUpdate', function(event, data) {
        $scope.resource = resource.getData();
        if (data.apply) $scope.$apply();
    });

    $scope.export = function() {
        $scope.export.data = JSON.stringify(resource.getData(), null, ($scope.export.pretty * 4));
    };
    $scope.add = function() {
        var result = resource.addMetric({ 
            name: $scope.addMetric.name,
            url: $scope.addMetric.url,
            selector: $scope.addMetric.selector, 
            regex: $scope.addMetric.regex
        });
        if (!result.success) {
            $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to add metric: '+result.message+'</div>');
        } else {
            $scope.addMetric = { name: '', url: '', selector: '', regex: '' };
        }
    };
    $scope.reset = function() {
        resource.reset(function(result) {
            if (result.success) {
                $('#saveConfirmResource').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Reset!</div>');
            } else {
                $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to reset: '+result.message+'</div>');
            }
        });
    };
    $scope.import = function() {
        resource.reset(function(result) {
            if (result.success) {
                $('#saveConfirmResource').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Imported!</div>');
            } else {
                $('#saveConfirmResource').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to import: '+result.message+'</div>');
            }
        }, $scope.export.data);
    };
    $scope.remove = function(index) {
        resource.removeMetric(index);
    };
    $scope.save = function() {
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
