
cstApp.directive('cstVariable', function() {
    return {
        restrict: 'E',
        controller: 'variable',
        replace: true,
        transclude: 'element',
        scope: {
            variable: '@',
        },
        templateUrl: chrome.extension.getURL('/js/variable/template/variable.html')
    };
});

cstApp.directive('cstMetric', function() {
    return {
        restrict: 'E',
        controller: 'variable',
        // replace: true,
        // transclude: true,
        scope: {
            variable: '@',
            metricNames: '=metric'
        },
        templateUrl: chrome.extension.getURL('/js/variable/template/metric.html')
    };
});
