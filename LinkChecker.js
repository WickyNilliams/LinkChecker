var linkChecker = {
    checkedEvent : "checked.linkchecker",
    completeEvent : "complete.linkchecker"
};

//utility methods for dealing with URLs
linkChecker.checker = (function() {

    function uriExists ( url ) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status !== 404;
    }

    function isLocal ( uri ) {
        var domain = window.location.host.toLowerCase(),
            externalPattern = new RegExp("^http://(?!" + domain + ")", "i");

        var isExternal =  externalPattern.test(uri);
        return !isExternal;
    }

    function getUri ( elem ) {
        var uri;
        switch (elem.tagName.toLowerCase()) {
            case "a" :
                uri = elem.getAttribute("href");
                break;
            case "img" :
                uri = elem.getAttribute("src");
                break;
            default :
                uri = "";
        }
        return uri.toLowerCase();
    }

    return {
        getUri : getUri,
        isLocal : isLocal,
        uriExists : uriExists
    };

})(jQuery);


//handles the UI
linkChecker.UI = (function($) {
    var $container;

    function linkChecked(e, broken) {
        var $result = $("<li></li>"),
            uri = linkChecker.checker.getUri(this);

        if(broken) {
            $result.text(uri + " - broke!");
            $(this).css("color", "red");
        }
        else {
            $result.text(uri + " - OK!");
        }
        $container.append($result);
    }

    function complete(e, total, broken) {
        var totalResult = $("<p></p>"),
            brokenResults = $("<p></p>");

        totalResult.text("total unique local links: " + total);
        brokenResults.text("total broken links: " + broken);

        $container.parent().append(totalResult);
        $container.parent().append(brokenResults);
    }

    function wireEvents() {
        $(document).on(linkChecker.checkedEvent, "a, img", linkChecked);
        $(document).on(linkChecker.completeEvent, null, complete);
    }

    function drawUI () {
        var ui = $("<div></div>").attr("id", "linkChecker");
        ui.append("<h1>Link Checker</h1>");

        $container = ui.append("<ul></ul>");
        $container.appendTo("body");
    }

    function addStyles() {
        var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            rules,
            styleRules = "h1 { color: #f00}";

        styleRules += "p { font-weight: bold; }";
        
        rules = document.createTextNode(styleRules);

        style.type = 'text/css';
        if(style.styleSheet) {
            style.styleSheet.cssText = rules.nodeValue;
        }
        else {
            style.appendChild(rules);
        }

        head.appendChild(style);
    }

    $(function() {
        addStyles();
        drawUI();
        wireEvents();
    });

})(jQuery);

linkChecker.init = function (selector) {
    var $links = $(selector),
        progress = [],
        numBroken = 0,
        numLinks = 0;

    $links.each(function () {
        var $this = $(this),
            uri = linkChecker.checker.getUri(this),
            isBroken;

        //if no url (bad selector) or already processed
        if(!uri || progress[uri] || !linkChecker.checker.isLocal(uri)) {
            return;
        }

        //flag uri as previously processed
        progress[uri] = true;
        numLinks++;

        //if url doesn't exist - it's broken
        if(!linkChecker.checker.uriExists(uri)) {
            isBroken = true;
            numBroken++;
        }

        //notify any interested parties link was checked
        $this.trigger(linkChecker.checkedEvent, [isBroken]);
    });

    //notify any interested parties of completion
    $(document).trigger(linkChecker.completeEvent, [numLinks, numBroken]);
};

//(function ($) {
//    $.expr[":"].broken = function( obj, index, meta, stack ){
//        var $this = $(obj),
//            uri = linkChecker.checker.getUri(obj);
//
//            return uri // has a uri
//                && linkChecker.checker.isLocal(uri) // does not break same domain policy
//                && !linkChecker.checker.uriExists(uri); // and returns 404
//
//    };
//})(jQuery);

$(function() {
    linkChecker.init("a");
});