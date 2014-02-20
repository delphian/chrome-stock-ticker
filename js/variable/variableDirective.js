
/**
 * <cst-variable variable="WMT" headers="'true'" values="'true'" hideEmpty="'true'"></cst-variable>
 */
cstApp.directive('cstVariable', function() {
    return {
        restrict: 'E',
        controller: 'variable',
        replace: true,
        scope: {
            variable: '=',
            headers: '=',
            values: '=',
            hide: '='
        },
        compile: function(element, attrs) {
           if (typeof(attrs.headers) == 'undefined') { attrs.headers = true; }
           if (typeof(attrs.values) == 'undefined') { attrs.values = true; }
           if (typeof(attrs.hide) == 'undefined') { attrs.hide = false; }
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
