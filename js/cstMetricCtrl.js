
cstApp.controller('metric', function($scope) {
    $scope.metrics = {};
    var ticker = new CSTTicker($scope.variable.toUpperCase());
    ticker.fetchAllData(function() {
        $scope.metrics = this.resource.cache.metrics;
        $scope.$apply();
    });
});

cstApp.directive('cstMetric', function() {
    return {
        restrict: 'E',
        controller: 'metric',
        // replace: true,
        // transclude: true,
        scope: {
            variable: '@',
            metricNames: '=metric'
        },
        templateUrl: chrome.extension.getURL('/js/templates/metric.template.html')
    };
});
