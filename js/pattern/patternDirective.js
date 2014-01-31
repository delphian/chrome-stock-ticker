
cstApp.directive('cstPatternConfig', function() {
    return {
        restrict: 'E',
        controller: 'patternConfig',
        replace: true,
        templateUrl: chrome.extension.getURL('/js/pattern/template/pattern-config.html')
    };
});
