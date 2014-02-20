/**
 * <cst-bar variable="WMT, TGT"></cst-bar>
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
