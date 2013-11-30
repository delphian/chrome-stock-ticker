
/**
 * Static method.
 */
ShowTickerBox = function(tickers) {
    // Create our box.
    if (tickers.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+tickers.join()+'</p>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }
}

var GSTResource = {
    urlNames: {
        main: {
            url: 'http://finance.yahoo.com/q?s=SYMBOL'
        }
    },
    property: {
        price: {
            selector: 'span.time_rtq_ticker span',
            urlName: 'main'
        },
        volume: {
            selector: 'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span',
            urlName: 'main'
        }
    }
};

jQuery(document).ready(function($) {
    var tickers = [];
    var html = $('html').html();
    var patterns = [
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }
    ];
    tickers = GSTTicker.findTickers($('html').html(), patterns);
    if (tickers.length) {
        ticker = new GSTTicker(tickers[0], GSTResource);
        ticker.fetchData(function() {
            tickers[0] = tickers[0] + ':' + ticker.data.price;
            ShowTickerBox(tickers);
        });
    }
});
