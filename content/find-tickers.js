
GSTResource = function(id) {
    // Store everything in a single object for persistance to local storage.
    this.data = {
        id: id,
        login: {
            url: null,
            name: null,
            password: null
        },
        urls: {
            main: {
                url: 'http://finance.yahoo.com/q?s=TICKER',
                timestamp: null,
                data: null
            }
        },
        properties: {
            price: {
                url: 'main',
                selector: 'span.time_rtq_ticker span'
            }
        }
    }
}

GSTTicker = function(symbol) {
    // Store everything in a single object for easy persistance in local
    // storage.
    this.data = {
        symbol: symbol,
        price: null,
        volume: null,
        response: {
            yahoo: {
                main: {
                    timeStamp: null,
                    html: null
                }
            },
            google: {
                main: null
            }
        }
    };
    /**
     * Fetch the content from all URLs required to grab all relevent metric.
     *
     * The responses themselves will be stored on the main object in
     * data.response for easy caching and persisting.
     */
    this.fetchData = function(callback) {
        var thisTicker = this;
        $.get('http://finance.yahoo.com/q?s=' + this.data.symbol, {},
            function(data) { 
                thisTicker.data.response.yahoo.main.html = data;
                thisTicker.data.response.yahoo.main.timeStamp = new Date().getTime();
                thisTicker.updatePrice(callback);
                thisTicker.updateVolume(callback);
            }
        );
    }
    this.updateProperty = function(property, data, selector, callback) {
        this.data[property] = $(data).find(selector).text();
        if (typeof(callback) == 'function') {
            callback(property, this);
        }
    }
    this.updatePrice = function(callback) {
        this.updateProperty(
            'price',
            this.data.response.yahoo.main.html,
            'span.time_rtq_ticker span',
            callback
        );
    };
    this.updateVolume = function(callback) {
        this.updateProperty(
            'volume',
            this.data.response.yahoo.main.html,
            'table#table2 tr:nth-child(3) td.yfnc_tabledata1 span',
            callback
        );
    };
};
/**
 * Detect ticker symbols on current page by matching href urls to patterns.
 *
 * Static method.
 *
 * @param array patterns
 *   Each element containing regex pattern in the form of /pattern/i.
 *   Do not enclose the pattern in a sting.
 *
 * @return array
 *   Each element being a symbol found, or an empty array if none found.
 */
GSTTicker.findTickers = function(patterns) {
    // Detect ticker symbols by matching a href urls to these patterns.
    if (typeof(patterns) == 'undefined' || patterns.length < 1) {
        patterns = [{ 
            pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)',
            options: 'g',
            result: 2 
        }];
    }
    // Store ticker symbols found in this array.
    var tickers = [];
    // Iterate through all 'a' elements.
    $('a').each(function() {
        var href = $(this).attr('href');
        // If the element has a 'href' attribute.
        if (typeof(href) != 'undefined') {
            href = decodeURIComponent(href);
            for (i=0; i<patterns.length; i++) {
                var match;
                var regex = new RegExp(patterns[i].pattern, patterns[i].options);
                // If the href attribute matches one of our patterns.
                while ((match = regex.exec(href)) !== null) {
                    tickers.push(match[patterns[i].result]);
                }
            }
        }
    });
    // Remove any duplicates from tickers array.
    var uniqueTickers = [];
    $.each(tickers, function(i, el){
        if($.inArray(el, uniqueTickers) === -1) uniqueTickers.push(el);
    });
    tickers = uniqueTickers;

    return tickers;
};
/**
 * Static method.
 */
GSTTicker.showTickerBox = function(tickers) {
    // Create our box.
    if (tickers.length) {
        $('body').append('<div id="cstContainer">Test</div>');
        $('#cstContainer').html('<p>'+tickers.join()+'</p>');
        $('html').css('position', 'relative');
        $('html').css({'margin-top':'30px'});
    }
}

// Expose local javascript as an API to other tabs, popup, and background pages.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == 'findTickers') {
        var tickers = GSTTicker.findTickers(request.patterns);
        sendResponse({status: 1, tickers: tickers});
    } else {
        sendResponse({status: 0});
    }
});

jQuery(document).ready(function($) {
    var tickers = GSTTicker.findTickers([
        { pattern: '(ticker|symb).*?[^A-Z]{1}([A-Z]{1,4})([^A-Z]+|$)', options: 'g', result: 2 },
        { pattern: 'investing/stock/([A-Z]{1,4})', options: 'g', result: 1 }  
    ]);
    // Create our box.
    if (tickers.length) {
        var ticker = new GSTTicker(tickers[0]);
        ticker.fetchData(function(property) {
            alert(property + ':' + ticker.data[property]);
        });
        tickers.push(ticker.data.symbol + ':' + ticker.data.price);
        GSTTicker.showTickerBox(tickers);
    }
});
