
cstApp.controller('variable', function($scope) {
    $scope.bar = {};
    $scope.metrics = {};
    var ticker = new CSTTicker($scope.variable.toUpperCase());
    ticker.fetchAllData(function() {
        $scope.metrics = this.resource.cache.metrics;
        $scope.$apply();
    });    
    chrome.storage.sync.get('tickerbar', function(result) {
        if (typeof(result['tickerbar']) != 'undefined') {
            $scope.bar = result['tickerbar'];
            $scope.$apply();
        }
    });
});

cstApp.directive('cstVariable', function() {
    return {
        restrict: 'E',
        controller: 'variable',
        replace: true,
        // transclude: true,
        scope: {
            variable: '@',
        },
        templateUrl: chrome.extension.getURL('/js/templates/variable.template.html')
    };
});
