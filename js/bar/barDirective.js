
cstApp.directive('cstBar', function() {
    return {
        restrict: 'E',
        controller: 'bar',
        replace: true,
        scope: {
            variable: '@'
        },
        templateUrl: chrome.extension.getURL('/js/bar/template/bar.html')
    };
});
