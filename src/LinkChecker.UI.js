/*global jQuery:false, LinkChecker:false */

//handles the UI elements of the link checker
(function($, win, doc, LinkChecker) {
    var $container = $("<div id='linkChecker'></div>"),
        viewModel = {
            total: 0,
            progress : 0,
            broken : []
        },
        events = LinkChecker.events;

    /**
     * draws UI when it's time to start the show
     * @param {int} total the total number of links to process
     */
    function startedEvent(total) {
        /**
         * responsible for setting up the UI
         */
        function drawUI (count) {
            var $progress = $("<div class='module'></div>");

            $container.append("<h1 class='module'>Link Checker</h1>");
            $progress.append("<div class='progress-bar'><div class='progress' style='width:0'></div></div>");
            $progress.append("<span class='complete'>0</span>");
            $progress.append("<span class='total'>" + count + "</span>");

            $container.append($progress);
            $container.appendTo("body");
        }

        /**
         * adds any styles required for prettying up the UI
         */
        function addStyles() {

            var rules = "body {margin-top: 50px !important;}#linkChecker{font-family:sans-serif!important;background:rgba(32,32,32,0.9);padding:0;position:fixed;z-index:9999;top:0;right:0;left:0;height:50px;font-size:12px;color:#fff}#linkChecker .module{float:left;margin:10px 0 10px 20px}#linkChecker h1{font-size:21px;font-weight:bold;border: none; background: none;line-height:30px;color:#fff;text-shadow:1px 1px 0 #6e538a,2px 2px 0 #6e538a,3px 3px 0 #6e538a;padding-right:20px;border-right:1px solid #fff}#linkChecker .progress-bar{float:left;height:17px;border:1px solid #fff;padding:2px;width:100px;margin:4px 10px 0 0}#linkChecker .progress-bar .progress{background:#6e538a;height:100%}#linkChecker .complete{font-size:16px;font-weight:bold;line-height:30px}#linkChecker .total{font-size:12px;color:##fff;line-height:30px}#linkChecker .total:before{content:'/';padding:0 5px}#linkChecker .broken{padding:0 10px;position:relative;}#linkChecker .broken:hover{background:#222}#linkChecker .broken span{line-height:30px;display:inline-block;color:#fff;font-weight:bold; font-size: 14px;}#linkChecker .broken:hover span{color:#fff}#linkChecker .broken .tally{color:#fff;margin-left:5px}#linkChecker .broken ul{padding:10px 0 0 0;margin:0;list-style:none;display:none;max-height:400px;overflow-y:auto;position:relative;z-index:99999}#linkChecker .broken:hover ul{display:block}#linkChecker .broken ul li{max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space: nowrap;border-top:1px solid #6e538a;padding:15px 5px}a.broken-link{background-color:red;color:white;border:solid 2px red}";

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
        }

        viewModel.total = total;
        addStyles();
        drawUI(viewModel.total);
    }

    /**
     * handler for link checked event
     * @param {Link} link the link that has been checked
     */
    function checkedEvent(link) {
        var $complete = $container.find(".complete"),
            $progressBar = $container.find(".progress");

        viewModel.progress++;
        if(link.broken) {
            viewModel.broken.push(link);
            $(link.elem).addClass("broken-link").css({
                "font-weight" : "bold"
            });
        }
        else {
            $(link.elem).css({
                color: "green",
                "font-weight" : "bold"
            });
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
        
        $wrapper.append("<span>Broken links</span>");
        $wrapper.append("<span class='tally'>(" + viewModel.broken.length + ")</span>");

        if(viewModel.broken.length === 0) {
            $container.append($wrapper);
            return;
        }

        for(var i = 0; i < viewModel.broken.length; i++) {
            $result = $("<li></li>").text(viewModel.broken[i].uri);
            $results.append($result);
        }
        $wrapper.append($results);
        $container.append($wrapper);
    }


    $(function() {
        var processor = new LinkChecker.LinkProcessor(doc.getElementsByTagName("a"));

        processor.on(events.started, startedEvent);
        processor.on(events.checked, checkedEvent);
        processor.on(events.completed, completedEvent);
        
        processor.go();
    });

}(jQuery, window, document, LinkChecker));