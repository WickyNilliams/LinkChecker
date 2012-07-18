#LinkChecker#

LinkChecker is a simple, lightweight JavaScript framework that assists in checking for broken links.

##Core Types##

###LinkChecker.Link###

The `Link` type is used to check an individual url.
Construct a `Link` type by passing in a DOM element that is either an anchor or an image (beware that this is not enforced in code):

    //assume HTML:
    //<a href="/some/local/link" id="someElement">Link Text</a>
    var someLink = new LinkChecker.Link(document.getElementById("someElement"));

Call the `isLocal()` method to check whether checking the link will violate the same-origin policy.
This is a safety measure that is a necessity unless you have disabled the same-origin policy in your browser.

    if(someLink.isLocal()) {

        //do something

    }

Assuming our link was local, check whether its broken.
In the callback, `this` is bound to the link object and the `broken` property stores the result of the check:

    //supply callback for when request has completed
    link.check(function() {

        //'this' is bound to your Link object

        //outputs:
        //Checked URI '/some/local/link' on element with ID 'someElement'. Is broken: false
        console.log("Checked URI '%s' on element with ID '%s'. Is broken: %s", " this.uri, this.elem.id, this.broken);

    });


###LinkChecker.LinkProcessor###

The `LinkProcessor` type is used to batch process links.
URLs will only be checked once if the URL exists in more than one location in a document


To construct a `LinkProcessor` supply an array of relevant DOM elements:

    //we will check every link in the document
    var processor = new LinkChecker.LinkProcessor(document.getElementsByTagName("a"));


It uses a pub/sub system to give plenty of flexibility.
The events exposed by `LinkProcessor` can be found in `LinkChecker.events` object.

The started event is fired immediately before processing begins:

    processor.on(LinkChecker.events.started, function(numberOfLinks) {

        //callback is supplied with number of links to be processed
        //filtered by those which do not violate same-origin policy (a subset of the links passed into constructor)
        console.log("beginning processing of %i links", numberOfLinks);

    });


The checked event is called as each link is checked:

    processor.on(LinkChecker.events.checked, function(link) {

        //callback is supplied with a primed link object
        console.log("checked uri: '%s', is broken: %s", " link.uri, link.broken); //checked uri: '/some/local/link', is broken: false

    });


The completed event is supplied with an array of all processed Links:

    processor.on(LinkChecker.events.completed, function(processed) {
        var count = 0;

        //tally up broken links
        for(var i = 0; i < processed.length; i++) {
            if(processed[i].broken) {
                count++;
            }
        }

        //output a summary
        console.log("completed processing, found %i broken links", count);

    });


##LinkChecker.UI##

LinkChecker.UI is an sample (but fully functional!) application of the LinkChecker types.
It provides a UI with progress bar, highlighting links as it checks them, and reporting on broken links when checking is complete.
Just include `LinkChecker.UI.js`, along with the `LinkChecker.js`, on any web page to see it in action.

###Bookmarklet###

The easiest way to utilise the LinkChecker.UI functionality is to create a bookmarklet from the code contained in`LinkChecker.Bookmarklet.js`.
If you do this, checking links on any web page is a breeze!
As it is, the bookmarklet hotlinks the latest code on GitHub, so please modify if you wish to stick to a specific version.