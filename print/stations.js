/* The stations and web addresses the printouts point to.
   Used by print/build.js and print/make-qr.js (Node) and by print/labels.html and
   print/guide-quest.html (browser). */
(function (root) {
  'use strict';
  var SITE = 'https://aisa-ai-web.github.io/arcade/';
  // Stations whose guide is on another site. Both sites are in English and Arabic, but a link
  // can't choose the language, so labelNote (under the label's QR code) and guideNote (in the
  // printed guide) say how to switch.
  var OTHER = {
    6: {
      url: 'https://aisa-ai-web.github.io/data-anonymizer/',
      labelNote: { en: '', ar: 'إن فُتحت بالإنجليزية، فانقر «العربية» أعلى يمين الصفحة.' },
      guideNote: { en: '', ar: 'إن فُتحت الأداة بالإنجليزية، فانقر «العربية» أعلى يمين الصفحة.' }
    },
    7: {
      url: 'https://aisa-ai-web.github.io/The-Learning-Hub/PD%20Modules/ai-and-assessment.html',
      labelNote: { en: 'Sign in with your AISA account.', ar: 'سجّل الدخول بحساب AISA، ثم انقر «العربية» أعلى الصفحة.' },
      guideNote: { en: '', ar: 'إن فُتحت الوحدة بالإنجليزية، فانقر «العربية» أعلى الصفحة.' }
    }
  };
  var DIRS = ['Station-1-Differentiation', 'Station-2-Lesson-Decks', 'Station-3-Engagement',
    'Station-4-Lesson-Video', 'Station-5-Coding-Activities', '', ''];
  // File names in the zip of guides
  var NAMES = ['Differentiation and Scaffolding', 'Lesson Decks', 'Engagement', 'Lesson Video',
    'Coding Activities', 'Student Data Anonymizer', 'AI and Assessment'];
  var STATIONS = DIRS.map(function (dir, i) {
    var n = i + 1, other = OTHER[n];
    return {
      n: n,
      dir: dir,
      name: NAMES[i],
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
