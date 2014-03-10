/**
 * Lists controller manages switching out one array of variables for another.
 */
cstApp.controller('lists', ['$scope', 'lists', function($scope, lists) {
    /**
     * Provided by directive:
     *   (Nothing)
     */
    $scope.lists = lists.getData();
    // Array of variables in currently viewed list.
    $scope.list = {
        "name": "",
        "variables": []
    };
    // Switch to this list.
    $scope.selectList = '';
    $scope.addList = {
        name: ''
    };
    $scope.$on('listsUpdate', function(event, data) {
        var listName = $scope.list.name;
        $scope.lists = lists.getData();
        // After refresh of all lists (getData returns a copy) $scope.list is
        // no longer pointing at anything. Locate an item which matches the
        // name of what was last pointed at, and assign our $scope.list pointer
        // to that found item.
        var result = lists.compareItem({ name: listName }, $scope.lists.items.custom);
        if (typeof(result['name']) != 'undefined') {
            $scope.selectList = result['name'][0]['item'];
        } else {
            // Default to first list found.
            if ($scope.lists.items.custom.length > 0)
                $scope.selectList = $scope.lists.items.custom[0];
        }
        if (data.apply) $scope.$apply();
    });
    $scope.$watch('selectList', function(value) {
        $scope.list = value;
        //console.log(value);
    });
    // Add a new list.
    $scope.add = function() {
        var result = lists.addItem({
            name: $scope.addList.name,
            variables: []
        });
        if (!result.success) {
            $('#saveConfirmLists').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to add list: '+result.message+'</div>');
        } else {
            $scope.addList = { name: '' };
        }
    };
    //
    $scope.save = function() {
        var result = lists.setData($scope.lists);
        if (result.success) {
            lists.save(function(result) {
                if (result.success) {
                    $('#saveConfirmLists').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a>Saved!</div>');
                } else {
                    $('#saveConfirmLists').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
                }
            });
        } else {
            $('#saveConfirmLists').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a>Failed to save: '+result.message+'</div>');
        }
    };
}]);
