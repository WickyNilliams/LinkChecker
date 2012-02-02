
//handles the UI elements of the link checker
(function($, win, doc ) {
    var $container,
        checker = $.linkChecker,
        lnf = {},
        backupLnf =    {
            "body" : {
                "font-family" : "sans-serif"
            },
            "#linkChecker" : {
                background: "none repeat scroll 0 0 lightBlue",
                padding: "10px",
                position: "fixed",
                right: "14px",
                top: "20%"
            },
            "#linkChecker > ul" : {
                "list-style" : "none",
                padding : "0",
                margin : "0"
            },
            "#linkChecker > ul li" : {
                color: "white",
                padding: "5px 10px",
                "border-top" : "solid 1px white",
                "border-bottom" : "solid 1px gray",
                "font-weight" : "bold"
            },
            "#linkChecker li.ok" : {
                "background" : "green"
            },
            "#linkChecker li.broken" : {
                "background" : "red"
            },
            "h1" : {
                color : "red"
            }
        };

    /**
     * handler for link checked event
     * @param {Event} e The event
     * @param {boolean} broken whether the checked link was broken
     * @this {Element} the element on which the event was triggered
     */
    function checkedEvent(e, broken) {
        var $result = $("<li></li>"),
            uri = checker.getUri(this),
            $wrapper = $container.children("ul");

        if(broken) {
            $result.text(uri).addClass("broken");
            $(this).css("color", "red");
        }
        else {
            $result.text(uri).addClass("ok");
            $(this).css("color", "lime");
        }
        $wrapper.append($result);
    }

    /**
     * handler for link check complete event
     * @param {Event} e The event
     * @param {int} total The Total
     * @param {boolean} broken whether the checked link was broken
     * @this {Element} the element on which the event was triggered
     */
    function completedEvent(e, total, broken) {
        var totalResult = $("<p></p>"),
            brokenResults = $("<p></p>");

        totalResult.text("total unique local links: " + total);
        brokenResults.text("total broken links: " + broken);

        $container.parent()
                .append(totalResult)
                .append(brokenResults);
    }

    /**
     * draws UI when it's time to start the show
     * @param {Event} e the event
     * @param {Element[]} links an array of all links selected
     */
    function startedEvent(e, links) {
        addStyles();
        drawUI();
    }

    /**
     * wires up listeners for events
     */
    function wireUp() {
        var selector = "a, img";
        $(doc).on(checker.events.started, startedEvent);
        $(doc).on(checker.events.checked, selector, checkedEvent);
        $(doc).on(checker.events.completed, completedEvent);
    }

    /**
     * responsible for setting up the UI
     */
    function drawUI () {
        var ui = $("<div></div>").attr("id", "linkChecker");
        ui.append("<h1>Link Checker</h1>");

        $container = ui.append("<ul></ul>");
        $container.appendTo("body");
    }

    /**
     * adds any styles required for prettying up the UI
     */
    function addStyles() {

        /**
         * Generates css syntax from an object
         * @param {Object} rules the css rules
         */
        function css(rules) {

            var rule,
                out = "",
                current,
                prop;

            //iterate over each rule
            for(rule in rules) {
                if(rules.hasOwnProperty(rule)) {
                    current = rules[rule];

                    //open rule block
                    out += rule + "{";

                    //loop over properties
                    for(prop in current) {
                        if(current.hasOwnProperty(prop)) {
                            out += prop + ":" + current[prop] + ";";
                        }
                    }

                    //close rule block
                    out += "}";
                }
            }

            return out;
        }

        /**
         * Appends an a style block to the document head
         * @param {string} styles the styles to add to the page
         */
        function appendStylesheet(styles) {
            var head = doc.getElementsByTagName("head")[0],
                style = doc.createElement("style"),
                rules = doc.createTextNode(styles);

            style.type = "text/css";

            if(style.styleSheet) {
                style.styleSheet.cssText = rules.nodeValue;
            }
            else {
                style.appendChild(rules);
            }

            head.appendChild(style);
        }

        appendStylesheet(css(lnf));
    }

    /**
     * ensure event handlers wired up
     * for when the document is ready
     */
    $(function() {
        wireUp();
    });

})(jQuery, window, document);