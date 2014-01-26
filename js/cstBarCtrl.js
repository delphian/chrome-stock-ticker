
cstApp.controller('bar', function($scope) {
    $scope.variables = $scope.variable.split(',');
    $scope.prev = function() {
        $scope.variables.push($scope.variables.shift());
    }
    $scope.next = function() {
        $scope.variables.unshift($scope.variables.pop());
    }
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
