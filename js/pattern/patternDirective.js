
cstApp.directive('cstPatternsConfig', function() {
    return {
        restrict: 'E',
        controller: 'patternsConfig',
        replace: true,
        templateUrl: chrome.extension.getURL('/js/pattern/template/pattern-config.html')
    };
});
