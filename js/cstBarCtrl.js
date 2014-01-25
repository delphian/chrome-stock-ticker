
cstApp.controller('bar', function($scope) {
	$scope.variables = $scope.variable.split(',');
});

cstApp.directive('cstBar', function() {
    return {
        restrict: 'E',
        controller: 'bar',
        replace: true,
        transclude: 'element',
        scope: {
            variable: '@'
        },
        templateUrl: chrome.extension.getURL('/js/templates/bar.template.html')
    };
});
