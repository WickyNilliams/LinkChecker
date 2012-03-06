
//handles the UI elements of the link checker
(function($, win, doc ) {
    var $container,
        lnf = {};

    /**
     * handler for link checked event
     * @param {Event} e The event
     * @param {LinkChecker.Link} link the Checker object for the current element
     * @this {Element} the element on which the event was triggered
     */
    function checkedEvent(link) {

        var $result = $("<li></li>"),
            $wrapper = $container.children("ul"),
            cssClass = link.isBroken() ? "broken" : "ok";

        $result.text(link.uri).addClass(cssClass);
        $wrapper.append($result);
    }

    /**
     * handler for link check complete event
     * @param {LinkChecker.Link[]} results The event
     */
    function completedEvent(results) {
        $("<p></p>").text("total unique local links: " + results.length)
                    .appendTo($container.parent());
    }

    /**
     * draws UI when it's time to start the show
     */
    function startedEvent() {
        addStyles();
        drawUI();
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
        var processor = new LinkChecker.LinkProcessor(document.getElementsByTagName("a"));

        processor.on(LinkChecker.events.started, startedEvent);
        processor.on(LinkChecker.events.checked, checkedEvent);
        processor.on(LinkChecker.events.completed, completedEvent);
        
        processor.go();
    });

})(jQuery, window, document);