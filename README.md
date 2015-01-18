# JS Quiz (v2)

This is an exercise I did to force myself into using pure JS to build something. 

**Conclusion:** It's quite an ordeal. 

It's not necessarily _difficult_ per se, but the code you end up writing is very verbose. jQuery like functionality would have been a great addition to the core of browser-based JavaScript. It's now clearer than ever in my mind why almost any project depends on jQuery.

Anyway, this repos stands alone except for development dependencies. I'm using Jade and Stylus for the rest of the front-end, but all JS is simply vanilla JS. There are no dependencies and there is no build process outside of moving the JS files from `src/` to `public/`.

## The App

This is a simple JS based quiz application: It will ask you a series of questions to which you can choose multiple-choice answers to. It's nothing too spectactular, but it was a good opportunity to build a simple single-page app using vanilla JS. It also makes use of DocumentFragments for increased performance, something I hadn't had a chance to play around with before.
