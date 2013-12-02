
function OptionsCtrl($scope) {
  $scope.tickers = '';
  
  $scope.save = function() {
    localStorage['tickers'] = $scope.tickers;
  };
}

function ResourceCtrl($scope) {
    $scope.resource = {
        urls: [
            { url: 'http://finance.yahoo.com/q?s=SYMBOL' }
        ],
        metrics: [
            { name: 'price', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'span.time_rtq_ticker span' },
            { name: 'volume', url: 'http://finance.yahoo.com/q?s=SYMBOL', selector: 'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span' },
        ]
    };

    if (typeof(localStorage['resource']) != 'undefined') {
        $scope.resource = JSON.parse(localStorage['resource']);
    }

    $scope.urlAdd = function() {
        $scope.resource.urls.push({ url: ''});
    }
    $scope.urlRemove = function(index) {
        $scope.resource.urls.splice(index, 1);
    }

    $scope.metricAdd = function() {
        $scope.resource.metrics.push({ name: '', url: '', selector: '' });
        console.dir($scope.resource);
    }
    $scope.metricRemove = function(index) {
        $scope.resource.metrics.splice(index, 1);
    }

    $scope.load = function() {
        if (localStorage['resource'] != 'undefined') {
            $scope.resource = localStorage['resource'];
        }
    }

    $scope.save = function() {
        localStorage['resource'] = angular.toJson($scope.resource);
        $('#saveConfirm').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
    }
}
