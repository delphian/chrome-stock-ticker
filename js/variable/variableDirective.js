
/**
 * <cst-variable variable="WMT"></cst-variable>
 */
cstApp.directive('cstVariable', function() {
    return {
        restrict: 'E',
        controller: 'variable',
        replace: true,
        scope: {
            variable: '@',
        },
        templateUrl: chrome.extension.getURL('/js/variable/template/variable.html')
    };
});

cstApp.directive('cstVariableConfig', function() {
    return {
        restrict: 'E',
        controller: 'variableConfig',
        replace: true,
        scope: true,
        templateUrl: chrome.extension.getURL('/js/variable/template/variable-config.html')
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
