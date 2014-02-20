
cstApp.controller('variable', ['$scope', 'variable', 'variableConfig', function($scope, variable, varConfig) {
    /**
     * Provided by directive:
     * $scope.variable: (string) (optional) Name of the variable.
     * $scope.header: (bool) Display metric names above values.
     * $scope.value: (bool) Display the metric values.
     */
    $scope.bar = varConfig.getData();
    $scope.metrics = {};
    if (typeof($scope.variable) != 'undefined') {
        variable.getMetrics($scope.variable.toUpperCase(), function(metrics) {
            $scope.metrics = metrics;
            $scope.$apply();
        });
    }
    $scope.$on('variableConfigUpdate', function(event, data) {
        $scope.bar = varConfig.getData();
        if (data.apply) $scope.$apply();
    });
}]);

cstApp.controller('variableConfig', ['$scope', 'resource', 'variableConfig', function($scope, resource, varConfig) {
    $scope.tickerbar = { items: [] };
    $scope.optionsMetricNames = [{ metricIndex: '- Select Metric -', metricValue: '- Select Metric -' }];
    $scope.addMetricName = '- Select Metric -';
    $scope.$on('variableConfigUpdate', function(event, data) {
        $scope.tickerbar = varConfig.getData();
        if (data.apply) $scope.$apply();
    });
    $scope.$on('resourceUpdate', function() {
        var data = resource.getData();
        $scope.optionsMetricNames = [{ metricIndex: '- Select Metric -', metricValue: '- Select Metric -' }];
        $.each(data.metrics, function(index, value) {
            $scope.optionsMetricNames.push({ metricIndex: value.name, metricValue: value.name });
        });
        $scope.$apply();
    });
    $scope.itemAdd = function() {
        var result = varConfig.addItem({ name: $scope.addMetricName, source: 'Metric' });
        if (!result.success) {
            $('#saveConfirmTickerBar').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    }
    $scope.itemRemove = function(index) {
        varConfig.removeItem(index);
    }
    $scope.save = function() {
        var result = varConfig.setConfig($scope.tickerbar);
        if (result.success) {
            varConfig.save(function(result) {
                if (result.success) {
                    $('#saveConfirmTickerBar').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
                } else {
                    $('#saveConfirmTickerBar').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
                }
            });
        } else {
            $('#saveConfirmTickerBar').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    };
}]);
