(function( $ ) {

    //utility methods
    var checker = {

        //events we're exposing
        events : {
            started : "started.linkchecker",
            checked : "checked.linkchecker",
            completed : "completed.linkchecker"
        },

        // makes AJAX request to url
        //return false if 404, true otherwise
        uriExists : function ( url ) {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return http.status !== 404;
        },

        //checks whether a uri is local or not
        //basically whether it conforms same-origin policy
        isLocal : function ( uri ) {
            var domain = window.location.host.toLowerCase(),
                externalPattern = new RegExp("^http://(?!" + domain + ")", "i");

            var isExternal =  externalPattern.test(uri);
            return !isExternal;
        },

        //given an element returns it's URI
        //returns empty string if no URI available
        getUri : function ( elem ) {
            var uri;
            switch (elem.tagName.toLowerCase()) {
                case "a" :
                    uri = elem.getAttribute("href");
                    break;
                case "img" :
                    uri = elem.getAttribute("src");
                    break;
                default :
                    uri = null;
            }
            return uri.toLowerCase();
        }

    };

    //the main plugin
    $.fn.linkChecker = function() {

        var progress = [],
            numLinks = 0,
            numBroken = 0,
            $document = $(document);

        //trigger
        $document.trigger(checker.events.started, [this]);
        
        this.each(function () {
            
            var $this = $(this),
                uri = checker.getUri(this),
                isBroken = false;

            //if no url (bad selector) or already processed
            if(!uri || progress[uri] || !checker.isLocal(uri)) {
                return;
            }

            //flag uri as previously processed
            progress[uri] = true;
            numLinks++;

            //if url doesn't exist - it's broken
            if(!checker.uriExists(uri)) {
                isBroken = true;
                numBroken++;
            }

            //notify any interested parties link was checked
            $this.trigger(checker.events.checked, [isBroken]);

        });

        //notify of completed event
        $document.trigger(checker.events.completed, [numLinks, numBroken]);

        return this;

    };

    //custom jquery selector for filtering broken links
    $.expr[":"].broken = function( obj, index, meta, stack ){
        var $this = $(obj),
            uri = checker.getUri(obj);

            return uri // has a uri
                && checker.isLocal(uri) // does not violate same-origin policy
                && !checker.uriExists(uri); // and returns 404

    };

    //expose our utility methods
    $.linkChecker = checker;

})( jQuery );


//handles the UI elements of the link checker
(function($) {
    var $container,
        checker = $.linkChecker;

    //handler for link checked event
    function checkedEvent(e, broken) {
        var $result = $("<li></li>"),
            uri = checker.getUri(this);

        if(broken) {
            $result.text(uri + " - broke!");
            $(this).css("color", "red");
        }
        else {
            $result.text(uri + " - OK!");
        }
        $container.append($result);
    }

    //handler for link check complete event
    function completedEvent(e, total, broken) {
        var totalResult = $("<p></p>"),
            brokenResults = $("<p></p>");

        totalResult.text("total unique local links: " + total);
        brokenResults.text("total broken links: " + broken);

        $container.parent().append(totalResult);
        $container.parent().append(brokenResults);
    }

    //draws UI when it's time to start the show
    function startedEvent(e, links) {
        addStyles();
        drawUI();
    }

    //wires up listeners for events
    function wireUp() {
        var selector = "a, img";
        $(document).on(checker.events.started, null, startedEvent)
        $(document).on(checker.events.checked, selector, checkedEvent);
        $(document).on(checker.events.completed, null, completedEvent);
    }

    //responsible for setting up the UI
    function drawUI () {
        var ui = $("<div></div>").attr("id", "linkChecker");
        ui.append("<h1>Link Checker</h1>");

        $container = ui.append("<ul></ul>");
        $container.appendTo("body");
    }

    //adds any styles required for prettying up the UI
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

    //what to do when document is ready
    $(function() {
        wireUp();
    });

})(jQuery);


$(function() {
    $("a").linkChecker();
});