
/**
 * Include this at the top of each page.
 *
 * <cst-bootstrap></cst-bootstrap>
 */
cstApp.directive('cstBootstrap', function() {
    return {
        restrict: 'E',
        controller: 'bootstrap',
        replace: true,
        scope: true,
        templateUrl: chrome.extension.getURL('/js/bootstrap/template/bootstrap.html')
    };
});
