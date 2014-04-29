
cstApp = angular.module('chromeStockTicker', ['ui.utils']);

cstApp.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'chrome-extension://**'
  ]);
});

cstApp.constant('appMeta', {
	version: '0.9.9'
});
