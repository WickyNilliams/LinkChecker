(function( $, win, doc ) {

    /**
     * Utility methods
     */
    var checker = {

        /**
         * The events we're exposing
         */
        events : {
            started : "started.linkChecker",
            checked : "checked.linkChecker",
            completed : "completed.linkChecker"
        },

        /**
         * makes AJAX request to url
         * return false if 404, true otherwise
         * @param url
         */
        uriExists : function ( url ) {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return http.status !== 404;
        },

        /**
         * checks whether a uri is local or not
         * basically whether it conforms same-origin policy
         * @param uri
         */
        isLocal : function ( uri ) {
            var domain = window.location.host.toLowerCase(),
                externalPattern = new RegExp("^http://(?!" + domain + ")", "i");

            var isExternal =  externalPattern.test(uri);
            return !isExternal;
        },

        /**
         * given an element returns it's URI
         * returns empty string if no URI available
         * @param elem
         */
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

    /**
     * The main linkChecker plugin
     */
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
            //TODO: store more data about links checked to pass on completed event
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

    /**
     * custom jquery selector for filtering broken links
     * @param obj
     */
    $.expr[":"].broken = function( obj ){
        var uri = checker.getUri(obj);

            return uri // has a uri
                && checker.isLocal(uri) // does not violate same-origin policy
                && !checker.uriExists(uri); // and returns 404

    };

    //expose our utility methods
    $.linkChecker = checker;

})( jQuery, window, document );