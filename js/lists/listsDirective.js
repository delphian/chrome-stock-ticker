
/**
 * Display the interface to create, edit, and maintain lists of variables.
 *
 * Example: 
 *   <cst-lists></cst-lists>
 */
cstApp.directive('cstLists', function() {
    return {
        restrict: 'E',
        controller: 'lists',
        replace: true,
        scope: true,
        templateUrl: chrome.extension.getURL('/js/lists/template/lists.html')
    };
});
