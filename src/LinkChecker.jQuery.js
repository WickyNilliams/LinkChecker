(function($) {

    var defaults = {
        started : function () {
            console.info("started link checking");
        },
        checked : function(link) {
            console.log("uri: %s, is broken: %s", link.uri, link.isBroken());
        },
        completed : function() {
            console.info("finished link checking");
        }
    };

    /**
     * The main linkChecker plugin
     */
    $.fn.linkChecker = function(options) {
        var processor,
            settings = $.extend({}, defaults, options);

        processor = new LinkChecker.LinkProcessor(this.toArray());
        processor.on(LinkChecker.events.started, settings.started);
        processor.on(LinkChecker.events.checked, settings.checked);
        processor.on(LinkChecker.events.completed, settings.completed);
        processor.go();

        return this;
    };

    /**
     * custom jquery selector for filtering broken links
     * @param obj
     */
    $.expr[":"].broken = function( obj ){

        var checker = new LinkChecker.Link(obj);
            return checker.uri // has a uri
                && checker.isLocal() // does not violate same-origin policy
                && checker.isBroken(); // and returns 404

    };
    
})(jQuery);