
cstApp.controller('bootstrap', ['$scope', 'variable', 'variableConfig', 'patterns', function($scope, variable, variableConfig, patterns) {

    $scope.variables = [];
    $scope.display = false;

    $scope.$watch('display', function(display) {
    	if (display) {
            $('html').css('position', 'relative');
            $('html').css({'margin-top':'30px'});
    	    setTimeout(function() {
    	    	$('div.cst-bar-add input').focus();
    	    }, 500);
        } else {
            $('html').css({'margin-top':'0px'});
        }
    });

    angular.element('body').on('keydown', function(e) {
    	if ((e.keyCode == 79 && e.shiftKey == true && e.metaKey == true) ||
    	(e.keyCode == 79 && e.shiftKey == true && e.altKey == true)) {
    		$scope.display = ($scope.display) ? false : true;
    	    $scope.$apply();
        }
    });

	var findVariables = function(html, patterns) {
	    var symbols = [];
	    // Iterate through all 'a' elements.
	    $(html).find('a').each(function() {
	        var href = $(this).attr('href');
	        // If the element has a 'href' attribute.
	        if (typeof(href) != 'undefined') {
	            try {
	                href = decodeURIComponent(href);
	                for (var i=0; i<patterns.items.length; i++) {
	                    var match;
	                    var regex = new RegExp(patterns.items[i].regex, patterns.items[i].modifiers);
	                    // If the href attribute matches one of our patterns.
	                    while ((match = regex.exec(href)) !== null) {
	                        symbols.push(match[patterns.items[i].result].toUpperCase());
	                    }
	                }
	            } catch (err) {
	                console.log('Can not examine href (' + href + '): ' + err);
	            }
	        }
	    });
	    // Remove any duplicates.
	    var symbolsCleaned = [];
	    $.each(symbols, function(i, el) {
	        if($.inArray(el, symbolsCleaned) === -1) symbolsCleaned.push(el);
	    });
	    return symbolsCleaned;
	};

    setTimeout(function() {
	    var variables = findVariables($('html').html(), patterns.getData());
	    var alwaysDisplay = variableConfig.getData().alwaysDisplay;
	    if (variables.length || alwaysDisplay) {
	    	$scope.variables = variables;
	    	$scope.display = true;
	    	$scope.$apply();
	    }
	}, 1000);

}]);
