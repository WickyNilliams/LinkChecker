
//handles the UI elements of the link checker
(function($, win, doc ) {
    var $container = $("<div id='linkChecker'></div>"),
//        lnf = {},
        viewModel = {
            total: 0,
            progress : 0,
            broken : []
        };

    /**
     * draws UI when it's time to start the show
     */
    function startedEvent(total) {
        /**
         * responsible for setting up the UI
         */
        function drawUI () {
            var $progress = $("<div class='module'></div>");

            $container.append("<h1 class='module'>Link Checker</h1>");
            $progress.append("<div class='progress-bar'><div class='progress' style='width:0'></div></div>");
            $progress.append("<span class='complete'>0</span>");
            $progress.append("<span class='total'>" + viewModel.total + "</span>");

            $container.append($progress);
            $container.appendTo("body");
        }

        /**
         * adds any styles required for prettying up the UI
         */
        function addStyles() {

            var rules = "#linkChecker{font-family:sans-serif!important;background:rgba(32,32,32,0.9);padding:0;position:fixed;top:0;right:0;left:0;height:50px;font-size:12px;color:#fff}#linkChecker .module{float:left;margin:10px 0 10px 20px}#linkChecker h1{font-size:16px;font-weight:bold;line-height:30px;color:#fff;text-shadow:1px 1px 0 #6e538a,2px 2px 0 #6e538a,3px 3px 0 #6e538a;padding-right:20px;border-right:1px solid #fff}#linkChecker .progress-bar{float:left;height:17px;border:1px solid #fff;padding:2px;width:100px;margin:4px 10px 0 0}#linkChecker .progress-bar .progress{background:#6e538a;height:100%}#linkChecker .complete{font-size:16px;font-weight:bold;line-height:30px}#linkChecker .total{font-size:12px;color:#6e538a;line-height:30px}#linkChecker .total:before{content:'/';padding:0 5px}#linkChecker .broken{padding:0 10px}#linkChecker .broken:hover{background:#222}#linkChecker .broken span{line-height:30px;display:inline-block;color:#6e538a;font-weight:bold}#linkChecker .broken:hover span{color:#fff}#linkChecker .broken .tally{color:#fff;margin-left:5px}#linkChecker .broken ul{padding:10px 0;margin:0;list-style:none;display:none}#linkChecker .broken:hover ul{display:block}#linkChecker .broken ul li{border-top:1px solid #6e538a;padding:5px}a.broken-link{background-color:red;color:white;border:solid 2px red}";

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

            appendStylesheet(rules);
//            appendStylesheet(css(lnf));
        }

        viewModel.total = total;
        addStyles();
        drawUI();
    }

    /**
     * handler for link checked event
     * @param {LinkChecker.Link} link the link
     */
    function checkedEvent(link) {
        var $complete = $container.find(".complete"),
            $progressBar = $container.find(".progress");

        viewModel.progress++;
        if(link.isBroken()) {
            viewModel.broken.push(link);
            $(link.elem).addClass("broken-link");
        }
        
        $complete.text(viewModel.progress);
        var percentage = ((viewModel.progress / viewModel.total)*100) + "%";
        $progressBar.css("width", percentage);

    }

    /**
     * handler for link check complete event
     */
    function completedEvent() {
        var $wrapper = $("<div class='module broken'></div>"),
            $results = $("<ul></ul>"),
            $result,
            $total = $container.find(".total");

        $container.find(".progress").css("width", "100%");
        $container.find(".complete").text($total.text());

        if(viewModel.broken.length === 0) return;
        
        $wrapper.append("<span>Broken links</span>");
        $wrapper.append("<span class='tally'>(" + viewModel.broken.length + ")</span>");

        for(var i = 0; i < viewModel.broken.length; i++) {
            $result = $("<li></li>").text(viewModel.broken[i].uri);
            $results.append($result);
        }
        $wrapper.append($results);
        $container.append($wrapper);
    }


    $(function() {
        var processor = new LinkChecker.LinkProcessor(document.getElementsByTagName("a"));

        processor.on(LinkChecker.events.started, startedEvent);
        processor.on(LinkChecker.events.checked, checkedEvent);
        processor.on(LinkChecker.events.completed, completedEvent);
        
        processor.go();
    });

})(jQuery, window, document);