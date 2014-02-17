
cstApp.directive('cstLinksConfig', function() {
    return {
        restrict: 'E',
        controller: 'linksConfig',
        replace: true,
        scope: true,
        templateUrl: chrome.extension.getURL('/js/links/template/links-config.html')
    };
});
