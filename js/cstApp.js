
var cstApp = angular.module('chromeStockTicker', []);

cstApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'chrome-extension://**'
  ]);
});

