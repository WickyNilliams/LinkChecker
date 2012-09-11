var LinkChecker = (function( window ) {

    var events;

    /**
     * Encapsulates logic for making Asynchronous HTTP requests
     * @param url
     * @param {object} options options
     * @param {function} [options.success] the success callback
     * @param {function} [options.error] the error callback
     * @param {function} [options.complete] the complete callback
     * @param {string} [options.method="GET"] the HTTP method to utilise
     * @constructor
     */
    function AsyncRequest(url, options) {
        this.url = url;
        this.successCallback = options.success;
        this.errorCallback = options.error;
        this.completeCallback = options.complete;
        this.method = options.method || "GET";
        this.httpRequest = this.getXhr();
    }
    AsyncRequest.prototype = {

        getXhr  : function() {
            var httpRequest;

            if (window.XMLHttpRequest) { // Mozilla, Safari, ...
                httpRequest = new XMLHttpRequest();
            } else if (window.ActiveXObject) { // IE
                try {
                    httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                }
                catch (e) {
                    try {
                        httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                    }
                    catch (e) {}
                }
            }

            return httpRequest;
        },

        request : function() {
            var httpRequest = this.httpRequest,
                self = this;

            if (!httpRequest) {
                return false;
            }
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        self.successCallback && self.successCallback(httpRequest);
                    } else {
                        self.errorCallback && self.errorCallback(httpRequest);
                    }

                    self.completeCallback && self.completeCallback(httpRequest);
                }
            };
            httpRequest.open(this.method, this.url);
            httpRequest.send();
        }
    };

    /**
     * Offers functionality for some basic Pub/Sub
     * @param {object} [target] supply a target for mixin approach
     * @constructor
     */
    function PubSub(target) {
        var self = target || this;

        self.subscriptions = {};

        self.on = function(topic, action, context) {
            if(!self.subscriptions[topic]) {
                self.subscriptions[topic] = [];
            }
            self.subscriptions[topic].push({
                action : action, context: context
            });
        };

        self.off = function(topic) {
            self.subscriptions[topic] = null;
        };

        self.fire = function(topic, params) {
            var i = 0,
                subs = self.subscriptions[topic];

            if(!subs) {
                return;
            }

            for(i; i < subs.length; i++) {
                if(subs[i].context) {
                    subs[i].action.call(subs[i].context, params);
                }
                else {
                    subs[i].action(params);
                }
            }
        };
    }

    /**
     * The events we're exposing
     */
    events = {
        started : "started.linkChecker",
        checked : "checked.linkChecker",
        completed : "completed.linkChecker"
    };

    function Link(elem) {
        this.elem = elem;
        this.getUri();
        this.broken = null;
    }
    Link.prototype = {

        /**
         * gets the uri that the element refers to.
         * currently only supports images and anchors
         * @returns {string} the uri if possible, null otherwise
         */
        getUri : function() {
            var uri;
            switch (this.elem.tagName.toLowerCase()) {
                case "a" :
                    uri = this.elem.getAttribute("href");
                    break;
                case "img" :
                    uri = this.elem.getAttribute("src");
                    break;
            }

            this.uri =  uri;
        },

        /**
         * checks whether the element is pointing to a local resource
         * @returns {boolean} true if local, false otherwise
         */
        isLocal : function() {

            var loc = window.location,
                a = document.createElement('a'),
                isLocal;

            a.href = this.uri ;

            return a.hostname === loc.hostname 
                && a.port === loc.port
                && a.protocol === loc.protocol;
        },

        /**
         * makes AJAX request to url
         * @param {function} callback called when request is complete. Called in context of current object
         */
        check : function(callback) {
            var self = this,
                async,
                targetId;

            if(self.uri.match(/^#/)) {
                targetId = self.uri.replace("#", "");
                self.broken = window.document.getElementById(targetId) === null;
                callback.call(self);
            }
            else {

                async = new AsyncRequest(self.uri, {
                    method : "HEAD",
                    complete : function(httpRequest) {
                        self.broken = httpRequest.status === 404;
                        callback.call(self);
                    }
                });
                async.request();
            }
        }
    };

    /**
     * Handles batch processing of links
     * @param {NodeList} elems the elements to process
     * @constructor
     */
    function LinkProcessor(elems) {
        this.progress = [];
        this.toProcess = [];
        this.itemsProcessed = 0;

        //inherit from PubSub
        PubSub.call(this);

        //create process list of all local links
        var link, length = elems.length;
        for(var i = 0; i < length; i++) {
            link = new Link(elems[i]);
            if(link.isLocal()) {
                this.toProcess.push(link);
            }
        }
    }
    LinkProcessor.prototype = {

        /**
         * mark supplied link as already processed
         * @param {Link} link the link to mark
         */
        markProcessed : function (link) {
            this.progress[link.uri] = link;
        },

        /**
         * checks whether processing has completed (i.e. all requests have returned)
         * @return {Boolean} true if processing is complete, false otherwise
         */
        isComplete : function() {
            return this.itemsProcessed === this.toProcess.length;
        },

        /**
         * checks whether the supplied link has already been processed
         * @param {Link} link the link to check
         * @return {Boolean} truth-y value if already processed, false-y otherwise
         */
        alreadyProcessed : function (link) {
            return this.progress[link.uri];
        },

        /**
         * Helper method for handling a link having been checked
         * @param {Link} link the link which has been checked
         */
        handleLinkChecked : function(link) {
            this.itemsProcessed++;
            this.fire(events.checked, link);

            if(this.isComplete()) {
                this.fire(events.completed);
            }
        },

        /**
         * Kicks off processing of links
         */
        go : function () {
            var link, i,
                self = this;

            self.fire(events.started, this.toProcess.length);

            for(i = 0 ; i < self.toProcess.length; i++) {

                link = self.toProcess[i];

                if(this.alreadyProcessed(link)) {
                    self.handleLinkChecked(link);
                }
                else {
                    self.markProcessed(link);
                    link.check(function() {
                        self.handleLinkChecked(this);
                    });
                }
            }
        }
    };

    return {
        LinkProcessor : LinkProcessor,
        Link : Link,
        events : events
    };

}(window));