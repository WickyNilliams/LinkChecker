(function() {
    //modify these as you see fit
    var jQueryUrl = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js",
        linkCheckerUrl = "https://raw.github.com/WickyNilliams/LinkChecker/master/src/LinkChecker.js",
        linkCheckerUiUrl = "https://raw.github.com/WickyNilliams/LinkChecker/master/src/LinkChecker.UI.js";

    function loadScript(url, callback) {

        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = url;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
            var loaded = this.readyState === "loaded",
                completed = this.readyState === "complete";

            if(!this.readyState || loaded || completed) {

                callback && callback();

                // Handle memory leak in IE
                script.onload = script.onreadystatechange = null;
                head.removeChild( script );
            }
        };

        head.appendChild(script);
    }

    //Daisy-chain script loading, bad form but functional
    loadScript(jQueryUrl, function() {
        loadScript(linkCheckerUrl, function() {
            loadScript(linkCheckerUiUrl);
        });
    });

}());

