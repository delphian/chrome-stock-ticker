
cstApp.controller('variable', ['$scope', 'variable', 'variableConfig', function($scope, variable, varConfig) {
    $scope.heading = true;
    $scope.bar = {};
    $scope.metrics = {};
    variable.getMetrics($scope.variable.toUpperCase(), function(metrics) {
        $scope.metrics = metrics;
        $scope.$apply();
    });
    $scope.$on('variableConfigUpdate', function() {
        $scope.bar = varConfig.getData();
        $scope.$apply();
    });
}]);

cstApp.controller('variableConfig', ['$scope', 'resource', 'variableConfig', function($scope, resource, varConfig) {
    $scope.tickerbar = { items: [] };
    $scope.optionsMetricNames = [];
    $scope.$on('variableConfigUpdate', function() {
        $scope.tickerbar = varConfig.getData();
        $scope.$apply();
    });
    $scope.$on('resourceUpdate', function() {
        var data = resource.getData();
        $.each(data.metrics, function(index, value) {
            $scope.optionsMetricNames.push({ metricIndex: value.name, metricValue: value.name });
        });
        $scope.$apply();
    });
    $scope.itemAdd = function() {
        varConfig.addItem({ name: '', source: '', show: false, order: 0 });
    }
    $scope.itemRemove = function(index) {
        varConfig.removeItem(index);
    }
    $scope.save = function() {
        varConfig.save(function(result) {
            if (result.success) {
                $('#saveConfirmTickerBar').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
            } else {
                $('#saveConfirmTickerBar').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save:'+result.message+'</div>');
            }
        });
    };
}]);
