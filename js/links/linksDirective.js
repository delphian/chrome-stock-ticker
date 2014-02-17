
cstApp.directive('cstLinksButton', function() {
    return {
        restrict: 'E',
        controller: 'linksButton',
        replace: true,
        scope: {
        	variable: '=variable'
        },
        templateUrl: chrome.extension.getURL('/js/links/template/links-button.html')
    };
});

cstApp.directive('cstLinksConfig', function() {
    return {
        restrict: 'E',
        controller: 'linksConfig',
        replace: true,
        scope: true,
        templateUrl: chrome.extension.getURL('/js/links/template/links-config.html')
    };
});
