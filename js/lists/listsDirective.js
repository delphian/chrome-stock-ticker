
/**
 * Display the interface to create, edit, and maintain multiple lists.
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

/**
 * Display the interface to create, edit, and maintain a list of variables.
 *
 * Creates a vertical control.
 *
 * Example: 
 *   <cst-list-vertical variables="['WMT', 'TGT']"></cst-list-vertical>
 */
cstApp.directive('cstListVertical', function() {
    return {
        restrict: 'E',
        controller: 'list',
        replace: true,
        scope: {
            variables: '='
        },
        templateUrl: chrome.extension.getURL('/js/lists/template/list-vertical.html')
    };
});
