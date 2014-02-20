/**
 * <cst-bar variable="WMT, TGT"></cst-bar>
 */
cstApp.directive('cstBar', function() {
    return {
        restrict: 'E',
        controller: 'bar',
        replace: true,
        scope: {
            variable: '@',
            orient: '='
        },
        templateUrl: chrome.extension.getURL('/js/bar/template/bar.html')
    };
});
