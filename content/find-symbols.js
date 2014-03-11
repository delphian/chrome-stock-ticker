
/**
 * @file
 */

var initChromeStockTicker = function() {
    var markup = '<div id="chromeStockTicker">';
    var markup = markup + '  <cst-bootstrap></cst-bootstrap>';
    var markup = markup + '</div>';
    $('body').append(markup);
    var element = $('#chromeStockTicker');
    angular.bootstrap(element, ['chromeStockTicker']);
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
            try {
                eval(data);
            } catch (err) {
                console.log("Error while trying to evaluate " + file + " (" + err + ")");
            }
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
        "js/resource/resourceDirective.js",
        "js/resource/resourceCtrl.js",
        "js/links/linksFactory.js",
        "js/links/linksCtrl.js",
        "js/links/linksDirective.js",
        "js/pattern/patternFactory.js",
        "js/pattern/patternDirective.js",
        "js/pattern/patternCtrl.js",
        "js/variable/variableFactory.js",
        "js/variable/variableCtrl.js",
        "js/variable/variableDirective.js",
        "js/bar/barCtrl.js",
        "js/bar/barDirective.js",
        "js/bootstrap/bootstrapDirective.js",
        "js/bootstrap/bootstrapCtrl.js"
    ];
    // Ensure that we load this in the correct order.
    $.ajaxSetup({async:false});
    for (var i in conditionalJs)
        cstLoadJS(conditionalJs[i].file, conditionalJs[i].regex);
    for (var i in alwaysJs)
        cstLoadJS(alwaysJs[i]);
    $.ajaxSetup({async:true});
}

/**
 * Listen for any messages from the background page, or other content scripts.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command == "cst_show_ticker_bar") {
        showBar();
        setTimeout(function() {
            $('div.cst-bar-add input').focus();
        }, 500);
    }
});

$('document').ready(function() {
    cstLoadAllJS();
    initChromeStockTicker();
});
