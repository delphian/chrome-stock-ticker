
cstApp.controller('variable', function($scope) {
    $scope.heading = true;
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
