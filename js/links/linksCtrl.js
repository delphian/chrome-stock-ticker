
cstApp.controller('linksButton', ['$scope', 'links', function($scope, links) {
    // $scope.variable = '';

    var replaceVariables = function(itemList) {
        for (var i in itemList) {
            itemList[i].url = itemList[i].url.replace('SYMBOL', $scope.variable);
        }
    }

    var data = links.getData();
    replaceVariables(data.items.custom);
    replaceVariables(data.items.default);
    $scope.links = data;

    $scope.$on('linksUpdate', function(event, data) {
        var linksData = links.getData();
        replaceVariables(linksData.items.custom);
        replaceVariables(linksData.items.default);
        $scope.links = linksData;
        if (data.apply) $scope.$apply();
    });
}]);

cstApp.controller('linksConfig', ['$scope', 'links', function($scope, links) {
    // Provide some default patterns.
    $scope.links = links.getData();
    $scope.export = { pretty: false, data: '' };
    $scope.addLink = { name: '', url: '' };

    $scope.$on('linksUpdate', function(event, data) {
        $scope.links = links.getData();
        if (data.apply) $scope.$apply();
    });
    $scope.add = function() {
        var result = links.addItem($scope.addLink);
        if (!result.success) {
            $('#saveConfirmLinks').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to add link: '+result.message+'</div>');
        } else {
            $scope.addLink = { name: '', url: '' };
        }
    };
    $scope.remove = function(index) {
        links.removeItem(index);
    };
    $scope.export = function() {
        var linksObject = JSON.stringify(links.getData(), null, ($scope.export.pretty * 4));
        $scope.export.data = linksObject;
    };
    $scope.reset = function() {
        links.reset(function(result) {
            if (result.success) {
                $('#saveConfirmLinks').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Reset!</div>');
            } else {
                $('#saveConfirmLinks').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to reset: '+result.message+'</div>');
            }
        });
    };
    $scope.import = function() {
        links.reset(function(result) {
            if (result.success) {
                $('#saveConfirmLinks').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Imported!</div>');
            } else {
                $('#saveConfirmLinks').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to import: '+result.message+'</div>');
            }
        }, $scope.export.data);
    };
    $scope.save = function() {
        var result = links.setData($scope.links);
        if (result.success) {
            links.save(function(result) {
                if (result.success) {
                    $('#saveConfirmLinks').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
                } else {
                    $('#saveConfirmLinks').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
                }
            });
        } else {
            $('#saveConfirmLinks').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    };

}]);
