
// Insert some default data into the resource and patterns
$('document').ready(function() {
    var blob = '{"tickerbar":{"items":[{"name":"Price","order":0,"show":true,"source":"P:[[yahoo_price]]"}]},"resource":{"metrics":[{"name":"yahoo_price","selector":"span.time_rtq_ticker span","url":"http://finance.yahoo.com/q?s=SYMBOL"},{"name":"yahoo_volume","selector":"table#table2 tr:nth-child(3) td.yfnc_tabledata1 span","url":"http://finance.yahoo.com/q?s=SYMBOL"},{"name":"yahoo_cash_flow","selector":"table.yfnc_tabledata1 table tr:nth-child(12) td:nth-child(2) strong","url":"http://finance.yahoo.com/q/cf?s=SYMBOL+Cash+Flow&annual"},{"name":"bu_divgrowth","selector":"div#contentbox div.colwrap table tr:nth-child(8) td:nth-child(2) div","url":"http://www.buyupside.com/calculators/dividendgrowthrateinclude.php?symbol=SYMBOL&submit=Display+Chart"}],"urls":[{"url":"http://finance.yahoo.com/q?s=SYMBOL"}]},"patterns":[{"options":"g","pattern":"(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)","result":2},{"options":"g","pattern":"investing/stock/([A-Z]{1,4})","result":1},{"options":"g","pattern":"finance.yahoo.com/q?s=([A-Z]{1,4})","result":1}]}';
    blob = JSON.parse(blob);
    chrome.storage.sync.get(['resource', 'patterns', 'tickerbar'], function(result) {
        if (chrome.runtime.lastError) {
            console.log('Could not check for previously stored data: ' + chrome.runetime.lastError.message);
        }
        if (typeof(result.resource) == 'undefined' &&
            typeof(result.patterns) == 'undefined' &&
            typeof(result.tickerbar) == 'undefined') {
            chrome.storage.sync.set({ resource: blob.resource, tickerbar: blob.tickerbar, patterns: blob.patterns }, function() {
                if (chrome.runtime.lastError) {
                    console.log('Could not import default values: ' + chrome.runetime.lastError.message);
                }
            });
        }
    });
});
 