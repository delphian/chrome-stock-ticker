
function OptionsCtrl($scope) {
  $scope.tickers = '';
  
  $scope.save = function() {
    localStorage['tickers'] = $scope.tickers;
  };
}

function PatternCtrl($scope) {
    $scope.patterns = [
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
    ];
    if (typeof(localStorage['patterns']) != 'undefined') {
        $scope.patterns = JSON.parse(localStorage['patterns']);
    }
    $scope.patternAdd = function() {
        $scope.patterns.push({ pattern: '', options: 'g', result: 1 });
    }
    $scope.patternRemove = function(index) {
        $scope.patterns.splice(index, 1);
    }
    $scope.save = function() {
        localStorage['patterns'] = angular.toJson($scope.patterns);
        $('#saveConfirmPatterns').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
    }    
}

function TickerBarCtrl($scope) {
    $scope.metrics = [];
    if (typeof(localStorage['resource']) != 'undefined') {
        var resource = JSON.parse(localStorage['resource']);
        var tickerbar = {};
        if (typeof(localStorage['tickerbar']) != 'undefined') {
            tickerbar = JSON.parse(localStorage['tickerbar']);
        }
        for (var i=0; i<resource.metrics.length; i++) {
            var metric = resource.metrics[i];
            var show = false;
            for (var j=0; j<tickerbar.length; j++) {
                if (tickerbar[j].name == metric.name) {
                    show = tickerbar[j].show;
                }
            }
            $scope.metrics.push( { name: metric.name, show: false } );
        }
    }
    $scope.save = function() {
        localStorage['tickerbar'] = angular.toJson( { metrics: $scope.metrics } );
        $('#saveConfirmTickerBar').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
    }    
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
