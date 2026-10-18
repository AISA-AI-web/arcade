/* The stations and web addresses the printouts point to.
   Used by print/build.js and print/make-qr.js (Node) and by print/labels.html and
   print/guide-quest.html (browser). */
(function (root) {
  'use strict';
  var SITE = 'https://aisa-ai-web.github.io/arcade/';
  // Stations whose guide is on another site. Neither site opens in Arabic from a link, so
  // labelNote (under the label's QR code) and guideNote (in the printed guide) say what to expect.
  var OTHER = {
    6: {
      url: 'https://aisa-ai-web.github.io/data-anonymizer/',
      labelNote: { en: '', ar: 'الأداة باللغة الإنجليزية، وخطواتها بالعربية في الدليل المطبوع.' },
      guideNote: { en: '', ar: 'الأداة باللغة الإنجليزية، وأسماء الأزرار في هذا الدليل كما تظهر على الشاشة.' }
    },
    7: {
      url: 'https://aisa-ai-web.github.io/The-Learning-Hub/PD%20Modules/ai-and-assessment.html',
      labelNote: { en: 'Sign in with your AISA account.', ar: 'سجّل الدخول بحساب AISA، ثم انقر «العربية» أعلى الصفحة.' },
      guideNote: { en: '', ar: 'إن فُتحت الوحدة بالإنجليزية، فانقر «العربية» أعلى الصفحة.' }
    }
  };
  var DIRS = ['Station-1-Differentiation', 'Station-2-Lesson-Decks', 'Station-3-Engagement',
    'Station-4-Lesson-Video', 'Station-5-Coding-Activities', '', ''];
  var STATIONS = DIRS.map(function (dir, i) {
    var n = i + 1, other = OTHER[n];
    return {
      n: n,
      dir: dir,
      labelNote: other ? other.labelNote : null,
      guideNote: other ? other.guideNote : null,
      url: function (lang) { return dir ? SITE + dir + '/?lang=' + lang : other.url; },
      // Short form printed under each QR code
      short: function (lang) {
        return decodeURI(dir ? SITE + dir + '/?lang=' + lang : other.url).replace(/^https:\/\//, '').replace(/\/$/, '');
      }
    };
  });
  var api = { SITE: SITE, STATIONS: STATIONS };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PRINT_STATIONS = api;
})(this);
