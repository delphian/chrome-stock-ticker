
// Setup initial values when popup is first opened.
jQuery('document').ready(function($) {
    var background = chrome.extension.getBackgroundPage();
    var patterns = [
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
    ];

    // Ask current tab if it has any tickers.
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var msg = {method: "findTickers", patterns: patterns};
      chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
        document.write(response.tickers.join());
      });
    });

});
