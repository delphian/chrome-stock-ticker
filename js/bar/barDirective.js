/**
 * <cst-bar variables="['WMT', 'TGT']"></cst-bar>
 *
 * Possibly the use if ng-init may be required to avoid an injest loop.
 */
cstApp.directive('cstBar', function() {
    return {
        restrict: 'E',
        controller: 'bar',
        replace: true,
        scope: {
            // https://github.com/angular/angular.js/issues/5296 ???
            variables: '=',
            orient: '='
        },
        templateUrl: chrome.extension.getURL('/js/bar/template/bar.html')
    };
});

/**
 * <cst-bar-vertical variables="['WMT', 'TGT']"></cst-bar-vertical>
 *
 * Possibly the use if ng-init may be required to avoid an injest loop.
 */
cstApp.directive('cstBarVertical', function() {
    return {
        restrict: 'E',
        controller: 'bar',
        replace: true,
        scope: {
            variables: '=',
        },
        templateUrl: chrome.extension.getURL('/js/bar/template/bar-vertical.html')
    };
});
