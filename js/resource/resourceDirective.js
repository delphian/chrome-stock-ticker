
cstApp.directive('cstResourceConfig', function() {
    return {
        restrict: 'E',
        controller: 'resourceConfig',
        replace: true,
        templateUrl: chrome.extension.getURL('/js/resource/template/resource-config.html')
    };
});
