/* =====================================================================
   pD-Day 2026 · GAME CONTENT
   ---------------------------------------------------------------------
   This is the file to edit when you add or change quests.

   • Every piece of text is { en: '…', ar: '…' }. If `ar` is missing the
     English is shown instead.
   • Wrap the name of a button or menu in **double stars** and it shows
     up bold (and keeps its direction inside Arabic text), e.g.
     'Click **Generate**'.
   • {name} is replaced with the player's first name.
   • Image paths in a mission are relative to the quest's `dir`.
   • To add a station: copy one quest object, give it a new `id`,
     `station` number, `theme` and `badge`, and the school builds an
     extra room for it automatically.
     Themes: library, studio, arena, cinema, lab, vault.
     Badge icons: levels, slides, hook, clapper, code, vault, paw, crown,
     coffee, paper, fridge, heart, compass, wall, bell.
   ===================================================================== */
var PD = window.PD = window.PD || {};

PD.config = {
  title: 'pD-Day 2026',
  subtitle: { en: 'The AISA AI PD Quest', ar: 'رحلة التطوير المهني في الذكاء الاصطناعي' },
  dates: { en: '19–20 October 2026', ar: '19–20 أكتوبر 2026' },
  school: { en: 'American International School in Abu Dhabi', ar: 'المدرسة الأمريكية الدولية في أبوظبي' },
  stationsPage: 'stations.html',
  saveKey: 'pdday2026-save-v1'
};

/* ---------------------------------------------------------------------
   QUESTS — one per station / room
   --------------------------------------------------------------------- */
PD.quests = [

  /* ================= STATION 1 ================= */
  {
    id: 'differentiation',
    station: 1,
    theme: 'library',
    color: '#2E9E6B',
    dir: 'Station-1-Differentiation/',
    guide: 'index.html',
    room: { en: 'The Level-Up Library', ar: 'مكتبة المستويات' },
    title: { en: 'Differentiation & Scaffolding', ar: 'التمايز والدعم التدريجي' },
    tagline: {
      en: 'One text, three reading levels, zero students left behind.',
      ar: 'نصّ واحد، ثلاثة مستويات قراءة، ولا طالب يتخلّف عن الركب.'
    },
    time: { en: '~15 min', ar: 'نحو 15 دقيقة' },
    tools: { en: 'Re-level text · Vocabulary list · Translate text', ar: 'Re-level text · Vocabulary list · Translate text' },
    links: [
      { label: { en: 'Gemini in Classroom', ar: 'Gemini في Classroom' }, url: 'https://classroom.google.com/ai' },
      { label: { en: 'Re-level text', ar: 'إعادة ضبط مستوى النص' }, url: 'https://classroom.google.com/ai/rlv' },
      { label: { en: 'Vocabulary list', ar: 'قائمة المفردات' }, url: 'https://classroom.google.com/ai/vl' },
      { label: { en: 'Translate text', ar: 'ترجمة النص' }, url: 'https://classroom.google.com/ai/tr' }
    ],
    briefing: [
      {
        en: 'Welcome to the Level-Up Library! Same story, different reading levels. Think of it as a dimmer switch for difficulty.',
        ar: 'أهلاً بك في مكتبة المستويات! القصة نفسها بمستويات قراءة مختلفة. فكّر فيها كمفتاح تحكّم بدرجة الصعوبة.'
      },
      {
        en: 'Your tools live in Google Classroom › **Gemini** tab: **Re-level text**, **Create a vocabulary list** and **Translate text**.',
        ar: 'أدواتك موجودة في Google Classroom › تبويب **Gemini**: **Re-level text** و**Create a vocabulary list** و**Translate text**.'
      },
      {
        en: 'Nothing reaches students until YOU click **Assign**. Everything stays a draft. Even my roar is a draft until I approve it.',
        ar: 'لن يصل شيء إلى الطلاب حتى تنقر أنت على **Assign**. كل شيء يبقى مسودة… حتى زئيري يبقى مسودة إلى أن أوافق عليه.'
      }
    ],
    kit: [
      { en: 'Sign in to Google Classroom with your AISA account.', ar: 'سجّل الدخول إلى Google Classroom بحساب AISA الخاص بك.' },
      { en: 'Have a text from your next unit ready to paste, or a file in Drive.', ar: 'جهّز نصاً من وحدتك القادمة للصقه، أو ملفاً في Drive.' },
      { en: 'Leave out student names and personal details.', ar: 'لا تُدرج أسماء الطلاب أو بياناتهم الشخصية.' }
    ],
    missions: [
      {
        id: 'relevel',
        anchor: '#relevel',
        title: { en: 'Re-level a text, twice', ar: 'أعِد ضبط مستوى نصّ… مرتين' },
        goal: {
          en: 'Paste a text from your next unit into Re-level text and make two versions at different grades.',
          ar: 'الصق نصاً من وحدتك القادمة في Re-level text واصنع نسختين لصفّين مختلفين.'
        },
        how: [
          { en: 'Classroom › **Gemini** › **Support students** › **Re-level text**.', ar: 'Classroom › **Gemini** › **Support students** › **Re-level text**.' },
          { en: 'Type a **Target grade**, then paste your text (up to 9,000 characters) or click **Upload from Drive**.', ar: 'اكتب الصف المستهدف في **Target grade**، ثم الصق نصّك (حتى 9,000 حرف) أو انقر **Upload from Drive**.' },
          { en: 'Type each subject term under **Keywords to keep in the generated text** and press Enter. Then click **Generate**.', ar: 'اكتب كل مصطلح علمي في **Keywords to keep in the generated text** واضغط Enter، ثم انقر **Generate**.' },
          { en: 'Green highlights show what changed; your keywords are underlined. Read it: the tool\'s grade estimate can differ from other readability scores.', ar: 'التظليل الأخضر يبيّن ما تغيّر، والكلمات المفتاحية مسطّرة. اقرأ النص: تقدير الأداة للصف قد يختلف عن مقاييس المقروئية الأخرى.' },
          { en: 'Export or **Add to class** first, then open the panel arrow, change the grade and click **Regenerate** for version two.', ar: 'صدّر النسخة أو انقر **Add to class** أولاً، ثم افتح سهم اللوحة وغيّر الصف وانقر **Regenerate** للنسخة الثانية.' }
        ],
        imgs: ['img/rl_02_filled.jpg', 'img/rl_03_result.jpg', 'img/rl_06_regenerate.jpg']
      },
      {
        id: 'vocab',
        anchor: '#vocab',
        title: { en: 'Build a vocabulary list', ar: 'أنشئ قائمة مفردات' },
        goal: {
          en: 'Make a vocabulary list for the same topic at the lower grade and export it to Docs.',
          ar: 'أنشئ قائمة مفردات للموضوع نفسه بمستوى الصف الأدنى وصدّرها إلى Docs.'
        },
        how: [
          { en: 'On the Gemini tab: **Instruction material** › **Create a vocabulary list**.', ar: 'في تبويب Gemini: **Instruction material** › **Create a vocabulary list**.' },
          { en: 'Enter a **Target grade** and a specific **Topic**. "Photosynthesis: how plants make their own food" beats "Plants".', ar: 'أدخل **Target grade** و**Topic** محدداً. «البناء الضوئي: كيف تصنع النباتات غذاءها» أفضل من «النباتات».' },
          { en: 'Optional: **Upload from Drive** so the terms come from what you actually teach. Click **Generate**.', ar: 'اختياري: **Upload from Drive** لتأتي المصطلحات مما تدرّسه فعلاً. انقر **Generate**.' },
          { en: 'Check every definition and example, then **Export to Docs** › **View Google Doc**.', ar: 'راجع كل تعريف ومثال، ثم **Export to Docs** › **View Google Doc**.' }
        ],
        imgs: ['img/vl_02_filled.jpg', 'img/vl_04_result.jpg', 'img/vl_06_exported.jpg']
      },
      {
        id: 'translate',
        anchor: '#translate',
        title: { en: 'Translate the instructions', ar: 'ترجِم التعليمات' },
        goal: {
          en: 'Translate the task instructions into a home language spoken in your class.',
          ar: 'ترجم تعليمات المهمة إلى لغة أمّ يتحدثها طلاب في صفّك.'
        },
        how: [
          { en: '**Support students** › **Translate text**.', ar: '**Support students** › **Translate text**.' },
          { en: 'Pick one or more languages: a quick chip, or open **All languages**. Each gets a tick.', ar: 'اختر لغة أو أكثر: من الخيارات السريعة أو من **All languages**. تظهر علامة صح بجانب كل لغة.' },
          { en: 'Paste the text. The source language is detected automatically. Click **Translate**.', ar: 'الصق النص؛ تُكتشف لغة المصدر تلقائياً. انقر **Translate**.' },
          { en: 'Switch between the language buttons to check each version. Ask a fluent speaker to check anything important before it goes home.', ar: 'بدّل بين أزرار اللغات لمراجعة كل نسخة. اطلب من متحدث بطلاقة مراجعة أي نص مهم قبل إرساله إلى البيت.' }
        ],
        imgs: ['img/tr_04_filled.jpg', 'img/tr_05_arabic.jpg', 'img/tr_07_doc.jpg']
      },
      {
        id: 'drafts',
        anchor: '#share',
        title: { en: 'Save it all as drafts', ar: 'احفظ كل شيء كمسودّات' },
        goal: {
          en: 'Use Add to class and save everything as drafts. Nothing goes to students yet.',
          ar: 'استخدم Add to class واحفظ كل شيء كمسودات. لا شيء يصل إلى الطلاب الآن.'
        },
        how: [
          { en: 'Click **Add to class**, choose the **Class** and a **Classwork type**, then **Confirm**. Material = students keep it; Assignment = they hand something in.', ar: 'انقر **Add to class**، واختر **Class** و**Classwork type**، ثم **Confirm**. Material = مادة يحتفظ بها الطلاب؛ Assignment = مهمة يسلّمونها.' },
          { en: 'Add a title and instructions, and choose whether students can view, edit or get their own copy.', ar: 'أضف عنواناً وتعليمات، واختر هل يمكن للطلاب العرض أو التعديل أو الحصول على نسخة خاصة.' },
          { en: 'Under **Assign to**, tick students or open the **Groups** tab › **Create group** to send each version to the right readers.', ar: 'من **Assign to** اختر الطلاب، أو افتح تبويب **Groups** › **Create group** لإرسال كل نسخة إلى القرّاء المناسبين.' },
          { en: 'Click the arrow beside **Assign** › **Save draft**.', ar: 'انقر السهم بجانب **Assign** › **Save draft**.' }
        ],
        imgs: ['img/rl_09_confirm.jpg', 'img/rl_11_groups.jpg', 'img/rl_12_savedraft.jpg']
      }
    ],
    coop: {
      en: 'Show someone at your table what the green highlights and dotted underlines mean in a Re-level result.',
      ar: 'اشرح لزميل على طاولتك معنى التظليل الأخضر والخط المنقّط في نتيجة Re-level text.'
    },
    quiz: [
      {
        q: { en: 'You\'re re-levelling a photosynthesis text for Grade 5. How do you stop Gemini swapping "chlorophyll" for "the green stuff"?', ar: 'تعيد ضبط نص عن البناء الضوئي للصف الخامس. كيف تمنع Gemini من استبدال «الكلوروفيل» بـ«المادة الخضراء»؟' },
        options: [
          { en: 'Type it in ALL CAPS so Gemini knows it\'s important', ar: 'أكتبها بخط عريض جداً حتى يفهم Gemini أنها مهمة' },
          { en: 'Add it under Keywords to keep in the generated text', ar: 'أضيفها في Keywords to keep in the generated text' },
          { en: 'Lower the target grade until it gives up', ar: 'أخفض الصف المستهدف حتى يستسلم' },
          { en: 'Ask nicely. Twice.', ar: 'أطلب بلطف… مرتين.' }
        ],
        answer: 1,
        why: { en: 'Keywords protect the subject vocabulary you\'re assessing. Without them, Gemini may simplify technical terms away.', ar: 'الكلمات المفتاحية تحمي المفردات العلمية التي تقيّمها. من دونها قد يبسّط Gemini المصطلحات حتى تختفي.' }
      },
      {
        q: { en: 'You clicked Add to class. When do students see the re-levelled text?', ar: 'نقرت Add to class. متى يرى الطلاب النص المعدَّل؟' },
        options: [
          { en: 'Immediately. Surprise!', ar: 'فوراً. مفاجأة!' },
          { en: 'Only after you click Assign (or the scheduled time arrives)', ar: 'فقط بعد أن تنقر Assign (أو يحين الموعد المجدول)' },
          { en: 'When Leo approves it', ar: 'عندما يوافق ليو' },
          { en: 'After 24 hours', ar: 'بعد 24 ساعة' }
        ],
        answer: 1,
        why: { en: 'Add to class creates a draft. Nothing reaches students until you click Assign or schedule it.', ar: 'Add to class تُنشئ مسودة. لا يصل شيء إلى الطلاب حتى تنقر Assign أو تجدول النشر.' }
      },
      {
        q: { en: 'You translated a parent note into Arabic. What should happen before it goes home?', ar: 'ترجمت رسالة لأولياء الأمور إلى العربية. ماذا يجب أن يحدث قبل إرسالها؟' },
        options: [
          { en: 'Send it. AI translation is always perfect', ar: 'أرسلها؛ الترجمة الآلية مثالية دائماً' },
          { en: 'Translate it back and forth five times', ar: 'أترجمها ذهاباً وإياباً خمس مرات' },
          { en: 'Ask a fluent speaker to check it', ar: 'أطلب من متحدث بطلاقة مراجعتها' },
          { en: 'Add more emojis', ar: 'أضيف المزيد من الوجوه التعبيرية' }
        ],
        answer: 2,
        why: { en: 'Get a second reader for anything important. Gemini can make mistakes, and families deserve a clear message.', ar: 'اطلب قارئاً ثانياً لأي نص مهم. قد يخطئ Gemini، والأسر تستحق رسالة واضحة.' }
      }
    ],
    badge: {
      name: { en: 'Level-Up Legend', ar: 'أسطورة المستويات' },
      icon: 'levels',
      flavor: { en: 'Made one text work for every reader.', ar: 'جعلت نصاً واحداً يناسب كل قارئ.' }
    },
    done: {
      en: 'Three levels, one lesson, zero students left behind. Now THAT is the mane event.',
      ar: 'ثلاثة مستويات، درس واحد، ولا طالب يتخلّف. هذا هو الحدث الأهم يا بطل!'
    }
  },

  /* ================= STATION 2 ================= */
  {
    id: 'decks',
    station: 2,
    theme: 'studio',
    color: '#E5733A',
    dir: 'Station-2-Lesson-Decks/',
    guide: 'index.html',
    room: { en: 'The Deck Studio', ar: 'استوديو العروض' },
    title: { en: 'Polished Lesson Decks, Fast', ar: 'عروض دروس متقنة… بسرعة' },
    tagline: {
      en: 'Three routes to a Google Slides deck. One fact-checker: you.',
      ar: 'ثلاث طرق للوصول إلى عرض Google Slides، ومدقق حقائق واحد: أنت.'
    },
    time: { en: '~15 min', ar: 'نحو 15 دقيقة' },
    tools: { en: 'Create a presentation · Convert a file · Gemini in Slides', ar: 'Create a presentation · Convert a file · Gemini in Slides' },
    links: [
      { label: { en: 'Gemini in Classroom (Routes 1–2)', ar: 'Gemini في Classroom (الطريقان 1 و2)' }, url: 'https://classroom.google.com/ai' },
      { label: { en: 'New Slides deck (Route 3)', ar: 'عرض Slides جديد (الطريق 3)' }, url: 'https://docs.google.com/presentation/create' }
    ],
    copy: {
      label: { en: 'AISA house rules · paste into any route', ar: 'قواعد AISA · الصقها في أي طريق' },
      text: {
        en: 'Push beyond recall to DOK 2-3. Use examples that suit a school in the UAE. Keep text on each slide short.',
        ar: 'تجاوز مستوى التذكّر إلى المستويين 2 و3 في عمق المعرفة (DOK). استخدم أمثلة تناسب مدرسة في الإمارات. اجعل النص في كل شريحة قصيراً.'
      }
    },
    briefing: [
      {
        en: 'Welcome to the Deck Studio, where slide decks are born and bullet points go to retire.',
        ar: 'أهلاً بك في استوديو العروض، حيث تولد العروض التقديمية وتتقاعد النقاط المكدّسة.'
      },
      {
        en: 'Three routes to a Google Slides deck: from a topic, from a lesson plan you already have, or built right inside Slides.',
        ar: 'ثلاث طرق للوصول إلى عرض Google Slides: من موضوع، أو من خطة درس لديك، أو داخل Slides مباشرة.'
      },
      {
        en: 'The decks look gorgeous. Some of the facts are… creative. Your job is to be the fact-checker, not the applause.',
        ar: 'العروض تبدو رائعة، لكن بعض الحقائق… مبتكرة قليلاً. مهمتك أن تكون مدقق الحقائق، لا الجمهور المصفّق.'
      }
    ],
    kit: [
      { en: 'Sign in to Google Classroom and Google Slides with your AISA account.', ar: 'سجّل الدخول إلى Google Classroom وGoogle Slides بحساب AISA.' },
      { en: 'Pick a lesson you teach in the next two weeks. For Route 2, have its plan or worksheet in Drive.', ar: 'اختر درساً ستقدّمه خلال الأسبوعين القادمين. للطريق 2 جهّز خطته أو ورقة العمل في Drive.' },
      { en: 'Leave out student names and personal details.', ar: 'لا تُدرج أسماء الطلاب أو بياناتهم الشخصية.' }
    ],
    missions: [
      {
        id: 'route',
        anchor: '#choose',
        title: { en: 'Pick your route', ar: 'اختر طريقك' },
        goal: {
          en: 'Choose the route that fits what you have: a topic, a lesson plan, or a blank deck.',
          ar: 'اختر الطريق المناسب لما لديك: موضوع، أو خطة درس، أو عرض فارغ.'
        },
        how: [
          { en: 'Route 1 · I have a topic: Classroom › **Gemini** › **Instruction material** › **Create a presentation** (about 5 min).', ar: 'الطريق 1 · لديّ موضوع: Classroom › **Gemini** › **Instruction material** › **Create a presentation** (نحو 5 دقائق).' },
          { en: 'Route 2 · I have a lesson plan: **Instruction material** › **Convert a file to Google slides** (about 5 min).', ar: 'الطريق 2 · لديّ خطة درس: **Instruction material** › **Convert a file to Google slides** (نحو 5 دقائق).' },
          { en: 'Route 3 · I want to stay in Slides: **Blank presentation** › **Slides** › **Create a presentation** in the Gemini panel (about 8 min).', ar: 'الطريق 3 · أريد البقاء في Slides: **Blank presentation** › **Slides** › **Create a presentation** في لوحة Gemini (نحو 8 دقائق).' }
        ],
        imgs: ['img/cp_01_chip.jpg', 'img/sl_01_start.jpg']
      },
      {
        id: 'generate',
        anchor: '#topic',
        title: { en: 'Add the house rules and generate', ar: 'أضف قواعد AISA ثم أنشئ العرض' },
        goal: {
          en: 'Paste the AISA house rules into your prompt and generate the deck.',
          ar: 'الصق قواعد AISA في طلبك وأنشئ العرض.'
        },
        how: [
          { en: 'Route 1: fill in grade, topic, learning goal and instructional style. Put the slide count and the house rules in **Other requests**, then **Ask Gemini**.', ar: 'الطريق 1: املأ الصف والموضوع وهدف التعلم وأسلوب التدريس. ضع عدد الشرائح والقواعد في **Other requests**، ثم **Ask Gemini**.' },
          { en: 'Route 2: **Upload from Drive**, pick your file, **Add**, describe the goal of the deck, then **Ask Gemini**.', ar: 'الطريق 2: **Upload from Drive**، اختر ملفك، **Add**، صف هدف العرض، ثم **Ask Gemini**.' },
          { en: 'Route 3: start your prompt with "Create a presentation", not "Create a slide". Answer Gemini\'s questions, read the slide plan, then **Approve**.', ar: 'الطريق 3: ابدأ طلبك بـ«Create a presentation» وليس «Create a slide». أجب عن أسئلة Gemini، واقرأ خطة الشرائح، ثم **Approve**.' }
        ],
        imgs: ['img/cp_03_other.jpg', 'img/cf_04_goal.jpg', 'img/sl_06_plan.jpg']
      },
      {
        id: 'export',
        anchor: '#topic',
        title: { en: 'Get it into Google Slides', ar: 'انقله إلى Google Slides' },
        goal: {
          en: 'Get an editable deck into Google Slides.',
          ar: 'احصل على عرض قابل للتعديل في Google Slides.'
        },
        how: [
          { en: 'Routes 1 and 2: flip through the deck in Gemini Canvas and ask for changes in the prompt box (e.g. "Make slide 4 shorter").', ar: 'الطريقان 1 و2: تصفّح العرض في Gemini Canvas واطلب التعديلات في مربع الكتابة (مثل «اجعل الشريحة 4 أقصر»).' },
          { en: 'Then **Export** › **Slides**, and click **Open Slides** when "New slides created" appears.', ar: 'ثم **Export** › **Slides**، وانقر **Open Slides** عند ظهور «New slides created».' },
          { en: 'Route 3: it\'s already in Slides. Wait for "Your slides are ready", then close the panel.', ar: 'الطريق 3: العرض موجود في Slides أصلاً. انتظر «Your slides are ready» ثم أغلق اللوحة.' }
        ],
        imgs: ['img/cp_05_export.jpg', 'img/cp_07_grid.jpg']
      },
      {
        id: 'fix',
        anchor: '#check',
        title: { en: 'Fix three things', ar: 'أصلح ثلاثة أشياء' },
        goal: {
          en: 'Fix at least three things: a fact, a slide that\'s too wordy, and something missing.',
          ar: 'أصلح ثلاثة أشياء على الأقل: معلومة، وشريحة مزدحمة بالكلام، وشيئاً ناقصاً.'
        },
        how: [
          { en: 'Replace made-up numbers with real, sourced ones. Check quotes are real and correctly attributed.', ar: 'استبدل الأرقام المختلقة بأرقام حقيقية موثّقة، وتحقق من صحة الاقتباسات ونسبتها.' },
          { en: 'Trim any slide that can\'t be read from the back of the room.', ar: 'اختصر أي شريحة لا يمكن قراءتها من آخر الصف.' },
          { en: 'Add anything students need that isn\'t there, such as the text they\'re asked to annotate.', ar: 'أضف ما يحتاجه الطلاب وغير موجود، مثل النص المطلوب منهم التعليق عليه.' },
          { en: 'Make sure at least one task asks students to analyse or evaluate, not just recall.', ar: 'تأكد من وجود مهمة واحدة على الأقل تطلب التحليل أو التقييم، لا التذكّر فقط.' }
        ],
        imgs: ['img/cp_08_check.jpg', 'img/sl_08_grid.jpg']
      }
    ],
    coop: {
      en: 'Compare decks with someone who chose a different route. Which deck asks students to think harder?',
      ar: 'قارن عرضك بعرض زميل اختار طريقاً مختلفاً. أيّ العرضين يدفع الطلاب إلى تفكير أعمق؟'
    },
    quiz: [
      {
        q: { en: 'Your shiny new deck says "Recycling reduces our campus waste by 40% annually." What now?', ar: 'عرضك الجديد اللامع يقول: «إعادة التدوير تقلّل نفايات الحرم المدرسي بنسبة 40% سنوياً». ماذا تفعل؟' },
        options: [
          { en: 'Bold it. Facts look truer in bold', ar: 'أجعلها بخط عريض؛ الحقائق تبدو أصدق هكذا' },
          { en: 'Check it, then replace it with a real, sourced number or cut it', ar: 'أتحقق منها، ثم أستبدلها برقم حقيقي موثّق أو أحذفها' },
          { en: 'Round it up to 50% for impact', ar: 'أقرّبها إلى 50% لتكون أكثر تأثيراً' },
          { en: 'Leave it. Gemini sounded very confident', ar: 'أتركها؛ Gemini بدا واثقاً جداً' }
        ],
        answer: 1,
        why: { en: 'In the demo deck, that number was invented. On a slide that teaches students to judge evidence, that\'s a real problem.', ar: 'في العرض التجريبي كان هذا الرقم مختلقاً. وفي شريحة تعلّم الطلاب تقييم الأدلة، هذه مشكلة حقيقية.' }
      },
      {
        q: { en: 'Building inside Slides (Route 3), how should your prompt start?', ar: 'عند الإنشاء داخل Slides (الطريق 3)، بماذا يجب أن يبدأ طلبك؟' },
        options: [
          { en: '"Create a slide"', ar: '«Create a slide»' },
          { en: '"Create a presentation"', ar: '«Create a presentation»' },
          { en: '"Dear Gemini,"', ar: '«عزيزي Gemini،»' },
          { en: '"Make it pop"', ar: '«اجعله مبهراً»' }
        ],
        answer: 1,
        why: { en: '"Create a presentation" makes Gemini agree a slide-by-slide plan with you, then build the whole deck. "Create a slide" makes just one.', ar: '«Create a presentation» تجعل Gemini يتفق معك على خطة الشرائح ثم يبني العرض كاملاً. أما «Create a slide» فتصنع شريحة واحدة.' }
      },
      {
        q: { en: 'You already have a lesson plan in Drive. Which route keeps your own content?', ar: 'لديك خطة درس في Drive. أيّ طريق يحافظ على محتواك؟' },
        options: [
          { en: 'Route 1 · From a topic', ar: 'الطريق 1 · من موضوع' },
          { en: 'Route 2 · Convert a file to Google slides', ar: 'الطريق 2 · Convert a file to Google slides' },
          { en: 'Route 3 · Inside Slides', ar: 'الطريق 3 · داخل Slides' },
          { en: 'Retype the whole thing by hand', ar: 'أعيد كتابة كل شيء يدوياً' }
        ],
        answer: 1,
        why: { en: 'Route 2 turns your Doc or PDF into slides that follow your lesson stage by stage.', ar: 'الطريق 2 يحوّل ملف Doc أو PDF إلى شرائح تتبع مراحل درسك بالترتيب.' }
      }
    ],
    badge: {
      name: { en: 'Deck Wizard', ar: 'ساحر العروض' },
      icon: 'slides',
      flavor: { en: 'Built a deck and fact-checked it like a pro.', ar: 'بنيت عرضاً ودققت حقائقه كالمحترفين.' }
    },
    done: {
      en: 'That deck is so polished I can see my mane in it.',
      ar: 'هذا العرض لامع لدرجة أنني أرى لبدتي فيه!'
    }
  },

  /* ================= STATION 3 ================= */
  {
    id: 'engagement',
    station: 3,
    theme: 'arena',
    color: '#D1477A',
    dir: 'Station-3-Engagement/',
    guide: 'index.html',
    room: { en: 'The Hook Arena', ar: 'ساحة التشويق' },
    title: { en: 'Engagement & Active Participation', ar: 'التفاعل والمشاركة النشطة' },
    tagline: {
      en: 'Catch them in the first five minutes, then let them choose.',
      ar: 'اجذبهم في الدقائق الخمس الأولى، ثم دعهم يختارون.'
    },
    time: { en: '~10 min', ar: 'نحو 10 دقائق' },
    tools: { en: 'Craft a compelling hook · Build a choice board', ar: 'Craft a compelling hook · Build a choice board' },
    links: [
      { label: { en: 'Gemini in Classroom', ar: 'Gemini في Classroom' }, url: 'https://classroom.google.com/ai' },
      { label: { en: 'Hook', ar: 'افتتاحية مشوّقة' }, url: 'https://classroom.google.com/ai/hg' },
      { label: { en: 'Choice board', ar: 'لوحة الخيارات' }, url: 'https://classroom.google.com/ai/chb' }
    ],
    briefing: [
      {
        en: 'Welcome to the Hook Arena! Today we hunt for the perfect lesson opener. No actual fishing. I checked.',
        ar: 'أهلاً بك في ساحة التشويق! اليوم نصطاد افتتاحية الدرس المثالية. لا صيد سمك حقيقياً… لقد تأكدت.'
      },
      {
        en: '**Craft a compelling hook** gives you six ready-to-run openers. **Build a choice board** gives six activities that all hit the same objectives.',
        ar: '**Craft a compelling hook** تمنحك ست افتتاحيات جاهزة. و**Build a choice board** تمنحك ستة أنشطة تحقق كلها الأهداف نفسها.'
      },
      {
        en: 'Hooks are first drafts. In our demo, Gemini\'s water molecules didn\'t balance. Chemistry: 0. Lions: 1.',
        ar: 'الافتتاحيات مسودات أولى. في التجربة لم تكن جزيئات الماء عند Gemini متوازنة. الكيمياء: 0، الأسود: 1.'
      }
    ],
    kit: [
      { en: 'Sign in to Google Classroom with your AISA account.', ar: 'سجّل الدخول إلى Google Classroom بحساب AISA.' },
      { en: 'Pick a lesson you teach in the next two weeks. Have the topic, grade and any unit Doc or slides in Drive.', ar: 'اختر درساً ستدرّسه خلال الأسبوعين القادمين. جهّز الموضوع والصف وأي ملف أو شرائح للوحدة في Drive.' },
      { en: 'Describe your class in general terms ("mixed-ability, several EAL students"), never by name.', ar: 'صف صفّك بعبارات عامة («قدرات متنوعة، عدة طلاب يتعلمون الإنجليزية لغةً إضافية»)، ولا تذكر أسماء أبداً.' }
    ],
    missions: [
      {
        id: 'hooks',
        anchor: '#hook',
        title: { en: 'Generate six hooks', ar: 'أنشئ ست افتتاحيات' },
        goal: {
          en: 'Generate hooks for a lesson you teach next week, adding a strategy you already use as a custom engagement type.',
          ar: 'أنشئ افتتاحيات لدرس الأسبوع القادم، وأضف استراتيجية تستخدمها أصلاً كنوع تفاعل مخصّص.'
        },
        how: [
          { en: 'Classroom › **Gemini** › **Planning** › **Craft a compelling hook**.', ar: 'Classroom › **Gemini** › **Planning** › **Craft a compelling hook**.' },
          { en: 'Type the **Target grade**, then **Describe your lesson and class**: what students will learn and who\'s in the room.', ar: 'اكتب **Target grade**، ثم **Describe your lesson and class**: ما سيتعلمه الطلاب ومن في الصف.' },
          { en: 'Click one or more styles under **How do you want to engage your students?**', ar: 'اختر أسلوباً أو أكثر من **How do you want to engage your students?**' },
          { en: 'Click **Write custom engagement type** and add a strategy you use (Think-Pair-Share, Four Corners, Cold Call). Then **Generate**.', ar: 'انقر **Write custom engagement type** وأضف استراتيجية تستخدمها (فكّر-زاوج-شارك، الزوايا الأربع، السؤال المفاجئ). ثم **Generate**.' }
        ],
        imgs: ['img/hk_02_filled.jpg', 'img/hk_03_custom.jpg', 'img/hk_04_result.jpg']
      },
      {
        id: 'checkhook',
        anchor: '#hook',
        title: { en: 'Check one hook and use it', ar: 'راجع افتتاحية واحدة واستخدمها' },
        goal: {
          en: 'Pick one hook, check it, and paste it onto your first slide.',
          ar: 'اختر افتتاحية، وراجعها، والصقها في شريحتك الأولى.'
        },
        how: [
          { en: 'Check every fact, number and quantity.', ar: 'تحقق من كل معلومة ورقم وكمية.' },
          { en: 'Check the materials are safe and available in your room.', ar: 'تأكد أن المواد آمنة ومتوفرة في صفّك.' },
          { en: 'Check the timing: a hook takes about five minutes, not twenty.', ar: 'راجع التوقيت: الافتتاحية تستغرق نحو خمس دقائق، لا عشرين.' },
          { en: 'Use the copy icon on the card, or **Export to Docs** › **View Google Doc**.', ar: 'استخدم أيقونة النسخ على البطاقة، أو **Export to Docs** › **View Google Doc**.' }
        ],
        imgs: ['img/hk_05_check.jpg', 'img/hk_07_export.jpg']
      },
      {
        id: 'board',
        anchor: '#choice',
        title: { en: 'Build a choice board', ar: 'ابنِ لوحة خيارات' },
        goal: {
          en: 'Build a choice board for the same topic. Rewrite the objectives before you generate.',
          ar: 'ابنِ لوحة خيارات للموضوع نفسه، وأعد صياغة الأهداف قبل الإنشاء.'
        },
        how: [
          { en: '**Instruction material** › **Build a choice board**.', ar: '**Instruction material** › **Build a choice board**.' },
          { en: 'Enter **Target grade** and **Topic**. Optionally **Upload from Drive**. Click **Generate learning objectives**.', ar: 'أدخل **Target grade** و**Topic**، واختيارياً **Upload from Drive**. انقر **Generate learning objectives**.' },
          { en: 'Rewrite the **Suggested learning objectives** in your own words, or paste them from your unit plan. Then **Generate**.', ar: 'أعد صياغة **Suggested learning objectives** بكلماتك، أو الصقها من خطة الوحدة. ثم **Generate**.' }
        ],
        imgs: ['img/cb_02_form.jpg', 'img/cb_03_objectives.jpg', 'img/cb_04_board.jpg']
      },
      {
        id: 'doable',
        anchor: '#choice',
        title: { en: 'Make it doable, then draft it', ar: 'اجعلها قابلة للتنفيذ ثم احفظها مسودة' },
        goal: {
          en: 'Cut any activity you can\'t resource, then use Add to class to save it as a draft.',
          ar: 'احذف أي نشاط لا تتوفر موارده، ثم استخدم Add to class لحفظ اللوحة كمسودة.'
        },
        how: [
          { en: 'Read **Approx time** and **Materials needed** on each card. Swap anything you can\'t resource (Alka-Seltzer, Play-Doh…).', ar: 'اقرأ **Approx time** و**Materials needed** في كل بطاقة. استبدل ما لا تتوفر موارده.' },
          { en: 'Make the times roughly equal so no choice is the "easy" one.', ar: 'اجعل الأوقات متقاربة حتى لا يكون أحد الخيارات هو «السهل».' },
          { en: 'Check the science (one demo card had carbon atoms in a reaction that makes water).', ar: 'راجع المحتوى العلمي (إحدى بطاقات التجربة ذكرت ذرات كربون في تفاعل ينتج الماء).' },
          { en: '**Add to class** › choose the class › **Assignment** › **Confirm**. It stays a draft until you click **Assign**.', ar: '**Add to class** › اختر الصف › **Assignment** › **Confirm**. يبقى مسودة حتى تنقر **Assign**.' }
        ],
        imgs: ['img/cb_05_detail.jpg', 'img/cb_09_confirm.jpg']
      }
    ],
    coop: {
      en: 'Swap hooks with your table. Try to spot the mistake in someone else\'s before they spot yours.',
      ar: 'تبادل الافتتاحيات مع طاولتك، وحاول اكتشاف الخطأ في افتتاحية زميلك قبل أن يكتشف خطأك.'
    },
    quiz: [
      {
        q: { en: 'A hook says: "Use 6 red oxygen notes and 4 blue hydrogen notes to build water molecules." What\'s wrong?', ar: 'افتتاحية تقول: «استخدم 6 بطاقات حمراء للأكسجين و4 زرقاء للهيدروجين لبناء جزيئات ماء». ما الخطأ؟' },
        options: [
          { en: 'Nothing. Chemistry is flexible', ar: 'لا شيء؛ الكيمياء مرنة' },
          { en: 'It doesn\'t balance: H₂O needs two hydrogen for every oxygen', ar: 'غير متوازنة: H₂O تحتاج ذرتي هيدروجين لكل ذرة أكسجين' },
          { en: 'The notes should be green', ar: 'يجب أن تكون البطاقات خضراء' },
          { en: 'Hooks shouldn\'t use paper', ar: 'الافتتاحيات لا تستخدم الورق' }
        ],
        answer: 1,
        why: { en: 'Six oxygen would need twelve hydrogen. The demo numbers taught the exact misconception the lesson was meant to fix.', ar: 'ست ذرات أكسجين تحتاج اثنتي عشرة ذرة هيدروجين. أرقام التجربة رسّخت الخطأ نفسه الذي جاء الدرس لتصحيحه.' }
      },
      {
        q: { en: 'Gemini suggests learning objectives for your choice board. What do you do before clicking Generate?', ar: 'يقترح Gemini أهداف تعلم للوحة الخيارات. ماذا تفعل قبل النقر على Generate؟' },
        options: [
          { en: 'Accept them. They sound very official', ar: 'أقبلها؛ تبدو رسمية جداً' },
          { en: 'Rewrite them in my own words, or paste in my unit objectives', ar: 'أعيد صياغتها بكلماتي، أو ألصق أهداف وحدتي' },
          { en: 'Delete them all and hope for the best', ar: 'أحذفها كلها وأتمنى الأفضل' },
          { en: 'Add more adjectives', ar: 'أضيف المزيد من الصفات' }
        ],
        answer: 1,
        why: { en: 'All six activities are built to hit those objectives, so make sure they\'re really yours.', ar: 'الأنشطة الستة كلها مبنية لتحقيق هذه الأهداف، فتأكد أنها أهدافك فعلاً.' }
      },
      {
        q: { en: 'Your choice board activities run from 15 to 60 minutes. Why does that matter?', ar: 'تتراوح أنشطة لوحة الخيارات بين 15 و60 دقيقة. لماذا يهم ذلك؟' },
        options: [
          { en: 'It doesn\'t. Students love surprises', ar: 'لا يهم؛ الطلاب يحبون المفاجآت' },
          { en: 'The short one becomes the "easy" choice, so make times roughly equal', ar: 'النشاط القصير يصبح الخيار «السهل»، لذا أجعل الأوقات متقاربة' },
          { en: 'Longer is always better', ar: 'الأطول أفضل دائماً' },
          { en: 'Only the teacher should choose anyway', ar: 'المعلم وحده يجب أن يختار على أي حال' }
        ],
        answer: 1,
        why: { en: 'Balance time and challenge across the board so every choice is a real choice.', ar: 'وازن الوقت والتحدي في اللوحة كلها حتى يكون كل خيار خياراً حقيقياً.' }
      }
    ],
    badge: {
      name: { en: 'Hook Master', ar: 'سيّد الافتتاحيات' },
      icon: 'hook',
      flavor: { en: 'Hooked a whole class in five minutes flat.', ar: 'شددت انتباه صفّ كامل في خمس دقائق.' }
    },
    done: {
      en: 'Hooks? Got \'em. Choices? Got \'em. Your students won\'t know what hit them. (It was engagement. Engagement hit them.)',
      ar: 'افتتاحيات؟ جاهزة. خيارات؟ جاهزة. لن يعرف طلابك ما الذي أصابهم… (إنه التفاعل، التفاعل أصابهم!)'
    }
  },

  /* ================= STATION 4 ================= */
  {
    id: 'video',
    station: 4,
    theme: 'cinema',
    color: '#2F6FD6',
    dir: 'Station-4-Lesson-Video/',
    guide: 'index.html',
    room: { en: 'The Screening Room', ar: 'قاعة العرض' },
    title: { en: 'Turn Your Slides into a Video', ar: 'حوّل شرائحك إلى فيديو' },
    tagline: {
      en: 'Your deck, narrated, scored and ready to watch in Google Vids.',
      ar: 'عرضك التقديمي بصوت راوٍ وموسيقى، جاهز للمشاهدة في Google Vids.'
    },
    time: { en: '~15 min', ar: 'نحو 15 دقيقة' },
    tools: { en: 'Slides › Transform › Turn into video · Google Vids', ar: 'Slides › Transform › Turn into video · Google Vids' },
    links: [
      { label: { en: 'Google Slides', ar: 'Google Slides' }, url: 'https://docs.google.com/presentation/u/0/' },
      { label: { en: 'Google Vids', ar: 'Google Vids' }, url: 'https://docs.google.com/videos/u/0/' }
    ],
    briefing: [
      {
        en: 'Lights, camera, Leo! Welcome to the Screening Room, where your slide deck becomes a narrated video in Google Vids.',
        ar: 'أضواء، كاميرا، ليو! أهلاً بك في قاعة العرض، حيث يتحول عرضك التقديمي إلى فيديو مع راوٍ في Google Vids.'
      },
      {
        en: 'One button, **Transform** › **Turn into video**, writes a script and adds a voice, music and animation. Then you make it sound like you.',
        ar: 'زرّ واحد، **Transform** › **Turn into video**، يكتب نصاً ويضيف صوتاً وموسيقى وحركة. ثم تجعله يبدو بصوتك وأسلوبك.'
      },
      {
        en: 'Bring headphones. Forty laptops narrating at once sounds like a very confused choir.',
        ar: 'أحضر سماعات؛ فأربعون حاسوباً تتحدث في الوقت نفسه تبدو كجوقة مرتبكة جداً.'
      }
    ],
    kit: [
      { en: 'Open a Google Slides deck you\'ve already checked (your Station 2 deck works). A video is only as accurate as its slides.', ar: 'افتح عرض Google Slides راجعته مسبقاً (عرض المحطة 2 مناسب). دقة الفيديو من دقة شرائحه.' },
      { en: 'Bring headphones so you can hear the voiceover at your desk.', ar: 'أحضر سماعات لتسمع التعليق الصوتي في مكانك.' },
      { en: 'Keep student names, photos and voices out of the deck and the script.', ar: 'لا تضع أسماء الطلاب أو صورهم أو أصواتهم في العرض أو النص.' }
    ],
    missions: [
      {
        id: 'transform',
        anchor: '#make',
        title: { en: 'Transform your deck', ar: 'حوّل عرضك' },
        goal: {
          en: 'Turn a checked deck into a video, keeping 4 to 6 slides.',
          ar: 'حوّل عرضاً راجعته إلى فيديو، مع الإبقاء على 4 إلى 6 شرائح.'
        },
        how: [
          { en: 'In Slides, click **Transform** at the bottom of the right-hand menu, then **Turn into video**. Google Vids opens.', ar: 'في Slides انقر **Transform** أسفل القائمة اليمنى، ثم **Turn into video**. يُفتح Google Vids.' },
          { en: 'Untick slides you don\'t want (image credits, long activity slides). Keep 4 to 6.', ar: 'ألغِ تحديد الشرائح غير المطلوبة (مصادر الصور، شرائح الأنشطة الطويلة). أبقِ 4 إلى 6.' },
          { en: 'Leave **Include AI voiceover, script, background music and animation** on, then click **Next**.', ar: 'أبقِ **Include AI voiceover, script, background music and animation** مفعّلاً، ثم انقر **Next**.' }
        ],
        imgs: ['img/v_01_transform.jpg', 'img/v_02b_untick.jpg']
      },
      {
        id: 'script',
        anchor: '#make',
        title: { en: 'Make the script sound like you', ar: 'اجعل النص بصوتك أنت' },
        goal: {
          en: 'Rewrite the first slide\'s script so it sounds like you talking to your class.',
          ar: 'أعد كتابة نص الشريحة الأولى ليبدو كأنك تتحدث إلى صفّك.'
        },
        how: [
          { en: 'On the script screen, click into a box and type over it. This is the easiest place to fix things, before any audio is made.', ar: 'في شاشة النص، انقر داخل المربع واكتب فوقه. هذا أسهل مكان للتعديل، قبل إنشاء أي صوت.' },
          { en: 'Under **Narration**, choose **Voiceover only** or **AI avatar and voiceover**, then **Create the draft video**.', ar: 'من **Narration** اختر **Voiceover only** أو **AI avatar and voiceover**، ثم **Create the draft video**.' },
          { en: 'Already built? Click the scene\'s voiceover clip › **AI voiceover**, edit the script, then **Update voiceover** › **Replace**.', ar: 'أنشأته بالفعل؟ انقر مقطع التعليق الصوتي للمشهد › **AI voiceover**، عدّل النص، ثم **Update voiceover** › **Replace**.' }
        ],
        imgs: ['img/v_03_script.jpg', 'img/v_04b_narration.jpg', 'img/e_02b_new.jpg']
      },
      {
        id: 'voice',
        anchor: '#voice',
        title: { en: 'New voice or new language', ar: 'صوت جديد أو لغة جديدة' },
        goal: {
          en: 'Give one slide a different voice, or switch one slide into a language your students speak at home.',
          ar: 'امنح شريحة واحدة صوتاً مختلفاً، أو حوّلها إلى لغة يتحدثها طلابك في البيت.'
        },
        how: [
          { en: 'In **AI voiceover**, click **Change** under Voiceover. Preview voices, pick one, click **Select**. With **Current scene** selected it applies to that slide only. Then click **Update voiceover** › **Replace** so the new voice is used.', ar: 'في **AI voiceover** انقر **Change** تحت Voiceover. استمع إلى الأصوات، اختر واحداً، ثم **Select**. مع تحديد **Current scene** يُطبَّق على هذه الشريحة فقط. ثم انقر **Update voiceover** › **Replace** ليُستخدم الصوت الجديد.' },
          { en: 'For Arabic: translate the script (Translate text from Station 1 works), paste it over the English, then **Update voiceover** › **Replace**. The voice speaks whatever language the script is in.', ar: 'للعربية: ترجم النص (أداة Translate text من المحطة 1 مناسبة)، والصقه مكان الإنجليزي، ثم **Update voiceover** › **Replace**. الصوت يتحدث بلغة النص المكتوب.' },
          { en: 'Have a fluent speaker check any non-English scene before students or families hear it.', ar: 'اطلب من متحدث بطلاقة مراجعة أي مشهد بغير الإنجليزية قبل أن يسمعه الطلاب أو الأسر.' }
        ],
        imgs: ['img/e_03c_pick.jpg', 'img/e_05c_arabic.jpg']
      },
      {
        id: 'music',
        anchor: '#music',
        title: { en: 'Fix the music, then watch it all', ar: 'اضبط الموسيقى ثم شاهده كاملاً' },
        goal: {
          en: 'Set the music to Background ducking at about 30% volume, then watch it all the way through with headphones.',
          ar: 'اضبط الخفض التلقائي للموسيقى على Background ومستوى صوتها على 30% تقريباً، ثم شاهد الفيديو كاملاً بالسماعات.'
        },
        how: [
          { en: 'Click the long music bar at the bottom of the timeline, then the speaker icon. Set **Volume** to about 30%.', ar: 'انقر شريط الموسيقى الطويل أسفل الخط الزمني، ثم أيقونة السماعة. اضبط **Volume** على 30% تقريباً.' },
          { en: 'Under **Automatic ducking**, choose **Background** so the music dips whenever the voice speaks.', ar: 'من **Automatic ducking** اختر **Background** لتنخفض الموسيقى كلما تحدث الصوت.' },
          { en: 'Click **Play** and watch to the end. Share it from Drive or Classroom, or **File** › **Download** › **MP4 video**.', ar: 'انقر **Play** وشاهد حتى النهاية. شاركه عبر Drive أو Classroom، أو **File** › **Download** › **MP4 video**.' }
        ],
        imgs: ['img/m_01c_30.jpg', 'img/m_02_duck.jpg', 'img/s_01b_download.jpg']
      }
    ],
    coop: {
      en: 'Play your video for a neighbour (one earbud each). Ask them: does it sound like you?',
      ar: 'شغّل الفيديو لزميلك (سماعة لكل منكما) واسأله: هل يبدو بصوتي وأسلوبي؟'
    },
    quiz: [
      {
        q: { en: 'Where\'s the easiest place to fix Gemini\'s script?', ar: 'ما أسهل مكان لتعديل النص الذي كتبه Gemini؟' },
        options: [
          { en: 'After publishing, in the comments', ar: 'بعد النشر، في التعليقات' },
          { en: 'On the script screen, before the draft video is made', ar: 'في شاشة النص، قبل إنشاء مسودة الفيديو' },
          { en: 'By talking louder than the narrator', ar: 'بالتحدث بصوت أعلى من الراوي' },
          { en: 'In a separate Google Doc', ar: 'في ملف Google Doc منفصل' }
        ],
        answer: 1,
        why: { en: 'Fixing the script before any audio exists is quickest. You can still edit scenes later in the AI voiceover panel.', ar: 'تعديل النص قبل إنشاء الصوت هو الأسرع، ويمكنك تعديل المشاهد لاحقاً من لوحة AI voiceover.' }
      },
      {
        q: { en: 'The music is drowning out the narrator. What\'s the fix?', ar: 'الموسيقى تغطي على صوت الراوي. ما الحل؟' },
        options: [
          { en: 'Speed up the voice', ar: 'أسرّع الصوت' },
          { en: 'Set Automatic ducking to Background and the volume to about 30%', ar: 'أضبط Automatic ducking على Background ومستوى الصوت على 30% تقريباً' },
          { en: 'Delete the narrator', ar: 'أحذف الراوي' },
          { en: 'Ask students to listen harder', ar: 'أطلب من الطلاب الإنصات أكثر' }
        ],
        answer: 1,
        why: { en: 'Ducking dips the music while the voice speaks. Music you add yourself may not have it set, so check every time.', ar: 'الخفض التلقائي يخفّض الموسيقى أثناء الكلام. الموسيقى التي تضيفها بنفسك قد لا يكون مفعّلاً فيها، فتحقق دائماً.' }
      },
      {
        q: { en: 'How do you switch one scene into Arabic?', ar: 'كيف تحوّل مشهداً واحداً إلى العربية؟' },
        options: [
          { en: 'Change the laptop\'s language', ar: 'أغيّر لغة الحاسوب' },
          { en: 'Paste an Arabic script into that scene, then Update voiceover › Replace', ar: 'ألصق نصاً عربياً في ذلك المشهد، ثم Update voiceover › Replace' },
          { en: 'Pick a voice with an Arabic-sounding name', ar: 'أختار صوتاً اسمه عربي' },
          { en: 'It can\'t be done', ar: 'لا يمكن ذلك' }
        ],
        answer: 1,
        why: { en: 'The voice speaks whatever language the script is written in. Get a fluent speaker to check it.', ar: 'الصوت يتحدث بلغة النص المكتوب. اطلب من متحدث بطلاقة مراجعته.' }
      }
    ],
    badge: {
      name: { en: 'Director\'s Cut', ar: 'لمسة المخرج' },
      icon: 'clapper',
      flavor: { en: 'Turned slides into a video that sounds like you.', ar: 'حوّلت الشرائح إلى فيديو يحمل صوتك وأسلوبك.' }
    },
    done: {
      en: 'And the award for Best Picture goes to… you! Please keep your speech under two minutes.',
      ar: 'وجائزة أفضل فيلم تذهب… إليك أنت! رجاءً اجعل كلمتك أقل من دقيقتين.'
    }
  },

  /* ================= STATION 5 ================= */
  {
    id: 'coding',
    station: 5,
    theme: 'lab',
    color: '#7B4FD6',
    dir: 'Station-5-Coding-Activities/',
    guide: 'index.html',
    room: { en: 'The Code Arcade', ar: 'صالة البرمجة' },
    title: { en: 'Code Your Own Class Activities', ar: 'برمج أنشطة صفّك بنفسك' },
    tagline: {
      en: 'Build a game without writing code, then share it with a QR code.',
      ar: 'اصنع لعبة من دون كتابة سطر برمجي، وشاركها برمز QR.'
    },
    time: { en: '~20 min', ar: 'نحو 20 دقيقة' },
    tools: { en: 'Gemini Canvas · AISA Activity Hub', ar: 'منصة أنشطة AISA\u200F · Gemini Canvas' },
    links: [
      { label: { en: 'Gemini', ar: 'Gemini' }, url: 'https://gemini.google.com/app' },
      { label: { en: 'AISA EduSim Gem', ar: 'AISA EduSim Gem' }, url: 'https://gemini.google.com/gem/11QD4AkTJjpXVgEGw8SJ74nq99ntDfv8V?usp=sharing' },
      { label: { en: 'Activity Hub: Create', ar: 'منصة الأنشطة: إنشاء' }, url: 'https://aisa-ai-web.github.io/code-uploader/index.html' },
      { label: { en: 'Activity Hub: Library', ar: 'منصة الأنشطة: المكتبة' }, url: 'https://aisa-ai-web.github.io/code-uploader/library.html' }
    ],
    copy: {
      label: { en: 'Prompt recipe · change the words in [brackets]', ar: 'وصفة الطلب · غيّر الكلمات بين [القوسين]' },
      text: {
        en: 'Make a single self-contained HTML file: a [sorting game / quiz / matching game / flashcards] for Grade [X] [subject] called "[title]". [Say what students do, one step at a time.] After each answer, explain in one sentence why. Show a score and a Play again button at the end. Clear, simple English for EAL learners, big buttons that work on a laptop, iPad or phone, no external images or links.',
        ar: 'اصنع ملف HTML واحداً مستقلاً بذاته (a single self-contained HTML file): [لعبة تصنيف / اختبار / لعبة مطابقة / بطاقات تعليمية] للصف [X] في مادة [المادة] بعنوان «[العنوان]». [اشرح ما يفعله الطلاب خطوة بخطوة.] بعد كل إجابة، اشرح السبب في جملة واحدة. اعرض النتيجة وزر «العب مرة أخرى» في النهاية. استخدم [لغة إنجليزية واضحة وبسيطة تناسب متعلمي الإنجليزية لغةً إضافية / لغة عربية فصحى واضحة وبسيطة مع واجهة من اليمين إلى اليسار (RTL)]، مع أزرار كبيرة تعمل على الحاسوب المحمول والآيباد والهاتف، ومن دون صور أو روابط خارجية.'
      }
    },
    briefing: [
      {
        en: 'Welcome to the Code Arcade! You\'re about to build a game without writing a line of code. I\'m a lion, and even I\'m impressed.',
        ar: 'أهلاً بك في صالة البرمجة! ستصنع لعبة من دون كتابة سطر برمجي واحد. أنا أسد، وحتى أنا منبهر.'
      },
      {
        en: '**Gemini Canvas** writes the code. The **AISA Activity Hub** turns it into a link, a QR code and a Google Classroom button.',
        ar: '**Gemini Canvas** يكتب الشيفرة، و**منصة أنشطة AISA** تحوّلها إلى رابط ورمز QR وزر Google Classroom.'
      },
      {
        en: 'Fun fact: I\'m a Leo, and today you\'re working with a Gemini. Astrologically, this is an excellent match.',
        ar: 'معلومة طريفة: أنا من برج الأسد، واليوم تعمل مع Gemini (الجوزاء). فلكياً، هذا توافق ممتاز!'
      }
    ],
    kit: [
      { en: 'Open Gemini with your AISA account, and the AISA Activity Hub in a second tab.', ar: 'افتح Gemini بحساب AISA، ومنصة أنشطة AISA في تبويب ثانٍ.' },
      { en: 'Pick one skill students need to practise soon. Games that sort, match or quiz work best.', ar: 'اختر مهارة يحتاج طلابك إلى التدرب عليها قريباً. ألعاب التصنيف والمطابقة والاختبارات هي الأنجح.' },
      { en: 'No student names or personal details: anyone with the link can open what you publish.', ar: 'لا أسماء طلاب ولا بيانات شخصية: أي شخص لديه الرابط يمكنه فتح ما تنشره.' }
    ],
    missions: [
      {
        id: 'canvas',
        anchor: '#build',
        title: { en: 'Build it in Canvas', ar: 'ابنِها في Canvas' },
        goal: {
          en: 'Use the prompt recipe or the EduSim Gem to build an activity for a lesson you\'re teaching soon.',
          ar: 'استخدم وصفة الطلب أو EduSim Gem لبناء نشاط لدرس قريب.'
        },
        how: [
          { en: 'In Gemini, click **+** › **More tools** › **Canvas**. A Canvas chip appears in the chat box. No Canvas? Widen the browser window, or end your prompt with "Build it in Canvas".', ar: 'في Gemini انقر **+** › **More tools** › **Canvas**. تظهر شارة Canvas في مربع الكتابة. لا ترى Canvas؟ وسّع نافذة المتصفح، أو اختم طلبك بعبارة «Build it in Canvas».' },
          { en: 'Paste the prompt recipe, change the words in [brackets], and send. Not sure where to start? Use the AISA EduSim Gem instead.', ar: 'الصق وصفة الطلب، وغيّر ما بين [القوسين]، ثم أرسل. لا تعرف من أين تبدأ؟ استخدم AISA EduSim Gem.' },
          { en: 'Play it like a student in **Preview**. Get some wrong on purpose. Ask for changes in plain language ("Make the buttons bigger").', ar: 'العبها كطالب في **Preview**، وأخطئ عمداً في بعض الإجابات. اطلب التعديلات بلغة بسيطة («اجعل الأزرار أكبر»).' },
          { en: 'Seeing "Something went wrong" or "Pro is in high demand"? Send: Please try again and build it in Canvas.', ar: 'ظهرت «Something went wrong» أو «Pro is in high demand»؟ أرسل: Please try again and build it in Canvas.' }
        ],
        imgs: ['img/c_01_tools.jpg', 'img/c_02_prompt.jpg', 'img/c_04_play.jpg']
      },
      {
        id: 'copy',
        anchor: '#copy',
        title: { en: 'Copy the code', ar: 'انسخ الشيفرة' },
        goal: {
          en: 'Copy the whole file with Option A. If nothing pastes, use Option B.',
          ar: 'انسخ الملف كاملاً بالخيار A، وإن لم يُلصق شيء فاستخدم الخيار B.'
        },
        how: [
          { en: 'Option A: the share icon in the Canvas toolbar › **Copy contents**. Look for "Copied to clipboard". Don\'t click **Share**: it makes a public Gemini link straight away.', ar: 'الخيار A: أيقونة المشاركة في شريط Canvas › **Copy contents**. ابحث عن «Copied to clipboard». لا تنقر **Share**: فهو ينشئ رابط Gemini عاماً فوراً.' },
          { en: 'Option B: click **Code**, click inside the code, press ⌘A then ⌘C (Ctrl+A, Ctrl+C on Windows).', ar: 'الخيار B: انقر **Code**، ثم داخل الشيفرة، واضغط \u200E⌘A ثم \u200E⌘C (أو Ctrl+A ثم Ctrl+C في Windows).' }
        ],
        imgs: ['img/k_02_share.jpg', 'img/k_04_selected.jpg']
      },
      {
        id: 'publish',
        anchor: '#publish',
        title: { en: 'Paste, fix the details, publish', ar: 'الصق، صحّح التفاصيل، انشر' },
        goal: {
          en: 'Paste it into the Activity Hub, fix the auto-detected details and publish.',
          ar: 'الصقها في منصة الأنشطة، وصحّح التفاصيل المكتشفة تلقائياً، ثم انشر.'
        },
        how: [
          { en: 'In the Hub, click **Create an activity**, click inside **Paste your HTML here** and press ⌘V (or click **Paste**).', ar: 'في المنصة انقر **Create an activity**، ثم داخل **Paste your HTML here** واضغط \u200E⌘V (أو **Paste**).' },
          { en: 'Check the preview at phone size. Only a handful of lines under the code? Only part was copied, so copy again.', ar: 'راجع المعاينة بحجم الهاتف. عدد أسطر قليل جداً تحت الشيفرة؟ نُسخ جزء فقط، فانسخ مجدداً.' },
          { en: 'Fix the AUTO-DETECTED fields: activity type, every grade it suits, a one-sentence description, tags, and **Shown as**.', ar: 'صحّح الحقول AUTO-DETECTED: نوع النشاط، وكل الصفوف المناسبة، ووصفاً من جملة واحدة، والوسوم، و**Shown as**.' },
          { en: 'Click **Publish & get link**.', ar: 'انقر **Publish & get link**.' }
        ],
        imgs: ['img/h_03_pasted.jpg', 'img/h_08_fixed.jpg', 'img/h_09_publish.jpg']
      },
      {
        id: 'phone',
        anchor: '#share',
        title: { en: 'Play it on your phone', ar: 'العبها على هاتفك' },
        goal: {
          en: 'Scan your QR code with your phone and play it to the end.',
          ar: 'امسح رمز QR بهاتفك والعب حتى النهاية.'
        },
        how: [
          { en: 'In "Your activity is live": **Show QR code full screen**, **Copy** the link, or **Share to Google Classroom**.', ar: 'في نافذة «Your activity is live»: **Show QR code full screen** أو **Copy** للرابط أو **Share to Google Classroom**.' },
          { en: 'Scan it and play to the end. Test on the school Wi-Fi, the way students will.', ar: 'امسحه والعب حتى النهاية. جرّبه على شبكة المدرسة كما سيفعل الطلاب.' },
          { en: 'Scores show on screen but aren\'t sent to you. Use a screenshot or a Google Form if you need evidence.', ar: 'النتيجة تظهر على الشاشة لكنها لا تصلك. استخدم لقطة شاشة أو Google Form إن احتجت دليلاً.' }
        ],
        imgs: ['img/h_10_live.jpg', 'img/h_11_toolbar.jpg']
      },
      {
        id: 'remix',
        anchor: '#library',
        title: { en: 'Remix a colleague\'s activity', ar: 'أعد مزج نشاط لزميل' },
        goal: {
          en: 'Find a colleague\'s activity in the library and remix it for your class.',
          ar: 'ابحث عن نشاط لزميل في المكتبة وأعد مزجه ليناسب صفّك.'
        },
        how: [
          { en: 'In the Library, search by topic, title, tag or teacher, or filter by grade.', ar: 'في المكتبة ابحث بالموضوع أو العنوان أو الوسم أو اسم المعلم، أو صفِّ النتائج حسب الصف الدراسي.' },
          { en: 'Click the **Remix** icon on a card, or **Remix (make my own copy)** in the **…** menu.', ar: 'انقر أيقونة **Remix** على البطاقة، أو **Remix (make my own copy)** من قائمة **…**.' },
          { en: 'Change the code or details, then publish your own copy. The original stays as it is.', ar: 'عدّل الشيفرة أو التفاصيل، ثم انشر نسختك. يبقى الأصل كما هو.' }
        ],
        imgs: ['img/h_13_cards.jpg', 'img/h_14_remix.jpg']
      }
    ],
    coop: {
      en: 'Trade QR codes with your table and play each other\'s games. Leave one kind comment and one "even better if".',
      ar: 'تبادل رموز QR مع طاولتك والعبوا ألعاب بعضكم. اترك تعليقاً لطيفاً واحداً واقتراحاً واحداً للتحسين.'
    },
    quiz: [
      {
        q: { en: 'Which phrase in your prompt gets you one file the Activity Hub can use?', ar: 'أي عبارة في طلبك تمنحك ملفاً واحداً تستطيع منصة الأنشطة استخدامه؟' },
        options: [
          { en: '"Make it go viral"', ar: '«اجعلها تنتشر بسرعة»' },
          { en: '"a single self-contained HTML file"', ar: '«a single self-contained HTML file»' },
          { en: '"Use lots of code"', ar: '«استخدم الكثير من الشيفرة»' },
          { en: '"Please and thank you"', ar: '«من فضلك وشكراً»' }
        ],
        answer: 1,
        why: { en: 'It puts everything into one file, which is exactly what the Hub needs.', ar: 'تضع كل شيء في ملف واحد، وهذا بالضبط ما تحتاجه المنصة.' }
      },
      {
        q: { en: 'You paste into the Hub and it says "12 lines · 1 KB". What happened?', ar: 'ألصقت في المنصة فظهر «\u200E12 lines · 1 KB». ماذا حدث؟' },
        options: [
          { en: 'I built a very efficient game', ar: 'صنعت لعبة فائقة الكفاءة' },
          { en: 'Only part of the code was copied, so copy it again (try Option B)', ar: 'نُسخ جزء من الشيفرة فقط، فأنسخها مجدداً (أجرّب الخيار B)' },
          { en: 'The Hub is broken', ar: 'المنصة معطّلة' },
          { en: 'Gemini is on a lunch break', ar: 'Gemini في استراحة الغداء' }
        ],
        answer: 1,
        why: { en: 'A real activity is usually hundreds of lines. Option B (select all in Code view) works every time.', ar: 'النشاط الحقيقي عادةً مئات الأسطر. الخيار B (تحديد الكل في عرض Code) ينجح دائماً.' }
      },
      {
        q: { en: 'A student finishes your game with 9/10. Where does that score go?', ar: 'أنهى طالب لعبتك بنتيجة 9 من 10. أين تذهب النتيجة؟' },
        options: [
          { en: 'Straight into my gradebook', ar: 'إلى سجل الدرجات مباشرة' },
          { en: 'Nowhere. It only shows on screen, so I use a screenshot or a Google Form', ar: 'لا مكان؛ تظهر على الشاشة فقط، لذا أستخدم لقطة شاشة أو Google Form' },
          { en: 'To an Activity Hub leaderboard', ar: 'إلى لوحة صدارة في المنصة' },
          { en: 'To Leo', ar: 'إلى ليو' }
        ],
        answer: 1,
        why: { en: 'The game shows a score but doesn\'t send results anywhere. Plan how you\'ll collect evidence if you need it.', ar: 'اللعبة تعرض النتيجة لكنها لا ترسلها. خطّط لكيفية جمع الأدلة إن احتجتها.' }
      }
    ],
    badge: {
      name: { en: 'Code Cub', ar: 'شبل البرمجة' },
      icon: 'code',
      flavor: { en: 'Built and published a game without writing a line of code.', ar: 'صنعت لعبة ونشرتها من دون كتابة سطر برمجي.' }
    },
    done: {
      en: 'You\'re officially a coder. Please don\'t ask me to fix the Wi-Fi.',
      ar: 'أصبحت مبرمجاً رسمياً. رجاءً لا تطلب مني إصلاح الواي فاي.'
    }
  },

  /* ================= STATION 6 · DATA ANONYMIZER ================= */
  {
    id: 'vault',
    station: 6,
    theme: 'vault',
    color: '#3E5C8A',
    dir: '',
    guide: 'https://aisa-ai-web.github.io/data-anonymizer/',
    guideLabel: { en: 'Open the Student Data Anonymizer', ar: 'افتح أداة إخفاء هوية بيانات الطلاب' },
    room: { en: 'The Data Vault', ar: 'خزنة البيانات' },
    title: { en: 'Use AI with Student Data, Safely', ar: 'استخدم الذكاء الاصطناعي مع بيانات الطلاب… بأمان' },
    tagline: {
      en: 'Let AI analyse your data without ever meeting your students.',
      ar: 'دع الذكاء الاصطناعي يحلل بياناتك من دون أن يتعرف على طلابك أبداً.'
    },
    time: { en: '~15 min', ar: 'نحو 15 دقيقة' },
    tools: { en: 'Student Data Anonymizer · Gemini', ar: 'أداة إخفاء هوية بيانات الطلاب · Gemini' },
    links: [
      { label: { en: 'Student Data Anonymizer', ar: 'أداة إخفاء هوية بيانات الطلاب' }, url: 'https://aisa-ai-web.github.io/data-anonymizer/' },
      { label: { en: 'Gemini', ar: 'Gemini' }, url: 'https://gemini.google.com/app' }
    ],
    briefing: [
      {
        en: 'Psst. Welcome to the Data Vault. Every station today says "never paste student names into AI". Here\'s how you use AI with student data anyway, safely.',
        ar: 'بسس… أهلاً بك في خزنة البيانات. كل المحطات اليوم تقول «لا تلصق أسماء الطلاب في الذكاء الاصطناعي». وهنا تتعلم كيف تستخدمه مع بيانات الطلاب رغم ذلك… بأمان.'
      },
      {
        en: 'The **Student Data Anonymizer** swaps names and IDs for codes like STU-004, removes what the AI doesn\'t need, then puts the real names back into the AI\'s answer.',
        ar: '**أداة إخفاء هوية بيانات الطلاب** تستبدل الأسماء والأرقام برموز مثل STU-004، وتحذف ما لا يحتاجه الذكاء الاصطناعي، ثم تعيد الأسماء الحقيقية إلى إجابته.'
      },
      {
        en: 'Everything happens inside your browser. Nothing is uploaded. Not even to me, and I\'m extremely trustworthy. I\'m a lion.',
        ar: 'كل شيء يحدث داخل متصفحك. لا يُرفع أي شيء… ولا حتى إليّ، مع أنني جدير بالثقة تماماً. أنا أسد.'
      }
    ],
    kit: [
      { en: 'The tool has its own **Watch the video tutorial** and **Read the user guide (PDF)** buttons. Use them if you get stuck.', ar: 'للأداة زرّان خاصان: **Watch the video tutorial** و**Read the user guide (PDF)**. استخدمهما إن احتجت.' },
      { en: 'Practise with made-up data today: **Try it with a made-up class list**. No real students needed.', ar: 'تدرّب اليوم ببيانات وهمية: **Try it with a made-up class list**. لا حاجة إلى بيانات طلاب حقيقية.' },
      { en: 'Open Gemini (or another school-approved AI tool) in a second tab.', ar: 'افتح Gemini (أو أداة ذكاء اصطناعي معتمدة من المدرسة) في تبويب ثانٍ.' }
    ],
    missions: [
      {
        id: 'practice',
        title: { en: 'Load the practice class', ar: 'حمّل الصف التجريبي' },
        goal: {
          en: 'Open the anonymizer and click Try it with a made-up class list.',
          ar: 'افتح الأداة وانقر Try it with a made-up class list.'
        },
        how: [
          { en: 'Open the Student Data Anonymizer. New here? Start with **Watch the video tutorial**.', ar: 'افتح أداة إخفاء الهوية. جديد عليها؟ ابدأ بـ**Watch the video tutorial**.' },
          { en: 'Click **Try it with a made-up class list** to practise on fictional students.', ar: 'انقر **Try it with a made-up class list** للتدرب على طلاب وهميين.' },
          { en: 'With real data later, drop a CSV or Excel (.xlsx) file onto **Drop a spreadsheet here, or click to choose one**.', ar: 'لاحقاً مع البيانات الحقيقية، أسقط ملف CSV أو Excel (.xlsx) في **Drop a spreadsheet here, or click to choose one**.' }
        ]
      },
      {
        id: 'columns',
        title: { en: 'Decide what happens to each column', ar: 'قرّر مصير كل عمود' },
        goal: {
          en: 'Choose what to do with each column. The suggestions are only a starting point.',
          ar: 'اختر ما تفعله بكل عمود. الاقتراحات مجرد نقطة بداية.'
        },
        how: [
          { en: 'Read **What the tool thinks** for each column, then choose **What to do**.', ar: 'اقرأ **What the tool thinks** لكل عمود، ثم اختر **What to do**.' },
          { en: 'Names and student IDs: **Replace with codes (reversible)**. They become codes like STU-004.', ar: 'الأسماء وأرقام الطلاب: **Replace with codes (reversible)**، فتصبح رموزاً مثل STU-004.' },
          { en: 'Emails, phone numbers, Emirates IDs, medical or SEN details: **Remove column**.', ar: 'البريد الإلكتروني والهواتف وأرقام الهوية الإماراتية والتفاصيل الطبية أو الاحتياجات الخاصة: **Remove column**.' },
          { en: 'Dates of birth: **Keep year only**.', ar: 'تواريخ الميلاد: **Keep year only**.' }
        ]
      },
      {
        id: 'download',
        title: { en: 'Check, then download two files', ar: 'راجع، ثم نزّل ملفين' },
        goal: {
          en: 'Complete the checklist, then download the key file and the anonymized file.',
          ar: 'أكمل قائمة التحقق، ثم نزّل ملف المفتاح والملف المُخفى الهوية.'
        },
        how: [
          { en: 'Read the warnings, e.g. **Some students could still be singled out** by a combination like gender + nationality + section.', ar: 'اقرأ التحذيرات، مثل **Some students could still be singled out** بسبب تركيبة كالجنس والجنسية والشعبة.' },
          { en: 'Confirm each point under **Before you share anything, confirm each point**.', ar: 'أكّد كل بند في **Before you share anything, confirm each point**.' },
          { en: 'Under **Keep private**, type a passphrase (at least 8 characters, twice) first, then click **Download key file**. Never upload the key to an AI tool.', ar: 'تحت **Keep private** اكتب عبارة مرور (8 أحرف على الأقل، مرتين) أولاً، ثم انقر **Download key file**. لا ترفع المفتاح أبداً إلى أداة ذكاء اصطناعي.' },
          { en: 'Click **Download anonymized file** (CSV works with every AI tool). This is the ONLY file that goes to the AI.', ar: 'انقر **Download anonymized file** (CSV يعمل مع كل الأدوات). هذا هو الملف الوحيد الذي يذهب إلى الذكاء الاصطناعي.' }
        ]
      },
      {
        id: 'ask',
        title: { en: 'Ask the AI a real question', ar: 'اطرح على الذكاء الاصطناعي سؤالاً حقيقياً' },
        goal: {
          en: 'Upload only the anonymized file to Gemini, paste the instructions, and ask a question.',
          ar: 'ارفع الملف المُخفى الهوية فقط إلى Gemini، والصق التعليمات، واطرح سؤالاً.'
        },
        how: [
          { en: 'Click **Copy instructions** and paste them into Gemini with your file. They tell the AI to keep the codes intact.', ar: 'انقر **Copy instructions** والصقها في Gemini مع ملفك؛ فهي تطلب من الذكاء الاصطناعي الحفاظ على الرموز كما هي.' },
          { en: 'Ask something useful, e.g. "Which students scored below 60%, and which topics should I reteach?"', ar: 'اسأل شيئاً مفيداً، مثل: «أيّ الطلاب حصلوا على أقل من 60%، وما الموضوعات التي يجب أن أعيد تدريسها؟»' },
          { en: 'Download or copy the AI\'s answer.', ar: 'نزّل إجابة الذكاء الاصطناعي أو انسخها.' }
        ]
      },
      {
        id: 'reidentify',
        title: { en: 'Bring the names back', ar: 'أعِد الأسماء' },
        goal: {
          en: 'Re-identify the AI\'s results with your key file.',
          ar: 'أعد ربط نتائج الذكاء الاصطناعي بالأسماء باستخدام ملف المفتاح.'
        },
        how: [
          { en: 'Go to **Re-identify results** and load your key file (and passphrase).', ar: 'انتقل إلى **Re-identify results** وحمّل ملف المفتاح (وعبارة المرور).' },
          { en: 'Drop in the AI\'s output file, or paste its text.', ar: 'أسقط ملف إجابة الذكاء الاصطناعي، أو الصق نصها.' },
          { en: 'Every code turns back into a real name. Unknown codes are flagged, because AI tools sometimes change or invent codes.', ar: 'يعود كل رمز إلى اسم حقيقي. وتُعلَّم الرموز غير المعروفة، لأن أدوات الذكاء الاصطناعي قد تغيّر الرموز أو تخترعها أحياناً.' }
        ]
      }
    ],
    coop: {
      en: 'Explain to someone at your table why the key file never goes to the AI. If they can explain it back to you, you both win.',
      ar: 'اشرح لزميل على طاولتك لماذا لا يذهب ملف المفتاح أبداً إلى الذكاء الاصطناعي. إن استطاع أن يشرحه لك بدوره، فقد فزتما معاً.'
    },
    quiz: [
      {
        q: { en: 'Which file do you upload to the AI tool?', ar: 'أي ملف ترفعه إلى أداة الذكاء الاصطناعي؟' },
        options: [
          { en: 'The key file', ar: 'ملف المفتاح' },
          { en: 'Both, just to be safe', ar: 'الاثنين، للاحتياط' },
          { en: 'Only the anonymized file', ar: 'الملف المُخفى الهوية فقط' },
          { en: 'The original spreadsheet, but renamed', ar: 'الجدول الأصلي بعد تغيير اسمه' }
        ],
        answer: 2,
        why: { en: 'The key links codes to real students. It stays with you and never goes to an AI tool.', ar: 'المفتاح يربط الرموز بالطلاب الحقيقيين؛ يبقى معك ولا يذهب أبداً إلى أداة ذكاء اصطناعي.' }
      },
      {
        q: { en: 'Where does the anonymizer send your spreadsheet?', ar: 'إلى أين ترسل الأداة جدول بياناتك؟' },
        options: [
          { en: 'To a secure AISA server', ar: 'إلى خادم آمن في AISA' },
          { en: 'Nowhere. Everything happens inside my browser', ar: 'لا مكان؛ كل شيء يحدث داخل متصفحي' },
          { en: 'To Google Drive', ar: 'إلى Google Drive' },
          { en: 'To Leo\'s inbox', ar: 'إلى بريد ليو' }
        ],
        answer: 1,
        why: { en: 'Files are processed locally. Nothing is uploaded, and nothing is kept after you close the tab except the files you download.', ar: 'تُعالج الملفات محلياً. لا يُرفع شيء، ولا يُحفظ شيء بعد إغلاق التبويب سوى الملفات التي تنزّلها.' }
      },
      {
        q: { en: 'The AI says "STU-004 needs support with fractions." How do you find out who that is?', ar: 'يقول الذكاء الاصطناعي: «STU-004 يحتاج دعماً في الكسور». كيف تعرف من هو؟' },
        options: [
          { en: 'Ask the AI who STU-004 is', ar: 'أسأل الذكاء الاصطناعي من هو STU-004' },
          { en: 'Guess from the class list', ar: 'أخمّن من قائمة الصف' },
          { en: 'Re-identify the results in the anonymizer with my key file', ar: 'أعيد ربط النتائج بالأسماء في الأداة باستخدام ملف المفتاح' },
          { en: 'Email the class: "Who is STU-004?"', ar: 'أراسل الصف: «من هو STU-004؟»' }
        ],
        answer: 2,
        why: { en: 'The AI never knew who the students were. Only your key can turn codes back into names. That\'s the whole point.', ar: 'الذكاء الاصطناعي لم يعرف الطلاب قط، ومفتاحك وحده يعيد الرموز إلى أسماء. وهذا هو المقصود تماماً.' }
      },
      {
        q: { en: 'True or false: once the codes are in, the data is fully anonymous and needs no more care.', ar: 'صح أم خطأ: بعد وضع الرموز تصبح البيانات مجهولة الهوية تماماً ولا تحتاج إلى عناية إضافية.' },
        options: [
          { en: 'True. Codes make it anonymous', ar: 'صح؛ الرموز تجعلها مجهولة الهوية' },
          { en: 'False. It\'s pseudonymization: whoever holds the key can re-identify students, so both files need care', ar: 'خطأ؛ إنها «إخفاء جزئي للهوية»: من يملك المفتاح يستطيع معرفة الطلاب، لذا يحتاج الملفان إلى عناية' }
        ],
        answer: 1,
        why: { en: 'Codes plus a key is pseudonymization, not full anonymization. Combinations of columns can also single students out, so read the warnings.', ar: 'الرموز مع المفتاح إخفاء جزئي للهوية وليس إخفاءً كاملاً. كما أن تركيبة بعض الأعمدة قد تكشف طالباً بعينه، فاقرأ التحذيرات.' }
      }
    ],
    badge: {
      name: { en: 'Vault Keeper', ar: 'حارس الخزنة' },
      icon: 'vault',
      flavor: { en: 'Used AI with student data and kept every name safe.', ar: 'استخدمت الذكاء الاصطناعي مع بيانات الطلاب وحافظت على كل اسم.' }
    },
    done: {
      en: 'Names safe, insights gained. The Vault is proud of you. The Vault doesn\'t say that to everyone. The Vault doesn\'t talk, actually.',
      ar: 'الأسماء في أمان، والرؤى في يدك. الخزنة فخورة بك… والخزنة لا تقول هذا لأي أحد. في الحقيقة، الخزنة لا تتكلم أصلاً.'
    }
  }
];

/* ---------------------------------------------------------------------
   META BADGES & SECRET ACHIEVEMENTS
   --------------------------------------------------------------------- */
PD.metaBadges = [
  {
    id: 'pride-player', icon: 'paw', color: '#C0392B', tier: 'meta',
    name: { en: 'Pride Player', ar: 'روح الفريق' },
    how: { en: 'Complete the co-op bonus in 3 quests.', ar: 'أكمل مكافأة التعاون في 3 مهمات.' },
    flavor: { en: 'Helped colleagues. A true member of the pride.', ar: 'ساعدت زملاءك؛ عضو أصيل في العرين.' }
  },
  {
    id: 'pride-leader', icon: 'crown', color: '#21076C', tier: 'meta',
    name: { en: 'Leader of the Pride', ar: 'قائد العرين' },
    how: { en: 'Earn every station badge.', ar: 'احصل على كل أوسمة المحطات.' },
    flavor: { en: 'Conquered every station of pD-Day 2026.', ar: 'أتممت كل محطات يوم التطوير المهني 2026.' }
  }
];

PD.secrets = [
  { id: 'coffee', icon: 'coffee', color: '#8B5A2B', name: { en: 'Caffeinated', ar: 'مُفعم بالكافيين' }, how: { en: 'Drink a coffee in the staff lounge. (You walk 50% faster for 30 seconds.)', ar: 'اشرب قهوة في غرفة المعلمين. (تزيد سرعتك 50% لمدة 30 ثانية.)' } },
  { id: 'jam', icon: 'paper', color: '#6C7A89', name: { en: 'Paper Jam Survivor', ar: 'الناجي من انحشار الورق' }, how: { en: 'Try the photocopier three times. It never works.', ar: 'جرّب آلة التصوير ثلاث مرات. لا تعمل أبداً.' } },
  { id: 'fridge', icon: 'fridge', color: '#3A9AD9', name: { en: 'Fridge Archaeologist', ar: 'عالِم آثار الثلاجة' }, how: { en: 'Open the staff fridge and live to tell the tale.', ar: 'افتح ثلاجة المعلمين واخرج سالماً.' } },
  { id: 'bestie', icon: 'heart', color: '#E0567A', name: { en: 'Leo\'s Bestie', ar: 'صديق ليو المقرّب' }, how: { en: 'Pat Leo five times.', ar: 'ربّت على ليو خمس مرات.' } },
  { id: 'explorer', icon: 'compass', color: '#2E9E6B', name: { en: 'Hall Monitor', ar: 'مراقب الممرات' }, how: { en: 'Visit every room in the school.', ar: 'زُر كل غرف المدرسة.' } },
  { id: 'bonk', icon: 'wall', color: '#B5651D', name: { en: 'Wall Inspector', ar: 'مفتش الجدران' }, how: { en: 'Walk into walls 15 times. The walls are fine, thanks for checking.', ar: 'اصطدم بالجدران 15 مرة. الجدران بخير، شكراً للاطمئنان.' } },
  { id: 'bell', icon: 'bell', color: '#D8A21B', name: { en: 'Bell Ringer', ar: 'قارع الجرس' }, how: { en: 'Ring the school bell in the lobby.', ar: 'اقرع جرس المدرسة في الردهة.' } },
  { id: 'torris', icon: 'clipboard', color: '#2B2F45', name: { en: 'Back to Work!', ar: 'هيا إلى العمل!' }, how: { en: 'Get caught lingering in the staff lounge by Dr. Torris.', ar: 'أطِل البقاء في غرفة المعلمين حتى يلاحظك د. توريس.' } }
];

/* ---------------------------------------------------------------------
   DR. TORRIS, AISA DIRECTOR
   Patrols the lobby, corridor and staff lounge, keeps everyone on task
   with a speech bubble now and then, and notices if you linger in the
   staff lounge. He never blocks the way. Set enabled: false to remove him.
   --------------------------------------------------------------------- */
PD.director = {
  enabled: true,
  name: { en: 'Dr. Torris', ar: 'د. توريس' },
  role: { en: 'Dr. Torris · AISA Director', ar: 'د. توريس · مدير AISA' },
  look: { skin: 1, hair: 'short', hairColor: '#4A4A4A', outfit: 'shirt', color: '#2B2F45', glasses: true, tie: true, clipboard: true },
  loungeSeconds: [25, 50, 80],   // time in the lounge before each of his lounge lines
  quipEverySeconds: 45,          // at most one passing remark this often
  quips: [
    { en: 'Less talky talky, more worky worky!', ar: 'سوالف أقل… شغل أكثر!' },
    { en: 'Is that a new badge I see? No? Back to work!', ar: 'هل هذا وسام جديد؟ لا؟ هيا إلى العمل!' },
    { en: 'I\'m not saying the stations miss you. But they do.', ar: 'لا أقول إن المحطات اشتاقت إليك… لكنها اشتاقت فعلاً.' },
    { en: 'Walking with purpose. I like it.', ar: 'تمشي وكأنك تعرف وجهتك تماماً… هذا ما أحبه!' },
    { en: 'Six stations, one PD day, zero excuses.', ar: 'ست محطات، يوم تطوير واحد، ولا أعذار.' },
    { en: 'Remember: AI writes the first draft. You write the final one.', ar: 'تذكّر: الذكاء الاصطناعي يكتب المسودة الأولى، وأنت تكتب النسخة النهائية.' },
    { en: 'Quick question: which station are you heading to? Excellent. Go there.', ar: 'سؤال سريع: إلى أي محطة أنت ذاهب؟ ممتاز. اذهب إليها.' }
  ],
  lounge: [
    { en: 'Ah, the staff lounge. Famous for its coffee and its suspiciously long breaks.', ar: 'آه، غرفة المعلمين… الشهيرة بقهوتها واستراحاتها الطويلة على نحو مريب.' },
    { en: 'Less talky talky, more worky worky! The stations are that way.', ar: 'سوالف أقل… شغل أكثر! المحطات من هناك.' },
    { en: 'I\'ve just introduced a two-minute lounge limit. Effective… now.', ar: 'أعلنتُ للتو حداً أقصى للبقاء هنا: دقيقتان. يسري مفعوله… الآن.' }
  ],
  thanks: { en: 'Thank you. Productivity has never looked so good.', ar: 'شكراً لك. لم تبدُ الإنتاجية بهذا الجمال من قبل.' },
  coffee: { en: 'Coffee: approved. Coffee for twenty minutes: not approved.', ar: 'القهوة: موافَق عليها. القهوة لعشرين دقيقة: غير موافَق عليها.' },
  praise: { en: 'A new badge! Now THAT is worky worky.', ar: 'وسام جديد! هذا هو الشغل الحقيقي.' },
  // once a teacher has all six badges he eases off
  doneQuips: [
    { en: 'All six badges! Leader of the Pride. Fine, you have earned some talky talky.', ar: 'الأوسمة الستة كلها! «قائد العرين» رسمياً. حسناً، تستحق قليلاً من السوالف.' },
    { en: 'Finished everything? Go and help a colleague with theirs. That is worky worky too.', ar: 'أنجزت كل شيء؟ ساعد زميلاً على إنهاء محطاته… وهذا شغل أيضاً.' }
  ],
  doneLounge: { en: 'All six badges? Then the lounge is all yours. Enjoy the coffee!', ar: 'كل الأوسمة الستة؟ إذن غرفة المعلمين لك. استمتع بالقهوة!' },
  talk: [
    { en: 'Dr. Torris, AISA Director. Yes, I walk around a lot. It\'s called leadership.', ar: 'د. توريس، مدير AISA. نعم، أتجوّل كثيراً… وهذا ما يُسمّى القيادة.' },
    { en: 'Every quest you finish is one less thing I have to remind you about.', ar: 'كل مهمة تنجزها تعني أمراً لن أضطر إلى تذكيرك به.' },
    { en: 'Have you visited the Data Vault yet? Protecting student data is not optional. Neither is having fun.', ar: 'هل زرت خزنة البيانات بعد؟ حماية بيانات الطلاب ليست اختيارية… ولا الاستمتاع أيضاً.' },
    { en: 'Less talky talky, more worky worky! …Fine, a little talky talky is good too. We\'re a community.', ar: 'سوالف أقل… شغل أكثر! حسناً، قليل من السوالف لا بأس به. نحن مجتمع واحد.' }
  ]
};

/* ---------------------------------------------------------------------
   LEO'S LINES
   --------------------------------------------------------------------- */
PD.leo = {
  intro: [
    {
      en: 'Well hello, {name}! I\'m Leo: AISA\'s mascot, morale officer, and the only staff member who\'s never late for duty. (I sleep in the lobby.)',
      ar: 'أهلاً وسهلاً يا {name}! أنا ليو: تميمة AISA، ومسؤول الروح المعنوية، والموظف الوحيد الذي لا يتأخر عن مناوبته أبداً. (لأنني أنام في الردهة.)'
    },
    {
      en: 'Welcome to pD-Day 2026! Six quests are hidden around this school. Each one teaches you an AI tool you can use in class next week.',
      ar: 'مرحباً بك في يوم التطوير المهني 2026! في أرجاء هذه المدرسة ست مهمات، وكل مهمة تعلّمك أداة ذكاء اصطناعي تستخدمها في صفّك الأسبوع القادم.'
    },
    {
      en: 'Every quest matches a real station in the PD room. When a quest says "Go to Station 3", go and sit at that table. Everyone there is on the same quest, so help each other out!',
      ar: 'كل مهمة تقابل محطة حقيقية في قاعة التطوير المهني. عندما تقول المهمة «اذهب إلى المحطة 3»، اجلس على تلك الطاولة. كل من هناك يعمل على المهمة نفسها، فتعاونوا!'
    },
    {
      en: 'Finish the missions, pass my (extremely fair) pop quiz, and earn a badge. Collect all six to become Leader of the Pride.',
      ar: 'أنجز التحديات، واجتز اختباري القصير (العادل جداً)، واحصل على وسام. اجمع الأوسمة الستة لتصبح «قائد العرين».'
    },
    {
      en: 'Move with the arrow keys or WASD, or just click where you want to go. Press E or Space to talk to people and things. Shall we?',
      ar: 'تحرّك بمفاتيح الأسهم أو WASD، أو انقر حيث تريد الذهاب. اضغط E أو مفتاح المسافة للتحدث والتفاعل. هيا بنا؟'
    }
  ],
  welcomeBack: {
    en: 'Welcome back, {name}! Your badges are exactly where you left them. I guarded them personally.',
    ar: 'أهلاً بعودتك يا {name}! أوسمتك في مكانها تماماً، لقد حرستها بنفسي.'
  },
  pats: [
    { en: 'Purrr… I mean, ROAR.', ar: 'خرررر… أقصد: زئير!' },
    { en: 'Head scratches accepted. Badges preferred.', ar: 'أقبل الحكّ على الرأس، لكنني أفضّل الأوسمة.' },
    { en: 'A group of lions is called a pride. A group of teachers is called a staff meeting.', ar: 'مجموعة الأسود تُسمّى «زمرة»، ومجموعة المعلمين تُسمّى «اجتماع هيئة تدريسية».' },
    { en: 'I\'m not lion: you\'re doing great.', ar: 'بصراحة الأسد: أداؤك رائع.' },
    { en: 'Ask me about my mane-care routine. Actually, don\'t. We have quests.', ar: 'اسألني عن روتين العناية بلبدتي… في الواقع لا تسأل، لدينا مهمات.' },
    { en: 'Fun fact: lions sleep up to 20 hours a day. I\'m saving mine for after PD.', ar: 'معلومة طريفة: الأسود تنام حتى 20 ساعة يومياً. أنا أوفّرها لما بعد يوم التطوير.' }
  ],
  hint: {
    en: 'Psst… Station {n}, {room}, still needs you. It\'s marked with a gold "!".',
    ar: 'بسس… المحطة {n}، {room}، ما زالت بانتظارك. ابحث عن علامة «!» الذهبية.'
  },
  allDone: {
    en: 'Every badge collected. You are officially Leader of the Pride! Open your badge case to print your certificate.',
    ar: 'جمعت كل الأوسمة! أنت الآن «قائد العرين» رسمياً. افتح خزانة الأوسمة لطباعة شهادتك.'
  },
  correct: [
    { en: 'Roar-some!', ar: 'زئيرٌ من الإعجاب!' },
    { en: 'Clawsome!', ar: 'رائع!' },
    { en: 'You\'re the mane character!', ar: 'أنت بطل القصة!' },
    { en: 'Nailed it. Clawed it, even.', ar: 'أصبت الهدف تماماً!' }
  ],
  wrong: [
    { en: 'Hmm. Even I know that one, and I\'m a lion.', ar: 'همم… حتى أنا أعرف هذه، وأنا أسد.' },
    { en: 'Nope! Have another go. Nobody\'s grading this. (I am. Silently.)', ar: 'ليست هذه! حاول مجدداً؛ لا أحد يصحّح… (أنا أصحّح، بصمت.)' },
    { en: 'Close! Well, not really. Try again.', ar: 'قريب! حسناً… ليس تماماً. حاول مرة أخرى.' }
  ],
  idle: [
    { en: 'Zzz… five more minutes…', ar: 'خخخ… خمس دقائق أخرى…' }
  ]
};

/* ---------------------------------------------------------------------
   THINGS IN THE SCHOOL (props you can interact with) and NPCs
   --------------------------------------------------------------------- */
PD.objects = {
  coffee: {
    name: { en: 'Coffee machine', ar: 'آلة القهوة' },
    lines: [
      { en: '☕ The machine whirs heroically. +10 energy. Your next three emails will be 40% friendlier.', ar: '☕ الآلة تعمل ببطولة. ‎+10 طاقة. رسائلك الثلاث القادمة ستكون ألطف بنسبة 40%.' },
      { en: 'The screen says "Descale me". It has said that since August.', ar: 'الشاشة تقول: «أزِل الترسبات». وتقولها منذ أغسطس.' },
      { en: 'Espresso? Double? Triple? Leo says one is plenty before a quiz.', ar: 'إسبريسو؟ مزدوج؟ ثلاثي؟ ليو يقول: كوب واحد يكفي قبل الاختبار.' }
    ]
  },
  copier: {
    name: { en: 'Photocopier', ar: 'آلة التصوير' },
    lines: [
      { en: 'PAPER JAM IN TRAY 2.', ar: 'انحشار ورق في الدرج 2.' },
      { en: 'PAPER JAM IN TRAY 2. (Nobody has ever found Tray 2.)', ar: 'انحشار ورق في الدرج 2. (لم يعثر أحد على الدرج 2 قط.)' },
      { en: 'It prints one page: a lesson plan from 2019. Then it jams again.', ar: 'طبعت صفحة واحدة: خطة درس من عام 2019. ثم انحشرت مجدداً.' }
    ]
  },
  fridge: {
    name: { en: 'Staff fridge', ar: 'ثلاجة المعلمين' },
    lines: [
      { en: 'A yogurt labelled "DO NOT TOUCH (Aug)". It has developed its own learning objectives.', ar: 'علبة لبن مكتوب عليها «لا تلمس (أغسطس)». يبدو أنها طوّرت أهدافها التعليمية الخاصة.' },
      { en: 'Someone\'s lunch is labelled "LEO". Leo says it isn\'t his. Leo is chewing.', ar: 'غداء مكتوب عليه «ليو». ليو يقول إنه ليس له… وليو يمضغ.' },
      { en: 'Eleven bottles of water and one lonely lemon.', ar: 'إحدى عشرة قارورة ماء وليمونة وحيدة.' }
    ]
  },
  vending: {
    name: { en: 'Vending machine', ar: 'آلة البيع' },
    lines: [
      { en: 'Sold out of everything except raisins. It\'s always raisins.', ar: 'نفدت كل المنتجات ما عدا الزبيب. دائماً الزبيب.' },
      { en: 'You press B4. The snack hangs on the edge. It will hang there forever.', ar: 'تضغط B4. الوجبة الخفيفة تتعلق على الحافة… وستبقى معلقة إلى الأبد.' }
    ]
  },
  cooler: {
    name: { en: 'Water cooler', ar: 'مبرّد الماء' },
    lines: [
      { en: 'Glug glug. Hydration +1. Gossip +3.', ar: 'قُرقُر. ترطيب ‎+1. أحاديث جانبية ‎+3.' },
      { en: 'Stay hydrated. It\'s Abu Dhabi.', ar: 'اشرب الماء باستمرار. نحن في أبوظبي.' }
    ]
  },
  bell: {
    name: { en: 'School bell', ar: 'جرس المدرسة' },
    lines: [
      { en: 'DRRRRING! Somewhere, 400 students just stood up. Quick, act natural.', ar: 'ررررن! في مكان ما وقف 400 طالب للتو. بسرعة، تصرّف بشكل طبيعي.' }
    ]
  },
  lostfound: {
    name: { en: 'Lost & found', ar: 'المفقودات' },
    lines: [
      { en: 'One left shoe, eleven water bottles and a whiteboard marker that actually works. (Legendary loot!)', ar: 'فردة حذاء يسرى، وإحدى عشرة قارورة ماء، وقلم سبورة يعمل فعلاً. (غنيمة أسطورية!)' },
      { en: 'A lanyard, a single AirPod and somebody\'s good mood from Monday morning.', ar: 'شريط بطاقة، وسماعة AirPod واحدة، ومزاج أحدهم الجيد من صباح الاثنين.' }
    ]
  },
  exit: {
    name: { en: 'Front doors', ar: 'الأبواب الأمامية' },
    lines: [
      { en: 'The exit. Tempting, isn\'t it? Leo is watching.', ar: 'المخرج. مغرٍ، أليس كذلك؟ ليو يراقبك.' },
      { en: 'It\'s 42°C outside. The quests are air-conditioned.', ar: 'الحرارة في الخارج 42 درجة. المهمات مكيّفة.' }
    ]
  },
  plant: {
    name: { en: 'Plant', ar: 'نبتة' },
    lines: [
      { en: 'A plant. It\'s thriving, unlike the one in your classroom.', ar: 'نبتة مزدهرة… على عكس تلك التي في صفّك.' }
    ]
  },
  board: {
    name: { en: 'Quest board', ar: 'لوحة المهمات' }
  },
  trophy: {
    name: { en: 'Trophy case', ar: 'خزانة الأوسمة' }
  },
  whiteboard: {
    name: { en: 'Whiteboard', ar: 'السبورة' },
    lines: [
      { en: 'Every marker is dry. Classic.', ar: 'كل الأقلام جافة. كالعادة.' },
      { en: 'Someone wrote "DO NOT ERASE" in 2023. Nobody dares.', ar: 'كتب أحدهم «لا تمسح» عام 2023. ولم يجرؤ أحد منذ ذلك الحين.' }
    ]
  },
  popcorn: {
    name: { en: 'Popcorn machine', ar: 'آلة الفشار' },
    lines: [
      { en: 'Pop pop pop. Leo eats it all before you can blink.', ar: 'طق طق طق. ليو يأكله كله قبل أن ترمش.' }
    ]
  },
  arcade: {
    name: { en: 'Arcade cabinet', ar: 'جهاز ألعاب' },
    lines: [
      { en: 'HIGH SCORE: LEO ··· 999,999. Nobody believes it either.', ar: 'أعلى نتيجة: ليو ··· 999,999. لا أحد يصدق ذلك أيضاً.' }
    ]
  },
  books: {
    name: { en: 'Bookshelf', ar: 'رف الكتب' },
    lines: [
      { en: 'You find "Differentiation for Lions, Grade 5 edition". Leo wrote it. Leo cannot read.', ar: 'تجد كتاب «التمايز للأسود، نسخة الصف الخامس». ليو كتبه… وليو لا يقرأ.' }
    ]
  }
};

PD.npcs = [
  {
    id: 'regular', zone: 'lounge', look: { skin: 2, hair: 'bun', hairColor: '#3B2417', outfit: 'shirt', color: '#E5733A', glasses: true },
    role: { en: 'The coffee-line regular', ar: 'زبون آلة القهوة الدائم' },
    lines: [
      { en: 'I\'ve been at this coffee machine since 7:15. I\'m not waiting for coffee anymore. I live here now.', ar: 'أنا عند آلة القهوة منذ السابعة والربع. لم أعد أنتظر القهوة… أنا أسكن هنا الآن.' },
      { en: 'Tip: the Station 4 video sounds way better with headphones. Ask me how I know.', ar: 'نصيحة: فيديو المحطة 4 أفضل بكثير مع السماعات. اسألني كيف عرفت.' }
    ]
  },
  {
    id: 'it', zone: 'corridor', look: { skin: 4, hair: 'short', hairColor: '#1E1E1E', outfit: 'shirt', color: '#2F6FD6', glasses: false },
    role: { en: 'Someone from IT', ar: 'شخص من قسم تقنية المعلومات' },
    lines: [
      { en: 'Have you tried turning it off and on again? Not you. The laptop.', ar: 'هل جربت إطفاءه وتشغيله مجدداً؟ ليس أنت… الحاسوب.' },
      { en: 'No Gemini tab in Classroom? Tell the AI & Innovation team so your account can be checked.', ar: 'لا يظهر تبويب Gemini في Classroom؟ أخبر فريق الذكاء الاصطناعي والابتكار ليتحققوا من حسابك.' }
    ]
  },
  {
    id: 'arabic', zone: 'lobby', look: { skin: 1, hair: 'hijab', hairColor: '#21076C', outfit: 'robe', color: '#2B2B3A', glasses: false },
    role: { en: 'An Arabic teacher', ar: 'معلّمة اللغة العربية' },
    lines: [
      { en: 'Did you know you can switch this whole game into Arabic? Try the globe button at the top!', ar: 'هل تعلم أنك تستطيع تحويل اللعبة كلها إلى العربية أو الإنجليزية؟ جرّب زر الكرة الأرضية في الأعلى!' },
      { en: 'At the Hook Arena, try Think-Pair-Share as a custom engagement type. It works beautifully in Arabic and Islamic Studies.', ar: 'في ساحة التشويق جرّب «فكّر-زاوج-شارك» كنوع تفاعل مخصّص؛ فهو ينجح نجاحاً رائعاً في دروس اللغة العربية والتربية الإسلامية.' }
    ]
  },
  {
    id: 'science', zone: 'corridor2', look: { skin: 3, hair: 'ghutra', hairColor: '#FFFFFF', outfit: 'robe', color: '#F4F4F2', glasses: false },
    role: { en: 'A Grade 8 science teacher', ar: 'معلّم علوم الصف الثامن' },
    lines: [
      { en: 'Gemini gave my class 6 oxygen and 4 hydrogen to make water. I gave Gemini a strongly worded exit ticket.', ar: 'أعطى Gemini طلابي 6 ذرات أكسجين و4 هيدروجين لصنع الماء. فأعطيته بطاقة خروج شديدة اللهجة.' },
      { en: 'Always read it before your students do. AI is a first draft, not a final answer.', ar: 'اقرأ دائماً قبل أن يقرأ طلابك. الذكاء الاصطناعي مسودة أولى، لا إجابة نهائية.' }
    ]
  }
];

/* ---------------------------------------------------------------------
   INTERFACE TEXT
   --------------------------------------------------------------------- */
PD.ui = {
  start: { en: 'Start the quest', ar: 'ابدأ الرحلة' },
  continue: { en: 'Continue', ar: 'متابعة' },
  newGame: { en: 'Start over', ar: 'ابدأ من جديد' },
  confirmReset: { en: 'Start over? This clears your badges and progress on this laptop.', ar: 'البدء من جديد؟ سيمحو هذا أوسمتك وتقدّمك على هذا الحاسوب.' },
  pressStart: { en: 'A teacher-powered AI adventure', ar: 'مغامرة ذكاء اصطناعي يقودها المعلمون' },
  langLabel: { en: 'Language', ar: 'اللغة' },
  sound: { en: 'Sound', ar: 'الصوت' },
  on: { en: 'On', ar: 'تشغيل' },
  off: { en: 'Off', ar: 'إيقاف' },
  setupTitle: { en: 'Create your teacher', ar: 'أنشئ شخصيتك' },
  nameLabel: { en: 'What should Leo call you?', ar: 'بماذا يناديك ليو؟' },
  namePlaceholder: { en: 'First name', ar: 'الاسم الأول' },
  nameHint: { en: 'First name only. Leo has been to the Data Vault.', ar: 'الاسم الأول فقط؛ فليو زار خزنة البيانات.' },
  skin: { en: 'Skin', ar: 'البشرة' },
  hair: { en: 'Hair', ar: 'الشعر' },
  hairColor: { en: 'Hair colour', ar: 'لون الشعر' },
  outfit: { en: 'Outfit', ar: 'الملابس' },
  colour: { en: 'Colour', ar: 'اللون' },
  glasses: { en: 'Glasses', ar: 'نظارة' },
  hairStyles: {
    short: { en: 'Short', ar: 'قصير' }, long: { en: 'Long', ar: 'طويل' }, bun: { en: 'Bun', ar: 'كعكة' },
    curly: { en: 'Curly', ar: 'مجعّد' }, hijab: { en: 'Hijab', ar: 'حجاب' }, ghutra: { en: 'Ghutra', ar: 'غترة' },
    bald: { en: 'Bald', ar: 'أصلع' }
  },
  outfits: { shirt: { en: 'Smart casual', ar: 'ملابس عملية' }, robe: { en: 'Abaya / Kandura', ar: 'عباءة / كندورة' } },
  yes: { en: 'Yes', ar: 'نعم' },
  no: { en: 'No', ar: 'لا' },
  letsGo: { en: 'Let\'s go!', ar: 'هيا بنا!' },
  leo: { en: 'Leo', ar: 'ليو' },
  next: { en: 'Next', ar: 'التالي' },
  skip: { en: 'Skip', ar: 'تخطٍّ' },
  close: { en: 'Close', ar: 'إغلاق' },
  quests: { en: 'Quests', ar: 'المهمات' },
  badges: { en: 'Badges', ar: 'الأوسمة' },
  map: { en: 'Map', ar: 'الخريطة' },
  help: { en: 'Help', ar: 'مساعدة' },
  station: { en: 'Station', ar: 'المحطة' },
  talk: { en: 'Talk', ar: 'تحدّث' },
  interact: { en: 'Look', ar: 'تفاعل' },
  openQuest: { en: 'Open quest', ar: 'افتح المهمة' },
  pat: { en: 'Pat Leo', ar: 'ربّت على ليو' },
  pressKey: { en: 'E', ar: 'E' },
  tabBriefing: { en: 'Briefing', ar: 'الإحاطة' },
  tabMissions: { en: 'Missions', ar: 'التحديات' },
  tabQuiz: { en: 'Leo\'s quiz', ar: 'اختبار ليو' },
  goTo: { en: 'Go to Station {n}', ar: 'اذهب إلى المحطة {n}' },
  goToText: {
    en: 'Find the Station {n} table in the PD room and sit with whoever\'s there. They\'re on this quest too, so team up. Stuck? Ask your table before you ask the internet.',
    ar: 'ابحث عن طاولة المحطة {n} في قاعة التطوير المهني واجلس مع من هناك؛ إنهم في المهمة نفسها، فتعاونوا. علقت؟ اسأل طاولتك قبل أن تسأل الإنترنت.'
  },
  openGuide: { en: 'Open the Station {n} guide', ar: 'افتح دليل المحطة {n}' },
  guideNote: { en: 'Full step-by-step guide with screenshots (English).', ar: 'الدليل الكامل خطوة بخطوة مع الصور (باللغة الإنجليزية).' },
  usefulLinks: { en: 'Jump straight in', ar: 'روابط مباشرة' },
  kit: { en: 'Before you start', ar: 'قبل أن تبدأ' },
  privacyTip: {
    en: 'Need to analyse real student data with AI? That\'s what the Data Vault (Station 6) is for.',
    ar: 'تحتاج إلى تحليل بيانات طلاب حقيقية بالذكاء الاصطناعي؟ هذا دور خزنة البيانات (المحطة 6).'
  },
  copy: { en: 'Copy', ar: 'نسخ' },
  copied: { en: 'Copied!', ar: 'تم النسخ!' },
  startMissions: { en: 'I\'m at the station: show me the missions', ar: 'أنا في المحطة: أرني التحديات' },
  missionsIntro: { en: 'Tick each mission off as you finish it at your station.', ar: 'ضع علامة على كل تحدٍّ عند إنجازه في محطتك.' },
  showHow: { en: 'Show me how', ar: 'أرني الطريقة' },
  hideHow: { en: 'Hide steps', ar: 'إخفاء الخطوات' },
  inGuide: { en: 'This step in the full guide', ar: 'هذه الخطوة في الدليل الكامل' },
  markDone: { en: 'Done', ar: 'أنجزته' },
  coop: { en: 'Co-op bonus', ar: 'مكافأة التعاون' },
  coopDone: { en: 'We did it', ar: 'أنجزناها' },
  coopNote: { en: 'Optional. Three co-op bonuses earn the Pride Player badge.', ar: 'اختياري. ثلاث مكافآت تعاون تمنحك وسام «روح الفريق».' },
  toQuiz: { en: 'Ready for Leo\'s quiz', ar: 'جاهز لاختبار ليو' },
  quizIntro: { en: 'A few quick questions. Wrong answers are free; Leo just makes a face.', ar: 'بضعة أسئلة سريعة. الإجابات الخاطئة مجانية؛ ليو فقط يعبس قليلاً.' },
  question: { en: 'Question {i} of {n}', ar: 'السؤال {i} من {n}' },
  tryAgain: { en: 'Try again', ar: 'حاول مجدداً' },
  nextQuestion: { en: 'Next question', ar: 'السؤال التالي' },
  quizPassed: { en: 'Quiz complete!', ar: 'أكملت الاختبار!' },
  claim: { en: 'Claim your badge', ar: 'احصل على وسامك' },
  needMissions: { en: 'Finish every mission to unlock the badge. You\'ve done {d} of {n}.', ar: 'أكمل كل التحديات لفتح الوسام. أنجزت {d} من {n}.' },
  needQuiz: { en: 'Pass Leo\'s quiz to unlock the badge.', ar: 'اجتز اختبار ليو لفتح الوسام.' },
  badgeEarned: { en: 'Badge earned!', ar: 'حصلت على وسام!' },
  awesome: { en: 'Roar-some!', ar: 'رائع!' },
  questComplete: { en: 'Quest complete', ar: 'المهمة مكتملة' },
  notStarted: { en: 'Not started', ar: 'لم تبدأ' },
  inProgress: { en: 'In progress', ar: 'قيد التنفيذ' },
  complete: { en: 'Complete', ar: 'مكتملة' },
  travel: { en: 'Walk me there', ar: 'خذني إلى هناك' },
  questLogTitle: { en: 'Quest log', ar: 'سجل المهمات' },
  questLogIntro: { en: 'Do them in any order. Each quest matches a station table in the PD room.', ar: 'أنجزها بأي ترتيب. كل مهمة تقابل طاولة محطة في قاعة التطوير المهني.' },
  badgeCase: { en: 'Badge case', ar: 'خزانة الأوسمة' },
  stationBadges: { en: 'Station badges', ar: 'أوسمة المحطات' },
  specialBadges: { en: 'Special badges', ar: 'أوسمة خاصة' },
  secretBadges: { en: 'Secret achievements', ar: 'إنجازات سرّية' },
  secretHidden: { en: '??? Keep exploring the school', ar: '؟؟؟ واصل استكشاف المدرسة' },
  locked: { en: 'Not earned yet', ar: 'لم تحصل عليه بعد' },
  earned: { en: 'Earned', ar: 'حصلت عليه' },
  certificate: { en: 'Print my certificate', ar: 'اطبع شهادتي' },
  certTitle: { en: 'Certificate of Achievement', ar: 'شهادة إنجاز' },
  certLine: { en: 'This certifies that', ar: 'تُمنح هذه الشهادة إلى' },
  certBody: { en: 'took part in pD-Day 2026, the AISA AI PD quest, and earned these badges:', ar: 'تقديراً للمشاركة في يوم التطوير المهني 2026، رحلة AISA في الذكاء الاصطناعي، والحصول على الأوسمة التالية:' },
  certSign: { en: 'Leo, Chief Morale Officer', ar: 'ليو، مسؤول الروح المعنوية' },
  certTeam: { en: 'AI & Innovation Team', ar: 'فريق الذكاء الاصطناعي والابتكار' },
  print: { en: 'Print / save as PDF', ar: 'طباعة / حفظ PDF' },
  achievement: { en: 'Achievement unlocked', ar: 'إنجاز جديد' },
  mapTitle: { en: 'School map', ar: 'خريطة المدرسة' },
  mapHint: { en: 'Click a room to walk there.', ar: 'انقر غرفة للذهاب إليها.' },
  you: { en: 'You', ar: 'أنت' },
  lobby: { en: 'Lobby', ar: 'الردهة' },
  lounge: { en: 'Staff lounge', ar: 'غرفة المعلمين' },
  corridor: { en: 'Corridor', ar: 'الممر' },
  helpTitle: { en: 'How to play', ar: 'طريقة اللعب' },
  helpMove: { en: 'Move', ar: 'الحركة' },
  helpMoveKeys: { en: 'Arrow keys or WASD, or click where you want to go', ar: 'مفاتيح الأسهم أو WASD، أو انقر حيث تريد الذهاب' },
  helpAct: { en: 'Talk / interact', ar: 'التحدث / التفاعل' },
  helpActKeys: { en: 'E, Space or Enter, or click on it', ar: 'E أو المسافة أو Enter، أو انقر عليه' },
  helpPanels: { en: 'Quests · Badges · Map', ar: 'المهمات · الأوسمة · الخريطة' },
  helpPanelsKeys: { en: 'Q · B · M', ar: 'Q للمهمات · B للأوسمة · M للخريطة' },
  helpClose: { en: 'Close a window', ar: 'إغلاق نافذة' },
  helpCloseKeys: { en: 'Esc', ar: 'Esc' },
  helpHow: {
    en: 'Each glowing station in the school is a quest, and each quest matches a real station table in the PD room. Read the briefing, go to that table, work through the missions with the people there, then pass Leo\'s quiz to earn the badge. Your progress saves automatically on this laptop.',
    ar: 'كل محطة مضيئة في المدرسة مهمة، وكل مهمة تقابل طاولة محطة حقيقية في قاعة التطوير المهني. اقرأ الإحاطة، واذهب إلى تلك الطاولة، وأنجز التحديات مع من هناك، ثم اجتز اختبار ليو لتحصل على الوسام. يُحفظ تقدّمك تلقائياً على هذا الحاسوب.'
  },
  allStations: { en: 'All station guides', ar: 'كل أدلة المحطات' },
  reset: { en: 'Start over', ar: 'ابدأ من جديد' },
  entering: { en: 'Now entering', ar: 'تدخل الآن' },
  roomQuest: { en: 'Find the glowing station to start the quest.', ar: 'ابحث عن المحطة المضيئة لتبدأ المهمة.' },
  badgeCount: { en: '{d}/{n} badges', ar: '{d}/{n} أوسمة' },
  footer: { en: 'AISA · AI & Innovation', ar: 'AISA · الذكاء الاصطناعي والابتكار' },
  loading: { en: 'Loading the school…', ar: 'جارٍ تحميل المدرسة…' },
  coffeeBoostTitle: { en: 'Caffeine rush!', ar: 'دفعة كافيين!' },
  coffeeBoost: { en: 'You walk 50% faster for 30 seconds.', ar: 'سرعتك تزيد 50% لمدة 30 ثانية.' },
  coffeeRefillTitle: { en: 'Refill!', ar: 'كوب إضافي!' },
  coffeeRefill: { en: 'Speed boost back to 30 seconds.', ar: 'تجدّدت دفعة السرعة لـ30 ثانية.' },
  coffeeOver: { en: 'The caffeine wore off. Back to regular teacher speed.', ar: 'انتهى مفعول الكافيين. عادت سرعتك إلى طبيعتها.' },
  boostLabel: { en: 'Speed boost', ar: 'دفعة سرعة' },
  seconds: { en: '{s}s', ar: '{s} ث' }
};
