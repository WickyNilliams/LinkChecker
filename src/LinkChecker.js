var LinkChecker = (function( undefined ) {

    var Link,
        LinkProcessor,
        events;

    /**
     * The events we're exposing
     */
    events = {
        started : "started.linkChecker",
        checked : "checked.linkChecker",
        completed : "completed.linkChecker"
    };

    Link = function (elem) {
        this.elem = elem;
        this.uri = this.getUri();
    };
    Link.prototype = {

        Constructor : Link,

        /**
         * gets the uri that the element refers to.
         * currently only supports images and anchors
         * @returns {string} the uri if possible, null otherwise
         */
        getUri : function() {
            switch (this.elem.tagName.toLowerCase()) {
                case "a" :
                    return this.elem.getAttribute("href").toLowerCase();
                    break;
                case "img" :
                    return this.elem.getAttribute("src").toLowerCase();
                    break;
                default :
                    return null;
            }
        },

        /**
         * checks whether the element is pointing to a local resource
         * @returns {boolean} true if local, false otherwise
         */
        isLocal : function() {
            var domain = window.location.host.toLowerCase(),
                externalPattern = new RegExp("^http://(?!" + domain + ")", "i"),
                isExternal;

            isExternal =  externalPattern.test(this.uri);
            return !isExternal;
        },

        /**
         * makes AJAX request to url
         * @returns {boolean} true if 404, false otherwise
         */
        isBroken : function() {

            if(this.broken === undefined) {

                try{
                var http = new XMLHttpRequest();
                http.open('HEAD', this.uri, false);
                http.send();

                this.broken = http.status === 404;
                }
                catch(e) {
                    this.broken = false;
                }
            }

            return this.broken;
        }
    };

    LinkProcessor = function( elems ) {
        var subscriptions = {},
            progress = [];

        function storeResult(check) {
            progress[check.uri] = check;
        }

        function alreadyProcessed (check) {
            return progress[check.uri];
        }

        function on(topic, action, context) {
            if(!subscriptions[topic]) {
                subscriptions[topic] = [];
            }
            subscriptions[topic].push({
                action : action, context: context
            });
        }

        function fire(topic, params) {
            var i = 0,
                subs = subscriptions[topic];

            if(!subs) return;

            for(i; i < subs.length; i++) {
                if(subs[i].context) {
                    subs[i].action.call(subs[i].context, params);
                }
                else {
                    subs[i].action(params);
                }
            }
        }

        function go() {
            var link, i,
                toProcess = [];

            for(i = 0; i < elems.length; i++) {
                link = new Link(elems[i]);
                if(link.isLocal()) {
                    toProcess.push(link);
                }
            }
            
            fire(events.started, toProcess.length);

            for(i = 0 ; i < toProcess.length; i++) {
                link = toProcess[i];

                //if no url or already processed
                if(alreadyProcessed(link)) {
                    continue;
                }

                //flag uri as previously processed
                storeResult(link);
                link.isBroken();

                //notify any interested parties link was checked
                fire(events.checked, link);
            }

            //we're done!
            fire(events.completed, progress);
        }


        return {
            elems : elems,
            on : on,
            go : go
        };


    };

    return {
        LinkProcessor : LinkProcessor,
        Link : Link,
        events : events
    };

})( );