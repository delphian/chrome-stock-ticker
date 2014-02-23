
/**
 * @file
 */

/**
 * Print all tickers into the ticker bar.
 *
 * This may be called multiple times due to the async nature of fetching
 * the metrics. Be prepared cache items that don't exist yet.
 */
var showBar = function(variables) {

    if (variables.length) {
        var markup = '<div id="cst-tickerbar" class="cst-bootstrap" ng-app="chromeStockTicker">';
        markup = markup + '<cst-bar variables="variables" orient="\'horizontal\'" ng-init="variables=[\'' + variables.join('\',\'') + '\']"></cst-bar>';
        markup = markup + '</div>';
        $('body').append(markup);
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
        var element = $('#cst-tickerbar');
        angular.bootstrap(element, ['chromeStockTicker']);
    }
};

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

/**
 * Load a JS library; if it does not already exist in content context.
 *
 * All js files must be included in the manifest's web_accessible_resources.
 *
 * @param string file
 *   Name of the local javascript file to load.
 * @param array regex
 *   (optional) An array of Regular expression objects. If present will only
 *   load file if the content page does not have a script element with a src
 *   attribute that matches regex pattern. If ommited then the file will
 *   always be loaded.
 *
 * @return null;
 */
var cstLoadJS = function(file, regex) {
    var load = function(file) {
        $.get(chrome.extension.getURL(file), {}, function(data) {
            eval(data);
        });
    }
    var found = false;
    if (typeof(regex) != 'undefined') {
        for (var i in regex) {
            $('script').each(function(index, element) {
                var src = $(element).attr('src');
                if (src && src.match(regex[i])) {
                    found = true;
                    return false;
                }
            });
            if (found)
                break;
        }
        if (found)
            console.log(file + " Is already present!");
        if (!found)
            load(file);
    } else {
        load(file);
    }
}

/**
 * Load all JS libraries.
 *
 * It is neccesary to dynamically load all libraries rather than specifying
 * them to auto load in the manifest file. Certail libraries should only be
 * loaded conditionally, if they do not already exist in the content context.
 * Double loading these libraries will break the content page, which is the
 * last thing we want to do. Better to break our extension in these cases.
 *
 * The JS is isolated between contexs (content and tab(extension)), but the
 * DOM is shared. Any libraries that automatically operate on the DOM will
 * cause difficulty when loaded twice and working with a shared DOM.
 *
 * @return null;
 */
var cstLoadAllJS = function() {
    var conditionalJs = [
        { file: "libs/external/bootstrap/bootstrap-3.0.3/dist/js/bootstrap.min.js", regex: [ /bootstrap(?:\.min)?\.js/ ] }
    ];
    var alwaysJs = [
        "libs/external/angular/angular.min.js",
        "libs/external/bower_components/angular-ui-utils/ui-utils.min.js",
        "libs/CSTResource.js",
        "js/cstApp.js",
        "js/resource/resourceFactory.js",
        "js/links/linksFactory.js",
        "js/links/linksCtrl.js",
        "js/links/linksDirective.js",
        "js/variable/variableCtrl.js",
        "js/variable/variableDirective.js",
        "js/variable/variableFactory.js",
        "js/bar/barCtrl.js",
        "js/bar/barDirective.js",
        "js/pattern/patternCtrl.js",
        "js/pattern/patternDirective.js"
    ];
    // Ensure that we load this in the correct order.
    $.ajaxSetup({async:false});
    for (var i in conditionalJs)
        cstLoadJS(conditionalJs[i].file, conditionalJs[i].regex);
    for (var i in alwaysJs)
        cstLoadJS(alwaysJs[i]);
    $.ajaxSetup({async:true});
}

$('document').ready(function() {
    cstLoadAllJS();
    chrome.storage.sync.get(['patterns'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Content script can\'t read from synced storage: ' + chrome.runtime.lastError.message);
        }
        var variables = findVariables($('html').html(), result['patterns']);
        showBar(variables);
    });
});
