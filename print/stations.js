/* The stations and web addresses the printouts point to.
   Used by print/build.js and print/make-qr.js (Node) and by print/labels.html (browser). */
(function (root) {
  'use strict';
  var SITE = 'https://aisa-ai-web.github.io/arcade/';
  var ANONYMIZER = 'https://aisa-ai-web.github.io/data-anonymizer/';
  var STATIONS = [1, 2, 3, 4, 5, 6].map(function (n) {
    var dir = ['Station-1-Differentiation', 'Station-2-Lesson-Decks', 'Station-3-Engagement',
      'Station-4-Lesson-Video', 'Station-5-Coding-Activities', ''][n - 1];
    return {
      n: n,
      dir: dir,
      // Station 6's guide is the anonymizer itself, on its own site (English only)
      url: function (lang) { return dir ? SITE + dir + '/?lang=' + lang : ANONYMIZER; },
      // Short form printed under each QR code
      short: function (lang) {
        return (dir ? SITE + dir + '/?lang=' + lang : ANONYMIZER).replace(/^https:\/\//, '').replace(/\/$/, '');
      }
    };
  });
  var api = { SITE: SITE, ANONYMIZER: ANONYMIZER, STATIONS: STATIONS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRINT_STATIONS = api;
})(this);
